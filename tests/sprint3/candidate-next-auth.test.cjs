const {test,mock}=require('node:test');
const assert=require('node:assert/strict');
const {pbkdf2Sync}=require('node:crypto');
const {SignJWT,jwtVerify}=require('jose');
const {loader}=require('../sprint1/helpers.cjs');
const cccd='990123456789', password='Fixture-password-2026', secret='unit-candidate-secret-at-least-thirty-two';
function fixture(t,opts={}){
 const previous=process.env.JWT_ACCESSTOKEN;process.env.JWT_ACCESSTOKEN=secret;t.after(()=>previous===undefined?delete process.env.JWT_ACCESSTOKEN:process.env.JWT_ACCESSTOKEN=previous);
 const salt='0123456789abcdef0123456789abcdef';
 const original={cccd,ho_ten:'Fixture',so_dien_thoai:'0901234567',password:salt+'$'+pbkdf2Sync(password,Buffer.from(salt,'utf8'),600000,32,'sha256').toString('hex')};
 const db={thiSinh:{findUnique:mock.fn(async()=>opts.row===undefined?original:opts.row),create:mock.fn(async({data})=>{if(opts.createError)throw opts.createError;return{cccd:data.cccd,ho_ten:data.ho_ten,so_dien_thoai:data.so_dien_thoai};})}};
 const values=new Map(),writes=[];const jar={get:k=>values.has(k)?{value:values.get(k)}:undefined,set:(k,v,o)=>{values.set(k,v);writes.push({k,o});},delete:k=>values.delete(k)};
 const limit=mock.fn(()=>{});
 const auth=loader({'server-only':{},'@/libs/prisma':{__esModule:true,default:db},'next/headers':{cookies:async()=>jar},'@/libs/api-security':{publicApiLimiter:{check:limit}}})('services/candidate-auth.service.ts');
 const action=loader({'@/services/candidate-auth.service':auth})('actions/candidate-session.action.ts').candidateSessionAction;
 return{auth,action,db,values,writes,original,limit};
}
async function token(changes={},key=secret){return new SignJWT({cccd,role:'thi_sinh',token_type:'refresh',...changes}).setProtectedHeader({alg:'HS256'}).setSubject(changes.sub||cccd).setIssuedAt().setExpirationTime(changes.exp||'1h').sign(new TextEncoder().encode(key));}
test('Next auth verifies Python-format PBKDF2 UTF8 salt, issues backend-compatible claims, returns only profile',async t=>{
 const f=fixture(t);const fetch=t.mock.method(global,'fetch',async()=>{throw Error('remote auth forbidden');});
 assert.deepEqual(await f.auth.loginCandidate({cccd,password}),{cccd,ho_ten:'Fixture',so_dien_thoai:'0901234567'});assert.equal(fetch.mock.callCount(),0);
 for(const [name,type,ttl]of [['candidateToken','access',900],['candidateRefresh','refresh',604800]]){const{payload,protectedHeader}=await jwtVerify(f.values.get(name),new TextEncoder().encode(secret));assert.equal(protectedHeader.alg,'HS256');assert.equal(payload.cccd,cccd);assert.equal(payload.sub,cccd);assert.equal(payload.role,'thi_sinh');assert.equal(payload.token_type,type);assert.equal(payload.exp-payload.iat,ttl);if(type==='refresh')assert.ok(payload.jti);const w=f.writes.find(x=>x.k===name);assert.equal(w.o.httpOnly,true);assert.equal(w.o.sameSite,'lax');assert.equal(w.o.path,'/');assert.equal(w.o.maxAge,ttl);}
});
test('wrong password, absent or password-null legacy candidate never receives a session',async t=>{for(const row of [undefined,null,{cccd,password:null}]){const f=fixture(t,{row});await assert.rejects(f.auth.loginCandidate({cccd,password:'Wrong-pass-2026'}),e=>e.status===401);assert.equal(f.writes.length,0);}});
test('new candidate persists compatible hash; duplicate old CCCD cannot be claimed by registration',async t=>{
 const f=fixture(t);const out=await f.auth.registerCandidate({cccd,password,ho_ten:' Fixture ',so_dien_thoai:'0901234567'});assert.equal(out.password,undefined);const data=f.db.thiSinh.create.mock.calls[0].arguments[0].data;const[salt,digest]=data.password.split('$');assert.match(salt,/^[a-f0-9]{32}$/);assert.equal(digest,pbkdf2Sync(password,salt,600000,32,'sha256').toString('hex'));
 const dup=fixture(t,{createError:{code:'P2002'}});await assert.rejects(dup.auth.registerCandidate({cccd,password,ho_ten:'Old',so_dien_thoai:'0901234567'}),e=>e.status===409);assert.equal(dup.writes.length,0);
});
test('invalid CCCD, admin email, short/oversize password and invalid phone reject before writes',async t=>{
 const f=fixture(t);for(const input of [{cccd:'admin@example.com',password},{cccd,password:'123'},{cccd,password:'x'.repeat(129)}])await assert.rejects(f.auth.loginCandidate(input),e=>e.status===400);
 await assert.rejects(f.auth.registerCandidate({cccd,password,ho_ten:'N',so_dien_thoai:'0901234567'}),e=>e.status===400);assert.equal(f.db.thiSinh.create.mock.callCount(),0);assert.equal(f.db.thiSinh.findUnique.mock.callCount(),0);
});
test('refresh rotates locally; invalid signature, admin/access token, expired or mismatched subject cannot refresh',async t=>{
 const f=fixture(t);const valid=await token();f.values.set('candidateRefresh',valid);assert.ok(await f.auth.refreshCandidateSession());assert.notEqual(f.values.get('candidateRefresh'),valid);
 const invalid=[await token({role:'super_admin'}),await token({token_type:'access'}),await token({},'different-key'),await token({sub:'990000000000'}),await token({exp:1})];
 for(const value of invalid){f.values.set('candidateRefresh',value);const before=f.writes.length;await assert.rejects(f.auth.refreshCandidateSession(),e=>e.status===401);assert.equal(f.writes.length,before);}
});
test('current session uses access token locally; DB outages preserve cookies and propagate failure',async t=>{
 const f=fixture(t);await f.auth.loginCandidate({cccd,password});assert.equal((await f.auth.currentCandidate()).cccd,cccd);const saved=new Map(f.values);f.db.thiSinh.findUnique.mock.mockImplementation(async()=>{throw Error('private database detail');});await assert.rejects(f.auth.currentCandidate(),/private database detail/);assert.deepEqual(f.values,saved);
});
test('server action shares auth limiter, emits no tokens/details and logout deletes both cookies',async t=>{
 const f=fixture(t);const bad=await f.action('login',{cccd,password:'wrong-password-2026'});assert.equal(bad.success,false);assert.equal(f.limit.mock.calls[0].arguments[0],'candidate-auth');assert.equal(f.limit.mock.calls[0].arguments[1],60);
 const result=await f.action('login',{cccd,password});assert.equal(result.success,true);assert.equal(JSON.stringify(result).includes('token'),false);
 f.db.thiSinh.findUnique.mock.mockImplementation(async()=>{throw Error('postgres://private/password');});const failed=await f.action('me');assert.equal(failed.success,false);assert.doesNotMatch(failed.message,/postgres|password/);assert.ok(f.values.size);
 assert.deepEqual(await f.action('logout'),{success:true,user:null});assert.equal(f.values.size,0);
});
test('configured audience is required during refresh and preserved in issued access',async t=>{
 const before=process.env.JWT_AUDIENCE;process.env.JWT_AUDIENCE='admissions-test';t.after(()=>before===undefined?delete process.env.JWT_AUDIENCE:process.env.JWT_AUDIENCE=before);const f=fixture(t);f.values.set('candidateRefresh',await token());await assert.rejects(f.auth.refreshCandidateSession(),e=>e.status===401);await f.auth.loginCandidate({cccd,password});const{payload}=await jwtVerify(f.values.get('candidateToken'),new TextEncoder().encode(secret),{audience:'admissions-test'});assert.equal(payload.aud,'admissions-test');
});
const React=require('react');const{JSDOM}=require('jsdom');
test('initial me response cannot overwrite a newer successful candidate login',async t=>{
 const dom=new JSDOM('<div id="root"></div>',{url:'https://app.test'});const restore=[];
 for(const[key,value]of Object.entries({window:dom.window,document:dom.window.document,FormData:dom.window.FormData,IS_REACT_ACT_ENVIRONMENT:true})){const old=Object.getOwnPropertyDescriptor(global,key);Object.defineProperty(global,key,{value,configurable:true,writable:true});restore.push(()=>old?Object.defineProperty(global,key,old):delete global[key]);}
 let finish;const initial=new Promise(resolve=>finish=resolve);const users=[];
 const C=loader({'@/actions/candidate-session.action':{candidateSessionAction:async action=>action==='me'?initial:{success:true,user:{cccd,ho_ten:'NEW LOGIN',so_dien_thoai:'0901234567'}}},'sonner':{toast:{error(){},success(){}}},'next/link':{__esModule:true,default:({children,...props})=>React.createElement('a',props,children)}})('components/CandidateSession.tsx').default;
 const root=require('react-dom/client').createRoot(dom.window.document.getElementById('root'));t.after(async()=>{await React.act(async()=>root.unmount());dom.window.close();restore.forEach(f=>f());});
 await React.act(async()=>root.render(React.createElement(C,{onAuthenticated:user=>users.push(user.ho_ten)})));await React.act(async()=>dom.window.document.querySelector('form').dispatchEvent(new dom.window.Event('submit',{bubbles:true,cancelable:true})));assert.match(dom.window.document.body.textContent,/NEW LOGIN/);
 await React.act(async()=>finish({success:true,user:{cccd:'990000000000',ho_ten:'OLD SESSION',so_dien_thoai:'0900000000'}}));assert.match(dom.window.document.body.textContent,/NEW LOGIN/);assert.doesNotMatch(dom.window.document.body.textContent,/OLD SESSION/);assert.deepEqual(users,['NEW LOGIN']);
});
test('missing JWT configuration is unavailable rather than bad credentials during refresh',async t=>{
 const f=fixture(t);f.values.set('candidateRefresh',await token());delete process.env.JWT_ACCESSTOKEN;await assert.rejects(f.auth.refreshCandidateSession(),e=>e.status===503);assert.equal(f.writes.length,0);
});

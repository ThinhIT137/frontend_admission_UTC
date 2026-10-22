const {test,mock}=require('node:test');
const assert=require('node:assert/strict');
const React=require('react');
const {JSDOM}=require('jsdom');
const {loader}=require('../sprint1/helpers.cjs');
const server={NextResponse:{json:(value,options)=>Response.json(value,options)}};
const security=loader({'server-only':{},'next/server':server})('libs/api-security.ts');
function environment(t,values){for(const [key,value]of Object.entries(values)){const old=process.env[key];if(value===undefined)delete process.env[key];else process.env[key]=value;t.after(()=>old===undefined?delete process.env[key]:process.env[key]=old);}}
function backend(){const jar=new Map([['accessToken','admin'],['refreshToken','refresh'],['candidateToken','candidate'],['candidateRefresh','refresh']]);return loader({'server-only':{},'next/headers':{cookies:async()=>({get:key=>jar.has(key)?{value:jar.get(key)}:undefined,set:(key,value)=>jar.set(key,value)})},'@/services/token.service':{tokenService:{verifyAccessToken:async()=>true}},'@/services/user.service':{adminService:{getCurrentUser:async()=>({vai_tro:{ten_vai_tro:'super_admin'}}),refreshAccessToken:async()=>{jar.set('accessToken','refreshed');}}}})('libs/api-services/backend.server.ts');}
test('transport uses only server config, production HTTPS and explicit loopback exception',t=>{
 environment(t,{NODE_ENV:'production',API_APPLICATION_SCORE:undefined,NEXT_PUBLIC_API_APPLICATION_SCORE:'https://ignored.test',ALLOW_LOOPBACK_BACKEND_HTTP:undefined});const b=backend();
 assert.throws(()=>b.backendUrl('score','/ho-so'),e=>e.status===503);
 for(const base of ['http://remote.test','https://user:pass@example.test','https://example.test?key=secret','https://example.test/#fragment']){process.env.API_APPLICATION_SCORE=base;assert.throws(()=>b.backendUrl('score','/ho-so'));}
 process.env.API_APPLICATION_SCORE='http://127.0.0.1:8001';assert.throws(()=>b.backendUrl('score','/ho-so'));process.env.ALLOW_LOOPBACK_BACKEND_HTTP='true';assert.equal(b.backendUrl('score','/health'),'http://127.0.0.1:8001/health');
 process.env.API_APPLICATION_SCORE='http://remote.test';assert.throws(()=>b.backendUrl('score','/health'));
 process.env.API_APPLICATION_SCORE='https://example.test';
 for(const path of ['//evil.test','https://evil.test','/../secret','/%2e%2e/secret','/%252e%252e/secret','/a%2fb','/a\\b','/a#secret','/%25252fsecret'])assert.throws(()=>b.backendUrl('score',path),path);
 assert.equal(b.backendUrl('score','/ho-so?cccd=123'),'https://example.test/ho-so?cccd=123');
});
test('all admin/candidate initial/refresh/retry fetches reject redirects and sanitize upstream secrets',async t=>{
 environment(t,{NODE_ENV:'production',API_APPLICATION_SCORE:'https://score.test'});const b=backend();
 for(const auth of ['admin','candidate']){let attempt=0;const seen=[];t.mock.method(global,'fetch',async(url,options)=>{seen.push(options);if(url.endsWith('/refresh'))return Response.json({access_token:'fresh',refresh_token:'rotated'});return ++attempt===1?Response.json({detail:'password=SECRET'},{status:401}):Response.json({ok:true});});assert.deepEqual(await b.backendRequest('score','/ho-so',{auth}),{ok:true});assert.ok(seen.length>=2);for(const options of seen){assert.equal(options.redirect,'error');assert.equal(options.cache,'no-store');}}
 t.mock.method(global,'fetch',async()=>Response.json({detail:'SQL password=SECRET token=SECRET'},{status:500}));await assert.rejects(b.backendRequest('score','/ho-so'),error=>error.status===500&&!error.message.includes('SECRET'));
});
test('origin scheme/null/malformed/crosssite checks and UTF8 stream bounds',async()=>{
 for(const headers of [{origin:'http://app.test'},{origin:'null'},{origin:'https://app.test/'},{origin:'invalid'},{'sec-fetch-site':'cross-site'}])assert.throws(()=>security.enforceSameOrigin(new Request('https://app.test/api',{headers})),e=>e.status===403);
 security.enforceSameOrigin(new Request('https://app.test/api',{headers:{origin:'https://app.test'}}));
 for(const headers of [{},{'content-length':'1'}]){const request=new Request('https://app.test/api',{method:'POST',headers,body:JSON.stringify({text:'ế'.repeat(10)})});await assert.rejects(security.readBoundedJson(request,20),e=>e.status===413);}
 await assert.rejects(security.readBoundedJson(new Request('https://app.test/api',{method:'POST',body:'{bad'})),e=>e.status===400);
 await assert.rejects(security.readBoundedJson(new Request('https://app.test/api',{method:'POST',body:new Uint8Array([255])})),e=>e.status===400);
 assert.deepEqual(await security.readBoundedJson(new Request('https://app.test/api',{method:'POST',body:'{"ok":true}'})),{ok:true});
});

test('loopback normalization requires matching actual Host, protocol and port; forwarded headers cannot authorize another origin',()=>{
 for(const host of ['127.0.0.1:3330','[::1]:3330'])security.enforceSameOrigin(new Request('http://localhost:3330/api',{headers:{host,origin:`http://${host}`}}));
 for(const headers of [
  {host:'evil.test:3330',origin:'http://evil.test:3330'},
  {host:'127.0.0.1:3331',origin:'http://127.0.0.1:3331'},
  {host:'127.0.0.1:3330',origin:'https://127.0.0.1:3330'},
  {host:'localhost:3330',origin:'http://127.0.0.1:3330'},
  {host:'127.0.0.1:3330@evil.test',origin:'http://127.0.0.1:3330'},
  {origin:'http://127.0.0.1:3330','x-forwarded-host':'127.0.0.1:3330'},
  {host:'127.0.0.1:3330',origin:'http://127.0.0.1:3330','sec-fetch-site':'cross-site'},
  {host:'127.0.0.1:3330',origin:'null'},
 ])assert.throws(()=>security.enforceSameOrigin(new Request('http://localhost:3330/api',{headers})),error=>error.status===403,JSON.stringify(headers));
 assert.throws(()=>security.enforceSameOrigin(new Request('https://app.test/api',{headers:{host:'127.0.0.1',origin:'https://127.0.0.1'}})),error=>error.status===403);
});
test('bounded route limiter resets clock and private errors do not reflect secrets',async()=>{
 let now=0;const limiter=new security.RouteRateLimiter(()=>now);limiter.check('route',2);limiter.check('route',2);assert.throws(()=>limiter.check('route',2),e=>e.status===429&&e.retryAfter===60);now=60000;limiter.check('route',2);
 for(const response of [security.privateJson({ok:true}),security.apiFailure({status:500,message:'SECRET'}),security.apiFailure(new security.ApiSecurityError(429,30))]){assert.equal(response.headers.get('cache-control'),'private, no-store');assert.equal(response.headers.get('x-content-type-options'),'nosniff');assert.ok(!(await response.text()).includes('SECRET'));}
});
test('proxy executes owner lookup auth, real invalid/oversize streams never reach upstream, public AI stays public and rate limited',async()=>{
 const upstream=mock.fn(async()=>[]);const route=loader({'server-only':{},'next/server':server,'@/libs/api-services/backend.server':{backendRequest:upstream},'@/services/user.service':{adminService:{}}})('app/api/backend/[service]/[...path]/route.ts');
 const call=async(method,service,path,body,headers={})=>{const url='https://app.test/api/backend/'+service+'/'+path.join('/');return route[method](Object.assign(new Request(url,{method,headers,body}),{nextUrl:new URL(url)}),{params:Promise.resolve({service,path})});};
 for(const path of [['ho-so','tra-cuu'],['ho-so','ket-qua','tra-cuu']]){assert.equal((await call('GET','score',path)).status,200);assert.equal(upstream.mock.calls.at(-1).arguments[2].auth,'candidate');}
 const before=upstream.mock.callCount();assert.equal((await call('POST','score',['ho-so'],'{bad')).status,400);assert.equal((await call('POST','score',['ho-so'],'x'.repeat(100001),{'content-length':'1'})).status,413);assert.equal(upstream.mock.callCount(),before);
 for(let i=0;i<120;i++){assert.equal((await call('GET','ai',['api','mbti','questions'])).status,200);assert.equal(upstream.mock.calls.at(-1).arguments[2].auth,'public');}
 const afterBudget=upstream.mock.callCount();const limited=await call('GET','ai',['api','mbti','questions']);assert.equal(limited.status,429);assert.ok(limited.headers.get('retry-after'));assert.equal(upstream.mock.callCount(),afterBudget);assert.equal(limited.headers.get('cache-control'),'private, no-store');
});
test('MBTI default 60 requests per process rejects before upstream and keeps public response private',async()=>{
 const upstream=mock.fn(async()=>({data:{result_id:'R',session_id:'S',mbti_type:'INTJ'}}));const route=loader({'server-only':{},'next/server':server,'@/libs/api-services/backend.server':{backendRequest:upstream}})('app/api/mbti/submit/route.ts');
 const request=()=>new Request('https://app.test/api/mbti/submit',{method:'POST',body:JSON.stringify({answers:{1:5}})});
 for(let i=0;i<60;i++)assert.equal((await route.POST(request())).status,200);
 const limited=await route.POST(request());assert.equal(limited.status,429);assert.equal(upstream.mock.callCount(),60);assert.ok(limited.headers.get('retry-after'));assert.equal(limited.headers.get('cache-control'),'private, no-store');
});
test('lookup UI login gate and logout suppress late personal responses',async t=>{
 const dom=new JSDOM('<div id="root"></div>',{url:'https://app.test'});const restore=[];let session,resolve;const pending=new Promise(done=>{resolve=done;});const calls=[];
 for(const [key,value]of Object.entries({window:dom.window,document:dom.window.document,IS_REACT_ACT_ENVIRONMENT:true})){const old=Object.getOwnPropertyDescriptor(global,key);Object.defineProperty(global,key,{value,configurable:true,writable:true});restore.push(()=>old?Object.defineProperty(global,key,old):delete global[key]);}
 const Component=loader({'next/link':{__esModule:true,default:({children,...props})=>React.createElement('a',props,children)},'@/components/CandidateSession':{__esModule:true,default:props=>{session=props;return null;}},'@/libs/api-services/browser-api':{api:async(...args)=>{calls.push(args);return pending;}}})('app/(main)/tra-cuu-ho-so/ApiLookupClient.tsx').default;
 const root=require('react-dom/client').createRoot(dom.window.document.getElementById('root'));await React.act(async()=>root.render(React.createElement(Component)));t.after(async()=>{await React.act(async()=>root.unmount());dom.window.close();restore.forEach(fn=>fn());});const doc=dom.window.document;
 assert.equal(doc.querySelector('form'),null);await React.act(async()=>session.onAuthenticated());assert.ok(doc.querySelector('form'));
 await React.act(async()=>{const input=doc.querySelector('input');Object.getOwnPropertyDescriptor(dom.window.HTMLInputElement.prototype,'value').set.call(input,'OWN');input.dispatchEvent(new dom.window.Event('input',{bubbles:true}));});
 await React.act(async()=>doc.querySelector('form').dispatchEvent(new dom.window.Event('submit',{bubbles:true,cancelable:true})));assert.equal(calls.length,1);
 await React.act(async()=>session.onLogout());await React.act(async()=>resolve([{ma_ho_so:'SECRET-RECORD'}]));assert.equal(doc.querySelector('article'),null);assert.equal(doc.querySelector('form'),null);assert.doesNotMatch(doc.body.textContent,/SECRET-RECORD/);
});
test('candidate session GET accepts actual same-origin Request and blocks foreign/null origins before backend',async()=>{
 const upstream=mock.fn(async()=>({cccd:'000000000001',ho_ten:'Candidate'}));
 const route=loader({'server-only':{},'next/server':server,'next/headers':{cookies:async()=>({})},'@/libs/api-services/backend.server':{backendRequest:upstream}})('app/api/candidate/session/route.ts');
 const response=await route.GET(new Request('https://app.test/api/candidate/session',{headers:{origin:'https://app.test'}}));
 assert.equal(response.status,200);assert.deepEqual(await response.json(),{cccd:'000000000001',ho_ten:'Candidate'});assert.equal(response.headers.get('cache-control'),'private, no-store');assert.equal(response.headers.get('x-content-type-options'),'nosniff');assert.equal(upstream.mock.calls[0].arguments[2].auth,'candidate');
 for(const origin of ['https://evil.test','http://app.test','null'])assert.equal((await route.GET(new Request('https://app.test/api/candidate/session',{headers:{origin}}))).status,403);
 assert.equal(upstream.mock.callCount(),1);
});

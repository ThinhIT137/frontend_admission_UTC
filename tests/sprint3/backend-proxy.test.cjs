const { test, mock } = require('node:test');
const assert = require('node:assert/strict');
const { loader } = require('../sprint1/helpers.cjs');
function fixture(initial = { accessToken: 'old', refreshToken: 'refresh' }) {
  const tokens = new Map(Object.entries(initial));
  const jar = { get: name => tokens.has(name) ? { value: tokens.get(name) } : undefined, set: (name, value) => tokens.set(name, value) };
  const refresh = mock.fn(async () => { tokens.set('accessToken', 'new'); });
  const request = loader({ 'server-only': {}, 'next/headers': { cookies: async () => jar },
    '@/services/candidate-auth.service': { refreshCandidateSession: async () => { tokens.set('candidateToken','new-candidate'); tokens.set('candidateRefresh','rotated'); return 'new-candidate'; } },
    '@/services/user.service': { adminService: { getCurrentUser: async () => ({ ma_admin: 'A1', vai_tro: { ten_vai_tro: 'super_admin' } }), refreshAccessToken: refresh } },
    '@/services/token.service': { tokenService: { verifyAccessToken: async token => token === 'expired' ? null : { userId: 'A1' } } },
  })('libs/api-services/backend.server.ts').backendRequest;
  return { request, refresh, tokens };
}
test('Proxy forwards admin bearer token and refreshes once after a backend 401', async t => {
  const f=fixture(); const requests=[];
  t.mock.method(global,'fetch',async (_,opts)=> { requests.push({...opts.headers}); return requests.length===1 ? {status:401,ok:false,json:async()=>({})} : {status:200,ok:true,json:async()=>({ma_ho_so:'H1'})}; });
  assert.equal((await f.request('score','/ho-so/H1',{auth:'admin'})).ma_ho_so,'H1');
  assert.equal(f.refresh.mock.callCount(),1);assert.equal(requests[0].Authorization,'Bearer old');assert.equal(requests[1].Authorization,'Bearer new');
});
test('Proxy proactively refreshes an expired Next.js access token',async t=>{
  const f=fixture({accessToken:'expired',refreshToken:'refresh'});let header;
  t.mock.method(global,'fetch',async(_,opts)=>{header=opts.headers.Authorization;return{status:200,ok:true,json:async()=>[]}});
  await f.request('score','/ho-so',{auth:'admin'});assert.equal(header,'Bearer new');assert.equal(f.refresh.mock.callCount(),1);
});
test('Candidate access expiration rotates the candidate refresh token and retries',async t=>{
  const f=fixture({candidateToken:'expired-candidate',candidateRefresh:'refresh-candidate'});let calls=0;
  t.mock.method(global,'fetch',async(url,opts)=>{
    calls++;
    if(url.endsWith('/refresh')){assert.equal(JSON.parse(opts.body).refresh_token,'refresh-candidate');return{status:200,ok:true,json:async()=>({access_token:'new-candidate',refresh_token:'rotated'})};}
    return calls===1?{status:401,ok:false,json:async()=>({})}:{status:200,ok:true,json:async()=>({cccd:'000000000099'})};
  });
  await f.request('score','/auth/candidate/me',{auth:'candidate'});assert.equal(calls,2);assert.equal(f.tokens.get('candidateRefresh'),'rotated');
});
test('AI privileged requests use server internal key rather than the admin JWT',async t=>{
  const previous=process.env.AI_INTERNAL_API_KEY;process.env.AI_INTERNAL_API_KEY='unit-internal-key';t.after(()=>{if(previous===undefined)delete process.env.AI_INTERNAL_API_KEY;else process.env.AI_INTERNAL_API_KEY=previous});
  t.mock.method(global,'fetch',async(_,opts)=>{assert.equal(opts.headers.Authorization,'Bearer unit-internal-key');return{status:200,ok:true,json:async()=>({data:[]})}});
  await fixture().request('ai','/api/chat/knowledge',{auth:'admin'});
});
test('Missing candidate session fails before contacting protected backend',async t=>{
  const fetch=t.mock.method(global,'fetch',async()=>{throw Error('must not fetch')});
  await assert.rejects(fixture({}).request('score','/ho-so',{auth:'candidate'}),e=>e.status===401);assert.equal(fetch.mock.callCount(),0);
});
test('Backend 403 and network errors remain failures without fake data',async t=>{
  t.mock.method(global,'fetch',async()=>({status:403,ok:false,json:async()=>({detail:'Forbidden'})}));
  await assert.rejects(fixture().request('score','/ho-so',{auth:'admin'}),e=>e.status===403);
  global.fetch=async()=>{throw Error('offline')};await assert.rejects(fixture().request('score','/ho-so',{auth:'admin'}),e=>e.status===502);
});

test('DELETE điểm chuẩn không có body vẫn gọi backend thay vì lỗi parse JSON',async()=>{
  const upstream=mock.fn(async()=>null);
  const route=loader({
    'server-only':{},
    '@/libs/api-services/backend.server':{backendRequest:upstream,BackendError:class extends Error{}},
    '@/services/user.service':{adminService:{}},
    'next/server':{NextResponse:{json:(body,options)=>({body,status:options?.status||200})}},
  })('app/api/backend/[service]/[...path]/route.ts');
  const response=await route.DELETE(Object.assign(new Request('http://localhost/api/backend/score/diem-chuan/LS1',{method:'DELETE'}),{nextUrl:new URL('http://localhost/api/backend/score/diem-chuan/LS1')}),
    {params:Promise.resolve({service:'score',path:['diem-chuan','LS1']})});
  assert.equal(response.status,200);assert.equal(response.body,null);
  assert.equal(upstream.mock.callCount(),1);
  assert.deepEqual(upstream.mock.calls[0].arguments,['score','/diem-chuan/LS1',{method:'DELETE',body:undefined,auth:'admin'}]);
});

test('Workflow BFF authenticates import/publication and permits outbox reads without exposing a send worker',async()=>{
 const upstream=mock.fn(async()=>({ok:true}));
 const route=loader({'server-only':{},'@/libs/api-services/backend.server':{backendRequest:upstream},'@/services/user.service':{adminService:{}},'next/server':{NextResponse:{json:(body,options)=>Response.json(body,options)}}})('app/api/backend/[service]/[...path]/route.ts');
 for(const [method,path,body]of [['POST',['xet-tuyen','nhap-diem-thpt'],{year:2026,source:'Approved',csv_text:'cccd,TOAN',commit:false}],['POST',['ho-so','cong-bo-ket-qua'],{nam_tuyen_sinh:2026,ma_chuong_trinh:'P1'}],['GET',['xet-tuyen','thong-bao','2026'],undefined]]){
  const url='http://localhost/api/backend/score/'+path.join('/');
  const response=await route[method](Object.assign(new Request(url,{method,body:body?JSON.stringify(body):undefined}),{nextUrl:new URL(url)}),{params:Promise.resolve({service:'score',path})});
  assert.equal(response.status,200);assert.equal(upstream.mock.calls.at(-1).arguments[2].auth,'admin');assert.deepEqual(upstream.mock.calls.at(-1).arguments[2].body,body);
 }
 const url='http://localhost/api/backend/score/xet-tuyen/gui-thong-bao/2026',before=upstream.mock.callCount();
 const denied=await route.POST(Object.assign(new Request(url,{method:'POST',body:'{}'}),{nextUrl:new URL(url)}),{params:Promise.resolve({service:'score',path:['xet-tuyen','gui-thong-bao','2026']})});assert.ok(denied.status>=400);assert.equal(upstream.mock.callCount(),before);
});

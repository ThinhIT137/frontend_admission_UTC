const {test,mock}=require('node:test');
const assert=require('node:assert/strict');
const {loader}=require('../sprint1/helpers.cjs');
function fixture(handler){const request=mock.fn(handler);const route=loader({'server-only':{},'@/libs/api-services/backend.server':{backendRequest:request,BackendError:class extends Error{}},'next/server':{NextResponse:{json:(body,options)=>({body,status:options?.status||200})}}})('app/api/mbti/submit/route.ts').POST;return{request,post:body=>route(new Request('http://localhost/api/mbti/submit',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(body)}))};}
test('MBTI route forwards numerical answers and trusts backend result rather than client-supplied personality',async()=>{
 const f=fixture(async()=>({data:{result_id:'R1',session_id:'S1',mbti_type:'ENTJ'}}));const answers={1:5,2:3,3:1,4:2};
 const r=await f.post({studentName:'Test',mbtiType:'INTJ',answers});assert.equal(r.status,200);assert.equal(r.body.mbtiType,'ENTJ');assert.equal(r.body.resultId,'R1');assert.deepEqual(f.request.mock.calls[0].arguments[2].body,{studentName:'Test',answers});
});
for(const answers of [undefined,{1:'A'}, {1:0},{1:6},{1:2.5}])test('MBTI route rejects invalid answers '+JSON.stringify(answers),async()=>{
 const f=fixture(async()=>{throw Error('must not call')});assert.equal((await f.post({answers})).status,400);assert.equal(f.request.mock.callCount(),0);
});
test('MBTI route reports backend persistence failure without writing duplicate local result',async()=>{
 const f=fixture(async()=>({data:{mbti_type:'INTJ'}}));assert.equal((await f.post({answers:{1:5,2:5,3:5,4:5}})).status,502);
});

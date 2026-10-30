const {test}=require('node:test');
const assert=require('node:assert/strict');
const {loader}=require('../sprint1/helpers.cjs');
const KEY='000000000001/11111111-1111-4111-8111-111111111111.png';
class BackendError extends Error{constructor(message,status){super(message);this.status=status;}}
function fixture(t,error){
 const saved=process.env.JWT_ACCESSTOKEN;process.env.JWT_ACCESSTOKEN='public-test-only-key';
 t.after(()=>saved===undefined?delete process.env.JWT_ACCESSTOKEN:process.env.JWT_ACCESSTOKEN=saved);
 const calls=[];
 class SignJWT{setProtectedHeader(){return this;}setSubject(){return this;}setAudience(){return this;}setIssuedAt(){return this;}setExpirationTime(){return this;}async sign(){return 'test-receipt';}}
 const api=loader({'server-only':{},jose:{SignJWT},
  '@/libs/api-services/backend.server':{BackendError,backendRequest:async(...args)=>{calls.push(['backend',...args]);}},
  '@/services/candidate-auth.service':{},
  '@/libs/submission-storage.server':{privateEvidenceStorage:async()=>({remove:async keys=>{calls.push(['remove',keys]);return {error};}})},
 })('libs/withdrawal-storage.server.ts');
 return {api,calls};
}
test('failed Storage removal leaves durable job unacknowledged for retry',async t=>{
 const {api,calls}=fixture(t,{message:'transport failed'});
 await assert.rejects(api.cleanWithdrawnEvidence({operation_id:'job',files:[KEY]},'000000000001'),e=>e.status===502);
 assert.equal(calls.filter(c=>c[0]==='backend').length,0);
});
test('successful Storage removal precedes signed server acknowledgement',async t=>{
 const {api,calls}=fixture(t,null);
 await api.cleanWithdrawnEvidence({operation_id:'job',files:[KEY]},'000000000001');
 assert.equal(calls[0][0],'remove');assert.deepEqual(calls[0][1],[KEY]);
 assert.equal(calls[1][2],'/ho-so/cua-toi/don-minh-chung/job');
 assert.equal(calls[1][3].body.proof,'test-receipt');
});
test('foreign and traversal keys never reach Storage',async t=>{
 const {api,calls}=fixture(t,null);
 for(const key of [KEY.replace('000000000001/','000000000002/'),'000000000001/../x.png'])
  await assert.rejects(api.cleanWithdrawnEvidence({operation_id:'job',files:[key]},'000000000001'),e=>e.status===403);
 assert.equal(calls.length,0);
});

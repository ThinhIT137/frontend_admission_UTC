const {test}=require('node:test');
const assert=require('node:assert/strict');
const {loader}=require('../sprint1/helpers.cjs');
const {randomUUID,createHash}=require('node:crypto');
class BackendError extends Error{constructor(message,status){super(message);this.status=status;}}
function fixture(t,mode='ok'){
 const events=[];let op;const before=process.env.JWT_ACCESSTOKEN;process.env.JWT_ACCESSTOKEN='unit-coordinator-secret';t.after(()=>before===undefined?delete process.env.JWT_ACCESSTOKEN:process.env.JWT_ACCESSTOKEN=before);
 const bucket={upload:async key=>{events.push('upload');return {error:['upload','cleanup','compensation'].includes(mode)?Error('upload'):null}},download:async()=>({error:Error('missing')}),remove:async keys=>{events.push('remove');assert.deepEqual(keys,op.files.map(f=>f.key));return{error:mode==='cleanup'?Error('cleanup'):null}}};
 const route=loader({'next/server':{NextResponse:{json:(v,o)=>Response.json(v,o)}},'@/services/candidate-auth.service':{currentCandidate:async()=>({cccd:'000000000001'})},'@/libs/api-services/backend.server':{BackendError,backendRequest:async(_,path,options)=>{
  const action=path.split('/').pop();events.push(action==='submission-operations'?'commit':options?.method==='POST'?action:'status');
  if(action==='submission-operations'){if(mode==='metadata')throw new BackendError('invalid',422);const d=JSON.parse(options.body.document);op={operation_id:options.body.operation_id,ma_ho_so:'H1',files:d.files,status:'pending'};return op;}
  if(!op)throw new BackendError('not found',404);
  if(action==='finalize')op.status='completed';if(action==='abort')op.status='aborting';if(action==='compensate'){if(mode==='compensation')throw new BackendError('offline',503);op.status='cleanup_pending';}if(action==='cleanup-complete')op.status='rolled_back';return op;
 }},'@/libs/submission-storage.server':{sha256:v=>createHash('sha256').update(v).digest('hex'),inspectEvidence:async file=>{if(file.name==='bad')throw new BackendError('invalid bytes',400);const bytes=Buffer.from(await file.arrayBuffer());return{bytes,type:'png',size:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex')}},privateEvidenceStorage:async()=>bucket}})('app/api/application-submission/route.ts');
 async function submit({bad=false,cccd='000000000001',files=2}={}){const f=new FormData();const keys=Array.from({length:files},(_,i)=>'draft'+i);f.set('payload',JSON.stringify({operation_id:randomUUID(),cccd,profile:{},submission:{chung_chi:keys.map(k=>({file_dinh_kem:k})),giai_thuong:[]},file_keys:keys}));keys.forEach((_,i)=>f.append('files',new File(['png'],bad&&i===files-1?'bad':'ok.png')));return route.POST(new Request('http://localhost/api/application-submission',{method:'POST',headers:{origin:'http://localhost',host:'localhost'},body:f}));}
 return {events,submit};
}
test('Submission commits metadata before sequential uploads and finalizes only afterwards',async t=>{const f=fixture(t);assert.equal((await f.submit()).status,200);assert.deepEqual(f.events,['commit','upload','upload','finalize']);});
test('Submission validation inspects every file before any metadata or storage mutation',async t=>{const f=fixture(t);assert.equal((await f.submit({bad:true})).status,400);assert.deepEqual(f.events,[]);assert.equal((await f.submit({cccd:'000000000002'})).status,400);assert.deepEqual(f.events,[]);});
test('Metadata rejection never uploads or deletes files',async t=>{const f=fixture(t,'metadata');const r=await f.submit();assert.equal(r.status,422);assert.equal((await r.json()).rollback,'not_started');assert.deepEqual(f.events,['commit','status']);});
test('Upload failure aborts before exact-key cleanup and compensates data afterwards',async t=>{const f=fixture(t,'upload');const r=await f.submit();assert.equal((await r.json()).rollback,'completed');assert.deepEqual(f.events,['commit','upload','status','abort','remove','compensate','cleanup-complete']);});
test('Cleanup failure compensates data but never acknowledges terminal cleanup while files survive',async t=>{const f=fixture(t,'cleanup');const r=await f.submit();assert.ok(['pending','files_pending'].includes((await r.json()).rollback));assert.equal(f.events.includes('compensate'),true);assert.equal(f.events.includes('cleanup-complete'),false);});
test('Compensation outage remains visibly pending instead of claiming rollback succeeded',async t=>{const f=fixture(t,'compensation');assert.equal((await (await f.submit()).json()).rollback,'pending');});
test('Standalone evidence POST is forbidden before any Storage dependency',async()=>{let touched=0;const route=loader({'next/server':{NextResponse:{json:(v,o)=>Response.json(v,o)}},'@supabase/supabase-js':{createClient:()=>{touched++;throw Error('must not open storage')}},'@/libs/api-services/backend.server':{BackendError},'@/services/user.service':{},'@/libs/prisma':{}})('app/api/evidence/route.ts');assert.equal((await route.POST(new Request('http://localhost/api/evidence',{method:'POST'}))).status,409);assert.equal(touched,0);});
test('File inspection accepts actual PNG/PDF/JPEG signatures and rejects spoofed MIME',async()=>{
 const {inspectEvidence}=loader({'server-only':{},'@supabase/supabase-js':{},'@/libs/api-services/backend.server':{BackendError}})('libs/submission-storage.server.ts');
 for(const [bytes,type]of [[Buffer.from([137,80,78,71,13,10,26,10]),'png'],[Buffer.from('%PDF-1.7'),'pdf'],[Buffer.from([255,216,255,0]),'jpg']])assert.equal((await inspectEvidence(new File([bytes],'fake.exe',{type:'text/plain'}))).type,type);
 await assert.rejects(inspectEvidence(new File(['malicious text'],'image.png',{type:'image/png'})));
 await assert.rejects(inspectEvidence(new File([],'empty.pdf',{type:'application/pdf'})));
});

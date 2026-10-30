const {test}=require('node:test');
const assert=require('node:assert/strict');
const React=require('react');
const {JSDOM}=require('jsdom');
const {loader}=require('../sprint1/helpers.cjs');
const combo={ma_to_hop:'A00',ma_mon_1:'M',ma_mon_2:'P',ma_mon_3:'C',mon_1:{ten_mon:'Toán'},mon_2:{ten_mon:'Lý'},mon_3:{ten_mon:'Hóa'}};
async function mount(t,file,name,props,overrides={}){
 const dom=new JSDOM('<div id="root"></div>',{url:'https://test.invalid'}),saved={};
 for(const[k,v]of Object.entries({window:dom.window,document:dom.window.document,HTMLElement:dom.window.HTMLElement,IS_REACT_ACT_ENVIRONMENT:true})){saved[k]=Object.getOwnPropertyDescriptor(global,k);Object.defineProperty(global,k,{value:v,configurable:true,writable:true});}
 const Component=loader({'next/link':{__esModule:true,default:({children,...p})=>React.createElement('a',p,children)},'motion/react':{motion:{div:({children,initial,animate,transition,...p})=>React.createElement('div',p,children)}},'@/contexts/loadingContext':{useLoading:()=>({beginLoading:()=>()=>{}})},'./ai-benchmarks':{loadAiBenchmarks:async()=>[]},...overrides})(file)[name];
 const root=require('react-dom/client').createRoot(document.getElementById('root'));
 await React.act(async()=>root.render(React.createElement(Component,props)));
 t.after(async()=>{await React.act(async()=>root.unmount());dom.window.close();for(const[k,v]of Object.entries(saved))v?Object.defineProperty(global,k,v):delete global[k];});
 const reactProps=el=>el[Object.keys(el).find(k=>k.startsWith('__reactProps'))];
 return {doc:document,change:async(el,value)=>React.act(async()=>reactProps(el).onChange({target:{value}})),click:async el=>React.act(async()=>el.click()),reactProps};
}
test('strict decimal domains reject full malformed input, allow decimal comma and optional blanks',()=>{
 const {parseScoreInput:p,scoreInputError:e}=loader()('libs/score-input.ts');
 for(const s of ['9-','3-5+8','11','-1','1e1','Infinity','9.','0x8','8 9'])assert.equal(p(s,10),null,s);
 for(const[s,n]of [['0',0],['10',10],['9,25',9.25],['.5',.5]])assert.equal(p(s,10),n);
 assert.equal(e('',10),'');assert.ok(e('',10,undefined,true));
 assert.equal(p('6.25',9,.5),null);assert.equal(p('9',9,.5),9);assert.equal(p('150',150),150);assert.equal(p('151',150),null);assert.equal(p('100',100),100);assert.equal(p('101',100),null);
});
test('home retains every invalid pasted score, announces error and prevents handoff; correction restores total',async t=>{
 const ui=await mount(t,'components/admission/HomeQuickCalculator.tsx','default',{combinations:[{code:'A00',subjects:[{code:'M',name:'Toán'},{code:'P',name:'Lý'},{code:'C',name:'Hóa'}]}]});
 const inputs=[...ui.doc.querySelectorAll('input')];for(const el of inputs)await ui.change(el,'8');
 for(const raw of ['9-','3-5+8','11','-1']){await ui.change(inputs[0],raw);assert.equal(inputs[0].value,raw);assert.equal(inputs[0].getAttribute('aria-invalid'),'true');assert.ok(ui.doc.getElementById(inputs[0].getAttribute('aria-describedby')));assert.equal(ui.doc.querySelector('a').getAttribute('aria-disabled'),'true');assert.equal(ui.doc.querySelector('a').getAttribute('href'),'/tinh-diem-quy-doi');assert.doesNotMatch(ui.doc.querySelector('output').textContent,/24/);}
 await ui.change(inputs[0],'10');assert.equal(inputs[0].getAttribute('aria-invalid'),'false');assert.match(ui.doc.querySelector('output').textContent,/26.00/);assert.match(ui.doc.querySelector('a').href,/score1=10/);
});
test('conversion blocks malformed subjects and IELTS steps before API; valid blank optional certificate reaches API; late response ignored',async t=>{
 const calls=[];let resolve;class BrowserApiError extends Error{}
 const ui=await mount(t,'app/(main)/tinh-diem-quy-doi/TinhDiemQuyDoiClient.tsx','default',{initialPrograms:[],initialToHops:[combo],referenceYear:2026},{'@/libs/api-services/browser-api':{BrowserApiError,api:(...args)=>{calls.push(args);return new Promise(r=>resolve=r);}}});
 const inputs=[...ui.doc.querySelectorAll('input[aria-label^="Điểm thi"]')],button=[...ui.doc.querySelectorAll('button')].find(e=>e.textContent.includes('Tính Điểm Quy Đổi'));
 assert.equal(inputs.length,3);assert.ok(button);for(const el of inputs)await ui.change(el,'8');
 for(const raw of ['9-','3-5+8','11','-1']){await ui.change(inputs[0],raw);await ui.click(button);assert.equal(inputs[0].value,raw);assert.equal(inputs[0].getAttribute('aria-invalid'),'true');assert.equal(calls.length,0);}
 await ui.change(inputs[0],'10');const cert=ui.doc.querySelector('input[aria-label="Điểm IELTS"]');await ui.change(cert,'6.25');await ui.click(button);assert.equal(calls.length,0);assert.equal(cert.getAttribute('aria-invalid'),'true');
 await ui.change(cert,'');await ui.click(button);assert.equal(calls.length,1);assert.deepEqual(calls[0][2].scores,[10,8,8]);assert.equal('certificate' in calls[0][2],false);
 await ui.change(inputs[0],'9-');await React.act(async()=>resolve({calculation:{contractVersion:'utc-gha-2026-v2',total:26}}));assert.equal(inputs[0].getAttribute('aria-invalid'),'true');assert.ok(ui.doc.body.textContent.includes('Vui lòng chọn phương thức'));
});
test('Next Image previews use authorized same-origin inline unoptimized; PDF and legacy references have safe fallback',async t=>{
 let imageProps;const ui=await mount(t,'components/admin/EvidencePreview.tsx','EvidencePreview',{fileKey:'000000000001/12345678-1234-1234-1234-123456789012.png',title:'Owned evidence'},{'next/image':{__esModule:true,default:p=>{imageProps=p;return React.createElement('img',{src:p.src,alt:p.alt,onError:p.onError});}}});
 assert.equal(imageProps.unoptimized,true);assert.match(imageProps.src,/^\/api\/evidence\?key=.*&mode=inline$/);assert.match(ui.doc.querySelectorAll('a')[1].href,/mode=download/);await React.act(async()=>imageProps.onError());assert.ok(ui.doc.querySelector('[role=alert]'));assert.equal(ui.doc.querySelector('img'),null);
});
for(const [suffix,image]of [['pdf',false],['legacy reference',false]])test('non-image evidence '+suffix,async t=>{const key=suffix==='pdf'?'000000000001/12345678-1234-1234-1234-123456789012.pdf':suffix;const ui=await mount(t,'components/admin/EvidencePreview.tsx','EvidencePreview',{fileKey:key,title:'Evidence'});assert.equal(!!ui.doc.querySelector('img'),image);assert.equal(ui.doc.querySelectorAll('a').length,suffix==='pdf'?2:0);});
test('private evidence GET authorization precedes signed URL, inline opts out of download and missing object stays private',async t=>{
 const previous={};for(const[k,v]of Object.entries({SUPABASE_URL:'https://test.invalid',SUPABASE_SERVICE_ROLE_KEY:'test'})){previous[k]=process.env[k];process.env[k]=v;}t.after(()=>{for(const[k,v]of Object.entries(previous))v===undefined?delete process.env[k]:process.env[k]=v;});
 let admin=null,candidate=null,missing=false;const signed=[];class BackendError extends Error{constructor(m,status){super(m);this.status=status;}}
 const route=loader({'next/server':{NextResponse:{json:(v,o)=>Response.json(v,o),redirect:(url,o)=>new Response(null,{status:307,headers:{...o.headers,Location:url}})}},'@/libs/prisma':{__esModule:true,default:{}},'@/services/user.service':{adminService:{getCurrentUser:async()=>admin}},'@/libs/api-services/backend.server':{BackendError,backendRequest:async()=>{if(!candidate)throw new BackendError('Unauthorized',401);return{cccd:candidate};}},'@supabase/supabase-js':{createClient:()=>({storage:{getBucket:async()=>({data:{public:false}}),from:()=>({createSignedUrl:async(...args)=>{signed.push(args);return missing?{error:true}:{data:{signedUrl:'https://test.invalid/signed'}};}})}})}})('app/api/evidence/route.ts');
 const get=mode=>route.GET({nextUrl:new URL('https://test.invalid/api/evidence?key=000000000001/12345678-1234-1234-1234-123456789012.png'+(mode?'&mode='+mode:''))});
 const old=console.error;console.error=()=>{};t.after(()=>console.error=old);
 assert.equal((await get('inline')).status,401);candidate='000000000002';assert.equal((await get('inline')).status,403);assert.equal(signed.length,0);
 candidate='000000000001';let res=await get('inline');assert.equal(res.status,307);assert.equal(signed.at(-1)[2].download,false);assert.equal(res.headers.get('vary'),'Cookie');assert.match(res.headers.get('cache-control'),/private, no-store/);
 await get();assert.equal(signed.at(-1)[2].download,true);candidate=null;admin={vai_tro:{ten_vai_tro:'chuyen_vien'}};assert.equal((await get('inline')).status,307);missing=true;res=await get('inline');assert.equal(res.status,404);assert.match(res.headers.get('cache-control'),/no-store/);
});
test('only proven missing coordinator route returns not_started; domain404/timeouts reconcile and retain UUID',async t=>{
 const oldSecret=process.env.JWT_ACCESSTOKEN;process.env.JWT_ACCESSTOKEN='test-secret';t.after(()=>oldSecret===undefined?delete process.env.JWT_ACCESSTOKEN:process.env.JWT_ACCESSTOKEN=oldSecret);
 const old=console.error;console.error=()=>{};t.after(()=>console.error=old);
 class BackendError extends Error{constructor(m,status,code){super(m);Object.assign(this,{status,code});}}
 for(const[status,code,expected]of [[404,'ENDPOINT_NOT_FOUND','not_started'],[404,undefined,'pending'],[504,undefined,'pending']]){
  const requests=[],storageWrites=[];
  const route=loader({'next/server':{NextResponse:{json:(v,o)=>Response.json(v,o)}},'@/services/candidate-auth.service':{currentCandidate:async()=>({cccd:'000000000001'})},'@/libs/api-services/backend.server':{BackendError,backendRequest:async(s,p,o)=>{requests.push({p,o});throw new BackendError('failure',status,code);}},'@/libs/submission-storage.server':{sha256:require('node:crypto').createHash?x=>require('node:crypto').createHash('sha256').update(x).digest('hex'):null,privateEvidenceStorage:async()=>({upload:async()=>storageWrites.push(1)}),inspectEvidence:async()=>{throw Error('No files expected');}}})('app/api/application-submission/route.ts');
  const operation_id='d71d9f86-7cd8-42e0-8558-480446c6d819',form=new FormData();form.set('payload',JSON.stringify({operation_id,cccd:'000000000001',file_keys:[],submission:{chung_chi:[],giai_thuong:[]},profile:{}}));
  const request=new Request('https://test.invalid/api/application-submission',{method:'POST',headers:{origin:'https://test.invalid',host:'test.invalid'},body:form});
  const res=await route.POST(request),body=await res.json();assert.equal(body.rollback,expected);assert.equal(storageWrites.length,0);assert.equal(requests[0].p,'/submission-operations');assert.equal(requests[0].o.body.operation_id,operation_id);
  if(code){assert.equal(res.status,503);assert.equal(body.code,'SUBMISSION_SERVICE_UNAVAILABLE');assert.equal(requests.length,1);}else{assert.equal(requests.length,2);assert.equal(requests[1].p,'/submission-operations/'+operation_id);assert.equal(res.status,status);}
 }
});
test('backend capability classification requires exact FastAPI missing-route detail and HTTP404',async t=>{
 const original=global.fetch; t.after(()=>global.fetch=original);
 const {backendRequest,BackendError}=loader({'server-only':{},'next/headers':{cookies:async()=>({get:()=>undefined})},'@/services/candidate-auth.service':{refreshCandidateSession:async()=>{}},'@/services/token.service':{tokenService:{}},'@/services/user.service':{adminService:{}}})('libs/api-services/backend.server.ts');
 for(const[status,body,code]of [[404,{detail:'Not Found'},'ENDPOINT_NOT_FOUND'],[404,{detail:'Candidate not found'},undefined],[400,{detail:'Not Found'},undefined],[404,{message:'Not Found'},undefined]]){
  global.fetch=async()=>Response.json(body,{status});await assert.rejects(()=>backendRequest('score','/submission-operations'),e=>e instanceof BackendError&&e.status===status&&e.code===code);
 }
});
test('coordinator uploads only after metadata; failed second file removes exact journal keys and compensates; completed retry does not upload',async t=>{
 const oldSecret=process.env.JWT_ACCESSTOKEN;process.env.JWT_ACCESSTOKEN='test-secret';const oldLog=console.error;console.error=()=>{};t.after(()=>{console.error=oldLog;oldSecret===undefined?delete process.env.JWT_ACCESSTOKEN:process.env.JWT_ACCESSTOKEN=oldSecret;});
 const sha256=x=>require('node:crypto').createHash('sha256').update(x).digest('hex');
 class BackendError extends Error{constructor(m,status){super(m);this.status=status;}}
 for(const scenario of ['success','second-file-fails','completed-retry']){
  const events=[];let operation={operation_id:'d71d9f86-7cd8-42e0-8558-480446c6d819',status:'pending',ma_ho_so:'OWNED',files:[]};let uploads=0;
  const storage={upload:async key=>{events.push('upload:'+key);return{error:scenario==='second-file-fails'&&++uploads===2?true:null};},download:async()=>({error:true}),remove:async keys=>{events.push('remove');assert.deepEqual(keys,operation.files.map(f=>f.key));return{error:null};}};
  const route=loader({'next/server':{NextResponse:{json:(v,o)=>Response.json(v,o)}},'@/services/candidate-auth.service':{currentCandidate:async()=>({cccd:'000000000001'})},'@/libs/api-services/backend.server':{BackendError,backendRequest:async(s,p,o)=>{if(p==='/submission-operations'){events.push('metadata');operation.files=JSON.parse(o.body.document).files;if(scenario==='completed-retry')operation.status='completed';}else if(!o?.method){events.push('reconcile');}else{const action=p.split('/').at(-1);events.push(action);if(action==='finalize')operation.status='completed';if(action==='cleanup-complete')operation.status='rolled_back';}return operation;}},'@/libs/submission-storage.server':{sha256,privateEvidenceStorage:async()=>storage,inspectEvidence:async file=>{const bytes=Buffer.from(await file.arrayBuffer());return{bytes,type:'png',sha256:sha256(bytes),size:bytes.length};}}})('app/api/application-submission/route.ts');
  const form=new FormData();form.set('payload',JSON.stringify({operation_id:operation.operation_id,cccd:'000000000001',file_keys:['draft1','draft2'],submission:{chung_chi:[{file_dinh_kem:'draft1'},{file_dinh_kem:'draft2'}]},profile:{}}));for(let i=0;i<2;i++)form.append('files',new File(['fixture'+i],'test.png',{type:'image/png'}));
  const result=await route.POST(new Request('https://test.invalid/api/application-submission',{method:'POST',headers:{origin:'https://test.invalid',host:'test.invalid'},body:form})),body=await result.json();assert.equal(events[0],'metadata');
  if(scenario==='second-file-fails'){assert.equal(result.status,502);assert.equal(body.rollback,'completed');assert.deepEqual(events.slice(-5),['reconcile','abort','remove','compensate','cleanup-complete']);}else{assert.equal(result.status,200);assert.equal(body.success,true);assert.equal(events.filter(e=>e.startsWith('upload:')).length,scenario==='completed-retry'?0:2);}
 }
});


const {test}=require('node:test');
const assert=require('node:assert/strict');
const React=require('react');
const {JSDOM}=require('jsdom');
const {loader}=require('../sprint1/helpers.cjs');
async function mount(t){
 const dom=new JSDOM('<div id="root"></div>',{url:'http://localhost'});const saved={};for(const k of ['window','document','navigator','HTMLElement','IS_REACT_ACT_ENVIRONMENT','fetch'])saved[k]=Object.getOwnPropertyDescriptor(globalThis,k);
 for(const [k,v]of Object.entries({window:dom.window,document:dom.window.document,navigator:dom.window.navigator,HTMLElement:dom.window.HTMLElement,IS_REACT_ACT_ENVIRONMENT:true}))Object.defineProperty(globalThis,k,{value:v,configurable:true,writable:true});
 const requests=[];globalThis.fetch=(url)=>new Promise(resolve=>requests.push({url,resolve}));let session;
 const noop=()=>null;const Client=loader({'@/components/CandidateSession':{__esModule:true,default:props=>{session=props;return null}},'./AcademicEvidenceFields':{__esModule:true,default:noop,emptyTranscript:y=>({loai_diem:'lop_12',nam_hoc:y,hoc_ky:0,diem_mon:[]})},'next/link':{__esModule:true,default:noop},'sonner':{toast:{error:noop,success:noop}},'@/components/ui/DisclaimerBanner':{DisclaimerBanner:noop}})('app/(main)/nop-ho-so/NopHoSoClient.tsx').default;
 const root=require('react-dom/client').createRoot(dom.window.document.getElementById('root'));await React.act(async()=>root.render(React.createElement(Client,{methods:[],programs:[]})));
 t.after(async()=>{await React.act(async()=>root.unmount());dom.window.close();for(const k of Object.keys(saved))saved[k]?Object.defineProperty(globalThis,k,saved[k]):delete globalThis[k];});
 return {doc:dom.window.document,session:()=>session,requests};
}
test('Old account evidence response cannot populate next account or restore after logout',async t=>{
 const f=await mount(t);await React.act(async()=>f.session().onAuthenticated({cccd:'000000000001',ho_ten:'A',so_dien_thoai:'0900000001'}));
 await React.act(async()=>f.session().onLogout());await React.act(async()=>f.session().onAuthenticated({cccd:'000000000002',ho_ten:'B',so_dien_thoai:'0900000002'}));
 await React.act(async()=>f.requests[1].resolve(Response.json([{key:'000000000002/b.png',name:'B-only.png'}])));
 await React.act(async()=>f.requests[0].resolve(Response.json([{key:'000000000001/a.png',name:'A-private.png'}])));
 assert.equal(f.doc.body.textContent.includes('A-private.png'),false);assert.equal(f.doc.body.textContent.includes('B-only.png'),true);
});
test('Selecting a file stays local and creates no upload request',async t=>{
 const f=await mount(t);const input=f.doc.querySelector('input[type=file]');Object.defineProperty(input,'files',{value:[new File(['png'],'chosen.png',{type:'image/png'})],configurable:true});await React.act(async()=>input.dispatchEvent(new window.Event('change',{bubbles:true})));assert.equal(f.requests.length,0);assert.equal(f.doc.body.textContent.includes('chosen.png'),true);
});

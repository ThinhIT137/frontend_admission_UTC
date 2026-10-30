const { test } = require('node:test');
const assert = require('node:assert/strict');
const React = require('react');
const { JSDOM } = require('jsdom');
const { loader } = require('./helpers.cjs');

const deferred = () => { let resolve, reject; const promise = new Promise((a,b) => { resolve=a; reject=b; }); return { promise, resolve, reject }; };
async function mount(t, file, name, props, extra={}) {
 const dom = new JSDOM('<div id="root"></div>', { url:'https://admin.test' });
 const restore=[];
 for (const [key,value] of Object.entries({window:dom.window,document:dom.window.document,IS_REACT_ACT_ENVIRONMENT:true})) {
  const old=Object.getOwnPropertyDescriptor(global,key); Object.defineProperty(global,key,{value,writable:true,configurable:true});restore.push(()=>old?Object.defineProperty(global,key,old):delete global[key]);
 }
 dom.window.scrollTo=()=>{};
 dom.window.matchMedia=()=>({matches:false,addEventListener(){},removeEventListener(){}});
 const messages=[]; const toast=Object.fromEntries(['success','error','warning','info'].map(level=>[level,text=>messages.push({level,text})]));
 const Component=typeof file==='function'?file:loader({sonner:{toast},'next/navigation':{usePathname:()=>'/admin',useRouter:()=>({push(){},refresh(){}})},'next/link':{__esModule:true,default:({children,...p})=>React.createElement('a',p,children)},...extra})(file)[name];
 const root=require('react-dom/client').createRoot(document.getElementById('root'));
 await React.act(async()=>root.render(React.createElement(Component,props)));
 t.after(async()=>{await React.act(async()=>root.unmount());dom.window.close();restore.reverse().forEach(fn=>fn());});
 return {dom,doc:document,messages,click:async el=>React.act(async()=>el.click()),event:async(el,type)=>React.act(async()=>el.dispatchEvent(new dom.window.Event(type,{bubbles:true,cancelable:true})))};
}

test('admin modal synchronously deduplicates submit, keeps values on rejection and unlocks retry',async t=>{
 let calls=0;let current=deferred();const ui=await mount(t,'components/admin/ModalForm.tsx','ModalForm',{isOpen:true,title:'Edit',onClose(){},onSubmit:()=>{calls++;return current.promise;},children:React.createElement('input',{defaultValue:'retained'})});
 const form=ui.doc.querySelector('form');
 await React.act(async()=>{for(let i=0;i<3;i++)form.dispatchEvent(new ui.dom.window.Event('submit',{bubbles:true,cancelable:true}));});
 assert.equal(calls,1);assert.equal(ui.doc.querySelector('fieldset').disabled,true);assert.equal(ui.doc.querySelector('[aria-busy]').getAttribute('aria-busy'),'true');
 await React.act(async()=>current.reject(Error('private SQL secret')));
 assert.equal(ui.doc.querySelector('fieldset').disabled,false);assert.equal(ui.doc.querySelector('input').value,'retained');assert.deepEqual(ui.messages.map(x=>x.level),['error']);assert.doesNotMatch(ui.messages[0].text,/SQL|secret/);
 current=deferred();await ui.event(form,'submit');assert.equal(calls,2);await React.act(async()=>current.resolve());assert.equal(ui.doc.querySelector('fieldset').disabled,false);
});

test('admin confirmation blocks duplicate delete and pending cancellation; rejected operation is retryable',async t=>{
 let calls=0,cancel=0;let current=deferred();const ui=await mount(t,'components/admin/ConfirmDialog.tsx','ConfirmDialog',{isOpen:true,title:'Delete',message:'Confirm',onCancel(){cancel++;},onConfirm:()=>{calls++;return current.promise;}});
 const buttons=ui.doc.querySelectorAll('button');await React.act(async()=>{buttons[1].click();buttons[1].click();});assert.equal(calls,1);assert.equal(buttons[0].disabled,true);
 await ui.event(buttons[1],'keydown');await React.act(async()=>ui.doc.activeElement.dispatchEvent(new ui.dom.window.KeyboardEvent('keydown',{key:'Escape',bubbles:true})));assert.equal(cancel,0);
 await React.act(async()=>current.reject(Error('failure')));assert.equal(buttons[1].disabled,false);assert.equal(ui.messages.filter(x=>x.level==='error').length,1);
 current=deferred();await ui.click(buttons[1]);assert.equal(calls,2);await React.act(async()=>current.resolve());
});

test('subject combination successful assignment followed by failed reload emits only an accurate warning',async t=>{
 let reads=0,writes=0;const write=deferred();const actions={getProgramsByToHopAction:async()=>{if(++reads===1)return [];throw Error('reload failed');},addProgramToToHopAction:()=>{writes++;return write.promise;}};
 const ui=await mount(t,'app/admin/(dashboard)/to-hop-mon/ToHopClient.tsx','default',{initialData:[{ma_to_hop:'A00',mon_1:{ten_mon:'Toán'},mon_2:{ten_mon:'Lý'},mon_3:{ten_mon:'Hóa'}}],subjects:[],allPrograms:[{ma_chuong_trinh:'P1',ten_chuong_trinh:'Program one'}]}, {'@/actions/to_hop_xet_tuyen.action':actions});
 await ui.click(ui.doc.querySelector('tbody tr'));await ui.click(ui.doc.querySelector('input[type=checkbox]'));
 const add=[...ui.doc.querySelectorAll('button')].find(b=>/^Thêm \(/.test(b.textContent));assert.ok(add);
 await React.act(async()=>{add.click();add.click();});assert.equal(writes,1);assert.equal(add.disabled,true);
 await React.act(async()=>write.resolve());assert.equal(add.disabled,true,'selection cleared after successful write');assert.deepEqual(ui.messages.map(x=>x.level),['warning']);assert.match(ui.messages[0].text,/Đã thêm ngành/);
});

test('subject combination rejected assignment never reports success and allows retry without clearing selection',async t=>{
 let writes=0;const write=deferred();const ui=await mount(t,'app/admin/(dashboard)/to-hop-mon/ToHopClient.tsx','default',{initialData:[{ma_to_hop:'A00'}],subjects:[],allPrograms:[{ma_chuong_trinh:'P1',ten_chuong_trinh:'Program one'}]}, {'@/actions/to_hop_xet_tuyen.action':{getProgramsByToHopAction:async()=>[],addProgramToToHopAction:()=>{writes++;return write.promise;}}});
 await ui.click(ui.doc.querySelector('tbody tr'));await ui.click(ui.doc.querySelector('input[type=checkbox]'));const add=[...ui.doc.querySelectorAll('button')].find(b=>/^Thêm \(/.test(b.textContent));await ui.click(add);await React.act(async()=>write.reject(Error('private')));
 assert.equal(writes,1);assert.equal(add.disabled,false);assert.equal(ui.doc.querySelector('input[type=checkbox]').checked,true);assert.deepEqual(ui.messages.map(x=>x.level),['error']);
});

test('mobile admin drawer is inert while closed, focuses and traps while open, Escape restores menu trigger',async t=>{
 const ui=await mount(t,'components/admin/AdminShell.tsx','AdminShell',{role:'super_admin',userName:'Admin',children:React.createElement('h1',null,'Dashboard')},{'@/contexts/loadingContext':{LoadingProvider:({children})=>children},'@/actions/auth.action':{logout:async()=>{}}});
 const drawer=ui.doc.querySelector('[aria-label="Điều hướng quản trị"]');assert.equal(drawer.hasAttribute('inert'),true);
 const trigger=ui.doc.querySelector('[aria-label="Mở hoặc thu gọn menu quản trị"]');trigger.focus();await ui.click(trigger);assert.equal(drawer.getAttribute('role'),'dialog');assert.equal(drawer.contains(ui.doc.activeElement),true);assert.equal(ui.doc.body.style.overflow,'hidden');
 await React.act(async()=>ui.doc.activeElement.dispatchEvent(new ui.dom.window.KeyboardEvent('keydown',{key:'Escape',bubbles:true})));assert.equal(drawer.hasAttribute('inert'),true);assert.equal(ui.doc.activeElement,trigger);assert.equal(ui.doc.body.style.overflow,'');
});

test('dialog Escape still closes after its focused delete control is removed',async t=>{
 const {useAdminDialog}=loader()('hooks/useAdminDialog.ts');let closed=0;
 function RemovingDialog(){const[visible,setVisible]=React.useState(true);const ref=useAdminDialog(true,()=>{closed++;});return React.createElement('div',{ref,role:'dialog',tabIndex:-1},visible&&React.createElement('button',{type:'button',onClick:()=>setVisible(false)},'Remove focused row'));}
 const ui=await mount(t,RemovingDialog,null,{});const button=ui.doc.querySelector('button');button.focus();await ui.click(button);assert.equal(button.isConnected,false);
 await React.act(async()=>ui.doc.activeElement.dispatchEvent(new ui.dom.window.KeyboardEvent('keydown',{key:'Escape',bubbles:true})));assert.equal(closed,1,'an open top dialog must handle Escape when its focused row was removed');
});

test('nested sibling dialog handles Escape without closing its parent',async t=>{
 const {useAdminDialog}=loader()('hooks/useAdminDialog.ts');let parentClosed=0;
 function NestedDialogs(){const[childOpen,setChildOpen]=React.useState(false);const parentRef=useAdminDialog(true,()=>{parentClosed++;});const childRef=useAdminDialog(childOpen,()=>setChildOpen(false));return React.createElement(React.Fragment,null,React.createElement('div',{ref:parentRef,role:'dialog',tabIndex:-1,'aria-label':'Parent'},React.createElement('button',{type:'button',onClick:()=>setChildOpen(true)},'Open child')),childOpen&&React.createElement('div',{ref:childRef,role:'dialog',tabIndex:-1,'aria-label':'Child'},React.createElement('button',{type:'button'},'Child control')));}
 const ui=await mount(t,NestedDialogs,null,{});await ui.click(ui.doc.querySelector('button'));assert.equal(ui.doc.querySelector('[aria-label=Child]').contains(ui.doc.activeElement),true);
 await React.act(async()=>ui.doc.activeElement.dispatchEvent(new ui.dom.window.KeyboardEvent('keydown',{key:'Escape',bubbles:true})));assert.equal(ui.doc.querySelector('[aria-label=Child]'),null);assert.equal(parentClosed,0);
 await React.act(async()=>ui.doc.activeElement.dispatchEvent(new ui.dom.window.KeyboardEvent('keydown',{key:'Escape',bubbles:true})));assert.equal(parentClosed,1);
});

test('pending dialog blocks Escape and recovers Tab focus after its focused control disappears',async t=>{
 const {useAdminDialog}=loader()('hooks/useAdminDialog.ts');let closed=0,release;
 function PendingDialog(){const[pending,setPending]=React.useState(true);release=()=>setPending(false);const[visible,setVisible]=React.useState(true);const ref=useAdminDialog(true,()=>{closed++;},pending);return React.createElement('div',{ref,role:'dialog',tabIndex:-1},visible&&React.createElement('button',{type:'button',onClick:()=>setVisible(false)},'Remove control'));}
 const ui=await mount(t,PendingDialog,null,{});ui.doc.querySelector('button').focus();await ui.click(ui.doc.querySelector('button'));
 await React.act(async()=>ui.doc.activeElement.dispatchEvent(new ui.dom.window.KeyboardEvent('keydown',{key:'Escape',bubbles:true})));assert.equal(closed,0);
 await React.act(async()=>ui.doc.activeElement.dispatchEvent(new ui.dom.window.KeyboardEvent('keydown',{key:'Tab',bubbles:true,cancelable:true})));assert.equal(ui.doc.activeElement,ui.doc.querySelector('[role=dialog]'));
 await React.act(async()=>release());await React.act(async()=>ui.doc.activeElement.dispatchEvent(new ui.dom.window.KeyboardEvent('keydown',{key:'Escape',bubbles:true})));assert.equal(closed,1);
});

const dossier = (id, status='cho') => ({ma_ho_so:id,cccd:'000000000001',ma_chuong_trinh:'P1',ma_phuong_thuc:'PT1',trang_thai:status,create_at:'2026-10-29'});
const noWorkflow = {__esModule:true,default:()=>null};

test('dossier failed filter change never leaves the previous query actionable',async t=>{
 const next=deferred();let reads=0;
 const ui=await mount(t,'app/admin/(dashboard)/ho-so/HoSoClient.tsx','default',{}, {'./WorkflowPanel':noWorkflow,'@/libs/api-services/browser-api':{api:async()=>++reads===1?[dossier('OLD-QUERY')]:next.promise}});
 assert.match(ui.doc.querySelector('tbody').textContent,/OLD-QUERY/);
 const status=ui.doc.querySelector('select[aria-label="Trạng thái hồ sơ"]');
 await React.act(async()=>{status.value='hop_le';status.dispatchEvent(new ui.dom.window.Event('change',{bubbles:true}));});
 assert.ok([...ui.doc.querySelectorAll('tbody button')].every(button=>button.disabled),'old query must not be actionable while new query loads');
 await React.act(async()=>next.reject(Error('new query failed')));
 assert.doesNotMatch(ui.doc.querySelector('tbody').textContent,/OLD-QUERY/);assert.ok(ui.doc.querySelector('[role=alert]'));
 assert.equal(ui.doc.querySelectorAll('tbody button').length,0);
});

test('dossier successful mutation with same-query reload failure is a truthful warning',async t=>{
 let reads=0,writes=0;const ui=await mount(t,'app/admin/(dashboard)/ho-so/HoSoClient.tsx','default',{}, {'./WorkflowPanel':noWorkflow,'@/libs/api-services/browser-api':{api:async(_service,_path,_body,method)=>{if(method==='PATCH'){writes++;return {};}if(++reads===1)return[dossier('OWN-QUERY')];throw Error('reload failed');}}});
 const approve=[...ui.doc.querySelectorAll('button')].find(button=>button.textContent==='Duyệt hợp lệ');await ui.click(approve);
 assert.equal(writes,1);assert.deepEqual(ui.messages.map(x=>x.level),['warning']);assert.match(ui.messages[0].text,/Đã cập nhật hồ sơ/);
});

test('dossier stale filter rejection cannot clear the newest successful query',async t=>{
 let reads=0;const old=deferred(),latest=deferred();
 const ui=await mount(t,'app/admin/(dashboard)/ho-so/HoSoClient.tsx','default',{}, {'./WorkflowPanel':noWorkflow,'@/libs/api-services/browser-api':{api:async()=>{reads++;return reads===1?[dossier('INITIAL')]:reads===2?old.promise:latest.promise;}}});
 const status=ui.doc.querySelector('select[aria-label="Trạng thái hồ sơ"]');
 for(const value of ['hop_le','tu_choi'])await React.act(async()=>{status.value=value;status.dispatchEvent(new ui.dom.window.Event('change',{bubbles:true}));});
 await React.act(async()=>latest.resolve([dossier('LATEST','tu_choi')]));await React.act(async()=>old.reject(Error('old request failed')));
 assert.match(ui.doc.querySelector('tbody').textContent,/LATEST/);assert.equal(ui.doc.querySelector('[role=alert]'),null);
});

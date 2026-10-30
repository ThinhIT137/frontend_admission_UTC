const {test}=require('node:test');
const assert=require('node:assert/strict');
const React=require('react');
const {JSDOM}=require('jsdom');
const {loader}=require('../sprint1/helpers.cjs');

async function mount(t,file,overrides,props={}){
 const dom=new JSDOM('<div id="root"></div>',{url:'https://app.test'}),restore=[];
 for(const [key,value]of Object.entries({window:dom.window,document:dom.window.document,IS_REACT_ACT_ENVIRONMENT:true})){const old=Object.getOwnPropertyDescriptor(global,key);Object.defineProperty(global,key,{value,configurable:true,writable:true});restore.push(()=>old?Object.defineProperty(global,key,old):delete global[key]);}
 const Component=loader(overrides)(file).default,root=require('react-dom/client').createRoot(document.getElementById('root'));
 const render=async(next=props)=>React.act(async()=>root.render(React.createElement(Component,next)));
 await render();t.after(async()=>{await React.act(async()=>root.unmount());dom.window.close();restore.forEach(fn=>fn());});
 return {dom,render,change:async(node,value)=>React.act(async()=>{const proto=node.tagName==='TEXTAREA'?dom.window.HTMLTextAreaElement.prototype:dom.window.HTMLInputElement.prototype;Object.getOwnPropertyDescriptor(proto,'value').set.call(node,value);node.dispatchEvent(new dom.window.Event('input',{bubbles:true}));node.dispatchEvent(new dom.window.Event('change',{bubbles:true}));}),click:async(node)=>React.act(async()=>node.click())};
}
test('Workflow preview cannot commit stale CSV/year/source, canceled publish does nothing and outbox is read-only',async t=>{
 const calls=[],toasts=[];let changed=0;
 const api=async(...args)=>{calls.push(args);return args[1].includes('thong-bao')?[{ma_ho_so:'PRIVATE-2026',status:'sent',attempts:1}]:{valid:1,errors:[],duplicate:false,committed:args[2]?.commit||false,digest:'digest'};};
 const props={year:2026,onChanged:async()=>{changed++;}};
 const ui=await mount(t,'app/admin/(dashboard)/ho-so/WorkflowPanel.tsx',{'@/libs/api-services/browser-api':{api},sonner:{toast:{success:x=>toasts.push(x),error:x=>toasts.push(x)}}},props);
 const button=text=>[...document.querySelectorAll('button')].find(n=>n.textContent===text);
 const inputs=document.querySelectorAll('input'),csv=document.querySelector('textarea');
 await ui.change(inputs[1],'Official reviewed source');await ui.change(csv,'cccd,TOAN\n000000000001,8');
 await ui.click(button('Kiểm tra trước khi nhập'));assert.equal(calls[0][2].commit,false);assert.equal(button('Xác nhận lưu điểm').disabled,false);
 await ui.change(csv,'cccd,TOAN\n000000000001,9');assert.equal(button('Xác nhận lưu điểm').disabled,true);
 await ui.click(button('Kiểm tra trước khi nhập'));await ui.render({...props,year:2027});assert.equal(button('Xác nhận lưu điểm').disabled,true);
 await ui.render(props);await ui.change(inputs[1],'Another approved source');assert.equal(button('Xác nhận lưu điểm').disabled,true);
 await ui.click(button('Kiểm tra trước khi nhập'));window.confirm=()=>false;await ui.click(button('Xác nhận lưu điểm'));assert.equal(calls.filter(c=>c[2]?.commit).length,0);
 window.confirm=()=>true;await ui.click(button('Xác nhận lưu điểm'));assert.equal(calls.at(-1)[2].commit,true);assert.equal(button('Xác nhận lưu điểm').disabled,true);
 await ui.change(inputs[0],' P-FIXTURE ');window.confirm=()=>false;await ui.click(button('Công bố chương trình'));assert.equal(changed,0);
 window.confirm=()=>true;await ui.click(button('Công bố chương trình'));assert.deepEqual(calls.at(-1),['score','/ho-so/cong-bo-ket-qua',{nam_tuyen_sinh:2026,ma_chuong_trinh:'P-FIXTURE'}]);assert.equal(changed,1);
 await ui.click(button('Xem trạng thái thông báo'));assert.match(document.body.textContent,/PRIVATE-2026/);assert.equal(calls.at(-1)[1],'/xet-tuyen/thong-bao/2026');
 await ui.render({...props,year:2027});assert.doesNotMatch(document.body.textContent,/PRIVATE-2026/);assert.ok(!calls.some(c=>c[1].includes('gui-thong-bao')));
});

test('Current lookup UI encodes exact CCCD/profile IDs and distinguishes outage from empty success',async t=>{
 let session,fail=false;const calls=[];
 const ui=await mount(t,'app/(main)/tra-cuu-ho-so/ApiLookupClient.tsx',{'next/link':{__esModule:true,default:({children,...props})=>React.createElement('a',props,children)},'@/components/CandidateSession':{__esModule:true,default:props=>{session=props;return null;}},'@/libs/api-services/browser-api':{api:async(...args)=>{calls.push(args);if(fail)throw Error('SQL SECRET');return [];}}});
 await React.act(async()=>session.onAuthenticated());
 for(const [query,path]of [[' 000000000001 ','cccd=000000000001'],['H/1','ma_ho_so=H%2F1']]){await ui.change(document.querySelector('input'),query);await React.act(async()=>document.querySelector('form').dispatchEvent(new window.Event('submit',{bubbles:true,cancelable:true})));assert.equal(calls.at(-1)[1],'/ho-so/tra-cuu?'+path);assert.match(document.body.textContent,/Không tìm thấy hồ sơ/);}
 fail=true;await React.act(async()=>document.querySelector('form').dispatchEvent(new window.Event('submit',{bubbles:true,cancelable:true})));assert.ok(document.querySelector('[role=alert]'));assert.doesNotMatch(document.body.textContent,/SECRET|Không tìm thấy hồ sơ/);
});

test('Workflow rejects invalid preview and displays a safe toast when backend import fails',async t=>{
 const toasts=[];let fail=false;const logged=t.mock.method(console,'error',()=>{});
 const ui=await mount(t,'app/admin/(dashboard)/ho-so/WorkflowPanel.tsx',{'@/libs/api-services/browser-api':{api:async()=>{if(fail)throw Error('SQL password=SECRET');return {valid:1,errors:[{line:2}],duplicate:false,digest:'bad',committed:false};}},sonner:{toast:{success:()=>{},error:value=>toasts.push(value)}}},{year:2026,onChanged:async()=>{}});
 const button=text=>[...document.querySelectorAll('button')].find(node=>node.textContent===text);
 await ui.change(document.querySelectorAll('input')[1],'Reviewed source');await ui.change(document.querySelector('textarea'),'cccd,TOAN\n000000000001,99');
 await ui.click(button('Kiểm tra trước khi nhập'));assert.equal(button('Xác nhận lưu điểm').disabled,true);
 fail=true;await ui.click(button('Kiểm tra trước khi nhập'));assert.equal(toasts.length,1);assert.doesNotMatch(toasts[0],/SQL|SECRET/);assert.equal(logged.mock.callCount(),0,'raw upstream failures must not be logged');
});

const { test, mock } = require('node:test');
const assert = require('node:assert/strict');
const React = require('react');
const { JSDOM } = require('jsdom');
const { loader } = require('../sprint1/helpers.cjs');
const row = (id, rank, editable=true, year=2026) => ({ ma_ho_so:id, nguyen_vong:rank, nam_tuyen_sinh:year, ma_chuong_trinh:id, ma_phuong_thuc:'HB', trang_thai:'cho', co_the_chinh_sua:editable });
async function mount(t, initial=[row('A',1),row('B',3)], mutation=async()=>{}) {
  const dom=new JSDOM('<div id="root"></div>',{url:'http://localhost'}); const restores=[]; let session; const calls=[]; let rows=initial;
  for(const [key,value] of Object.entries({window:dom.window,document:dom.window.document,IS_REACT_ACT_ENVIRONMENT:true})){
    const old=Object.getOwnPropertyDescriptor(global,key); Object.defineProperty(global,key,{value,configurable:true,writable:true}); restores.push(()=>old?Object.defineProperty(global,key,old):delete global[key]);
  }
  const Component=loader({
    'next/link':{__esModule:true,default:({children,...props})=>React.createElement('a',props,children)},
    'sonner':{toast:{success:()=>{}}},
    '@/components/CandidateSession':{__esModule:true,default:props=>{session=props;return React.createElement('div');}},
    '@/libs/api-services/browser-api':{api:async(service,path,payload,method)=>{calls.push({service,path,payload,method}); if(!method)return rows; return mutation({path,payload,method,setRows:value=>{rows=value;}});}},
  })('app/(main)/nguyen-vong-cua-toi/MyPreferences.tsx').default;
  const root=require('react-dom/client').createRoot(dom.window.document.getElementById('root'));
  await React.act(async()=>root.render(React.createElement(Component)));
  t.after(async()=>{await React.act(async()=>root.unmount());dom.window.close();restores.forEach(fn=>fn());});
  const doc=dom.window.document;
  const button=text=>[...doc.querySelectorAll('button')].find(el=>el.textContent===text);
  const click=async el=>React.act(async()=>el.click());
  const change=async(el,value)=>React.act(async()=>{if(el.tagName==='INPUT')Object.getOwnPropertyDescriptor(dom.window.HTMLInputElement.prototype,'value').set.call(el,value);else el.value=value;el.dispatchEvent(new dom.window.Event(el.tagName==='INPUT'?'input':'change',{bubbles:true}));});
  await React.act(async()=>session.onAuthenticated());
  return{doc,calls,button,click,change,logout:()=>React.act(async()=>session.onLogout())};
}
test('candidate year reorder up/down save/cancel preserves observed rank versions',async t=>{
  const f=await mount(t); assert.equal(f.button('Đổi thứ tự nguyện vọng').disabled,true);
  await f.change(f.doc.querySelector('select'),'2026'); await f.click(f.button('Đổi thứ tự nguyện vọng'));
  await f.click(f.doc.querySelector('[aria-label="Đưa hồ sơ B lên"]'));
  assert.match(f.doc.querySelector('article').textContent,/Mã hồ sơ: B/);
  await f.click(f.doc.querySelector('[aria-label="Đưa hồ sơ B xuống"]'));
  assert.match(f.doc.querySelector('article').textContent,/Mã hồ sơ: A/);
  await f.click(f.button('Hủy sắp xếp')); assert.equal(f.calls.filter(c=>c.method).length,0);
  await f.click(f.button('Đổi thứ tự nguyện vọng')); await f.click(f.doc.querySelector('[aria-label="Đưa hồ sơ B lên"]')); await f.click(f.button('Lưu thứ tự'));
  assert.deepEqual(f.calls.find(c=>c.method==='PUT').payload,{nam_tuyen_sinh:2026,thu_tu:[{ma_ho_so:'B',nguyen_vong_cu:3},{ma_ho_so:'A',nguyen_vong_cu:1}]});
  assert.equal(f.calls.filter(c=>!c.method).length,2);
});
test('withdraw requires exact typed code, supports cancel, reloads after success',async t=>{
  const f=await mount(t,undefined,async({setRows})=>setRows([row('B',3)]));
  await f.click(f.button('Rút hồ sơ')); assert.equal(f.button('Xác nhận rút và xóa hồ sơ').disabled,true);
  await f.change(f.doc.querySelector('input'),'WRONG'); assert.equal(f.button('Xác nhận rút và xóa hồ sơ').disabled,true);assert.equal(f.calls.filter(c=>c.method).length,0);
  await f.click(f.button('Hủy rút hồ sơ'));assert.equal(f.doc.querySelector('input'),null);
  await f.click(f.button('Rút hồ sơ'));await f.change(f.doc.querySelector('input'),'A');assert.equal(f.button('Xác nhận rút và xóa hồ sơ').disabled,false);
  await f.click(f.button('Xác nhận rút và xóa hồ sơ'));assert.equal(f.calls.find(c=>c.method==='DELETE').path,'/ho-so/cua-toi/A');assert.equal(f.doc.querySelectorAll('article').length,1);assert.match(f.doc.querySelector('article').textContent,/Mã hồ sơ: B/);
});
test('mutation conflict/failure discards draft, reloads server rows and shows alert',async t=>{
  const f=await mount(t,undefined,async({setRows})=>{setRows([row('B',1),row('A',3,false)]);throw Object.assign(Error('conflict'),{status:409});});
  await f.change(f.doc.querySelector('select'),'2026'); await f.click(f.button('Đổi thứ tự nguyện vọng'));await f.click(f.button('Lưu thứ tự'));
  assert.ok(f.doc.querySelector('[role="alert"]'));assert.equal(f.button('Lưu thứ tự'),undefined);assert.match(f.doc.querySelector('article').textContent,/Mã hồ sơ: B/);assert.equal(f.button('Đổi thứ tự nguyện vọng').disabled,true);
});
test('logout during mutation prevents stale reload and success UI',async t=>{
  let resolve;const pending=new Promise(done=>{resolve=done;});const f=await mount(t,undefined,()=>pending);
  await f.change(f.doc.querySelector('select'),'2026');await f.click(f.button('Đổi thứ tự nguyện vọng'));await f.click(f.button('Lưu thứ tự'));
  assert.equal(f.button('Lưu thứ tự').disabled,true);await f.logout();await React.act(async()=>resolve({success:true}));
  assert.equal(f.doc.querySelectorAll('article').length,0);assert.match(f.doc.body.textContent,/Đăng nhập để xem/);assert.equal(f.calls.filter(c=>!c.method).length,1);
});
test('a processed dossier locks reordering for the entire selected year',async t=>{
  const f=await mount(t,[row('A',1),row('B',2,false)]);await f.change(f.doc.querySelector('select'),'2026');assert.equal(f.button('Đổi thứ tự nguyện vọng').disabled,true);assert.equal([...f.doc.querySelectorAll('button')].filter(x=>x.textContent==='Rút hồ sơ').length,1);
});
test('proxy executes exact candidate allowlist and rejects cross origin/unknown mutation paths',async()=>{
  const upstream=mock.fn(async()=>({success:true}));
  const route=loader({'server-only':{},'@/libs/api-services/backend.server':{backendRequest:upstream,BackendError:class extends Error{}},'@/services/user.service':{adminService:{}},'next/server':{NextResponse:{json:(body,options)=>({body,status:options?.status||200})}}})('app/api/backend/[service]/[...path]/route.ts');
  const call=(method,path,origin='http://localhost')=>route[method](Object.assign(new Request('http://localhost/api/backend/score/'+path.join('/'),{method,headers:{origin},body:method==='PUT'?'{}':undefined}),{nextUrl:new URL('http://localhost/api/backend/score/'+path.join('/'))}),{params:Promise.resolve({service:'score',path})});
  assert.equal((await call('PUT',['ho-so','cua-toi','thu-tu'])).status,200);assert.equal(upstream.mock.calls.at(-1).arguments[2].auth,'candidate');
  assert.equal((await call('DELETE',['ho-so','cua-toi','A'])).status,200);assert.equal(upstream.mock.calls.at(-1).arguments[2].auth,'candidate');
  for(const [method,path] of [['PUT',['ho-so','cua-toi','A']],['DELETE',['ho-so','A']],['PUT',['ho-so','cua-toi','thu-tu','extra']]])assert.equal((await call(method,path)).status,404);
  assert.equal((await call('DELETE',['ho-so','cua-toi','A'],'https://evil.test')).status,403);assert.equal(upstream.mock.callCount(),2);
});

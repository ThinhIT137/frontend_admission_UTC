const { test, mock } = require('node:test');
const assert = require('node:assert/strict');
const React = require('react');
const { JSDOM } = require('jsdom');
const { loader } = require('./helpers.cjs');
const base = { page: 1, pageSize: 9, term: '', faculty: '', toHop: '', diemChuan: 0, year: 2026, phuongThuc: 'PT1' };
const result = (name = 'Initial', total = 30) => ({ data: [{ ma_chuong_trinh: name, ten_chuong_trinh: name }], total, page: 1, pageSize: 9 });
const deferred = () => { let resolve, reject; const promise = new Promise((a,b) => {resolve=a;reject=b;}); return {promise,resolve,reject}; };

async function mount(t, action, overrides = {}) {
  const dom = new JSDOM('<div id="root"></div>', { url: 'http://localhost' });
  const restore = [];
  for (const [key,value] of Object.entries({ window: dom.window, document: dom.window.document, IS_REACT_ACT_ENVIRONMENT: true })) {
    const old = Object.getOwnPropertyDescriptor(global,key);
    Object.defineProperty(global,key,{value,configurable:true,writable:true});
    restore.push(() => old ? Object.defineProperty(global,key,old) : delete global[key]);
  }
  let controls, list;
  const load=loader({
    'next/link': {__esModule:true,default:({children,...props})=>React.createElement('a',props,children)},
    '@/actions/chuong_trinh_dao_tao.action':{getFilterCTDTAction:action},
    '@/components/tra-cuu-nganh-hoc/FilterAndSearchBar':{__esModule:true,default:p=>{controls=p;return null;}},
    '@/components/tra-cuu-nganh-hoc/Hero':{__esModule:true,default:()=>null},
    '@/components/ui/DisclaimerBanner':{DisclaimerBanner:()=>null},
    '@/components/tra-cuu-nganh-hoc/MajorList':{__esModule:true,default:p=>{list=p;return React.createElement('output',null,p.dataNganhHoc.map(r=>r.ten_chuong_trinh).join(','));}},
  });
  const C=load('app/(main)/tra-cuu-nganh-hoc/MajorLookupClient.tsx').default;
  const root=require('react-dom/client').createRoot(dom.window.document.getElementById('root'));
  const props={initialFilters:base,initialResult:result(),faculties:[],combinations:[],...overrides};
  await React.act(async()=>root.render(React.createElement(React.StrictMode,null,React.createElement(C,props))));
  t.after(async()=>{await React.act(async()=>root.unmount());dom.window.close();restore.forEach(f=>f());});
  return {get controls(){return controls;},get list(){return list;},doc:dom.window.document,
    act:fn=>React.act(fn),wait:ms=>React.act(async()=>new Promise(r=>setTimeout(r,ms)))};
}

test('lookup SSR bootstraps URL aliases in parallel, retaining successful catalogs after partial failure',async t=>{
  t.mock.method(console,'error',()=>{});
  for(const alias of ['faculty','khoi','khoi_nganh']) {
    const calls=[];const programs=deferred(),faculties=deferred(),combinations=deferred();
    const Client=()=>null;
    const page=loader({
      './MajorLookupClient':{__esModule:true,default:Client},
      '@/services/chuong_trinh_dao_tao.service':{chuongTrinhDaoTaoService:{getFilter:f=>{calls.push(f);return programs.promise;}}},
      '@/services/khoi_nganh.service':{khoiNganhService:{getAll:()=>{calls.push('faculty');return faculties.promise;}}},
      '@/services/to_hop_xet_tuyen.service':{toHopXetTuyenService:{getAll:()=>{calls.push('combination');return combinations.promise;}}},
    })('app/(main)/tra-cuu-nganh-hoc/page.tsx').default;
    const pending=page({searchParams:Promise.resolve({term:'công nghệ',[alias]:'F1'})});
    await Promise.resolve();
    assert.equal(calls.length,3,'all independent reads start before any resolves');
    programs.resolve(result());faculties.resolve([{ma_khoi_nganh:'F1'}]);combinations.reject(Error('private detail'));
    const el=await pending;
    assert.equal(el.type,Client);assert.equal(el.props.initialFilters.faculty,'F1');assert.equal(el.props.initialFilters.term,'công nghệ');
    assert.equal(el.props.initialResult.data.length,1);assert.equal(el.props.faculties.length,1);assert.deepEqual(el.props.combinations,[]);
    assert.ok(el.props.initialError);assert.doesNotMatch(el.props.initialError,/private detail/);
  }
});

test('lookup hydration performs zero initial actions even under StrictMode; selectors and paging request immediately',async t=>{
  const calls=[];const m=await mount(t,async f=>{calls.push(f);return result('Updated');});
  assert.equal(calls.length,0);assert.equal(m.doc.querySelector('output').textContent,'Initial');
  await m.act(async()=>m.list.setCurrentPage(3));assert.equal(calls.length,1);assert.equal(calls[0].page,3);
  await m.act(async()=>m.controls.setSelectedFaculty('F2'));
  assert.equal(calls.length,2);assert.equal(calls[1].page,1);assert.equal(calls[1].faculty,'F2');
});

test('lookup only debounces text; rapid typing sends latest term once after 300 ms',async t=>{
  const calls=[];const m=await mount(t,async f=>{calls.push(f);return result();});
  await m.act(async()=>m.controls.setSearchTerm('c'));
  await m.wait(100);await m.act(async()=>m.controls.setSearchTerm('công nghệ'));
  await m.wait(200);assert.equal(calls.length,0);
  await m.wait(120);assert.equal(calls.length,1);assert.equal(calls[0].term,'công nghệ');assert.equal(calls[0].page,1);
});

test('lookup stale success/rejection cannot replace latest data/error/loading',async t=>{
  const requests=[];const m=await mount(t,f=>{const d=deferred();requests.push(d);return d.promise;});
  await m.act(async()=>m.controls.setSelectedFaculty('A'));
  await m.act(async()=>m.controls.setSelectedFaculty('B'));
  await m.act(async()=>requests[1].resolve(result('Newest')));
  await m.act(async()=>requests[0].reject(Error('stale failure')));
  assert.equal(m.doc.querySelector('output').textContent,'Newest');assert.equal(m.doc.querySelector('[role=alert]'),null);assert.equal(m.doc.querySelector('[role=status]').textContent,'');
});

test('lookup selector while typing flushes current term without waiting for debounce',async t=>{
  const calls=[];const m=await mount(t,async f=>{calls.push(f);return result();});
  await m.act(async()=>m.controls.setSearchTerm('kinh tế'));
  await m.act(async()=>m.controls.setSelectedYear(2025));
  assert.equal(calls.length,1);assert.equal(calls[0].term,'kinh tế');assert.equal(calls[0].year,2025);
});

test('lookup latest failed filter does not present previous filter cards as current results',async t=>{
  t.mock.method(console,'error',()=>{});
  const m=await mount(t,async()=>{throw Error('private detail');});
  await m.act(async()=>m.controls.setSelectedFaculty('Different'));
  assert.ok(m.doc.querySelector('[role=alert]'));
  assert.doesNotMatch(m.doc.querySelector('[role=alert]').textContent,/private detail/);
  assert.equal(Boolean(m.doc.querySelector('output')),false,'old cards must clear or be explicitly labelled stale instead of appearing current');
});

test('lookup service bounds public history/projection and performs no-term SQL pagination/count',async()=>{
  const findMany=mock.fn(async()=>[]),count=mock.fn(async()=>21);
  const service=loader({'@/libs/prisma':{prismaPublic:{chuongTrinhDaoTao:{findMany,count}}},'./user.service':{adminService:{}}})('services/chuong_trinh_dao_tao.service.ts').chuongTrinhDaoTaoService;
  const value=await service.getFilter({...base,page:2,faculty:'F',toHop:'A00',diemChuan:25});
  const q=findMany.mock.calls[0].arguments[0];assert.equal(q.skip,9);assert.equal(q.take,9);assert.equal(value.total,21);
  assert.deepEqual(count.mock.calls[0].arguments[0].where,q.where);
  assert.deepEqual(q.where.ctdt_to_hop.some,{ma_to_hop:'A00',nam:2026});
  assert.deepEqual(q.where.lich_su_diem_chuan.some,{nam:2026,diem_trung_tuyen:{some:{ma_phuong_thuc:'PT1',diem:{gt:0,lte:25}}}});
  assert.deepEqual(q.select.lich_su_diem_chuan.where,{nam:{in:[2026,2025]}});
  assert.deepEqual(q.select.lich_su_diem_chuan.select.diem_trung_tuyen.where,{ma_phuong_thuc:'PT1'});
  assert.equal(q.include,undefined);assert.equal(q.select.ma_admin_quan_ly,undefined);assert.equal(q.select.hoc_phan,undefined);
});

test('lookup service retains accent-insensitive token matching, ranked totals and pagination',async()=>{
  const rows=[['B','Ngành Công nghệ'],['A','Công nghệ thông tin'],['C','Kinh tế']].map(([code,name])=>({ma_chuong_trinh:code,ten_chuong_trinh:name,nganh:{ten_nganh:name}}));
  const findMany=mock.fn(async()=>rows),count=mock.fn();
  const service=loader({'@/libs/prisma':{prismaPublic:{chuongTrinhDaoTao:{findMany,count}}},'./user.service':{adminService:{}}})('services/chuong_trinh_dao_tao.service.ts').chuongTrinhDaoTaoService;
  const value=await service.getFilter({...base,term:'cong nghe',pageSize:1,page:2});
  assert.equal(value.total,2);assert.equal(value.data[0].ma_chuong_trinh,'B');assert.equal(count.mock.calls.length,0);
  assert.equal(findMany.mock.calls[0].arguments[0].take,undefined);
});

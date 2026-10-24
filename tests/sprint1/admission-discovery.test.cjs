const { test } = require('node:test');
const assert = require('node:assert/strict');
const React = require('react');
const { JSDOM } = require('jsdom');
const { loader } = require('./helpers.cjs');
const link = { __esModule: true, default: ({ children, ...props }) => React.createElement('a', props, children) };
const compareCalls = [];
const load = loader({ 'next/link': link, 'next/navigation': { usePathname: () => '/so-sanh-chuong-trinh' }, '@/actions/compare.action': { comparePrograms: async ids => { compareCalls.push(ids); if (new Set(ids).size < 2) throw Error('Chọn 2–3 chương trình'); return ids.map(id => ({ ma_chuong_trinh: id, ten_chuong_trinh: id, nganh: { ten_nganh: 'Major' }, ctdt_to_hop: [], lich_su_diem_chuan: [{ nam: 2026, chi_tieu: 12, diem_trung_tuyen: [{ ma_phuong_thuc: 'THPT', diem: 24, phuong_thuc: { ten_phuong_thuc: 'THPT' } }, { ma_phuong_thuc: 'HB', diem: 28, phuong_thuc: { ten_phuong_thuc: 'Học bạ' } }] }] })); } } });
const data = load('components/admission/admission-data.ts');
const historyRows = [
  { id:'new', year:2026, majorCode:'N', majorName:'Major', programCode:'A', programName:'Alpha', quota:0, combinations:['A00','A00'], scores:[{methodCode:'THPT',methodName:'Exam',score:0,maxPreference:2,minPriorityScore:0,subjectConditions:{Math:8,Bad:'9',Negative:-1,Overflow:11,HTML:'<script>bad</script>'}}] },
  { id:'old', year:2025, majorCode:'N', majorName:'Major', programCode:'A', programName:'Alpha', quota:10, combinations:['D01'], scores:[{methodCode:'HB',methodName:'Transcript',score:27,subjectConditions:['invalid']}] },
];

test('quota grid uses latest year, seven columns and only valid stored conditions', async t => {
  const {doc,change}=await mount(t,'app/(main)/thong-tin-tuyen-sinh/AdmissionHistoryTable.tsx',{admissionHistory:historyRows});
  assert.equal(doc.querySelectorAll('thead th').length,7);
  assert.equal(doc.querySelector('select').value,'2026');
  const row=doc.querySelector('tbody tr:nth-child(2)');
  assert.equal(row.children[3].textContent,'0');
  assert.equal(row.children[5].textContent,'A00');
  assert.match(row.children[6].textContent,/Math:.*8/);
  assert.match(row.children[6].textContent,/2/);
  assert.match(row.children[6].textContent,/0/);
  assert.doesNotMatch(row.children[6].textContent,/Bad|Negative|Overflow|HTML|script/);
  assert.equal(doc.querySelector('tbody a').getAttribute('href'),'/tra-cuu-nganh-hoc/A');
  await change(doc.querySelector('select'),'2025');
  assert.equal(doc.querySelectorAll('tbody').length,1);
  assert.match(doc.querySelector('tbody').textContent,/D01/);
  assert.match(doc.querySelector('tbody').textContent,/Chưa công bố/);
  await React.act(async()=>[...doc.querySelectorAll('button')].find(b=>b.textContent==='Lịch sử điểm chuẩn').click());
  assert.equal(doc.querySelectorAll('thead th').length,6);
  assert.match(doc.querySelector('tbody tr:nth-child(2)').textContent,/Chưa công bố/);
  assert.match(doc.querySelector('tbody').textContent,/27/);
  await change(doc.querySelectorAll('select')[1],'HB');
  assert.equal(doc.querySelectorAll('tbody').length,1);
  assert.equal(doc.querySelectorAll('thead th').length,5);
  assert.equal(doc.querySelector('th[scope=rowgroup]').colSpan,5);
});

test('quota empty source and failed source remain distinct',async t=>{
  const {doc}=await mount(t,'app/(main)/thong-tin-tuyen-sinh/AdmissionHistoryTable.tsx',{admissionHistory:[]});
  assert.match(doc.body.textContent,/Chưa công bố dữ liệu/);
  assert.equal(doc.querySelector('table'),null);
  const html=require('react-dom/server').renderToStaticMarkup(React.createElement(load('app/(main)/thong-tin-tuyen-sinh/AdmissionHistoryTable.tsx').default,{admissionHistory:[],loadFailed:true}));
  assert.match(html,/Chưa tải được dữ liệu/);
});

test('server maps combinations by exact year without leaking another year',async()=>{
  let query;
  const db=Object.fromEntries(['phuongThucXetTuyen','khoiNganh','triThucAi','trangNoiDung','loTrinhTuyenSinh'].map(n=>[n,{findMany:async()=>[]}]));
  db.nganhHoc={count:async()=>1}; db.chuongTrinhDaoTao={findMany:async()=>[]};
  const program={ten_chuong_trinh:'Alpha',nganh:{ma_nganh:'N',ten_nganh:'Major'},ctdt_to_hop:[{nam:2026,ma_to_hop:'A00'},{nam:2025,ma_to_hop:'D01'}]};
  db.lichSuDiemChuan={findMany:async q=>{query=q;return [2026,2025].map(nam=>({ma_ls_dc:String(nam),nam,ma_chuong_trinh:'A',chi_tieu:0,chuong_trinh:program,diem_trung_tuyen:[{ma_phuong_thuc:'THPT',diem:0,phuong_thuc:{ten_phuong_thuc:'Exam'},nguyen_vong_toi_da:2,diem_uu_tien_toi_thieu:0,dieu_kien_mon:{Math:8}}]}));}};
  const el=await loader({'@/libs/prisma':{prismaPublic:db},'./ThongTinTuyenSinhClient':{default:()=>null}})('app/(main)/thong-tin-tuyen-sinh/page.tsx').default();
  assert.ok(query.include.chuong_trinh.include.ctdt_to_hop.select.nam);
  assert.deepEqual(el.props.admissionHistory.map(r=>r.combinations),[['A00'],['D01']]);
  assert.equal(el.props.admissionHistory[0].quota,0);
  assert.deepEqual(el.props.admissionHistory[0].scores[0],{methodCode:'THPT',methodName:'Exam',score:0,maxPreference:2,minPriorityScore:0,subjectConditions:{Math:8}});
});
async function mount(t, file, props, moduleLoader = load) {
  const dom = new JSDOM('<div id="root"></div>', { url: 'http://localhost' });
  const restore = [];
  for (const [key, value] of Object.entries({ window: dom.window, document: dom.window.document, IS_REACT_ACT_ENVIRONMENT: true })) {
    const old = Object.getOwnPropertyDescriptor(global, key);
    Object.defineProperty(global, key, { value, configurable: true, writable: true });
    restore.push(() => old ? Object.defineProperty(global, key, old) : delete global[key]);
  }
  const root = require('react-dom/client').createRoot(dom.window.document.getElementById('root'));
  const module = moduleLoader(file);
  await React.act(async () => root.render(React.createElement(module.default || module.Sidebar, props)));
  t.after(async () => { await React.act(async () => root.unmount()); dom.window.close(); restore.forEach(fn => fn()); });
  return { doc: dom.window.document, change: async (el, value) => React.act(async () => { el.value = value; el.dispatchEvent(new dom.window.Event('change', { bubbles: true })); }) };
}
test('Vietnam inclusive date boundaries and missing/invalid/reversed dates', () => {
  assert.equal(data.milestoneStatus('2026-06-01', '2026-06-02', '2026-06-02T16:59:59Z'), 'ACTIVE');
  assert.equal(data.milestoneStatus('2026-06-01', '2026-06-02', '2026-06-02T17:00:00Z'), 'PAST');
  assert.equal(data.milestoneStatus('2026-06-01', null, '2026-05-31T17:00:00Z'), 'ACTIVE');
  assert.equal(data.milestoneStatus('2026-06-01', null, '2026-05-30'), 'UPCOMING');
  for (const [start, end] of [[null, null], ['2026-02-30', null], ['bad', null], ['2026-06-02', '2026-06-01']]) assert.equal(data.milestoneStatus(start, end, '2026-06-01'), 'UNKNOWN');
});
test('published HTML remains inert and only safe explicit links survive', () => {
  const content = '<script>alert(1)</script><img src=x onerror=alert(1)><p>&lt;img src=x onerror=alert(2)&gt;</p><a href="jav&#97;script:alert(1)">Bad</a><a href="https://example.com/doc?q=1&amp;x=2">Doc</a>';
  const parsed = data.publishedContent(content);
  assert.equal(parsed.links.length, 1); assert.equal(parsed.links[0].href, 'https://example.com/doc?q=1&x=2');
  const html = require('react-dom/server').renderToStaticMarkup(React.createElement(load('components/admission/PublishedText.tsx').default, { content }));
  assert.doesNotMatch(html, /<script|<img|href="javascript:/i);
  for (const url of ['javascript:alert(1)', 'data:text/html,x', '//evil.test', 'https://user:pass@example.com']) assert.equal(data.safeExternalUrl(url), null);
});
test('sidebar exposes comparison link', async t => {
  const { doc } = await mount(t, 'components/layout/Sidebar.tsx', {});
  assert.ok(doc.querySelector('a[href="/so-sanh-chuong-trinh"]'));
});
test('timeline sorts real records and filters by year/status; empty and error are distinct', async t => {
  const row = (id, date) => ({ ma_su_kien: id, ten_su_kien: id, thoi_gian_bat_dau: date, thoi_gian_ket_thuc: null, ghi_chu: null });
  const { doc, change } = await mount(t, 'app/(main)/lo-trinh-tuyen-sinh/LoTrinhTuyenSinhClient.tsx', { dbMilestones: [row('Future', '2027-01-01'), row('Current', '2026-06-01'), row('Past', '2025-01-01')], referenceTime: '2026-06-01' });
  assert.deepEqual([...doc.querySelectorAll('article h2')].map(x => x.textContent), ['Past', 'Current', 'Future']);
  await change(doc.querySelectorAll('select')[1], 'ACTIVE'); assert.equal(doc.querySelectorAll('article').length, 1); assert.equal(doc.querySelector('article h2').textContent, 'Current');
  await change(doc.querySelectorAll('select')[0], '2025'); assert.equal(doc.querySelectorAll('article').length, 0);
});
test('program switch resets actual course filters and replaces curriculum/content', async t => {
  const course = (id, year, semester, block) => ({ ma_ctdt_hoc_phan: id, ma_hoc_phan: id, nam_ap_dung: year, hoc_ky: semester, khoi_kien_thuc: block, loai: 'bat_buoc', hoc_phan: { ten_hoc_phan: id, so_tin_chi: 3 } });
  const { doc, change } = await mount(t, 'app/(main)/tra-cuu-nganh-hoc/[id]/ChiTietNganhClient.tsx', { major: { ma_nganh: 'N', ten_nganh: 'Major' }, programs: [{ ma_chuong_trinh: 'A', ten_chuong_trinh: 'Alpha', mo_ta_ngan: 'Alpha description', hoc_phan: [course('A1', 2026, 1, 'General'), course('A2', 2026, 2, 'Special'), course('Old', 2025, 1, 'General')] }, { ma_chuong_trinh: 'B', ten_chuong_trinh: 'Beta', mo_ta_ngan: 'Beta description', hoc_phan: [course('B1', 2024, 3, 'Other')] }], combinations: [], scoreHistory: [] });
  const rows = () => [...doc.querySelectorAll('tbody tr')].map(x => x.textContent);
  assert.equal(rows().length, 2); assert.ok(rows().some(x => x.includes('A1')));
  await change(doc.querySelectorAll('select')[3], 'General'); assert.equal(rows().length, 1); assert.ok(rows()[0].includes('A1'));
  await change(doc.querySelectorAll('select')[3], 'ALL');
  await change(doc.querySelectorAll('select')[1], '2025'); assert.equal(rows().length, 1); assert.ok(rows()[0].includes('Old'));
  await change(doc.querySelectorAll('select')[1], '2026');
  await change(doc.querySelectorAll('select')[2], '2'); assert.equal(rows().length, 1); assert.ok(rows()[0].includes('A2'));
  await change(doc.querySelectorAll('select')[0], 'B'); assert.equal(rows().length, 1); assert.ok(rows()[0].includes('B1')); assert.match(doc.body.textContent, /Beta description/); assert.doesNotMatch(doc.body.textContent, /Alpha description/);
});
test('info server restricts publication query and preserves partial data on failure', async t => {
  let query;
  const db = Object.fromEntries(['phuongThucXetTuyen','khoiNganh','triThucAi','lichSuDiemChuan','loTrinhTuyenSinh'].map(name => [name, { findMany: async () => [] }]));
  db.nganhHoc = { count: async () => 3 }; db.chuongTrinhDaoTao = { findMany: async () => Array.from({length:4},(_,i)=>({ma_chuong_trinh:String(i),ten_chuong_trinh:'Program',nganh:{ma_nganh:'M',ten_nganh:'Major'}})) };
  db.trangNoiDung = { findMany: async q => { query = q; throw Error('DB unavailable'); } };
  t.mock.method(console, 'error', () => {});
  const component = await loader({ '@/libs/prisma': { prismaPublic: db }, './ThongTinTuyenSinhClient': { default: () => null } })('app/(main)/thong-tin-tuyen-sinh/page.tsx').default();
  assert.equal(query.where.ngay_dang.not, null); assert.ok(query.where.ngay_dang.lte instanceof Date); assert.ok(query.where.ngay_dang.lte <= new Date());
  assert.equal(component.props.totalMajors, 3); assert.equal(component.props.totalPrograms, 4); assert.deepEqual(component.props.articles, []); assert.equal(component.props.loadFailures.length, 1);
});
test('timeline server empty success and unavailable source produce distinct props', async t => {
  t.mock.method(console, 'error', () => {});
  for (const fails of [false, true]) {
    const el = await loader({ '@/libs/prisma': { prismaPublic: { loTrinhTuyenSinh: { findMany: async () => { if (fails) throw Error('offline'); return []; } } } }, './LoTrinhTuyenSinhClient': { default: () => null } })('app/(main)/lo-trinh-tuyen-sinh/page.tsx').default();
    assert.equal(el.props.loadError, fails); assert.deepEqual(el.props.dbMilestones, []);
  }
});
test('comparison forwards two or three selections and renders the selected method', async t => {
  const { doc, change } = await mount(t, 'app/(main)/so-sanh-chuong-trinh/CompareClient.tsx', { programs: ['A', 'B', 'C'].map(id => ({ ma_chuong_trinh: id, ten_chuong_trinh: id })) });
  assert.equal(doc.querySelectorAll('select').length, 3);
  await change(doc.querySelectorAll('select')[0], 'A'); await change(doc.querySelectorAll('select')[1], 'B');
  await React.act(async () => doc.querySelector('button').click());
  assert.deepEqual(compareCalls.at(-1), ['A', 'B']);
  const metrics = () => [...doc.querySelectorAll('tbody')][1].querySelectorAll('tr');
  assert.equal(metrics()[1].children[1].textContent, '24');
  assert.equal(metrics()[2].children[1].textContent, '12');
  assert.equal(doc.querySelectorAll('col').length, 3);
  assert.equal(doc.querySelector('details').open, false);
  await change(doc.querySelector('[aria-label="Phương thức so sánh"]'), 'HB');
  assert.equal(metrics()[1].children[1].textContent, '28');
  assert.equal(metrics()[2].children[1].textContent, '12');
  await change(doc.querySelectorAll('select')[2], 'C');
  assert.equal(doc.querySelector('table'), null);
  await React.act(async () => doc.querySelector('button').click()); assert.deepEqual(compareCalls.at(-1), ['A', 'B', 'C']);
  assert.equal(doc.querySelectorAll('col').length, 4);
  const columnWidths = [...doc.querySelectorAll('col')].slice(1).map(c=>c.style.width);
  assert.equal(new Set(columnWidths).size, 1);
  assert.match(columnWidths[0], /calc/);
});

test('comparison separates yearly metrics, preserves zero quota and exact-year combinations with a common chart scale', async t => {
  const history = (nam, quota, exam, transcript) => ({nam,chi_tieu:quota,diem_trung_tuyen:[{ma_phuong_thuc:'THPT',diem:exam,phuong_thuc:{ten_phuong_thuc:'Exam'}},{ma_phuong_thuc:'HB',diem:transcript,phuong_thuc:{ten_phuong_thuc:'Transcript'}}]});
  const programs = ['A','B'].map((id,index)=>({ma_chuong_trinh:id,ten_chuong_trinh:`Full program ${id} with a deliberately long name`,nganh:{ten_nganh:'Major'},ctdt_to_hop:[{nam:2025,ma_to_hop:'D01'},{nam:2026,ma_to_hop:'A00'},{nam:2026,ma_to_hop:'A00'}],lich_su_diem_chuan:[history(2025,null,null,15),history(2026,index?12:0,index?20:10,index?0:30)]}));
  const customLoad = loader({'@/actions/compare.action':{comparePrograms:async()=>programs}});
  const {doc,change}=await mount(t,'app/(main)/so-sanh-chuong-trinh/CompareClient.tsx',{programs},customLoad);
  await React.act(async()=>doc.querySelector('button').click());
  assert.match(doc.querySelector('[role=alert]').textContent,/chương trình 1/);
  await change(doc.querySelectorAll('select')[0],'A');await change(doc.querySelectorAll('select')[1],'B');
  await React.act(async()=>doc.querySelector('button').click());
  assert.deepEqual([...doc.querySelectorAll('th[scope=rowgroup]')].map(x=>x.textContent),['Năm 2026','Năm 2025']);
  const groups=[...doc.querySelectorAll('tbody')].slice(1);
  const cells=(group,row)=>[...groups[group].querySelectorAll('tr')[row].querySelectorAll('td')].map(x=>x.textContent);
  assert.deepEqual(cells(0,1),['10','20']);assert.deepEqual(cells(0,2),['0','12']);assert.deepEqual(cells(0,3),['A00','A00']);
  assert.deepEqual(cells(1,1),['Chưa có điểm','Chưa có điểm']);assert.deepEqual(cells(1,2),['Chưa có dữ liệu','Chưa có dữ liệu']);assert.deepEqual(cells(1,3),['D01','D01']);
  assert.match(doc.querySelector('thead').textContent,/Full program A with a deliberately long name/);
  const heights=()=>[...doc.querySelectorAll('details div[style]')].filter(x=>x.style.height.endsWith('%')).map(x=>Number.parseFloat(x.style.height));
  assert.equal(heights().length,2);assert.equal(heights()[1]/heights()[0],2);assert.ok(heights()[1]<100);assert.equal(doc.querySelector('details').open,false);
  await change(doc.querySelector('[aria-label="Phương thức so sánh"]'),'HB');
  assert.deepEqual(cells(0,1),['30','Chưa có điểm']);assert.deepEqual(heights(),[37.5,75,37.5]);
});

test('vertical charts align chronological missing-year slots and use an accessible shared scale above DGNL scores', async t => {
  const result = ['A','B','C'].map((id,index)=>({ma_chuong_trinh:id,ten_chuong_trinh:id,nganh:{ten_nganh:'Major'},ctdt_to_hop:[],lich_su_diem_chuan:index===2?[]:[{nam:2026,chi_tieu:1,diem_trung_tuyen:[{ma_phuong_thuc:'DGNL',diem:120,phuong_thuc:{ten_phuong_thuc:'DGNL'}}]},...(index===0?[{nam:2024,chi_tieu:1,diem_trung_tuyen:[{ma_phuong_thuc:'DGNL',diem:80,phuong_thuc:{ten_phuong_thuc:'DGNL'}}]}]:[])]}));
  const {doc,change}=await mount(t,'app/(main)/so-sanh-chuong-trinh/CompareClient.tsx',{programs:result},loader({'@/actions/compare.action':{comparePrograms:async()=>result}}));
  for(let i=0;i<3;i++)await change(doc.querySelectorAll('select')[i],result[i].ma_chuong_trinh);
  await React.act(async()=>doc.querySelector('button').click());
  const regions=[...doc.querySelectorAll('details [role=region]')];
  assert.equal(regions.length,2);assert.ok(regions.every(x=>x.tabIndex===0));
  const lists=[...doc.querySelectorAll('details ul')];
  assert.deepEqual([...lists[0].children].map(x=>x.textContent),['2024: 80','2026: 120']);
  assert.deepEqual([...lists[1].children].map(x=>x.textContent),['2024: Chưa có điểm','2026: 120']);
  const plot=region=>[...region.querySelectorAll('div[style]')].filter(x=>x.style.height.endsWith('%'));
  assert.deepEqual(plot(regions[0]).map(x=>x.style.height),['40%','60%']);
  assert.deepEqual(plot(regions[1]).map(x=>x.style.height),['60%']);
  for(const region of regions){assert.match(region.textContent,/200/);assert.match(region.textContent,/150/);assert.match(region.textContent,/100/);assert.match(region.textContent,/50/);assert.match(region.textContent,/0/);}
  assert.match(doc.querySelector('details').textContent,/Chưa có dữ liệu cho phương thức này/);
  assert.equal(doc.querySelector('details').open,false);
});
test('direct program B route selects B curriculum even when program A sorts first', async t => {
  const programs = ['A', 'B'].map(id => ({ ma_chuong_trinh: id, ten_chuong_trinh: `Program ${id}`, mo_ta_ngan: `Description ${id}`, ctdt_to_hop: [], lich_su_diem_chuan: [], hoc_phan: [{ ma_ctdt_hoc_phan: `course-${id}`, ma_hoc_phan: `course-${id}`, nam_ap_dung: 2026, hoc_ky: 1, loai: 'bat_buoc', hoc_phan: { ten_hoc_phan: `Curriculum ${id}`, so_tin_chi: 3 } }] }));
  const page = loader({ 'next/link': link, 'next/navigation': { notFound: () => { throw Error('unexpected notFound'); } }, '@/libs/prisma': { prismaPublic: { nganhHoc: { findFirst: async () => ({ ma_nganh: 'MAJOR', ten_nganh: 'Major' }) }, chuongTrinhDaoTao: { findMany: async query => query.where.ma_nganh ? programs : [] } } } })('app/(main)/tra-cuu-nganh-hoc/[id]/page.tsx').default;
  const findClient = element => {
    if (!element || typeof element !== 'object') return null;
    if (element.props?.programs) return element;
    const children = element.props?.children;
    for (const child of Array.isArray(children) ? children : [children]) { const found = findClient(child); if (found) return found; }
    return null;
  };
  const target = findClient(await page({ params: Promise.resolve({ id: 'B' }) }));
  assert.ok(target); assert.equal(target.props.initialProgramId, 'B'); assert.equal(target.key, 'B'); assert.equal(target.props.programs[0].ma_chuong_trinh, 'A');
  const { doc } = await mount(t, 'app/(main)/tra-cuu-nganh-hoc/[id]/ChiTietNganhClient.tsx', target.props);
  assert.equal(doc.querySelector('select').value, 'B'); assert.match(doc.body.textContent, /Description B/); assert.doesNotMatch(doc.body.textContent, /Description A/); assert.match(doc.querySelector('tbody').textContent, /Curriculum B/); assert.doesNotMatch(doc.querySelector('tbody').textContent, /Curriculum A/);
  const majorTarget = findClient(await page({ params: Promise.resolve({ id: 'MAJOR' }) }));
  assert.equal(majorTarget.props.initialProgramId, 'A'); assert.equal(majorTarget.key, 'MAJOR');
});
test('invalid initial program prop safely falls back to first available program', async t => {
  const { doc } = await mount(t, 'app/(main)/tra-cuu-nganh-hoc/[id]/ChiTietNganhClient.tsx', { major: { ma_nganh: 'MAJOR', ten_nganh: 'Major' }, programs: [{ ma_chuong_trinh: 'A', ten_chuong_trinh: 'Alpha', mo_ta_ngan: 'Alpha description' }], initialProgramId: 'UNKNOWN', combinations: [], scoreHistory: [] });
  assert.equal(doc.querySelector('select').value, 'A'); assert.match(doc.body.textContent, /Alpha description/);
});

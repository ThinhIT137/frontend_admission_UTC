const { test } = require('node:test');
const assert = require('node:assert/strict');
const React = require('react');
const { JSDOM } = require('jsdom');
const { loader } = require('./helpers.cjs');
const link = { __esModule: true, default: ({ children, ...props }) => React.createElement('a', props, children) };
const compareCalls = [];
const load = loader({ 'next/link': link, 'next/navigation': { usePathname: () => '/so-sanh-chuong-trinh' }, '@/actions/compare.action': { comparePrograms: async ids => { compareCalls.push(ids); if (new Set(ids).size < 2) throw Error('Chọn 2–3 chương trình'); return ids.map(id => ({ ma_chuong_trinh: id, ten_chuong_trinh: id, nganh: { ten_nganh: 'Major' }, ctdt_to_hop: [], lich_su_diem_chuan: [{ nam: 2026, chi_tieu: 12, diem_trung_tuyen: [{ ma_phuong_thuc: 'THPT', diem: 24, phuong_thuc: { ten_phuong_thuc: 'THPT' } }, { ma_phuong_thuc: 'HB', diem: 28, phuong_thuc: { ten_phuong_thuc: 'Học bạ' } }] }] })); } } });
const data = load('components/admission/admission-data.ts');
async function mount(t, file, props) {
  const dom = new JSDOM('<div id="root"></div>', { url: 'http://localhost' });
  const restore = [];
  for (const [key, value] of Object.entries({ window: dom.window, document: dom.window.document, IS_REACT_ACT_ENVIRONMENT: true })) {
    const old = Object.getOwnPropertyDescriptor(global, key);
    Object.defineProperty(global, key, { value, configurable: true, writable: true });
    restore.push(() => old ? Object.defineProperty(global, key, old) : delete global[key]);
  }
  const root = require('react-dom/client').createRoot(dom.window.document.getElementById('root'));
  const module = load(file);
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
  db.nganhHoc = { count: async () => 3 }; db.chuongTrinhDaoTao = { count: async () => 4 };
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
  assert.match(doc.querySelector('tbody').textContent, /24 \/ 12/);
  await change(doc.querySelector('[aria-label="Phương thức so sánh"]'), 'HB'); assert.match(doc.querySelector('tbody').textContent, /28 \/ 12/); assert.doesNotMatch(doc.querySelector('tbody').textContent, /24 \/ 12/);
  await change(doc.querySelectorAll('select')[2], 'C'); await React.act(async () => doc.querySelector('button').click()); assert.deepEqual(compareCalls.at(-1), ['A', 'B', 'C']);
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

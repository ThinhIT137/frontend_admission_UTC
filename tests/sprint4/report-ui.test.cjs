const { test } = require('node:test');
const assert = require('node:assert/strict');
const React = require('react');
const { JSDOM } = require('jsdom');
const { loader } = require('../sprint1/helpers.cjs');

async function mount(t, candidates) {
  const dom = new JSDOM('<!doctype html><div id="root"></div>', { url: 'http://localhost' });
  const restores = [];
  for (const [key, value] of Object.entries({ window: dom.window, document: dom.window.document, IS_REACT_ACT_ENVIRONMENT: true })) {
    const old = Object.getOwnPropertyDescriptor(global, key);
    Object.defineProperty(global, key, { value, writable: true, configurable: true });
    restores.push(() => old ? Object.defineProperty(global, key, old) : delete global[key]);
  }
  const { createRoot } = require('react-dom/client');
  const root = createRoot(dom.window.document.getElementById('root'));
  const Component = loader({ 'next/link': { __esModule: true, default: ({ children, ...props }) => React.createElement('a', props, children) } })('app/admin/(dashboard)/bao-cao-trung-tuyen/BaoCaoClient.tsx').default;
  await React.act(async () => root.render(React.createElement(Component, { admissionYear: 2026, reportDate: '18/10/2026', candidates,
    programs: [{ maChuongTrinh: 'P1', tenChuongTrinh: 'Test program' }], methods: [{ maPhuongThuc: 'HB', tenPhuongThuc: 'Hoc ba' }] })));
  t.after(async () => { await React.act(async () => root.unmount()); dom.window.close(); restores.forEach(fn => fn()); });
  return { doc: dom.window.document, window: dom.window };
}
const candidate = (id, status = 'CHO_XAC_NHAN') => ({ stt: 1, maHoSo: id, cccd: '000000000001', hoTen: '=TEST("csv")',
  ngaySinh: '', gioiTinh: '', soDienThoai: '0900000001', khuVuc: 'KV3', doiTuongUuTien: '', maChuongTrinh: 'P1',
  tenChuongTrinh: 'Test program', maPhuongThuc: 'HB', tenPhuongThuc: 'Hoc ba', maToHop: 'A00', diemXetTuyen: 27,
  diemChuanNganh: 25, trangThai: status, ngayNop: '18/10/2026' });
test('S4 report status filter changes actual rendered rows', async t => {
  const { doc, window } = await mount(t, [candidate('WAIT'), candidate('PASS', 'TRUNG_TUYEN_SO_BO')]);
  const select = [...doc.querySelectorAll('select')].find(s => [...s.options].some(o => o.value === 'TRUNG_TUYEN_SO_BO'));
  assert.ok(select);
  await React.act(async () => { select.value = 'TRUNG_TUYEN_SO_BO'; select.dispatchEvent(new window.Event('change', { bubbles: true })); });
  assert.match(doc.querySelector('tbody').textContent, /PASS/);
  assert.doesNotMatch(doc.querySelector('tbody').textContent, /WAIT/);
});
test('S4 CSV export escapes formulas/quotes, preserves zeros, and releases blob URL', async t => {
  const { doc, window } = await mount(t, [candidate('CSV-TEST')]);
  let exported;
  t.mock.method(URL, 'createObjectURL', blob => { exported = blob; return 'blob:test'; });
  const revoke = t.mock.method(URL, 'revokeObjectURL', () => {});
  const click = t.mock.method(window.HTMLAnchorElement.prototype, 'click', () => {});
  const button = [...doc.querySelectorAll('button')].find(b => /Excel|CSV/i.test(b.textContent));
  assert.ok(button);
  await React.act(async () => button.click());
  const raw = Buffer.from(await exported.arrayBuffer());
  assert.deepEqual([...raw.subarray(0, 3)], [0xef, 0xbb, 0xbf]);
  const csv = raw.toString('utf8');
  assert.ok(csv.includes('"\'000000000001"'));
  assert.ok(csv.includes('"\'=TEST(""csv"")"'));
  assert.equal(click.mock.callCount(), 1);
  assert.equal(revoke.mock.calls[0].arguments[0], 'blob:test');
});
test('S4 PDF button invokes browser print', async t => {
  const { doc, window } = await mount(t, []);
  const print = t.mock.method(window, 'print', () => {});
  const button = [...doc.querySelectorAll('button')].find(b => /PDF/i.test(b.textContent));
  assert.ok(button);
  await React.act(async () => button.click());
  assert.equal(print.mock.callCount(), 1);
});

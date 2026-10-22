const { test, mock } = require('node:test');
const assert = require('node:assert/strict');
const { loader } = require('../sprint1/helpers.cjs');
test('S3 admission timeline passes chronological DB milestones and reference time to client', async () => {
  const rows = [{ ma_su_kien: 'TEST', ten_su_kien: 'Test milestone', thoi_gian_bat_dau: new Date('2026-01-01') }];
  const findMany = mock.fn(async () => rows);
  const page = loader({ '@/libs/prisma': { prismaPublic: { loTrinhTuyenSinh: { findMany } } },
    './LoTrinhTuyenSinhClient': { __esModule: true, default: () => null } })('app/(main)/lo-trinh-tuyen-sinh/page.tsx').default;
  const result = await page();
  assert.deepEqual(result.props.dbMilestones, rows);
  assert.equal(result.props.loadError, false);
  assert.ok(Number.isFinite(Date.parse(result.props.referenceTime)));
  assert.ok(Math.abs(Date.now() - Date.parse(result.props.referenceTime)) < 5000);
  assert.deepEqual(findMany.mock.calls[0].arguments[0].orderBy, { thoi_gian_bat_dau: 'asc' });
});
test('S3 news administration maps persisted article content and publication state', async () => {
  const page = loader({ '@/libs/prisma': { __esModule: true, default: { trangNoiDung: { findMany: async () => [
    { ma_bai_viet: 'TEST', tieu_de: 'Test news', chuyen_muc: 'TIN TỨC', noi_dung_html: '<p>Test</p>', ngay_dang: null },
  ] } } }, './TinTucDeAnClient': { __esModule: true, default: () => null } })('app/admin/(dashboard)/tin-tuc-de-an/page.tsx').default;
  const result = (await page()).props.initialData[0];
  assert.equal(result.id, 'TEST'); assert.equal(result.content, '<p>Test</p>'); assert.equal(result.status, 'DRAFT');
});
test('S3 knowledge administration loads DB content rather than fallback when rows exist', async () => {
  const rows = [{ ma_tri_thuc: 'TEST', noi_dung: 'Test knowledge', trang_thai: 'active' }];
  const page = loader({ '@/libs/api-services/backend.server': { backendRequest: async () => ({ data: rows }) },
    './ChatbotKbClient': { __esModule: true, default: () => null } })('app/admin/(dashboard)/du-lieu-chatbot-ai/page.tsx').default;
  assert.deepEqual((await page()).props.initialData, rows);
});
test('S3 career result page renders API result client instead of generating a default personality', async () => {
  const Component = () => null;
  const page = loader({ './ApiResultClient': { __esModule: true, default: Component } })('app/(main)/ket-qua-tu-van/page.tsx').default;
  assert.equal(page().props.children.type, Component);
});

const { test, mock } = require('node:test');
const assert = require('node:assert/strict');
const { loader } = require('../sprint1/helpers.cjs');
function fixture(handler) {
  const request = mock.fn(handler);
  const load = loader({ '@/libs/api-services/backend.server': { backendRequest: request } });
  return { request, submit: load('app/(main)/nop-ho-so/submit-api.server.ts').submitApplication };
}
const payload = { cccd: '000000000001', ma_chuong_trinh: 'P1', ma_phuong_thuc: 'HB', ma_to_hop: 'A00', nam_tuyen_sinh: 2026, nguyen_vong: 1,
 bang_diem: [{ loai_diem: 'lop_12', nam_hoc: 2026, diem_mon: [{ ma_mon: 'TOAN', diem_so: 9 }] }], chung_chi: [] };
test('Submission forwards real evidence to score API and derives identity from candidate session', async () => {
  const f=fixture(async (_,path) => path.includes('/me') ? { cccd: payload.cccd } : { ma_ho_so: 'H1' });
  assert.equal((await f.submit(payload)).maHoSo, 'H1');
  const [service,path,options]=f.request.mock.calls[1].arguments;
  assert.equal(service,'score'); assert.equal(path,'/ho-so'); assert.equal(options.auth,'candidate');
  assert.deepEqual(options.body.bang_diem,payload.bang_diem); assert.equal(options.body.cccd,undefined);
});
test('Submission rejects identity mismatch and foreign evidence before writing', async () => {
  const f=fixture(async () => ({ cccd: payload.cccd }));
  assert.equal((await f.submit({...payload,cccd:'000000000002'})).success,false);
  assert.equal((await f.submit({...payload,chung_chi:[{loai_chung_chi:'IELTS',diem_hoac_hang:'6.5',file_dinh_kem:'000000000002/file.pdf'}]})).success,false);
  assert.equal(f.request.mock.callCount(),2);
});
test('Submission exposes backend failure without a local database fallback',async()=>{
  const f=fixture(async()=>{throw Error('backend unavailable')}); assert.equal((await f.submit(payload)).success,false);
});

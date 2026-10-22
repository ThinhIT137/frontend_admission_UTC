// Synthetic data only. Run against the dedicated local admission_test database.
const { Client } = require('pg');
const bcrypt = require('bcryptjs');
const TEST_DATABASE_URL = 'postgresql://admission_test:admission_test_local@127.0.0.1:55439/admission_test?sslmode=disable';
async function seed() {
  const url = new URL(process.env.TEST_DATABASE_URL || TEST_DATABASE_URL);
  if (!['localhost', '127.0.0.1'].includes(url.hostname) || url.pathname !== '/admission_test') {
    throw Error('Seed only supports localhost/admission_test; production DATABASE_URL is never used.');
  }
  const db = new Client({ connectionString: url.toString() });
  await db.connect();
  const put = async (table, key, row) => {
    const cols = Object.keys(row);
    const updates = cols.filter(c => c !== key).map(c => `"${c}"=EXCLUDED."${c}"`).join(',');
    await db.query(`INSERT INTO "${table}" (${cols.map(c => `"${c}"`).join(',')}) VALUES (${cols.map((_, i) => '$' + (i + 1)).join(',')}) ON CONFLICT ("${key}") DO UPDATE SET ${updates}`, Object.values(row));
  };
  try {
    await db.query('BEGIN');
    const password = await bcrypt.hash('SprintTest!2026', 10);
    for (const role of ['super_admin', 'chuyen_vien']) {
      await put('vai_tro', 'ma_vai_tro', { ma_vai_tro: `TEST-${role}`, ten_vai_tro: role, mo_ta: 'Synthetic test role' });
      await put('admin', 'ma_admin', { ma_admin: `TEST-${role}`, ho_ten: `Test ${role}`, email: `${role}@example.invalid`, mat_khau: password, ma_vai_tro: `TEST-${role}` });
    }
    const admin = 'TEST-super_admin';
    await put('khoi_nganh', 'ma_khoi_nganh', { ma_khoi_nganh: 'TEST-KHOA', ten_khoi_nganh: 'Khoa Công nghệ TEST' });
    for (const [code, name] of [['TOAN', 'Toán'], ['LY', 'Vật lý'], ['HOA', 'Hóa học'], ['ANH', 'Tiếng Anh']])
      await put('danh_muc_mon_hoc', 'ma_mon', { ma_mon: code, ten_mon: name });
    for (const [code, third] of [['A00', 'HOA'], ['A01', 'ANH']])
      await put('to_hop_xet_tuyen', 'ma_to_hop', { ma_to_hop: code, ma_mon_1: 'TOAN', ma_mon_2: 'LY', ma_mon_3: third });
    for (const [code, name] of [['PT100', 'Thi THPT'], ['PT200', 'Học bạ'], ['PT402', 'ĐGNL'], ['CC', 'Chứng chỉ'], ['GT', 'Giải thưởng']])
      await put('phuong_thuc_xet_tuyen', 'ma_phuong_thuc', { ma_phuong_thuc: code, ten_phuong_thuc: name });
    const year = new Date().getFullYear();
    for (const [code, name] of [['GHA14', 'Công nghệ thông tin TEST'], ['TEST02', 'Kỹ thuật TEST']]) {
      await put('nganh_hoc', 'ma_nganh', { ma_nganh: code, ten_nganh: name, ma_admin_quan_ly: admin, ma_khoi_nganh: 'TEST-KHOA' });
      await put('chuong_trinh_dao_tao', 'ma_chuong_trinh', { ma_chuong_trinh: code, ma_nganh: code, ten_chuong_trinh: name, ma_admin_quan_ly: admin, de_cuong: 'Đề cương mẫu kiểm thử', mo_ta_ngan: 'Dữ liệu tổng hợp dành riêng cho test', chuan_dau_ra: ['KY_SU'] });
      for (const y of [year - 2, year - 1, year]) {
        await put('lich_su_diem_chuan', 'ma_ls_dc', { ma_ls_dc: `${code}-${y}`, ma_chuong_trinh: code, nam: y, chi_tieu: 100, ma_admin_cap_nhat: admin });
        await put('diem_trung_tuyen', 'ma_diem_tt', { ma_diem_tt: `${code}-${y}-PT100`, ma_ls_dc: `${code}-${y}`, ma_phuong_thuc: 'PT100', diem: 25 });
        await put('ctdt_to_hop', 'ma_ctdt_to_hop', { ma_ctdt_to_hop: `${code}-${y}-A00`, ma_chuong_trinh: code, ma_to_hop: 'A00', nam: y });
      }
    }
    for (const [i, state, result] of [[1, 'cho', null], [2, 'hop_le', 'Đủ điều kiện (đã công bố)'], [3, 'tu_choi', 'Không đủ điều kiện (đã công bố)']]) {
      const cccd = String(i).padStart(12, '0');
      await put('thi_sinh', 'cccd', { cccd, ho_ten: `Thí sinh TEST ${i}`, so_dien_thoai: `090000000${i}`, khu_vuc: 'KV3' });
      await put('nguyen_vong_sinh_vien', 'ma_ho_so', { ma_ho_so: `TEST-HS${i}`, cccd, ma_chuong_trinh: 'GHA14', ma_phuong_thuc: 'PT100', ma_to_hop: 'A00', trang_thai: state, ket_qua: result, nguon_du_lieu: 'tu_nop', nguyen_vong: 1, nam_tuyen_sinh: year, tong_diem_xet_tuyen: 29 - i });
      await put('bang_diem', 'ma_bang_diem', { ma_bang_diem: `TEST-BD${i}`, cccd, loai_diem: 'lop_12', nam_hoc: year });
      for (const subject of ['TOAN', 'LY', 'HOA']) await put('diem_chi_tiet', 'ma_chi_tiet', { ma_chi_tiet: `TEST-${i}-${subject}`, ma_bang_diem: `TEST-BD${i}`, ma_mon: subject, diem_so: 9 - i / 2 });
    }
    await put('chung_chi', 'ma_chung_chi', { ma_chung_chi: 'TEST-IELTS', cccd: '000000000001', loai_chung_chi: 'IELTS', diem_hoac_hang: '7.0', file_dinh_kem: 'synthetic-test.pdf' });
    await put('giai_thuong', 'ma_giai_thuong', { ma_giai_thuong: 'TEST-AWARD', cccd: '000000000001', giai_thuong: 'giai_nhi', loai_giai_thuong: 'tinh', mon_hoc: 'toan' });
    await put('lo_trinh_tuyen_sinh', 'ma_su_kien', { ma_su_kien: 'TEST-EVENT', ten_su_kien: 'Công bố kết quả TEST', thoi_gian_bat_dau: new Date(Date.now() - 86400000), thoi_gian_ket_thuc: new Date(Date.now() + 86400000), ma_admin_cap_nhat: admin });
    await put('trang_noi_dung', 'ma_bai_viet', { ma_bai_viet: 'TEST-NEWS', tieu_de: 'Tin tuyển sinh TEST', noi_dung_html: '<p>Nội dung kiểm thử</p>', chuyen_muc: 'TIN TỨC', ma_admin_tac_gia: admin, ngay_dang: new Date() });
    await put('tri_thuc_ai', 'ma_tri_thuc', { ma_tri_thuc: 'TEST-KNOWLEDGE', chu_de: 'Học phí TEST', cau_hoi_mau: 'Học phí test là bao nhiêu?', noi_dung: 'Đây là dữ liệu tổng hợp để kiểm thử chatbot.', ma_admin_phu_trach: admin });
    // Copied from the AI service's bundled question bank; preserve IDs and dimensions.
    const questions = require('./mbti-questions.json');
    for (const q of questions) await put('cau_hoi_mbti', 'id', { id: q.id, noi_dung: q.text,
      chieu_do: q.dimension, chieu_tich_cuc: q.positive_trait, linh_vuc_ngu_canh: q.context_field, trang_thai: 'active' });
    await db.query('COMMIT');
    console.log(`Seeded synthetic admission data (${year}) and ${questions.length} MBTI questions.`);
  } catch (err) { await db.query('ROLLBACK'); throw err; }
  finally { await db.end(); }
}
if (require.main === module) seed().catch(err => { console.error(err.message); process.exitCode = 1; });
module.exports = { seed, TEST_DATABASE_URL };

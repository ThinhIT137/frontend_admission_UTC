const { test } = require('node:test');
const assert = require('node:assert/strict');
const { Client } = require('pg');
const { seed, TEST_DATABASE_URL } = require('../fixtures/seed.cjs');
async function connection(t) {
  const db = new Client({ connectionString: TEST_DATABASE_URL });
  await db.connect(); t.after(() => db.end()); return db;
}
test('DB seed is repeatable and creates complete linked records', async t => {
  await seed(); await seed();
  const db = await connection(t);
  const { rows } = await db.query(`SELECT h.ma_ho_so, t.ho_ten, p.ten_chuong_trinh, m.ten_phuong_thuc
    FROM nguyen_vong_sinh_vien h JOIN thi_sinh t USING(cccd)
    JOIN chuong_trinh_dao_tao p USING(ma_chuong_trinh) JOIN phuong_thuc_xet_tuyen m USING(ma_phuong_thuc)
    WHERE h.ma_ho_so LIKE 'TEST-HS%'`);
  assert.equal(rows.length, 3);
  assert.ok(rows.every(r => r.ho_ten && r.ten_chuong_trinh && r.ten_phuong_thuc));
  assert.equal(Number((await db.query('SELECT count(*) FROM cau_hoi_mbti')).rows[0].count), 20);
});
test('DB PostgreSQL rejects missing program foreign key and rolls back', async t => {
  const db = await connection(t);
  await db.query('BEGIN');
  try {
    await assert.rejects(db.query("UPDATE nguyen_vong_sinh_vien SET ma_chuong_trinh='DOES-NOT-EXIST' WHERE ma_ho_so='TEST-HS1'"), err => err.code === '23503');
  } finally { await db.query('ROLLBACK'); }
  assert.equal((await db.query("SELECT ma_chuong_trinh FROM nguyen_vong_sinh_vien WHERE ma_ho_so='TEST-HS1'")).rows[0].ma_chuong_trinh, 'GHA14');
});
test('DB duplicate yearly program quota is rejected', async t => {
  const db = await connection(t);
  await db.query('BEGIN');
  try {
    await assert.rejects(db.query(`INSERT INTO lich_su_diem_chuan(ma_ls_dc,ma_chuong_trinh,nam,chi_tieu,ma_admin_cap_nhat)
      SELECT 'TEST-DUPLICATE',ma_chuong_trinh,nam,chi_tieu,ma_admin_cap_nhat FROM lich_su_diem_chuan LIMIT 1`), err => err.code === '23505');
  } finally { await db.query('ROLLBACK'); }
});

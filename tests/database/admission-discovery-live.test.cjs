const { test } = require('node:test');
const assert = require('node:assert/strict');
const { randomUUID } = require('node:crypto');
const { Client } = require('pg');
require('dotenv').config({ path: '.env', quiet: true });

// Explicit opt-in only: real INSERT/SELECT/DELETE inside a transaction, then rollback.
// No seed, migrations, or writes to existing records.
test('real admission publication/timeline writes, reads, exact cleanup', { skip: process.env.RUN_ADMISSION_DISCOVERY_DB !== '1' }, async () => {
  const db = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false }, connectionTimeoutMillis: 15000 });
  const ids = Array.from({ length: 4 }, () => `CODEX-1-1-${randomUUID()}`);
  let connected = false;
  try {
    await db.connect(); connected = true;
    await db.query('BEGIN');
    const author = (await db.query('SELECT ma_admin FROM admin LIMIT 1')).rows[0]?.ma_admin;
    assert.ok(author, 'Existing admin required; test never creates or modifies admin');
    const now = new Date();
    for (const [i, date] of [new Date(now.getTime() - 60000), null, new Date(now.getTime() + 86400000)].entries()) {
      await db.query('INSERT INTO trang_noi_dung (ma_bai_viet,tieu_de,noi_dung_html,chuyen_muc,ma_admin_tac_gia,ngay_dang) VALUES ($1,$2,$3,$4,$5,$6)', [ids[i], `CODEX section 1.1 ${i}`, '<p>Isolated validation</p>', 'TIN TỨC', author, date]);
    }
    assert.equal((await db.query('SELECT ma_bai_viet FROM trang_noi_dung WHERE ma_bai_viet = ANY($1::text[])', [ids.slice(0, 3)])).rowCount, 3);
    const published = await db.query('SELECT ma_bai_viet FROM trang_noi_dung WHERE ma_bai_viet = ANY($1::text[]) AND ngay_dang IS NOT NULL AND ngay_dang <= $2 ORDER BY ngay_dang DESC', [ids.slice(0, 3), now]);
    assert.deepEqual(published.rows.map(row => row.ma_bai_viet), [ids[0]]);
    await db.query('INSERT INTO lo_trinh_tuyen_sinh (ma_su_kien,ten_su_kien,thoi_gian_bat_dau,thoi_gian_ket_thuc,ghi_chu,ma_admin_cap_nhat) VALUES ($1,$2,$3,$4,$5,$6)', [ids[3], 'CODEX section 1.1 timeline', now, new Date(now.getTime() + 86400000), 'Isolated validation', author]);
    assert.equal((await db.query('SELECT ma_su_kien FROM lo_trinh_tuyen_sinh WHERE ma_su_kien=$1', [ids[3]])).rowCount, 1);
    assert.equal((await db.query('DELETE FROM trang_noi_dung WHERE ma_bai_viet=ANY($1::text[]) RETURNING ma_bai_viet', [ids.slice(0, 3)])).rowCount, 3);
    assert.equal((await db.query('DELETE FROM lo_trinh_tuyen_sinh WHERE ma_su_kien=$1 RETURNING ma_su_kien', [ids[3]])).rowCount, 1);
    await db.query('ROLLBACK');
    assert.equal((await db.query('SELECT ma_bai_viet FROM trang_noi_dung WHERE ma_bai_viet=ANY($1::text[])', [ids.slice(0, 3)])).rowCount, 0);
    assert.equal((await db.query('SELECT ma_su_kien FROM lo_trinh_tuyen_sinh WHERE ma_su_kien=$1', [ids[3]])).rowCount, 0);
    console.log('Created/read/deleted 3 articles + 1 milestone; rollback and absence verified:', ids.join(', '));
  } catch (error) {
    // Avoid emitting database URLs or server error details containing credentials.
    throw new Error(`Live DB validation failed (${error.code || error.name}); ${error instanceof assert.AssertionError ? error.message : 'connection/query failure'}`);
  } finally {
    if (connected) await db.query('ROLLBACK').catch(() => {});
    await db.end();
  }
});

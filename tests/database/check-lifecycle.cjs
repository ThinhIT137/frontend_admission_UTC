const fs = require('node:fs');
const path = require('node:path');
const { Client } = require('pg');
const { TEST_DATABASE_URL } = require('../fixtures/seed.cjs');
const url = new URL(TEST_DATABASE_URL);
if (!['127.0.0.1','localhost'].includes(url.hostname) || url.pathname !== '/admission_test') throw Error('Chỉ chạy trên DB test local');
(async () => {
  const db = new Client({ connectionString: TEST_DATABASE_URL }); await db.connect();
  try {
    const folder = path.resolve(__dirname, '../../../backend_admission/backend_application_score/migrations');
    for (const file of ['20261020_candidate_credentials.sql','20261019_admission_workflow.sql','20261020_profile_lifecycle.sql']) await db.query(fs.readFileSync(path.join(folder,file),'utf8'));
    // Repeat verifies migration is safe to re-run on the local test schema.
    await db.query(fs.readFileSync(path.join(folder,'20261020_profile_lifecycle.sql'),'utf8'));
    const result = await db.query("SELECT udt_name FROM information_schema.columns WHERE table_name='nguyen_vong_sinh_vien' AND column_name='trang_thai'");
    if (result.rows[0]?.udt_name !== 'trang_thai_ho_so') throw Error('Sai enum hồ sơ');
    console.log('PASS: migration local và chạy lặp, enum trang_thai_ho_so');
  } finally { await db.end(); }
})().catch(error => { console.error(error); process.exitCode=1; });

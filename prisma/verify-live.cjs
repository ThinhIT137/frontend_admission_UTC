// Read-only verification. Never prints connection strings, passwords, tokens or applicant records.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { Client } = require('pg');
const dotenv = require('dotenv');
const root = path.resolve(__dirname,'..');
const front = dotenv.parse(fs.readFileSync(path.join(root,'.env')));
const score = dotenv.parse(fs.readFileSync(path.resolve(root,'../backend_admission/backend_application_score/.env')));
const output = path.resolve(root,'../docs/supabase-audit');
function project(value) {
  const u = new URL(value);
  return `${u.username.split('.').slice(1).join('.') || u.hostname}:${u.pathname}`;
}
(async()=>{
  const connectionString = front.DIRECT_URL;
  const runtime = score.DATABASE_URL || score.database_url;
  const same = project(connectionString) === project(runtime);
  console.log('Next.js và backend điểm cùng database:',same);
  if (!same) throw Error('Khác database; không thể xác nhận migration cho backend điểm.');
  const backendSecret = score.JWT_ACCESSTOKEN || score.jwt_secret || score.JWT_SECRET;
  console.log('JWT access secret hai service khớp:',!!backendSecret && backendSecret===front.JWT_ACCESSTOKEN);
  const db = new Client({connectionString,connectionTimeoutMillis:15000,statement_timeout:30000}); await db.connect();
  try {
    const tables = await db.query("SELECT tablename FROM pg_tables WHERE schemaname='public' ORDER BY tablename");
    const counts={};
    for (const {tablename} of tables.rows) {
      if (tablename.startsWith('_')) continue;
      counts[tablename]=(await db.query(`SELECT count(*)::text AS n FROM public."${tablename.replaceAll('"','""')}"`)).rows[0].n;
    }
    const rows = await db.query('SELECT ma_ho_so,trang_thai::text FROM public.nguyen_vong_sinh_vien ORDER BY ma_ho_so');
    const hash=crypto.createHash('sha256').update(JSON.stringify(rows.rows)).digest('hex');
    const snapshot={at:new Date().toISOString(),counts,profile_status_fingerprint:hash};
    const mode=process.argv[2];
    if (!['before','after'].includes(mode)) throw Error('Chọn before hoặc after');
    if (mode==='after') {
      const previous=JSON.parse(fs.readFileSync(path.join(output,'migration-20261020-before.json')));
      for (const [table,count] of Object.entries(previous.counts)) if (counts[table]!==count) throw Error('Số dòng đã thay đổi: '+table);
      if (previous.profile_status_fingerprint!==hash) throw Error('Trạng thái hồ sơ đã thay đổi');
      console.log('PASS: giữ nguyên số dòng các bảng cũ và trạng thái từng hồ sơ.');
    }
    fs.writeFileSync(path.join(output,`migration-20261020-${mode}.json`),JSON.stringify(snapshot,null,2));
    console.log('Đã lưu snapshot kiểm tra chỉ gồm số lượng và fingerprint, không có dữ liệu cá nhân.');
  } finally {await db.end();}
})().catch(error=>{console.error('Không hoàn thành kiểm tra:',error.message.replace(/postgres(?:ql)?:\/\/\S+/g,'[ẨN URL]'));process.exitCode=1;});

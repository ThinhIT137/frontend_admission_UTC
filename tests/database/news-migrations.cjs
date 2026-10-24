// Explicitly invoked isolated PostgreSQL migration audit; never reads production .env.
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const {randomUUID,createHash}=require('node:crypto');
const {spawnSync}=require('node:child_process');
const {Client}=require('pg');
const root=path.resolve(__dirname,'../..');
const output=path.join(root,'tests/artifacts/news-migration');
fs.mkdirSync(output,{recursive:true});
const runId=randomUUID().replaceAll('-','');
const databases=['replay','invalid','hotfix','shadow'].map(kind=>`admission_news_migration_${kind}_${runId}`);
const localBase='postgresql://admission_test:admission_test_local@127.0.0.1:55439/';
const url=name=>localBase+name+'?sslmode=disable';
const migrationRoot=path.join(root,'prisma/migrations');
const names=fs.readdirSync(migrationRoot).filter(n=>fs.existsSync(path.join(migrationRoot,n,'migration.sql'))).sort();
const reconcile='20261023000000_reconcile_existing_catalog';
const news='20261023020000_add_tin_tuc';
const old=names.filter(n=>n<reconcile);
const sql=name=>fs.readFileSync(path.join(migrationRoot,name,'migration.sql'),'utf8');
const manifest={runId,databases,created:[],removed:[],checks:[]};
const manifestPath=path.join(output,`manifest-${runId}.json`);
const save=()=>fs.writeFileSync(manifestPath,JSON.stringify(manifest,null,2));
save();
function ok(label){manifest.checks.push(label);save();console.log('PASS '+label);}
function cli(args,db=databases[0]){
  assert(databases.includes(db));
  const config=path.join(output,`config-${runId}.ts`);
  fs.writeFileSync(config,`import { defineConfig } from 'prisma/config';\nexport default defineConfig({schema:${JSON.stringify(path.join(root,'prisma/schema.prisma'))},migrations:{path:${JSON.stringify(migrationRoot)}},datasource:{url:${JSON.stringify(url(db))},shadowDatabaseUrl:${JSON.stringify(url(databases[3]))}}});\n`);
  const result=spawnSync(process.execPath,[path.join(root,'node_modules/prisma/build/index.js'),...args,'--config',config],{cwd:root,encoding:'utf8',windowsHide:true,env:{...process.env,DATABASE_URL:url(db),DIRECT_URL:url(db),SHADOW_DATABASE_URL:url(databases[3])}});
  fs.appendFileSync(path.join(output,`cli-${runId}.log`),JSON.stringify(args)+'\n'+result.stdout+result.stderr+'\nexit='+result.status+'\n');
  assert.equal(result.status,0,`${args.join(' ')} failed: ${result.stdout} ${result.stderr}`);
  return result.stdout;
}
async function connect(db){const c=new Client({connectionString:url(db)});await c.connect();return c;}
async function history(c){
  await c.query('CREATE TABLE "_prisma_migrations" (id VARCHAR(36) PRIMARY KEY,checksum VARCHAR(64) NOT NULL,finished_at TIMESTAMPTZ,migration_name VARCHAR(255) NOT NULL,logs TEXT,rolled_back_at TIMESTAMPTZ,started_at TIMESTAMPTZ NOT NULL DEFAULT now(),applied_steps_count INTEGER NOT NULL DEFAULT 0)');
  for(const n of old){await c.query(sql(n));await c.query('INSERT INTO "_prisma_migrations"(id,checksum,finished_at,migration_name,applied_steps_count) VALUES($1,$2,now(),$3,1)',[randomUUID(),createHash('sha256').update(sql(n)).digest('hex'),n]);}
}
async function seed(c,value='CU_NHAN'){
  await c.query("INSERT INTO admin(ma_admin,ho_ten,email,mat_khau,vai_tro) VALUES('a','Admin','a@example.invalid','not-a-login','super_admin'),('b','Staff','b@example.invalid','not-a-login','chuyen_vien')");
  await c.query("INSERT INTO nganh_hoc(ma_nganh,ten_nganh,ma_admin_quan_ly) VALUES('n','Migration fixture','a')");
  await c.query("INSERT INTO trang_noi_dung(ma_bai_viet,tieu_de,noi_dung_html,chuyen_muc,ma_admin_tac_gia) VALUES('legacy','Existing article','<p>Preserve verbatim</p>','tin_tuc','a')");
  for(const [id,v] of [['p',value],['empty',''],['null',null]])await c.query('INSERT INTO chuong_trinh_dao_tao(ma_chuong_trinh,ma_nganh,ten_chuong_trinh,ma_admin_quan_ly,chuan_dau_ra) VALUES($1,\'n\',$1,\'a\',$2)',[id,v]);
}
async function newsChecks(c){
  assert.deepEqual((await c.query("SELECT tieu_de,noi_dung_html,chuyen_muc,ma_admin_tac_gia FROM trang_noi_dung WHERE ma_bai_viet='legacy'")).rows,[{tieu_de:'Existing article',noi_dung_html:'<p>Preserve verbatim</p>',chuyen_muc:'tin_tuc',ma_admin_tac_gia:'a'}]);
  assert.equal((await c.query('SELECT count(*)::int AS n FROM tin_tuc')).rows[0].n,0);
  const defaults=(await c.query("INSERT INTO tin_tuc(tieu_de,slug,noi_dung,chuyen_muc,updated_at,ma_admin) VALUES('Defaults','defaults','{\"type\":\"doc\"}','tin_tuc',now(),'a') RETURNING id,trang_thai,ghim,luot_xem,created_at,noi_dung")).rows[0];
  assert.equal(typeof defaults.id,'string');assert.equal(defaults.trang_thai,'nhap');assert.equal(defaults.ghim,false);assert.equal(defaults.luot_xem,0);assert(defaults.created_at instanceof Date);assert.deepEqual(defaults.noi_dung,{type:'doc'});
  await c.query("DELETE FROM tin_tuc WHERE slug='defaults'");
  ok('legacy source article unchanged; no automatic backfill; BigInt/JSONB/default values correct');
  const rows=await c.query("INSERT INTO tin_tuc(tieu_de,slug,noi_dung,chuyen_muc,trang_thai,ngay_dang,updated_at,ma_admin) VALUES('Published','pub','{}','tin_tuc','xuat_ban',now()-interval '1 day',now(),'a'),('Draft','draft','{}','tin_tuc','nhap',now(),now(),'a'),('Hidden','hidden','{}','tin_tuc','an',now(),now(),'a'),('Future','future','{}','tin_tuc','xuat_ban',now()+interval '1 day',now(),'a'),('No date','nodate','{}','tin_tuc','xuat_ban',NULL,now(),'a') RETURNING id,slug");
  for(const r of rows.rows)await c.query("INSERT INTO tai_lieu_tin_tuc(id,tin_tuc_id,ten_file,duong_dan,mime_type) VALUES($1,$2,'file','private/test','application/pdf')",[r.slug,r.id]);
  await assert.rejects(c.query("INSERT INTO tin_tuc(tieu_de,slug,noi_dung,chuyen_muc,updated_at,ma_admin) VALUES('Dup','pub','{}','tin_tuc',now(),'a')"),e=>e.code==='23505');
  await assert.rejects(c.query("INSERT INTO tai_lieu_tin_tuc(id,tin_tuc_id,ten_file,duong_dan,mime_type) VALUES('bad',-1,'file','private/test','application/pdf')"),e=>e.code==='23503');
  await assert.rejects(c.query("INSERT INTO tin_tuc(tieu_de,slug,noi_dung,chuyen_muc,ma_admin) VALUES('Missing updated','updated','{}','tin_tuc','a')"),e=>e.code==='23502');
  ok('news unique slug, attachment foreign key, explicit updated_at and owner inserts');
  await c.query('GRANT USAGE ON SCHEMA public TO pg_read_all_data');
  await c.query('GRANT SELECT,INSERT,UPDATE,DELETE ON tin_tuc,tai_lieu_tin_tuc TO pg_read_all_data');
  await c.query('GRANT USAGE,SELECT ON SEQUENCE tin_tuc_id_seq TO pg_read_all_data');
  await c.query('SET ROLE pg_read_all_data');
  assert.deepEqual((await c.query('SELECT slug FROM tin_tuc')).rows,[{slug:'pub'}]);
  assert.deepEqual((await c.query('SELECT id FROM tai_lieu_tin_tuc')).rows,[{id:'pub'}]);
  await assert.rejects(c.query("INSERT INTO tin_tuc(tieu_de,slug,noi_dung,chuyen_muc,updated_at,ma_admin) VALUES('Forbidden','forbidden','{}','tin_tuc',now(),'a')"),e=>e.code==='42501');
  assert.equal((await c.query("UPDATE tin_tuc SET tieu_de='changed' WHERE slug='pub'")).rowCount,0);
  assert.equal((await c.query("DELETE FROM tin_tuc WHERE slug='pub'")).rowCount,0);
  await c.query('RESET ROLE');
  ok('RLS hides draft/hidden/future/undated news and attachments; nonowner writes denied');
  await c.query("DELETE FROM tin_tuc WHERE slug='pub'");
  assert.equal((await c.query("SELECT count(*)::int AS n FROM tai_lieu_tin_tuc WHERE id='pub'")).rows[0].n,0);
  ok('owner delete cascades attachments');
}
async function main(){
 const recorded=JSON.parse(fs.readFileSync(path.join(root,'../.understand-anything/news-migration-audit/database-metadata.json'),'utf8')).migrations;
 for(const m of recorded){assert(old.includes(m.migration_name));const text=sql(m.migration_name);const hashes=[text,text.replace(/\r\n/g,'\n')].map(v=>createHash('sha256').update(v).digest('hex'));assert(hashes.includes(m.checksum),'Applied history content changed: '+m.migration_name);}
 ok('all eight applied historical SQL files match recorded checksums allowing CRLF normalization');
 const admin=new Client({connectionString:url('postgres')});await admin.connect();
 try{
  for(const db of databases){assert(/^admission_news_migration_(replay|invalid|hotfix|shadow)_[a-f0-9]{32}$/.test(db));await admin.query(`CREATE DATABASE "${db}"`);manifest.created.push(db);save();}
  const c=await connect(databases[0]);
  try{
   await history(c);await seed(c);cli(['migrate','deploy']);
   assert.equal((await c.query('SELECT count(*)::int AS n FROM "_prisma_migrations" WHERE finished_at IS NOT NULL AND rolled_back_at IS NULL')).rows[0].n,names.length);
   assert.deepEqual((await c.query('SELECT a.ma_admin,v.ten_vai_tro FROM admin a JOIN vai_tro v USING(ma_vai_tro) ORDER BY a.ma_admin')).rows,[{ma_admin:'a',ten_vai_tro:'super_admin'},{ma_admin:'b',ten_vai_tro:'chuyen_vien'}]);
   assert.deepEqual((await c.query("SELECT chuan_dau_ra::text AS v FROM chuong_trinh_dao_tao ORDER BY ma_chuong_trinh")).rows,[{v:'{}'},{v:null},{v:'{CU_NHAN}'}]);
   ok('full history deploy preserves accounts, roles and enum/null/empty output values');
   cli(['validate']);cli(['generate']);cli(['migrate','status']);
   cli(['migrate','diff','--from-config-datasource','--to-schema',path.join(root,'prisma/schema.prisma'),'--exit-code']);
   cli(['migrate','diff','--from-migrations',migrationRoot,'--to-schema',path.join(root,'prisma/schema.prisma'),'--exit-code']);
   ok('Prisma validate/generate/status and database/history-to-schema empty diffs');
   await newsChecks(c);
  }finally{await c.end();}
  const invalid=await connect(databases[1]);try{
   await history(invalid);await seed(invalid,'Unknown free text');
   await assert.rejects(invalid.query(sql(reconcile)),/approved value mapping/);await invalid.query('ROLLBACK');
   assert.equal((await invalid.query("SELECT chuan_dau_ra FROM chuong_trinh_dao_tao WHERE ma_chuong_trinh='p'")).rows[0].chuan_dau_ra,'Unknown free text');
   assert.equal((await invalid.query("SELECT vai_tro::text AS v FROM admin WHERE ma_admin='b'")).rows[0].v,'chuyen_vien');
   assert.equal((await invalid.query("SELECT to_regclass('public.vai_tro') AS v")).rows[0].v,null);
   ok('unknown legacy text aborts transaction and preserves entire old schema/data');
  }finally{await invalid.end();}
  const hotfix=await connect(databases[2]);try{
   await history(hotfix);await seed(hotfix);await hotfix.query(sql(reconcile));
   cli(['migrate','resolve','--applied',reconcile],databases[2]);cli(['migrate','deploy'],databases[2]);cli(['migrate','status'],databases[2]);
   cli(['migrate','diff','--from-config-datasource','--to-schema',path.join(root,'prisma/schema.prisma'),'--exit-code'],databases[2]);
   assert.equal((await hotfix.query('SELECT count(*)::int AS n FROM "_prisma_migrations" WHERE finished_at IS NOT NULL')).rows[0].n,names.length);
   ok('simulated existing hotfix resolve+deploy preserves data and yields no drift');
  }finally{await hotfix.end();}
 }finally{
  for(const db of manifest.created){assert(databases.includes(db));await admin.query('SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname=$1 AND pid<>pg_backend_pid()',[db]);await admin.query(`DROP DATABASE "${db}"`);manifest.removed.push(db);save();}
  await admin.end();fs.rmSync(path.join(output,`config-${runId}.ts`),{force:true});
 }
 assert.equal(manifest.created.length,manifest.removed.length);ok('all four owned isolated databases removed');
}
main().catch(e=>{console.error(e);process.exitCode=1;});

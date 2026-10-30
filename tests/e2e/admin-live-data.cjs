// Dedicated disposable records only. This helper never seeds, migrates or modifies existing records.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {Client}=require('pg');
const root=path.resolve(__dirname,'../..');
const settings=require('dotenv').parse(fs.readFileSync(path.join(root,'.env')));
const directory=path.join(root,'tests/artifacts/admin-live');
const definitions={
 admin:{key:'ma_admin',name:'email'},vai_tro:{key:'ma_vai_tro',name:'ten_vai_tro'},
 khoi_nganh:{key:'ma_khoi_nganh',name:'ten_khoi_nganh'},nganh_hoc:{key:'ma_nganh',name:'ten_nganh'},
 chuong_trinh_dao_tao:{key:'ma_chuong_trinh',name:'ten_chuong_trinh'},
 danh_muc_mon_hoc:{key:'ma_mon',name:'ten_mon'},to_hop_xet_tuyen:{key:'ma_to_hop'},
 phuong_thuc_xet_tuyen:{key:'ma_phuong_thuc',name:'ten_phuong_thuc'},
 lich_su_diem_chuan:{key:'ma_ls_dc'},diem_trung_tuyen:{key:'ma_diem_tt'},ctdt_to_hop:{key:'ma_ctdt_to_hop'},
 trang_noi_dung:{key:'ma_bai_viet',name:'tieu_de'},lo_trinh_tuyen_sinh:{key:'ma_su_kien',name:'ten_su_kien'},
};
const quote=value=>{if(!/^[a-z_][a-z_0-9]*$/.test(value))throw Error('Unsafe SQL identifier');return '"'+value+'"';};
function location(run){if(!/^AL[A-F0-9]{10}$/.test(run))throw Error('Invalid run');return path.join(directory,run+'.json');}
function save(m){fs.mkdirSync(directory,{recursive:true});fs.writeFileSync(location(m.run),JSON.stringify(m,null,2));}
async function connect(){
 const db=new Client({connectionString:settings.DIRECT_URL||settings.DATABASE_URL,connectionTimeoutMillis:15000,statement_timeout:20000,keepAlive:true,keepAliveInitialDelayMillis:10000});
 // pg emits idle transport errors outside query promises. Record them without an
 // uncaught EventEmitter crash; actual subsequent queries still reject normally.
 let heartbeat;
 db.on('error',error=>{db.transportErrorCode=error.code||error.name;clearInterval(heartbeat);});
 db.once('end',()=>clearInterval(heartbeat));
 await db.connect();
 heartbeat=setInterval(()=>{db.query('SELECT 1').catch(error=>{db.transportErrorCode=error.code||error.name;});},15000);heartbeat.unref();
 return db;
}
function plan(){const run='AL'+crypto.randomBytes(5).toString('hex').toUpperCase();const actor=crypto.randomUUID();const m={run,actor,email:run.toLowerCase()+'@example.invalid',owned:{},planned:{faculty:run+'F',major:run+'N',program:run+'P',subjects:[1,2,3,4].map(i=>run+'S'+i),combination:run+'T',method:run+'M',role:run.toLowerCase()+'role',accountEmail:run.toLowerCase()+'-second@example.invalid',article:run+' draft',milestone:run+' neutral verification'},cleaned:false};
 for(const table of Object.keys(definitions))m.owned[table]=[];
 m.owned.admin.push(actor);save(m);return m;}
async function remember(m,table,id){if(!definitions[table])throw Error('Unknown table');if(!m.owned[table].includes(id))m.owned[table].push(id);save(m);}
async function discover(db,m){
 const fixed={khoi_nganh:[m.planned.faculty],nganh_hoc:[m.planned.major],chuong_trinh_dao_tao:[m.planned.program],danh_muc_mon_hoc:m.planned.subjects,to_hop_xet_tuyen:[m.planned.combination],phuong_thuc_xet_tuyen:[m.planned.method]};
 for(const [table,ids]of Object.entries(fixed)){const key=definitions[table].key;const rows=await db.query(`SELECT ${quote(key)} FROM ${quote(table)} WHERE ${quote(key)}=ANY($1::text[])`,[ids]);for(const row of rows.rows)await remember(m,table,row[key]);}
 const matches=[['vai_tro','ten_vai_tro',[m.planned.role,m.planned.role+'updated']],['admin','email',[m.email,m.planned.accountEmail]],['trang_noi_dung','tieu_de',[m.planned.article,m.planned.article+' updated']],['lo_trinh_tuyen_sinh','ten_su_kien',[m.planned.milestone,m.planned.milestone+' updated']]];
 for(const[table,column,names]of matches){const key=definitions[table].key;const rows=await db.query(`SELECT ${quote(key)} FROM ${quote(table)} WHERE ${quote(column)}=ANY($1::text[])`,[names]);for(const row of rows.rows)await remember(m,table,row[key]);}
 for(const table of ['lich_su_diem_chuan','ctdt_to_hop']){const key=definitions[table].key;const rows=await db.query(`SELECT ${quote(key)} FROM ${quote(table)} WHERE ma_chuong_trinh=$1`,[m.planned.program]);for(const row of rows.rows)await remember(m,table,row[key]);}
 const scores=await db.query('SELECT ma_diem_tt FROM diem_trung_tuyen WHERE ma_ls_dc=ANY($1::text[])',[m.owned.lich_su_diem_chuan]);for(const row of scores.rows)await remember(m,'diem_trung_tuyen',row.ma_diem_tt);
}
async function setup(m){const db=await connect();try{
 const limits=await db.query("SELECT table_name,column_name,character_maximum_length FROM information_schema.columns WHERE table_schema='public' AND table_name=ANY($1::text[])",[Object.keys(definitions)]);
 for(const row of limits.rows)if(row.character_maximum_length&&row.character_maximum_length<18&&row.column_name===definitions[row.table_name]?.key)throw Error('Fixture identifier exceeds actual column limit');
 for(const [table,def]of Object.entries(definitions)){const rows=await db.query(`SELECT count(*) AS n FROM ${quote(table)} WHERE ${quote(def.key)}=ANY($1::text[])`,[[m.actor,...Object.values(m.planned).flat()]]);if(Number(rows.rows[0].n))throw Error('Fixture identifier collision');}
 const role=(await db.query("SELECT ma_vai_tro FROM vai_tro WHERE ten_vai_tro='super_admin' LIMIT 1")).rows[0];if(!role)throw Error('No existing superadmin role');
 const password='AdminLive!'+crypto.randomBytes(12).toString('hex');const hash=await require('bcryptjs').hash(password,10);
 await db.query('INSERT INTO admin(ma_admin,ho_ten,email,mat_khau,ma_vai_tro,create_at) VALUES($1,$2,$3,$4,$5,NOW())',[m.actor,m.run,m.email,hash,role.ma_vai_tro]);return password;
 }finally{await db.end();}}
async function cleanup(m){if(m.cleaned)return m;const db=await connect();try{
 await db.query('BEGIN');await db.query("SET LOCAL lock_timeout='5s'");
 await discover(db,m);
 // Verify the actor identity and ownership before considering any delete.
 const actor=(await db.query('SELECT email FROM admin WHERE ma_admin=$1 FOR UPDATE',[m.actor])).rows[0];if(actor&&actor.email!==m.email)throw Error('Actor ownership mismatch');
 for(const table of ['nganh_hoc','chuong_trinh_dao_tao']){const key=definitions[table].key;const rows=await db.query(`SELECT ma_admin_quan_ly FROM ${quote(table)} WHERE ${quote(key)}=ANY($1::text[])`,[m.owned[table]]);if(rows.rows.some(r=>r.ma_admin_quan_ly!==m.actor))throw Error('Catalog ownership mismatch');}
 for(const [table,column]of [['trang_noi_dung','ma_admin_tac_gia'],['lo_trinh_tuyen_sinh','ma_admin_cap_nhat'],['lich_su_diem_chuan','ma_admin_cap_nhat']]){const key=definitions[table].key;const rows=await db.query(`SELECT ${quote(column)} FROM ${quote(table)} WHERE ${quote(key)}=ANY($1::text[])`,[m.owned[table]]);if(rows.rows.some(r=>r[column]!==m.actor))throw Error('Record ownership mismatch');}
 // Method assignments have a composite PK; remove only children of the exact
 // owned histories after the identity/owner checks above, within this transaction.
 if((await db.query("SELECT to_regclass('public.cutoff_method') AS name")).rows[0].name)
  await db.query('DELETE FROM cutoff_method WHERE ma_ls_dc=ANY($1::text[])',[m.owned.lich_su_diem_chuan]);
 const fks=(await db.query(`SELECT child.relname AS child,parent.relname AS parent,ca.attname AS child_column,pa.attname AS parent_column FROM pg_constraint fk JOIN pg_class child ON child.oid=fk.conrelid JOIN pg_class parent ON parent.oid=fk.confrelid JOIN pg_namespace ns ON ns.oid=parent.relnamespace JOIN pg_attribute ca ON ca.attrelid=child.oid AND ca.attnum=fk.conkey[1] JOIN pg_attribute pa ON pa.attrelid=parent.oid AND pa.attnum=fk.confkey[1] WHERE fk.contype='f' AND ns.nspname='public' AND cardinality(fk.conkey)=1`)).rows;
 for(const fk of fks){if(!definitions[fk.parent]||!m.owned[fk.parent].length)continue;
  const childDef=definitions[fk.child];const columns=childDef?quote(childDef.key):'1 AS unknown_reference';
  const rows=(await db.query(`SELECT ${columns} FROM ${quote(fk.child)} WHERE ${quote(fk.child_column)} IN (SELECT ${quote(fk.parent_column)} FROM ${quote(fk.parent)} WHERE ${quote(definitions[fk.parent].key)}=ANY($1::text[]))`,[m.owned[fk.parent]])).rows;
  if(rows.some(row=>!childDef||!m.owned[fk.child].includes(row[childDef.key])))throw Error('Unexpected foreign reference: cleanup refused');
 }
 const order=['diem_trung_tuyen','ctdt_to_hop','lich_su_diem_chuan','trang_noi_dung','lo_trinh_tuyen_sinh','chuong_trinh_dao_tao','nganh_hoc','khoi_nganh','to_hop_xet_tuyen','danh_muc_mon_hoc','phuong_thuc_xet_tuyen','admin','vai_tro'];
 const deleted={};
 for(const table of order){const ids=table==='admin'?m.owned.admin.filter(id=>id!==m.actor):m.owned[table];const result=await db.query(`DELETE FROM ${quote(table)} WHERE ${quote(definitions[table].key)}=ANY($1::text[])`,[ids]);deleted[table]=result.rowCount;}
 deleted.admin+=(await db.query('DELETE FROM admin WHERE ma_admin=$1 AND email=$2',[m.actor,m.email])).rowCount;
 let remaining=0;for(const[table,def]of Object.entries(definitions))remaining+=Number((await db.query(`SELECT count(*) AS n FROM ${quote(table)} WHERE ${quote(def.key)}=ANY($1::text[])`,[m.owned[table]])).rows[0].n);
 if(remaining)throw Error('Fixture rows remain');await db.query('COMMIT');m.cleaned=true;m.remaining=remaining;m.deleted=deleted;m.cleanedAt=new Date().toISOString();save(m);return m;
 }catch(error){await db.query('ROLLBACK').catch(()=>{});throw error;}finally{await db.end();}}
module.exports={root,settings,directory,plan,save,connect,setup,remember,discover,cleanup,definitions};
if(require.main===module){const run=process.argv[2];if(!run)throw Error('Provide exact run ID');const m=JSON.parse(fs.readFileSync(location(run),'utf8'));cleanup(m).then(()=>console.log(JSON.stringify({run:m.run,cleaned:m.cleaned,remaining:m.remaining}))).catch(error=>{console.error(error.message);process.exitCode=1;});}

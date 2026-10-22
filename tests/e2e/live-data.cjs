const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const {Client}=require('pg');
const dotenv=require('dotenv');
const bcrypt=require('bcryptjs');
const root=path.resolve(__dirname,'../..');
const env=dotenv.parse(fs.readFileSync(path.join(root,'.env')));
const folder=path.resolve(__dirname,'../artifacts/live-data');
function file(run){if(!/^[a-zA-Z0-9-]+$/.test(run))throw Error('Mã lượt không hợp lệ');return path.join(folder,run+'.json');}
function save(manifest){fs.mkdirSync(folder,{recursive:true});fs.writeFileSync(file(manifest.run),JSON.stringify(manifest,null,2));}
async function connect(){const db=new Client({connectionString:env.DIRECT_URL,connectionTimeoutMillis:15000,statement_timeout:30000});await db.connect();return db;}
async function setup(run){
  const marker='BOTLIVE-'+run;
  const m={run,marker,admin:marker+'-ADMIN',program:marker+'-CT',history:marker+'-LS',cutoff:marker+'-DC',
    email:marker.toLowerCase()+'@example.invalid',candidate:'990'+String(crypto.randomInt(1000000000)).padStart(9,'0'),cleaned:false,newsTitle:marker+' NEWS'};
  const password='LiveTest!'+crypto.randomBytes(12).toString('hex');
  const db=await connect();
  try{
    const ref=(await db.query(`SELECT c.ma_nganh,c.chuan_dau_ra,v.ma_vai_tro,
      (SELECT ma_phuong_thuc FROM phuong_thuc_xet_tuyen ORDER BY ma_phuong_thuc LIMIT 1) AS method,
      (SELECT ma_mon FROM danh_muc_mon_hoc ORDER BY ma_mon LIMIT 1) AS subject
      FROM chuong_trinh_dao_tao c CROSS JOIN vai_tro v WHERE v.ten_vai_tro='super_admin' ORDER BY c.ma_chuong_trinh LIMIT 1`)).rows[0];
    if(!ref?.method || !ref.subject)throw Error('Thiếu dữ liệu danh mục thật để test');
    m.method=ref.method;m.subject=ref.subject;
    if((await db.query('SELECT 1 FROM thi_sinh WHERE cccd=$1',[m.candidate])).rowCount)throw Error('Định danh ngẫu nhiên đã tồn tại; dừng, không sửa bản ghi này');
    save(m); // Recovery manifest is written before any fixture mutation; never contains passwords/tokens.
    await db.query('BEGIN');
    await db.query('INSERT INTO admin (ma_admin,ho_ten,email,mat_khau,ma_vai_tro,create_at) VALUES ($1,$2,$3,$4,$5,NOW())',[m.admin,marker,m.email,await bcrypt.hash(password,10),ref.ma_vai_tro]);
    await db.query('INSERT INTO chuong_trinh_dao_tao (ma_chuong_trinh,ma_nganh,ten_chuong_trinh,ma_admin_quan_ly,create_at,luot_xem,chuan_dau_ra) VALUES ($1,$2,$3,$4,NOW(),0,$5)',[m.program,ref.ma_nganh,marker,m.admin,ref.chuan_dau_ra]);
    await db.query('COMMIT');
    return {...m,password};
  }catch(error){await db.query('ROLLBACK').catch(()=>{});throw error;}finally{await db.end();}
}
async function cleanup(run,log=console.log){
  if(!fs.existsSync(file(run)))return;
  const m=JSON.parse(fs.readFileSync(file(run),'utf8'));
  if(m.cleaned)return;
  if(m.run!==run || m.marker!=='BOTLIVE-'+run || m.admin!==m.marker+'-ADMIN' || m.program!==m.marker+'-CT' || !/^990\d{9}$/.test(m.candidate))throw Error('Manifest không hợp lệ, không xóa');
  const db=await connect();
  try{
    await db.query('BEGIN');
    const student=(await db.query('SELECT ho_ten FROM thi_sinh WHERE cccd=$1 FOR UPDATE',[m.candidate])).rows[0];
    const program=(await db.query('SELECT ten_chuong_trinh FROM chuong_trinh_dao_tao WHERE ma_chuong_trinh=$1 FOR UPDATE',[m.program])).rows[0];
    const admin=(await db.query('SELECT email FROM admin WHERE ma_admin=$1 FOR UPDATE',[m.admin])).rows[0];
    if(student && ![m.marker,m.marker+' ĐÃ SỬA'].includes(student.ho_ten))throw Error('Không xác nhận được chủ sở hữu dữ liệu thí sinh, dừng xóa');
    if(program && program.ten_chuong_trinh!==m.marker)throw Error('Chương trình không thuộc lượt test');
    if(admin && admin.email!==m.email)throw Error('Admin không thuộc lượt test');
    // Chỉ xóa bài do đúng admin của lượt này tạo và có đúng tiêu đề đã đăng ký trước.
    await db.query('DELETE FROM trang_noi_dung WHERE ma_admin_tac_gia=$1 AND tieu_de=ANY($2::text[])',[m.admin,[m.newsTitle,m.newsTitle+' ĐÃ SỬA']]);
    // Every delete is constrained to this run's exact IDs; no LIKE/prefix bulk deletion.
    await db.query('DELETE FROM admission_notification WHERE ma_ho_so IN (SELECT ma_ho_so FROM nguyen_vong_sinh_vien WHERE cccd=$1 AND ma_chuong_trinh=$2)',[m.candidate,m.program]);
    if(student)await db.query('DELETE FROM thi_sinh WHERE cccd=$1',[m.candidate]);
    await db.query('DELETE FROM lich_su_diem_chuan WHERE ma_chuong_trinh=$1 AND ma_admin_cap_nhat=$2',[m.program,m.admin]);
    if(program)await db.query('DELETE FROM chuong_trinh_dao_tao WHERE ma_chuong_trinh=$1',[m.program]);
    if(admin)await db.query('DELETE FROM admin WHERE ma_admin=$1',[m.admin]);
    const remains=(await db.query(`SELECT
      (SELECT count(*) FROM thi_sinh WHERE cccd=$1)+
      (SELECT count(*) FROM nguyen_vong_sinh_vien WHERE cccd=$1 OR ma_chuong_trinh=$2)+
      (SELECT count(*) FROM bang_diem WHERE cccd=$1)+
      (SELECT count(*) FROM lich_su_diem_chuan WHERE ma_ls_dc=$3 OR ma_chuong_trinh=$2)+
      (SELECT count(*) FROM diem_trung_tuyen WHERE ma_diem_tt=$4)+
      (SELECT count(*) FROM chuong_trinh_dao_tao WHERE ma_chuong_trinh=$2)+
      (SELECT count(*) FROM admin WHERE ma_admin=$5)+
      (SELECT count(*) FROM trang_noi_dung WHERE ma_admin_tac_gia=$5)+
      (SELECT count(*) FROM lo_trinh_tuyen_sinh WHERE ma_admin_cap_nhat=$5) AS n`,[m.candidate,m.program,m.history,m.cutoff,m.admin])).rows[0].n;
    if(Number(remains)!==0)throw Error('Dữ liệu test chưa được dọn hết');
    await db.query('COMMIT');
    m.cleaned=true;m.cleaned_at=new Date().toISOString();m.remaining=0;save(m);
    log('DỌN DỮ LIỆU SUPABASE: đã xóa fixture của lượt '+run+'; kiểm tra còn lại 0 bản ghi.');
  }catch(error){await db.query('ROLLBACK').catch(()=>{});throw error;}finally{await db.end();}
}
// Ghi đăng ký lượt con trước setup để Ctrl+C vẫn tìm được đúng manifest cần dọn.
async function setupCase(parent,label){
  if(!/^[a-zA-Z0-9-]+$/.test(parent))throw Error('Mã lượt cha không hợp lệ');
  const registry=path.join(folder,parent+'-children.json');
  fs.mkdirSync(folder,{recursive:true});
  const runs=fs.existsSync(registry)?JSON.parse(fs.readFileSync(registry,'utf8')):[];
  const run=crypto.randomUUID();runs.push(run);fs.writeFileSync(registry,JSON.stringify(runs));
  console.log('DỮ LIỆU RIÊNG: '+label+'; mã '+run);
  return setup(run);
}
async function cleanupAll(parent,log=console.log){
  if(!/^[a-zA-Z0-9-]+$/.test(parent))throw Error('Mã lượt cha không hợp lệ');
  const failures=[];
  try{await cleanup(parent,log);}catch(error){failures.push(error.message);}
  const registry=path.join(folder,parent+'-children.json');
  if(fs.existsSync(registry))for(const run of JSON.parse(fs.readFileSync(registry,'utf8')))try{await cleanup(run,log);}catch(error){failures.push(error.message);}
  if(failures.length)throw Error(failures.join('; '));
}
module.exports={setup,cleanup,connect,setupCase,cleanupAll};

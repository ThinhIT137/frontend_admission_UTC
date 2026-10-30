// Browser actions against the real app, PostgreSQL and private Supabase Storage.
// Backend runs from artifacts; no mock APIs, migrations or AI service changes.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {spawn}=require('node:child_process');
const {chromium,expect}=require('@playwright/test');
const data=require('./admin-live-data.cjs');
const root=data.root,folder=path.join(root,'tests/artifacts/admission-lifecycle');
const recovery=process.argv[2]==='--cleanup'?process.argv[3]:null;
const run=recovery||'LC'+crypto.randomBytes(5).toString('hex');
if(!/^LC[a-f0-9]{10}$/.test(run))throw Error('Invalid run');
const out=path.join(folder,run);fs.mkdirSync(out,{recursive:true});
const manifestPath=path.join(out,'manifest.json');
let m=recovery?JSON.parse(fs.readFileSync(manifestPath,'utf8')):{run,started:new Date().toISOString(),admin:data.plan(),candidate:'',phone:'',programs:['A','B','C'].map(x=>run+x),quotas:['A','B','C'].map(x=>run+'Q'+x),assignments:['A','B','C'].map(()=>crypto.randomUUID()),steps:[],files:[],cleaned:false};
const save=()=>fs.writeFileSync(manifestPath,JSON.stringify(m,null,2));save();
let db,browser,candidate,admin,page,adminPage,next,backend,storage,finishing,adminPassword;
const owned=[];const delay=ms=>new Promise(r=>setTimeout(r,ms));
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function report(){fs.writeFileSync(path.join(out,'report.html'),`<!doctype html><meta charset="utf-8"><title>Bot ${run}</title><style>body{font:16px system-ui;background:#f6f8fc;color:#192b59;max-width:1100px;margin:32px auto;padding:20px}article{background:white;padding:20px;border-radius:16px;margin:16px 0;border:1px solid #dbe2ef}img{max-width:100%;max-height:600px;object-fit:contain}small{color:#475569}a{color:#1d4ed8}pre{white-space:pre-wrap}video{width:100%}</style><h1>Bot kiểm thử hồ sơ ${run}</h1><p>Web thật · PostgreSQL thật · Storage riêng tư thật. Backend thử nghiệm từ source artifacts; không thay URL deploy.</p><p>Dữ liệu: <a href="dataset.json">dataset.json</a> · <a href="manifest.json">manifest.json</a> · <a href="candidate-trace.zip">Trace</a></p><p>Cleanup: ${m.cleaned?'ĐÃ DỌN, CÒN 0':m.cleanupError?'CHƯA HOÀN TẤT':'ĐANG CHẠY'}</p>${m.steps.map(s=>`<article><h2>${escape(s.status)} · ${escape(s.name)}</h2>${s.detail?`<pre>${escape(s.detail)}</pre>`:''}${s.image?`<a href="${s.image}"><img src="${s.image}" alt="${escape(s.name)}"></a>`:''}</article>`).join('')}`);}
async function freePort(){const s=require('node:net').createServer();await new Promise(r=>s.listen(0,'127.0.0.1',r));const p=s.address().port;await new Promise(r=>s.close(r));return p;}
async function stop(child){if(!child?.pid||child.exitCode!==null)return;await new Promise(r=>{const t=spawn('taskkill',['/PID',String(child.pid),'/T','/F'],{windowsHide:true,stdio:'ignore'});t.once('exit',r);t.once('error',r);});}
async function waitServer(url,child){const end=Date.now()+150000;while(Date.now()<end){if(child.exitCode!==null)throw Error('Owned server exited');try{if((await fetch(url,{signal:AbortSignal.timeout(5000)})).ok)return;}catch{}await delay(500);}throw Error('Owned server readiness timeout');}
async function step(name,work,shot){const s={name,status:'RUNNING'};m.steps.push(s);save();try{if(db?.transportErrorCode)throw Error('Database transport lost');await work();s.status='PASS';if(shot){s.image=`${String(m.steps.length).padStart(2,'0')}.png`;await shot().screenshot({path:path.join(out,s.image)});}console.log(JSON.stringify({step:name,status:'PASS'}));}catch(e){s.status='FAIL';s.detail=e.message.split('\n').slice(0,12).join('\n');if(adminPage?.url().includes('/admin/login'))await adminPage.screenshot({path:path.join(out,'admin-login-failure.png')}).catch(()=>{});throw e;}finally{save();report();}}
async function ready(p){await p.waitForFunction(()=>[...document.querySelectorAll('button')].some(b=>Object.keys(b).some(k=>k.startsWith('__reactProps$'))),{timeout:60000});}
async function go(p,url){await p.bringToFront();await p.goto(m.origin+url,{waitUntil:'networkidle',timeout:120000});try{await ready(p);}catch(e){await p.reload({waitUntil:'networkidle',timeout:120000});await ready(p);}}
function ownCard(id){return page.getByRole('article').filter({hasText:id});}
function ownRow(id){return adminPage.locator('tbody tr').filter({hasText:id});}
async function databaseRow(id){return(await db.query('SELECT * FROM nguyen_vong_sinh_vien WHERE ma_ho_so=$1 AND cccd=$2',[id,m.candidate])).rows[0];}
async function adminList(){await go(adminPage,'/admin/ho-so');await expect.poll(async()=>adminPage.locator('tbody tr').filter({hasText:m.candidate}).count(),{timeout:60000}).toBeGreaterThan(0);}
async function withPrompts(button,answers){let i=0;const fn=async d=>i<answers.length?d.accept(answers[i++]):d.dismiss();adminPage.on('dialog',fn);try{await button.click();await expect.poll(()=>i).toBe(answers.length);}finally{adminPage.off('dialog',fn);}}
async function myList(){await go(page,'/nguyen-vong-cua-toi');await expect(page.getByRole('heading',{name:/Nguyện vọng/}).first()).toBeVisible();}
async function submit(program,rank){
 await go(page,'/nop-ho-so');await expect(page.getByText('Học bạ',{exact:true}).first()).toBeVisible();
 await page.getByRole('button').filter({hasText:'MÃ: PT2'}).click();
 await page.getByLabel('Thứ tự nguyện vọng',{exact:true}).fill(String(rank));
 const selects=page.locator('select');await selects.filter({has:page.locator(`option[value="${program}"]`)}).first().selectOption(program).catch(async()=>{await selects.nth(0).selectOption(program);});
 await page.getByRole('button',{name:'Tiếp tục: Điền thông tin cá nhân',exact:true}).click();
 await page.getByPlaceholder('Ví dụ: NGUYỄN VĂN AN').fill(m.name);
 await page.getByPlaceholder('Ví dụ: 0912345678').fill(m.phone);
 await page.getByLabel('Lớp bảng điểm 1',{exact:true}).selectOption('lop_12');
 await page.getByLabel('Năm học bảng điểm 1',{exact:true}).fill('2026');
 await page.getByRole('button',{name:'Thêm môn',exact:true}).first().click();await page.getByRole('button',{name:'Thêm môn',exact:true}).first().click();
 for(const[i,code]of ['TOAN','LY','HOA'].entries()){await page.getByLabel('Môn '+(i+1),{exact:true}).selectOption(code);await page.getByLabel('Điểm môn '+(i+1),{exact:true}).fill(['9','8.5','9'][i]);}
 await page.getByRole('button',{name:'Tiếp tục: Checklist hồ sơ & Upload',exact:true}).click();
 // Real File inputs, not API submission shortcuts.
 for(const label of ['Bản sao công chứng Học bạ THPT (cả 3 năm)','Bản sao CCCD / Định danh cá nhân 2 mặt','Giấy chứng nhận tốt nghiệp THPT tạm thời / Bằng tốt nghiệp']){
  const input=page.getByLabel(label,{exact:true});if(await input.count())await input.setInputFiles(path.join(out,'evidence.png'));
 }
 await page.getByRole('button',{name:'Tiếp tục: Rà soát & Xác nhận nộp',exact:true}).click();
 const response=page.waitForResponse(r=>new URL(r.url()).pathname==='/api/application-submission'&&r.request().method()==='POST',{timeout:240000});
 await page.getByRole('button',{name:'Xác Nhận Nộp Hồ Sơ Chính Thức',exact:true}).click();const r=await response,b=await r.json();
 if(!r.ok()||!b.success)throw Error('Submit HTTP '+r.status()+': '+b.message);m.dossiers??=[];m.dossiers.push(b.maHoSo);save();return b.maHoSo;
}
async function change(id,target){await myList();const card=ownCard(id);await card.getByRole('button',{name:'Đổi ngành',exact:true}).click();await card.getByLabel('Ngành mới',{exact:true}).selectOption(target);await card.getByRole('button',{name:'Xác nhận đổi ngành',exact:true}).click();await expect.poll(async()=>(await databaseRow(id)).ma_chuong_trinh).toBe(target);await expect(card).toContainText('BOT '+run+' ngành '+target.slice(-1));}
async function withdraw(id){await myList();const c=ownCard(id);await c.getByRole('button',{name:'Rút hồ sơ',exact:true}).click();await c.getByLabel('Mã hồ sơ xác nhận rút').fill(id);await c.getByRole('button',{name:'Xác nhận rút và xóa hồ sơ',exact:true}).click();await expect(c).toHaveCount(0);if(await databaseRow(id))throw Error('Withdraw did not persist');}
async function review(id){await adminList();await ownRow(id).getByRole('button',{name:'Duyệt hợp lệ',exact:true}).click();await expect.poll(async()=>(await databaseRow(id)).trang_thai).toBe('hop_le');}
async function decision(id,win){await review(id);let row=ownRow(id);await row.getByRole('button',{name:'Bắt đầu xét tuyển',exact:true}).click();await expect.poll(async()=>(await databaseRow(id)).trang_thai).toBe('dang_xu_ly');
 await withPrompts(row.getByRole('button',{name:'Chốt điểm đối soát',exact:true}),[run+' học bạ 9+8.5+9','26.5']);await expect.poll(async()=>(await databaseRow(id)).tong_diem_xet_tuyen).toBe(26.5);
 await withPrompts(row.getByRole('button',{name:win?'Chốt đỗ':'Chốt trượt',exact:true}),[run+' quyết định kiểm thử','']);await expect.poll(async()=>(await databaseRow(id)).trang_thai).toBe(win?'do':'truot');}
async function cleanup(){
 if(m.cleaned)return;const c=await data.connect();try{
  const identity=(await c.query('SELECT ho_ten,so_dien_thoai FROM thi_sinh WHERE cccd=$1',[m.candidate])).rows[0];if(identity&&(identity.ho_ten!==m.name||identity.so_dien_thoai!==m.phone))throw Error('Cleanup ownership mismatch');
  const ops=(await c.query('SELECT journal FROM submission_operation WHERE cccd=$1',[m.candidate])).rows;
  const keys=[...new Set(ops.flatMap(o=>o.journal.files.map(f=>f.key)))];if(keys.some(k=>!k.startsWith(m.candidate+'/')))throw Error('Unexpected storage ownership');m.files=keys;save();
  if(storage&&keys.length){const result=await storage.remove(keys);if(result.error)throw Error('Owned Storage cleanup failed');}
  if(storage&&m.candidate){const list=await storage.list(m.candidate,{limit:1000});if(list.error||list.data.length)throw Error('Owned storage objects remain');}
  await c.query('BEGIN');
  const foreign=(await c.query('SELECT count(*) n FROM nguyen_vong_sinh_vien WHERE cccd=$1 AND NOT(ma_chuong_trinh=ANY($2::text[]))',[m.candidate,m.programs])).rows[0];if(Number(foreign.n))throw Error('Unexpected dossier reference');
  await c.query('DELETE FROM admission_notification WHERE ma_ho_so IN(SELECT ma_ho_so FROM nguyen_vong_sinh_vien WHERE cccd=$1)',[m.candidate]);
  await c.query('DELETE FROM diem_chi_tiet WHERE ma_bang_diem IN(SELECT ma_bang_diem FROM bang_diem WHERE cccd=$1)',[m.candidate]);
  for(const table of ['submission_operation','chung_chi','giai_thuong','bang_diem','nguyen_vong_sinh_vien'])await c.query('DELETE FROM "'+table+'" WHERE cccd=$1',[m.candidate]);
  await c.query('DELETE FROM thi_sinh WHERE cccd=$1 AND ho_ten=$2',[m.candidate,m.name]);
  const rows=(await c.query('SELECT ma_admin_quan_ly FROM chuong_trinh_dao_tao WHERE ma_chuong_trinh=ANY($1::text[])',[m.programs])).rows;if(rows.some(r=>r.ma_admin_quan_ly!==m.admin.actor))throw Error('Program ownership mismatch');
  await c.query('DELETE FROM diem_trung_tuyen WHERE ma_ls_dc=ANY($1::text[])',[m.quotas]);await c.query('DELETE FROM lich_su_diem_chuan WHERE ma_ls_dc=ANY($1::text[])',[m.quotas]);
  await c.query('DELETE FROM ctdt_to_hop WHERE ma_ctdt_to_hop=ANY($1::text[])',[m.assignments]);await c.query('DELETE FROM chuong_trinh_dao_tao WHERE ma_chuong_trinh=ANY($1::text[])',[m.programs]);
  await c.query('COMMIT');
  const left=Number((await c.query('SELECT count(*) n FROM thi_sinh WHERE cccd=$1',[m.candidate])).rows[0].n)+Number((await c.query('SELECT count(*) n FROM chuong_trinh_dao_tao WHERE ma_chuong_trinh=ANY($1::text[])',[m.programs])).rows[0].n);if(left)throw Error('Records remain');
 }catch(e){await c.query('ROLLBACK').catch(()=>{});throw e;}finally{await c.end();}
 await data.cleanup(m.admin);m.cleaned=true;m.remaining=0;save();report();
}
async function finish(){if(finishing)return finishing;finishing=(async()=>{try{if(candidate){await candidate.tracing.stop({path:path.join(out,'candidate-trace.zip')}).catch(()=>{});const v=page?.video();await candidate.close().catch(()=>{});if(v){const p=await v.path();fs.copyFileSync(p,path.join(out,'candidate.webm'));}}await browser?.close().catch(()=>{});for(const p of owned.reverse())await stop(p);const lp=path.join(out,'services.log');if(fs.existsSync(lp))fs.writeFileSync(lp,fs.readFileSync(lp,'utf8').split('\n').map(line=>line.includes('candidateSessionAction(')?'[candidate session action: arguments redacted]':line).join('\n'));await db?.end().catch(()=>{});await cleanup();}catch(e){m.cleanupError=e.message;save();report();console.log(JSON.stringify({cleanupError:e.message,recovery:`node tests/e2e/admission-lifecycle-bot.cjs --cleanup ${run}`}));process.exitCode=1;}})();return finishing;}
async function main(){
 db=await data.connect();const {createClient}=require('@supabase/supabase-js');storage=createClient(data.settings.SUPABASE_URL||data.settings.NEXT_PUBLIC_SUPABASE_URL,data.settings.SUPABASE_SERVICE_ROLE_KEY,{auth:{persistSession:false},global:{fetch:(i,o)=>fetch(i,{...o,signal:AbortSignal.timeout(20000)})}}).storage.from(data.settings.SUPABASE_EVIDENCE_BUCKET||'illustrative_images');
 if(recovery){await cleanup();console.log('RECOVERY_CLEAN');return;}
 do{m.candidate='9'+String(crypto.randomInt(100000000,999999999))+String(crypto.randomInt(10,99));m.phone='09'+String(crypto.randomInt(10000000,99999999));}while((await db.query('SELECT 1 FROM thi_sinh WHERE cccd=$1 OR so_dien_thoai=$2',[m.candidate,m.phone])).rowCount);
 m.name='Nguyễn Minh Anh '+run;save();adminPassword=await data.setup(m.admin);m.writesStarted=true;save();
 const major=(await db.query('SELECT ma_nganh FROM nganh_hoc LIMIT 1')).rows[0].ma_nganh;
 await db.query('BEGIN');try{for(let i=0;i<3;i++){await db.query('INSERT INTO chuong_trinh_dao_tao(ma_chuong_trinh,ma_nganh,ten_chuong_trinh,ma_admin_quan_ly,create_at,luot_xem,chuan_dau_ra) VALUES($1,$2,$3,$4,NOW(),0,$5)',[m.programs[i],major,'BOT '+run+' ngành '+['A','B','C'][i],m.admin.actor,['KY_SU']]);await db.query('INSERT INTO ctdt_to_hop(ma_ctdt_to_hop,ma_chuong_trinh,ma_to_hop,nam) VALUES($1,$2,$3,2026)',[m.assignments[i],m.programs[i],'A00']);await db.query('INSERT INTO lich_su_diem_chuan(ma_ls_dc,ma_chuong_trinh,nam,chi_tieu,ma_admin_cap_nhat,create_at) VALUES($1,$2,2026,50,$3,NOW())',[m.quotas[i],m.programs[i],m.admin.actor]);await db.query('INSERT INTO diem_trung_tuyen(ma_diem_tt,ma_ls_dc,ma_phuong_thuc,diem,create_at) VALUES($1,$2,$3,$4,NOW())',[crypto.randomUUID(),m.quotas[i],'PT2',i===1?28:25]);}await db.query('COMMIT');}catch(e){await db.query('ROLLBACK');throw e;}
 fs.writeFileSync(path.join(out,'dataset.json'),JSON.stringify({candidate:{cccd:m.candidate,name:m.name,phone:m.phone},programs:m.programs,year:2026,method:'PT2',combination:'A00',transcript:{class:12,semester:0,subjects:{TOAN:9,LY:8.5,HOA:9}},image:'evidence.png',policy:{change:['cho','hop_le'],locked:['dang_xu_ly','do','truot','tu_choi']}},null,2));
 const backendPort=await freePort(),nextPort=await freePort();m.origin='http://127.0.0.1:'+nextPort;m.backendPort=backendPort;save();
 const backendEnv=require('dotenv').parse(fs.readFileSync(path.resolve(root,'../backend_admission/backend_application_score/.env')));
 const log=fs.openSync(path.join(out,'services.log'),'a');backend=spawn(path.resolve(root,'../backend_admission/backend_application_score/.venv/Scripts/python.exe'),['-B','-m','uvicorn','app:app','--host','127.0.0.1','--port',String(backendPort),'--log-level','error','--no-access-log'],{cwd:path.join(folder,process.argv.includes('--withdrawal')?'backend-withdrawal':'backend'),env:{...process.env,...backendEnv},windowsHide:true,stdio:['ignore',log,log]});owned.push(backend);
 await waitServer('http://127.0.0.1:'+backendPort+'/health',backend);
 next=spawn(process.execPath,['node_modules/next/dist/bin/next','dev','--webpack','--hostname','127.0.0.1','--port',String(nextPort)],{cwd:root,env:{...process.env,...data.settings,ADMISSION_LIVE_SCORE:'1',NEXT_TELEMETRY_DISABLED:'1',API_APPLICATION_SCORE:'http://127.0.0.1:'+backendPort},windowsHide:true,stdio:['ignore',log,log]});owned.push(next);m.ownedPids=owned.map(p=>p.pid);save();await waitServer(m.origin+'/admin/login',next);
 browser=await chromium.launch({channel:'chrome',headless:!process.argv.includes('--headed'),slowMo:60});candidate=await browser.newContext({viewport:{width:1366,height:900}});await candidate.tracing.start({screenshots:true,snapshots:true,sources:true});admin=await browser.newContext({viewport:{width:1366,height:900}});page=await candidate.newPage();adminPage=await admin.newPage();page.setDefaultTimeout(25000);adminPage.setDefaultTimeout(25000);
 const sample=await browser.newPage();await sample.setContent('<canvas width="720" height="460"></canvas>');const png=await sample.evaluate(({name,run})=>{const c=document.querySelector('canvas'),x=c.getContext('2d');x.fillStyle='#eef2ff';x.fillRect(0,0,720,460);x.fillStyle='#192b59';x.font='bold 27px sans-serif';x.fillText('MINH CHỨNG KIỂM THỬ',40,65);x.font='22px sans-serif';x.fillText(name,40,130);x.fillText('Lớp 12 - Toán: 9; Lý: 8.5; Hóa: 9',40,190);x.fillText('Không có giá trị pháp lý',40,270);x.fillText(run,40,330);return c.toDataURL('image/png').split(',')[1];},{name:m.name,run});fs.writeFileSync(path.join(out,'evidence.png'),Buffer.from(png,'base64'));await sample.close();
 await step('Đăng ký tài khoản qua web',async()=>{await go(page,'/nop-ho-so');await page.getByRole('button',{name:'Đăng ký mới',exact:true}).click();await page.getByLabel('CCCD đăng nhập').fill(m.candidate);await page.getByLabel('Mật khẩu thí sinh').fill('Lifecycle!'+crypto.randomBytes(12).toString('hex'));await page.getByLabel('Họ tên đăng ký').fill(m.name);await page.getByLabel('Điện thoại đăng ký').fill(m.phone);await page.getByRole('button',{name:'Tạo tài khoản',exact:true}).click();await expect(page.getByLabel('CCCD đăng nhập')).toHaveCount(0);},()=>page.locator('main'));
 let first,current,second,third;
 await step('Nộp hồ sơ ngành A: ảnh và điểm học bạ',async()=>{first=await submit(m.programs[0],1);const s=(await db.query('SELECT count(*) n FROM bang_diem WHERE cccd=$1',[m.candidate])).rows[0];if(Number(s.n)<1)throw Error('Missing real transcript');const files=(await db.query('SELECT file_dinh_kem FROM chung_chi WHERE cccd=$1',[m.candidate])).rows;for(const f of files){const r=await storage.download(f.file_dinh_kem);if(r.error||!r.data.size)throw Error('Missing uploaded image');}},()=>page.locator('main'));
 await step('Rút hồ sơ: giữ ảnh dùng chung, xóa ảnh khi rút hồ sơ cuối',async()=>{
  const shared=await submit(m.programs[1],2);
  await withdraw(first);
  const before=await storage.list(m.candidate,{limit:1000});if(before.error||!before.data.length)throw Error('Shared images were deleted');
  await withdraw(shared);
  // The card disappears as soon as DB commits; Storage cleanup finishes before
  // the UI mutation ends. Poll actual objects rather than race that boundary.
  await expect.poll(async()=>{const after=await storage.list(m.candidate,{limit:1000});if(after.error)throw Error('Storage check failed');return after.data.length;},{timeout:60000}).toBe(0);
  const refs=await db.query('SELECT count(*) n FROM chung_chi WHERE cccd=$1',[m.candidate]);if(Number(refs.rows[0].n))throw Error('Deleted image metadata remains');
 },()=>page.locator('main'));
 if(process.argv.includes('--withdrawal-only')){m.status='PASS';save();return;}
 await step('Nộp lại ngành A',async()=>{current=await submit(m.programs[0],1);if(current===first)throw Error('Dossier not recreated');},()=>page.locator('main'));
 await step('Đổi ngành khi chờ kiểm tra: A sang B',()=>change(current,m.programs[1]),()=>ownCard(current));
 await step('Một thí sinh nộp nhiều ngành',async()=>{second=await submit(m.programs[0],2);await myList();await expect(ownCard(current)).toHaveCount(1);await expect(ownCard(second)).toHaveCount(1);},()=>page.locator('main'));
 await step('Admin đăng nhập',async()=>{await go(adminPage,'/admin/login');await adminPage.locator('input[type=text]').fill(m.admin.email);await adminPage.locator('input[type=password]').fill(adminPassword);await adminPage.getByRole('button',{name:'Đăng Nhập Quản Trị',exact:true}).click();await expect(adminPage).toHaveURL(/\/admin$/,{timeout:90000});});
 await step('Admin xem ảnh và học bạ thật',async()=>{await adminList();await ownRow(current).getByRole('button',{name:'Chi tiết',exact:true}).click();const detail=adminPage.locator('section').filter({hasText:current}).last();await expect(detail.getByRole('img').first()).toBeVisible();await expect.poll(()=>detail.getByRole('img').first().evaluate(e=>e.naturalWidth)).toBeGreaterThan(0);await expect(detail).toContainText('8.5');},()=>adminPage.locator('section').filter({hasText:current}).last());
 await step('Duyệt hợp lệ, đổi B sang C và yêu cầu kiểm tra lại',async()=>{await review(current);await change(current,m.programs[2]);const r=await databaseRow(current);if(r.trang_thai!=='cho'||r.ma_admin_xu_ly!==null)throw Error('Approval was not reset');},()=>ownCard(current));
 await step('Admin xét và chốt đỗ ngành C',()=>decision(current,true),()=>ownRow(current));
 await step('Hồ sơ đỗ không được rút hoặc đổi ngành',async()=>{await myList();const c=ownCard(current);await expect(c.getByRole('button',{name:'Rút hồ sơ',exact:true})).toHaveCount(0);await expect(c.getByRole('button',{name:'Đổi ngành',exact:true})).toHaveCount(0);const base=m.origin+'/api/backend/score/ho-so/cua-toi/'+encodeURIComponent(current);const a=await candidate.request.delete(base,{headers:{origin:m.origin}}),b=await candidate.request.put(base+'/nganh',{headers:{origin:m.origin},data:{ma_chuong_trinh_cu:m.programs[2],ma_chuong_trinh:m.programs[0]}});if(a.status()!==409||b.status()!==409)throw Error('Final-state API guard failed');},()=>ownCard(current));
 await step('Admin từ chối hồ sơ A, thí sinh thấy lý do',async()=>{await adminList();await withPrompts(ownRow(second).getByRole('button',{name:'Từ chối',exact:true}),[run+' thiếu điều kiện kiểm thử']);await expect.poll(async()=>(await databaseRow(second)).trang_thai).toBe('tu_choi');await myList();await expect(ownCard(second)).toContainText('thiếu điều kiện');},()=>ownCard(second));
 await step('Nộp ngành B và chốt trượt vì dưới điểm chuẩn',async()=>{third=await submit(m.programs[1],3);await decision(third,false);},()=>ownRow(third));
 m.status='PASS';save();
}
process.once('SIGINT',()=>void finish().finally(()=>process.exit(1)));process.once('SIGTERM',()=>void finish().finally(()=>process.exit(1)));process.once('uncaughtException',e=>{m.error=e.message;save();void finish().finally(()=>process.exit(1));});
main().catch(e=>{m.status='FAIL';m.error=e.message.split('\n').slice(0,3).join('\n');save();report();console.log(JSON.stringify({run,status:'FAIL',error:m.error}));process.exitCode=1;}).finally(async()=>{await finish();console.log(JSON.stringify({run,status:m.status,cleaned:m.cleaned,report:path.relative(root,path.join(out,'report.html'))}));});

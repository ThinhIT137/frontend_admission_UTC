// One checklist item per invocation. Real Next actions + real PostgreSQL.
const fs=require('fs'),path=require('path'),{spawn}=require('child_process');
const {chromium,expect}=require('@playwright/test'),data=require('./admin-live-data.cjs');
const mode=process.argv[2]||'1',m=data.plan(),out=path.join(data.root,'tests/artifacts/admin-catalog',m.run);
if(mode==='4')m.planned.method=m.run+'100';
fs.mkdirSync(out,{recursive:true});let db,server,backend,browser,page,origin;const results=[];
const save=()=>{data.save(m);fs.writeFileSync(path.join(out,'result.json'),JSON.stringify({mode,...m,results},null,2));};
const modal=()=>page.getByRole('dialog').last();
async function step(name,fn){try{await fn();results.push({name,status:'PASS'});await page.screenshot({path:path.join(out,results.length+'.png')});console.log(JSON.stringify({name,status:'PASS'}));}catch(e){results.push({name,status:'FAIL',error:e.message});await page?.screenshot({path:path.join(out,'failure.png')}).catch(()=>{});throw e;}finally{save();}}
async function go(route){await page.bringToFront();await page.goto(origin+route,{waitUntil:'networkidle',timeout:120000});await page.waitForFunction(()=>[...document.querySelectorAll('button')].some(b=>Object.keys(b).some(k=>k.startsWith('__reactProps'))));}
async function submit(){const d=modal();await d.locator('button[type=submit]').click();await expect(d).toHaveCount(0,{timeout:60000});}
async function programRow(){await page.getByPlaceholder('Tìm theo tên CTĐT hoặc mã...').fill(m.planned.program);return page.locator('tbody tr').filter({hasText:m.planned.program});}
async function main(){
 db=await data.connect();const password=await data.setup(m);save();
 if(mode==='13'){
  m.knowledgeId=require('crypto').randomUUID();m.knowledgeQuestion=m.run+' '+('LongQuestion'.repeat(24));m.knowledgeTopic=m.run+' — '+('Niên giám K64 UTC > Chương trình đào tạo > Học kỳ > '.repeat(8));save();
  await db.query('INSERT INTO tri_thuc_ai(ma_tri_thuc,chu_de,cau_hoi_mau,noi_dung,trang_thai,ma_admin_phu_trach,create_at) VALUES($1,$2,$3,$4,$5,$6,NOW())',[m.knowledgeId,m.knowledgeTopic,m.knowledgeQuestion,'KIỂM THỬ GIAO DIỆN — không dùng để trả lời thí sinh. '+('LongAnswer'.repeat(55)),'inactive',m.actor]);
 }
 if(mode==='1'||mode==='3'){
  for(let i=0;i<4;i++){await db.query('INSERT INTO danh_muc_mon_hoc(ma_mon,ten_mon) VALUES($1,$2)',[m.planned.subjects[i],m.run+' subject '+i]);m.owned.danh_muc_mon_hoc.push(m.planned.subjects[i]);}
  if(mode==='3')for(const [code,last]of [[m.planned.combination,2],[m.planned.combination+'X',3]]){await db.query('INSERT INTO to_hop_xet_tuyen(ma_to_hop,ma_mon_1,ma_mon_2,ma_mon_3) VALUES($1,$2,$3,$4)',[code,m.planned.subjects[0],m.planned.subjects[1],m.planned.subjects[last]]);m.owned.to_hop_xet_tuyen.push(code);}
 }
 const majors=(await db.query('SELECT ma_nganh FROM nganh_hoc ORDER BY ma_nganh LIMIT 2')).rows;
 if(mode==='9')for(const code of [m.planned.program,m.planned.program+'X']){
  m.owned.chuong_trinh_dao_tao.push(code);save();await db.query('INSERT INTO chuong_trinh_dao_tao(ma_chuong_trinh,ma_nganh,ten_chuong_trinh,ma_admin_quan_ly,chuan_dau_ra) VALUES($1,$2,$3,$4,$5)',[code,majors[0].ma_nganh,m.run+' same program',m.actor,['KY_SU']]);
 }
 if(mode==='2'&&majors.length<2)throw Error('Two actual majors required');
 if(mode==='3'||mode==='5'||mode==='6'||mode==='10'||mode==='11'||mode==='14'){
  await db.query('INSERT INTO chuong_trinh_dao_tao(ma_chuong_trinh,ma_nganh,ten_chuong_trinh,ma_admin_quan_ly,chuan_dau_ra) VALUES($1,$2,$3,$4,$5)',[m.planned.program,majors[0].ma_nganh,m.run+' program',m.actor,['KY_SU']]);m.owned.chuong_trinh_dao_tao.push(m.planned.program);
  if(mode==='3')for(const year of [2025,2026])await db.query('INSERT INTO ctdt_to_hop(ma_ctdt_to_hop,ma_chuong_trinh,ma_to_hop,nam) VALUES(gen_random_uuid(),$1,$2,$3)',[m.planned.program,m.planned.combination,year]);
 }
 if(mode==='5'||mode==='6'||mode==='10'||mode==='11'||mode==='14')for(const[code,group,max]of [[m.planned.method,'THPT',30],[m.planned.method+'X','TSA',100]]){
  await db.query('INSERT INTO phuong_thuc_xet_tuyen(ma_phuong_thuc,ten_phuong_thuc,nhom_xet_tuyen,diem_toi_thieu,diem_toi_da) VALUES($1,$2,$3,0,$4)',[code,m.run+' '+group,group,max]);m.owned.phuong_thuc_xet_tuyen.push(code);
 }
 if(mode==='14'){
  const id=require('crypto').randomUUID();m.owned.lich_su_diem_chuan.push(id);save();await db.query('INSERT INTO lich_su_diem_chuan(ma_ls_dc,ma_chuong_trinh,nam,chi_tieu,trung_tuyen,ma_admin_cap_nhat,create_at) VALUES($1,$2,2026,50,12,$3,NOW())',[id,m.planned.program,m.actor]);
 }
 if(mode==='6'){
  m.lockYear=2098;const occupied=await db.query('SELECT (SELECT count(*) FROM lich_su_diem_chuan WHERE nam=$1)+(SELECT count(*) FROM admission_year_lock WHERE nam=$1) n',[m.lockYear]);if(Number(occupied.rows[0].n))throw Error('Reserved test year is occupied; no lock applied');
  const q=require('crypto').randomUUID();m.testScoreId=require('crypto').randomUUID();m.owned.lich_su_diem_chuan.push(q);m.owned.diem_trung_tuyen.push(m.testScoreId);save();
  await db.query('INSERT INTO lich_su_diem_chuan(ma_ls_dc,ma_chuong_trinh,nam,chi_tieu,ma_admin_cap_nhat,create_at) VALUES($1,$2,$3,50,$4,NOW())',[q,m.planned.program,m.lockYear,m.actor]);
  await db.query('INSERT INTO diem_trung_tuyen(ma_diem_tt,ma_ls_dc,ma_phuong_thuc,diem,create_at) VALUES($1,$2,$3,25,NOW())',[m.testScoreId,q,m.planned.method]);
 }
 if(mode==='1')m.owned.to_hop_xet_tuyen.push(m.planned.combination,m.planned.combination+'X');
 save();
 const probe=require('net').createServer();await new Promise(r=>probe.listen(0,'127.0.0.1',r));const port=probe.address().port;await new Promise(r=>probe.close(r));origin='http://127.0.0.1:'+port;
 let scoreUrl=data.settings.API_APPLICATION_SCORE;
 if((mode==='5'||mode==='6')&&!process.argv.includes('--deployed-score')){
  const s=require('net').createServer();await new Promise(r=>s.listen(0,'127.0.0.1',r));const bp=s.address().port;await new Promise(r=>s.close(r));scoreUrl='http://127.0.0.1:'+bp;
  const env=require('dotenv').parse(fs.readFileSync(path.resolve(data.root,'../backend_admission/backend_application_score/.env')));
  backend=spawn(path.resolve(data.root,'../backend_admission/backend_application_score/.venv/Scripts/python.exe'),['-B','-m','uvicorn','app:app','--host','127.0.0.1','--port',String(bp),'--no-access-log'],{cwd:path.join(data.root,'tests/artifacts/admin-catalog',mode==='6'?'backend-year-lock':'backend'),env:{...process.env,...env},windowsHide:true,stdio:'ignore'});
  const deadline=Date.now()+60000;while(true){if(Date.now()>deadline||backend.exitCode!==null)throw Error('Owned score server not ready');try{if((await fetch(scoreUrl+'/health')).ok)break;}catch{}await new Promise(r=>setTimeout(r,400));}
 }
 const production=process.argv.includes('--production'),serverRoot=process.env.ADMISSION_TEST_FRONTEND_ROOT||data.root;
 server=spawn(process.execPath,['node_modules/next/dist/bin/next',...(production?['start']:['dev','--webpack']),'--hostname','127.0.0.1','--port',String(port)],{cwd:serverRoot,env:{...process.env,...data.settings,...(scoreUrl?{API_APPLICATION_SCORE:scoreUrl}:{}),ADMISSION_E2E:production?'0':'1',ADMISSION_LIVE_SCORE:'0',NEXT_TELEMETRY_DISABLED:'1'},windowsHide:true,stdio:'ignore'});m.origin=origin;m.production=production;save();
 const end=Date.now()+120000;while(true){if(Date.now()>end||server.exitCode!==null)throw Error('Owned server not ready');try{if((await fetch(origin+'/admin/login')).ok)break;}catch{}await new Promise(r=>setTimeout(r,500));}
 browser=await chromium.launch({channel:'chrome',headless:false,slowMo:120});page=await browser.newPage({viewport:{width:1366,height:900}});page.setDefaultTimeout(45000);
 await go('/admin/login');await page.locator('input[type=text]').fill(m.email);await page.locator('input[type=password]').fill(password);await page.getByRole('button',{name:'Đăng Nhập Quản Trị',exact:true}).click();await expect(page).toHaveURL(/\/admin$/,{timeout:90000});
 if(mode==='1'){
  await go('/admin/to-hop-mon');
  async function form(code,subjects){await page.getByRole('button',{name:'Thêm Tổ Hợp',exact:true}).click();await modal().locator('input[type=text]').fill(code);for(let i=0;i<3;i++)await modal().locator('select').nth(i).selectOption(subjects[i]);}
  await step('Tạo tổ hợp ba môn khác nhau',async()=>{await form(m.planned.combination,m.planned.subjects.slice(0,3));await submit();await expect.poll(async()=>Number((await db.query('SELECT count(*) n FROM to_hop_xet_tuyen WHERE ma_to_hop=$1',[m.planned.combination])).rows[0].n)).toBe(1);});
  await step('Chặn bộ môn trùng dù đảo thứ tự',async()=>{await form(m.planned.combination+'X',m.planned.subjects.slice(0,3).reverse());await modal().locator('button[type=submit]').click();await expect(page.getByText('Bộ ba môn này đã có trong một tổ hợp khác, kể cả khi đổi thứ tự.',{exact:true})).toBeVisible();if((await db.query('SELECT 1 FROM to_hop_xet_tuyen WHERE ma_to_hop=$1',[m.planned.combination+'X'])).rowCount)throw Error('Duplicate persisted');});
  await step('Chặn lặp môn trong cùng tổ hợp',async()=>{for(let i=0;i<3;i++)await modal().locator('select').nth(i).selectOption(m.planned.subjects[0]);await modal().locator('button[type=submit]').click();await expect(page.getByText('Các môn học trong tổ hợp không được trùng nhau!',{exact:true})).toBeVisible();});
 }
 if(mode==='2'){
  await go('/admin/quan-ly-ctdt');await page.getByRole('button',{name:'Thêm CTĐT Mới',exact:true}).click();
  await step('Chọn ngành khác khi thêm CTĐT',async()=>{const d=modal();await d.locator('input[type=text]').nth(0).fill(m.planned.program);await d.locator('input[type=text]').nth(1).fill(m.run+' program');await expect(d.getByLabel('Trực thuộc ngành').locator('option')).toHaveCount((await db.query('SELECT count(*) n FROM nganh_hoc')).rows[0].n*1+1);await d.getByLabel('Trực thuộc ngành').selectOption(majors[1].ma_nganh);await submit();await data.discover(db,m);await expect.poll(async()=>(await db.query('SELECT ma_nganh FROM chuong_trinh_dao_tao WHERE ma_chuong_trinh=$1',[m.planned.program])).rows[0]?.ma_nganh).toBe(majors[1].ma_nganh);});
  await step('Đổi sang ngành khác khi sửa CTĐT',async()=>{await go('/admin/quan-ly-ctdt');const r=await programRow();await r.getByTitle('Chỉnh sửa',{exact:true}).click();await modal().getByLabel('Trực thuộc ngành').selectOption(majors[0].ma_nganh);await submit();await expect.poll(async()=>(await db.query('SELECT ma_nganh FROM chuong_trinh_dao_tao WHERE ma_chuong_trinh=$1',[m.planned.program])).rows[0].ma_nganh).toBe(majors[0].ma_nganh);});
 }
 if(mode==='3'){
  await go('/admin/quan-ly-ctdt');const r=await programRow();await r.getByRole('button',{name:'Gán tổ hợp',exact:true}).click();
  await step('Gán/bỏ tổ hợp riêng năm 2026',async()=>{await modal().getByLabel('Năm gán tổ hợp').fill('2026');await modal().getByLabel(m.planned.combination,{exact:true}).uncheck();await modal().getByLabel(m.planned.combination+'X',{exact:true}).check();await submit();const rows=(await db.query('SELECT nam,ma_to_hop FROM ctdt_to_hop WHERE ma_chuong_trinh=$1 ORDER BY nam',[m.planned.program])).rows;expect(rows).toEqual([{nam:2025,ma_to_hop:m.planned.combination},{nam:2026,ma_to_hop:m.planned.combination+'X'}]);});
  await step('Tải lại và thấy tổ hợp đã lưu',async()=>{await go('/admin/quan-ly-ctdt');const row=await programRow();await expect(row).toContainText(m.planned.combination+'X');await expect(row).toContainText('2026');});
 }
 if(mode==='4'){
  await go('/admin/phuong-thuc-xet-tuyen');
  await step('Mã chứa 100 không tự gán THPT; chọn TSA và lưu DB',async()=>{
   await page.getByRole('button',{name:'Thêm Phương Thức Mới',exact:true}).click();const d=modal();
   await d.locator('input[type=text]').nth(0).fill(m.planned.method);await d.locator('input[type=text]').nth(1).fill(m.run+' method');
   await expect(d.getByLabel('Nhóm xét tuyển')).toHaveValue('');await d.getByLabel('Nhóm xét tuyển').selectOption('TSA');
   await expect(d.getByLabel('Điểm tối đa')).toHaveValue('100');await submit();await data.discover(db,m);
   const row=(await db.query('SELECT nhom_xet_tuyen,diem_toi_da FROM phuong_thuc_xet_tuyen WHERE ma_phuong_thuc=$1',[m.planned.method])).rows[0];expect(row).toEqual({nhom_xet_tuyen:'TSA',diem_toi_da:100});
  });
  await step('Tải lại và sửa nhóm HSA, lưu thang 150',async()=>{
   await go('/admin/phuong-thuc-xet-tuyen');await page.getByPlaceholder('Tìm theo mã hoặc tên phương thức xét tuyển...').fill(m.planned.method);
   const row=page.locator('tbody tr').filter({hasText:m.planned.method});await expect(row).toContainText('ĐGTD (TSA)');await row.getByTitle('Chỉnh sửa',{exact:true}).click();
   await expect(modal().getByLabel('Nhóm xét tuyển')).toHaveValue('TSA');await modal().getByLabel('Nhóm xét tuyển').selectOption('HSA');await submit();
   expect((await db.query('SELECT nhom_xet_tuyen,diem_toi_da FROM phuong_thuc_xet_tuyen WHERE ma_phuong_thuc=$1',[m.planned.method])).rows[0]).toEqual({nhom_xet_tuyen:'HSA',diem_toi_da:150});
  });
 }
 if(mode==='7'){
  await go('/admin/quan-ly-ctdt');
  await step('Desktop: sidebar xanh như client, mục đang chọn xanh sáng/chữ trắng',async()=>{
   const sidebar=page.locator('.admin-sidebar');await expect(sidebar).toBeVisible();expect(await sidebar.evaluate(e=>getComputedStyle(e).backgroundColor)).toBe('rgb(23, 38, 83)');
   const logo=sidebar.getByRole('img',{name:'Logo Trường Đại học Giao thông Vận tải'});await expect(logo).toBeVisible();await expect(logo).toHaveAttribute('src','/utc_logo.svg');await expect.poll(()=>logo.evaluate(e=>e.naturalWidth)).toBeGreaterThan(0);
   const active=sidebar.locator('a[aria-current=page]');await expect(active).toHaveCount(1);expect(await active.evaluate(e=>getComputedStyle(e).backgroundColor)).toBe('rgb(41, 69, 141)');expect(await active.evaluate(e=>getComputedStyle(e).color)).toBe('rgb(255, 255, 255)');
  });
  await step('Mobile: menu giữ màu, mở/đóng và không tràn ngang',async()=>{
   await page.setViewportSize({width:390,height:844});await go('/admin/quan-ly-ctdt');await page.getByRole('button',{name:'Mở hoặc thu gọn menu quản trị',exact:true}).click();const drawer=page.getByRole('dialog',{name:'Điều hướng quản trị'});await expect(drawer).toBeVisible();expect(await drawer.locator('.admin-sidebar').evaluate(e=>getComputedStyle(e).backgroundColor)).toBe('rgb(23, 38, 83)');
   await drawer.screenshot({path:path.join(out,'mobile-open.png')});await page.keyboard.press('Escape');await expect(drawer).toHaveCount(0);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  });
 }
 if(mode==='8'){
  await go('/admin/chi-tieu-diem-chuan?year=2026');
  await step('Cuộn trực tiếp đến năm cũ, không chọn năm trung gian',async()=>{
   await page.getByRole('button',{name:'Năm quản lý điểm chuẩn',exact:true}).click();const list=page.getByRole('listbox',{name:'Danh sách năm tuyển sinh'});
   expect(await list.getByRole('option').count()).toBeGreaterThan(20);await list.hover();await page.mouse.wheel(0,700);await expect.poll(()=>list.evaluate(e=>e.scrollTop)).toBeGreaterThan(0);
   await list.getByRole('option',{name:'Năm 2005',exact:true}).click();await expect(page).toHaveURL(/year=2005/,{timeout:60000});
  });
  await step('Danh sách vẫn đủ năm và chọn bằng bàn phím được',async()=>{
   await go('/admin/chi-tieu-diem-chuan?year=2005');const trigger=page.getByRole('button',{name:'Năm quản lý điểm chuẩn',exact:true});await trigger.click();const list=page.getByRole('listbox');await expect(list.getByRole('option',{name:'Năm 2026',exact:true})).toHaveCount(1);await list.press('Home');await page.keyboard.press('Enter');await expect(page).toHaveURL(/year=2027/,{timeout:60000});
  });
 }
 if(mode==='9'){
  await go('/admin/chi-tieu-diem-chuan?year=2026');
  await step('Hai CTĐT cùng tên hiển thị mã riêng và chọn đúng mã',async()=>{
   await page.getByRole('button',{name:'Thiết Lập Chỉ Tiêu',exact:true}).click();const select=modal().locator('select');
   for(const code of [m.planned.program,m.planned.program+'X'])await expect(select.locator(`option[value="${code}"]`)).toHaveText(code+' — '+m.run+' same program');
   await select.selectOption(m.planned.program+'X');await expect(select).toHaveValue(m.planned.program+'X');
  });
 }
 if(mode==='10'){
  await go('/admin/chi-tieu-diem-chuan?year=2026');
  await step('Khởi tạo chỉ tiêu chỉ lưu phương thức, chưa sinh điểm 0',async()=>{
   await page.getByRole('button',{name:'Thiết Lập Chỉ Tiêu',exact:true}).click();const d=modal();await d.locator('select').selectOption(m.planned.program);await d.locator('input[type=number]').nth(0).fill('2026');await d.locator('input[type=number]').nth(1).fill('50');
   await d.getByLabel(m.run+' THPT',{exact:false}).check();await d.getByLabel(m.run+' TSA',{exact:false}).check();await submit();await data.discover(db,m);
   expect(Number((await db.query('SELECT count(*) n FROM diem_trung_tuyen WHERE ma_ls_dc=ANY($1::text[])',[m.owned.lich_su_diem_chuan])).rows[0].n)).toBe(0);expect(Number((await db.query('SELECT count(*) n FROM cutoff_method WHERE ma_ls_dc=ANY($1::text[])',[m.owned.lich_su_diem_chuan])).rows[0].n)).toBe(2);
  });
  await step('Tải lại thấy chưa nhập điểm và để trống vẫn giữ trạng thái đó',async()=>{
   await go('/admin/chi-tieu-diem-chuan?year=2026');await page.getByPlaceholder('Tìm theo tên CTĐT hoặc mã ngành...').fill(m.planned.program);let row=page.locator('tbody tr').filter({hasText:m.run});await expect(row).toContainText('Chưa nhập điểm');await row.getByTitle('Chỉnh sửa',{exact:true}).click();await expect(modal().getByLabel('Điểm chuẩn '+m.planned.method,{exact:true})).toHaveValue('');await expect(modal().getByLabel('Điểm chuẩn '+m.planned.method+'X',{exact:true})).toHaveValue('');await submit();expect(Number((await db.query('SELECT count(*) n FROM diem_trung_tuyen WHERE ma_ls_dc=ANY($1::text[])',[m.owned.lich_su_diem_chuan])).rows[0].n)).toBe(0);
  });
  await step('Nhập điểm 0 thật được giữ nguyên; phương thức chưa nhập không bị gán 0',async()=>{
   await go('/admin/chi-tieu-diem-chuan?year=2026');await page.getByPlaceholder('Tìm theo tên CTĐT hoặc mã ngành...').fill(m.planned.program);await page.locator('tbody tr').filter({hasText:m.run}).getByTitle('Chỉnh sửa',{exact:true}).click();await modal().getByLabel('Điểm chuẩn '+m.planned.method,{exact:true}).fill('0');await submit();const rows=(await db.query('SELECT ma_phuong_thuc,diem FROM diem_trung_tuyen WHERE ma_ls_dc=ANY($1::text[])',[m.owned.lich_su_diem_chuan])).rows;expect(rows).toEqual([{ma_phuong_thuc:m.planned.method,diem:0}]);
  });
 }
 if(mode==='11'){
  await go('/admin/chi-tieu-diem-chuan?year=2026');await page.getByRole('button',{name:'Thiết Lập Chỉ Tiêu',exact:true}).click();const d=modal();await d.locator('select').selectOption(m.planned.program);await d.locator('input[type=number]').nth(0).fill('2026');await d.locator('input[type=number]').nth(1).fill('50');await d.getByLabel(m.run+' THPT',{exact:false}).check();await d.getByLabel(m.run+' TSA',{exact:false}).check();await submit();await data.discover(db,m);
  await page.getByPlaceholder('Tìm theo tên CTĐT hoặc mã ngành...').fill(m.planned.program);await page.locator('tbody tr').filter({hasText:m.run}).getByTitle('Chỉnh sửa',{exact:true}).click();
  const values=async()=>(await db.query('SELECT diem FROM diem_trung_tuyen WHERE ma_ls_dc=ANY($1::text[]) ORDER BY diem',[m.owned.lich_su_diem_chuan])).rows.map(r=>r.diem);
  await step('UI chặn THPT 31 và TSA 101',async()=>{
   await modal().getByLabel('Điểm chuẩn '+m.planned.method,{exact:true}).fill('31');await modal().getByLabel('Điểm chuẩn '+m.planned.method+'X',{exact:true}).fill('101');await modal().locator('button[type=submit]').click();expect(await modal().getByLabel('Điểm chuẩn '+m.planned.method,{exact:true}).evaluate(e=>e.validity.rangeOverflow)).toBe(true);expect(await values()).toEqual([]);
  });
  const endpoint=origin+'/api/backend/score/diem-chuan/'+m.owned.lich_su_diem_chuan[0];
  const put=(a,b)=>page.request.put(endpoint,{headers:{origin},data:{ma_chuong_trinh:m.planned.program,nam:2026,chi_tieu:50,diem_trung_tuyen:[{ma_phuong_thuc:m.planned.method,diem:a},{ma_phuong_thuc:m.planned.method+'X',diem:b}]}});
  await step('Bỏ qua UI gửi API vượt thang vẫn bị chặn, không lưu nửa chừng',async()=>{expect((await put(30,101)).status()).toBe(400);expect(await values()).toEqual([]);});
  await step('Server Action lưu đúng hai điểm biên 30/100',async()=>{await modal().getByLabel('Điểm chuẩn '+m.planned.method,{exact:true}).fill('30');await modal().getByLabel('Điểm chuẩn '+m.planned.method+'X',{exact:true}).fill('100');await submit();expect(await values()).toEqual([30,100]);});
  await step('API chặn số âm và biểu thức, giữ nguyên điểm đã lưu',async()=>{expect((await put(-1,100)).status()).toBe(400);expect((await put('3-5+8',100)).status()).toBe(400);expect(await values()).toEqual([30,100]);});
 }
 if(mode==='12'){
  await go('/admin/moc-thoi-gian');await page.getByRole('button',{name:'Thêm Mốc Mới',exact:true}).click();await modal().locator('input[type=text]').fill(m.planned.milestone);
  await step('Chặn ngày bắt đầu sau ngày kết thúc ngay trong form',async()=>{
   await modal().getByLabel('Ngày bắt đầu',{exact:true}).fill('2026-10-29');await modal().getByLabel('Ngày kết thúc',{exact:true}).fill('2026-10-13');await expect(modal().getByRole('alert')).toContainText('Ngày bắt đầu không được sau ngày kết thúc');await modal().locator('button[type=submit]').click();expect(Number((await db.query('SELECT count(*) n FROM lo_trinh_tuyen_sinh WHERE ten_su_kien=$1',[m.planned.milestone])).rows[0].n)).toBe(0);
  });
  let request;
  await step('Khoảng ngày hợp lệ lưu đúng vào DB thật',async()=>{
   await modal().getByLabel('Ngày bắt đầu',{exact:true}).fill('2026-10-13');await modal().getByLabel('Ngày kết thúc',{exact:true}).fill('2026-10-20');const captured=page.waitForRequest(r=>r.method()==='POST'&&!!r.headers()['next-action']&&!!r.postData()?.includes(m.planned.milestone));await submit();request=await captured;await data.discover(db,m);expect(m.owned.lo_trinh_tuyen_sinh.length).toBe(1);
  });
  await step('Gọi thẳng Server Action với ngày đảo vẫn bị chặn',async()=>{
   const original=request.postData();if(!original.includes('2026-10-13T'))throw Error('Expected serialized start date absent');const changed=original.replace('2026-10-13T','2026-10-29T');const r=await page.request.post(origin+'/admin/moc-thoi-gian',{headers:{origin,'next-action':request.headers()['next-action'],'content-type':request.headers()['content-type']},data:changed});const response=await r.text();if(!response.includes('Ngày bắt đầu không được sau ngày kết thúc'))throw Error('Expected server-side date validation response');expect(Number((await db.query('SELECT count(*) n FROM lo_trinh_tuyen_sinh WHERE ten_su_kien=$1',[m.planned.milestone])).rows[0].n)).toBe(1);
  });
 }
 if(mode==='13'){
  await go('/admin/du-lieu-chatbot-ai');
  await step('Nhiều chủ đề dài không ép ô tìm kiếm hoặc kéo tràn thanh lọc',async()=>{
   const search=page.getByRole('searchbox',{name:'Tìm kiếm tri thức'}),topics=page.getByLabel('Lọc theo chủ đề');const box=await search.boundingBox();if(!box||box.width<500)throw Error('Search input was squeezed');await expect(topics.locator(`option[value="${m.knowledgeTopic}"]`)).toHaveCount(1);await topics.selectOption(m.knowledgeTopic);await expect(page.locator('tbody tr').filter({hasText:m.run})).toHaveCount(1);await page.screenshot({path:path.join(out,'toolbar-desktop.png')});await topics.selectOption('ALL');await search.fill(m.run);
  });
  await step('Desktop: nội dung dài vẫn thấy nút sửa/xóa, không phải kéo ngang',async()=>{
   for(const width of [1440,1024]){await page.setViewportSize({width,height:900});const row=page.locator('tbody tr').filter({hasText:m.run});await row.scrollIntoViewIfNeeded();if((await row.boundingBox()).height>220)throw Error('Long content made row too tall');for(const title of ['Chỉnh sửa','Xóa']){const button=row.getByTitle(title,{exact:true});await expect(button).toBeVisible();const b=await button.boundingBox();if(!b||b.x<0||b.x+b.width>width)throw Error('Action outside viewport');}expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await page.screenshot({path:path.join(out,'desktop-'+width+'.png')});}
  });
  await step('Tablet/mobile: thẻ co giãn, mở sửa và hủy xóa được',async()=>{
   for(const width of [768,390]){await page.setViewportSize({width,height:900});const search=page.getByRole('searchbox',{name:'Tìm kiếm tri thức'});const box=await search.boundingBox();if(!box||box.width<250)throw Error('Mobile search was squeezed');const card=page.locator(`[data-knowledge-id="${m.knowledgeId}"]`);await card.scrollIntoViewIfNeeded();for(const name of ['Sửa','Xóa'])await expect(card.getByRole('button',{name,exact:true})).toBeVisible();expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await page.screenshot({path:path.join(out,'mobile-'+width+'.png')});}
   const card=page.locator(`[data-knowledge-id="${m.knowledgeId}"]`);await card.getByRole('button',{name:'Sửa',exact:true}).click();await expect(modal().getByPlaceholder('VD: Điểm chuẩn ngành CNTT năm vừa qua là bao nhiêu?')).toHaveValue(m.knowledgeQuestion);await modal().getByRole('button',{name:'Đóng hộp thoại',exact:true}).click();await card.getByRole('button',{name:'Xóa',exact:true}).click();await expect(page.getByRole('alertdialog')).toBeVisible();expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await page.keyboard.press('Escape');await expect(page.getByRole('alertdialog')).toHaveCount(0);expect((await db.query('SELECT count(*) n FROM tri_thuc_ai WHERE ma_tri_thuc=$1',[m.knowledgeId])).rows[0].n*1).toBe(1);
  });
 }
 if(mode==='14'){
  await go('/admin/chi-tieu-diem-chuan?year=2026');await page.getByPlaceholder('Tìm theo tên CTĐT hoặc mã ngành...').fill(m.planned.program);await page.locator('tbody tr').filter({hasText:m.run}).getByTitle('Chỉnh sửa',{exact:true}).click();
  await step('Bổ sung phương thức cho chỉ tiêu cũ mà không xóa bản ghi hoặc số trúng tuyển',async()=>{
   await modal().getByLabel('Thêm phương thức nhập điểm',{exact:true}).selectOption(m.planned.method);await expect(modal().getByLabel('Điểm chuẩn '+m.planned.method,{exact:true})).toHaveValue('');await submit();const row=(await db.query('SELECT chi_tieu,trung_tuyen FROM lich_su_diem_chuan WHERE ma_ls_dc=$1',[m.owned.lich_su_diem_chuan[0]])).rows[0];expect(row).toEqual({chi_tieu:50,trung_tuyen:12});expect(Number((await db.query('SELECT count(*) n FROM diem_trung_tuyen WHERE ma_ls_dc=$1',[m.owned.lich_su_diem_chuan[0]])).rows[0].n)).toBe(0);
  });
  await step('Nhập điểm sau đó vẫn giữ nguyên chỉ tiêu, trúng tuyển và ID lịch sử',async()=>{
   await go('/admin/chi-tieu-diem-chuan?year=2026');await page.getByPlaceholder('Tìm theo tên CTĐT hoặc mã ngành...').fill(m.planned.program);await page.locator('tbody tr').filter({hasText:m.run}).getByTitle('Chỉnh sửa',{exact:true}).click();await modal().getByLabel('Điểm chuẩn '+m.planned.method,{exact:true}).fill('25');await submit();expect((await db.query('SELECT chi_tieu,trung_tuyen FROM lich_su_diem_chuan WHERE ma_ls_dc=$1',[m.owned.lich_su_diem_chuan[0]])).rows[0]).toEqual({chi_tieu:50,trung_tuyen:12});expect((await db.query('SELECT diem FROM diem_trung_tuyen WHERE ma_ls_dc=$1',[m.owned.lich_su_diem_chuan[0]])).rows[0].diem).toBe(25);
  });
 }
 if(mode==='5'){
  await go('/admin/chi-tieu-diem-chuan?year=2026');
  await step('Khởi tạo chỉ tiêu với phương thức THPT/TSA đã cấu hình',async()=>{
   await page.getByRole('button',{name:'Thiết Lập Chỉ Tiêu',exact:true}).click();const d=modal();await d.locator('select').selectOption(m.planned.program);
   await d.locator('input[type=number]').nth(0).fill('2026');await d.locator('input[type=number]').nth(1).fill('50');
   while(await d.locator('input[type=checkbox]:checked').count())await d.locator('input[type=checkbox]:checked').first().uncheck();
   await d.getByLabel(m.run+' THPT',{exact:false}).check();await d.getByLabel(m.run+' TSA',{exact:false}).check();await submit();await data.discover(db,m);
  });
  await page.getByPlaceholder('Tìm theo tên CTĐT hoặc mã ngành...').fill(m.planned.program);let row=page.locator('tbody tr').filter({hasText:m.run});await row.getByTitle('Chỉnh sửa',{exact:true}).click();
  await step('UI chặn THPT 31/30 và TSA 101/100',async()=>{
   await modal().getByLabel('Điểm chuẩn '+m.planned.method,{exact:true}).fill('31');await modal().getByLabel('Điểm chuẩn '+m.planned.method+'X',{exact:true}).fill('101');await modal().locator('button[type=submit]').click();
   expect(await modal().getByLabel('Điểm chuẩn '+m.planned.method,{exact:true}).evaluate(e=>e.validity.rangeOverflow)).toBe(true);
   expect(await modal().getByLabel('Điểm chuẩn '+m.planned.method+'X',{exact:true}).evaluate(e=>e.validity.rangeOverflow)).toBe(true);
   if((await db.query('SELECT diem FROM diem_trung_tuyen WHERE ma_ls_dc=ANY($1::text[])',[m.owned.lich_su_diem_chuan])).rows.some(r=>r.diem!==0))throw Error('Invalid score saved');
  });
  await step('Lưu đúng biên THPT 30 và TSA 100',async()=>{await modal().getByLabel('Điểm chuẩn '+m.planned.method,{exact:true}).fill('30');await modal().getByLabel('Điểm chuẩn '+m.planned.method+'X',{exact:true}).fill('100');await submit();const values=(await db.query('SELECT diem FROM diem_trung_tuyen WHERE ma_ls_dc=ANY($1::text[]) ORDER BY diem',[m.owned.lich_su_diem_chuan])).rows.map(r=>r.diem);expect(values).toEqual([30,100]);});
  await step('API cũng chặn điểm ngoài thang và giữ nguyên DB',async()=>{
   const response=await page.request.put(origin+'/api/backend/score/diem-chuan/'+m.owned.lich_su_diem_chuan[0],{headers:{origin},data:{ma_chuong_trinh:m.planned.program,nam:2026,chi_tieu:50,diem_trung_tuyen:[{ma_phuong_thuc:m.planned.method,diem:29},{ma_phuong_thuc:m.planned.method+'X',diem:101}]}});
   expect(response.status()).toBe(400);expect((await db.query('SELECT diem FROM diem_trung_tuyen WHERE ma_ls_dc=ANY($1::text[]) ORDER BY diem',[m.owned.lich_su_diem_chuan])).rows.map(r=>r.diem)).toEqual([30,100]);
  });
 }
 if(mode==='6'){
  await go('/admin/chi-tieu-diem-chuan?year='+m.lockYear);
  await step('Xác nhận sai năm không khóa; đúng năm khóa toàn bộ năm',async()=>{
   await page.getByRole('button',{name:'Năm quản lý điểm chuẩn',exact:true}).click();await expect(page.getByRole('listbox').getByRole('option',{name:'Năm 2023',exact:true})).toHaveCount(1);await page.keyboard.press('Escape');
   await page.getByRole('button',{name:'Khóa điểm năm '+m.lockYear,exact:true}).click();await modal().getByLabel('Năm xác nhận khóa điểm').fill('2097');await modal().locator('button[type=submit]').click();await expect(modal().getByRole('alert')).toBeVisible();
   expect(Number((await db.query('SELECT count(*) n FROM admission_year_lock WHERE nam=$1',[m.lockYear])).rows[0].n)).toBe(0);
   await modal().getByLabel('Năm xác nhận khóa điểm').fill(String(m.lockYear));await submit();await go('/admin/chi-tieu-diem-chuan?year='+m.lockYear);
   expect((await db.query('SELECT ma_admin FROM admission_year_lock WHERE nam=$1',[m.lockYear])).rows[0].ma_admin).toBe(m.actor);await expect(page.getByRole('button',{name:'Thiết Lập Chỉ Tiêu',exact:true})).toBeDisabled();
  });
  await step('UI khóa điểm nhưng vẫn sửa được chỉ tiêu; điểm và ID giữ nguyên',async()=>{
   await page.getByPlaceholder('Tìm theo tên CTĐT hoặc mã ngành...').fill(m.planned.program);const r=page.locator('tbody tr').filter({hasText:m.run});await expect(r.getByTitle('Xóa',{exact:true})).toHaveCount(0);await r.getByTitle('Chỉnh sửa',{exact:true}).click();await expect(modal().getByLabel('Điểm chuẩn '+m.planned.method,{exact:true})).toBeDisabled();await modal().locator('input[type=number]').nth(0).fill('55');await submit();
   expect((await db.query('SELECT diem FROM diem_trung_tuyen WHERE ma_diem_tt=$1',[m.testScoreId])).rows[0].diem).toBe(25);expect((await db.query('SELECT chi_tieu FROM lich_su_diem_chuan WHERE ma_ls_dc=$1',[m.owned.lich_su_diem_chuan[0]])).rows[0].chi_tieu).toBe(55);
  });
  await step('API chặn sửa/xóa/thêm điểm sau khóa; năm khác không bị khóa',async()=>{
   const endpoint=origin+'/api/backend/score/diem-chuan';const body={ma_chuong_trinh:m.planned.program,nam:m.lockYear,chi_tieu:55,diem_trung_tuyen:[{ma_phuong_thuc:m.planned.method,diem:26}]};
   for(const response of [await page.request.put(endpoint+'/'+m.owned.lich_su_diem_chuan[0],{headers:{origin},data:body}),await page.request.delete(endpoint+'/'+m.owned.lich_su_diem_chuan[0],{headers:{origin}}),await page.request.post(endpoint,{headers:{origin},data:body})])expect(response.status()).toBe(409);
   const other=await page.request.get(endpoint+'/nam/2026/khoa');expect((await other.json()).locked).toBe(false);expect((await db.query('SELECT diem FROM diem_trung_tuyen WHERE ma_diem_tt=$1',[m.testScoreId])).rows[0].diem).toBe(25);
  });
 }
 m.status='PASS';
}
async function finish(){await browser?.close().catch(()=>{});for(const child of [server,backend])if(child?.pid&&child.exitCode===null)await new Promise(r=>{const p=spawn('taskkill',['/PID',String(child.pid),'/T','/F'],{windowsHide:true,stdio:'ignore'});p.on('exit',r);p.on('error',r);});await db?.end().catch(()=>{});try{if(mode==='13'&&m.knowledgeId){const clean=await data.connect();try{const own=(await clean.query('SELECT ma_admin_phu_trach FROM tri_thuc_ai WHERE ma_tri_thuc=$1',[m.knowledgeId])).rows[0];if(own&&own.ma_admin_phu_trach!==m.actor)throw Error('Knowledge ownership mismatch');await clean.query('DELETE FROM tri_thuc_ai WHERE ma_tri_thuc=$1 AND ma_admin_phu_trach=$2',[m.knowledgeId,m.actor]);}finally{await clean.end();}}if(mode==='6'&&m.lockYear){const clean=await data.connect();try{await clean.query('DELETE FROM admission_year_lock WHERE nam=$1 AND ma_admin=$2',[m.lockYear,m.actor]);}finally{await clean.end();}}await data.cleanup(m);}catch(e){m.cleanupError=e.message;process.exitCode=1;}save();console.log(JSON.stringify({run:m.run,mode,status:m.status,cleaned:m.cleaned,remaining:m.remaining,out}));}
main().catch(e=>{m.status='FAIL';m.error=e.message;process.exitCode=1;console.log(JSON.stringify({error:e.message}));}).finally(finish);

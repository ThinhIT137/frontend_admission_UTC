// Real UI -> real Next actions -> configured deployed services / real DB.
// Only this run's disposable records are written; cleanup is mandatory.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {spawn}=require('node:child_process');
const {chromium,expect}=require('@playwright/test');
const data=require('./admin-live-data.cjs');
let port,origin;
const quotaOnly=process.argv.includes('--quota-only');
const remainderOnly=process.argv.includes('--remainder-only');
const assignmentOnly=process.argv.includes('--assignment-only')||remainderOnly;
const m=data.plan(),results=[];
let server,browser,db,page;
let finalPromise;
const pass=new Set();
function persist(){m.results=results;data.save(m);}
async function check(name,fn,dependencies=[]){
 if(finalPromise)return;
 if(db?.transportErrorCode){const error=new Error('Verification database transport failed; aborting further UI writes');error.code='VERIFICATION_TRANSPORT';throw error;}
 if(dependencies.some(x=>!pass.has(x))){results.push({name,status:'UNVERIFIED',reason:'dependency failed'});persist();return;}
 m.stage=name;data.save(m);
 try{await fn();await data.discover(db,m);pass.add(name);results.push({name,status:'PASS'});persist();console.log(JSON.stringify({feature:name,status:'PASS'}));}
 catch(error){
  if(db?.transportErrorCode){results.push({name,status:'UNVERIFIED',reason:'Verification database transport failed',code:db.transportErrorCode});persist();const failure=new Error('Verification database transport failed; aborting further UI writes');failure.code='VERIFICATION_TRANSPORT';throw failure;}
  await data.discover(db,m).catch(()=>{});const numeric={};for(const key of ['actual','expected'])if(typeof error[key]==='number'||typeof error[key]==='boolean')numeric[key]=error[key];results.push({name,status:'FAIL',reason:error.message.split('\n')[0],...numeric,location:error.stack?.split('\n').find(line=>line.includes('admin-live-run.cjs'))?.trim()});persist();console.log(JSON.stringify({feature:name,status:'FAIL',type:error.name,...numeric}));
 }
}
async function stop(){if(browser)await browser.close().catch(()=>{});if(server?.pid&&server.exitCode===null)await new Promise(resolve=>{const child=spawn('taskkill',['/PID',String(server.pid),'/T','/F'],{windowsHide:true,stdio:'ignore'});child.on('exit',resolve);child.on('error',resolve);});}
async function finish(){
 if(finalPromise)return finalPromise;
 finalPromise=(async()=>{
  await stop();if(db)await db.end().catch(()=>{});
  try{await data.cleanup(m);results.push({name:'exact fixture cleanup',status:'PASS',remaining:m.remaining});}
  catch(error){results.push({name:'exact fixture cleanup',status:'FAIL',reason:error.message,code:error.code});}
  persist();console.log(JSON.stringify({run:m.run,results,cleaned:m.cleaned,remaining:m.remaining,recovery:`node tests/e2e/admin-live-data.cjs ${m.run}`}));
  if(results.some(result=>result.status==='FAIL'))process.exitCode=1;
 })();return finalPromise;
}
function emergency(reason,error){results.push({name:'runner interruption',status:'FAIL',reason,code:error?.code,type:error?.name});persist();void finish().finally(()=>process.exit(1));}
process.once('SIGINT',()=>emergency('SIGINT'));process.once('SIGTERM',()=>emergency('SIGTERM'));
process.once('uncaughtException',error=>emergency('uncaught exception',error));
process.once('unhandledRejection',error=>emergency('unhandled rejection',error));
async function boot(){
 const portProbe=require('node:net').createServer();await new Promise((resolve,reject)=>{portProbe.once('error',reject);portProbe.listen(0,'127.0.0.1',resolve);});port=portProbe.address().port;await new Promise(resolve=>portProbe.close(resolve));origin=`http://127.0.0.1:${port}`;m.port=port;data.save(m);
 const occupied=await fetch(origin+'/admin/login',{signal:AbortSignal.timeout(1000)}).then(()=>true,()=>false);assert.equal(occupied,false,'owned port must be unused');
 server=spawn(process.execPath,['node_modules/next/dist/bin/next','dev','--webpack','--hostname','127.0.0.1','--port',String(port)],{cwd:data.root,env:{...process.env,...data.settings,ADMISSION_LIVE_SCORE:'1',NEXT_TELEMETRY_DISABLED:'1'},windowsHide:true,stdio:'ignore'});
 m.ownedServerPid=server.pid;m.ownedRunnerPid=process.pid;m.ownedServerStartedAt=new Date().toISOString();data.save(m);server.on('error',()=>{});
 const deadline=Date.now()+120000;while(Date.now()<deadline){if(server.exitCode!==null)throw Error('Owned Next server exited');try{if((await fetch(origin+'/admin/login',{signal:AbortSignal.timeout(10000)})).ok)return;}catch{}await new Promise(resolve=>setTimeout(resolve,500));}throw Error('Owned Next server not ready');
}
async function ready(){await expect(page.locator('main')).toBeVisible({timeout:60000});if(await page.locator('main button').count())await page.waitForFunction(()=>[...document.querySelectorAll('main button')].some(button=>Object.keys(button).some(key=>key.startsWith('__reactProps'))));}
async function go(route){await page.goto(origin+route,{waitUntil:'networkidle',timeout:120000});await ready();}
async function reload(){await page.reload({waitUntil:'networkidle'});await ready();}
const dialog=()=>page.locator('[role=dialog][aria-modal=true]').last();
async function save(){const modal=dialog();await modal.locator('button[type=submit]').click();await expect(modal).toHaveCount(0,{timeout:30000});}
async function row(code,search){if(search)await page.getByPlaceholder(search).fill(code);const result=page.locator('tbody tr').filter({hasText:code});await expect(result).toHaveCount(1,{timeout:30000});return result;}
async function exists(table,key,value){return (await db.query(`SELECT * FROM "${table}" WHERE "${key}"=$1`,[value])).rows;}
async function deleteRow(record){
 await record.getByTitle('Xóa',{exact:true}).click();
 const confirmation=page.locator('[role=alertdialog],[role=dialog][aria-modal=true]').last();await confirmation.waitFor();
 if(await confirmation.getAttribute('role')==='alertdialog')await confirmation.getByRole('button',{name:'Xác nhận',exact:true}).click();
 else await confirmation.locator('button[type=submit]').click();
 await expect(record).toHaveCount(0,{timeout:30000});
}
async function simpleCatalog({name,route,button,code,label,table,key,nameColumn,search,editNameIndex=0}){
 await go(route);await page.getByRole('button',{name:button,exact:true}).click();let inputs=dialog().locator('input[type=text]');await inputs.nth(0).fill(code);await inputs.nth(1).fill(label);await save();
 let stored=await exists(table,key,code);assert.equal(stored.length,1);assert.equal(stored[0][nameColumn],label);
 await reload();let record=await row(code,search);await record.getByTitle('Chỉnh sửa',{exact:true}).click();inputs=dialog().locator('input[type=text]');await inputs.nth(editNameIndex).fill(label+' updated');await save();
 assert.equal((await exists(table,key,code))[0][nameColumn],label+' updated');await reload();await row(code,search);
}

async function verifyCatalogDeletions(){
  const deletionCases=[
   ['program','/admin/quan-ly-ctdt',m.planned.program,'Tìm theo tên CTĐT hoặc mã...','chuong_trinh_dao_tao','ma_chuong_trinh','program create edit reload'],
   ['major','/admin/quan-ly-nganh-hoc',m.planned.major,'Tìm theo mã ngành hoặc tên ngành...','nganh_hoc','ma_nganh','major create edit reload'],
   ['faculty','/admin/quan-ly-khoi-nganh',m.planned.faculty,'Tìm theo tên hoặc mã khoa...','khoi_nganh','ma_khoi_nganh','faculty create edit reload'],
   ['combination','/admin/to-hop-mon',m.planned.combination,'Tìm theo mã hoặc tên môn...','to_hop_xet_tuyen','ma_to_hop','combination create edit assignment'],
   ...m.planned.subjects.map((id,i)=>['subject '+(i+1),'/admin/mon-xet-tuyen',id,'Tìm theo mã hoặc tên môn...','danh_muc_mon_hoc','ma_mon','subject '+(i+1)+' create edit reload']),
   ['method','/admin/phuong-thuc-xet-tuyen',m.planned.method,'Tìm theo mã hoặc tên phương thức xét tuyển...','phuong_thuc_xet_tuyen','ma_phuong_thuc','method create edit reload'],
  ];
  for(const[name,route,id,search,table,key,dependency]of deletionCases)await check(name+' UI delete',async()=>{await go(route);await deleteRow(await row(id,search));assert.equal((await exists(table,key,id)).length,0);},[dependency]);
}

(async()=>{let password;
 try{
  db=await data.connect();await boot();password=await data.setup(m);
  browser=await chromium.launch({channel:'chrome',headless:true});const context=await browser.newContext({viewport:{width:1440,height:1000}});page=await context.newPage();page.setDefaultTimeout(20000);page.on('pageerror',error=>{m.browserErrors??=[];m.browserErrors.push(error.message.split('\n')[0]);data.save(m);});
  await check('real admin login',async()=>{await page.goto(origin+'/admin/login');await page.locator('input[type=text]').fill(m.email);await page.locator('input[type=password]').fill(password);await page.getByRole('button',{name:'Đăng Nhập Quản Trị',exact:true}).click();await expect(page).toHaveURL(new RegExp('/admin$'),{timeout:60000});});
  assert.ok(pass.has('real admin login'),'login failed; no further mutations');
  if(quotaOnly||assignmentOnly){
   m.fixtureMode=remainderOnly?'remainder-only':assignmentOnly?'assignment-only':'quota-only';data.save(m);
   await db.query('BEGIN');
   try{
    await db.query('INSERT INTO khoi_nganh(ma_khoi_nganh,ten_khoi_nganh) VALUES($1,$2)',[m.planned.faculty,m.run+' faculty']);
    await db.query('INSERT INTO nganh_hoc(ma_nganh,ten_nganh,ma_khoi_nganh,ma_admin_quan_ly) VALUES($1,$2,$3,$4)',[m.planned.major,m.run+' major',m.planned.faculty,m.actor]);
    await db.query('INSERT INTO chuong_trinh_dao_tao(ma_chuong_trinh,ma_nganh,ten_chuong_trinh,ma_admin_quan_ly,create_at,luot_xem,chuan_dau_ra) VALUES($1,$2,$3,$4,NOW(),0,$5)',[m.planned.program,m.planned.major,m.run+(assignmentOnly?' program updated':' program'),m.actor,['KY_SU']]);
    await db.query('INSERT INTO phuong_thuc_xet_tuyen(ma_phuong_thuc,ten_phuong_thuc) VALUES($1,$2)',[m.planned.method,m.run+' method']);
    if(assignmentOnly)for(let index=0;index<m.planned.subjects.length;index++){await db.query('INSERT INTO danh_muc_mon_hoc(ma_mon,ten_mon) VALUES($1,$2)',[m.planned.subjects[index],m.run+' fixture subject '+index]);pass.add('subject '+(index+1)+' create edit reload');}
    await db.query('COMMIT');pass.add('program create edit reload');pass.add('method create edit reload');pass.add('major create edit reload');pass.add('faculty create edit reload');await data.discover(db,m);
   }catch(error){await db.query('ROLLBACK');throw error;}
  }
  if(!quotaOnly){
  if(!assignmentOnly){
  await check('faculty create edit reload',()=>simpleCatalog({route:'/admin/quan-ly-khoi-nganh',button:'Thêm Khoa / Viện Mới',code:m.planned.faculty,label:m.run+' faculty',table:'khoi_nganh',key:'ma_khoi_nganh',nameColumn:'ten_khoi_nganh',search:'Tìm theo tên hoặc mã khoa...',editNameIndex:1}));
  for(let i=0;i<4;i++)await check('subject '+(i+1)+' create edit reload',()=>simpleCatalog({route:'/admin/mon-xet-tuyen',button:'Thêm Môn Học',code:m.planned.subjects[i],label:m.run+' subject '+i,table:'danh_muc_mon_hoc',key:'ma_mon',nameColumn:'ten_mon',search:'Tìm theo mã hoặc tên môn...',editNameIndex:1}));
  await check('method create edit reload',()=>simpleCatalog({route:'/admin/phuong-thuc-xet-tuyen',button:'Thêm Phương Thức Mới',code:m.planned.method,label:m.run+' method',table:'phuong_thuc_xet_tuyen',key:'ma_phuong_thuc',nameColumn:'ten_phuong_thuc',search:'Tìm theo mã hoặc tên phương thức xét tuyển...',editNameIndex:0}));
  await check('major create edit reload',async()=>{
   await go('/admin/quan-ly-nganh-hoc');await page.getByRole('button',{name:'Thêm Ngành Học',exact:false}).click();const modal=dialog();await modal.locator('input[type=text]').nth(0).fill(m.planned.major);await modal.locator('input[type=text]').nth(1).fill(m.run+' major');await modal.getByPlaceholder('Gõ để tìm kiếm hoặc chọn...').fill(m.run+' faculty');await modal.locator('li').filter({hasText:m.run+' faculty'}).first().click();await save();assert.equal((await exists('nganh_hoc','ma_nganh',m.planned.major)).length,1);
   await reload();let record=await row(m.planned.major,'Tìm theo mã ngành hoặc tên ngành...');await record.getByTitle('Chỉnh sửa',{exact:true}).click();await dialog().locator('input[type=text]').nth(1).fill(m.run+' major updated');await save();assert.equal((await exists('nganh_hoc','ma_nganh',m.planned.major))[0].ten_nganh,m.run+' major updated');
  },['faculty create edit reload']);
  await check('program create edit reload',async()=>{
   await go('/admin/quan-ly-ctdt');await page.getByRole('button',{name:'Thêm CTĐT Mới',exact:true}).click();const modal=dialog();await modal.getByPlaceholder('Vd: 7480201CLC').fill(m.planned.program);await modal.getByPlaceholder('Vd: Kỹ sư Phần mềm Chất lượng cao').fill(m.run+' program');await modal.getByPlaceholder('Gõ để tìm kiếm...').fill(m.run+' major');await modal.locator('li').filter({hasText:m.run+' major'}).first().click();await save();assert.equal((await exists('chuong_trinh_dao_tao','ma_chuong_trinh',m.planned.program)).length,1);
   await reload();let record=await row(m.planned.program,'Tìm theo tên CTĐT hoặc mã...');await record.getByTitle('Chỉnh sửa',{exact:true}).click();await dialog().getByPlaceholder('Vd: Kỹ sư Phần mềm Chất lượng cao').fill(m.run+' program updated');await save();assert.equal((await exists('chuong_trinh_dao_tao','ma_chuong_trinh',m.planned.program))[0].ten_chuong_trinh,m.run+' program updated');
  },['major create edit reload']);
  }
  await check('combination create edit assignment',async()=>{
   await go('/admin/to-hop-mon');await page.getByRole('button',{name:'Thêm Tổ Hợp',exact:true}).click();await dialog().locator('input[type=text]').fill(m.planned.combination);for(let i=0;i<3;i++)await dialog().locator('select').nth(i).selectOption(m.planned.subjects[i]);await save();assert.equal((await exists('to_hop_xet_tuyen','ma_to_hop',m.planned.combination)).length,1);
   await reload();let record=await row(m.planned.combination,'Tìm theo mã hoặc tên môn...');await record.getByTitle('Chỉnh sửa',{exact:true}).click();await dialog().locator('select').nth(2).selectOption(m.planned.subjects[3]);await save();assert.equal((await exists('to_hop_xet_tuyen','ma_to_hop',m.planned.combination))[0].ma_mon_3,m.planned.subjects[3]);
   if(pass.has('program create edit reload')){record=await row(m.planned.combination,'Tìm theo mã hoặc tên môn...');await record.click();const modal=dialog();await modal.getByPlaceholder('Tìm kiếm theo mã hoặc tên chương trình đào tạo...').fill(m.planned.program);await modal.locator('label').filter({hasText:m.planned.program}).locator('input[type=checkbox]').check();await modal.getByRole('button',{name:'Thêm (1)',exact:true}).click();await expect(modal.locator('tbody tr').filter({hasText:m.run})).toHaveCount(1);await expect.poll(async()=>Number((await db.query('SELECT count(*) n FROM ctdt_to_hop WHERE ma_chuong_trinh=$1 AND ma_to_hop=$2',[m.planned.program,m.planned.combination])).rows[0].n)).toBe(1);await data.discover(db,m);page.once('dialog',d=>d.accept());await modal.locator('tbody tr').filter({hasText:m.run}).getByTitle('Xóa',{exact:true}).click();await expect.poll(async()=>Number((await db.query('SELECT count(*) n FROM ctdt_to_hop WHERE ma_chuong_trinh=$1',[m.planned.program])).rows[0].n)).toBe(0);await expect(modal).toHaveAttribute('aria-busy','false');await page.keyboard.press('Escape');await expect(modal).toHaveCount(0);}
  },['subject 1 create edit reload','subject 2 create edit reload','subject 3 create edit reload','subject 4 create edit reload']);
  }
  if(!assignmentOnly){
  await check('quota create duplicate preserve update twice delete',async()=>{
   m.stage='quota create picker';data.save(m);
   const year=new Date().getFullYear();await go('/admin/chi-tieu-diem-chuan');
   const opener=page.getByRole('button',{name:'Thiết Lập Chỉ Tiêu',exact:true});
   await expect.poll(async()=>opener.evaluate(button=>Object.keys(button).some(key=>key.startsWith('__reactProps')&&typeof button[key]?.onClick==='function'))).toBe(true);
   await opener.click();m.modalDiagnostics=await page.locator('[role=dialog]').evaluateAll(nodes=>nodes.map(node=>({modal:node.getAttribute('aria-modal'),visible:node.getBoundingClientRect().height>0,selects:node.querySelectorAll('select').length})));data.save(m);
   let modal=page.getByRole('dialog',{name:'Khởi Tạo Chỉ Tiêu Tuyển Sinh Mới',exact:true});
   m.picker=await modal.locator('select').evaluate(select=>({count:select.options.length,own:[...select.options].filter(option=>option.value.startsWith('AL')).length}));data.save(m);
   assert.equal(await modal.locator('option').evaluateAll((options,id)=>options.some(option=>option.value===id),m.planned.program),true,'own program missing from real quota picker');
   await modal.locator('select').selectOption(m.planned.program);await modal.locator('input[type=number]').nth(1).fill('2');for(const checkbox of await modal.locator('input[type=checkbox]').all())await checkbox.uncheck();await modal.locator('label').filter({hasText:m.run+' method'}).locator('input[type=checkbox]').check();m.stage='quota UI create write';data.save(m);await save();
   const apiPath=`/api/backend/score/diem-chuan?ma_chuong_trinh=${encodeURIComponent(m.planned.program)}&nam=${year}`;
   const readOwn=async()=>{const response=await context.request.get(origin+apiPath);assert.equal(response.status(),200);return(await response.json()).filter(record=>record.ma_chuong_trinh===m.planned.program&&record.nam===year);};
   let rows=await readOwn();assert.equal(rows.length,1);let snapshot=JSON.stringify(rows);await data.discover(db,m);
   const access=(await context.cookies()).find(cookie=>cookie.name==='accessToken')?.value;assert.ok(access,'actual browser admin session required');
   // Detail GET is server-action-only in Next. Call the deployed API with the actual session.
   const detailResponse=await context.request.get(data.settings.API_APPLICATION_SCORE+'/diem-chuan/'+encodeURIComponent(rows[0].ma_ls_dc),{headers:{Authorization:'Bearer '+access}});m.detailStatus=detailResponse.status();data.save(m);assert.equal(detailResponse.status(),200);assert.equal((await detailResponse.json()).ma_chuong_trinh,m.planned.program);
   const noAuth=await browser.newContext();
   try{
    const rejected=await noAuth.request.post(origin+'/api/backend/score/diem-chuan',{data:{ma_chuong_trinh:m.planned.program,nam:year,chi_tieu:999,diem_trung_tuyen:[{ma_phuong_thuc:m.planned.method,diem:29}]}});
    m.missingAuthStatus=rejected.status();data.save(m);assert.ok([401,403].includes(rejected.status()),'unauthenticated quota write must be rejected');
    assert.equal(JSON.stringify(await readOwn()),snapshot,'unauthenticated request changed own quota');
   }finally{await noAuth.close();}
   m.stage='quota API duplicate';data.save(m);const duplicate=await context.request.post(origin+'/api/backend/score/diem-chuan',{data:{ma_chuong_trinh:m.planned.program,nam:year,chi_tieu:999,diem_trung_tuyen:[{ma_phuong_thuc:m.planned.method,diem:29}]}});m.duplicateStatus=duplicate.status();data.save(m);assert.equal(duplicate.status(),409,'duplicate program/year must be409');rows=await readOwn();assert.equal(JSON.stringify(rows),snapshot,'duplicate changed original record');
   for(const target of ['3','4']){m.stage='quota UI update '+target;data.save(m);await reload();let record=await row(m.run,'Tìm theo tên CTĐT hoặc mã ngành...');await record.getByTitle('Chỉnh sửa',{exact:true}).click();modal=dialog();await modal.locator('input[type=number]').first().fill(target);await modal.getByPlaceholder('Điểm Chuẩn',{exact:true}).fill('24.5');await modal.getByPlaceholder('NV Tối Đa (VD: 2)',{exact:true}).fill('2');await modal.getByPlaceholder('Điểm Ưu Tiên',{exact:true}).fill('0.5');await save();rows=await readOwn();assert.equal(rows[0].chi_tieu,Number(target));assert.equal(rows[0].diem_trung_tuyen.length,1);assert.equal(rows[0].diem_trung_tuyen[0].diem,24.5);assert.equal(rows[0].diem_trung_tuyen[0].nguyen_vong_toi_da,2);m.completedUpdates=(m.completedUpdates||0)+1;await data.discover(db,m);data.save(m);}
   await data.discover(db,m);m.stage='quota UI delete';data.save(m);await reload();await deleteRow(await row(m.run,'Tìm theo tên CTĐT hoặc mã ngành...'));assert.equal((await db.query('SELECT 1 FROM lich_su_diem_chuan WHERE ma_chuong_trinh=$1',[m.planned.program])).rowCount,0);assert.equal((await db.query('SELECT 1 FROM diem_trung_tuyen WHERE ma_ls_dc=ANY($1::text[])',[m.owned.lich_su_diem_chuan])).rowCount,0);
  },['program create edit reload','method create edit reload']);
  }
  if(assignmentOnly&&!remainderOnly)await verifyCatalogDeletions();
  if(!quotaOnly&&(!assignmentOnly||remainderOnly)){
  if(!remainderOnly){
  await check('role create edit reload',async()=>{
   await go('/admin/roles?search='+encodeURIComponent(m.planned.role));await page.getByRole('button',{name:'Thêm Vai Trò Mới',exact:true}).click();await dialog().getByPlaceholder('VD: chuyen_vien_tuyen_sinh, can_bo_khoa...').fill(m.planned.role);await save();
   let roles=(await db.query('SELECT * FROM vai_tro WHERE ten_vai_tro=$1',[m.planned.role])).rows;assert.equal(roles.length,1);await data.remember(m,'vai_tro',roles[0].ma_vai_tro);
   await reload();let record=await row(m.planned.role);await record.getByTitle('Chỉnh sửa & Cấp quyền',{exact:true}).click();await dialog().getByPlaceholder('VD: chuyen_vien_tuyen_sinh, can_bo_khoa...').fill(m.planned.role+'updated');await save();assert.equal((await exists('vai_tro','ma_vai_tro',roles[0].ma_vai_tro))[0].ten_vai_tro,m.planned.role+'updated');await reload();await row(m.planned.role+'updated');
  });
  await check('secondary account create edit reload delete',async()=>{
   await go('/admin/accounts?search='+encodeURIComponent(m.run.toLowerCase()));await page.getByRole('button',{name:'THÊM TÀI KHOẢN',exact:true}).click();let modal=dialog();await modal.getByPlaceholder('Nhập họ và tên...').fill(m.run+' secondary');await modal.getByPlaceholder('Nhập email...').fill(m.planned.accountEmail);await modal.locator('select').selectOption(m.owned.vai_tro[0]);await modal.getByPlaceholder('Nhập mật khẩu...', {exact:true}).fill(password);await modal.getByPlaceholder('Nhập lại mật khẩu...', {exact:true}).fill(password);await save();
   const accounts=(await db.query('SELECT ma_admin FROM admin WHERE email=$1',[m.planned.accountEmail])).rows;assert.equal(accounts.length,1);await data.remember(m,'admin',accounts[0].ma_admin);
   await reload();let record=await row(m.planned.accountEmail);await record.getByTitle('Chỉnh sửa',{exact:true}).click();await dialog().getByPlaceholder('Nhập họ và tên...').fill(m.run+' secondary updated');await save();assert.equal((await exists('admin','ma_admin',accounts[0].ma_admin))[0].ho_ten,m.run+' secondary updated');await reload();record=await row(m.planned.accountEmail);page.once('dialog',d=>d.accept());await record.getByTitle('Xóa',{exact:true}).click();await expect.poll(async()=>(await exists('admin','ma_admin',accounts[0].ma_admin)).length).toBe(0);
  },['role create edit reload']);
  await check('role UI delete',async()=>{await go('/admin/roles?search='+encodeURIComponent(m.planned.role));const record=await row(m.planned.role+'updated');page.once('dialog',d=>d.accept());await record.getByTitle('Xóa vai trò',{exact:true}).click();await expect.poll(async()=>(await exists('vai_tro','ma_vai_tro',m.owned.vai_tro[0])).length).toBe(0);},['secondary account create edit reload delete']);
  }
  await check('draft article create edit reload delete',async()=>{
   await go('/admin/tin-tuc-de-an');await page.getByRole('button',{name:/Đăng Tải Đề Án Mới/}).click();let modal=dialog();await modal.getByPlaceholder('VD: Đề án tuyển sinh Đại học Giao thông Vận tải K66...').fill(m.planned.article);await modal.getByPlaceholder('Nội dung chi tiết quy chế, đề án hoặc hướng dẫn...').fill(m.run+' disposable draft content');await modal.locator('select').nth(1).selectOption('DRAFT');await save();let records=(await db.query('SELECT * FROM trang_noi_dung WHERE tieu_de=$1 AND ma_admin_tac_gia=$2',[m.planned.article,m.actor])).rows;assert.equal(records.length,1);await data.remember(m,'trang_noi_dung',records[0].ma_bai_viet);
   await reload();let record=await row(m.planned.article,'Tìm theo tiêu đề văn bản, đề án tuyển sinh...');await record.getByTitle('Chỉnh sửa',{exact:true}).click();await dialog().getByPlaceholder('VD: Đề án tuyển sinh Đại học Giao thông Vận tải K66...').fill(m.planned.article+' updated');await save();assert.equal((await exists('trang_noi_dung','ma_bai_viet',records[0].ma_bai_viet))[0].tieu_de,m.planned.article+' updated');await reload();await deleteRow(await row(m.planned.article+' updated','Tìm theo tiêu đề văn bản, đề án tuyển sinh...'));assert.equal((await exists('trang_noi_dung','ma_bai_viet',records[0].ma_bai_viet)).length,0);
  });
  await check('neutral future timeline create edit reload delete',async()=>{
   await go('/admin/moc-thoi-gian');await page.getByRole('button',{name:'Thêm Mốc Mới',exact:true}).click();let modal=dialog();await modal.locator('input[type=text]').fill(m.planned.milestone);await modal.locator('input[type=date]').nth(0).fill('2099-01-01');await modal.locator('input[type=date]').nth(1).fill('2099-01-02');await modal.locator('textarea').fill(m.run+' neutral disposable verification; unrelated to admission events');await save();let records=(await db.query('SELECT * FROM lo_trinh_tuyen_sinh WHERE ten_su_kien=$1 AND ma_admin_cap_nhat=$2',[m.planned.milestone,m.actor])).rows;assert.equal(records.length,1);await data.remember(m,'lo_trinh_tuyen_sinh',records[0].ma_su_kien);
   await reload();await page.getByRole('button',{name:'Dạng Bảng',exact:true}).click();let record=await row(m.planned.milestone,'Tìm theo tên mốc hoặc nội dung...');await record.getByTitle('Chỉnh sửa',{exact:true}).click();await dialog().locator('input[type=text]').fill(m.planned.milestone+' updated');await save();assert.equal((await exists('lo_trinh_tuyen_sinh','ma_su_kien',records[0].ma_su_kien))[0].ten_su_kien,m.planned.milestone+' updated');await reload();await page.getByRole('button',{name:'Dạng Bảng',exact:true}).click();await deleteRow(await row(m.planned.milestone+' updated','Tìm theo tên mốc hoặc nội dung...'));assert.equal((await exists('lo_trinh_tuyen_sinh','ma_su_kien',records[0].ma_su_kien)).length,0);
  });
  await verifyCatalogDeletions();
  await check('profile update own actor',async()=>{await go('/admin/profile');await page.getByPlaceholder('Nhập họ và tên...').fill(m.run+' updated');await page.locator('form button[type=submit]').click();await expect.poll(async()=>(await exists('admin','ma_admin',m.actor))[0].ho_ten).toBe(m.run+' updated');await reload();await expect(page.getByPlaceholder('Nhập họ và tên...')).toHaveValue(m.run+' updated');});
  for(const route of ['/admin','/admin/thong-ke','/admin/bao-cao-trung-tuyen','/admin/ho-so','/admin/du-lieu-chatbot-ai'])await check('read '+route,async()=>{await go(route);await expect(page.locator('main h1').first()).toBeVisible();});
  }
 }catch(error){results.push({name:'runner',status:'FAIL',reason:error.message.split('\n')[0]});}
 finally{
  await finish();
 }
})();

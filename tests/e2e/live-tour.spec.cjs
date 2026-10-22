const {test,expect}=require('@playwright/test');
const {publicPages,adminPages,gaps}=require('./watch-coverage.cjs');
const {setupCase,cleanup,connect}=require('./live-data.cjs');
const fs=require('node:fs'),path=require('node:path');
const env=require('dotenv').parse(fs.readFileSync(path.resolve(__dirname,'../../.env')));
const parent=()=>process.env.ADMISSION_LIVE_RUN_ID || 'manual-watch-v2';
async function checked(response){expect(response.ok(),`API HTTP ${response.status()}: ${await response.text()}`).toBeTruthy();return response.json();}
async function login(page,m){
  await page.goto('/admin/login');
  await page.locator('input[type=text]').fill(m.email);await page.locator('input[type=password]').fill(m.password);
  // Đăng nhập là server action rồi điều hướng RSC; mạng Supabase thật có thể
  // trả phiên hợp lệ nhưng hoàn tất trang admin sau hơn 15 giây.
  await page.getByRole('button',{name:'Đăng Nhập Quản Trị',exact:true}).click();await expect(page).toHaveURL(/\/admin$/,{timeout:60000});
}
async function candidate(page,m){
  await page.goto('/nguyen-vong-cua-toi');await page.getByRole('button',{name:'Đăng ký mới',exact:true}).click();
  for(const [label,value] of [['CCCD đăng nhập',m.candidate],['Mật khẩu thí sinh',m.password],['Họ tên đăng ký',m.marker],['Điện thoại đăng ký','0'+m.candidate.slice(-9)]])await page.getByLabel(label,{exact:true}).fill(value);
  await page.getByRole('button',{name:'Tạo tài khoản',exact:true}).click();await expect(page.getByText('Đã nộp 0 nguyện vọng.',{exact:true})).toBeVisible();
}
async function submit(context,m,rank=1){
  // Ghi học bạ nhiều kỳ bằng API thật; kiểm tra form UI riêng, không giả minh chứng cloud.
  return checked(await context.request.post('/api/backend/score/ho-so',{data:{ma_chuong_trinh:m.program,ma_phuong_thuc:m.method,
    nam_tuyen_sinh:new Date().getFullYear(),nguyen_vong:rank,bang_diem:[1,2].map(hoc_ky=>({loai_diem:'lop_12',nam_hoc:new Date().getFullYear(),hoc_ky,diem_mon:[{ma_mon:m.subject,diem_so:hoc_ky===1?8:9}]}))}}));
}
test('[HOST01] HTTP: host 127.0.0.1 phải nhận Origin cùng host như localhost',async({playwright},info)=>{
  info.annotations.push({type:'Mức kiểm tra',description:'HTTP chẩn đoán tương thích host; action không hợp lệ, không ghi DB/OTP. Giữ lỗi nếu same-origin bị từ chối.'});
  const origin=`http://127.0.0.1:${process.env.ADMISSION_WATCH_PORT||3300}`;
  const request=await playwright.request.newContext();try{
    const response=await request.post(origin+'/api/candidate/session',{headers:{Origin:origin},data:{action:'invalid'}});
    expect(response.status(),'Cùng Origin phải đến bước kiểm tra action (400), không bị chặn host (403)').toBe(400);
  }finally{await request.dispose();}
});
for(const [id,name,route] of publicPages)test(`[${id}] Thí sinh: mở và cuộn trang ${name}`,async({page},info)=>{
  info.annotations.push({type:'Mức kiểm tra',description:'UI đọc / HTTP; chưa phải toàn bộ nghiệp vụ'});
  const response=await page.goto(route);expect(response.status()).toBe(200);await expect(page.locator('main').first()).toBeVisible();
  await expect(page.locator('h1,h2').first()).toBeVisible();
});
test('[TS10] Tìm ngành: nhập từ khóa, lọc phương thức và kiểm tra không có kết quả',async({page})=>{
  await page.goto('/tra-cuu-nganh-hoc');const search=page.getByPlaceholder('Ví dụ: Logistics, CNTT,...');
  await search.fill('KhôngCóNgành'+Date.now());
  await expect(page.locator('main')).toContainText(/không tìm|không có/i);
  await search.fill('');const methods=page.getByLabel('Phương thức lọc ngành');
  if(await methods.locator('option').count()>1)await methods.selectOption(await methods.locator('option').nth(1).getAttribute('value'));
  await expect(methods).toBeVisible();
});
test('[TS11] So sánh: chọn hai chương trình thật và đọc bảng đối chiếu',async({page})=>{
  await page.goto('/so-sanh-chuong-trinh');const first=page.getByLabel('Chương trình 1',{exact:true});
  const options=await first.locator('option').evaluateAll(nodes=>[...new Set(nodes.map(n=>n.value).filter(Boolean))]);
  expect(options.length,'Cần ít nhất hai chương trình trong database').toBeGreaterThanOrEqual(2);
  const second=page.getByLabel('Chương trình 2',{exact:true}),third=page.getByLabel('Chương trình 3',{exact:true});
  await expect(third).toHaveValue('');
  await page.getByRole('button',{name:'So sánh',exact:true}).click();await expect(page.getByRole('alert')).toContainText('Vui lòng chọn');
  await first.selectOption(options[0]);await second.selectOption(options[1]);
  await expect(first).toHaveValue(options[0]);await expect(second).toHaveValue(options[1]);await expect(third).toHaveValue('');
  await expect(second.locator(`option[value="${options[0]}"]`)).toBeDisabled();
  await page.getByRole('button',{name:'So sánh',exact:true}).click();await expect(page.getByRole('table')).toBeVisible();
  await expect(page.getByRole('table').getByRole('columnheader')).toHaveCount(3);
});
for(const [id,name,route] of adminPages)test(`[${id}] Tuyển sinh: đọc trang ${name}`,async({page},info)=>{
  info.annotations.push({type:'Mức kiểm tra',description:'UI đọc có xác thực; CRUD chưa được chứng minh bởi ca này'});
  const m=await setupCase(parent(),id);try{await login(page,m);const response=await page.goto(route);expect(response.status()).toBe(200);await expect(page).toHaveURL(new RegExp(route.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'/?$'));await expect(page.locator('main').first()).toBeVisible();await expect(page.locator('h1,h2').first()).toBeVisible();}finally{await cleanup(m.run);}
});
test('[TS12] Mở chi tiết một chương trình có thật trong database',async({page})=>{
  await page.goto('/so-sanh-chuong-trinh');const id=await page.getByLabel('Chương trình 1',{exact:true}).locator('option').nth(1).getAttribute('value');expect(id).toBeTruthy();
  const response=await page.goto('/tra-cuu-nganh-hoc/'+encodeURIComponent(id));expect(response.status()).toBe(200);await expect(page.locator('main')).toContainText(id);
});
test('[AUTH01] Khách bị chặn admin; mật khẩu sai không cấp cookie đăng nhập',async({page,context})=>{
  await page.goto('/admin/accounts');await expect(page).toHaveURL(/\/admin\/login/);
  const m=await setupCase(parent(),'mật khẩu sai');try{
    await page.locator('input[type=text]').fill(m.email);await page.locator('input[type=password]').fill('SaiMatKhau!');
    await page.getByRole('button',{name:'Đăng Nhập Quản Trị',exact:true}).click();
    await expect(page.locator('form .text-red-500')).toBeVisible();expect((await context.cookies()).some(c=>c.name==='accessToken')).toBe(false);
  }finally{await cleanup(m.run);}
});
test('[AUTH02] Chuyên viên không được mở quản lý tài khoản và vai trò',async({page})=>{
  const m=await setupCase(parent(),'quyền chuyên viên');try{
    const db=await connect();try{const role=(await db.query("SELECT ma_vai_tro FROM vai_tro WHERE ten_vai_tro='chuyen_vien' LIMIT 1")).rows[0];expect(role,'Cần vai trò chuyên viên có sẵn').toBeTruthy();await db.query('UPDATE admin SET ma_vai_tro=$1 WHERE ma_admin=$2 AND email=$3',[role.ma_vai_tro,m.admin,m.email]);}finally{await db.end();}
    await login(page,m);for(const route of ['/admin/accounts','/admin/roles']){await page.goto(route);await expect(page).toHaveURL(/\/admin$/);}
  }finally{await cleanup(m.run);}
});
test('[PREF01] Tài khoản mới: nhiều nguyện vọng, đổi thứ tự, rút hồ sơ và đăng xuất',async({page,context})=>{
  const m=await setupCase(parent(),'nguyện vọng');try{
    await candidate(page,m);
    const dbRef=await connect();let secondMethod;try{secondMethod=(await dbRef.query('SELECT ma_phuong_thuc FROM phuong_thuc_xet_tuyen WHERE ma_phuong_thuc<>$1 ORDER BY ma_phuong_thuc LIMIT 1',[m.method])).rows[0]?.ma_phuong_thuc;}finally{await dbRef.end();}
    expect(secondMethod,'Backend chỉ nhận một hồ sơ/phương thức/năm; cần hai phương thức thật để test xếp nguyện vọng').toBeTruthy();
    const a=await submit(context,m,1),b=await submit(context,{...m,method:secondMethod},2);await page.reload();
    await page.getByLabel('Năm nguyện vọng').selectOption(String(new Date().getFullYear()));
    await expect(page.getByRole('article')).toHaveCount(2);
    await page.getByRole('button',{name:'Đổi thứ tự nguyện vọng',exact:true}).click();
    await page.getByLabel(`Đưa hồ sơ ${b.ma_ho_so} lên`,{exact:true}).click();await page.getByRole('button',{name:'Lưu thứ tự',exact:true}).click();
    await expect(page.getByRole('article').first()).toContainText(b.ma_ho_so);await page.reload();await expect(page.getByRole('article').first()).toContainText(b.ma_ho_so);
    const row=page.getByRole('article').filter({hasText:a.ma_ho_so});await row.getByRole('button',{name:'Rút hồ sơ',exact:true}).click();
    await page.getByLabel('Mã hồ sơ xác nhận rút').fill(a.ma_ho_so);await page.getByRole('button',{name:'Xác nhận rút và xóa hồ sơ',exact:true}).click();await expect(row).toHaveCount(0);
    const db=await connect();try{expect((await db.query('SELECT 1 FROM nguyen_vong_sinh_vien WHERE ma_ho_so=$1',[a.ma_ho_so])).rowCount).toBe(0);expect((await db.query('SELECT 1 FROM bang_diem WHERE cccd=$1',[m.candidate])).rowCount).toBeGreaterThan(0);}finally{await db.end();}
    await page.getByRole('button',{name:'Đăng xuất',exact:true}).click();await expect(page.getByRole('article')).toHaveCount(0);
    expect((await context.request.get('/api/backend/score/ho-so/cua-toi')).status()).toBe(401);
    await page.getByLabel('CCCD đăng nhập',{exact:true}).fill(m.candidate);await page.getByLabel('Mật khẩu thí sinh',{exact:true}).fill(m.password);
    await page.getByRole('button',{name:'Đăng nhập',exact:true}).click();await expect(page.getByRole('article').filter({hasText:b.ma_ho_so})).toBeVisible();
  }finally{await cleanup(m.run);}
});
for(const role of ['admin','candidate'])test(`[REFRESH-${role}] Access token 5 giây tự refresh bằng cookie thật`,async({page,context})=>{
  const m=await setupCase(parent(),'refresh '+role);try{
    if(role==='admin')await login(page,m);else await candidate(page,m);
    const {decodeJwt,SignJWT,jwtVerify}=require('jose');const secret=new TextEncoder().encode(env.JWT_ACCESSTOKEN);
    const name=role==='admin'?'accessToken':'candidateToken';const old=(await context.cookies()).find(c=>c.name===name);expect(old).toBeTruthy();
    const claims=decodeJwt(old.value);delete claims.exp;delete claims.iat;
    const token=await new SignJWT(claims).setProtectedHeader({alg:'HS256'}).setIssuedAt().setExpirationTime('5s').sign(secret);
    await context.addCookies([{name,value:token,url:`http://localhost:${process.env.ADMISSION_WATCH_PORT||3300}`,httpOnly:true,sameSite:'Lax'}]);
    console.log('ĐỢI 6 GIÂY: chỉ cookie của lượt test bị rút ngắn, không đổi TTL ứng dụng.');await page.waitForTimeout(6200);
    await checked(await context.request.get(role==='admin'?'/api/backend/score/ho-so':'/api/backend/score/ho-so/cua-toi'));
    const renewed=(await context.cookies()).find(c=>c.name===name);expect(renewed.value).not.toBe(token);expect(renewed.httpOnly).toBe(true);
    expect((await jwtVerify(renewed.value,secret)).payload.exp).toBeGreaterThan(Date.now()/1000);
  }finally{await cleanup(m.run);}
});
// Các nhóm chưa chạy luôn xuất hiện riêng trong báo cáo, không được tính là đạt.
for(const [id,name,reason] of gaps)test(`[${id}] CHƯA KIỂM TRA: ${name}`,async({},info)=>{info.annotations.push({type:'Lý do chưa kiểm tra',description:reason});test.skip(true,reason);});
module.exports={login,candidate,submit,checked,parent};

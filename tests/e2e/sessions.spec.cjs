const { test, expect } = require('@playwright/test');
const { decodeJwt, SignJWT, jwtVerify } = require('jose');
const ACCESS_SECRET = new TextEncoder().encode('sprint-test-access-secret-32-characters');
// Only test cookies are shortened. Production token issuance remains unchanged.
const TEST_ACCESS_SECONDS = 5;
async function shorten(context, cookieName) {
  const existing = (await context.cookies()).find(c=>c.name===cookieName);
  expect(existing, 'Phiên đăng nhập phải được cấp trước').toBeTruthy();
  const claims = decodeJwt(existing.value);
  delete claims.exp; delete claims.iat;
  const token = await new SignJWT(claims).setProtectedHeader({alg:'HS256'})
    .setIssuedAt().setExpirationTime(`${TEST_ACCESS_SECONDS}s`).sign(ACCESS_SECRET);
  await context.addCookies([{name:cookieName,value:token,url:'http://127.0.0.1:3300',httpOnly:true,sameSite:'Lax'}]);
  return token;
}
async function expire(page, token) {
  const delay = Math.max(0, decodeJwt(token).exp*1000-Date.now()+1200);
  console.log(`  ĐỢI ACCESS TOKEN HẾT HẠN: ${Math.ceil(delay/1000)} giây`);
  await page.evaluate(seconds => {
    const badge = document.getElementById('test-bot-status');
    if (badge) badge.textContent = `ĐANG CHỜ ACCESS TOKEN HẾT HẠN: ${seconds} giây — sau đó gọi API để kiểm tra refresh`;
  }, Math.ceil(delay/1000));
  await page.waitForTimeout(delay);
  expect(decodeJwt(token).exp).toBeLessThanOrEqual(Math.floor(Date.now()/1000));
}
async function renewed(context, name, previous) {
  const cookie = (await context.cookies()).find(c=>c.name===name);
  expect(cookie.value).not.toBe(previous);
  expect(cookie.httpOnly).toBe(true);
  expect((await jwtVerify(cookie.value,ACCESS_SECRET)).payload.exp).toBeGreaterThan(Math.floor(Date.now()/1000));
  console.log('  ĐÃ XÁC NHẬN REFRESH: cookie đổi sang token mới, chữ ký hợp lệ và còn hạn.');
}

test('Phiên admin: access token 5 giây hết hạn rồi tự refresh khi gọi API',async({page,context})=>{
  await page.goto('/admin/login');
  await page.locator('input[type=text]').fill('super_admin@example.invalid');
  await page.locator('input[type=password]').fill('SprintTest!2026');
  await page.getByRole('button',{name:'Đăng Nhập Quản Trị',exact:true}).click();
  await expect(page).toHaveURL(/\/admin$/);
  const token = await shorten(context,'accessToken');
  await expire(page,token);
  const response = await context.request.get('/api/backend/score/ho-so');
  expect(response.ok(),await response.text()).toBeTruthy();
  await renewed(context,'accessToken',token);
  await page.goto('/admin/ho-so');
  await expect(page.getByRole('heading',{name:'Quản lý hồ sơ',exact:true})).toBeVisible();
});

test('Phiên thí sinh: access token hết hạn tự refresh, xem nguyện vọng rồi logout xóa cookie',async({page,context})=>{
  const cccd = '995'+String(Date.now()).slice(-9);
  let response = await context.request.post('/api/candidate/session',{data:{action:'register',cccd,
    password:'CandidateTest!2026',ho_ten:'THÍ SINH TEST REFRESH',so_dien_thoai:'0'+cccd.slice(-9)}});
  expect(response.ok(),await response.text()).toBeTruthy();
  response = await context.request.post('/api/backend/score/ho-so',{data:{ma_chuong_trinh:'GHA14',ma_phuong_thuc:'PT200',
    ma_to_hop:'A00',nam_tuyen_sinh:new Date().getFullYear(),nguyen_vong:1,
    bang_diem:[{loai_diem:'lop_12',nam_hoc:new Date().getFullYear(),diem_mon:[{ma_mon:'TOAN',diem_so:8}]}]}});
  expect(response.ok(),await response.text()).toBeTruthy();
  const id = (await response.json()).ma_ho_so;
  await page.goto('/nguyen-vong-cua-toi');
  const own = page.getByRole('article').filter({hasText:id});
  await expect(own).toContainText('Chờ kiểm tra');
  const token = await shorten(context,'candidateToken');
  await expire(page,token);
  const pending = page.waitForResponse(r=>r.url().endsWith('/api/backend/score/ho-so/cua-toi') && r.request().method()==='GET');
  await page.getByRole('button',{name:'Tải lại danh sách',exact:true}).click();
  expect((await pending).ok()).toBeTruthy();
  await expect(own).toBeVisible();
  await renewed(context,'candidateToken',token);
  await page.getByRole('button',{name:'Đăng xuất',exact:true}).click();
  await expect(own).toHaveCount(0);
  expect((await context.cookies()).some(c=>['candidateToken','candidateRefresh'].includes(c.name))).toBe(false);
  expect((await context.request.get('/api/backend/score/ho-so/cua-toi')).status()).toBe(401);
});

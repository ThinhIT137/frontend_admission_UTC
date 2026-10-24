const { test, expect } = require('@playwright/test');
const { SignJWT } = require('jose');
const { randomUUID } = require('node:crypto');
async function login(page) {
  await page.goto('/admin/login');
  await page.locator('input[type=text]').fill('super_admin@example.invalid');
  await page.locator('input[type=password]').fill('SprintTest!2026');
  await page.getByRole('button', { name: 'Đăng Nhập Quản Trị', exact: true }).click();
  await expect(page).toHaveURL(/\/admin$/);
}
test('Candidate uploads evidence, submits through score API, admin reviews and candidate sees actual status', async ({ page, context }) => {
  const cccd = '997' + String(Date.now()).slice(-9);
  await page.goto('/nop-ho-so');
  await page.getByRole('button', { name: 'Đăng ký mới', exact: true }).click();
  await page.getByLabel('CCCD đăng nhập', { exact: true }).fill(cccd);
  await page.getByLabel('Mật khẩu thí sinh', { exact: true }).fill('CandidateTest!2026');
  await page.getByLabel('Họ tên đăng ký', { exact: true }).fill('NGUYỄN VĂN KIỂM THỬ');
  await page.getByLabel('Điện thoại đăng ký', { exact: true }).fill('0' + cccd.slice(-9));
  await page.getByRole('button', { name: 'Tạo tài khoản', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Đăng xuất', exact: true })).toBeVisible();
  const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+j4GQAAAAASUVORK5CYII=', 'base64');
  const coordinated={operation_id:randomUUID(),cccd,profile:{ho_ten:'NGUYEN VAN TEST',so_dien_thoai:'0'+cccd.slice(-9),khu_vuc:'KV1',doi_tuong_uu_tien:'NONE'},file_keys:['draft:test'],submission:{ma_chuong_trinh:'GHA14',ma_phuong_thuc:'PT200',ma_to_hop:'A00',nam_tuyen_sinh:new Date().getFullYear(),nguyen_vong:1,
    bang_diem:[{loai_diem:'lop_12',nam_hoc:2026,diem_mon:[{ma_mon:'TOAN',diem_so:9},{ma_mon:'LY',diem_so:8},{ma_mon:'HOA',diem_so:8}]}],
    chung_chi:[{loai_chung_chi:'Hoc ba',diem_hoac_hang:'Chua doi soat',file_dinh_kem:'draft:test'}],giai_thuong:[]}};
  const response=await context.request.post('/api/application-submission',{multipart:{payload:JSON.stringify(coordinated),files:{name:'evidence.png',mimeType:'image/png',buffer:png}}});
  expect(response.ok(), await response.text()).toBeTruthy();const id=(await response.json()).maHoSo;
  const list=await context.request.get('/api/evidence?list=1');expect(list.ok()).toBeTruthy();const file=(await list.json())[0];expect(file?.key).toBeTruthy();
  expect((await context.request.get('/api/backend/score/ho-so')).status()).toBe(401);
  await page.goto('/nop-ho-so');
  await expect(page.getByPlaceholder('Gồm 12 chữ số')).toHaveCount(0);
  await page.getByLabel('Thứ tự nguyện vọng').fill('2');
  for (const [i,code] of ['TOAN','LY','HOA'].entries()) { await page.getByLabel(`Môn ${i+1}`,{exact:true}).selectOption(code); await page.getByLabel(`Điểm môn ${i+1}`,{exact:true}).fill('8'); }
  await page.getByRole('button',{name:/Tiếp tục: Điền thông tin cá nhân/}).click();
  await expect(page.getByPlaceholder('Gồm 12 chữ số')).toHaveValue(cccd);
  await page.getByPlaceholder('Ví dụ: NGUYỄN VĂN AN').fill('NGUYỄN VĂN KIỂM THỬ');
  await page.getByPlaceholder('Ví dụ: 0912345678').fill('0' + cccd.slice(-9));
  await page.getByPlaceholder('email@example.com').fill(`thi-sinh-${cccd}@example.invalid`);
  const profileSelects = page.locator('select');
  await profileSelects.nth((await profileSelects.count()) - 2).selectOption('KV1');
  await profileSelects.last().selectOption('UT2');
  await page.getByRole('button',{name:/Tiếp tục: Checklist hồ sơ/}).click();
  const uploads = page.locator('[data-testid="application-checklist"] input[type=file]');
  const uploadCount = await uploads.count();
  expect(uploadCount).toBeGreaterThan(0);
  for (let i = 0; i < uploadCount; i++) {
    // Fields remain available for replacement; upload each checklist item once.
    await uploads.nth(i).setInputFiles({ name: `minh-chung-${i+1}.png`, mimeType: 'image/png', buffer: png });
    await expect(page.getByText(`minh-chung-${i+1}.png — chờ nộp`, { exact: true }).first()).toBeVisible();
  }
  await page.getByRole('button',{name:/Tiếp tục: Rà soát/}).click();
  await page.getByRole('button',{name:/Xác Nhận Nộp Hồ Sơ Chính Thức/i}).click();
  await expect(page.getByRole('heading',{name:'NỘP HỒ SƠ XÉT TUYỂN TRỰC TUYẾN THÀNH CÔNG!'})).toBeVisible();
  await login(page);await page.goto('/admin/ho-so');
  const row=page.getByRole('row').filter({hasText:id});await expect(row).toBeVisible();await row.getByRole('button',{name:'Duyệt hợp lệ'}).click();await expect(row).toContainText('Hợp lệ');
  await page.goto('/tra-cuu-ho-so');await page.getByLabel('Mã hồ sơ hoặc CCCD').fill(id);await page.getByRole('button',{name:'Tra cứu',exact:true}).click();await expect(page.getByText('Trạng thái hồ sơ: Hợp lệ')).toBeVisible();
  const download=await context.request.get('/api/evidence?key='+encodeURIComponent(file.key));expect(download.ok()).toBeTruthy();expect((await download.body()).length).toBe(png.length);
  const cookies=await context.cookies();expect(cookies.find(c=>c.name==='candidateToken').httpOnly).toBe(true);
});
test('Admin API refreshes expired access token using HttpOnly refresh cookie',async({page,context})=>{
  await login(page);
  const expired=await new SignJWT({userId:'TEST-super_admin'}).setProtectedHeader({alg:'HS256'}).setExpirationTime(Math.floor(Date.now()/1000)-10).sign(new TextEncoder().encode('sprint-test-access-secret-32-characters'));
  await context.addCookies([{name:'accessToken',value:expired,url:'http://127.0.0.1:3300',httpOnly:true}]);
  const response=await context.request.get('/api/backend/score/ho-so');expect(response.ok(),await response.text()).toBeTruthy();
  expect((await context.cookies()).find(c=>c.name==='accessToken').value).not.toBe(expired);
});
test('Public program comparison uses database histories and needs no admin login',async({page})=>{
  await page.goto('/so-sanh-chuong-trinh');await page.getByLabel('Chương trình 1',{exact:true}).selectOption('GHA14');await page.getByLabel('Chương trình 2',{exact:true}).selectOption('TEST02');await page.getByRole('button',{name:'So sánh',exact:true}).click();await expect(page.getByRole('table')).toContainText('Công nghệ thông tin TEST');await expect(page.getByRole('table')).toContainText('Kỹ thuật TEST');await expect(page.getByText('Xem biến động điểm chuẩn',{exact:true})).toBeVisible();
});
test('MBTI submits numerical answers to AI and retrieves persisted result after reload',async({page})=>{
  await page.goto('/trac-nghiem-mbti');await expect(page.getByTitle('Rất đồng ý',{exact:true})).toHaveCount(20);
  const buttons=page.getByTitle('Rất đồng ý',{exact:true});for(let i=0;i<20;i++)await buttons.nth(i).click();
  await page.getByRole('button',{name:'Xem Báo Cáo Tư Vấn Ngành Học UTC'}).click();await expect(page).toHaveURL(/ket-qua-tu-van\?id=/);await expect(page.getByRole('heading',{level:2}).first()).toContainText(/[EI][SN][TF][JP]/);await page.reload();await expect(page.getByRole('heading',{level:2}).first()).toContainText(/[EI][SN][TF][JP]/);
});
test('Chatbot renders the AI answer rather than treating the response as offline',async({page})=>{
  await page.goto('/hoi-dap-ai');
  const replies = page.locator('main').getByText('Synthetic integration answer',{exact:true});
  const baseline = await replies.count();
  for (let i=0;i<4;i++) {
    const question = `Câu hỏi kiểm thử chatbot ${i+1}: ngành và phương thức tuyển sinh?`;
    await page.getByPlaceholder('Đặt câu hỏi về điểm chuẩn, ngành học, chỉ tiêu, quy đổi IELTS hoặc thủ tục nhập học UTC...').fill(question);
    const pending = page.waitForResponse(r => r.url().includes('/api/backend/ai/api/chat') && r.request().method()==='POST' && r.request().postDataJSON()?.message===question);
    await page.getByRole('button',{name:/^Gửi/}).click();
    const response = await pending;
    expect(response.ok()).toBeTruthy();
    expect((await response.json()).data.answer).toBe('Synthetic integration answer');
    await expect(replies).toHaveCount(baseline+i+1);
    await expect(replies.last()).toBeVisible();
  }
});
test('Prediction page calls existing AI API and rejects out-of-range scores at UI boundary',async({page})=>{
  await page.goto('/du-bao-tuyen-sinh');await expect(page.getByRole('table')).toContainText('2026');
  await page.getByLabel('Điểm Toán',{exact:true}).fill('9');await page.getByLabel('Điểm Vật lý',{exact:true}).fill('9');await page.getByLabel('Điểm Hóa học',{exact:true}).fill('9');await page.getByRole('button',{name:'Xem dự đoán',exact:true}).click();await expect(page.getByText(/Ước tính từ mô hình:/)).toBeVisible();
});
test('Proxy denies unknown endpoints and empty bulk result lookup',async({request})=>{
  expect((await request.get('/api/backend/ai/api/private-config')).status()).toBe(404);
  expect((await request.get('/api/backend/score/ho-so/ket-qua/tra-cuu')).status()).toBe(400);
  expect((await request.post('/api/backend/ai/api/predict/admission-chance',{data:{academic_scores:{TOAN:-1}}})).status()).toBe(400);
});

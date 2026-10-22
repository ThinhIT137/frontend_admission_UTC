const { test, expect } = require('@playwright/test');
async function login(page, role = 'super_admin') {
  await page.goto('/admin/login');
  await page.waitForFunction(() => Object.keys(document.querySelector('input[type=text]') || {}).some(k => k.startsWith('__reactProps$')));
  await page.locator('input[type=text]').fill(`${role}@example.invalid`);
  await page.locator('input[type=password]').fill('SprintTest!2026');
  await page.getByRole('button', { name: 'Đăng Nhập Quản Trị', exact: true }).click();
  await expect(page).toHaveURL(/\/admin$/);
}
test('S1 guest cannot open admin; login creates JWT cookies', async ({ page, context }) => {
  await page.goto('/admin/accounts');
  await expect(page).toHaveURL(/\/admin\/login/);
  await login(page);
  const cookies = await context.cookies();
  for (const name of ['accessToken', 'refreshToken']) {
    const cookie = cookies.find(c => c.name === name);
    expect(cookie).toBeTruthy();
    expect(cookie.httpOnly).toBe(true);
    expect(cookie.value.split('.')).toHaveLength(3);
  }
});
test('S1 wrong password remains on login', async ({ page, context }) => {
  await page.goto('/admin/login');
  await page.locator('input[type=text]').fill('super_admin@example.invalid');
  await page.locator('input[type=password]').fill('wrong-password');
  await page.getByRole('button', { name: 'Đăng Nhập Quản Trị', exact: true }).click();
  // Production Next.js sanitizes server-action exception messages.
  await expect(page.locator('form .text-red-500')).toBeVisible();
  await expect(page.locator('form .text-red-500')).not.toBeEmpty();
  await expect(page).toHaveURL(/\/admin\/login/);
  expect((await context.cookies()).some(cookie => cookie.name === 'accessToken')).toBe(false);
});
test('S1 specialist cannot manage accounts or roles', async ({ page }) => {
  await login(page, 'chuyen_vien');
  for (const route of ['/admin/accounts', '/admin/roles']) {
    await page.goto(route);
    await expect(page).toHaveURL(/\/admin$/);
  }
});
for (const route of ['/thong-tin-tuyen-sinh', '/lo-trinh-tuyen-sinh', '/tra-cuu-nganh-hoc', '/tra-cuu-nganh-hoc/GHA14', '/nop-ho-so', '/tra-cuu-ho-so', '/tinh-diem-quy-doi', '/trac-nghiem-mbti', '/ket-qua-tu-van', '/hoi-dap-ai']) {
  test(`S3 public page and layout render ${route}`, async ({ page }) => {
    const errors = []; page.on('pageerror', err => errors.push(err.message));
    const response = await page.goto(route);
    expect(response.status()).toBe(200);
    await expect(page.locator('main').first()).toBeVisible();
    await expect(page.locator('header').first()).toBeVisible();
    await expect(page.locator('footer').first()).toBeVisible();
    await expect(page.locator('h1,h2').first()).toBeVisible();
    expect(errors).toEqual([]);
  });
}
test('S1-S4 admin pages display seeded records', async ({ page }) => {
  await login(page);
  for (const [route, text] of [['accounts', 'super_admin@example.invalid'], ['quan-ly-nganh-hoc', 'Công nghệ thông tin TEST'],
    ['quan-ly-ctdt', 'Công nghệ thông tin TEST'], ['phuong-thuc-xet-tuyen', 'Thi THPT'], ['to-hop-mon', 'A00'],
    ['moc-thoi-gian', 'Công bố kết quả TEST'], ['tin-tuc-de-an', 'Tin tuyển sinh TEST'], ['du-lieu-chatbot-ai', 'Học phí TEST']]) {
    await page.goto('/admin/' + route);
    await expect(page.locator('main').getByText(text, { exact: false }).filter({ visible: true }).first()).toBeVisible();
  }
});
test('S4 report CSV downloads seeded data and preserves candidate identifiers', async ({ page }) => {
  await login(page);
  await page.goto('/admin/bao-cao-trung-tuyen');
  await expect(page.getByText('TEST-HS2', { exact: true })).toBeVisible();
  const event = page.waitForEvent('download');
  await page.getByRole('button', { name: /Excel|CSV/i }).click();
  const download = await event;
  expect(download.suggestedFilename()).toMatch(/\.csv$/);
  const stream = await download.createReadStream();
  const buffers = []; for await (const chunk of stream) buffers.push(chunk);
  const csv = Buffer.concat(buffers).toString('utf8');
  expect(csv.charCodeAt(0)).toBe(0xFEFF);
  expect(csv).toContain('TEST-HS2');
  expect(csv).toContain("'000000000002");
});

test('S3 news create must survive page reload', async ({ page }) => {
  await login(page);
  await page.goto('/admin/tin-tuc-de-an');
  await page.getByRole('button', { name: /Đăng Tải Đề Án Mới/ }).click();
  const title = `TEST-persist-news-${Date.now()}`;
  await page.getByPlaceholder('VD: Đề án tuyển sinh Đại học Giao thông Vận tải K66...').fill(title);
  await page.getByPlaceholder('Nội dung chi tiết quy chế, đề án hoặc hướng dẫn...').fill('Synthetic test content');
  await page.getByRole('button', { name: /Lưu Thay Đổi/ }).click();
  await expect(page.getByText(title, { exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByText(title, { exact: true })).toBeVisible();
});

test('S3 chatbot knowledge create must survive page reload', async ({ page }) => {
  await login(page);
  await page.goto('/admin/du-lieu-chatbot-ai');
  await page.getByRole('button', { name: /Thêm Tri Thức/ }).click();
  const topic = `TEST-persist-knowledge-${Date.now()}`;
  await page.getByPlaceholder('VD: Điểm Chuẩn & Chỉ Tiêu, Quy Đổi IELTS...').fill(topic);
  await page.getByPlaceholder('Nhập thông tin câu trả lời chính xác để AI căn cứ phản hồi...').fill('Synthetic test knowledge');
  await page.getByRole('button', { name: /Lưu Thay Đổi/ }).click();
  await expect(page.getByRole('table').getByText(topic, { exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByRole('table').getByText(topic, { exact: true })).toBeVisible();
});

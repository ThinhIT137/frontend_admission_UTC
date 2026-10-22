const { test, expect } = require('@playwright/test');
const { Client } = require('pg');
const { TEST_DATABASE_URL } = require('../fixtures/seed.cjs');

async function checked(response) {
  expect(response.ok(), await response.text()).toBeTruthy();
  return response.json();
}

for (const outcome of ['do', 'truot']) {
  test(`Sprint 6: hồ sơ đi hết luồng và công bố kết quả ${outcome === 'do' ? 'đỗ' : 'trượt'}`, async ({ page, context }) => {
    const year = new Date().getFullYear();
    const suffix = String(Date.now());
    const cccd = '996' + suffix.slice(-9);
    const program = `BOT-S6-${outcome}-${suffix}`;
    const url = new URL(TEST_DATABASE_URL);
    if (!['127.0.0.1','localhost'].includes(url.hostname) || url.pathname !== '/admission_test') throw Error('Chỉ tạo fixture trong DB test local');
    const db = new Client({ connectionString: TEST_DATABASE_URL });
    await db.connect();
    try {
      // Each case has its own program: publication cannot affect unrelated test dossiers.
      const inserted = await db.query(`INSERT INTO chuong_trinh_dao_tao
        (ma_chuong_trinh,ma_nganh,ten_chuong_trinh,ma_admin_quan_ly,create_at,luot_xem,chuan_dau_ra)
        SELECT $1,ma_nganh,$2,ma_admin_quan_ly,NOW(),0,chuan_dau_ra
        FROM chuong_trinh_dao_tao WHERE ma_chuong_trinh='GHA14'`, [program, `Chương trình kiểm thử ${outcome}`]);
      expect(inserted.rowCount, 'Cần dữ liệu mẫu GHA14').toBe(1);
      await db.query(`INSERT INTO lich_su_diem_chuan (ma_ls_dc,ma_chuong_trinh,nam,chi_tieu,ma_admin_cap_nhat,create_at)
        VALUES ($1,$1,$2,2,'TEST-super_admin',NOW())`, [program,year]);
      await db.query(`INSERT INTO diem_trung_tuyen (ma_diem_tt,ma_ls_dc,ma_phuong_thuc,diem,create_at)
        VALUES ($1,$1,'PT200',25,NOW())`, [program]);
      await db.query(`INSERT INTO lo_trinh_tuyen_sinh
        (ma_su_kien,ten_su_kien,thoi_gian_bat_dau,thoi_gian_ket_thuc,ma_admin_cap_nhat)
        VALUES ($1,'Công bố kết quả BOT Sprint 6',NOW()-INTERVAL '1 day',NOW()+INTERVAL '1 day','TEST-super_admin')`, [program]);
    } finally { await db.end(); }

    await test.step('Chuẩn bị tài khoản và hồ sơ qua API trong DB local', async () => {
      await checked(await context.request.post('/api/candidate/session', { data: { action:'register',cccd,
        password:'CandidateTest!2026',ho_ten:'THÍ SINH KIỂM THỬ SPRINT 6',so_dien_thoai:'0'+cccd.slice(-9) } }));
    });
    const submitted = await checked(await context.request.post('/api/backend/score/ho-so', {
      data: { ma_chuong_trinh:program,ma_phuong_thuc:'PT200',ma_to_hop:'A00',nam_tuyen_sinh:year,nguyen_vong:1,
        bang_diem:[{loai_diem:'lop_12',nam_hoc:year,diem_mon:[{ma_mon:'TOAN',diem_so:9},{ma_mon:'LY',diem_so:9},{ma_mon:'HOA',diem_so:9}]}] }
    }));
    const id = submitted.ma_ho_so;
    // Candidate cannot start processing.
    expect((await context.request.patch(`/api/backend/score/xet-tuyen/${id}/bat-dau-xu-ly`, { data:{} })).status()).toBe(401);
    await page.goto('/admin/login');
    await page.locator('input[type=text]').fill('super_admin@example.invalid');
    await page.locator('input[type=password]').fill('SprintTest!2026');
    await page.getByRole('button',{name:'Đăng Nhập Quản Trị',exact:true}).click();
    await expect(page).toHaveURL(/\/admin$/);
    await page.goto('/admin/ho-so');
    const row = page.getByRole('row').filter({ hasText:id });
    await expect(row).toContainText('Chờ kiểm tra');
    await row.getByRole('button',{name:'Duyệt hợp lệ',exact:true}).click();
    await expect(row).toContainText('Hợp lệ');
    await row.getByRole('button',{name:'Bắt đầu xét tuyển',exact:true}).click();
    await expect(row).toContainText('Đang xét tuyển');
    async function clickWithAnswers(name, answers) {
      const handler = async dialog => {
        if (!answers.length) { await dialog.dismiss(); throw Error('Hộp thoại ngoài dự kiến'); }
        await dialog.accept(answers.shift());
      };
      page.on('dialog',handler);
      try { await row.getByRole('button',{name,exact:true}).click(); }
      finally { page.off('dialog',handler); }
      expect(answers).toHaveLength(0);
    }
    await clickWithAnswers('Chốt điểm đối soát', ['Bảng điểm đối soát TEST Sprint 6', outcome === 'do' ? '27' : '20']);
    await expect(page.getByText('Cập nhật thành công',{exact:true}).first()).toBeVisible();
    await clickWithAnswers(outcome === 'do' ? 'Chốt đỗ' : 'Chốt trượt', ['Quyết định được duyệt TEST Sprint 6','']);
    await expect(row.getByRole('cell').nth(4)).toHaveText(outcome === 'do' ? 'Đỗ' : 'Trượt');
    await page.goto('/nguyen-vong-cua-toi');
    const mine = page.getByRole('article').filter({hasText:id});
    await expect(mine).toContainText('Đang xét tuyển — chưa công bố kết quả');
    await expect(mine).toContainText('Nguyện vọng 1');
    await page.reload();
    await expect(mine).toContainText('Đang xét tuyển — chưa công bố kết quả');
    async function lookup() {
      await page.goto('/tra-cuu-ho-so');
      await page.getByLabel('Mã hồ sơ hoặc CCCD').fill(id);
      await page.getByRole('button',{name:'Tra cứu',exact:true}).click();
    }
    await lookup();
    await expect(page.getByText('Trạng thái hồ sơ: Đang xét tuyển — chưa công bố kết quả',{exact:true})).toBeVisible();
    await test.step('Công bố qua API admin, giới hạn đúng chương trình test', async () => {
      const payload = {nam_tuyen_sinh:year,ma_chuong_trinh:program};
      const published = await checked(await context.request.post('/api/backend/score/ho-so/cong-bo-ket-qua',{data:payload}));
      expect(published.tong).toBe(1);
      const repeated = await checked(await context.request.post('/api/backend/score/ho-so/cong-bo-ket-qua',{data:payload}));
      expect(repeated.idempotent).toBe(true);
    });
    await lookup();
    await expect(page.getByText(`Trạng thái hồ sơ: ${outcome === 'do' ? 'Đỗ' : 'Trượt'}`,{exact:true})).toBeVisible();
    await page.goto('/nguyen-vong-cua-toi');
    await expect(mine).toContainText(`Trạng thái: ${outcome === 'do' ? 'Đỗ' : 'Trượt'}`);
    await page.getByRole('button',{name:'Đăng xuất',exact:true}).click();
    await expect(page.getByText('Đăng nhập để xem tất cả nguyện vọng đã nộp của bạn.',{exact:true})).toBeVisible();
    await expect(mine).toHaveCount(0);
    expect((await context.request.patch(`/api/backend/score/xet-tuyen/${id}/bat-dau-xu-ly`,{data:{}})).status()).toBe(409);
  });
}

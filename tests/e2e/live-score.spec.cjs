const {test,expect}=require('@playwright/test');
const {setup,cleanup,connect}=require('./live-data.cjs');
const {randomUUID}=require('node:crypto');
test('Supabase thật: tạo, đọc, sửa, xóa điểm chuẩn và hồ sơ; xác nhận dọn sạch dữ liệu test',async({page,context})=>{
  const run=process.env.ADMISSION_LIVE_RUN_ID || randomUUID();
  let m;
  async function json(response){expect(response.ok(),`API HTTP ${response.status()}`).toBeTruthy();return response.json();}
  try{
    m=await setup(run);console.log('SUPABASE THẬT: tạo fixture riêng cho lượt '+run);
    await page.goto('/nguyen-vong-cua-toi');
    await page.getByRole('button',{name:'Đăng ký mới',exact:true}).click();
    await page.getByLabel('CCCD đăng nhập',{exact:true}).fill(m.candidate);
    await page.getByLabel('Mật khẩu thí sinh',{exact:true}).fill(m.password);
    await page.getByLabel('Họ tên đăng ký',{exact:true}).fill(m.marker);
    await page.getByLabel('Điện thoại đăng ký',{exact:true}).fill('0'+m.candidate.slice(-9));
    await page.getByRole('button',{name:'Tạo tài khoản',exact:true}).click();
    await expect(page.getByText('Đã nộp 0 nguyện vọng.',{exact:true})).toBeVisible();
    const submitted=await json(await context.request.post('/api/backend/score/ho-so',{data:{ma_chuong_trinh:m.program,ma_phuong_thuc:m.method,
      nam_tuyen_sinh:new Date().getFullYear(),nguyen_vong:1,bang_diem:[{loai_diem:'lop_12',nam_hoc:new Date().getFullYear(),diem_mon:[{ma_mon:m.subject,diem_so:8}]}]}}));
    console.log('TẠO THẬT: tài khoản thí sinh, hồ sơ và bảng điểm qua API điểm.');
    await page.reload();const own=page.getByRole('article').filter({hasText:submitted.ma_ho_so});
    await expect(own).toContainText('Chờ kiểm tra');
    await page.goto('/admin/login');
    await page.locator('input[type=text]').fill(m.email);await page.locator('input[type=password]').fill(m.password);
    await page.getByRole('button',{name:'Đăng Nhập Quản Trị',exact:true}).click();await expect(page).toHaveURL(/\/admin$/);
    await page.goto('/admin/ho-so');const row=page.getByRole('row').filter({hasText:submitted.ma_ho_so});
    await row.getByRole('button',{name:'Duyệt hợp lệ',exact:true}).click();await expect(row).toContainText('Hợp lệ');
    await page.goto('/nguyen-vong-cua-toi');await expect(own).toContainText('Hợp lệ');
    const base='/api/backend/score/diem-chuan';const year=new Date().getFullYear();
    const cutoffInput={ma_chuong_trinh:m.program,nam:year,chi_tieu:1,
      diem_trung_tuyen:[{ma_phuong_thuc:m.method,diem:25,nguyen_vong_toi_da:2}]};
    console.log('TẠO ĐIỂM CHUẨN: POST API backend điểm thật.');
    const created=await json(await context.request.post(base,{data:cutoffInput}));
    m.history=created.ma_ls_dc;
    console.log('SỬA ĐIỂM CHUẨN: cập nhật chỉ tiêu từ 1 lên 2 rồi đọc lại API.');
    await json(await context.request.put(`${base}/${m.history}`,{data:{...cutoffInput,chi_tieu:2}}));
    const listed=await json(await context.request.get(`${base}?ma_chuong_trinh=${encodeURIComponent(m.program)}&nam=${year}`));
    expect(listed).toHaveLength(1);expect(listed[0].chi_tieu).toBe(2);expect(listed[0].diem_trung_tuyen[0].diem).toBe(25);
    const db=await connect();try{expect((await db.query('SELECT chi_tieu FROM lich_su_diem_chuan WHERE ma_ls_dc=$1',[m.history])).rows[0].chi_tieu).toBe(2);}finally{await db.end();}
    console.log('XÓA ĐIỂM CHUẨN: DELETE API, xác nhận API và database không còn bản ghi.');
    await json(await context.request.delete(`${base}/${m.history}`));
    expect(await json(await context.request.get(`${base}?ma_chuong_trinh=${encodeURIComponent(m.program)}&nam=${year}`))).toEqual([]);
    await page.getByRole('button',{name:'Đăng xuất',exact:true}).click();await expect(own).toHaveCount(0);
  }finally{await cleanup(run);}
});

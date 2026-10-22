const {test,expect}=require('@playwright/test');
const {setupCase,cleanup,connect}=require('./live-data.cjs');
const {login,candidate,submit,checked,parent}=require('./live-tour.spec.cjs');
async function dialogs(page,button,answers){
  let index=0;const handler=async d=>{if(index>=answers.length){await d.dismiss();return;}await d.accept(answers[index++]);};
  page.on('dialog',handler);try{await button.click();expect(index).toBe(answers.length);}finally{page.off('dialog',handler);}
}

test('[CRUD03] Chỉ tiêu UI: tạo, sửa hai lần sau reload rồi xóa; đối soát backend và Supabase',async({page,context},info)=>{
 info.annotations.push({type:'Mức kiểm tra',description:'UI server action → API backend điểm có JWT → Supabase; ID điểm mới sau PUT/reload; không gọi AI'});
 const m=await setupCase(parent(),'cutoff UI canonical'),year=new Date().getFullYear();
 try{
  await login(page,m);await page.goto('/admin/chi-tieu-diem-chuan');
  await page.getByRole('button',{name:'Thiết Lập Chỉ Tiêu',exact:false}).click();
  let form=page.locator('form').filter({has:page.locator('select')});
  await form.locator('select').selectOption(m.program);await form.locator('input[type=number]').nth(1).fill('2');
  // router.refresh cập nhật RSC tại chỗ: chờ dữ liệu thay đổi thay vì sự kiện load.
  await form.getByRole('button',{name:'Lưu Thay Đổi',exact:true}).click();
  let row=page.getByRole('row').filter({hasText:m.marker});await expect(row).toHaveCount(1);
  const base=`/api/backend/score/diem-chuan?ma_chuong_trinh=${encodeURIComponent(m.program)}&nam=${year}`;
  let rows=await checked(await context.request.get(base));expect(rows).toHaveLength(1);let previousIds=rows[0].diem_trung_tuyen.map(x=>x.ma_diem_tt);
  for(const target of ['3','4']){
   await row.getByTitle('Chỉnh sửa',{exact:true}).click();form=page.locator('form').filter({has:page.getByPlaceholder('Điểm Chuẩn').first()});
   await form.locator('input[type=number]').first().fill(target);await form.getByPlaceholder('Điểm Chuẩn',{exact:true}).first().fill('24.5');
   await form.getByRole('button',{name:'Lưu Thay Đổi',exact:true}).click();await expect(page.locator('form').filter({has:page.getByPlaceholder('Điểm Chuẩn').first()})).toHaveCount(0);await expect(row).toContainText(`${target} SV`);
   rows=await checked(await context.request.get(base));expect(rows[0].chi_tieu).toBe(Number(target));expect(rows[0].diem_trung_tuyen[0].diem).toBe(24.5);expect(rows[0].diem_trung_tuyen).toHaveLength(previousIds.length);
   previousIds=rows[0].diem_trung_tuyen.map(x=>x.ma_diem_tt);
   const db=await connect();try{expect((await db.query('SELECT chi_tieu FROM lich_su_diem_chuan WHERE ma_ls_dc=$1',[rows[0].ma_ls_dc])).rows[0].chi_tieu).toBe(Number(target));}finally{await db.end();}
  }
  await row.getByTitle('Xóa',{exact:true}).click();await page.getByRole('button',{name:'Xác nhận',exact:true}).click();await expect(row).toHaveCount(0);expect(await checked(await context.request.get(base))).toEqual([]);
 }finally{await cleanup(m.run);}
});
for(const outcome of ['do','truot','tu_choi'])test(`[FLOW-${outcome}] Hồ sơ thật: ${outcome==='do'?'đỗ':outcome==='truot'?'trượt':'từ chối'} và đối chiếu thí sinh`,async({page,context},info)=>{
  info.annotations.push({type:'Mức kiểm tra',description:'Đăng ký/duyệt/chốt/tra cứu UI; nộp học bạ nhiều kỳ và công bố API thật; đối soát DB'});
  const m=await setupCase(parent(),'workflow '+outcome),year=new Date().getFullYear();try{
    await candidate(page,m);const dossier=await submit(context,m);const id=dossier.ma_ho_so;
    await login(page,m);
    await checked(await context.request.post('/api/backend/score/diem-chuan',{data:{ma_chuong_trinh:m.program,nam:year,chi_tieu:2,diem_trung_tuyen:[{ma_phuong_thuc:m.method,diem:25,nguyen_vong_toi_da:3}]}}));
    await page.goto('/admin/ho-so');const row=page.getByRole('row').filter({hasText:id});
    await row.getByRole('button',{name:'Chi tiết',exact:true}).click();await expect(page.getByText(id,{exact:true}).first()).toBeVisible();
    if(outcome==='tu_choi'){
      await dialogs(page,row.getByRole('button',{name:'Từ chối',exact:true}),['Hồ sơ kiểm thử không đủ điều kiện']);await expect(row).toContainText('Từ chối');
      await page.goto('/nguyen-vong-cua-toi');await expect(page.getByRole('article').filter({hasText:id})).toContainText('Từ chối hồ sơ');return;
    }
    await row.getByRole('button',{name:'Duyệt hợp lệ',exact:true}).click();await expect(row).toContainText('Hợp lệ');
    await row.getByRole('button',{name:'Bắt đầu xét tuyển',exact:true}).click();await expect(row).toContainText('Đang xét tuyển');
    await dialogs(page,row.getByRole('button',{name:'Chốt điểm đối soát',exact:true}),[m.marker+' đối soát',outcome==='do'?'27':'20']);
    await expect(page.getByText('Cập nhật thành công',{exact:true}).first()).toBeVisible();
    await dialogs(page,row.getByRole('button',{name:outcome==='do'?'Chốt đỗ':'Chốt trượt',exact:true}),[m.marker+' quyết định','']);
    await expect(row.getByRole('cell').nth(4)).toHaveText(outcome==='do'?'Đỗ':'Trượt');
    await page.goto('/nguyen-vong-cua-toi');const own=page.getByRole('article').filter({hasText:id});await expect(own).toContainText('Đang xét tuyển — chưa công bố kết quả');
    // Chỉ đọc lịch thật. Không tạo mốc giả vì mốc công bố tác động cả mùa dùng chung.
    const db=await connect();let active=false;try{const events=(await db.query('SELECT ten_su_kien,ghi_chu,thoi_gian_bat_dau,thoi_gian_ket_thuc FROM lo_trinh_tuyen_sinh WHERE EXTRACT(YEAR FROM thoi_gian_bat_dau)=$1',[year])).rows;active=events.some(e=>/cong_bo|công bố|cong bo/i.test(e.ten_su_kien+' '+(e.ghi_chu||''))&&new Date(e.thoi_gian_bat_dau)<=new Date()&&(!e.thoi_gian_ket_thuc||new Date(e.thoi_gian_ket_thuc)>=new Date()));}finally{await db.end();}
    const payload={nam_tuyen_sinh:year,ma_chuong_trinh:m.program};
    if(!active){
      const blocked=await context.request.post('/api/backend/score/ho-so/cong-bo-ket-qua',{data:payload});expect(blocked.status()).toBe(400);
      info.annotations.push({type:'Lý do chưa kiểm tra',description:'Đã kiểm tra chốt và ẩn kết quả; API chặn đúng ngoài mốc thật. Chưa kiểm tra công bố thành công/CSV chứa fixture; không sửa lịch dùng chung.'});
      test.skip(true,'Ngoài mốc công bố thật: đã kiểm tra luồng chốt/ẩn và API chặn; chưa kiểm tra công bố thành công.');
    }
    expect((await checked(await context.request.post('/api/backend/score/ho-so/cong-bo-ket-qua',{data:payload}))).tong).toBe(1);
    expect((await checked(await context.request.post('/api/backend/score/ho-so/cong-bo-ket-qua',{data:payload}))).idempotent).toBe(true);
    await page.reload();await expect(own).toContainText('Trạng thái: '+(outcome==='do'?'Đỗ':'Trượt'));
    await page.goto('/tra-cuu-ho-so');await page.getByLabel('Mã hồ sơ hoặc CCCD').fill(id);await page.getByRole('button',{name:'Tra cứu',exact:true}).click();
    await expect(page.getByText('Trạng thái hồ sơ: '+(outcome==='do'?'Đỗ':'Trượt'),{exact:true})).toBeVisible();
    await page.goto('/admin/bao-cao-trung-tuyen');await page.getByPlaceholder('CCCD, Họ tên, Mã hồ sơ...').fill(id);
    await expect(page.getByText(id,{exact:true})).toBeVisible();const downloadEvent=page.waitForEvent('download');await page.getByRole('button',{name:/Excel|CSV/i}).click();
    const download=await downloadEvent;expect(download.suggestedFilename()).toMatch(/\.csv$/);const chunks=[];for await(const chunk of await download.createReadStream())chunks.push(chunk);
    const csv=Buffer.concat(chunks).toString('utf8');expect(csv.charCodeAt(0)).toBe(0xFEFF);expect(csv).toContain(id);expect(csv).toContain(m.candidate);
  }finally{await cleanup(m.run);}
});
test('[NEWS01] Tin tức thật: thêm, reload, sửa, reload, xóa và đối soát database',async({page})=>{
  const m=await setupCase(parent(),'CRUD tin tức');try{
    await login(page,m);await page.goto('/admin/tin-tuc-de-an');await page.getByRole('button',{name:/Đăng Tải Đề Án Mới/}).click();
    const title=page.getByPlaceholder('VD: Đề án tuyển sinh Đại học Giao thông Vận tải K66...');
    await title.fill(m.newsTitle);await page.getByPlaceholder('Nội dung chi tiết quy chế, đề án hoặc hướng dẫn...').fill('Nội dung thử nghiệm riêng, sẽ được xóa cuối lượt.');
    // Bản nháp tránh xuất bản tin thử ra trang công khai.
    await page.locator('select').filter({has:page.locator('option[value="DRAFT"]')}).selectOption('DRAFT');
    await page.getByRole('button',{name:/Lưu Thay Đổi/}).click();await expect(page.getByText(m.newsTitle,{exact:true})).toBeVisible();await page.reload();
    const row=()=>page.getByRole('row').filter({hasText:m.newsTitle});await expect(row()).toBeVisible();
    await row().getByTitle('Chỉnh sửa',{exact:true}).click();await title.fill(m.newsTitle+' ĐÃ SỬA');await page.getByRole('button',{name:/Lưu Thay Đổi/}).click();await expect(page.getByText(m.newsTitle+' ĐÃ SỬA',{exact:true})).toBeVisible();await page.reload();
    await expect(page.getByText(m.newsTitle+' ĐÃ SỬA',{exact:true})).toBeVisible();
    await row().getByTitle('Xóa',{exact:true}).click();await page.getByRole('button',{name:'Xác nhận',exact:true}).click();await expect(row()).toHaveCount(0);await page.reload();await expect(row()).toHaveCount(0);
    const db=await connect();try{expect((await db.query('SELECT 1 FROM trang_noi_dung WHERE ma_admin_tac_gia=$1',[m.admin])).rowCount).toBe(0);}finally{await db.end();}
  }finally{await cleanup(m.run);}
});

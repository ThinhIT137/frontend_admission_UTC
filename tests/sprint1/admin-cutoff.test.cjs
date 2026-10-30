const {test}=require('node:test'),assert=require('node:assert/strict'),{loader}=require('./helpers.cjs');
function fixture(locked=false){
 const writes=[];const current={ma_ls_dc:'Q',nam:2026,ma_chuong_trinh:'P',phuong_thuc_ap_dung:[{ma_phuong_thuc:'M'},{ma_phuong_thuc:'N'}],diem_trung_tuyen:[{ma_diem_tt:'D',ma_phuong_thuc:'M',diem:25,nguyen_vong_toi_da:null,diem_uu_tien_toi_thieu:null,dieu_kien_mon:null}]};
 const tx={$executeRaw:async()=>{},$queryRaw:async()=>[],admissionYearLock:{findUnique:async()=>locked?{}:null},phuongThucXetTuyen:{count:async input=>input.where.ma_phuong_thuc.in.length,findUnique:async input=>({nhom_xet_tuyen:'KHAC',diem_toi_thieu:0,diem_toi_da:input.where.ma_phuong_thuc==='N'?100:30})},lichSuDiemChuan:{findUnique:async()=>current,create:async input=>{writes.push(['quota-create',input]);return input;},update:async input=>{writes.push(['quota-update',input]);return current;}},diemTrungTuyen:Object.fromEntries(['create','update','delete'].map(method=>[method,async input=>writes.push(['score-'+method,input])]))};
 const db={...tx,$transaction:fn=>fn(tx)};const service=loader({'@/libs/prisma':{__esModule:true,default:db},'@/app/generated/prisma/client':{Prisma:{DbNull:'DB_NULL'}},'./user.service':{adminService:{getAdminId:async()=> 'A'}}})('services/admin-cutoff.service.ts');
 return {service,tx,writes,current};
}
test('new quota stores selected methods without fabricated zero scores',async()=>{
 const {service,tx,writes}=fixture();tx.lichSuDiemChuan.findUnique=async()=>null;
 await service.createAdminCutoff({ma_chuong_trinh:'P',nam:2026,chi_tieu:50,phuong_thuc_ids:['M','N']});
 assert.deepEqual(writes[0][1].data.diem_trung_tuyen.create,[]);assert.equal(writes[0][1].data.phuong_thuc_ap_dung.create.length,2);
});
test('a late out-of-range score rejects entire patch before any write',async()=>{
 const {service,writes}=fixture();await assert.rejects(service.updateAdminCutoff('Q',{diem_trung_tuyen:[{ma_phuong_thuc:'M',diem:29},{ma_phuong_thuc:'N',diem:101}]}),/0–100/);assert.equal(writes.length,0);
});
test('blank pending score stays absent; explicit zero is a real score',async()=>{
 const {service,writes}=fixture();await service.updateAdminCutoff('Q',{diem_trung_tuyen:[{ma_phuong_thuc:'N',diem:null}]});assert.ok(!writes.some(x=>x[0].startsWith('score-')));
 writes.length=0;await service.updateAdminCutoff('Q',{diem_trung_tuyen:[{ma_phuong_thuc:'N',diem:0}]});assert.equal(writes.find(x=>x[0]==='score-create')[1].data.diem,0);
});
test('locked year blocks score changes but quota-only edit preserves score IDs',async()=>{
 const {service,writes}=fixture(true);await assert.rejects(service.updateAdminCutoff('Q',{diem_trung_tuyen:[{ma_phuong_thuc:'M',diem:26}]}),e=>e.status===409);assert.equal(writes.length,0);
 await service.updateAdminCutoff('Q',{chi_tieu:55,diem_trung_tuyen:[{ma_diem_tt:'D',diem:25}]});assert.equal(writes.length,1);assert.equal(writes[0][0],'quota-update');
});

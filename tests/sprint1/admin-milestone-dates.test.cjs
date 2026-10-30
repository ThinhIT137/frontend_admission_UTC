const {test}=require('node:test'),assert=require('node:assert/strict'),{loader}=require('./helpers.cjs');
test('milestone dates accept equality and no end, reject invalid/reversed dates',()=>{
 const {validateMilestoneDates:v}=loader()('libs/milestone-dates.ts');const d=new Date('2026-10-20');
 assert.doesNotThrow(()=>v(d,d));assert.doesNotThrow(()=>v(d,null));assert.doesNotThrow(()=>v(d,undefined));
 for(const pair of [[new Date('invalid'),d],[d,new Date('invalid')],[d,new Date('2026-10-13')]])assert.throws(()=>v(...pair));
});
test('server validates partial date edits against stored opposite bound before writing',async()=>{
 let writes=0;const current={thoi_gian_bat_dau:new Date('2026-10-13'),thoi_gian_ket_thuc:new Date('2026-10-20')};
 const tx={$queryRaw:async()=>[],loTrinhTuyenSinh:{findUnique:async()=>current,update:async()=>writes++}};
 const service=loader({'@/libs/prisma':{__esModule:true,default:{$transaction:fn=>fn(tx),loTrinhTuyenSinh:{create:async()=>writes++}}},'./user.service':{adminService:{getAdminId:async()=> 'admin'}}})('services/lo_trinh_tuyen_sinh.service.ts');
 const saved=console.error;console.error=()=>{};try{
 await assert.rejects(service.updateLoTrinhTuyenSinh('own',{thoi_gian_bat_dau:new Date('2026-10-29')}),/không được sau/);assert.equal(writes,0);
 await assert.rejects(service.createLoTrinhTuyenSinh({ten_su_kien:'own',thoi_gian_bat_dau:new Date('2026-10-29'),thoi_gian_ket_thuc:new Date('2026-10-13')}),/không được sau/);assert.equal(writes,0);
 await service.updateLoTrinhTuyenSinh('own',{thoi_gian_ket_thuc:null});assert.equal(writes,1);
 }finally{console.error=saved;}
});

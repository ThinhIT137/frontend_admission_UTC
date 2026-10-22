const {test,mock}=require('node:test');
const assert=require('node:assert/strict');
const {loader}=require('../sprint1/helpers.cjs');
function fixture(handler=async()=>({ma_ls_dc:'LS1'})) { const request=mock.fn(handler), revalidatePath=mock.fn(); return {request,revalidatePath,actions:loader({'@/libs/api-services/backend.server':{backendRequest:request},'next/cache':{revalidatePath}})('actions/chi_tieu.action.ts')}; }
const input={ma_chuong_trinh:'P1',nam:2026,chi_tieu:100,phuong_thuc_ids:['PT1','PT2']};
test('Quota create calls canonical authenticated score API with all methods initialized at zero',async()=>{
 const f=fixture(); assert.equal((await f.actions.createChiTieuAction(input)).ma_ls_dc,'LS1');
 assert.deepEqual(f.request.mock.calls[0].arguments,['score','/diem-chuan',{auth:'admin',method:'POST',body:{ma_chuong_trinh:'P1',nam:2026,chi_tieu:100,diem_trung_tuyen:[{ma_phuong_thuc:'PT1',diem:0},{ma_phuong_thuc:'PT2',diem:0}]}}]);
 assert.deepEqual(f.revalidatePath.mock.calls[0].arguments,['/admin/chi-tieu-diem-chuan']);
});
for(const year of [2026,undefined])test(`Quota list forwards year ${year} through admin API`,async()=>{const f=fixture(async()=>[]); assert.deepEqual(await f.actions.getChiTieuAction(year),[]);assert.deepEqual(f.request.mock.calls[0].arguments,['score','/diem-chuan'+(year===undefined?'':'?nam=2026'),{auth:'admin'}]);});
const current={ma_ls_dc:'L/1',ma_chuong_trinh:'P1',nam:2026,chi_tieu:12,trung_tuyen:2,diem_trung_tuyen:[{ma_diem_tt:'D1',ma_phuong_thuc:'PT1',diem:24,dieu_kien_mon:{TOAN:8},nguyen_vong_toi_da:3,diem_uu_tien_toi_thieu:1},{ma_diem_tt:'D2',ma_phuong_thuc:'PT2',diem:25,dieu_kien_mon:null,nguyen_vong_toi_da:null,diem_uu_tien_toi_thieu:null}]};
test('Quota partial PUT preserves untouched methods/conditions and accepts explicit null and zero',async()=>{
 const f=fixture(async(_,path,options)=>options.method?{}:structuredClone(current));
 await f.actions.updateChiTieuAction('L/1',{trung_tuyen:0,diem_trung_tuyen:[{ma_diem_tt:'D1',diem:0,nguyen_vong_toi_da:null,diem_uu_tien_toi_thieu:0}]});
 const [service,path,options]=f.request.mock.calls[1].arguments;assert.equal(service,'score');assert.equal(path,'/diem-chuan/L%2F1');assert.equal(options.auth,'admin');assert.equal(options.method,'PUT');assert.equal(options.body.chi_tieu,12);assert.equal(options.body.trung_tuyen,0);
 assert.deepEqual(options.body.diem_trung_tuyen,[{ma_phuong_thuc:'PT1',diem:0,dieu_kien_mon:{TOAN:8},nguyen_vong_toi_da:null,diem_uu_tien_toi_thieu:0},{ma_phuong_thuc:'PT2',diem:25,dieu_kien_mon:null,nguyen_vong_toi_da:null,diem_uu_tien_toi_thieu:null}]);
 await f.actions.updateChiTieuAction('L/1',{diem_trung_tuyen:[{ma_diem_tt:'D1',diem:24,dieu_kien_mon:null}]});assert.equal(f.request.mock.calls[3].arguments[2].body.diem_trung_tuyen[0].dieu_kien_mon,null);
});
for(const patches of [[{ma_diem_tt:'stale',diem:20}],[{ma_diem_tt:'D1',diem:20},{ma_diem_tt:'D1',diem:21}]])test('Quota rejects stale or duplicate score IDs before PUT',async t=>{t.mock.method(console,'error',()=>{});const f=fixture(async()=>current);await assert.rejects(f.actions.updateChiTieuAction('LS1',{diem_trung_tuyen:patches}),/Thao t\u00e1c th\u1ea5t b\u1ea1i/);assert.equal(f.request.mock.callCount(),1);assert.equal(f.revalidatePath.mock.callCount(),0);});
test('Quota deletion uses authenticated canonical DELETE with encoded ID',async()=>{const f=fixture();assert.equal(await f.actions.deleteChiTieuAction('L/1'),true);assert.deepEqual(f.request.mock.calls[0].arguments,['score','/diem-chuan/L%2F1',{auth:'admin',method:'DELETE'}]);});
for(const operation of ['create','get','update','delete'])test(`Quota ${operation} hides backend failure and does not invalidate successful cache`,async t=>{t.mock.method(console,'error',()=>{});const f=fixture(async()=>{throw Error('SQL password=SECRET 401/409/422');});const calls={create:()=>f.actions.createChiTieuAction(input),get:()=>f.actions.getChiTieuAction(),update:()=>f.actions.updateChiTieuAction('LS1',{}),delete:()=>f.actions.deleteChiTieuAction('LS1')};await assert.rejects(calls[operation],e=>e.message.includes('Thao t\u00e1c th\u1ea5t b\u1ea1i')&&!e.message.includes('SECRET'));assert.equal(f.revalidatePath.mock.callCount(),0);});

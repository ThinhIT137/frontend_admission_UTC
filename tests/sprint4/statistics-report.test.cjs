const {test,mock}=require('node:test');
const assert=require('node:assert/strict');
const {loader}=require('../sprint1/helpers.cjs');
function load(handler){return loader({'server-only':{},'@/libs/api-services/backend.server':{backendRequest:handler}});}
test('Stats maps service aggregates without recalculating admission results in Next.js',async()=>{
 const request=mock.fn(async(_,path)=>path.includes('tong-quan')?{tong_ho_so:3,hop_le:1,cho_xu_ly:1,tu_choi:1,tong_chi_tieu:5,tong_nganh:1,xu_huong_theo_ngay:[{ngay:'2026-06-11',so_luong:3}]}:path.includes('nganh-hoc')?[{ma_nganh:'N1',ten_nganh:'Test',chi_tieu:5,tong_ho_so:3,hop_le:1,ty_le_canh_tranh:0.6,ty_le_lap_day:20}]:{theo_phuong_thuc:[{ma_phuong_thuc:'HB',ten_phuong_thuc:'Hoc ba',tong_ho_so:3,ty_trong:100}],theo_to_hop:[{ma_to_hop:'A00',tong_ho_so:3,ty_trong:100}]});
 const p=await load(request)('services/backend-stats.service.ts').backendStats(2026);
 assert.equal(p.overall.totalApplications,3);assert.equal(p.majors[0].tiLeLapDay,20);assert.equal(p.methods[0].tiLePhanTram,100);assert.equal(p.combinations[0].soHoSo,3);assert.equal(p.dailyTrends[0].ngay,'2026-06-11');
 for(const c of request.mock.calls){assert.ok(c.arguments[1].includes('nam_tuyen_sinh=2026'));assert.equal(c.arguments[2].auth,'admin');}
});
test('Empty stats keep zero counts and no fabricated trend data',async()=>{
 const p=await load(async(_,path)=>path.includes('tong-quan')?{tong_ho_so:0,hop_le:0,cho_xu_ly:0,tu_choi:0,tong_chi_tieu:0,tong_nganh:0,xu_huong_theo_ngay:[]}:path.includes('nganh-hoc')?[]:{theo_phuong_thuc:[],theo_to_hop:[]})('services/backend-stats.service.ts').backendStats(2026);
 assert.equal(p.overall.totalApplications,0);assert.deepEqual(p.dailyTrends,[]);
});
test('Report consumes every API page and preserves official backend state, null score and leading zeros',async()=>{
 const row=(id,state)=>({ma_ho_so:id,cccd:'000000000001',ho_ten:'Test',ma_chuong_trinh:'P1',ten_chuong_trinh:'Test',ma_phuong_thuc:'HB',ten_phuong_thuc:'Hoc ba',tong_diem_xet_tuyen:null,diem_chuan:25,trang_thai:state,ngay_nop:'2026-06-10T17:01:00Z'});
 const req=mock.fn(async(_,path)=>({phan_trang:{total:2,total_pages:2},du_lieu:[row(path.includes('page=2')?'H2':'H1',path.includes('page=2')?'trung_tuyen':'chua_cong_bo')]}));
 const p=await load(req)('services/backend-report.service.ts').backendReport(2026);
 assert.equal(req.mock.callCount(),2);assert.equal(p.candidates.length,2);assert.equal(p.candidates[0].cccd,'000000000001');assert.equal(p.candidates[0].diemXetTuyen,null);assert.equal(p.candidates[0].ngayNop,'11/06/2026');assert.deepEqual(p.candidates.map(r=>r.trangThai),['CHO_XAC_NHAN','TRUNG_TUYEN_SO_BO']);
});
test('Report refuses silently truncated exports over configured limit',async()=>{
 await assert.rejects(load(async()=>({phan_trang:{total:10001,total_pages:101},du_lieu:[]}))('services/backend-report.service.ts').backendReport(2026),/10.000/);
});
for(const [file,method] of [['stats','backendStats'],['report','backendReport']])test(file+' backend errors are visible',async()=>{
 await assert.rejects(load(async()=>{throw Error('outage')})('services/backend-'+file+'.service.ts')[method](2026),/outage/);
});

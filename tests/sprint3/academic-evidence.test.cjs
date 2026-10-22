const {test}=require('node:test');
const assert=require('node:assert/strict');
const {loader}=require('../sprint1/helpers.cjs');
const payload=loader()('app/(main)/nop-ho-so/academic-payload.ts').academicPayload;
const grade={loai_diem:'lop_12',nam_hoc:2026,hoc_ky:1,diem_mon:[{ma_mon:'TOAN',diem_so:'8'}]};
test('Học bạ giữ riêng học kỳ, chứng chỉ giữ ngày và giải thưởng giữ minh chứng',()=>{
  const result=payload({bang_diem:[grade,{...grade,hoc_ky:2}],chung_chi:[{loai_chung_chi:'IELTS',diem_hoac_hang:'7',ngay_cap:'2025-01-01',ngay_het_han:'2027-01-01',file_dinh_kem:'key'}],giai_thuong:[{giai_thuong:'giai_nhat',loai_giai_thuong:'tinh',mon_hoc:'toan',file_dinh_kem:'award'}]});
  assert.deepEqual(result.bang_diem.map(t=>t.hoc_ky),[1,2]);assert.equal(result.bang_diem[0].diem_mon[0].diem_so,8);
  assert.equal(result.chung_chi[0].ngay_cap,'2025-01-01T00:00:00');assert.equal(result.giai_thuong[0].file_dinh_kem,'award');
});
test('Chặn bảng trùng, cả năm trộn học kỳ, điểm trống/ngoài thang và metadata thiếu',()=>{
  const run=bang_diem=>payload({bang_diem,chung_chi:[],giai_thuong:[]});
  assert.throws(()=>run([grade,grade]));assert.throws(()=>run([grade,{...grade,hoc_ky:0}]));
  assert.throws(()=>run([{...grade,diem_mon:[{ma_mon:'TOAN',diem_so:''}]}]));
  assert.throws(()=>run([{...grade,diem_mon:[{ma_mon:'TOAN',diem_so:'11'}]}]));
  assert.throws(()=>payload({bang_diem:[],chung_chi:[{loai_chung_chi:'IELTS'}],giai_thuong:[]}));
});

function storageFixture(t,{publicBucket=false,status='cho',certificateStatus='cho',key='000000000001/12345678-1234-1234-1234-123456789012.png'}={}){
  for(const [name,value] of Object.entries({SUPABASE_URL:'https://storage.example.invalid',SUPABASE_SERVICE_ROLE_KEY:'unit-key',SUPABASE_EVIDENCE_BUCKET:'illustrative_images'})){
    const previous=process.env[name];process.env[name]=value;t.after(()=>previous===undefined?delete process.env[name]:process.env[name]=previous);
  }
  const uploads=[];const bucket={upload:async(...args)=>{uploads.push(args);return{error:null};},list:async()=>({data:[{name:key.split('/')[1]}],error:null})};
  class BackendError extends Error{constructor(message,status){super(message);this.status=status;}}
  const tx={$queryRaw:async(strings)=>strings.join('').includes('chung_chi')?[{trang_thai_duyet:certificateStatus}]:strings.join('').includes('nguyen_vong')?[{trang_thai:status}]:[]};
  const route=loader({'next/server':{NextResponse:{json:(value,options)=>Response.json(value,options)}},
    '@supabase/supabase-js':{createClient:()=>({storage:{getBucket:async()=>({data:{public:publicBucket},error:null}),from:()=>bucket}})},
    '@/libs/api-services/backend.server':{BackendError,backendRequest:async(_,path)=>path==='/auth/candidate/me'?{cccd:'000000000001'}:[{trang_thai:status}]},
    '@/services/user.service':{adminService:{getCurrentUser:async()=>null}},
    '@/libs/prisma':{$transaction:async callback=>callback(tx)}})('app/api/evidence/route.ts');
  async function replace(fileKey=key){const form=new FormData();form.set('key',fileKey);form.set('file',new File([Buffer.from([137,80,78,71,13,10,26,10,0])],'image.png',{type:'image/png'}));return route.PUT({method:'PUT',headers:new Headers(),formData:async()=>form});}
  return{uploads,replace};
}
test('Thay ảnh giữ key trong thư mục CCCD, dùng upsert sau kiểm tra quyền',async t=>{
  const f=storageFixture(t);assert.equal((await f.replace()).status,200);assert.equal(f.uploads.length,1);assert.equal(f.uploads[0][2].upsert,true);
  assert.match(f.uploads[0][0],/^000000000001\//);
});
test('Chặn thay file CCCD khác trước khi upload',async t=>{
  const f=storageFixture(t);assert.equal((await f.replace('000000000002/12345678-1234-1234-1234-123456789012.png')).status,403);assert.equal(f.uploads.length,0);
});
test('Không ghi minh chứng vào bucket public',async t=>{
  const f=storageFixture(t,{publicBucket:true});assert.equal((await f.replace()).status,503);assert.equal(f.uploads.length,0);
});
test('Hồ sơ hoặc chứng chỉ đã xử lý không được âm thầm thay ảnh',async t=>{
  let f=storageFixture(t,{status:'hop_le'});assert.equal((await f.replace()).status,409);assert.equal(f.uploads.length,0);
  f=storageFixture(t,{certificateStatus:'hop_le'});assert.equal((await f.replace()).status,409);assert.equal(f.uploads.length,0);
});

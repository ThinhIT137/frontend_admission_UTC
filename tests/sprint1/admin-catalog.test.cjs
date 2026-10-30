const {test}=require('node:test'),assert=require('node:assert/strict'),{loader}=require('./helpers.cjs');
test('combination server checks all permutations under lock; editing excludes only itself',async()=>{
 const calls=[];let duplicate={ma_to_hop:'A00'};
 const tx={$executeRaw:async()=>calls.push('lock'),toHopXetTuyen:{findFirst:async input=>{calls.push(input);return duplicate;},create:async()=>calls.push('create'),update:async()=>calls.push('update')}};
 const s=loader({'@/libs/prisma':{__esModule:true,default:{$transaction:fn=>fn(tx)}},'./user.service':{adminService:{getAdminId:async()=> 'admin'}}})('services/to_hop_xet_tuyen.service.ts').toHopXetTuyenService;
 await assert.rejects(s.create('NEW','C','A','B'),/Bộ ba môn/);assert.equal(calls[0],'lock');assert.equal(calls[1].where.OR.length,6);assert.ok(!calls.includes('create'));
 duplicate=null;await s.update('SELF','A','B','C');assert.equal(calls[3].where.ma_to_hop.not,'SELF');assert.equal(calls.at(-1),'update');
 await assert.rejects(s.create('X','A','A','B'),/khác nhau/);
});
test('program mapping refuses removing a combination with applications before writes',async()=>{
 let writes=0;const tx={$queryRaw:async()=>[],chuongTrinhDaoTao:{findUnique:async()=>({})},toHopXetTuyen:{count:async()=>1},ctdtToHop:{findMany:async()=>[{ma_to_hop:'A00'}],deleteMany:async()=>writes++,createMany:async()=>writes++},nguyenVongSinhVien:{count:async()=>1}};
 const s=loader({'@/libs/prisma':{__esModule:true,default:{$transaction:fn=>fn(tx)}},'./user.service':{adminService:{getAdminId:async()=> 'admin'}}})('services/program-combinations.service.ts');
 await assert.rejects(s.replaceProgramCombinations('P',2026,['A01']),/đang có hồ sơ/);assert.equal(writes,0);
 await assert.rejects(s.replaceProgramCombinations('P',2026,['A01','A01']),/không hợp lệ/);
});
test('method configuration requires an explicit known group and finite ascending range',()=>{
 const {validateMethodConfig:v}=loader()('libs/admission-catalog.ts');
 for(const invalid of [{},{nhom_xet_tuyen:'pt100',diem_toi_thieu:0,diem_toi_da:30},{nhom_xet_tuyen:'THPT',diem_toi_thieu:0,diem_toi_da:Infinity},{nhom_xet_tuyen:'TSA',diem_toi_thieu:100,diem_toi_da:100}])assert.throws(()=>v(invalid));
 assert.deepEqual(v({nhom_xet_tuyen:'TSA',diem_toi_thieu:0,diem_toi_da:100}),{nhom_xet_tuyen:'TSA',diem_toi_thieu:0,diem_toi_da:100});
});

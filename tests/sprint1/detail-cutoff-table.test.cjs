const {test}=require('node:test');
const assert=require('node:assert/strict');
const React=require('react');
const {JSDOM}=require('jsdom');
const {loader}=require('./helpers.cjs');
const file='app/(main)/tra-cuu-nganh-hoc/[id]/ScoreHistoryTable.tsx';
const load=loader({});
const row=(overrides={})=>({nam:2026,chi_tieu:70,diem:24.65,ma_phuong_thuc:'EXAM',ten_phuong_thuc:'Thi THPT',ma_chuong_trinh:'GHA06',ten_chuong_trinh:'Kế toán',...overrides});
const rows=[row({nguyen_vong_toi_da:2,diem_uu_tien_toi_thieu:0,dieu_kien_mon:{Math:8}}),row({ma_phuong_thuc:'HB',ten_phuong_thuc:'Học bạ',diem:27.58}),row({ma_chuong_trinh:'GHA06QT',ten_chuong_trinh:'Kế toán (Chương trình CLC Kế toán tổng hợp Việt - Anh)',chi_tieu:90,diem:21.5}),row({ma_chuong_trinh:'GHA06QT',ten_chuong_trinh:'Kế toán (Chương trình CLC Kế toán tổng hợp Việt - Anh)',chi_tieu:90,ma_phuong_thuc:'HB',ten_phuong_thuc:'Học bạ',diem:25.87}),row({nam:2025,chi_tieu:60,diem:23,nguyen_vong_toi_da:1})];
async function mount(t,data=rows){
 const dom=new JSDOM('<div id="root"></div>');const old={};
 for(const [k,v] of Object.entries({window:dom.window,document:dom.window.document,IS_REACT_ACT_ENVIRONMENT:true})){old[k]=Object.getOwnPropertyDescriptor(global,k);Object.defineProperty(global,k,{value:v,writable:true,configurable:true});}
 const root=require('react-dom/client').createRoot(dom.window.document.getElementById('root'));
 await React.act(async()=>root.render(React.createElement(load(file).default,{scoreHistory:data})));
 t.after(async()=>{await React.act(async()=>root.unmount());dom.window.close();for(const k in old)old[k]?Object.defineProperty(global,k,old[k]):delete global[k];});
 return {doc:dom.window.document,change:async(index,value)=>React.act(async()=>{const el=dom.window.document.querySelectorAll('select')[index];el.value=value;el.dispatchEvent(new dom.window.Event('change',{bubbles:true}));})};
}
test('detail matrix has two-level actual-method headers, one quota per program and full CLC name',async t=>{
 const {doc}=await mount(t);assert.equal(doc.querySelector('select').value,'2026');
 assert.equal(doc.querySelectorAll('thead tr').length,2);assert.equal(doc.querySelectorAll('tbody tr').length,2);
 assert.deepEqual([...doc.querySelectorAll('thead tr:nth-child(2) th')].map(x=>x.textContent),['EXAM','HB']);
 const body=[...doc.querySelectorAll('tbody tr')];assert.equal(body[0].children[3].textContent,'70');assert.equal(body[1].children[3].textContent,'90');
 assert.match(body[1].textContent,/Chương trình CLC Kế toán tổng hợp Việt - Anh/);assert.match(body[0].textContent,/24.65.*27.58/);
 assert.match(doc.querySelector('thead').className,/#a9cbea/);assert.match(body[1].className,/#c6edce/);
 assert.match(body[0].lastChild.textContent,/EXAM:.*TTNV ≤ 2.*Điểm ưu tiên tối thiểu: 0.*Math ≥ 8/);
 assert.equal(doc.querySelector('[role=region]').tabIndex,0);assert.match(doc.querySelector('[role=region]').className,/overflow-x-auto/);
});
test('detail year/program/method filters preserve matching criteria and separate all-year panels',async t=>{
 const {doc,change}=await mount(t);await change(0,'ALL');assert.equal(doc.querySelectorAll('table').length,2);
 await change(0,'2025');assert.equal(doc.querySelectorAll('tbody tr').length,1);assert.match(doc.querySelector('tbody').textContent,/TTNV ≤ 1/);assert.doesNotMatch(doc.querySelector('tbody').textContent,/TTNV ≤ 2/);
 await change(0,'2026');await change(1,'GHA06QT');assert.equal(doc.querySelectorAll('tbody tr').length,1);assert.match(doc.querySelector('tbody').textContent,/GHA06QT/);
 await change(2,'HB');assert.equal(doc.querySelectorAll('thead tr:nth-child(2) th').length,1);assert.match(doc.querySelector('tbody').textContent,/25.87/);assert.doesNotMatch(doc.querySelector('tbody').textContent,/21.50/);
 await change(0,'2025');assert.equal(doc.querySelector('table'),null);assert.match(doc.body.textContent,/Không có dữ liệu phù hợp/);
});
test('detail unavailable and invalid cutoffs use dash while valid zero quota survives',async t=>{
 const {doc}=await mount(t,[row({chi_tieu:0,diem:0}),row({chi_tieu:0,ma_phuong_thuc:'NULL',diem:null}),row({ma_chuong_trinh:'EMPTY',ma_phuong_thuc:'N/A',diem:null})]);
 assert.equal(doc.querySelector('tbody tr').children[3].textContent,'0');assert.equal(doc.querySelector('tbody tr').children[4].textContent,'—');
 assert.match(doc.body.textContent,/chưa có điểm chuẩn hợp lệ/);assert.doesNotMatch(doc.querySelector('tbody').textContent,/0.00/);
});
test('detail rejects invalid preference and subject values and escapes hostile strings',async t=>{
 const {doc}=await mount(t,[row({ten_chuong_trinh:'<img src=x onerror=alert(1)>',nguyen_vong_toi_da:0,diem_uu_tien_toi_thieu:0,dieu_kien_mon:{'<script>bad</script>':8,Bad:'9',Overflow:11,Negative:-1}})]);
 assert.equal(doc.querySelector('img,script'),null);const text=doc.querySelector('tbody').textContent;
 assert.doesNotMatch(text,/TTNV ≤ 0|Bad ≥|Overflow ≥|Negative ≥/);assert.match(text,/Điểm ưu tiên tối thiểu: 0/);
});
test('detail empty history is explicit and has no fabricated methods',async t=>{const {doc}=await mount(t,[]);assert.equal(doc.querySelector('table'),null);assert.match(doc.body.textContent,/Chưa công bố chỉ tiêu hoặc điểm chuẩn/);});
test('detail server forwards stored criteria without extra queries or losing unpublished quota',async()=>{
 let calls=0;const program={ma_chuong_trinh:'GHA06',ten_chuong_trinh:'Kế toán',ctdt_to_hop:[],hoc_phan:[],lich_su_diem_chuan:[{nam:2026,chi_tieu:70,diem_trung_tuyen:[{ma_phuong_thuc:'EXAM',diem:24.65,nguyen_vong_toi_da:2,diem_uu_tien_toi_thieu:0,dieu_kien_mon:{Math:8}}]},{nam:2025,chi_tieu:60,diem_trung_tuyen:[]}]};
 const db={nganhHoc:{findFirst:async()=>({ma_nganh:'N',ten_nganh:'Kế toán'})},chuongTrinhDaoTao:{findMany:async()=>++calls===1?[program]:[]}};
 const component=await loader({'@/libs/prisma':{prismaPublic:db},'next/link':{default:()=>null},'next/navigation':{notFound:()=>{throw Error('not found')}},'@/components/ui/DisclaimerBanner':{},'./ChiTietNganhClient':{default:()=>null}})('app/(main)/tra-cuu-nganh-hoc/[id]/page.tsx').default({params:Promise.resolve({id:'GHA06'})});
 const client=React.Children.toArray(component.props.children).find(x=>x.props.scoreHistory);assert.equal(calls,2);assert.deepEqual(client.props.scoreHistory[0].dieu_kien_mon,{Math:8});assert.equal(client.props.scoreHistory[0].nguyen_vong_toi_da,2);assert.equal(client.props.scoreHistory[0].diem_uu_tien_toi_thieu,0);assert.equal(client.props.scoreHistory[1].diem,null);assert.equal(client.props.scoreHistory[1].chi_tieu,60);
});


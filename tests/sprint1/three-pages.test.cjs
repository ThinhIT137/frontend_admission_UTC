const {test}=require('node:test');
const assert=require('node:assert/strict');
const React=require('react');
const {JSDOM}=require('jsdom');
const {loader}=require('./helpers.cjs');
const link={__esModule:true,default:({children,...props})=>React.createElement('a',props,children)};
async function mount(t,file,props={},overrides={}){
 const dom=new JSDOM('<div id="root"></div>',{url:'http://localhost'});
 const saved=[]; for(const [key,value] of Object.entries({window:dom.window,document:dom.window.document,IS_REACT_ACT_ENVIRONMENT:true})){
 const descriptor=Object.getOwnPropertyDescriptor(global,key);Object.defineProperty(global,key,{value,configurable:true,writable:true});saved.push(()=>descriptor?Object.defineProperty(global,key,descriptor):delete global[key]);}
 const root=require('react-dom/client').createRoot(dom.window.document.getElementById('root'));
 const Component=loader({'next/link':link,...overrides})(file).default;
 const render=async(p,key)=>React.act(async()=>root.render(React.createElement(Component,{...p,key})));
 await render(props);t.after(async()=>{await React.act(async()=>root.unmount());dom.window.close();saved.forEach(fn=>fn());});
 return {doc:dom.window.document,dom,render,click:async el=>React.act(async()=>el.click()),change:async(el,value)=>React.act(async()=>{el.value=value;el.dispatchEvent(new dom.window.Event('change',{bubbles:true}));})};
}
const helper=loader()('app/(main)/tinh-diem-quy-doi/eligibility.ts');
const calc={method:'THPT',finalScore:29,passPreliminary:true,subjects:[{code:'TOAN',name:'Toán',score:5},{code:'LY',name:'Vật lý',score:10}]};
test('eligibility blocks preliminary failure before score ranking; exact method and scale stay conservative',()=>{
 assert.equal(helper.evaluateBenchmark({...calc,passPreliminary:false},{diem:15}).chance,'ineligible');
 assert.equal(helper.evaluateBenchmark(calc,{diem:20}).chance,'high');
 for(const diem of [0,NaN,Infinity,120])assert.equal(helper.evaluateBenchmark(calc,{diem}).chance,'unknown');
 assert.equal(helper.matchesMethod({ma_phuong_thuc:'PT3',phuong_thuc:{ten_phuong_thuc:'ĐGNL'}},'CHUNG_CHI'),false);
 assert.equal(helper.matchesMethod({ma_phuong_thuc:'PT4'},'DGNL'),false);
 assert.equal(helper.matchesMethod({ma_phuong_thuc:'PT1'},'THPT'),true);
 assert.equal(helper.matchesMethod({ma_phuong_thuc:'PT1',phuong_thuc:{ten_phuong_thuc:'Học bạ'}},'THPT'),false);
});
test('configured subject minimum includes boundary, absent subjects and invalid rules cannot yield positive rank',()=>{
 assert.equal(helper.evaluateBenchmark(calc,{diem:20,dieu_kien_mon:{Math:5}}).chance,'high');
 assert.equal(helper.evaluateBenchmark(calc,{diem:20,dieu_kien_mon:{Math:5.1}}).chance,'ineligible');
 for(const dieu_kien_mon of [{Anh:7},{Math:'5'},[],{Math:11}])assert.equal(helper.evaluateBenchmark(calc,{diem:20,dieu_kien_mon}).chance,'unknown');
 assert.equal(helper.evaluateBenchmark(calc,{diem:20,nguyen_vong_toi_da:1}).chance,'unknown');
});
test('certificate totals never imply an A00 subject substitution, including Math in another slot',()=>{
 const benchmark={ma_phuong_thuc:'402',diem:15,dieu_kien_mon:{Math:5}};
 for(const subjects of [[],[{code:'LY',name:'Vật lý',score:10},{code:'TOAN',name:'Toán',score:9},{code:'ANH',name:'Tiếng Anh',score:10}]]){
  const result=helper.evaluateBenchmark({...calc,method:'CHUNG_CHI',subjects},benchmark);
  assert.equal(result.chance,'unknown');assert.equal(result.diff,null);
 }
 assert.equal(helper.evaluateBenchmark({...calc,method:'CHUNG_CHI',passPreliminary:false,subjects:[]},benchmark).chance,'ineligible');
});
test('FAQ notebook bounded controls, keyboard, interactive focus and filter key reset',async t=>{
 const pages=[1,2,3].map(n=>({id:String(n),topic:'Chủ đề',question:`Câu ${n}`,answer:'Nội dung'}));
 const m=await mount(t,'app/(main)/thong-tin-tuyen-sinh/FaqNotebook.tsx',{pages});
 assert.equal(m.doc.querySelector('button').disabled,true);
 const group=m.doc.querySelector('[role=group]');
 await React.act(async()=>group.dispatchEvent(new m.dom.window.KeyboardEvent('keydown',{key:'ArrowRight',bubbles:true})));
 assert.equal(m.doc.querySelector('h3').textContent,'Câu 2');
 await React.act(async()=>m.doc.querySelector('button').dispatchEvent(new m.dom.window.KeyboardEvent('keydown',{key:'ArrowRight',bubbles:true})));
 assert.equal(m.doc.querySelector('h3').textContent,'Câu 2');
 await m.click(m.doc.querySelectorAll('button')[1]);assert.equal(m.doc.querySelectorAll('button')[1].disabled,true);
 await m.render({pages:[pages[2]]},'filter');assert.equal(m.doc.querySelector('[aria-live]').textContent,'Trang 1 / 1');
 assert.match(m.doc.querySelector('article').className,/motion-safe:/);
});
test('catalog defaults one available year and retains no-history programs without fake quota',async t=>{
 const row={id:'a',year:2024,majorCode:'M',majorName:'Ngành',programCode:'A',programName:'Cũ',quota:0,scores:[]};
 const m=await mount(t,'app/(main)/thong-tin-tuyen-sinh/AdmissionHistoryTable.tsx',{admissionHistory:[row],programCatalog:[row,{...row,programCode:'B',programName:'Mới'}]});
 assert.equal(m.doc.querySelector('select').value,'2024');assert.equal(m.doc.querySelectorAll('tbody a').length,2);
 assert.equal(m.doc.querySelector('select').querySelector('option[value=ALL]'),null);
 assert.match(m.doc.querySelector('tbody').textContent,/Chưa công bố/);
 await m.change(m.doc.querySelector('select'),'2024');assert.equal(m.doc.querySelectorAll('tbody a').length,2);
 const cells=m.doc.querySelector('tbody tr:nth-child(2)').children;assert.equal(cells[3].textContent,'0');
});
test('MBTI labels and accessible progress are Vietnamese, English subtitle hidden, invalid percentages bounded',async t=>{
 const dimensions=['extraversion','introversion','sensing','intuition','thinking','feeling','judging','perceiving'];
 const result={mbti_type:'ISFJ',type_name:'Protector',personality_summary:'Tận tâm',work_style:'',suitable_environment:'',strengths:[],weaknesses:[],recommended_majors:[],dimension_scores:Object.fromEntries(dimensions.map((key,i)=>[key,i===0?120:i===1?-10:50]))};
 const m=await mount(t,'app/(main)/ket-qua-tu-van/ApiResultClient.tsx',{}, {'next/navigation':{useSearchParams:()=>new URLSearchParams('id=fixture')},'@/libs/api-services/browser-api':{api:async()=>({data:result})}});
 assert.equal(m.doc.querySelectorAll('progress').length,8);assert.doesNotMatch(m.doc.body.textContent,/Protector|extraversion|thinking/);
 assert.equal(m.doc.querySelector('progress').value,100);assert.equal(m.doc.querySelectorAll('progress')[1].value,0);
 for(const progress of m.doc.querySelectorAll('progress'))assert.ok(progress.getAttribute('aria-label'));
});
test('Math 4 in second slot blocks high total while Math 5 passes; missing year never borrows benchmark',async t=>{
 const initialToHops=[{ma_to_hop:'A00',ma_mon_1:'LY',ma_mon_2:'TOAN',ma_mon_3:'HOA',mon_1:{ten_mon:'Vật lý'},mon_2:{ten_mon:'Toán'},mon_3:{ten_mon:'Hóa học'}}];
 const program={ma_chuong_trinh:'A',ma_nganh:'M',ten_chuong_trinh:'Ngành thử',ctdt_to_hop:[{nam:2025,ma_to_hop:'A00'}],lich_su_diem_chuan:[{nam:2025,chi_tieu:1,diem_trung_tuyen:[{ma_phuong_thuc:'PT1',diem:15}]}]};
 const old={...program,ma_chuong_trinh:'OLD',lich_su_diem_chuan:[{...program.lich_su_diem_chuan[0],nam:2024}]};
 const wrongMethod={...program,ma_chuong_trinh:'HB',lich_su_diem_chuan:[{nam:2025,diem_trung_tuyen:[{ma_phuong_thuc:'PT2',diem:15}]}]};
 const m=await mount(t,'app/(main)/tinh-diem-quy-doi/TinhDiemQuyDoiClient.tsx',{initialPrograms:[program,old,wrongMethod],initialToHops,referenceYear:2025},{'@/components/BackendConversion':{__esModule:true,default:()=>null}});
 const inputs=m.doc.querySelectorAll('input[type=number]');
 // React number inputs listen to input through the native setter, not change alone.
 async function fill(el,value){await React.act(async()=>{const setter=Object.getOwnPropertyDescriptor(m.dom.window.HTMLInputElement.prototype,'value').set;setter.call(el,value);el.dispatchEvent(new m.dom.window.Event('input',{bubbles:true}));});}
 await fill(inputs[0],'10');await fill(inputs[1],'4');await fill(inputs[2],'10');
 const calculate=[...m.doc.querySelectorAll('button')].find(b=>b.textContent.includes('Ngành Ngay'));
 await m.click(calculate);
 assert.match(m.doc.querySelector('tbody').textContent,/Chưa đủ điều kiện/);assert.doesNotMatch(m.doc.querySelector('tbody').textContent,/Trên điểm cũ/);
 await fill(inputs[1],'5');await m.click(calculate);assert.match(m.doc.querySelector('tbody').textContent,/Trên điểm cũ/);
 const rows=m.doc.querySelectorAll('tbody tr');assert.match(rows[1].textContent,/Chưa đủ dữ liệu/);assert.match(rows[2].textContent,/Chưa đủ dữ liệu/);
 await fill(inputs[1],'');await m.click(calculate);assert.match(m.doc.body.textContent,/Vui lòng/);
});
test('certificate UI with A00 and Math in slot two cannot rank an eligible historical benchmark',async t=>{
 const initialToHops=[{ma_to_hop:'A00',ma_mon_1:'LY',ma_mon_2:'TOAN',ma_mon_3:'HOA',mon_1:{ten_mon:'Vật lý'},mon_2:{ten_mon:'Toán'},mon_3:{ten_mon:'Hóa học'}}];
 const program={ma_chuong_trinh:'CERT',ma_nganh:'M',ten_chuong_trinh:'Ngành chứng chỉ',ctdt_to_hop:[{nam:2025,ma_to_hop:'A00'}],lich_su_diem_chuan:[{nam:2025,diem_trung_tuyen:[{ma_phuong_thuc:'402',diem:15}]}]};
 const m=await mount(t,'app/(main)/tinh-diem-quy-doi/TinhDiemQuyDoiClient.tsx',{initialPrograms:[program],initialToHops},{'@/components/BackendConversion':{__esModule:true,default:()=>null}});
 await m.click([...m.doc.querySelectorAll('button')].find(b=>b.textContent.includes('Chứng Chỉ')));
 await m.click([...m.doc.querySelectorAll('button')].find(b=>b.textContent.includes('Ngành Ngay')));
 assert.match(m.doc.querySelector('tbody').textContent,/Chưa đủ dữ liệu/);
 assert.doesNotMatch(m.doc.querySelector('tbody').textContent,/Trên điểm cũ|Cạnh tranh/);
});

test('admission year prefers current, then nearest future, then latest past without inventing history',()=>{
 const {admissionYear}=loader()('libs/admission-year.ts');
 assert.equal(admissionYear([2025,2026,2027],2026),2026);
 assert.equal(admissionYear([2025,2028,2027],2026),2027);
 assert.equal(admissionYear([2023,2025],2026),2025);
 assert.equal(admissionYear([],2026),2026);
});

test('single-year catalog switches to future while retaining unknown quota and exact-year zero quota',async t=>{
 const row={id:'a',year:2026,majorCode:'M',majorName:'Ngành',programCode:'A',programName:'Hiện tại',quota:0,scores:[]};
 const future={...row,id:'future',year:2027,quota:7};
 const m=await mount(t,'app/(main)/thong-tin-tuyen-sinh/AdmissionHistoryTable.tsx',{admissionHistory:[row,future],programCatalog:[row,{...row,programCode:'B',programName:'Chưa có dữ liệu'}],referenceYear:2026});
 assert.equal(m.doc.querySelector('select').value,'2026');
 assert.equal(m.doc.querySelectorAll('tbody').length,1);
 assert.equal(m.doc.querySelector('tbody tr:nth-child(2)').children[3].textContent,'0');
 await m.change(m.doc.querySelector('select'),'2027');
 assert.equal(m.doc.querySelectorAll('tbody').length,1);
 assert.equal(m.doc.querySelector('tbody tr:nth-child(2)').children[3].textContent,'7');
 assert.equal(m.doc.querySelector('tbody tr:nth-child(3)').children[3].textContent,'Chưa công bố');
});

test('conversion displays official current score before prediction and exact previous year separately',async t=>{
 const prediction=(id,score,date='2026-03-01T00:00:00Z',year=2026)=>({ma_du_doan_dc:id,diem_du_doan:score,ngay_tinh_toan:date,nam_du_doan:year});
 const history=(year,score,method='PT1')=>({nam:year,chi_tieu:1,diem_trung_tuyen:[{ma_phuong_thuc:method,diem:score}]});
 const base={ma_chuong_trinh:'A',ma_nganh:'M',ten_chuong_trinh:'Chương trình A',ctdt_to_hop:[{nam:2026,ma_to_hop:'A00'}]};
 const programs=[
 {...base,lich_su_diem_chuan:[history(2026,20),history(2025,19)],du_doan_diem_chuan:[prediction('a',27)]},
 {...base,ma_chuong_trinh:'B',lich_su_diem_chuan:[history(2025,18)],du_doan_diem_chuan:[prediction('z',24),prediction('a',23),prediction('old',29,'2026-01-01T00:00:00Z'),prediction('invalid',30,'bad')]},
 {...base,ma_chuong_trinh:'C',lich_su_diem_chuan:[history(2024,17),history(2026,25,'PT2')],du_doan_diem_chuan:[]},
 ];
 const m=await mount(t,'app/(main)/tinh-diem-quy-doi/TinhDiemQuyDoiClient.tsx',{initialPrograms:programs,initialToHops:[],referenceYear:2026},{'@/components/BackendConversion':{__esModule:true,default:()=>null}});
 await m.click([...m.doc.querySelectorAll('button')].find(b=>b.textContent.includes('Ngành Ngay')));
 assert.match(m.doc.querySelector('thead').textContent,/2026/);assert.match(m.doc.querySelector('thead').textContent,/2025/);
 const rows=m.doc.querySelectorAll('tbody tr');
 assert.match(rows[0].children[3].textContent,/20\.00.*Chính thức/);assert.doesNotMatch(rows[0].children[3].textContent,/27\.00/);
 assert.match(rows[0].children[4].textContent,/19\.00/);
 assert.match(rows[1].children[3].textContent,/23\.00.*Dự đoán/);assert.match(rows[1].children[4].textContent,/18\.00/);
 assert.match(rows[1].textContent,/Chưa đủ dữ liệu/);assert.equal(rows[1].children[6].textContent.trim(),'—');
 assert.match(rows[2].children[3].textContent,/Đang cập nhật/);assert.match(rows[2].children[4].textContent,/Chưa công bố/);
});

test('conversion defaults latest valid prediction year and excludes invalid future prediction',async t=>{
 const program={ma_chuong_trinh:'A',ma_nganh:'M',ten_chuong_trinh:'A',lich_su_diem_chuan:[{nam:2025,diem_trung_tuyen:[]}],du_doan_diem_chuan:[{ma_du_doan_dc:'ok',nam_du_doan:2027,diem_du_doan:22,ngay_tinh_toan:'2026-01-01T00:00:00Z'},{ma_du_doan_dc:'bad',nam_du_doan:2030,diem_du_doan:NaN,ngay_tinh_toan:'2026-01-01T00:00:00Z'}]};
 const m=await mount(t,'app/(main)/tinh-diem-quy-doi/TinhDiemQuyDoiClient.tsx',{initialPrograms:[program],initialToHops:[],referenceYear:2026},{'@/components/BackendConversion':{__esModule:true,default:()=>null}});
 await m.click([...m.doc.querySelectorAll('button')].find(b=>b.textContent.includes('Ngành Ngay')));
 assert.match(m.doc.querySelector('thead').textContent,/2027/);assert.match(m.doc.querySelector('thead').textContent,/2026/);
 assert.doesNotMatch(m.doc.querySelector('thead').textContent,/2030/);
});

const React=require('react');
const {createRoot}=require('react-dom/client');
const Home=require('../components/admission/HomeQuickCalculator.tsx').default;
const Conversion=require('../app/(main)/tinh-diem-quy-doi/TinhDiemQuyDoiClient.tsx').default;
const Major=require('../app/admin/(dashboard)/quan-ly-nganh-hoc/NganhHocClient.tsx').default;
const {EvidencePreview}=require('../components/admin/EvidencePreview.tsx');
const combination={ma_to_hop:'A00',ma_mon_1:'M',ma_mon_2:'P',ma_mon_3:'C',mon_1:{ten_mon:'Toán'},mon_2:{ten_mon:'Vật lý'},mon_3:{ten_mon:'Hóa học'}};
const props={initialData:[{ma_nganh:'N01',ma_khoi_nganh:'K',ten_nganh:'Kỹ thuật công nghệ thông tin và truyền thông',khoi_kien_thuc:'Khối Ngôn ngữ & Khoa học xã hội',khoi_nganh:{ten_khoi_nganh:'Khối Kinh tế & Vận tải'},chuong_trinh:[{ma_chuong_trinh:'P1'}]}],faculties:[{ma_khoi_nganh:'K',ten_khoi_nganh:'Kh?i Ng�n ng? & Khoa h?c x� h?i v� nghi�n c?u ph�t tri?n'}]};
const root=createRoot(document.getElementById('root'));
window.show=(view,key)=>root.render(React.createElement('main',{className:'min-w-0 w-full p-4'},view==='home'?React.createElement(Home,{combinations:[{code:'A00',subjects:[{code:'M',name:'Toán'},{code:'P',name:'Vật lý'},{code:'C',name:'Hóa học'}]}]}):view==='conversion'?React.createElement(Conversion,{initialPrograms:[],initialToHops:[combination],referenceYear:2026}):view==='image'?React.createElement(EvidencePreview,{fileKey:key,title:'Synthetic test image'}):React.createElement(Major,props)));
window.show('major');


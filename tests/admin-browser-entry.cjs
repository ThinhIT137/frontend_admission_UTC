const React=require('react');
const {createRoot}=require('react-dom/client');
const {AdminShell}=require('../components/admin/AdminShell.tsx');
const ToHop=require('../app/admin/(dashboard)/to-hop-mon/ToHopClient.tsx').default;
const {AdminStatCard}=require('../components/admin/AdminStatCard.tsx');
const props={initialData:[{ma_to_hop:'A00',mon_1:{ten_mon:'Toán'},mon_2:{ten_mon:'Vật lý'},mon_3:{ten_mon:'Hóa học'},_count:{ctdt_to_hop:1}}],subjects:[],allPrograms:[{ma_chuong_trinh:'P1',ten_chuong_trinh:'Kỹ thuật công nghệ thông tin'}]};
createRoot(document.getElementById('root')).render(React.createElement(AdminShell,{role:'super_admin',userName:'Quản trị UTC',email:'admin@example.invalid'},React.createElement('section',{className:'grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6','aria-label':'Thống kê mẫu'},React.createElement(AdminStatCard,{title:'Hồ sơ đăng ký',value:1200,subtitle:'Dữ liệu giả lập',icon:'folder'}),React.createElement(AdminStatCard,{title:'Chương trình đào tạo',value:54,icon:'school'})),React.createElement(ToHop,props)));

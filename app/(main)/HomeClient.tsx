"use client";
import Link from "next/link";
import HomeQuickCalculator, { type QuickCombination } from "@/components/admission/HomeQuickCalculator";
import { ArrowRight, Search, Calculator, ChartColumn, Compass, FileCheck, CalendarDays, Sparkles, GraduationCap } from "lucide-react";

// Máy tính nhanh chỉ cộng điểm nhập; điều kiện và ưu tiên được xử lý ở trang quy đổi.
export default function HomeClient({ combinations, loadError }: { combinations: QuickCombination[]; loadError: boolean }) {
 const features = [
  { icon: ChartColumn, title: "Tra cứu điểm chuẩn & chỉ tiêu", text: "Đối chiếu điểm trúng tuyển theo từng năm và phương thức xét tuyển.", href: "/thong-tin-tuyen-sinh", tag: "Dữ liệu tham khảo", color: "blue" },
  { icon: Calculator, title: "Công cụ tính điểm quy đổi & xét tuyển", text: "Tính điểm, xem điều kiện và đối chiếu với chương trình bạn quan tâm.", href: "/tinh-diem-quy-doi", tag: "Đa phương thức", color: "orange" },
  { icon: Compass, title: "Tra cứu chương trình đào tạo", text: "Tìm hiểu chương trình đào tạo, môn học và định hướng nghề nghiệp.", href: "/tra-cuu-nganh-hoc", tag: "Khám phá UTC", color: "blue" },
  { icon: FileCheck, title: "Nộp & theo dõi hồ sơ tuyển sinh", text: "Gửi hồ sơ trực tuyến và theo dõi trạng thái các nguyện vọng của bạn.", href: "/nguyen-vong-cua-toi", tag: "Dành cho thí sinh", color: "orange" },
 ];
 return <div className="mx-auto max-w-[1440px] space-y-7 pb-8 text-[#192b59]">
  <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#182b65] via-[#2346a1] to-[#394d9a] px-6 py-8 text-white shadow-lg shadow-blue-950/10 sm:p-9 xl:p-11">
   <div aria-hidden="true" className="pointer-events-none absolute -right-28 -top-40 h-[500px] w-[500px] rounded-full border-[80px] border-white/[.025]"/>
   <div className="relative grid items-center gap-8 xl:grid-cols-[1.35fr_1fr]">
    <div><span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-amber-400"><GraduationCap size={15}/>Đại học Giao thông vận tải · Cơ sở Hà Nội</span>
     <h1 className="mt-5 max-w-xl text-3xl font-extrabold leading-[1.15] tracking-tight sm:text-[40px] xl:text-[43px]">Hành trình kiến tạo <span className="text-amber-400">tương lai</span> &amp; công nghệ</h1>
     <p className="mt-4 max-w-lg text-sm leading-7 text-blue-100">Khám phá ngành học, tìm hiểu phương thức xét tuyển và chuẩn bị hồ sơ của bạn. Cổng thông tin đồng hành cùng hành trình đến với UTC.</p>
     <form action="/tra-cuu-nganh-hoc" className="mt-6 flex gap-2 rounded-xl border border-white/15 bg-white/10 p-2"><label htmlFor="home-major-search" className="sr-only">Tên chương trình hoặc mã xét tuyển</label><div className="relative min-w-0 flex-1"><Search size={16} aria-hidden="true" className="absolute left-3 top-3 text-slate-400"/><input id="home-major-search" name="term" placeholder="Nhập tên chương trình, mã xét tuyển…" className="h-10 w-full rounded-lg bg-white pl-9 pr-2 text-xs text-slate-900 outline-none focus:ring-2 focus:ring-amber-400"/></div><button className="flex items-center gap-2 rounded-lg bg-amber-400 px-3 text-xs font-bold text-[#172653] hover:bg-amber-300">Tìm kiếm<ArrowRight size={14}/></button></form>
     <div className="mt-6 grid grid-cols-3 gap-3 border-t border-white/15 pt-5 text-[10px] leading-5 text-blue-100"><div><strong className="block text-xl font-bold text-amber-400">GHA</strong>Mã tuyển sinh Hà Nội</div><div><strong className="block text-xl font-bold text-amber-400">Đa phương thức</strong>Lựa chọn lộ trình phù hợp</div><div><strong className="block text-xl font-bold text-amber-400">Trực tuyến</strong>Tra cứu &amp; nộp hồ sơ</div></div>
    </div>
    <HomeQuickCalculator combinations={combinations} loadError={loadError} />
   </div>
  </section>
  <section><div className="mb-4 flex items-end justify-between gap-3"><div><h2 className="flex items-center gap-2 text-base font-bold"><span className="h-2 w-2 rounded-full bg-orange-500"/>Hệ thống tiện ích xét tuyển trọng tâm</h2><p className="mt-1 text-xs leading-5 text-slate-500">Công cụ tra cứu, tính điểm và lộ trình dành cho thí sinh.</p></div><Link href="/thong-tin-tuyen-sinh" className="hidden items-center gap-1 text-[11px] font-semibold text-blue-700 sm:flex">Xem hướng dẫn<ArrowRight size={13}/></Link></div><div className="grid gap-4 md:grid-cols-2">{features.map(({icon: Icon,...f}) => <article key={f.href} className="rounded-xl border border-slate-200 bg-white p-5"><div className="flex items-start gap-3"><span className={`rounded-lg p-2.5 ${f.color === "blue" ? "bg-blue-50 text-blue-800" : "bg-orange-50 text-orange-600"}`}><Icon size={20}/></span><div className="flex-1"><h3 className="text-sm font-bold">{f.title}</h3><p className="mt-2 text-xs leading-6 text-slate-500">{f.text}</p></div></div><div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4"><span className="rounded bg-slate-50 px-2 py-1 text-[10px] text-slate-500">{f.tag}</span><Link href={f.href} className="flex items-center gap-2 text-xs font-bold text-blue-800">Mở tiện ích<ArrowRight size={14}/></Link></div></article>)}</div></section>
  <section className="grid gap-3 sm:grid-cols-2">{[{Icon:Sparkles,title:"Trắc nghiệm hướng nghiệp",href:"/trac-nghiem-mbti"},{Icon:CalendarDays,title:"Lộ trình & mốc thời gian",href:"/lo-trinh-tuyen-sinh"}].map(({Icon,title,href}) => <Link key={href} href={href} className="flex items-center gap-3 rounded-xl border border-blue-100 bg-blue-50/50 p-4 text-xs font-semibold"><Icon size={18} className="text-blue-600"/>{title}<ArrowRight size={14} className="ml-auto"/></Link>)}</section>
  <p className="text-center text-[10px] leading-5 text-slate-500">Thông tin và kết quả đối chiếu mang tính tham khảo. Vui lòng kiểm tra đề án tuyển sinh chính thức trước khi nộp hồ sơ.</p>
 </div>;
}

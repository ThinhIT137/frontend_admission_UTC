import Link from "next/link";
import { ArrowUpRight, Mail, MapPin, Phone } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-auto w-full border-t border-slate-200 bg-white px-5 pt-8 text-[#14244e] sm:px-8">
      <div className="grid gap-8 pb-7 lg:grid-cols-[1.2fr_1fr_0.8fr]">
        <div>
          <Link href="/" className="inline-flex items-center gap-3 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-600">
            <img src="/utc_logo.svg" alt="Logo Trường Đại học Giao thông vận tải" width={52} height={52} className="h-13 w-13 shrink-0 object-contain" />
            <span><span className="block text-xs font-semibold uppercase tracking-wide text-slate-500">Trường Đại học</span><span className="mt-1 block text-base font-bold">Giao thông vận tải</span></span>
          </Link>
          <p className="mt-4 max-w-sm text-sm leading-6 text-slate-500">Đồng hành cùng thí sinh tìm hiểu chương trình đào tạo và lựa chọn hành trình tại UTC Hà Nội.</p>
          <span className="mt-3 inline-flex rounded-md border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-800">Hà Nội · Mã tuyển sinh GHA</span>
        </div>
        <div>
          <h2 className="mb-4 text-sm font-bold">Liên hệ tuyển sinh</h2>
          <ul className="space-y-3 text-sm leading-6 text-slate-600">
            <li className="flex items-start gap-2"><MapPin size={16} className="mt-1 shrink-0 text-blue-700" aria-hidden="true" /><span>Số 3 phố Cầu Giấy, phường Láng, Hà Nội</span></li>
            <li><a href="tel:+842437606352" className="inline-flex items-center gap-2 hover:text-blue-700 hover:underline"><Phone size={16} aria-hidden="true" />(024) 3760 6352</a></li>
            <li><a href="mailto:tuyensinh@utc.edu.vn" className="inline-flex items-center gap-2 break-all hover:text-blue-700 hover:underline"><Mail size={16} className="shrink-0" aria-hidden="true" />tuyensinh@utc.edu.vn</a></li>
          </ul>
        </div>
        <nav aria-label="Liên kết cuối trang">
          <h2 className="mb-4 text-sm font-bold">Dành cho thí sinh</h2>
          <ul className="space-y-2 text-sm leading-6 text-slate-600">
            <li><Link href="/thong-tin-tuyen-sinh" className="hover:text-blue-700 hover:underline">Thông tin tuyển sinh</Link></li>
            <li><Link href="/tra-cuu-nganh-hoc" className="hover:text-blue-700 hover:underline">Chương trình đào tạo</Link></li>
            <li><Link href="/lo-trinh-tuyen-sinh" className="hover:text-blue-700 hover:underline">Lộ trình tuyển sinh</Link></li>
            <li><a href="https://tuyensinh.utc.edu.vn" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 hover:text-blue-700 hover:underline">Cổng tuyển sinh UTC<ArrowUpRight size={14} aria-hidden="true" /></a></li>
          </ul>
        </nav>
      </div>
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-slate-100 pb-24 pt-4 text-xs leading-5 text-slate-500 sm:pb-8 sm:pr-40">
        <p>© {new Date().getFullYear()} · Thông tin tuyển sinh UTC Hà Nội</p>
        <a href="https://www.utc.edu.vn" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-medium hover:text-blue-700">Website nhà trường<ArrowUpRight size={13} aria-hidden="true" /></a>
      </div>
    </footer>
  );
}

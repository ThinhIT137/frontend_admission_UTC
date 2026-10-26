"use client";

import { useEffect, useState } from "react";
import { List } from "lucide-react";

const sections = [
  ["lo-trinh", "Mốc thời gian"], ["nguon-chinh-thuc", "Giới thiệu UTC"],
  ["dang-ky-lien-he", "Đăng ký & liên hệ"], ["luu-y-2026", "Lưu ý 2026"],
  ["quy-dinh-tuyen-sinh", "Điều kiện xét tuyển"], ["chi-tieu-diem-chuan", "Chỉ tiêu & điểm chuẩn"],
  ["quy-doi-utc", "Quy đổi điểm"], ["kenh-tuyen-sinh", "Kênh chính thức"],
  ["giai-dap-nhanh", "Giải đáp nhanh"],
];

export default function AdmissionSectionNav() {
  const [active, setActive] = useState(sections[0][0]);
  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      const visible = entries.filter(entry => entry.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
      if (visible[0]) setActive(visible[0].target.id);
    }, { rootMargin: "-80px 0px -60% 0px", threshold: 0 });
    for (const [id] of sections) {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    }
    return () => observer.disconnect();
  }, []);
  return <nav aria-label="Mục lục thông tin tuyển sinh" className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4">
    <p className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500"><List size={15} aria-hidden="true" />Nội dung trang</p>
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-5">
      {sections.map(([id, label]) => <a key={id} href={`#${id}`} aria-current={active === id ? "location" : undefined}
        onClick={event => {
          const element = document.getElementById(id);
          if (!element) return;
          event.preventDefault();
          setActive(id);
          element.scrollIntoView({ block: "start", behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
          window.history.replaceState(window.history.state, "", `#${id}`);
        }}
        className={`flex min-h-11 items-center justify-center rounded-lg border px-3 py-2 text-center text-sm font-medium leading-5 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 ${active === id ? "border-blue-950 bg-blue-950 text-white" : "border-slate-200 bg-white text-slate-600 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-900"}`}>{label}</a>)}
    </div>
  </nav>;
}

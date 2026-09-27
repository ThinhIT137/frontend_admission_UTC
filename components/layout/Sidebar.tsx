"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavItem {
  label: string;
  href: string;
  icon: string;
  badge?: string;
}

const navItems: NavItem[] = [
  { label: "Trang chủ", href: "/", icon: "home" },
  { label: "Tính điểm quy đổi", href: "/tinh-diem-quy-doi", icon: "calculate" },
  { label: "Tra cứu ngành học", href: "/tra-cuu-nganh-hoc", icon: "directions_railway" },
  { label: "Lộ trình tuyển sinh", href: "/lo-trinh-tuyen-sinh", icon: "timeline" },
  { label: "Trắc nghiệm MBTI", href: "/trac-nghiem-mbti", icon: "psychology" },
  { label: "Thông tin tuyển sinh", href: "/thong-tin-tuyen-sinh", icon: "article" },
  { label: "Hỏi đáp AI UTC", href: "/hoi-dap-ai", icon: "smart_toy" },
  { label: "Cổng Quản trị viên", href: "/admin", icon: "admin_panel_settings", badge: "Admin" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-full w-72 bg-[#eee7db] border-r-[3px] border-[#000525] z-50 flex flex-col justify-between overflow-y-auto shadow-[4px_0px_0px_#000525]">
      <div className="pt-4 px-5 pb-6 relative">
        {/* Tape Sticker Top - positioned safely inside header */}
        <div className="mx-auto mb-4 w-28 h-6 bg-[#fdb712] border-[2px] border-[#000525] rotate-[-2deg] shadow-[2px_2px_0px_#000525] flex items-center justify-center pointer-events-none">
          <span className="font-stamp text-[12px] text-[#000525] uppercase tracking-widest font-bold">
            UTC • 2026
          </span>
        </div>

        {/* Profile / School Card */}
        <div className="relative bg-[#fff9ee] p-4 border-[3px] border-[#000525] shadow-[4px_4px_0px_#000525] rotate-[-1deg] mb-6">
          <div className="absolute -top-2.5 -right-2.5 w-5 h-5 rounded-full bg-[#ba1a1a] border-[2px] border-[#000525] shadow-[1px_1px_0px_#000525]"></div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full border-[2.5px] border-[#000525] bg-[#ffdea8] p-0.5 shadow-[2px_2px_0px_#000525] shrink-0 overflow-hidden flex items-center justify-center">
              <span className="material-symbols-outlined text-[28px] text-[#000525]">school</span>
            </div>
            <div>
              <span className="font-display font-bold text-[22px] text-[#000525] tracking-tight leading-none block">
                UTC
              </span>
              <span className="font-stamp text-[11px] text-[#45464f] uppercase tracking-wider block">
                Tuyển Sinh Kỹ Sư
              </span>
            </div>
          </div>
          <div className="mt-3 pt-2 border-t-[2px] border-dashed border-[#c6c5d0] flex items-center justify-between">
            <span className="font-stamp text-[11px] text-[#000525] bg-[#ffdea8] px-1.5 py-0.5 border border-[#000525] font-bold">
              MÃ: GHA
            </span>
            <span className="font-stamp text-[11px] text-[#e55a3b] bg-[#ffdad6] px-1.5 py-0.5 border border-[#ba1a1a] font-bold">
              NIÊN KHÓA 66
            </span>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="space-y-2 flex flex-col">
          {navItems.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3.5 py-2.5 border-[2.5px] border-[#111827] transition-all flex items-center justify-between group rounded-[8px] ${
                  isActive
                    ? "bg-[#0284c7] text-white font-bold shadow-[3px_3px_0px_#111827] translate-x-1"
                    : "bg-[#fff9ee] text-[#1e1b14] font-medium shadow-[2px_2px_0px_#000525] hover:bg-[#ffdea8] hover:text-[#000525]"
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <span
                    className={`material-symbols-outlined text-[20px] ${
                      isActive ? "text-white" : "text-[#000525]"
                    }`}
                  >
                    {item.icon}
                  </span>
                  <span className="text-[14px]">{item.label}</span>
                </span>
                <span className="flex items-center gap-1">
                  {item.badge && (
                    <span className="text-[10px] bg-[#fdb712] text-[#000525] px-1.5 py-0.5 font-bold border border-[#111827] rounded">
                      {item.badge}
                    </span>
                  )}
                  <span
                    className={`material-symbols-outlined text-[16px] ${
                      isActive
                        ? "text-white"
                        : "text-[#000525] opacity-0 group-hover:opacity-100 transition-opacity"
                    }`}
                  >
                    arrow_forward
                  </span>
                </span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Banner Inside Sidebar */}
      <div className="p-4 border-t-[2px] border-dashed border-[#000525] bg-[#faf3e6]">
        <div className="flex items-center gap-2 bg-[#fff] p-2 border-[2px] border-[#000525] shadow-[2px_2px_0px_#000525] rounded-[6px]">
          <span className="material-symbols-outlined text-[#0284c7]">headset_mic</span>
          <div className="text-[11px]">
            <p className="font-bold text-[#000525]">Hỗ trợ tuyển sinh</p>
            <p className="text-[#45464f] font-mono">(024) 3766 3311</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

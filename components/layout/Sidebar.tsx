"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeftRight, ArrowRight, Bot, Brain, Calculator, ChevronLeft, ClipboardCheck, FileText, GraduationCap, Headset, House, ListOrdered, Route, ShieldCheck, TrainFront, Upload, type LucideIcon } from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
  group?: string;
}

const navItems: NavItem[] = [
  // Giai đoạn 1: Tìm hiểu & Định hướng nghề nghiệp
  {
    group: "1. Tìm hiểu trường & Ngành",
    label: "1. Trang chủ",
    href: "/",
    icon: House,
  },
  {
    group: "1. Tìm hiểu trường & Ngành",
    label: "2. Thông tin tuyển sinh",
    href: "/thong-tin-tuyen-sinh",
    icon: FileText,
    badge: "Đề án",
  },
  {
    group: "1. Tìm hiểu trường & Ngành",
    label: "3. Tra cứu ngành học",
    href: "/tra-cuu-nganh-hoc",
    icon: TrainFront,
  },
  {
    group: "1. Tìm hiểu trường & Ngành",
    label: "4. Trắc nghiệm MBTI",
    href: "/trac-nghiem-mbti",
    icon: Brain,
    badge: "Gợi ý",
  },

  {
    group: "1. Tìm hiểu trường & Ngành",
    label: "So sánh chương trình",
    href: "/so-sanh-chuong-trinh",
    icon: ArrowLeftRight,
  },

  // Giai đoạn 2: Đánh giá điểm & Kế hoạch thời gian
  {
    group: "2. Tính điểm & Lịch trình",
    label: "5. Tính điểm quy đổi",
    href: "/tinh-diem-quy-doi",
    icon: Calculator,
  },
  {
    group: "2. Tính điểm & Lịch trình",
    label: "6. Lộ trình tuyển sinh",
    href: "/lo-trinh-tuyen-sinh",
    icon: Route,
  },

  // Giai đoạn 3: Thực hiện nộp & Theo dõi kết quả
  {
    group: "3. Nộp hồ sơ & Tra cứu",
    label: "Nguyện vọng của tôi",
    href: "/nguyen-vong-cua-toi",
    icon: ListOrdered,
  },
  {
    group: "3. Nộp hồ sơ & Tra cứu",
    label: "7. Nộp hồ sơ trực tuyến",
    href: "/nop-ho-so",
    icon: Upload,
    badge: "Mở cổng",
  },
  {
    group: "3. Nộp hồ sơ & Tra cứu",
    label: "8. Tra cứu hồ sơ",
    href: "/tra-cuu-ho-so",
    icon: ClipboardCheck,
  },

  // Giai đoạn 4: Hỗ trợ & Quản trị hệ thống
  {
    group: "4. Hỗ trợ & Hệ thống",
    label: "9. Hỏi đáp AI UTC",
    href: "/hoi-dap-ai",
    icon: Bot,
    badge: "24/7",
  },
  {
    group: "4. Hỗ trợ & Hệ thống",
    label: "Cổng Quản trị viên",
    href: "/admin",
    icon: ShieldCheck,
    badge: "Admin",
  },
];

interface SidebarProps {
  isOpen?: boolean;
  onToggle?: () => void;
}

export function Sidebar({ isOpen = true, onToggle }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={`fixed left-0 top-0 h-full w-72 bg-[#eee7db] border-r-[3px] border-[#000525] z-50 flex flex-col justify-between overflow-y-auto shadow-[4px_0px_0px_#000525] transition-transform duration-300 ease-in-out ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <div className="pt-4 px-5 pb-6 relative">
        {/* Tape Sticker Top & Toggle Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="w-28 h-6 bg-[#fdb712] border-[2px] border-[#000525] rotate-[-2deg] shadow-[2px_2px_0px_#000525] flex items-center justify-center pointer-events-none">
            <span className="font-stamp text-[12px] text-[#000525] uppercase tracking-widest font-bold">
              UTC • 2026
            </span>
          </div>

          {onToggle && (
            <button
              onClick={onToggle}
              className="w-7 h-7 rounded border border-[#000525] bg-white flex items-center justify-center text-[#000525] hover:bg-[#fdb712] transition-colors"
              title="Thu gọn menu"
            >
              <ChevronLeft size={18} aria-hidden="true" />
            </button>
          )}
        </div>

        {/* Profile / School Card */}
        <div className="relative bg-[#fff9ee] p-4 border-[3px] border-[#000525] shadow-[4px_4px_0px_#000525] rotate-[-1deg] mb-6">
          <div className="absolute -top-2.5 -right-2.5 w-5 h-5 rounded-full bg-[#ba1a1a] border-[2px] border-[#000525] shadow-[1px_1px_0px_#000525]"></div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full border-[2.5px] border-[#000525] bg-[#ffdea8] p-0.5 shadow-[2px_2px_0px_#000525] shrink-0 overflow-hidden flex items-center justify-center">
              <GraduationCap size={28} className="shrink-0 text-[#000525]" aria-hidden="true" />
            </div>
            <div>
              <span className="font-display font-black text-[22px] text-[#000525] tracking-tight leading-none block">
                UTC
              </span>
              <span className="font-stamp text-[11px] text-[#45464f] uppercase tracking-wider block">
                Tuyển Sinh Kỹ Sư K66
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
        <nav className="space-y-1.5 flex flex-col">
          {navItems.map((item, idx) => {
            // SVG có sẵn trong HTML, không chờ font tải rồi mới biến chữ thành icon.
            const Icon = item.icon;
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);

            const isFirstInGroup = idx === 0 || item.group !== navItems[idx - 1]?.group;

            return (
              <div key={item.href} className="space-y-1">
                {isFirstInGroup && item.group && (
                  <div className={`px-1 flex items-center gap-1.5 ${idx === 0 ? "pb-1" : "pt-3 pb-1"}`}>
                    <span className="w-1.5 h-1.5 rounded-full bg-[#ba1a1a]" />
                    <span className="font-stamp text-[10.5px] font-black text-[#57534e] uppercase tracking-wider">
                      {item.group}
                    </span>
                  </div>
                )}

                <Link
                  href={item.href}
                  className={`px-3 py-2.5 border-[2px] border-[#111827] transition-all flex items-center justify-between group rounded-[8px] ${
                    isActive
                      ? "bg-[#0284c7] text-white font-bold shadow-[3px_3px_0px_#111827] translate-x-1"
                      : "bg-[#fff9ee] text-[#1e1b14] font-medium shadow-[2px_2px_0px_#000525] hover:bg-[#ffdea8] hover:text-[#000525]"
                  }`}
                >
                  <span className="flex min-w-0 items-center gap-2.5">
                    <Icon size={20} aria-hidden="true"
                      className={`shrink-0 ${
                        isActive ? "text-white" : "text-[#000525]"
                      }`}
                    />
                    <span className="text-[13.5px] leading-tight font-display font-bold">
                      {item.label}
                    </span>
                  </span>
                  <span className="flex shrink-0 items-center gap-1">
                    {item.badge && (
                      <span className="text-[10px] bg-[#fdb712] text-[#000525] px-1.5 py-0.5 font-bold border border-[#111827] rounded shadow-[1px_1px_0px_#111827]">
                        {item.badge}
                      </span>
                    )}
                    <ArrowRight size={15} aria-hidden="true"
                      className={`shrink-0 ${
                        isActive
                          ? "text-white"
                          : "text-[#000525] opacity-0 group-hover:opacity-100 transition-opacity"
                      }`}
                    />
                  </span>
                </Link>
              </div>
            );
          })}
        </nav>
      </div>

      {/* Footer Banner Inside Sidebar */}
      <div className="p-4 border-t-[2px] border-dashed border-[#000525] bg-[#faf3e6]">
        <div className="flex items-center gap-2 bg-[#fff] p-2 border-[2px] border-[#000525] shadow-[2px_2px_0px_#000525] rounded-[6px]">
          <Headset size={24} className="shrink-0 text-[#0284c7]" aria-hidden="true" />
          <div className="text-[11px]">
            <p className="font-bold text-[#000525]">Hotline Hà Nội</p>
            <p className="text-[#45464f] font-mono">(024) 3766 3311</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

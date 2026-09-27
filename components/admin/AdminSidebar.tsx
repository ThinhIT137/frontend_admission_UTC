"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface AdminNavItem {
  label: string;
  href: string;
  icon: string;
}

interface AdminNavGroup {
  groupName: string;
  items: AdminNavItem[];
}

const adminNavGroups: AdminNavGroup[] = [
  {
    groupName: "Tổng Quan",
    items: [
      { label: "Bảng Điều Khiển", href: "/admin", icon: "dashboard" },
    ],
  },
  {
    groupName: "Quản Lý Danh Mục",
    items: [
      { label: "Quản Lý Ngành Học", href: "/admin/quan-ly-nganh-hoc", icon: "school" },
      { label: "Chương Trình Đào Tạo", href: "/admin/quan-ly-ctdt", icon: "menu_book" },
      { label: "Tổ Hợp Môn Xét Tuyển", href: "/admin/to-hop-mon", icon: "category" },
      { label: "Phương Thức Xét Tuyển", href: "/admin/phuong-thuc-xet-tuyen", icon: "how_to_reg" },
    ],
  },
  {
    groupName: "Nội Dung & Tiến Độ",
    items: [
      { label: "Mốc Thời Gian Lộ Trình", href: "/admin/moc-thoi-gian", icon: "calendar_month" },
      { label: "Tin Tức & Đề Án", href: "/admin/tin-tuc-de-an", icon: "feed" },
    ],
  },
  {
    groupName: "Hệ Thống AI",
    items: [
      { label: "Dữ Liệu Chatbot AI", href: "/admin/du-lieu-chatbot-ai", icon: "smart_toy" },
    ],
  },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-full w-72 bg-[#0d1b4e] text-white z-50 flex flex-col justify-between shadow-2xl border-r border-[#1a2c6d]">
      <div className="flex flex-col">
        {/* Brand Header */}
        <div className="p-4 flex items-center gap-3 bg-[#081133]">
          <div className="w-10 h-10 rounded-full bg-[#fdb712] p-0.5 shadow flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[#0d1b4e] text-[24px]">school</span>
          </div>
          <div>
            <span className="font-display font-bold text-[16px] text-white tracking-wide block uppercase leading-tight">
              UTC Admin
            </span>
            <span className="font-stamp text-[10px] text-[#fdb712] uppercase tracking-wider block">
              Kỳ Tuyển Sinh K66
            </span>
          </div>
        </div>

        <div className="px-4 py-2 text-[#7884bd] font-stamp text-[11px] uppercase border-b border-[#1a2c6d]">
          Hệ Thống Quản Trị Trung Tâm
        </div>

        {/* Navigation Groups */}
        <nav className="flex flex-col px-3 py-2 gap-1 overflow-y-auto max-h-[calc(100vh-180px)]">
          {adminNavGroups.map((group, groupIdx) => (
            <div key={groupIdx} className="mb-2">
              <div className="pt-2 pb-1 px-2 font-stamp text-[10px] text-[#7884bd] uppercase tracking-wider">
                {group.groupName}
              </div>
              {group.items.map((item) => {
                const isActive =
                  item.href === "/admin"
                    ? pathname === "/admin"
                    : pathname.startsWith(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2.5 px-3 py-2 my-0.5 rounded-lg text-[13px] font-medium transition-all ${
                      isActive
                        ? "bg-[#fdb712] text-[#0d1b4e] font-bold shadow-md"
                        : "text-white/80 hover:bg-[#1a2c6d] hover:text-white"
                    }`}
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>
      </div>

      {/* Footer Info & Switch to Public Link */}
      <div className="p-3 bg-[#081133] m-2 rounded-lg flex flex-col gap-1.5 border border-[#1a2c6d]">
        <div className="flex items-center justify-between text-[11px]">
          <span className="flex items-center gap-1.5 font-stamp text-white">
            <span className="w-2 h-2 rounded-full bg-[#86efac] animate-pulse"></span>
            Online v2.5
          </span>
          <span className="font-stamp text-[#7884bd]">UTC-SYS</span>
        </div>
        <Link
          href="/"
          className="mt-1 flex items-center justify-center gap-1 py-1.5 px-3 bg-[#1a2c6d] hover:bg-[#253985] text-white rounded text-[12px] font-semibold transition-all"
        >
          <span className="material-symbols-outlined text-[14px]">open_in_new</span>
          Trang Thí Sinh
        </Link>
      </div>
    </aside>
  );
}

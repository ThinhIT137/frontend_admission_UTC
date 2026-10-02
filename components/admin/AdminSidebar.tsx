"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface AdminNavItem {
  label: string;
  href?: string;
  icon: string;
  subItems?: AdminNavItem[];
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
      {
        label: "Đào Tạo & Tuyển Sinh",
        icon: "school",
        subItems: [
          { label: "Khoa / Viện", href: "/admin/quan-ly-khoi-nganh", icon: "account_balance" },
          { label: "Ngành Học", href: "/admin/quan-ly-nganh-hoc", icon: "menu_book" },
          { label: "Chương Trình Đào Tạo", href: "/admin/quan-ly-ctdt", icon: "local_library" },
        ]
      },
      {
        label: "Tổ Hợp & Môn Xét Tuyển",
        icon: "category",
        subItems: [
          { label: "Tổ Hợp Xét Tuyển", href: "/admin/to-hop-mon", icon: "dashboard_customize" },
          { label: "Môn Xét Tuyển", href: "/admin/mon-xet-tuyen", icon: "book" },
          { label: "Phương Thức Xét Tuyển", href: "/admin/phuong-thuc-xet-tuyen", icon: "how_to_reg" },
        ]
      },
      {
        label: "Chỉ Tiêu & Điểm Chuẩn",
        href: "/admin/chi-tieu-diem-chuan",
        icon: "fact_check",
      },
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

interface AdminSidebarProps {
  role?: string;
}

import { useState, useEffect } from "react";

export function AdminSidebar({ role }: AdminSidebarProps) {
  const pathname = usePathname();
  const [expandedGroups, setExpandedGroups] = useState<string[]>([]);

  // Tự động mở group nếu đang ở trang con
  useEffect(() => {
    adminNavGroups.forEach((group) => {
      group.items.forEach((item) => {
        if (item.subItems) {
          const isActive = item.subItems.some((sub) => sub.href && pathname.startsWith(sub.href));
          if (isActive && !expandedGroups.includes(item.label)) {
            setExpandedGroups((prev) => [...prev, item.label]);
          }
        }
      });
    });
  }, [pathname]);

  const toggleGroup = (label: string) => {
    setExpandedGroups((prev) =>
      prev.includes(label) ? prev.filter((g) => g !== label) : [...prev, label]
    );
  };

  // Clone nav groups để tránh mutate trực tiếp array gốc
  const navGroups = [...adminNavGroups];

  // Nếu là super_admin thì hiển thị thêm menu Quản lý hệ thống
  if (role === "super_admin") {
    navGroups.push({
      groupName: "Hệ Thống",
      items: [
        { label: "Quản Lý Tài Khoản", href: "/admin/accounts", icon: "manage_accounts" },
        { label: "Quản Lý Vai Trò", href: "/admin/roles", icon: "admin_panel_settings" }
      ]
    });
  }

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
          {navGroups.map((group, groupIdx) => (
            <div key={groupIdx} className="mb-2">
              <div className="pt-2 pb-1 px-2 font-stamp text-[10px] text-[#7884bd] uppercase tracking-wider">
                {group.groupName}
              </div>
              {group.items.map((item) => {
                const hasSubItems = item.subItems && item.subItems.length > 0;
                const isExpanded = expandedGroups.includes(item.label);
                
                // Nếu item không có subItems, check active trực tiếp
                const isItemActive =
                  !hasSubItems &&
                  item.href &&
                  (item.href === "/admin"
                    ? pathname === "/admin"
                    : pathname.startsWith(item.href));

                // Nếu có subItems, check xem có subItem nào active không
                const isGroupActive =
                  hasSubItems &&
                  item.subItems?.some((sub) => sub.href && pathname.startsWith(sub.href));

                return (
                  <div key={item.label} className="my-0.5">
                    {hasSubItems ? (
                      <button
                        onClick={() => toggleGroup(item.label)}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-[13px] font-medium transition-all ${
                          isGroupActive
                            ? "bg-[#1a2c6d] text-white font-bold"
                            : "text-white/80 hover:bg-[#1a2c6d] hover:text-white"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="material-symbols-outlined text-[18px]">
                            {item.icon}
                          </span>
                          <span>{item.label}</span>
                        </div>
                        <span
                          className={`material-symbols-outlined text-[16px] transition-transform duration-200 ${
                            isExpanded ? "rotate-180" : ""
                          }`}
                        >
                          expand_more
                        </span>
                      </button>
                    ) : (
                      <Link
                        href={item.href || "#"}
                        className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-all ${
                          isItemActive
                            ? "bg-[#fdb712] text-[#0d1b4e] font-bold shadow-md"
                            : "text-white/80 hover:bg-[#1a2c6d] hover:text-white"
                        }`}
                      >
                        <span className="material-symbols-outlined text-[18px]">
                          {item.icon}
                        </span>
                        <span>{item.label}</span>
                      </Link>
                    )}

                    {/* Sub Items */}
                    {hasSubItems && isExpanded && (
                      <div className="mt-1 flex flex-col gap-0.5 relative before:absolute before:left-[19px] before:top-0 before:bottom-2 before:w-[1px] before:bg-[#253985]">
                        {item.subItems?.map((subItem) => {
                          const isSubActive = subItem.href && pathname.startsWith(subItem.href);
                          return (
                            <Link
                              key={subItem.label}
                              href={subItem.href || "#"}
                              className={`flex items-center gap-2.5 pl-10 pr-3 py-1.5 rounded-lg text-[12px] font-medium transition-all relative ${
                                isSubActive
                                  ? "text-[#fdb712] font-bold"
                                  : "text-[#7884bd] hover:text-white hover:bg-[#1a2c6d]"
                              }`}
                            >
                              {isSubActive && (
                                <span className="absolute left-[17.5px] w-1 h-1 rounded-full bg-[#fdb712]" />
                              )}
                              <span>{subItem.label}</span>
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
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

"use client";

import Link from "next/link";
import Image from "next/image";
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
      { label: "Quản Lý Hồ Sơ", href: "/admin/ho-so", icon: "folder_shared" },
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
    groupName: "Thống Kê & Báo Cáo",
    items: [
      { label: "Thống Kê Hồ Sơ", href: "/admin/thong-ke", icon: "monitoring" },
      { label: "Báo Cáo Trúng Tuyển", href: "/admin/bao-cao-trung-tuyen", icon: "summarize" },
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
  isOpen?: boolean;
  onToggle?: () => void;
}

import { useState } from "react";
import { ArrowUpRight, BookOpen, Bot, CalendarDays, ChartNoAxesCombined, ChevronDown, ChevronLeft, ClipboardList, FileText, FolderOpen, GraduationCap, LayoutDashboard, Layers, ShieldCheck, UsersRound, type LucideIcon } from "lucide-react";

const navIcons: Record<string, LucideIcon> = {
  dashboard: LayoutDashboard, folder_shared: FolderOpen, school: GraduationCap,
  category: Layers, fact_check: ClipboardList, monitoring: ChartNoAxesCombined,
  summarize: FileText, calendar_month: CalendarDays, feed: FileText, smart_toy: Bot,
  manage_accounts: UsersRound, admin_panel_settings: ShieldCheck,
};

export function AdminSidebar({ role, onToggle }: AdminSidebarProps) {
  const pathname = usePathname();
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const navGroups = [...adminNavGroups];
  if (role === "super_admin") navGroups.push({ groupName: "Hệ thống", items: [
    { label: "Quản lý tài khoản", href: "/admin/accounts", icon: "manage_accounts" },
    { label: "Quản lý vai trò", href: "/admin/roles", icon: "admin_panel_settings" },
  ] });
  return <aside className="admin-sidebar flex h-full w-72 flex-col border-r border-blue-950 bg-[#172653] text-blue-100">
    <div className="flex h-16 shrink-0 items-center justify-between border-b border-white/10 px-4">
      <Link href="/admin" className="flex items-center gap-2.5" aria-label="Trang chủ quản trị UTC">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/5 p-1"><Image src="/utc_logo.svg" alt="Logo Trường Đại học Giao thông Vận tải" width={36} height={36} className="h-9 w-9 object-contain" /></span>
        <span><span className="block text-base font-extrabold tracking-tight text-white">UTC ADMISSION</span><span className="block text-[10px] font-semibold uppercase tracking-[.18em] text-blue-200">Không gian quản trị</span></span>
      </Link>
      <button type="button" onClick={onToggle} aria-label="Thu gọn menu quản trị" className="flex h-9 w-9 items-center justify-center rounded-xl text-blue-200 hover:bg-white/10"><ChevronLeft size={20} aria-hidden="true" /></button>
    </div>
    <nav aria-label="Menu quản trị" className="min-h-0 flex-1 overflow-y-auto px-3 py-5">
      {navGroups.map(group => <div key={group.groupName} className="mb-5">
        <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[.16em] text-blue-200">{group.groupName}</p>
        <div className="space-y-1">{group.items.map(item => {
          const active = item.href === "/admin" ? pathname === "/admin" : !!item.href && pathname.startsWith(item.href);
          const groupActive = item.subItems?.some(sub => !!sub.href && pathname.startsWith(sub.href));
          const isExpanded = expanded[item.label] ?? groupActive;
          const Icon = navIcons[item.icon] ?? BookOpen;
          return <div key={item.label}>
            {item.subItems ? <button type="button" aria-expanded={!!isExpanded} onClick={() => setExpanded(value => ({ ...value, [item.label]: !isExpanded }))}
              className={`flex min-h-11 w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-[13px] font-semibold transition-colors ${groupActive ? "bg-white/5 text-white" : "text-blue-100 hover:bg-white/10"}`}>
              <Icon size={18} className={groupActive ? "shrink-0 text-amber-400" : "shrink-0 text-blue-200"} aria-hidden="true" /><span className="flex-1">{item.label}</span><ChevronDown size={15} aria-hidden="true" className={isExpanded ? "rotate-180" : ""} />
            </button> : <Link href={item.href!} aria-current={active ? "page" : undefined}
              className={`flex min-h-11 items-center gap-2.5 rounded-lg border-l-[3px] px-3 py-2.5 text-[13px] font-semibold transition-colors ${active ? "border-amber-400 bg-[#29458d] text-white" : "border-transparent text-blue-100 hover:bg-white/10"}`}><Icon size={18} className={active ? "shrink-0 text-amber-400" : "shrink-0 text-blue-200"} aria-hidden="true" />{item.label}</Link>}
            {item.subItems && isExpanded && <div className="ml-5 mt-1 space-y-1 border-l border-white/10 pl-3">{item.subItems.map(sub => {
              const selected = !!sub.href && pathname.startsWith(sub.href);
              return <Link key={sub.label} href={sub.href!} aria-current={selected ? "page" : undefined} className={`block rounded-lg border-l-[3px] px-3 py-2.5 text-xs font-medium ${selected ? "border-amber-400 bg-[#29458d] font-bold text-white" : "border-transparent text-blue-200 hover:bg-white/10 hover:text-white"}`}>{sub.label}</Link>;
            })}</div>}
          </div>;
        })}</div>
      </div>)}
    </nav>
    <div className="shrink-0 border-t border-white/10 p-3"><Link href="/" className="flex min-h-11 items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 text-xs font-semibold text-blue-100 hover:bg-white/10">Trang thí sinh<ArrowUpRight size={17} aria-hidden="true" /></Link></div>
  </aside>;
}

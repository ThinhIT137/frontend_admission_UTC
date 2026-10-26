"use client";

import {
    ArrowLeftRight,
    ArrowRight,
    Bot,
    Brain,
    Calculator,
    ChevronLeft,
    ClipboardCheck,
    FileText,
    GraduationCap,
    Headset,
    House,
    ListOrdered,
    Route,
    ShieldCheck,
    TrainFront,
    Upload,
    type LucideIcon,
} from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";

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
        group: "1. Tìm hiểu trường & ngành",
        label: "1. Trang chủ",
        href: "/",
        icon: House,
    },
    {
        group: "1. Tìm hiểu trường & ngành",
        label: "2. Thông tin tuyển sinh",
        href: "/thong-tin-tuyen-sinh",
        icon: FileText,
        badge: "Đề án",
    },
    {
        group: "1. Tìm hiểu trường & ngành",
        label: "3. Tra cứu chương trình đào tạo",
        href: "/tra-cuu-nganh-hoc",
        icon: TrainFront,
    },
    {
        group: "1. Tìm hiểu trường & ngành",
        label: "4. Trắc nghiệm MBTI",
        href: "/trac-nghiem-mbti",
        icon: Brain,
        badge: "Gợi ý",
    },

    {
        group: "1. Tìm hiểu trường & ngành",
        label: "So sánh chương trình",
        href: "/so-sanh-chuong-trinh",
        icon: ArrowLeftRight,
    },

    // Giai đoạn 2: Đánh giá điểm & Kế hoạch thời gian
    {
        group: "2. Tính điểm & lịch trình",
        label: "5. Tính điểm quy đổi",
        href: "/tinh-diem-quy-doi",
        icon: Calculator,
    },
    {
        group: "2. Tính điểm & lịch trình",
        label: "6. Lộ trình tuyển sinh",
        href: "/lo-trinh-tuyen-sinh",
        icon: Route,
    },

    // Giai đoạn 3: Thực hiện nộp & Theo dõi kết quả
    {
        group: "3. Nộp hồ sơ & tra cứu",
        label: "Nguyện vọng của tôi",
        href: "/nguyen-vong-cua-toi",
        icon: ListOrdered,
    },
    {
        group: "3. Nộp hồ sơ & tra cứu",
        label: "7. Nộp hồ sơ trực tuyến",
        href: "/nop-ho-so",
        icon: Upload,
        badge: "Mở cổng",
    },
    {
        group: "3. Nộp hồ sơ & tra cứu",
        label: "8. Tra cứu hồ sơ",
        href: "/tra-cuu-ho-so",
        icon: ClipboardCheck,
    },

    // Giai đoạn 4: Hỗ trợ & Quản trị hệ thống
    {
        group: "4. Hỗ trợ & hệ thống",
        label: "9. Hỏi đáp AI UTC",
        href: "/hoi-dap-ai",
        icon: Bot,
        badge: "24/7",
    },
    {
        group: "4. Hỗ trợ & hệ thống",
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
    const reduced = useReducedMotion();
    return (
        <motion.aside
            id="portal-sidebar"
            aria-label="Điều hướng chính"
            aria-hidden={!isOpen}
            inert={!isOpen}
            initial={false}
            animate={{ x: isOpen ? 0 : -244 }}
            transition={{ duration: reduced ? 0 : 0.24, ease: "easeOut" }}
            className="fixed left-0 top-0 z-50 flex h-dvh w-[244px] flex-col overflow-y-auto bg-[#172653] text-white"
        >
            <div className="border-b border-white/10 px-5 pb-5 pt-6">
                <div className="flex items-center gap-3">
                    <img
                        src="/utc_logo.svg"
                        alt="Logo Đại học Giao thông vận tải"
                        width={43}
                        height={43}
                        className="h-11 w-11 shrink-0 object-contain"
                    />
                    <div className="min-w-0">
                        <p className="text-[14px] font-bold leading-6 text-amber-400">
                            Cổng tuyển sinh
                        </p>
                        <p className="mt-1 text-[12px] font-semibold leading-5 text-white">
                            <span className="block">Trường đại học</span>{" "}
                            <span className="block">Giao thông vận tải</span>
                        </p>
                    </div>
                </div>
                <div className="mt-4 flex items-center justify-between rounded-md border border-white/10 bg-white/5 px-3 py-2 text-[10px]">
                    <strong className="text-blue-200">Cơ sở Hà Nội</strong>
                    <strong className="text-amber-400">Mã: GHA</strong>
                    {onToggle && (
                        <button
                            type="button"
                            onClick={onToggle}
                            aria-label="Đóng thanh menu"
                            className="rounded p-1 hover:bg-white/10"
                        >
                            <ChevronLeft size={16} />
                        </button>
                    )}
                </div>
            </div>
            <nav
                className="flex-1 space-y-1 px-3 py-4"
                aria-label="Chức năng tuyển sinh"
            >
                {navItems.map((item, idx) => {
                    const Icon = item.icon;
                    const active =
                        item.href === "/"
                            ? pathname === "/"
                            : pathname.startsWith(item.href);
                    return (
                        <div key={item.href}>
                            {(idx === 0 ||
                                item.group !== navItems[idx - 1]?.group) && (
                                <h2 className="mb-3 mt-6 px-2 text-[14px] font-bold leading-6 text-blue-100">
                                    {item.group?.replace(/^\d+\. /, "")}
                                </h2>
                            )}
                            <Link
                                href={item.href}
                                aria-current={active ? "page" : undefined}
                                className={`flex min-h-11 items-center gap-2.5 rounded-lg border-l-[3px] px-2.5 py-2 text-[12px] font-medium transition-colors ${active ? "border-amber-400 bg-[#29458d] text-white" : "border-transparent text-blue-100 hover:bg-white/10"}`}
                            >
                                <Icon
                                    size={15}
                                    aria-hidden="true"
                                    className={`shrink-0 ${active ? "text-amber-400" : "text-blue-200/70"}`}
                                />
                                <span className="flex-1">
                                    {item.label.replace(/^\d+\. /, "")}
                                </span>
                                {item.badge &&
                                    item.href !== "/nop-ho-so" &&
                                    item.href !== "/hoi-dap-ai" && (
                                        <span className="rounded bg-white/10 px-1.5 py-0.5 text-[8px] text-blue-100">
                                            {item.badge}
                                        </span>
                                    )}
                                {active && (
                                    <span className="h-1 w-1 rounded-full bg-amber-400" />
                                )}
                            </Link>
                        </div>
                    );
                })}
            </nav>
            <div className="border-t border-white/10 p-3">
                <a
                    href="tel:02437663311"
                    className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 px-3 py-3"
                >
                    <Headset size={19} className="text-amber-400" />
                    <div>
                        <p className="text-[9px] font-bold uppercase text-amber-400">
                            Tư vấn tuyển sinh
                        </p>
                        <p className="mt-1 text-xs font-semibold">
                            (024) 3766 3311
                        </p>
                    </div>
                </a>
                <Link
                    href="/nguyen-vong-cua-toi"
                    className="mt-2 flex items-center gap-2 rounded-lg bg-[#29458d] px-3 py-2 text-[11px] font-semibold"
                >
                    <GraduationCap size={16} className="text-amber-400" />
                    Cổng thí sinh
                    <ArrowRight size={14} className="ml-auto" />
                </Link>
            </div>
        </motion.aside>
    );
}

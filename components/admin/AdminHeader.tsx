"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronDown, LogOut, Menu, UserRound } from "lucide-react";
import { toast } from "@/libs/admin-toast";
import { logout } from "@/actions/auth.action";
import { useAdminTask } from "@/hooks/useAdminTask";

interface AdminHeaderProps { userName?: string; email?: string; isSidebarOpen?: boolean; onToggleSidebar?: () => void; }
export function AdminHeader({ userName = "Admin", email = "", onToggleSidebar }: AdminHeaderProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { pending, run } = useAdminTask();
  useEffect(() => {
    const outside = (event: MouseEvent) => { if (!ref.current?.contains(event.target as Node)) setOpen(false); };
    const escape = (event: KeyboardEvent) => { if (event.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", outside); document.addEventListener("keydown", escape);
    return () => { document.removeEventListener("mousedown", outside); document.removeEventListener("keydown", escape); };
  }, []);
  return <header className="flex h-16 w-full items-center justify-between gap-3 border-b border-slate-200 bg-white/95 px-4 backdrop-blur-md sm:px-6">
    <div className="flex min-w-0 items-center gap-3">
      <button type="button" onClick={onToggleSidebar} aria-label="Mở hoặc thu gọn menu quản trị" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 text-[#192b59] hover:bg-slate-50"><Menu size={20} aria-hidden="true" /></button>
      <div className="min-w-0"><p className="truncate text-sm font-bold text-[#192b59]">Không gian quản trị</p><p className="hidden text-xs text-slate-500 sm:block">Cổng tư vấn tuyển sinh UTC</p></div>
    </div>
    <div className="relative" ref={ref}>
      <button type="button" onClick={() => setOpen(value => !value)} aria-expanded={open} aria-label="Mở tùy chọn tài khoản" className="flex items-center gap-2 rounded-xl p-1.5 hover:bg-slate-50">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#192b59] text-sm font-bold text-white">{userName.charAt(0).toUpperCase()}</span>
        <span className="hidden max-w-40 truncate text-sm font-semibold text-slate-700 sm:block">{userName}</span><ChevronDown size={16} aria-hidden="true" />
      </button>
      {open && <div className="absolute right-0 mt-2 w-64 overflow-hidden rounded-2xl border border-slate-200 bg-white p-1.5 shadow-lg">
        <div className="border-b border-slate-100 px-3 py-3"><p className="truncate text-sm font-bold text-[#192b59]">{userName}</p><p className="truncate text-xs text-slate-500">{email}</p></div>
        <Link href="/admin/profile" onClick={() => setOpen(false)} className="flex items-center gap-2 rounded-xl px-3 py-3 text-sm hover:bg-slate-50"><UserRound size={18} aria-hidden="true" />Hồ sơ của tôi</Link>
        <button type="button" disabled={pending} onClick={() => void run(async () => { try { await logout(); router.push("/admin/login"); } catch { toast.error("Chưa thể đăng xuất. Vui lòng thử lại."); } })} className="flex w-full items-center gap-2 rounded-xl px-3 py-3 text-sm text-red-700 hover:bg-red-50"><LogOut size={18} aria-hidden="true" />{pending ? "Đang đăng xuất…" : "Đăng xuất"}</button>
      </div>}
    </div>
  </header>;
}
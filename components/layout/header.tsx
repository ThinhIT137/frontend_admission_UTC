"use client";
import Link from "next/link";
import { Menu, Search, ArrowUpRight } from "lucide-react";
interface HeaderProps { isSidebarOpen?: boolean; onToggleSidebar?: () => void }
export function Header({ isSidebarOpen = true, onToggleSidebar }: HeaderProps) {
 return <header className="flex h-16 w-full items-center gap-3 border-b border-slate-200/80 bg-white px-3 text-[#192b59] sm:gap-5 sm:px-6">
 <button type="button" onClick={onToggleSidebar} aria-label={isSidebarOpen ? "Thu gọn thanh menu" : "Mở rộng thanh menu"} aria-expanded={isSidebarOpen} aria-controls="portal-sidebar" data-sidebar-toggle className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-slate-200 bg-white transition-colors hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-blue-600"><Menu size={20} aria-hidden="true" /></button>
 <div className="flex min-w-0 flex-1 justify-center">
   <form role="search" action="/tra-cuu-nganh-hoc" className="relative w-full max-w-3xl"><label htmlFor="header-major-search" className="sr-only">Tìm chương trình, mã xét tuyển</label><Search aria-hidden="true" size={18} className="pointer-events-none absolute left-3.5 top-3.5 text-slate-400"/><input id="header-major-search" name="term" placeholder="Tìm chương trình, mã xét tuyển…" className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50/80 pl-11 pr-3 text-[13px] outline-none transition-colors focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100 sm:pr-24"/><button type="submit" className="absolute right-1.5 top-1.5 hidden h-8 items-center rounded-lg bg-white px-3 text-xs font-semibold text-blue-900 shadow-sm ring-1 ring-slate-200 transition-colors hover:bg-blue-50 sm:inline-flex">Tìm kiếm</button></form>
 </div>
 <Link href="/nop-ho-so" className="flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-[#192b59] px-3 text-xs font-bold text-white shadow-sm transition-colors hover:bg-blue-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 sm:px-5 sm:text-[13px]"><span className="hidden sm:inline">Đăng ký xét tuyển</span><span className="sm:hidden">Nộp hồ sơ</span><ArrowUpRight size={17} aria-hidden="true" /></Link>
 </header>;
}

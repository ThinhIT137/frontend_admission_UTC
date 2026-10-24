"use client";
import Link from "next/link";
import { Menu, Search, ArrowUpRight, House } from "lucide-react";
interface HeaderProps { isSidebarOpen?: boolean; onToggleSidebar?: () => void }
export function Header({ isSidebarOpen = true, onToggleSidebar }: HeaderProps) {
 return <header className="flex h-16 w-full items-center gap-3 border-b border-slate-200 bg-white px-4 text-[#192b59] sm:px-6">
 <button type="button" onClick={onToggleSidebar} aria-label={isSidebarOpen ? "Thu gọn thanh menu" : "Mở rộng thanh menu"} aria-expanded={isSidebarOpen} aria-controls="portal-sidebar" data-sidebar-toggle className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-slate-200 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-blue-600"><Menu size={19}/></button>
 <Link href="/" className="hidden items-center gap-2 text-[11px] font-medium lg:flex"><House size={14}/>Trang chủ<span className="mx-2 text-slate-300">/</span>Tuyển sinh đại học</Link>
 <form action="/tra-cuu-nganh-hoc" className="relative min-w-0 flex-1"><label htmlFor="header-major-search" className="sr-only">Tìm chương trình, mã xét tuyển</label><Search aria-hidden="true" size={15} className="absolute left-3 top-3 text-slate-400"/><input id="header-major-search" name="term" placeholder="Tìm chương trình, mã xét tuyển…" className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-2 text-xs outline-none focus:border-blue-500"/></form>
 <span className="hidden rounded-lg bg-blue-50 px-3 py-2 text-[11px] font-semibold text-blue-900 xl:block">Cơ sở Hà Nội · GHA</span>
 <Link href="/nop-ho-so" className="flex shrink-0 items-center gap-1 rounded-lg bg-[#192b59] px-3 py-2.5 text-[11px] font-bold text-white hover:bg-blue-800"><ArrowUpRight size={14}/><span className="hidden sm:inline">Đăng ký xét tuyển</span><span className="sm:hidden">Nộp hồ sơ</span></Link>
 </header>;
}

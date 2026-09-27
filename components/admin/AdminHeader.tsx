"use client";

import Link from "next/link";

interface AdminHeaderProps {
  onSearch?: (query: string) => void;
}

export function AdminHeader({ onSearch }: AdminHeaderProps) {
  return (
    <header className="fixed top-0 left-72 right-0 h-16 bg-[#fff9ee]/90 backdrop-blur-md border-b border-[#e9e2d5] shadow-sm z-40 px-6 flex items-center justify-between gap-4">
      {/* Search Input */}
      <div className="flex items-center gap-4 flex-1 max-w-xl">
        <div className="relative w-full">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#767680] text-[18px]">
            search
          </span>
          <input
            type="text"
            onChange={(e) => onSearch?.(e.target.value)}
            placeholder="Tìm kiếm thí sinh, mã ngành, văn bản tuyển sinh..."
            className="w-full pl-9 pr-4 py-1.5 rounded-lg bg-[#faf3e6] text-[#1e1b14] text-[13px] outline-none border border-[#c6c5d0] focus:ring-2 focus:ring-[#0d1b4e] font-medium"
          />
        </div>
      </div>

      {/* Right Controls & Profile */}
      <div className="flex items-center gap-4">
        {/* Notification Bell */}
        <div className="relative">
          <button className="w-9 h-9 rounded-full flex items-center justify-center bg-[#faf3e6] text-[#1e1b14] hover:bg-[#eee7db] transition-colors border border-[#c6c5d0]">
            <span className="material-symbols-outlined text-[20px]">notifications</span>
          </button>
          <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-[#fdb712] rounded-full ring-2 ring-[#fff9ee]"></span>
        </div>

        <div className="h-8 w-[1px] bg-[#c6c5d0]"></div>

        {/* Admin Profile */}
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <span className="block font-bold text-[13px] text-[#1e1b14] leading-tight font-display">
              Ban Tuyển Sinh UTC
            </span>
            <span className="block font-stamp text-[10px] text-[#45464f]">
              Cán Bộ Tiếp Nhận Hồ Sơ
            </span>
          </div>
          <div className="w-8 h-8 rounded-full bg-[#0d1b4e] text-white flex items-center justify-center font-bold text-[13px] border border-[#fdb712]">
            A
          </div>
          <Link
            href="/admin/login"
            title="Đăng xuất"
            className="w-8 h-8 rounded flex items-center justify-center text-[#767680] hover:text-[#ba1a1a] hover:bg-[#ffdad6] transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">logout</span>
          </Link>
        </div>
      </div>
    </header>
  );
}

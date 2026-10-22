"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { logout } from "@/actions/auth.action";

interface AdminHeaderProps {
  onSearch?: (query: string) => void;
  userName?: string;
  email?: string;
  isSidebarOpen?: boolean;
  onToggleSidebar?: () => void;
}

export function AdminHeader({
  onSearch,
  userName = "Admin",
  email = "admin@utc.edu.vn",
  isSidebarOpen = true,
  onToggleSidebar,
}: AdminHeaderProps) {
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const initial = userName.charAt(0).toUpperCase();

  const handleLogout = async () => {
    await logout();
    router.push("/admin/login");
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="w-full h-16 bg-[#fff9ee]/90 backdrop-blur-md border-b border-[#e9e2d5] shadow-xs px-6 flex items-center justify-between gap-4">
      {/* Left Area: Toggle button if sidebar is hidden */}
      <div className="flex items-center gap-3">
        {!isSidebarOpen && onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-xl bg-[#faf3e6] hover:bg-[#fdb712]/20 hover:border-[#0d1b4e] text-[#0d1b4e] border border-[#c6c5d0] flex items-center justify-center transition-all shadow-xs"
            title="Hiện thanh Sidebar"
            aria-label="Hiện thanh Sidebar"
          >
            <span className="material-symbols-outlined text-[22px]">menu</span>
          </button>
        )}
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

        {/* Admin Profile Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="w-8 h-8 rounded-full bg-[#0d1b4e] text-white flex items-center justify-center font-bold text-[13px] border border-[#fdb712] hover:ring-2 hover:ring-[#fdb712] transition-all"
          >
            {initial}
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-[#e9e2d5] overflow-hidden flex flex-col z-50 animate-in fade-in zoom-in-95 duration-200">
              <div className="px-4 py-3 border-b border-[#e9e2d5] bg-[#faf3e6]">
                <p className="text-[13px] font-bold text-[#1e1b14] truncate">{userName}</p>
                <p className="text-[11px] text-[#767680] truncate">{email}</p>
              </div>
              <Link
                href="/admin/profile"
                className="w-full text-left px-4 py-2.5 text-[13px] font-medium text-[#1e1b14] hover:bg-[#fff9ee] transition-colors flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px]">person</span>
                Hồ sơ của tôi
              </Link>
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2.5 text-[13px] font-medium text-[#ba1a1a] hover:bg-[#ffdad6] transition-colors flex items-center gap-2 border-t border-[#e9e2d5]"
              >
                <span className="material-symbols-outlined text-[18px]">logout</span>
                Đăng xuất
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

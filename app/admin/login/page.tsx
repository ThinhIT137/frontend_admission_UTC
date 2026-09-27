"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("admin@utc.edu.vn");
  const [password, setPassword] = useState("123456");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    router.push("/admin");
  };

  return (
    <div className="min-h-screen bg-[#0d1b4e] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-[#1a2c6d]">
        {/* Header */}
        <div className="bg-[#081133] p-6 text-white text-center border-b border-[#1a2c6d]">
          <div className="w-16 h-16 rounded-full bg-[#fdb712] p-1 shadow-lg mx-auto mb-3 flex items-center justify-center">
            <span className="material-symbols-outlined text-[#0d1b4e] text-[36px]">
              admin_panel_settings
            </span>
          </div>
          <h2 className="font-display font-bold text-[22px] tracking-tight">
            ĐĂNG NHẬP QUẢN TRỊ UTC
          </h2>
          <p className="font-stamp text-[11px] text-[#fdb712] uppercase tracking-wider mt-1">
            Hệ Thống Tư Vấn Tuyển Sinh K66
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="p-6 space-y-4">
          <div>
            <label className="block text-[13px] font-bold text-[#1e1b14] mb-1 font-display">
              Tài khoản cán bộ / Email:
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#767680] text-[18px]">
                person
              </span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full pl-9 pr-4 py-2.5 bg-[#faf3e6] border border-[#c6c5d0] rounded-lg text-[13px] font-medium outline-none focus:ring-2 focus:ring-[#0d1b4e]"
              />
            </div>
          </div>

          <div>
            <label className="block text-[13px] font-bold text-[#1e1b14] mb-1 font-display">
              Mật khẩu:
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#767680] text-[18px]">
                lock
              </span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-9 pr-4 py-2.5 bg-[#faf3e6] border border-[#c6c5d0] rounded-lg text-[13px] font-medium outline-none focus:ring-2 focus:ring-[#0d1b4e]"
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-[12px]">
            <label className="flex items-center gap-1.5 text-[#45464f] font-medium">
              <input type="checkbox" defaultChecked className="rounded text-[#0d1b4e]" />
              Ghi nhớ đăng nhập
            </label>
            <a href="#" className="font-bold text-[#0d1b4e] hover:underline">
              Quên mật khẩu?
            </a>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-[#fdb712] hover:bg-[#e2a20a] text-[#0d1b4e] font-extrabold text-[15px] rounded-lg shadow-md transition-all uppercase tracking-wider"
          >
            Đăng Nhập Quản Trị
          </button>

          <div className="pt-2 text-center">
            <Link
              href="/"
              className="text-[12px] font-bold text-[#767680] hover:text-[#0d1b4e] flex items-center justify-center gap-1"
            >
              <span className="material-symbols-outlined text-[16px]">arrow_back</span>
              Quay về Trang chủ Thí sinh
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

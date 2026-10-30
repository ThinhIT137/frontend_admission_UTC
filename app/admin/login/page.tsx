"use client";
import { useAdminTask } from "@/hooks/useAdminTask";
import { publicError } from "@/libs/client-error";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { login } from "@/actions/auth.action";
import { toast } from "@/libs/admin-toast";
import { ArrowLeft, LoaderCircle, LockKeyhole, ShieldCheck, UserRound } from "lucide-react";

export default function AdminLoginPage() {
  const { run: runLogin } = useAdminTask();
  const router = useRouter();
  const [username, setUsername] = useState("admin123@gmail.com");
  const [password, setPassword] = useState("123456789");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await login({ email: username, password });
      toast.success("Đăng nhập thành công!");
      router.push("/admin");
    } catch (err: any) {
      const errorMsg = err.message || "Đăng nhập thất bại";
      setError(publicError(errorMsg));
      toast.error(publicError(errorMsg));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#192b59] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-[#243c78]">
        {/* Header */}
        <div className="bg-[#102044] p-6 text-white text-center border-b border-[#243c78]">
          <div className="w-16 h-16 rounded-full bg-[#fdb712] p-1 shadow-lg mx-auto mb-3 flex items-center justify-center">
            <ShieldCheck size={36} className="text-[#192b59]" aria-hidden="true" />
          </div>
          <h2 className="font-display font-bold text-[22px] tracking-tight">
            ĐĂNG NHẬP QUẢN TRỊ UTC
          </h2>
          <p className="font-stamp text-[11px] text-[#fdb712] uppercase tracking-wider mt-1">
            Hệ Thống Tư Vấn Tuyển Sinh K66
          </p>
        </div>

        {/* Form */}
        <form onSubmit={(event) => { event.preventDefault(); void runLogin(() => handleLogin(event)); }} className="p-6 space-y-4">
          <div>
            <label className="block text-[13px] font-bold text-[#1e293b] mb-1 font-display">
              Tài khoản cán bộ / Email:
            </label>
            <div className="relative">
              {/* SVG giữ kích thước ngay lần hiển thị đầu, không phụ thuộc font icon. */}
              <UserRound size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#64748b]" aria-hidden="true" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full pl-9 pr-4 py-2.5 bg-[#f8fafc] border border-[#cbd5e1] rounded-lg text-[13px] font-medium outline-none focus:ring-2 focus:ring-[#192b59]"
              />
            </div>
          </div>

          <div>
            <label className="block text-[13px] font-bold text-[#1e293b] mb-1 font-display">
              Mật khẩu:
            </label>
            <div className="relative">
              <LockKeyhole size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#64748b]" aria-hidden="true" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-9 pr-4 py-2.5 bg-[#f8fafc] border border-[#cbd5e1] rounded-lg text-[13px] font-medium outline-none focus:ring-2 focus:ring-[#192b59]"
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-[12px]">
            <label className="flex items-center gap-1.5 text-[#475569] font-medium">
              <input type="checkbox" defaultChecked className="rounded text-[#192b59]" />
              Ghi nhớ đăng nhập
            </label>
            <a href="#" className="font-bold text-[#192b59] hover:underline">
              Quên mật khẩu?
            </a>
          </div>

          {error && (
            <div className="text-red-500 text-[13px] font-bold text-center">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-[#fdb712] disabled:opacity-50 hover:bg-[#e2a20a] text-[#192b59] font-extrabold text-[15px] rounded-lg shadow-md transition-all uppercase tracking-wider flex justify-center items-center gap-2"
          >
            {isLoading ? (
              <>
                <LoaderCircle size={20} className="animate-spin" aria-hidden="true" />
                ĐANG ĐĂNG NHẬP...
              </>
            ) : (
              "Đăng Nhập Quản Trị"
            )}
          </button>

          <div className="pt-2 text-center">
            <Link
              href="/"
              className="text-[12px] font-bold text-[#64748b] hover:text-[#192b59] flex items-center justify-center gap-1"
            >
              <ArrowLeft size={16} aria-hidden="true" />
              Quay về Trang chủ Thí sinh
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

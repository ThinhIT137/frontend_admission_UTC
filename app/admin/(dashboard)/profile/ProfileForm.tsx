"use client";
import { AdminIcon } from "@/components/admin/AdminIcon";
import { useAdminTask } from "@/hooks/useAdminTask";
import { publicError } from "@/libs/client-error";

import { useState } from "react";
import { updateAdminAction } from "@/actions/admin_account.action";
import { toast } from "@/libs/admin-toast";
import { useRouter } from "next/navigation";

interface ProfileFormProps {
  ma_admin: string;
  initialName: string;
  initialEmail: string;
  vai_tro: string;
}

export function ProfileForm({ ma_admin, initialName, initialEmail, vai_tro }: ProfileFormProps) {
  const { pending: taskPending, run: runTask } = useAdminTask();
  const router = useRouter();
  
  const [ho_ten, setHoTen] = useState(initialName);
  const [email, setEmail] = useState(initialEmail);
  const [mat_khau, setMatKhau] = useState("");
  const [xac_nhan_mat_khau, setXacNhanMatKhau] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (mat_khau && mat_khau !== xac_nhan_mat_khau) {
      toast.error("Mật khẩu xác nhận không khớp!");
      return;
    }

    setIsLoading(true);
    
    try {
      await updateAdminAction(
        ma_admin,
        ho_ten !== initialName ? ho_ten : undefined,
        email !== initialEmail ? email : undefined,
        mat_khau ? mat_khau : undefined,
      );
      
      toast.success("Cập nhật thông tin thành công!");
      
      // Nếu đổi email hoặc mật khẩu, có thể cần refresh lại trang hoặc yêu cầu đăng nhập lại
      // Ở đây tạm thời ta chỉ reset trường mật khẩu
      setMatKhau("");
      setXacNhanMatKhau("");
      
      router.refresh(); // Gọi next/navigation router để lấy dữ liệu mới từ Server
    } catch (error: any) {
      toast.error(publicError(error.message || "Đã có lỗi xảy ra"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={(event) => { event.preventDefault(); void runTask(() => handleSubmit(event)); }} className="p-6 md:p-8 space-y-6">
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Vai Trò (Read-only) */}
        <div className="md:col-span-2">
          <label className="block text-[13px] font-bold text-[#1e293b] mb-2">
            Vai Trò
          </label>
          <div className="w-full px-4 py-2.5 bg-[#f1f5f9] border border-[#e2e8f0] rounded-lg text-[13px] font-medium text-[#64748b] cursor-not-allowed">
            {vai_tro === "super_admin" ? "Quản Trị Viên Cấp Cao (Super Admin)" : "Biên Tập Viên (Editor)"}
          </div>
        </div>

        {/* Họ tên */}
        <div>
          <label className="block text-[13px] font-bold text-[#1e293b] mb-2">
            Họ Tên <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            value={ho_ten}
            onChange={(e) => setHoTen(e.target.value)}
            className="w-full px-4 py-2.5 bg-white border border-[#cbd5e1] rounded-lg text-[13px] font-medium text-[#1e293b] outline-none focus:ring-2 focus:ring-[#192b59] focus:border-transparent transition-all"
            placeholder="Nhập họ và tên..."
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-[13px] font-bold text-[#1e293b] mb-2">
            Email <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2.5 bg-white border border-[#cbd5e1] rounded-lg text-[13px] font-medium text-[#1e293b] outline-none focus:ring-2 focus:ring-[#192b59] focus:border-transparent transition-all"
            placeholder="Nhập địa chỉ email..."
          />
        </div>
      </div>

      <hr className="border-[#e2e8f0]" />

      <div>
        <h3 className="text-[14px] font-bold text-[#192b59] mb-4">Đổi Mật Khẩu (Tùy chọn)</h3>
        <p className="text-[12px] text-[#64748b] mb-4">
          Nếu không muốn đổi mật khẩu, vui lòng để trống 2 ô bên dưới.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Mật khẩu mới */}
          <div>
            <label className="block text-[13px] font-bold text-[#1e293b] mb-2">
              Mật khẩu mới
            </label>
            <input
              type="password"
              value={mat_khau}
              onChange={(e) => setMatKhau(e.target.value)}
              className="w-full px-4 py-2.5 bg-white border border-[#cbd5e1] rounded-lg text-[13px] font-medium text-[#1e293b] outline-none focus:ring-2 focus:ring-[#192b59] focus:border-transparent transition-all"
              placeholder="Nhập mật khẩu mới..."
            />
          </div>

          {/* Xác nhận mật khẩu mới */}
          <div>
            <label className="block text-[13px] font-bold text-[#1e293b] mb-2">
              Xác nhận mật khẩu
            </label>
            <input
              type="password"
              value={xac_nhan_mat_khau}
              onChange={(e) => setXacNhanMatKhau(e.target.value)}
              className="w-full px-4 py-2.5 bg-white border border-[#cbd5e1] rounded-lg text-[13px] font-medium text-[#1e293b] outline-none focus:ring-2 focus:ring-[#192b59] focus:border-transparent transition-all"
              placeholder="Nhập lại mật khẩu..."
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <button
          type="submit"
          disabled={isLoading || taskPending}
          className="px-6 py-2.5 bg-[#fdb712] hover:bg-[#e2a20a] text-[#192b59] font-extrabold text-[13px] rounded-lg shadow-sm transition-all flex items-center gap-2 disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <AdminIcon name="progress_activity" className="animate-spin text-[18px]" />
              ĐANG LƯU...
            </>
          ) : (
            <>
              <AdminIcon name="save" className="text-[18px]" />
              LƯU THAY ĐỔI
            </>
          )}
        </button>
      </div>
    </form>
  );
}

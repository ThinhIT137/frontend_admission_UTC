"use client";

import { useState, useEffect } from "react";
import { VaiTroAdmin } from "@/constants/role";
import { createAdminAction, updateAdminAction } from "@/actions/admin_account.action";
import { toast } from "sonner";

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  account: any | null; // Có thể trích xuất type cụ thể nếu cần
  roles: any[];
}

export function AccountModal({ isOpen, onClose, account, roles }: AccountModalProps) {
  const isEditing = !!account;

  const [ho_ten, setHoTen] = useState("");
  const [email, setEmail] = useState("");
  const [mat_khau, setMatKhau] = useState("");
  const [xac_nhan_mat_khau, setXacNhanMatKhau] = useState("");
  const [ma_vai_tro, setMaVaiTro] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (account) {
      setHoTen(account.ho_ten);
      setEmail(account.email);
      setMaVaiTro(account.vai_tro?.ma_vai_tro || "");
      setMatKhau("");
      setXacNhanMatKhau("");
    } else {
      setHoTen("");
      setEmail("");
      setMaVaiTro(roles.length > 0 ? roles[0].ma_vai_tro : "");
      setMatKhau("");
      setXacNhanMatKhau("");
    }
  }, [account]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isEditing && !mat_khau) {
      toast.error("Vui lòng nhập mật khẩu cho tài khoản mới!");
      return;
    }

    if (mat_khau && mat_khau !== xac_nhan_mat_khau) {
      toast.error("Mật khẩu xác nhận không khớp!");
      return;
    }

    setIsLoading(true);

    try {
      if (isEditing) {
        await updateAdminAction(
          account.ma_admin,
          ho_ten !== account.ho_ten ? ho_ten : undefined,
          email !== account.email ? email : undefined,
          mat_khau ? mat_khau : undefined,
          ma_vai_tro !== account.vai_tro?.ma_vai_tro ? ma_vai_tro : undefined
        );
        toast.success("Cập nhật tài khoản thành công!");
      } else {
        await createAdminAction(ho_ten, email, mat_khau, ma_vai_tro);
        toast.success("Tạo tài khoản thành công!");
      }
      onClose();
    } catch (error: any) {
      toast.error(error.message || "Đã có lỗi xảy ra");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#1e1b14]/50 backdrop-blur-sm p-4">
      <div 
        className="bg-[#fff9ee] w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border border-[#e9e2d5] animate-in fade-in zoom-in-95 duration-200"
      >
        <div className="px-6 py-4 border-b border-[#e9e2d5] flex justify-between items-center bg-white">
          <h2 className="text-[16px] font-bold text-[#0d1b4e] font-display">
            {isEditing ? "Cập Nhật Tài Khoản" : "Thêm Tài Khoản Mới"}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#f4ede0] text-[#767680] transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="space-y-4">
            <div>
              <label className="block text-[13px] font-bold text-[#1e1b14] mb-1.5">
                Họ Tên <span className="text-[#ba1a1a]">*</span>
              </label>
              <input
                type="text"
                required
                value={ho_ten}
                onChange={(e) => setHoTen(e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-[#c6c5d0] rounded-lg text-[13px] outline-none focus:ring-2 focus:ring-[#0d1b4e]"
                placeholder="Nhập họ và tên..."
              />
            </div>

            <div>
              <label className="block text-[13px] font-bold text-[#1e1b14] mb-1.5">
                Email <span className="text-[#ba1a1a]">*</span>
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-[#c6c5d0] rounded-lg text-[13px] outline-none focus:ring-2 focus:ring-[#0d1b4e]"
                placeholder="Nhập email..."
              />
            </div>

            <div>
              <label className="block text-[13px] font-bold text-[#1e1b14] mb-1.5">
                Vai Trò <span className="text-[#ba1a1a]">*</span>
              </label>
              <select
                required
                value={ma_vai_tro}
                onChange={(e) => setMaVaiTro(e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-[#c6c5d0] rounded-lg text-[13px] outline-none focus:ring-2 focus:ring-[#0d1b4e]"
              >
                {roles.map(r => (
                  <option key={r.ma_vai_tro} value={r.ma_vai_tro}>
                    {r.ten_vai_tro === VaiTroAdmin.super_admin ? "Quản Trị Viên (Super Admin)" : r.ten_vai_tro}
                  </option>
                ))}
              </select>
            </div>

            <div className="pt-2 border-t border-[#e9e2d5]">
              <h3 className="text-[13px] font-bold text-[#0d1b4e] mb-3">
                {isEditing ? "Đổi Mật Khẩu (Để trống nếu không đổi)" : "Mật Khẩu Mới"}
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-[13px] font-bold text-[#1e1b14] mb-1.5">
                    Mật khẩu {!isEditing && <span className="text-[#ba1a1a]">*</span>}
                  </label>
                  <input
                    type="password"
                    value={mat_khau}
                    onChange={(e) => setMatKhau(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-[#c6c5d0] rounded-lg text-[13px] outline-none focus:ring-2 focus:ring-[#0d1b4e]"
                    placeholder="Nhập mật khẩu..."
                  />
                </div>

                <div>
                  <label className="block text-[13px] font-bold text-[#1e1b14] mb-1.5">
                    Xác nhận mật khẩu
                  </label>
                  <input
                    type="password"
                    value={xac_nhan_mat_khau}
                    onChange={(e) => setXacNhanMatKhau(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-[#c6c5d0] rounded-lg text-[13px] outline-none focus:ring-2 focus:ring-[#0d1b4e]"
                    placeholder="Nhập lại mật khẩu..."
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-[#e9e2d5]">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-5 py-2.5 bg-[#f4ede0] hover:bg-[#e9e2d5] text-[#1e1b14] font-bold text-[13px] rounded-lg transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2.5 bg-[#fdb712] hover:bg-[#e2a20a] text-[#0d1b4e] font-extrabold text-[13px] rounded-lg shadow-sm transition-all flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
                  Đang lưu...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px]">save</span>
                  Lưu
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { createRoleAction, updateRoleAction } from "@/actions/role.action";
import { toast } from "sonner";

interface RoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  role: any | null; 
}

export function RoleModal({ isOpen, onClose, role }: RoleModalProps) {
  const isEditing = !!role;

  const [ten_vai_tro, setTenVaiTro] = useState("");
  const [mo_ta, setMoTa] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (role) {
      setTenVaiTro(role.ten_vai_tro);
      setMoTa(role.mo_ta || "");
    } else {
      setTenVaiTro("");
      setMoTa("");
    }
  }, [role]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsLoading(true);

    try {
      if (isEditing) {
        await updateRoleAction(
          role.ma_vai_tro,
          ten_vai_tro !== role.ten_vai_tro ? ten_vai_tro : undefined,
          mo_ta !== role.mo_ta ? mo_ta : undefined
        );
        toast.success("Cập nhật vai trò thành công!");
      } else {
        await createRoleAction(ten_vai_tro, mo_ta);
        toast.success("Tạo vai trò thành công!");
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
            {isEditing ? "Cập Nhật Vai Trò" : "Thêm Vai Trò Mới"}
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
                Tên Vai Trò <span className="text-[#ba1a1a]">*</span>
              </label>
              <input
                type="text"
                required
                value={ten_vai_tro}
                onChange={(e) => setTenVaiTro(e.target.value)}
                disabled={isEditing && (role?.ten_vai_tro === "super_admin" || role?.ten_vai_tro === "chuyen_vien")}
                className="w-full px-4 py-2.5 bg-white border border-[#c6c5d0] rounded-lg text-[13px] outline-none focus:ring-2 focus:ring-[#0d1b4e] disabled:bg-[#f4ede0] disabled:text-[#767680] disabled:cursor-not-allowed"
                placeholder="Nhập tên vai trò (VD: manager, author...)"
              />
              {isEditing && (role?.ten_vai_tro === "super_admin" || role?.ten_vai_tro === "chuyen_vien") && (
                  <p className="text-xs text-[#ba1a1a] mt-1">Vai trò hệ thống không được đổi tên</p>
              )}
            </div>

            <div>
              <label className="block text-[13px] font-bold text-[#1e1b14] mb-1.5">
                Mô Tả
              </label>
              <textarea
                value={mo_ta}
                onChange={(e) => setMoTa(e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-[#c6c5d0] rounded-lg text-[13px] outline-none focus:ring-2 focus:ring-[#0d1b4e] min-h-[100px] resize-none"
                placeholder="Nhập mô tả về quyền hạn của vai trò này..."
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-[#e9e2d5]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-[13px] font-bold text-[#45464f] hover:bg-[#f4ede0] rounded-lg transition-colors"
            >
              HỦY BỎ
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2 bg-[#fdb712] hover:bg-[#e2a20a] text-[#0d1b4e] font-extrabold text-[13px] rounded-lg shadow-sm transition-all flex items-center justify-center min-w-[120px] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-t-transparent border-[#0d1b4e] rounded-full animate-spin" />
              ) : (
                "LƯU THAY ĐỔI"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

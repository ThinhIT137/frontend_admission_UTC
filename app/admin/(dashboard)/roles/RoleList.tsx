"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { deleteRoleAction } from "@/actions/role.action";
import { toast } from "sonner";
import { RoleModal } from "./RoleModal";

interface Role {
  ma_vai_tro: string;
  ten_vai_tro: string;
  mo_ta: string | null;
}

interface RoleListProps {
  initialData: Role[];
  totalPages: number;
  currentPage: number;
}

export function RoleList({ initialData, totalPages, currentPage }: RoleListProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);

  const updateFilters = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value) params.set(key, value);
    else params.delete(key);
    params.set("page", "1");
    router.push(`?${params.toString()}`);
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", newPage.toString());
    router.push(`?${params.toString()}`);
  };

  const handleDelete = async (role: Role) => {
    if (role.ten_vai_tro === "super_admin" || role.ten_vai_tro === "chuyen_vien") {
        toast.error("Không thể xóa vai trò mặc định của hệ thống");
        return;
    }
    if (window.confirm(`Bạn có chắc chắn muốn xóa vai trò "${role.ten_vai_tro}" không?`)) {
      try {
        await deleteRoleAction(role.ma_vai_tro);
        toast.success("Xóa vai trò thành công!");
      } catch (error: any) {
        toast.error(error.message || "Xóa thất bại");
      }
    }
  };

  const handleOpenModal = (role?: Role) => {
    setSelectedRole(role || null);
    setIsModalOpen(true);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-[#e9e2d5] overflow-hidden">
      {/* Toolbar */}
      <div className="p-4 border-b border-[#e9e2d5] flex flex-col sm:flex-row gap-4 justify-between items-center bg-[#faf3e6]">
        <div className="flex gap-4 w-full sm:w-auto flex-1">
          {/* Search */}
          <div className="relative w-full sm:max-w-xs">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#767680] text-[18px]">
              search
            </span>
            <input
              type="text"
              placeholder="Tìm tên vai trò..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && updateFilters("search", search)}
              className="w-full pl-9 pr-4 py-2 rounded-lg bg-white border border-[#c6c5d0] text-[13px] outline-none focus:ring-2 focus:ring-[#0d1b4e]"
            />
          </div>
        </div>

        <button
          onClick={() => handleOpenModal()}
          className="w-full sm:w-auto px-4 py-2 bg-[#fdb712] hover:bg-[#e2a20a] text-[#0d1b4e] font-extrabold text-[13px] rounded-lg shadow-sm transition-all flex items-center justify-center gap-2"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          THÊM VAI TRÒ
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#f4ede0] border-b border-[#e9e2d5]">
              <th className="px-6 py-4 text-[11px] font-bold text-[#45464f] uppercase tracking-wider">Tên Vai Trò</th>
              <th className="px-6 py-4 text-[11px] font-bold text-[#45464f] uppercase tracking-wider">Mô Tả</th>
              <th className="px-6 py-4 text-[11px] font-bold text-[#45464f] uppercase tracking-wider text-right">Thao Tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#e9e2d5]">
            {initialData.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-6 py-8 text-center text-[13px] text-[#767680]">
                  Không tìm thấy vai trò nào!
                </td>
              </tr>
            ) : (
              initialData.map((role) => (
                <tr key={role.ma_vai_tro} className="hover:bg-[#faf3e6]/50 transition-colors">
                  <td className="px-6 py-4">
                    <span className="text-[13px] font-bold text-[#1e1b14]">
                      {role.ten_vai_tro}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-[13px] text-[#45464f]">
                    {role.mo_ta || "Không có mô tả"}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleOpenModal(role)}
                        className="w-8 h-8 rounded flex items-center justify-center text-[#0d1b4e] hover:bg-[#0d1b4e]/10 transition-colors"
                        title="Chỉnh sửa"
                      >
                        <span className="material-symbols-outlined text-[18px]">edit</span>
                      </button>
                      <button
                        onClick={() => handleDelete(role)}
                        className={`w-8 h-8 rounded flex items-center justify-center transition-colors ${
                          role.ten_vai_tro === "super_admin" || role.ten_vai_tro === "chuyen_vien"
                          ? 'text-gray-300 cursor-not-allowed'
                          : 'text-[#ba1a1a] hover:bg-[#ba1a1a]/10'
                        }`}
                        title="Xóa"
                      >
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-6 py-4 border-t border-[#e9e2d5] flex items-center justify-between bg-white">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="w-8 h-8 rounded-lg border border-[#c6c5d0] flex items-center justify-center text-[#45464f] hover:bg-[#faf3e6] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">chevron_left</span>
          </button>
          
          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }).map((_, i) => {
              const page = i + 1;
              return (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`w-8 h-8 rounded-lg text-[13px] font-bold transition-colors ${
                    currentPage === page
                      ? "bg-[#0d1b4e] text-white"
                      : "text-[#45464f] hover:bg-[#faf3e6]"
                  }`}
                >
                  {page}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="w-8 h-8 rounded-lg border border-[#c6c5d0] flex items-center justify-center text-[#45464f] hover:bg-[#faf3e6] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">chevron_right</span>
          </button>
        </div>
      )}

      {isModalOpen && (
        <RoleModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          role={selectedRole}
        />
      )}
    </div>
  );
}

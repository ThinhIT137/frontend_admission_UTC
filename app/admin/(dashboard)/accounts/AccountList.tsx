"use client";

import { deleteAdminAction } from "@/actions/admin_account.action";
import { VaiTroAdmin } from "@/constants/role";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AccountModal } from "./AccountModal";

interface AdminAccount {
  ma_admin: string;
  ho_ten: string;
  email: string;
  vai_tro: {
    ma_vai_tro: string;
    ten_vai_tro: string;
    mo_ta: string | null;
  };
  create_at: Date;
}

interface AccountListProps {
  initialData: AdminAccount[];
  currentUserId: string;
  totalPages: number;
  currentPage: number;
  roles: any[];
}

export function AccountList({ initialData, currentUserId, totalPages, currentPage, roles }: AccountListProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [roleFilter, setRoleFilter] = useState(searchParams.get("role") || "");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<AdminAccount | null>(null);

  // Sync state to URL for search & filter
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (search) params.set("search", search);
      else params.delete("search");

      if (roleFilter) params.set("role", roleFilter);
      else params.delete("role");

      // Reset về trang 1 nếu search hoặc filter thay đổi
      params.delete("page");

      router.push(`?${params.toString()}`);
    }, 500); // Debounce 500ms

    return () => clearTimeout(delayDebounceFn);
  }, [search, roleFilter, router]);

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", newPage.toString());
    router.push(`?${params.toString()}`);
  };

  const handleDelete = async (ma_admin: string, ho_ten: string) => {
    if (confirm(`Bạn có chắc chắn muốn xóa tài khoản "${ho_ten}" không?`)) {
      try {
        await deleteAdminAction(ma_admin);
        toast.success("Xóa tài khoản thành công!");
      } catch (error: any) {
        toast.error(error.message || "Xóa thất bại");
      }
    }
  };

  const handleOpenModal = (account?: AdminAccount) => {
    setSelectedAccount(account || null);
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
              placeholder="Tìm tên, email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-lg bg-white border border-[#c6c5d0] text-[13px] outline-none focus:ring-2 focus:ring-[#0d1b4e]"
            />
          </div>

          {/* Filter */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-4 py-2 rounded-lg bg-white border border-[#c6c5d0] text-[13px] outline-none focus:ring-2 focus:ring-[#0d1b4e]"
          >
            <option value="">Tất cả vai trò</option>
            {roles.map((r) => (
                <option key={r.ma_vai_tro} value={r.ten_vai_tro}>{r.ten_vai_tro === VaiTroAdmin.super_admin ? "Super Admin" : r.ten_vai_tro}</option>
            ))}
          </select>
        </div>

        <button
          onClick={() => handleOpenModal()}
          className="w-full sm:w-auto px-4 py-2 bg-[#fdb712] hover:bg-[#e2a20a] text-[#0d1b4e] font-extrabold text-[13px] rounded-lg shadow-sm transition-all flex items-center justify-center gap-2"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          THÊM TÀI KHOẢN
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#f4ede0] border-b border-[#e9e2d5]">
              <th className="px-6 py-4 text-[11px] font-bold text-[#45464f] uppercase tracking-wider">Họ Tên</th>
              <th className="px-6 py-4 text-[11px] font-bold text-[#45464f] uppercase tracking-wider">Email</th>
              <th className="px-6 py-4 text-[11px] font-bold text-[#45464f] uppercase tracking-wider">Vai Trò</th>
              <th className="px-6 py-4 text-[11px] font-bold text-[#45464f] uppercase tracking-wider">Ngày Tạo</th>
              <th className="px-6 py-4 text-[11px] font-bold text-[#45464f] uppercase tracking-wider text-right">Thao Tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#e9e2d5]">
            {initialData.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-[13px] text-[#767680]">
                  Không tìm thấy tài khoản nào!
                </td>
              </tr>
            ) : (
              initialData.map((account) => (
                <tr key={account.ma_admin} className="hover:bg-[#faf3e6]/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#0d1b4e] text-white flex items-center justify-center font-bold text-[13px]">
                        {account.ho_ten.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-[13px] font-bold text-[#1e1b14]">
                        {account.ho_ten}
                        {account.ma_admin === currentUserId && (
                          <span className="ml-2 inline-block px-2 py-0.5 bg-[#fdb712]/20 text-[#0d1b4e] text-[10px] rounded-full">
                            Bạn
                          </span>
                        )}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-[13px] text-[#45464f]">
                    {account.email}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${account.vai_tro?.ten_vai_tro === VaiTroAdmin.super_admin
                          ? "bg-[#ffdad6] text-[#ba1a1a]"
                          : "bg-[#e8def8] text-[#4a4458]"
                        }`}
                    >
                      {account.vai_tro?.ten_vai_tro === VaiTroAdmin.super_admin ? "Super Admin" : account.vai_tro?.ten_vai_tro || "Chưa có"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-[13px] text-[#767680]">
                    {new Date(account.create_at).toLocaleDateString("vi-VN")}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleOpenModal(account)}
                        className="w-8 h-8 rounded flex items-center justify-center text-[#0d1b4e] hover:bg-[#0d1b4e]/10 transition-colors"
                        title="Chỉnh sửa"
                      >
                        <span className="material-symbols-outlined text-[18px]">edit</span>
                      </button>

                      {account.ma_admin !== currentUserId && (
                        <button
                          onClick={() => handleDelete(account.ma_admin, account.ho_ten)}
                          className="w-8 h-8 rounded flex items-center justify-center text-[#ba1a1a] hover:bg-[#ffdad6] transition-colors"
                          title="Xóa"
                        >
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                      )}
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
        <div className="p-4 border-t border-[#e9e2d5] bg-white flex justify-center items-center gap-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="w-8 h-8 rounded-lg border border-[#c6c5d0] flex items-center justify-center text-[#45464f] hover:bg-[#faf3e6] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">chevron_left</span>
          </button>

          <div className="flex gap-1">
            {Array.from({ length: totalPages }).map((_, idx) => {
              const page = idx + 1;
              const isActive = page === currentPage;

              // Simple pagination logic for large number of pages
              if (
                totalPages > 7 &&
                page !== 1 &&
                page !== totalPages &&
                Math.abs(page - currentPage) > 1
              ) {
                if (page === 2 || page === totalPages - 1) {
                  return <span key={page} className="px-2 py-1 text-[#767680]">...</span>;
                }
                return null;
              }

              return (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`w-8 h-8 rounded-lg text-[13px] font-bold transition-all ${isActive
                      ? "bg-[#0d1b4e] text-white shadow-sm border border-[#0d1b4e]"
                      : "border border-[#c6c5d0] text-[#45464f] hover:bg-[#faf3e6]"
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
        <AccountModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          account={selectedAccount as any}
          roles={roles}
        />
      )}
    </div>
  );
}

"use client";
import { AdminIcon } from "@/components/admin/AdminIcon";
import { useAdminTask } from "@/hooks/useAdminTask";
import { publicError } from "@/libs/client-error";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { deleteRoleAction } from "@/actions/role.action";
import { toast } from "@/libs/admin-toast";
import { RoleModal, PERMISSION_GROUPS } from "./RoleModal";

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
  const { pending: taskPending, run: runTask } = useAdminTask();
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
        toast.error(publicError(error.message || "Xóa thất bại"));
      }
    }
  };

  const handleOpenModal = (role?: Role) => {
    setSelectedRole(role || null);
    setIsModalOpen(true);
  };

  const parseRoleInfo = (moTa: string | null, roleName: string) => {
    if (!moTa) {
      if (roleName === "super_admin") {
        return { permsCount: 10, desc: "Toàn quyền quản trị hệ thống và tất cả phân hệ", isSuper: true };
      }
      return { permsCount: 0, desc: "Chưa cấu hình mô tả", isSuper: false };
    }

    if (moTa.startsWith("PERMS:")) {
      const parts = moTa.split(" | ");
      const permsStr = parts[0].replace("PERMS:", "");
      const permsList = permsStr ? permsStr.split(",").filter(Boolean) : [];
      return {
        permsCount: permsList.length,
        desc: parts.slice(1).join(" | ") || "Đã phân quyền chức năng",
        isSuper: roleName === "super_admin" || permsList.length >= 10,
        permsList,
      };
    }

    return {
      permsCount: roleName === "super_admin" ? 10 : 3,
      desc: moTa,
      isSuper: roleName === "super_admin",
    };
  };

  const totalAllPerms = PERMISSION_GROUPS.reduce((acc, g) => acc + g.permissions.length, 0);

  return (
    <div className="space-y-6 pt-2">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-black text-[28px] text-[#192b59] tracking-tight">
            Quản Lý & Phân Quyền Vai Trò
          </h1>
          <p className="text-[14px] text-[#475569] mt-0.5">
            Cấu hình ma trận phân quyền truy cập theo từng phân hệ cho các nhóm cán bộ tuyển sinh UTC.
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-[#fdb712] hover:bg-[#e2a20a] text-[#192b59] px-5 py-2.5 rounded-xl font-black text-[14px] shadow-sm transition-all hover:scale-[1.02] active:scale-95 whitespace-nowrap"
        >
          <AdminIcon name="add_moderator" className="text-[20px]" />
          Thêm Vai Trò Mới
        </button>
      </div>

      {/* Main Container */}
      <div className="bg-white rounded-2xl shadow-sm border border-[#e2e8f0] overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-[#e2e8f0] flex flex-col sm:flex-row gap-4 justify-between items-center bg-[#f8fafc]">
          <div className="relative w-full sm:max-w-md">
            <AdminIcon name="search" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#64748b] text-[20px]" />
            <input
              type="text"
              placeholder="Tìm theo tên vai trò hoặc nhóm quyền..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && updateFilters("search", search)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-[#cbd5e1] rounded-xl text-[13px] font-medium outline-none focus:border-[#192b59] focus:ring-1 focus:ring-[#192b59]"
            />
          </div>

          <div className="flex items-center gap-2 text-[12px] font-semibold text-[#475569]">
            <AdminIcon name="info" className="text-[18px] text-[#fdb712]" />
            Tổng cộng {initialData.length} nhóm vai trò trong hệ thống
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#f1f5f9] border-b border-[#e2e8f0]">
                <th className="px-6 py-3.5 text-[12px] font-black text-[#192b59] uppercase tracking-wider">
                  Tên Vai Trò
                </th>
                <th className="px-6 py-3.5 text-[12px] font-black text-[#192b59] uppercase tracking-wider">
                  Quyền Hạn Được Cấp
                </th>
                <th className="px-6 py-3.5 text-[12px] font-black text-[#192b59] uppercase tracking-wider">
                  Mô Tả Nhiệm Vụ
                </th>
                <th className="px-6 py-3.5 text-[12px] font-black text-[#192b59] uppercase tracking-wider text-right">
                  Thao Tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e2e8f0]">
              {initialData.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-[14px] text-[#64748b]">
                    Không tìm thấy vai trò nào phù hợp!
                  </td>
                </tr>
              ) : (
                initialData.map((role) => {
                  const info = parseRoleInfo(role.mo_ta, role.ten_vai_tro);
                  const isSys = role.ten_vai_tro === "super_admin" || role.ten_vai_tro === "chuyen_vien";

                  return (
                    <tr key={role.ma_vai_tro} className="hover:bg-[#f8fafc]/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold ${
                            info.isSuper ? "bg-[#192b59] text-[#fdb712]" : "bg-[#f8fafc] text-[#192b59] border border-[#cbd5e1]"
                          }`}>
                            <span className="material-symbols-outlined text-[18px]">
                              {info.isSuper ? "local_police" : "shield"}
                            </span>
                          </div>
                          <div>
                            <span className="text-[14px] font-bold text-[#1e293b] block">
                              {role.ten_vai_tro}
                            </span>
                            {isSys && (
                              <span className="text-[10px] font-extrabold uppercase text-[#ba1a1a] tracking-wider">
                                Hệ Thống Mặc Định
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2.5 py-1 rounded-md text-[11px] font-black border ${
                              info.permsCount >= totalAllPerms
                                ? "bg-[#86efac]/30 text-[#14532d] border-[#86efac]"
                                : info.permsCount > 0
                                ? "bg-[#ffdea8]/50 text-[#7c5800] border-[#ffdea8]"
                                : "bg-gray-100 text-gray-600 border-gray-200"
                            }`}
                          >
                            {info.permsCount >= totalAllPerms
                              ? `Toàn Quyền (${info.permsCount}/${totalAllPerms})`
                              : `${info.permsCount}/${totalAllPerms} Quyền Hệ Thống`}
                          </span>
                        </div>
                      </td>

                      <td className="px-6 py-4 text-[13px] text-[#475569] max-w-md">
                        {info.desc}
                      </td>

                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenModal(role)}
                            className="px-3 py-1.5 bg-[#f8fafc] hover:bg-[#192b59] hover:text-white text-[#192b59] border border-[#cbd5e1] rounded-lg text-[12px] font-bold transition-all flex items-center gap-1"
                            title="Chỉnh sửa & Cấp quyền"
                          >
                            <AdminIcon name="tune" className="text-[16px]" />
                            Phân quyền
                          </button>
                          <button
                            onClick={() => void runTask(() => handleDelete(role))}
                            disabled={isSys || taskPending}
                            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                              isSys
                                ? "text-gray-300 cursor-not-allowed"
                                : "text-[#ba1a1a] hover:bg-red-50 border border-transparent hover:border-red-200"
                            }`}
                            title={isSys ? "Không thể xóa vai trò mặc định" : "Xóa vai trò"}
                          >
                            <AdminIcon name="delete" className="text-[18px]" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-[#e2e8f0] flex items-center justify-between bg-white">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="w-8 h-8 rounded-lg border border-[#cbd5e1] flex items-center justify-center text-[#475569] hover:bg-[#f8fafc] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <AdminIcon name="chevron_left" className="text-[18px]" />
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
                        ? "bg-[#192b59] text-white"
                        : "text-[#475569] hover:bg-[#f8fafc]"
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
              className="w-8 h-8 rounded-lg border border-[#cbd5e1] flex items-center justify-center text-[#475569] hover:bg-[#f8fafc] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <AdminIcon name="chevron_right" className="text-[18px]" />
            </button>
          </div>
        )}
      </div>

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

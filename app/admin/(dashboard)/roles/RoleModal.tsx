"use client";

import { useState, useEffect } from "react";
import { createRoleAction, updateRoleAction } from "@/actions/role.action";
import { toast } from "sonner";

export interface PermissionGroup {
  id: string;
  title: string;
  icon: string;
  description: string;
  permissions: {
    id: string;
    label: string;
    description: string;
  }[];
}

export const PERMISSION_GROUPS: PermissionGroup[] = [
  {
    id: "training",
    title: "1. Đào Tạo & Khoa Viện",
    icon: "account_balance",
    description: "Quản lý cơ cấu các Khoa/Viện, Ngành học và Tổ hợp môn xét tuyển",
    permissions: [
      { id: "FACULTY_MANAGE", label: "Quản lý Khối ngành & Khoa/Viện", description: "Thêm, sửa, xem danh sách khối ngành, khoa quản lý" },
      { id: "MAJOR_MANAGE", label: "Quản lý Ngành đào tạo", description: "Thêm/sửa mã ngành, tên ngành, khối kiến thức" },
      { id: "COMBINATION_MANAGE", label: "Quản lý Tổ hợp xét tuyển", description: "Cấu hình các tổ hợp môn (A00, A01, D01...)" },
    ],
  },
  {
    id: "admission",
    title: "2. Tuyển Sinh & Chỉ Tiêu",
    icon: "assignment",
    description: "Quản lý phương thức, chỉ tiêu và lộ trình tuyển sinh",
    permissions: [
      { id: "METHOD_MANAGE", label: "Quản lý Phương thức xét tuyển", description: "Cấu hình PT100, PT200, PT402, Xét học bạ, ĐGNL..." },
      { id: "QUOTA_MANAGE", label: "Thiết lập Chỉ tiêu tuyển sinh", description: "Nhập chỉ tiêu đầu mùa theo từng ngành và cơ sở" },
      { id: "TIMELINE_MANAGE", label: "Quản lý Mốc thời gian lộ trình", description: "Cập nhật các đợt đăng ký, nộp hồ sơ, nhập học" },
    ],
  },
  {
    id: "content_ai",
    title: "3. Truyền Thông & Trợ Lý AI",
    icon: "neurology",
    description: "Nội dung đề án tuyển sinh và dữ liệu Chatbot AI",
    permissions: [
      { id: "ARTICLE_MANAGE", label: "Quản lý Đề án & Tin tức", description: "Đăng tải đề án PDF, quy chế, bài viết hướng dẫn" },
      { id: "AI_CHAT_MANAGE", label: "Quản lý Trợ lý AI Tuyển sinh", description: "Huấn luyện dữ liệu tra cứu và cấu hình Chatbot" },
    ],
  },
  {
    id: "system",
    title: "4. Quản Trị Hệ Thống & Bảo Mật",
    icon: "admin_panel_settings",
    description: "Phân quyền vai trò và quản trị tài khoản cán bộ",
    permissions: [
      { id: "USER_MANAGE", label: "Quản lý Tài khoản Cán bộ", description: "Tạo tài khoản và gán vai trò cho chuyên viên" },
      { id: "ROLE_MANAGE", label: "Quản lý & Phân quyền Vai trò", description: "Cấu hình ma trận quyền hạn cho các nhóm người dùng" },
    ],
  },
];

const ROLE_PRESETS = [
  {
    name: "Quản Trị Viên Toàn Quyền",
    desc: "Toàn quyền quản trị tất cả các phân hệ tuyển sinh và hệ thống",
    perms: PERMISSION_GROUPS.flatMap((g) => g.permissions.map((p) => p.id)),
  },
  {
    name: "Chuyên Viên Tuyển Sinh",
    desc: "Quản lý phương thức xét tuyển, chỉ tiêu, tổ hợp môn và lộ trình",
    perms: ["METHOD_MANAGE", "QUOTA_MANAGE", "TIMELINE_MANAGE", "COMBINATION_MANAGE", "MAJOR_MANAGE"],
  },
  {
    name: "Cán Bộ Quản Lý Đào Tạo",
    desc: "Quản lý cơ cấu khoa viện, ngành học và tổ hợp môn",
    perms: ["FACULTY_MANAGE", "MAJOR_MANAGE", "COMBINATION_MANAGE"],
  },
  {
    name: "Ban Truyền Thông & Đề Án",
    desc: "Đăng tải và cập nhật các đề án tuyển sinh PDF, quy chế và tin tức",
    perms: ["ARTICLE_MANAGE"],
  },
];

interface RoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  role: any | null;
}

export function RoleModal({ isOpen, onClose, role }: RoleModalProps) {
  const isEditing = !!role;

  const [ten_vai_tro, setTenVaiTro] = useState("");
  const [descriptionText, setDescriptionText] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (role) {
      setTenVaiTro(role.ten_vai_tro);
      const rawMoTa = role.mo_ta || "";
      if (rawMoTa.startsWith("PERMS:")) {
        const parts = rawMoTa.split(" | ");
        const permsStr = parts[0].replace("PERMS:", "");
        setSelectedPermissions(permsStr ? permsStr.split(",") : []);
        setDescriptionText(parts.slice(1).join(" | "));
      } else {
        setDescriptionText(rawMoTa);
        // If super_admin, grant all by default
        if (role.ten_vai_tro === "super_admin") {
          setSelectedPermissions(PERMISSION_GROUPS.flatMap((g) => g.permissions.map((p) => p.id)));
        } else {
          setSelectedPermissions(["MAJOR_MANAGE", "TIMELINE_MANAGE", "ARTICLE_MANAGE"]);
        }
      }
    } else {
      setTenVaiTro("");
      setDescriptionText("");
      setSelectedPermissions(["METHOD_MANAGE", "QUOTA_MANAGE", "TIMELINE_MANAGE"]);
    }
  }, [role]);

  const togglePermission = (permId: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(permId) ? prev.filter((p) => p !== permId) : [...prev, permId]
    );
  };

  const toggleGroup = (group: PermissionGroup) => {
    const groupPermIds = group.permissions.map((p) => p.id);
    const allSelected = groupPermIds.every((id) => selectedPermissions.includes(id));

    if (allSelected) {
      setSelectedPermissions((prev) => prev.filter((id) => !groupPermIds.includes(id)));
    } else {
      setSelectedPermissions((prev) => Array.from(new Set([...prev, ...groupPermIds])));
    }
  };

  const applyPreset = (preset: typeof ROLE_PRESETS[0]) => {
    if (!isEditing) {
      setTenVaiTro(preset.name);
    }
    setDescriptionText(preset.desc);
    setSelectedPermissions(preset.perms);
    toast.info(`Đã áp dụng mẫu phân quyền: ${preset.name}`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ten_vai_tro.trim()) {
      toast.error("Vui lòng nhập tên vai trò!");
      return;
    }

    setIsLoading(true);

    const encodedMoTa = `PERMS:${selectedPermissions.join(",")} | ${descriptionText.trim()}`;

    try {
      if (isEditing) {
        await updateRoleAction(
          role.ma_vai_tro,
          ten_vai_tro !== role.ten_vai_tro ? ten_vai_tro : undefined,
          encodedMoTa
        );
        toast.success("Cập nhật vai trò & ma trận phân quyền thành công!");
      } else {
        await createRoleAction(ten_vai_tro, encodedMoTa);
        toast.success("Tạo vai trò mới & phân quyền thành công!");
      }
      onClose();
    } catch (error: any) {
      toast.error(error.message || "Đã có lỗi xảy ra");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const totalPossible = PERMISSION_GROUPS.reduce((acc, g) => acc + g.permissions.length, 0);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#1e1b14]/50 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="bg-[#fff9ee] w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden border border-[#e9e2d5] flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#e9e2d5] flex justify-between items-center bg-white">
          <div>
            <h2 className="text-[18px] font-black text-[#0d1b4e] font-display flex items-center gap-2">
              <span className="material-symbols-outlined text-[#fdb712]">shield_person</span>
              {isEditing ? `Cập Nhật Vai Trò: ${role?.ten_vai_tro}` : "Thiết Lập Vai Trò & Ma Trận Phân Quyền Mới"}
            </h2>
            <p className="text-[12px] text-[#767680]">
              Đã cấp quyền: <strong className="text-[#0d1b4e]">{selectedPermissions.length}/{totalPossible}</strong> chức năng hệ thống
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#f4ede0] text-[#767680] transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="p-6 space-y-6 overflow-y-auto flex-1">
            {/* Quick Presets */}
            <div>
              <label className="block text-[11px] font-black text-[#767680] uppercase tracking-wider mb-2">
                Áp Dụng Mẫu Phân Quyền Nhanh:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {ROLE_PRESETS.map((preset) => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => applyPreset(preset)}
                    className="p-2.5 bg-white hover:bg-[#faf3e6] border border-[#c6c5d0] hover:border-[#0d1b4e] rounded-xl text-left transition-all group"
                  >
                    <span className="text-[12px] font-bold text-[#0d1b4e] group-hover:text-[#fdb712] block truncate">
                      {preset.name}
                    </span>
                    <span className="text-[10px] text-[#767680] block mt-0.5">
                      {preset.perms.length} quyền
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Basic Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white p-4 rounded-xl border border-[#e9e2d5]">
              <div>
                <label className="block text-[12px] font-bold text-[#1e1b14] mb-1">
                  Tên Vai Trò <span className="text-[#ba1a1a]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={ten_vai_tro}
                  onChange={(e) => setTenVaiTro(e.target.value)}
                  disabled={isEditing && (role?.ten_vai_tro === "super_admin" || role?.ten_vai_tro === "chuyen_vien")}
                  className="w-full px-3.5 py-2 bg-[#faf3e6] border border-[#c6c5d0] rounded-lg text-[13px] font-bold text-[#0d1b4e] outline-none focus:border-[#0d1b4e] disabled:opacity-60 disabled:cursor-not-allowed"
                  placeholder="VD: chuyen_vien_tuyen_sinh, can_bo_khoa..."
                />
              </div>

              <div>
                <label className="block text-[12px] font-bold text-[#1e1b14] mb-1">
                  Mô Tả Nhiệm Vụ & Quyền Hạn
                </label>
                <input
                  type="text"
                  value={descriptionText}
                  onChange={(e) => setDescriptionText(e.target.value)}
                  className="w-full px-3.5 py-2 bg-[#faf3e6] border border-[#c6c5d0] rounded-lg text-[13px] outline-none focus:border-[#0d1b4e]"
                  placeholder="VD: Phụ trách cấu hình phương thức và chỉ tiêu tuyển sinh..."
                />
              </div>
            </div>

            {/* Permission Matrix */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-[14px] font-black text-[#0d1b4e] uppercase tracking-wider flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[18px]">tune</span>
                  Ma Trận Phân Quyền Chi Tiết
                </h3>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setSelectedPermissions(PERMISSION_GROUPS.flatMap((g) => g.permissions.map((p) => p.id)))
                    }
                    className="text-[11px] font-bold text-[#0d1b4e] hover:underline"
                  >
                    Chọn tất cả
                  </button>
                  <span className="text-gray-300">|</span>
                  <button
                    type="button"
                    onClick={() => setSelectedPermissions([])}
                    className="text-[11px] font-bold text-[#ba1a1a] hover:underline"
                  >
                    Bỏ chọn tất cả
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {PERMISSION_GROUPS.map((group) => {
                  const groupPermIds = group.permissions.map((p) => p.id);
                  const isAllInGroup = groupPermIds.every((id) => selectedPermissions.includes(id));
                  const countInGroup = groupPermIds.filter((id) => selectedPermissions.includes(id)).length;

                  return (
                    <div
                      key={group.id}
                      className="bg-white rounded-xl border border-[#e9e2d5] p-4 space-y-3 shadow-sm hover:border-[#0d1b4e]/30 transition-all"
                    >
                      <div className="flex items-center justify-between border-b border-[#f4ede0] pb-2">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-[20px] text-[#0d1b4e]">
                            {group.icon}
                          </span>
                          <span className="font-bold text-[13px] text-[#0d1b4e]">
                            {group.title}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => toggleGroup(group)}
                          className={`text-[11px] font-bold px-2 py-0.5 rounded transition-colors ${
                            isAllInGroup
                              ? "bg-[#0d1b4e] text-white"
                              : countInGroup > 0
                              ? "bg-[#ffdea8] text-[#7c5800]"
                              : "bg-[#faf3e6] text-[#767680] hover:bg-[#f4ede0]"
                          }`}
                        >
                          {countInGroup}/{group.permissions.length} Quyền
                        </button>
                      </div>

                      <div className="space-y-2">
                        {group.permissions.map((perm) => {
                          const isChecked = selectedPermissions.includes(perm.id);
                          return (
                            <label
                              key={perm.id}
                              className={`flex items-start gap-2.5 p-2 rounded-lg cursor-pointer transition-all ${
                                isChecked ? "bg-[#faf3e6] border border-[#fdb712]/40" : "hover:bg-[#faf3e6]/50"
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => togglePermission(perm.id)}
                                className="mt-0.5 w-4 h-4 rounded text-[#0d1b4e] accent-[#0d1b4e] focus:ring-0"
                              />
                              <div className="flex-1 min-w-0">
                                <span className={`text-[12px] font-bold block leading-tight ${isChecked ? "text-[#0d1b4e]" : "text-[#1e1b14]"}`}>
                                  {perm.label}
                                </span>
                                <span className="text-[11px] text-[#767680] block mt-0.5 leading-snug">
                                  {perm.description}
                                </span>
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-white border-t border-[#e9e2d5] flex items-center justify-between">
            <div className="text-[12px] text-[#767680]">
              Tổng quyền đã chọn: <strong className="text-[#0d1b4e]">{selectedPermissions.length}</strong> quyền
            </div>
            <div className="flex items-center gap-3">
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
                className="px-6 py-2.5 bg-[#fdb712] hover:bg-[#e2a20a] text-[#0d1b4e] font-extrabold text-[13px] rounded-xl shadow-sm transition-all flex items-center justify-center min-w-[140px] disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-t-transparent border-[#0d1b4e] rounded-full animate-spin" />
                ) : (
                  "LƯU PHÂN QUYỀN"
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

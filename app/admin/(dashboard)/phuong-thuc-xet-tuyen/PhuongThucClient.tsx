"use client";
import { AdminIcon } from "@/components/admin/AdminIcon";
import { publicError } from "@/libs/client-error";

import { useState } from "react";
import { DataTable, Column } from "@/components/admin/DataTable";
import { ModalForm } from "@/components/admin/ModalForm";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { toast } from "@/libs/admin-toast";
import { METHOD_GROUPS, validateMethodConfig, type MethodGroup } from "@/libs/admission-catalog";
import {
  createPhuongThucXetTuyenAction,
  updatePhuongThucXetTuyenAction,
  deletePhuongThucXetTuyenAction,
} from "@/actions/phuong_thuc_xet_tuyen.action";

interface PhuongThucItem {
  ma_phuong_thuc: string;
  ten_phuong_thuc: string;
  doi_tuong?: string;
  pham_vi?: string;
}

export default function PhuongThucClient({ initialData }: { initialData: any[] }) {
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<any | null>(null);
  const [deletingRow, setDeletingRow] = useState<any | null>(null);

  const [methodCode, setMethodCode] = useState("");
  const [name, setName] = useState("");
  const [group, setGroup] = useState("");
  const [minimum, setMinimum] = useState("");
  const [maximum, setMaximum] = useState("");
  const [formError, setFormError] = useState("");

  const filteredData = initialData.filter((item) =>
    item.ten_phuong_thuc?.toLowerCase().includes(search.toLowerCase()) ||
    item.ma_phuong_thuc?.toLowerCase().includes(search.toLowerCase())
  );

  const openCreate = () => {
    setEditingRow(null);
    setMethodCode("");
    setName("");
    setGroup(""); setMinimum(""); setMaximum(""); setFormError("");
    setIsModalOpen(true);
  };

  const openEdit = (row: any) => {
    setEditingRow(row);
    setMethodCode(row.ma_phuong_thuc);
    setName(row.ten_phuong_thuc);
    setGroup(row.nhom_xet_tuyen || ""); setMinimum(row.diem_toi_thieu?.toString() ?? "");
    setMaximum(row.diem_toi_da?.toString() ?? ""); setFormError("");
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!methodCode.trim() || !name.trim()) {
      toast.error("Vui lòng điền đủ mã và tên phương thức!");
      return;
    }
    try {
      if (!minimum.trim() || !maximum.trim()) { setFormError("Vui lòng nhập giới hạn điểm"); return; }
      let config;
      try { config = validateMethodConfig({ nhom_xet_tuyen: group, diem_toi_thieu: Number(minimum), diem_toi_da: Number(maximum) }); }
      catch { setFormError("Chọn nhóm xét tuyển và nhập thang điểm hợp lệ: 0 ≤ tối thiểu < tối đa."); return; }
      if (editingRow) {
        await updatePhuongThucXetTuyenAction(editingRow.ma_phuong_thuc, {
          ten_phuong_thuc: name.trim(),
          ...config,
        });
        toast.success("Cập nhật phương thức thành công!");
      } else {
        await createPhuongThucXetTuyenAction({
          ma_phuong_thuc: methodCode.trim(),
          ten_phuong_thuc: name.trim(),
          ...config,
        });
        toast.success("Thêm mới phương thức thành công!");
      }
      setIsModalOpen(false);
    } catch (err: any) {
      setFormError("Không lưu được phương thức. Thang điểm phải chứa các điểm chuẩn đã lưu; kiểm tra mã trùng và thử lại.");
    }
  };

  const handleDelete = async () => {
    if (!deletingRow) return;
    try {
      await deletePhuongThucXetTuyenAction(deletingRow.ma_phuong_thuc);
      toast.success("Xóa phương thức thành công!");
      setDeletingRow(null);
    } catch (err: any) {
      toast.error(publicError(err.message || "Có lỗi xảy ra khi xóa phương thức"));
    }
  };

  const columns: Column<any>[] = [
    {
      header: "Mã Phương Thức",
      accessor: (r) => (
        <span className="font-stamp font-black text-[13px] text-[#192b59] bg-[#f8fafc] px-3 py-1.5 rounded-lg border border-[#cbd5e1] inline-block shadow-sm">
          {r.ma_phuong_thuc}
        </span>
      ),
      className: "w-[160px]"
    },
    {
      header: "Tên Phương Thức Xét Tuyển",
      accessor: (r) => (
        <div className="py-1">
          <span className="font-bold block text-[15px] text-[#1e293b] leading-snug">
            {r.ten_phuong_thuc}
          </span>
        </div>
      ),
      className: "w-full"
    },
    {
      header: "Nhóm / Căn Cứ Xét Tuyển",
      accessor: (r) => {
        const label = METHOD_GROUPS[r.nhom_xet_tuyen as MethodGroup];
        return (
          <span className={`px-2.5 py-1 rounded-md font-bold text-[11px] border whitespace-nowrap inline-flex items-center gap-1 bg-blue-50 text-blue-900 border-blue-200`}>
            <AdminIcon name="school" className="text-[14px]" />
            {label || "Chưa cấu hình"}
          </span>
        );
      },
      className: "w-[200px]"
    },
    { header: "Giới hạn điểm", accessor: row => row.diem_toi_thieu == null || row.diem_toi_da == null ? "Chưa cấu hình" : `${row.diem_toi_thieu}–${row.diem_toi_da}` },
  ];

  return (
    <div className="space-y-6 pt-2">
      {/* Header section with clean, enlarged typography */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-black text-[28px] text-[#192b59] tracking-tight">
            Quản Lý Phương Thức Xét Tuyển
          </h1>
          <p className="text-[14px] text-[#475569] mt-0.5">
            Danh mục các phương thức tuyển sinh Đại học chính quy Trường Đại học Giao thông Vận tải.
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-[#fdb712] hover:bg-[#e2a20a] text-[#192b59] px-5 py-2.5 rounded-xl font-black text-[14px] shadow-sm transition-all hover:scale-[1.02] active:scale-95 whitespace-nowrap"
        >
          <AdminIcon name="add_circle" className="text-[20px]" />
          Thêm Phương Thức Mới
        </button>
      </div>

      {/* Search Bar */}
      <div className="flex items-center">
        <div className="relative w-full max-w-md">
          <AdminIcon name="search" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#64748b] text-[20px]" />
          <input
            type="text"
            placeholder="Tìm theo mã hoặc tên phương thức xét tuyển..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#cbd5e1] rounded-xl text-[14px] font-medium outline-none focus:border-[#192b59] focus:ring-2 focus:ring-[#192b59]/20 transition-all shadow-sm"
          />
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-[#e2e8f0] overflow-hidden">
        <DataTable
          columns={columns}
          data={filteredData}
          onEdit={openEdit}
          onDelete={(row) => setDeletingRow(row)}
        />
      </div>

      {/* Modal Add / Edit */}
      <ModalForm
        isOpen={isModalOpen}
        title={editingRow ? "Chỉnh Sửa Phương Thức Xét Tuyển" : "Thêm Phương Thức Xét Tuyển Mới"}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSave}
      >
        <div className="space-y-4">
          <label className="block text-sm font-bold">Nhóm / căn cứ xét tuyển
            <select aria-label="Nhóm xét tuyển" required value={group} onChange={event => {
              const next = event.target.value; setGroup(next); setMinimum("0");
              setMaximum(({ THPT: "30", HOC_BA: "30", HSA: "150", TSA: "100", KET_HOP: "30", TUYEN_THANG: "30", KHAC: "" } as Record<string, string>)[next] ?? "");
            }} className="mt-2 w-full rounded-xl border border-slate-300 bg-white p-3">
              <option value="">Chọn nhóm xét tuyển</option>
              {Object.entries(METHOD_GROUPS).map(([code, label]) => <option key={code} value={code}>{label}</option>)}
            </select>
          </label>
          <div className="grid gap-3 sm:grid-cols-2">
            <label>Điểm tối thiểu<input aria-label="Điểm tối thiểu" type="number" min={0} step="any" required value={minimum} onChange={e => setMinimum(e.target.value)} className="mt-2 w-full rounded-xl border p-3" /></label>
            <label>Điểm tối đa<input aria-label="Điểm tối đa" type="number" min={0} step="any" required value={maximum} onChange={e => setMaximum(e.target.value)} className="mt-2 w-full rounded-xl border p-3" /></label>
          </div>
          <p className="text-sm text-slate-600">Thang điểm này dùng để kiểm tra điểm chuẩn của phương thức. Không suy ra nhóm từ mã hoặc tên.</p>
          {formError && <p role="alert" className="text-red-700">{formError}</p>}
          {!editingRow && (
            <div>
              <label className="block text-[12px] font-bold mb-1.5 text-[#475569] uppercase tracking-wider">
                Mã Phương Thức <span className="text-red-500">*</span> (VD: PT100, PT200, PT402):
              </label>
              <input
                type="text"
                required
                placeholder="VD: PT100"
                value={methodCode}
                onChange={(e) => setMethodCode(e.target.value)}
                className="w-full px-4 py-2.5 bg-[#f8fafc] border border-[#cbd5e1] rounded-xl text-[14px] font-bold text-[#192b59] focus:border-[#192b59] outline-none"
              />
            </div>
          )}
          <div>
            <label className="block text-[12px] font-bold mb-1.5 text-[#475569] uppercase tracking-wider">
              Tên Phương Thức Xét Tuyển <span className="text-red-500">*</span>:
            </label>
            <input
              type="text"
              required
              placeholder="VD: Xét kết quả thi tốt nghiệp THPT năm 2026"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 bg-[#f8fafc] border border-[#cbd5e1] rounded-xl text-[14px] font-medium text-[#1e293b] focus:border-[#192b59] outline-none"
            />
          </div>
        </div>
      </ModalForm>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deletingRow}
        title="Xác Nhận Xóa Phương Thức"
        message={`Bạn có chắc muốn xóa phương thức "${deletingRow?.ma_phuong_thuc} - ${deletingRow?.ten_phuong_thuc}"? Hành động này có thể ảnh hưởng đến các điểm chuẩn và dữ liệu xét tuyển liên quan.`}
        onConfirm={handleDelete}
        onCancel={() => setDeletingRow(null)}
      />
    </div>
  );
}

"use client";

import { useState } from "react";
import { DataTable, Column } from "@/components/admin/DataTable";
import { ModalForm } from "@/components/admin/ModalForm";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { toast } from "sonner";
import {
  createPhuongThucXetTuyenAction,
  updatePhuongThucXetTuyenAction,
  deletePhuongThucXetTuyenAction,
} from "@/actions/phuong_thuc_xet_tuyen.action";

export default function PhuongThucClient({ initialData }: { initialData: any[] }) {
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<any | null>(null);
  const [deletingRow, setDeletingRow] = useState<any | null>(null);

  const [methodCode, setMethodCode] = useState("");
  const [name, setName] = useState("");

  const filteredData = initialData.filter((item) =>
    item.ten_phuong_thuc.toLowerCase().includes(search.toLowerCase()) ||
    item.ma_phuong_thuc.toLowerCase().includes(search.toLowerCase())
  );

  const openCreate = () => {
    setEditingRow(null);
    setMethodCode("");
    setName("");
    setIsModalOpen(true);
  };

  const openEdit = (row: any) => {
    setEditingRow(row);
    setMethodCode(row.ma_phuong_thuc);
    setName(row.ten_phuong_thuc);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!methodCode || !name) {
      toast.error("Vui lòng điền đủ mã và tên phương thức!");
      return;
    }
    try {
      if (editingRow) {
        await updatePhuongThucXetTuyenAction(editingRow.ma_phuong_thuc, {
          ten_phuong_thuc: name,
        });
        toast.success("Cập nhật thành công!");
      } else {
        await createPhuongThucXetTuyenAction({
          ma_phuong_thuc: methodCode,
          ten_phuong_thuc: name,
        });
        toast.success("Thêm mới thành công!");
      }
      setIsModalOpen(false);
    } catch (err: any) {
      toast.error(err.message || "Có lỗi xảy ra");
    }
  };

  const handleDelete = async () => {
    if (!deletingRow) return;
    try {
      await deletePhuongThucXetTuyenAction(deletingRow.ma_phuong_thuc);
      toast.success("Xóa thành công!");
      setDeletingRow(null);
    } catch (err: any) {
      toast.error(err.message || "Có lỗi xảy ra khi xóa");
    }
  };

  const columns: Column<any>[] = [
    { 
      header: "Mã PT", 
      accessor: (r) => (
        <span className="font-stamp font-bold text-[#0d1b4e] bg-[#faf3e6] px-2.5 py-1 rounded border border-[#c6c5d0]">
          {r.ma_phuong_thuc}
        </span>
      ),
      className: "w-[150px]"
    },
    { 
      header: "Tên Phương Thức Xét Tuyển", 
      accessor: (r) => (
        <div>
          <span className="font-bold block text-[14px] text-[#1e1b14]">{r.ten_phuong_thuc}</span>
        </div>
      ),
      className: "w-full"
    },
    { 
      header: "Trạng Thái", 
      accessor: () => (
        <span className="px-2 py-0.5 rounded bg-[#86efac] text-[#111827] font-bold text-[10px] whitespace-nowrap">
          ĐANG ÁP DỤNG
        </span>
      ),
      className: "w-[120px] text-center"
    },
  ];

  return (
    <div className="space-y-6 pt-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-[26px] text-[#0d1b4e]">Quản Lý Phương Thức Xét Tuyển</h1>
          <p className="text-[13px] text-[#45464f]">Cấu hình danh mục các phương thức tuyển sinh chính thức UTC.</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-1.5 bg-[#fdb712] text-[#0d1b4e] px-4 py-2.5 rounded-xl font-bold text-[13px] transition-colors hover:bg-[#e2a20a]">
          <span className="material-symbols-outlined text-[18px]">add_circle</span> Thêm Phương Thức
        </button>
      </div>

      <div className="flex items-center mb-4">
        <div className="relative w-80">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#767680] text-[18px]">
            search
          </span>
          <input
            type="text"
            placeholder="Tìm theo mã hoặc tên phương thức..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-[#c6c5d0] rounded-lg text-[13px] outline-none focus:border-[#0d1b4e] focus:ring-1 focus:ring-[#0d1b4e] transition-all"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-[#e9e2d5] overflow-hidden">
        <DataTable columns={columns} data={filteredData} onEdit={openEdit} onDelete={(row) => setDeletingRow(row)} />
      </div>

      <ModalForm isOpen={isModalOpen} title={editingRow ? "Sửa Phương Thức" : "Thêm Phương Thức"} onClose={() => setIsModalOpen(false)} onSubmit={handleSave}>
        <div className="space-y-4">
          {!editingRow && (
            <div>
              <label className="block text-[12px] font-bold mb-1 text-[#767680] uppercase">Mã Phương Thức (Vd: PT100):</label>
              <input type="text" required value={methodCode} onChange={(e) => setMethodCode(e.target.value)} className="w-full px-3 py-2 bg-[#faf3e6] border border-[#c6c5d0] rounded-lg text-[13px] font-bold focus:border-[#0d1b4e] outline-none" />
            </div>
          )}
          <div>
            <label className="block text-[12px] font-bold mb-1 text-[#767680] uppercase">Tên Phương Thức:</label>
            <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3 py-2 bg-[#faf3e6] border border-[#c6c5d0] rounded-lg text-[13px] font-bold focus:border-[#0d1b4e] outline-none" />
          </div>
        </div>
      </ModalForm>

      <ConfirmDialog isOpen={!!deletingRow} title="Xác Nhận Xóa Phương Thức" message={`Bạn có chắc muốn xóa phương thức ${deletingRow?.methodCode || deletingRow?.ma_phuong_thuc}? Hành động này có thể ảnh hưởng đến các điểm chuẩn và nguyện vọng liên quan.`} onConfirm={handleDelete} onCancel={() => setDeletingRow(null)} />
    </div>
  );
}

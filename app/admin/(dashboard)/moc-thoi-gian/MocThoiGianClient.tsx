"use client";

import { useState } from "react";
import { DataTable, Column } from "@/components/admin/DataTable";
import { ModalForm } from "@/components/admin/ModalForm";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { toast } from "sonner";
import {
  createLoTrinhTuyenSinhAction,
  updateLoTrinhTuyenSinhAction,
  deleteLoTrinhTuyenSinhAction,
} from "@/actions/lo_trinh_tuyen_sinh.action";

export default function MocThoiGianClient({ initialData }: { initialData: any[] }) {
  const [data, setData] = useState(initialData);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<any | null>(null);
  const [deletingRow, setDeletingRow] = useState<any | null>(null);

  const [title, setTitle] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [description, setDescription] = useState("");

  const formatDateForInput = (dateString: string | null) => {
    if (!dateString) return "";
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return "";
    return d.toISOString().split("T")[0];
  };

  const openCreate = () => {
    setEditingRow(null);
    setTitle("");
    setStartDate("");
    setEndDate("");
    setDescription("");
    setIsModalOpen(true);
  };

  const openEdit = (row: any) => {
    setEditingRow(row);
    setTitle(row.ten_su_kien);
    setStartDate(formatDateForInput(row.thoi_gian_bat_dau));
    setEndDate(formatDateForInput(row.thoi_gian_ket_thuc));
    setDescription(row.ghi_chu || "");
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !startDate) {
      toast.error("Vui lòng nhập tên sự kiện và ngày bắt đầu!");
      return;
    }

    try {
      if (editingRow) {
        await updateLoTrinhTuyenSinhAction(editingRow.ma_su_kien, {
          ten_su_kien: title,
          thoi_gian_bat_dau: new Date(startDate),
          thoi_gian_ket_thuc: endDate ? new Date(endDate) : undefined,
          ghi_chu: description,
        });
        toast.success("Cập nhật sự kiện thành công!");
      } else {
        await createLoTrinhTuyenSinhAction({
          ten_su_kien: title,
          thoi_gian_bat_dau: new Date(startDate),
          thoi_gian_ket_thuc: endDate ? new Date(endDate) : undefined,
          ghi_chu: description,
        });
        toast.success("Thêm mới sự kiện thành công!");
      }
      setIsModalOpen(false);
      
      // Update UI optimistically or reload page
      // Because we use Server Actions with revalidatePath, it will be refreshed when the server responds
      window.location.reload(); 
    } catch (err: any) {
      toast.error(err.message || "Có lỗi xảy ra");
    }
  };

  const handleDelete = async () => {
    if (!deletingRow) return;
    try {
      await deleteLoTrinhTuyenSinhAction(deletingRow.ma_su_kien);
      toast.success("Xóa sự kiện thành công!");
      setDeletingRow(null);
      window.location.reload();
    } catch (err: any) {
      toast.error(err.message || "Có lỗi xảy ra khi xóa");
    }
  };

  const getStatus = (start: string, end: string | null) => {
    const now = new Date().getTime();
    const startTime = new Date(start).getTime();
    const endTime = end ? new Date(end).getTime() : Infinity;

    if (now < startTime) return { label: "SẮP DIỄN RA", code: "UPCOMING" };
    if (now > endTime) return { label: "ĐÃ KẾT THÚC", code: "PAST" };
    return { label: "ĐANG DIỄN RA", code: "ACTIVE" };
  };

  const columns: Column<any>[] = [
    {
      header: "Tên Mốc Thời Gian",
      accessor: (r) => (
        <div>
          <span className="font-bold block text-[14px] text-[#1e1b14]">{r.ten_su_kien}</span>
          <span className="text-[11px] text-[#767680]">{r.ghi_chu}</span>
        </div>
      ),
      className: "w-full",
    },
    {
      header: "Thời Gian",
      accessor: (r) => {
        const start = new Date(r.thoi_gian_bat_dau).toLocaleDateString("vi-VN");
        const end = r.thoi_gian_ket_thuc ? new Date(r.thoi_gian_ket_thuc).toLocaleDateString("vi-VN") : "Chưa xác định";
        return (
          <span className="font-mono font-bold text-[#0284c7]">
            {start} → {end}
          </span>
        );
      },
      className: "w-[220px]",
    },
    {
      header: "Trạng Thái",
      accessor: (r) => {
        const status = getStatus(r.thoi_gian_bat_dau, r.thoi_gian_ket_thuc);
        let bgColor = "bg-[#dde1ff]";
        let textColor = "text-[#0d1b4e]";
        if (status.code === "ACTIVE") {
          bgColor = "bg-[#86efac]";
          textColor = "text-[#111827]";
        } else if (status.code === "PAST") {
          bgColor = "bg-[#e5e7eb]";
          textColor = "text-[#4b5563]";
        }

        return (
          <span className={`px-2 py-0.5 rounded font-bold text-[10px] whitespace-nowrap ${bgColor} ${textColor}`}>
            {status.label}
          </span>
        );
      },
      className: "w-[120px] text-center",
    },
  ];

  return (
    <div className="space-y-6 pt-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-[26px] text-[#0d1b4e]">Quản Lý Mốc Thời Gian Lộ Trình</h1>
          <p className="text-[13px] text-[#45464f]">Quản lý tiến độ tuyển sinh và hiển thị timeline trên trang phía thí sinh.</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-1.5 bg-[#fdb712] text-[#0d1b4e] px-4 py-2.5 rounded-xl font-bold text-[13px] transition-colors hover:bg-[#e2a20a]">
          <span className="material-symbols-outlined text-[18px]">add_circle</span> Thêm Mốc Thời Gian
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-[#e9e2d5] overflow-hidden">
        <DataTable columns={columns} data={data} onEdit={openEdit} onDelete={(row) => setDeletingRow(row)} />
      </div>

      <ModalForm isOpen={isModalOpen} title={editingRow ? "Sửa Mốc Thời Gian" : "Thêm Mốc Thời Gian"} onClose={() => setIsModalOpen(false)} onSubmit={handleSave}>
        <div className="space-y-4">
          <div>
            <label className="block text-[12px] font-bold mb-1 text-[#767680] uppercase">Tên Mốc Tuyển Sinh:</label>
            <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-3 py-2 bg-[#faf3e6] border border-[#c6c5d0] rounded-lg text-[13px] font-bold focus:border-[#0d1b4e] outline-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[12px] font-bold mb-1 text-[#767680] uppercase">Ngày Bắt Đầu:</label>
              <input type="date" required value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full px-3 py-2 bg-[#faf3e6] border border-[#c6c5d0] rounded-lg text-[13px] focus:border-[#0d1b4e] outline-none" />
            </div>
            <div>
              <label className="block text-[12px] font-bold mb-1 text-[#767680] uppercase">Ngày Kết Thúc (Tùy chọn):</label>
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full px-3 py-2 bg-[#faf3e6] border border-[#c6c5d0] rounded-lg text-[13px] focus:border-[#0d1b4e] outline-none" />
            </div>
          </div>
          <div>
            <label className="block text-[12px] font-bold mb-1 text-[#767680] uppercase">Mô Tả Chi Tiết:</label>
            <textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} className="w-full px-3 py-2 bg-[#faf3e6] border border-[#c6c5d0] rounded-lg text-[13px] focus:border-[#0d1b4e] outline-none" />
          </div>
        </div>
      </ModalForm>

      <ConfirmDialog isOpen={!!deletingRow} title="Xác Nhận Xóa Mốc Thời Gian" message={`Bạn có chắc muốn xóa mốc "${deletingRow?.ten_su_kien}"?`} onConfirm={handleDelete} onCancel={() => setDeletingRow(null)} />
    </div>
  );
}

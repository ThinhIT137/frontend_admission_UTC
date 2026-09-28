"use client";

import { useState } from "react";
import { DataTable, Column } from "@/components/admin/DataTable";
import { ModalForm } from "@/components/admin/ModalForm";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";

interface RoadmapMilestoneAdmin {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  status: "ACTIVE" | "UPCOMING" | "PAST";
  description: string;
}

const initialMilestones: RoadmapMilestoneAdmin[] = [
  { id: "1", title: "Đăng Ký Hồ Sơ Xét Tuyển Sớm & Chứng Chỉ Quốc Tế", startDate: "2026-03-01", endDate: "2026-05-30", status: "ACTIVE", description: "Mở cổng tiếp nhận học bạ và chứng chỉ IELTS/SAT/ĐGNL" },
  { id: "2", title: "Thi Tốt Nghiệp THPT Quốc Gia Năm 2026", startDate: "2026-06-26", endDate: "2026-06-29", status: "UPCOMING", description: "Kỳ thi chính thức của Bộ GD&ĐT" },
  { id: "3", title: "Đăng Ký Nguyện Vọng Trên Cổng Thông Tin Bộ GD&ĐT", startDate: "2026-07-10", endDate: "2026-07-30", status: "UPCOMING", description: "Thí sinh đăng ký nguyện vọng xét tuyển đại học" },
];

export default function MilestoneAdminPage() {
  const [data, setData] = useState<RoadmapMilestoneAdmin[]>(initialMilestones);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<RoadmapMilestoneAdmin | null>(null);
  const [deletingRow, setDeletingRow] = useState<RoadmapMilestoneAdmin | null>(null);

  const [title, setTitle] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [description, setDescription] = useState("");

  const openCreate = () => {
    setEditingRow(null);
    setTitle("");
    setStartDate("2026-03-01");
    setEndDate("2026-05-30");
    setDescription("");
    setIsModalOpen(true);
  };

  const openEdit = (row: RoadmapMilestoneAdmin) => {
    setEditingRow(row);
    setTitle(row.title);
    setStartDate(row.startDate);
    setEndDate(row.endDate);
    setDescription(row.description);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingRow) {
      setData((prev) =>
        prev.map((item) => (item.id === editingRow.id ? { ...item, title, startDate, endDate, description } : item))
      );
    } else {
      setData((prev) => [
        { id: Date.now().toString(), title, startDate, endDate, description, status: "UPCOMING" },
        ...prev,
      ]);
    }
    setIsModalOpen(false);
  };

  const handleDelete = () => {
    if (!deletingRow) return;
    setData((prev) => prev.filter((item) => item.id !== deletingRow.id));
    setDeletingRow(null);
  };

  const columns: Column<RoadmapMilestoneAdmin>[] = [
    { header: "Tên Mốc Thời Gian", accessor: (r) => <div><span className="font-bold block">{r.title}</span><span className="text-[11px] text-[#767680]">{r.description}</span></div> },
    { header: "Thời Gian", accessor: (r) => <span className="font-mono font-bold text-[#0284c7]">{r.startDate} → {r.endDate}</span> },
    { header: "Trạng Thái", accessor: (r) => <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${r.status === "ACTIVE" ? "bg-[#86efac] text-[#111827]" : "bg-[#dde1ff] text-[#0d1b4e]"}`}>{r.status === "ACTIVE" ? "ĐANG MỞ HỒ SƠ" : "SẮP DIỄN RA"}</span> },
  ];

  return (
    <div className="space-y-6 pt-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-[26px] text-[#0d1b4e]">Quản Lý Mốc Thời Gian Lộ Trình</h1>
          <p className="text-[13px] text-[#45464f]">Quản lý tiến độ tuyển sinh và hiển thị timeline trên trang phía thí sinh.</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-1.5 bg-[#fdb712] text-[#0d1b4e] px-4 py-2.5 rounded-xl font-bold text-[13px]">
          <span className="material-symbols-outlined text-[18px]">add_circle</span> Thêm Mốc Thời Gian
        </button>
      </div>

      <DataTable columns={columns} data={data} onEdit={openEdit} onDelete={(row) => setDeletingRow(row)} />

      <ModalForm isOpen={isModalOpen} title={editingRow ? "Sửa Mốc Thời Gian" : "Thêm Mốc Thời Gian"} onClose={() => setIsModalOpen(false)} onSubmit={handleSave}>
        <div className="space-y-4">
          <div>
            <label className="block text-[12px] font-bold mb-1">Tên Mốc Tuyển Sinh:</label>
            <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-3 py-2 bg-[#faf3e6] border border-[#c6c5d0] rounded-lg text-[13px]" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[12px] font-bold mb-1">Ngày Bắt Đầu:</label>
              <input type="date" required value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full px-3 py-2 bg-[#faf3e6] border border-[#c6c5d0] rounded-lg text-[13px]" />
            </div>
            <div>
              <label className="block text-[12px] font-bold mb-1">Ngày Kết Thúc:</label>
              <input type="date" required value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full px-3 py-2 bg-[#faf3e6] border border-[#c6c5d0] rounded-lg text-[13px]" />
            </div>
          </div>
          <div>
            <label className="block text-[12px] font-bold mb-1">Mô Tả Chi Tiết:</label>
            <textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} className="w-full px-3 py-2 bg-[#faf3e6] border border-[#c6c5d0] rounded-lg text-[13px]" />
          </div>
        </div>
      </ModalForm>

      <ConfirmDialog isOpen={!!deletingRow} title="Xác Nhận Xóa Mốc Thời Gian" message={`Bạn có chắc muốn xóa mốc "${deletingRow?.title}"?`} onConfirm={handleDelete} onCancel={() => setDeletingRow(null)} />
    </div>
  );
}

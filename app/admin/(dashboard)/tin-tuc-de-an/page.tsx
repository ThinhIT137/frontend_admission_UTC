"use client";

import { useState } from "react";
import { DataTable, Column } from "@/components/admin/DataTable";
import { ModalForm } from "@/components/admin/ModalForm";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";

interface ArticleData {
  id: string;
  title: string;
  category: "ĐỀ ÁN" | "QUY CHẾ" | "TIN TỨC";
  publishedDate: string;
  status: "PUBLISHED" | "DRAFT";
}

const initialArticles: ArticleData[] = [
  { id: "1", title: "Đề án tuyển sinh Đại học Giao thông Vận tải K66 chính thức năm 2026", category: "ĐỀ ÁN", publishedDate: "2026-02-15", status: "PUBLISHED" },
  { id: "2", title: "Quy định quy đổi điểm chứng chỉ Tiếng Anh IELTS / SAT xét tuyển UTC", category: "QUY CHẾ", publishedDate: "2026-02-20", status: "PUBLISHED" },
  { id: "3", title: "Thông báo lịch tổ chức Kỳ thi ĐGNL ĐHQG Hà Nội tại cụm thi UTC", category: "TIN TỨC", publishedDate: "2026-03-01", status: "PUBLISHED" },
];

export default function ArticlesAdminPage() {
  const [data, setData] = useState<ArticleData[]>(initialArticles);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<ArticleData | null>(null);
  const [deletingRow, setDeletingRow] = useState<ArticleData | null>(null);

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<"ĐỀ ÁN" | "QUY CHẾ" | "TIN TỨC">("ĐỀ ÁN");
  const [status, setStatus] = useState<"PUBLISHED" | "DRAFT">("PUBLISHED");

  const openCreate = () => {
    setEditingRow(null);
    setTitle("");
    setCategory("ĐỀ ÁN");
    setStatus("PUBLISHED");
    setIsModalOpen(true);
  };

  const openEdit = (row: ArticleData) => {
    setEditingRow(row);
    setTitle(row.title);
    setCategory(row.category);
    setStatus(row.status);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingRow) {
      setData((prev) =>
        prev.map((item) => (item.id === editingRow.id ? { ...item, title, category, status } : item))
      );
    } else {
      setData((prev) => [
        { id: Date.now().toString(), title, category, publishedDate: new Date().toISOString().split("T")[0], status },
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

  const columns: Column<ArticleData>[] = [
    { header: "Tiêu Đề Bài Viết / Đề Án", accessor: (r) => <span className="font-bold text-[#1e1b14]">{r.title}</span> },
    { header: "Phân Loại", accessor: (r) => <span className="px-2 py-0.5 rounded bg-[#ffdea8] text-[#7c5800] font-bold text-[10px] font-stamp">{r.category}</span> },
    { header: "Ngày Đăng", accessor: (r) => <span className="font-mono text-[#6b7280]">{r.publishedDate}</span> },
    { header: "Trạng Thái", accessor: (r) => <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${r.status === "PUBLISHED" ? "bg-[#86efac] text-[#111827]" : "bg-[#f4ede0] text-[#767680]"}`}>{r.status === "PUBLISHED" ? "ĐÃ XUẤT BẢN" : "BẢN NHÁP"}</span> },
  ];

  return (
    <div className="space-y-6 pt-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-[26px] text-[#0d1b4e]">Quản Lý Tin Tức & Đề Án</h1>
          <p className="text-[13px] text-[#45464f]">Đăng tải quy chế, đề án tuyển sinh K66 và các bài viết cẩm nang thí sinh.</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-1.5 bg-[#fdb712] text-[#0d1b4e] px-4 py-2.5 rounded-xl font-bold text-[13px]">
          <span className="material-symbols-outlined text-[18px]">add_circle</span> Thêm Bài Viết Mới
        </button>
      </div>

      <DataTable columns={columns} data={data} onEdit={openEdit} onDelete={(row) => setDeletingRow(row)} />

      <ModalForm isOpen={isModalOpen} title={editingRow ? "Sửa Bài Viết" : "Thêm Bài Viết Mới"} onClose={() => setIsModalOpen(false)} onSubmit={handleSave}>
        <div className="space-y-4">
          <div>
            <label className="block text-[12px] font-bold mb-1">Tiêu Đề Bài Viết / Văn Bản:</label>
            <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-3 py-2 bg-[#faf3e6] border border-[#c6c5d0] rounded-lg text-[13px]" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[12px] font-bold mb-1">Phân Loại:</label>
              <select value={category} onChange={(e) => setCategory(e.target.value as any)} className="w-full px-3 py-2 bg-[#faf3e6] border border-[#c6c5d0] rounded-lg text-[13px]">
                <option value="ĐỀ ÁN">ĐỀ ÁN</option>
                <option value="QUY CHẾ">QUY CHẾ</option>
                <option value="TIN TỨC">TIN TỨC</option>
              </select>
            </div>
            <div>
              <label className="block text-[12px] font-bold mb-1">Trạng Thái Xuất Bản:</label>
              <select value={status} onChange={(e) => setStatus(e.target.value as any)} className="w-full px-3 py-2 bg-[#faf3e6] border border-[#c6c5d0] rounded-lg text-[13px]">
                <option value="PUBLISHED">XUẤT BẢN NGAY</option>
                <option value="DRAFT">LƯU BẢN NHÁP</option>
              </select>
            </div>
          </div>
        </div>
      </ModalForm>

      <ConfirmDialog isOpen={!!deletingRow} title="Xác Nhận Xóa Bài Viết" message={`Bạn có chắc muốn xóa bài viết "${deletingRow?.title}"?`} onConfirm={handleDelete} onCancel={() => setDeletingRow(null)} />
    </div>
  );
}

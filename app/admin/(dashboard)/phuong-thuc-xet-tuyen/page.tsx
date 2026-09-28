"use client";

import { useState } from "react";
import { DataTable, Column } from "@/components/admin/DataTable";
import { ModalForm } from "@/components/admin/ModalForm";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";

interface MethodData {
  id: string;
  methodCode: string;
  name: string;
  description: string;
  status: "ACTIVE" | "INACTIVE";
}

const initialMethods: MethodData[] = [
  { id: "1", methodCode: "PT100", name: "Xét tuyển theo kết quả thi THPT 2026", description: "Xét điểm 3 môn trong tổ hợp thi THPT Quốc gia", status: "ACTIVE" },
  { id: "2", methodCode: "PT402", name: "Xét tuyển kết hợp Chứng chỉ Quốc tế & THPT", description: "Xét kết hợp IELTS 5.0+ / SAT + 2 môn THPT", status: "ACTIVE" },
  { id: "3", methodCode: "PT300", name: "Xét tuyển theo kết quả Thi ĐGNL (HSA / TSA)", description: "Dùng điểm thi ĐGNL ĐHQG Hà Nội hoặc ĐGTD Bách Khoa", status: "ACTIVE" },
  { id: "4", methodCode: "PT200", name: "Xét tuyển theo Học bạ THPT 3 năm", description: "Xét tuyển dựa trên điểm trung bình học bạ 6 học kỳ", status: "ACTIVE" },
];

export default function AdmissionMethodsPage() {
  const [data, setData] = useState<MethodData[]>(initialMethods);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<MethodData | null>(null);
  const [deletingRow, setDeletingRow] = useState<MethodData | null>(null);

  const [methodCode, setMethodCode] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const openCreate = () => {
    setEditingRow(null);
    setMethodCode("");
    setName("");
    setDescription("");
    setIsModalOpen(true);
  };

  const openEdit = (row: MethodData) => {
    setEditingRow(row);
    setMethodCode(row.methodCode);
    setName(row.name);
    setDescription(row.description);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingRow) {
      setData((prev) =>
        prev.map((item) => (item.id === editingRow.id ? { ...item, methodCode, name, description } : item))
      );
    } else {
      setData((prev) => [
        { id: Date.now().toString(), methodCode, name, description, status: "ACTIVE" },
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

  const columns: Column<MethodData>[] = [
    { header: "Mã PT", accessor: (r) => <span className="font-stamp font-bold text-[#0d1b4e] bg-[#faf3e6] px-2.5 py-1 rounded border border-[#c6c5d0]">{r.methodCode}</span> },
    { header: "Tên Phương Thức Xét Tuyển", accessor: (r) => <div><span className="font-bold block">{r.name}</span><span className="text-[11px] text-[#767680]">{r.description}</span></div> },
    { header: "Trạng Thái", accessor: (r) => <span className="px-2 py-0.5 rounded bg-[#86efac] text-[#111827] font-bold text-[10px]">ĐANG ÁP DỤNG</span> },
  ];

  return (
    <div className="space-y-6 pt-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-[26px] text-[#0d1b4e]">Quản Lý Phương Thức Xét Tuyển</h1>
          <p className="text-[13px] text-[#45464f]">Cấu hình danh mục các phương thức tuyển sinh chính thức UTC.</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-1.5 bg-[#fdb712] text-[#0d1b4e] px-4 py-2.5 rounded-xl font-bold text-[13px]">
          <span className="material-symbols-outlined text-[18px]">add_circle</span> Thêm Phương Thức
        </button>
      </div>

      <DataTable columns={columns} data={data} onEdit={openEdit} onDelete={(row) => setDeletingRow(row)} />

      <ModalForm isOpen={isModalOpen} title={editingRow ? "Sửa Phương Thức" : "Thêm Phương Thức"} onClose={() => setIsModalOpen(false)} onSubmit={handleSave}>
        <div className="space-y-4">
          <div>
            <label className="block text-[12px] font-bold mb-1">Mã Phương Thức (Vd: PT100):</label>
            <input type="text" required value={methodCode} onChange={(e) => setMethodCode(e.target.value)} className="w-full px-3 py-2 bg-[#faf3e6] border border-[#c6c5d0] rounded-lg text-[13px] font-bold" />
          </div>
          <div>
            <label className="block text-[12px] font-bold mb-1">Tên Phương Thức:</label>
            <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3 py-2 bg-[#faf3e6] border border-[#c6c5d0] rounded-lg text-[13px]" />
          </div>
          <div>
            <label className="block text-[12px] font-bold mb-1">Mô Tả Quy Định:</label>
            <textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} className="w-full px-3 py-2 bg-[#faf3e6] border border-[#c6c5d0] rounded-lg text-[13px]" />
          </div>
        </div>
      </ModalForm>

      <ConfirmDialog isOpen={!!deletingRow} title="Xác Nhận Xóa Phương Thức" message={`Bạn có chắc muốn xóa phương thức ${deletingRow?.methodCode}?`} onConfirm={handleDelete} onCancel={() => setDeletingRow(null)} />
    </div>
  );
}

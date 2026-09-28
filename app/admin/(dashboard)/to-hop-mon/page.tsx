"use client";

import { useState } from "react";
import { DataTable, Column } from "@/components/admin/DataTable";
import { ModalForm } from "@/components/admin/ModalForm";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";

interface CombinationData {
  id: string;
  code: string;
  name: string;
  subjects: string;
  usedInMajors: number;
}

const initialCombinations: CombinationData[] = [
  { id: "1", code: "A00", name: "Toán, Vật lý, Hóa học", subjects: "Toán, Lý, Hóa", usedInMajors: 28 },
  { id: "2", code: "A01", name: "Toán, Vật lý, Tiếng Anh", subjects: "Toán, Lý, Anh", usedInMajors: 32 },
  { id: "3", code: "D01", name: "Toán, Ngữ văn, Tiếng Anh", subjects: "Toán, Văn, Anh", usedInMajors: 15 },
  { id: "4", code: "D07", name: "Toán, Hóa học, Tiếng Anh", subjects: "Toán, Hóa, Anh", usedInMajors: 12 },
];

export default function CombinationsPage() {
  const [data, setData] = useState<CombinationData[]>(initialCombinations);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<CombinationData | null>(null);
  const [deletingRow, setDeletingRow] = useState<CombinationData | null>(null);

  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [subjects, setSubjects] = useState("");

  const openCreate = () => {
    setEditingRow(null);
    setCode("");
    setName("");
    setSubjects("");
    setIsModalOpen(true);
  };

  const openEdit = (row: CombinationData) => {
    setEditingRow(row);
    setCode(row.code);
    setName(row.name);
    setSubjects(row.subjects);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingRow) {
      setData((prev) =>
        prev.map((item) => (item.id === editingRow.id ? { ...item, code, name, subjects } : item))
      );
    } else {
      setData((prev) => [
        { id: Date.now().toString(), code, name, subjects, usedInMajors: 0 },
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

  const columns: Column<CombinationData>[] = [
    { header: "Mã Tổ Hợp", accessor: (r) => <span className="font-stamp font-bold text-[#0284c7] bg-[#e0f2fe] px-2.5 py-1 rounded border border-[#0d1b4e]">{r.code}</span> },
    { header: "Mô Tả Tổ Hợp Môn", accessor: (r) => <span className="font-bold">{r.name}</span> },
    { header: "Các Môn Thành Phần", accessor: (r) => <span className="font-medium text-[#45464f]">{r.subjects}</span> },
    { header: "Số Ngành Đang Gắn", accessor: (r) => <span className="font-bold text-[#16a34a]">{r.usedInMajors} Ngành</span> },
  ];

  return (
    <div className="space-y-6 pt-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-[26px] text-[#0d1b4e]">Quản Lý Tổ Hợp Xét Tuyển</h1>
          <p className="text-[13px] text-[#45464f]">Quản lý các tổ hợp môn xét tuyển THPT Quốc gia (A00, A01, D01...).</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-1.5 bg-[#fdb712] text-[#0d1b4e] px-4 py-2.5 rounded-xl font-bold text-[13px]">
          <span className="material-symbols-outlined text-[18px]">add_circle</span> Thêm Tổ Hợp
        </button>
      </div>

      <DataTable columns={columns} data={data} onEdit={openEdit} onDelete={(row) => setDeletingRow(row)} />

      <ModalForm isOpen={isModalOpen} title={editingRow ? "Sửa Tổ Hợp" : "Thêm Tổ Hợp Mới"} onClose={() => setIsModalOpen(false)} onSubmit={handleSave}>
        <div className="space-y-4">
          <div>
            <label className="block text-[12px] font-bold mb-1">Mã Tổ Hợp (Vd: A00):</label>
            <input type="text" required value={code} onChange={(e) => setCode(e.target.value)} className="w-full px-3 py-2 bg-[#faf3e6] border border-[#c6c5d0] rounded-lg text-[13px] font-bold" />
          </div>
          <div>
            <label className="block text-[12px] font-bold mb-1">Tên Diễn Giải Môn:</label>
            <input type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Vd: Toán, Vật lý, Hóa học" className="w-full px-3 py-2 bg-[#faf3e6] border border-[#c6c5d0] rounded-lg text-[13px]" />
          </div>
          <div>
            <label className="block text-[12px] font-bold mb-1">Môn Viết Tắt:</label>
            <input type="text" required value={subjects} onChange={(e) => setSubjects(e.target.value)} placeholder="Vd: Toán, Lý, Hóa" className="w-full px-3 py-2 bg-[#faf3e6] border border-[#c6c5d0] rounded-lg text-[13px]" />
          </div>
        </div>
      </ModalForm>

      <ConfirmDialog isOpen={!!deletingRow} title="Xác Nhận Xóa Tổ Hợp" message={`Bạn có chắc muốn xóa tổ hợp ${deletingRow?.code}?`} onConfirm={handleDelete} onCancel={() => setDeletingRow(null)} />
    </div>
  );
}

"use client";

import { useState } from "react";
import { DataTable, Column } from "@/components/admin/DataTable";
import { ModalForm } from "@/components/admin/ModalForm";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";

interface ProgramData {
  id: string;
  programCode: string;
  name: string;
  majorName: string;
  type: "CHUẨN" | "CHẤT LƯỢNG CAO" | "TIÊN TIẾN";
  credits: number;
  years: number;
}

const initialPrograms: ProgramData[] = [
  { id: "1", programCode: "CTDT-CNTT-01", name: "Chương trình Đại học Công nghệ Thông tin Chuẩn", majorName: "Công nghệ Thông tin", type: "CHUẨN", credits: 135, years: 4 },
  { id: "2", programCode: "CTDT-LOG-01", name: "Chương trình Logistics & Chuỗi Cung ứng Tiên tiến", majorName: "Logistics và Quản lý Chuỗi Cung Ứng", type: "TIÊN TIẾN", credits: 140, years: 4 },
  { id: "3", programCode: "CTDT-TDH-01", name: "Chương trình Kỹ sư Tự động hóa Chất lượng cao", majorName: "Kỹ thuật Điều khiển và Tự động hóa", type: "CHẤT LƯỢNG CAO", credits: 150, years: 4.5 },
];

export default function ManageProgramPage() {
  const [data, setData] = useState<ProgramData[]>(initialPrograms);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<ProgramData | null>(null);
  const [deletingRow, setDeletingRow] = useState<ProgramData | null>(null);

  const [name, setName] = useState("");
  const [majorName, setMajorName] = useState("Công nghệ Thông tin");
  const [type, setType] = useState<"CHUẨN" | "CHẤT LƯỢNG CAO" | "TIÊN TIẾN">("CHUẨN");
  const [credits, setCredits] = useState(135);

  const openCreate = () => {
    setEditingRow(null);
    setName("");
    setMajorName("Công nghệ Thông tin");
    setType("CHUẨN");
    setCredits(135);
    setIsModalOpen(true);
  };

  const openEdit = (row: ProgramData) => {
    setEditingRow(row);
    setName(row.name);
    setMajorName(row.majorName);
    setType(row.type);
    setCredits(row.credits);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingRow) {
      setData((prev) =>
        prev.map((item) =>
          item.id === editingRow.id ? { ...item, name, majorName, type, credits } : item
        )
      );
    } else {
      const newItem: ProgramData = {
        id: Date.now().toString(),
        programCode: `CTDT-${Date.now().toString().slice(-4)}`,
        name,
        majorName,
        type,
        credits,
        years: 4,
      };
      setData((prev) => [newItem, ...prev]);
    }
    setIsModalOpen(false);
  };

  const handleDelete = () => {
    if (!deletingRow) return;
    setData((prev) => prev.filter((item) => item.id !== deletingRow.id));
    setDeletingRow(null);
  };

  const filtered = data.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));

  const columns: Column<ProgramData>[] = [
    { header: "Mã CTĐT", accessor: (r) => <span className="font-mono font-bold text-[#0d1b4e]">{r.programCode}</span> },
    { header: "Tên Chương Trình", accessor: (r) => <div><span className="font-bold">{r.name}</span><span className="block text-[11px] text-[#767680]">{r.majorName}</span></div> },
    { header: "Loại Hình", accessor: (r) => <span className="px-2 py-0.5 rounded bg-[#dde1ff] text-[#0d1b4e] font-bold text-[10px]">{r.type}</span> },
    { header: "Số Tín Chỉ", accessor: (r) => <span className="font-bold">{r.credits} Tín chỉ</span> },
  ];

  return (
    <div className="space-y-6 pt-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-[26px] text-[#0d1b4e]">Quản Lý Chương Trình Đào Tạo</h1>
          <p className="text-[13px] text-[#45464f]">Quản lý khung chương trình, số tín chỉ và loại hình đào tạo UTC.</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-1.5 bg-[#fdb712] text-[#0d1b4e] px-4 py-2.5 rounded-xl font-bold text-[13px]">
          <span className="material-symbols-outlined text-[18px]">add_circle</span> Thêm CTĐT Mới
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl border border-[#e9e2d5] shadow-sm">
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Tìm kiếm chương trình..." className="w-full max-w-md px-3 py-1.5 bg-[#faf3e6] border border-[#c6c5d0] rounded-lg text-[13px]" />
      </div>

      <DataTable columns={columns} data={filtered} onEdit={openEdit} onDelete={(row) => setDeletingRow(row)} />

      <ModalForm isOpen={isModalOpen} title={editingRow ? "Sửa CTĐT" : "Thêm CTĐT Mới"} onClose={() => setIsModalOpen(false)} onSubmit={handleSave}>
        <div className="space-y-4">
          <div>
            <label className="block text-[12px] font-bold mb-1">Tên Chương Trình Đào Tạo:</label>
            <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3 py-2 bg-[#faf3e6] border border-[#c6c5d0] rounded-lg text-[13px]" />
          </div>
          <div>
            <label className="block text-[12px] font-bold mb-1">Thuộc Ngành Học:</label>
            <input type="text" required value={majorName} onChange={(e) => setMajorName(e.target.value)} className="w-full px-3 py-2 bg-[#faf3e6] border border-[#c6c5d0] rounded-lg text-[13px]" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[12px] font-bold mb-1">Loại Hình:</label>
              <select value={type} onChange={(e) => setType(e.target.value as any)} className="w-full px-3 py-2 bg-[#faf3e6] border border-[#c6c5d0] rounded-lg text-[13px]">
                <option value="CHUẨN">CHUẨN</option>
                <option value="CHẤT LƯỢNG CAO">CHẤT LƯỢNG CAO</option>
                <option value="TIÊN TIẾN">TIÊN TIẾN</option>
              </select>
            </div>
            <div>
              <label className="block text-[12px] font-bold mb-1">Tín Chỉ:</label>
              <input type="number" value={credits} onChange={(e) => setCredits(Number(e.target.value))} className="w-full px-3 py-2 bg-[#faf3e6] border border-[#c6c5d0] rounded-lg text-[13px]" />
            </div>
          </div>
        </div>
      </ModalForm>

      <ConfirmDialog isOpen={!!deletingRow} title="Xác Nhận Xóa CTĐT" message={`Bạn có chắc chắn muốn xóa chương trình "${deletingRow?.name}"?`} onConfirm={handleDelete} onCancel={() => setDeletingRow(null)} />
    </div>
  );
}

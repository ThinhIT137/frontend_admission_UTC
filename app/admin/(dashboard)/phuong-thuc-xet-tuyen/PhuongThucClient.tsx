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

  const filteredData = initialData.filter((item) =>
    item.ten_phuong_thuc?.toLowerCase().includes(search.toLowerCase()) ||
    item.ma_phuong_thuc?.toLowerCase().includes(search.toLowerCase())
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
    if (!methodCode.trim() || !name.trim()) {
      toast.error("Vui lòng điền đủ mã và tên phương thức!");
      return;
    }
    try {
      if (editingRow) {
        await updatePhuongThucXetTuyenAction(editingRow.ma_phuong_thuc, {
          ten_phuong_thuc: name.trim(),
        });
        toast.success("Cập nhật phương thức thành công!");
      } else {
        await createPhuongThucXetTuyenAction({
          ma_phuong_thuc: methodCode.trim(),
          ten_phuong_thuc: name.trim(),
        });
        toast.success("Thêm mới phương thức thành công!");
      }
      setIsModalOpen(false);
    } catch (err: any) {
      toast.error(err.message || "Có lỗi xảy ra khi lưu phương thức");
    }
  };

  const handleDelete = async () => {
    if (!deletingRow) return;
    try {
      await deletePhuongThucXetTuyenAction(deletingRow.ma_phuong_thuc);
      toast.success("Xóa phương thức thành công!");
      setDeletingRow(null);
    } catch (err: any) {
      toast.error(err.message || "Có lỗi xảy ra khi xóa phương thức");
    }
  };

  const getMethodCategory = (code: string, name: string) => {
    const text = (code + " " + name).toLowerCase();
    if (text.includes("thpt") || text.includes("100") || text.includes("tốt nghiệp")) {
      return { tag: "Điểm thi THPT", bg: "bg-blue-50 text-blue-800 border-blue-200" };
    }
    if (text.includes("học bạ") || text.includes("200")) {
      return { tag: "Học bạ THPT", bg: "bg-amber-50 text-amber-800 border-amber-200" };
    }
    if (text.includes("đgnl") || text.includes("đgtd") || text.includes("402")) {
      return { tag: "ĐGNL / ĐGTD", bg: "bg-purple-50 text-purple-800 border-purple-200" };
    }
    if (text.includes("kết hợp") || text.includes("chứng chỉ") || text.includes("ielts")) {
      return { tag: "Xét tuyển kết hợp", bg: "bg-emerald-50 text-emerald-800 border-emerald-200" };
    }
    if (text.includes("thẳng") || text.includes("301")) {
      return { tag: "Tuyển thẳng Bộ GD&ĐT", bg: "bg-rose-50 text-rose-800 border-rose-200" };
    }
    return { tag: "Xét tuyển chính thức", bg: "bg-[#faf3e6] text-[#0d1b4e] border-[#c6c5d0]" };
  };

  const columns: Column<any>[] = [
    { 
      header: "Mã Phương Thức", 
      accessor: (r) => (
        <span className="font-stamp font-black text-[13px] text-[#0d1b4e] bg-[#faf3e6] px-3 py-1.5 rounded-lg border border-[#c6c5d0] inline-block shadow-sm">
          {r.ma_phuong_thuc}
        </span>
      ),
      className: "w-[160px]"
    },
    { 
      header: "Tên Phương Thức Xét Tuyển", 
      accessor: (r) => (
        <div className="py-1">
          <span className="font-bold block text-[15px] text-[#1e1b14] leading-snug">
            {r.ten_phuong_thuc}
          </span>
        </div>
      ),
      className: "w-full"
    },
    { 
      header: "Nhóm / Căn Cứ Xét Tuyển", 
      accessor: (r) => {
        const cat = getMethodCategory(r.ma_phuong_thuc, r.ten_phuong_thuc);
        return (
          <span className={`px-2.5 py-1 rounded-md font-bold text-[11px] border whitespace-nowrap inline-flex items-center gap-1 ${cat.bg}`}>
            <span className="material-symbols-outlined text-[14px]">school</span>
            {cat.tag}
          </span>
        );
      },
      className: "w-[200px]"
    },
  ];

  return (
    <div className="space-y-6 pt-2">
      {/* Header section with clean, enlarged typography */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-black text-[28px] text-[#0d1b4e] tracking-tight">
            Quản Lý Phương Thức Xét Tuyển
          </h1>
          <p className="text-[14px] text-[#45464f] mt-0.5">
            Danh mục các phương thức tuyển sinh Đại học chính quy Trường Đại học Giao thông Vận tải.
          </p>
        </div>
        <button 
          onClick={openCreate} 
          className="flex items-center gap-2 bg-[#fdb712] hover:bg-[#e2a20a] text-[#0d1b4e] px-5 py-2.5 rounded-xl font-black text-[14px] shadow-sm transition-all hover:scale-[1.02] active:scale-95 whitespace-nowrap"
        >
          <span className="material-symbols-outlined text-[20px]">add_circle</span>
          Thêm Phương Thức Mới
        </button>
      </div>

      {/* Search Bar */}
      <div className="flex items-center">
        <div className="relative w-full max-w-md">
          <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#767680] text-[20px]">
            search
          </span>
          <input
            type="text"
            placeholder="Tìm theo mã hoặc tên phương thức xét tuyển..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#c6c5d0] rounded-xl text-[14px] font-medium outline-none focus:border-[#0d1b4e] focus:ring-2 focus:ring-[#0d1b4e]/20 transition-all shadow-sm"
          />
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-[#e9e2d5] overflow-hidden">
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
          {!editingRow && (
            <div>
              <label className="block text-[12px] font-bold mb-1.5 text-[#45464f] uppercase tracking-wider">
                Mã Phương Thức <span className="text-red-500">*</span> (VD: PT100, PT200, PT402):
              </label>
              <input 
                type="text" 
                required 
                placeholder="VD: PT100" 
                value={methodCode} 
                onChange={(e) => setMethodCode(e.target.value)} 
                className="w-full px-4 py-2.5 bg-[#faf3e6] border border-[#c6c5d0] rounded-xl text-[14px] font-bold text-[#0d1b4e] focus:border-[#0d1b4e] outline-none" 
              />
            </div>
          )}
          <div>
            <label className="block text-[12px] font-bold mb-1.5 text-[#45464f] uppercase tracking-wider">
              Tên Phương Thức Xét Tuyển <span className="text-red-500">*</span>:
            </label>
            <input 
              type="text" 
              required 
              placeholder="VD: Xét kết quả thi tốt nghiệp THPT năm 2026" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              className="w-full px-4 py-2.5 bg-[#faf3e6] border border-[#c6c5d0] rounded-xl text-[14px] font-medium text-[#1e1b14] focus:border-[#0d1b4e] outline-none" 
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

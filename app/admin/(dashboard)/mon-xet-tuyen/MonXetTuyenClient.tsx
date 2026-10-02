"use client";

import { useState, useMemo } from "react";
import Fuse from "fuse.js";
import { DataTable, Column } from "@/components/admin/DataTable";
import { ModalForm } from "@/components/admin/ModalForm";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { createDanhMucMonAction, updateDanhMucMonAction, deleteDanhMucMonAction } from "@/actions/danh_muc_mon.action";
import { toast } from "sonner";

export default function MonXetTuyenClient({ initialData }: { initialData: any[] }) {
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<any | null>(null);
  const [deletingRow, setDeletingRow] = useState<any | null>(null);

  // Form State
  const [code, setCode] = useState("");
  const [name, setName] = useState("");

  // Phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 10;

  const fuse = useMemo(() => {
    return new Fuse(initialData, {
      keys: ["ma_mon", "ten_mon"],
      threshold: 0.3,
    });
  }, [initialData]);

  const filteredData = useMemo(() => {
    if (!search.trim()) return initialData;
    const results = fuse.search(search);
    return results.map((result) => result.item);
  }, [search, initialData, fuse]);

  useMemo(() => {
    setCurrentPage(1);
  }, [search]);

  const totalPages = Math.ceil(filteredData.length / PAGE_SIZE);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredData.slice(start, start + PAGE_SIZE);
  }, [filteredData, currentPage]);

  const openCreate = () => {
    setEditingRow(null);
    setCode("");
    setName("");
    setIsModalOpen(true);
  };

  const openEdit = (row: any) => {
    setEditingRow(row);
    setCode(row.ma_mon);
    setName(row.ten_mon);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || !name) {
      toast.error("Vui lòng điền đầy đủ thông tin!");
      return;
    }

    try {
      if (editingRow) {
        await updateDanhMucMonAction(code, name);
        toast.success("Cập nhật môn học thành công!");
      } else {
        await createDanhMucMonAction(code, name);
        toast.success("Thêm mới môn học thành công!");
      }
      setIsModalOpen(false);
    } catch (error: any) {
      toast.error(error.message || "Có lỗi xảy ra!");
    }
  };

  const confirmDelete = async () => {
    if (!deletingRow) return;
    try {
      await deleteDanhMucMonAction(deletingRow.ma_mon);
      toast.success("Xóa môn học thành công!");
      setDeletingRow(null);
    } catch (error: any) {
      toast.error(error.message || "Có lỗi xảy ra!");
    }
  };

  const columns: Column<any>[] = [
    {
      header: "STT",
      accessor: (_, idx) => (
        <span className="font-bold text-[#767680] text-[13px]">
          {idx + 1 + (currentPage - 1) * PAGE_SIZE}
        </span>
      ),
      className: "w-[60px] text-center",
    },
    { 
      header: "Mã Môn", 
      accessor: (r) => (
        <span className="font-stamp font-bold text-[#0284c7] bg-[#e0f2fe] px-2.5 py-1 rounded border border-[#0d1b4e]">
          {r.ma_mon}
        </span>
      ),
      className: "w-[120px]"
    },
    { 
      header: "Tên Môn Học", 
      accessor: (r) => (
        <span className="font-bold text-[#1e1b14]">
          {r.ten_mon}
        </span>
      ) 
    },
  ];

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-[24px] font-bold text-[#0d1b4e]">Quản Lý Môn Xét Tuyển</h1>
          <p className="text-[13px] text-[#45464f] mt-1">Quản lý danh mục các môn học tham gia xét tuyển (Toán, Lý, Hóa...).</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-1.5 bg-[#fdb712] text-[#0d1b4e] px-4 py-2.5 rounded-xl font-bold text-[13px] shadow-sm transition-colors hover:bg-[#e5a610]">
          <span className="material-symbols-outlined text-[18px]">add_circle</span> Thêm Môn Học
        </button>
      </div>

      <div className="flex items-center justify-between mb-4">
        <div className="relative w-80">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#767680] text-[18px]">
            search
          </span>
          <input
            type="text"
            placeholder="Tìm theo mã hoặc tên môn..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-[#c6c5d0] rounded-lg text-[13px] outline-none focus:border-[#0d1b4e] focus:ring-1 focus:ring-[#0d1b4e] transition-all"
          />
        </div>
        <span className="text-[12px] font-bold text-[#45464f]">
          Tổng số: {filteredData.length} môn
        </span>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-[#e9e2d5] overflow-hidden">
        <DataTable columns={columns} data={paginatedData} onEdit={openEdit} onDelete={(row) => setDeletingRow(row)} />

        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-[#e9e2d5] flex items-center justify-between bg-white">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="w-8 h-8 rounded-lg border border-[#c6c5d0] flex items-center justify-center text-[#45464f] hover:bg-[#faf3e6] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">chevron_left</span>
            </button>
            
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }).map((_, i) => {
                const page = i + 1;
                if (page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1) {
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-8 h-8 rounded-lg text-[13px] font-bold transition-colors ${
                        currentPage === page ? "bg-[#0d1b4e] text-white" : "text-[#45464f] hover:bg-[#faf3e6]"
                      }`}
                    >
                      {page}
                    </button>
                  );
                } else if (page === currentPage - 2 || page === currentPage + 2) {
                  return <span key={page} className="px-1 text-[#767680]">...</span>;
                }
                return null;
              })}
            </div>

            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="w-8 h-8 rounded-lg border border-[#c6c5d0] flex items-center justify-center text-[#45464f] hover:bg-[#faf3e6] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">chevron_right</span>
            </button>
          </div>
        )}
      </div>

      <ModalForm isOpen={isModalOpen} title={editingRow ? "Sửa Môn Học" : "Thêm Môn Học Mới"} onClose={() => setIsModalOpen(false)} onSubmit={handleSave}>
        <div className="space-y-4">
          <div>
            <label className="block text-[12px] font-bold mb-1">Mã Môn (Vd: TOAN, NGU_VAN):</label>
            <input 
              type="text" 
              required 
              value={code} 
              onChange={(e) => setCode(e.target.value.toUpperCase())} 
              disabled={!!editingRow}
              className={`w-full px-3 py-2 bg-[#faf3e6] border border-[#c6c5d0] rounded-lg text-[13px] font-bold uppercase ${editingRow ? 'opacity-70 cursor-not-allowed' : ''}`} 
            />
          </div>
          <div>
            <label className="block text-[12px] font-bold mb-1">Tên Môn Học:</label>
            <input 
              type="text" 
              required 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              className="w-full px-3 py-2 bg-[#faf3e6] border border-[#c6c5d0] rounded-lg text-[13px] outline-none" 
            />
          </div>
        </div>
      </ModalForm>

      <ConfirmDialog isOpen={!!deletingRow} title="Xác Nhận Xóa Môn Học" message={`Bạn có chắc muốn xóa môn ${deletingRow?.ten_mon}?`} onConfirm={confirmDelete} onCancel={() => setDeletingRow(null)} />
    </div>
  );
}

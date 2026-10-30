"use client";
import { AdminIcon } from "@/components/admin/AdminIcon";
import { publicError } from "@/libs/client-error";

import { useState, useMemo } from "react";
import Fuse from "fuse.js";
import { DataTable, Column } from "@/components/admin/DataTable";
import { ModalForm } from "@/components/admin/ModalForm";
import { createKhoiNganh, updateKhoiNganh, deleteKhoiNganh } from "@/actions/khoi_nganh.action";
import { toast } from "@/libs/admin-toast";

import Link from "next/link";

export default function KhoiNganhClient({ initialData }: { initialData: any[] }) {
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<any | null>(null);

  // Form State
  const [code, setCode] = useState("");
  const [name, setName] = useState("");

  // Phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 10;

  // 1. Tạo bộ máy tìm kiếm Fuse.js
  const fuse = useMemo(() => {
    return new Fuse(initialData, {
      keys: ["ma_khoi_nganh", "ten_khoi_nganh"],
      threshold: 0.3,
    });
  }, [initialData]);

  // 2. Lấy data để render
  const filteredData = useMemo(() => {
    if (!search.trim()) return initialData;
    const results = fuse.search(search);
    return results.map((result) => result.item);
  }, [search, initialData, fuse]);

  // reset page khi search
  useMemo(() => {
    setCurrentPage(1);
  }, [search]);

  // Cắt data theo trang
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
    setCode(row.ma_khoi_nganh);
    setName(row.ten_khoi_nganh);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingRow) {
        const res = await updateKhoiNganh(editingRow.ma_khoi_nganh, code, name);
        if (res.error) throw new Error(res.error);
        toast.success("Cập nhật thành công!");
      } else {
        const res = await createKhoiNganh(code, name);
        if (res.error) throw new Error(res.error);
        toast.success("Thêm mới thành công!");
      }
      setIsModalOpen(false);
    } catch (error: any) {
      toast.error(publicError(error.message || "Có lỗi xảy ra!"));
    }
  };

  // State cho Modal xác nhận xóa
  const [deletingRow, setDeletingRow] = useState<any | null>(null);

  const confirmDelete = async () => {
    if (!deletingRow) return;
    try {
      const res = await deleteKhoiNganh(deletingRow.ma_khoi_nganh);
      if (res.error) throw new Error(res.error);
      toast.success("Xóa thành công!");
      setDeletingRow(null);
    } catch (error: any) {
      toast.error(publicError(error.message || "Có lỗi xảy ra!"));
    }
  };

  const columns: Column<any>[] = [
    {
      header: "STT",
      accessor: (_, idx) => (
        <span className="font-bold text-[#64748b] text-[13px]">
          {idx + 1 + (currentPage - 1) * PAGE_SIZE}
        </span>
      ),
      className: "w-[60px] text-center",
    },
    {
      header: "Mã Khoa/Viện",
      accessor: (r) => (
        <span className="font-stamp font-bold text-[#192b59] bg-[#f1f5f9] px-2.5 py-1 rounded border border-[#cbd5e1]">
          {r.ma_khoi_nganh}
        </span>
      ),
      className: "w-[120px]",
    },
    {
      header: "Tên Khoa/Viện Quản Lý",
      accessor: (r) => (
        <Link
          href={`/admin/quan-ly-nganh-hoc?faculty=${r.ma_khoi_nganh}`}
          className="font-bold text-[#192b59] hover:text-[#0284c7] hover:underline text-[15px] inline-flex items-center gap-1.5 group"
          title="Nhấp để xem danh sách các ngành học thuộc khoa/viện này"
        >
          <span>{r.ten_khoi_nganh}</span>
          <AdminIcon name="arrow_forward" className="text-[16px] opacity-0 group-hover:opacity-100 transition-opacity text-[#0284c7]" />
        </Link>
      ),
      className: "w-full",
    },
    {
      header: "Số Ngành Thuộc",
      accessor: (r) => (
        <Link
          href={`/admin/quan-ly-nganh-hoc?faculty=${r.ma_khoi_nganh}`}
          className="font-bold text-[#0284c7] bg-[#e0f2fe] hover:bg-[#bae6fd] px-3 py-1 rounded-full whitespace-nowrap inline-flex items-center gap-1 shadow-xs transition-colors text-[12px]"
          title="Xem chi tiết các ngành thuộc khoa này"
        >
          <AdminIcon name="school" className="text-[14px]" />
          {r._count?.nganh_hoc || 0} Ngành
        </Link>
      ),
      className: "w-[150px] text-center",
    },
  ];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[28px] font-bold text-[#192b59] font-display">
            Quản Lý Danh Mục Khoa / Viện
          </h1>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-[#192b59] hover:bg-[#243c78] text-white px-4 py-2.5 rounded-lg font-bold text-[13px] transition-colors shadow-sm"
        >
          <AdminIcon name="add" className="text-[18px]" />
          Thêm Khoa / Viện Mới
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between mb-4">
        <div className="relative w-80">
          <AdminIcon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748b] text-[18px]" />
          <input
            type="text"
            placeholder="Tìm theo tên hoặc mã khoa..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-[#cbd5e1] rounded-lg text-[13px] outline-none focus:border-[#192b59] focus:ring-1 focus:ring-[#192b59] transition-all"
          />
        </div>
        <span className="text-[12px] font-bold text-[#475569]">
          Tổng số: {filteredData.length} khoa/viện
        </span>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-[#e2e8f0] overflow-hidden">
        {/* Table */}
        <DataTable
          columns={columns}
          data={paginatedData}
          onEdit={openEdit}
          onDelete={(row) => setDeletingRow(row)}
        />

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-[#e2e8f0] flex items-center justify-between bg-white">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="w-8 h-8 rounded-lg border border-[#cbd5e1] flex items-center justify-center text-[#475569] hover:bg-[#f8fafc] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <AdminIcon name="chevron_left" className="text-[18px]" />
            </button>
            
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }).map((_, i) => {
                const page = i + 1;
                if (
                  page === 1 || 
                  page === totalPages || 
                  Math.abs(page - currentPage) <= 1
                ) {
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-8 h-8 rounded-lg text-[13px] font-bold transition-colors ${
                        currentPage === page
                          ? "bg-[#192b59] text-white"
                          : "text-[#475569] hover:bg-[#f8fafc]"
                      }`}
                    >
                      {page}
                    </button>
                  );
                } else if (
                  page === currentPage - 2 ||
                  page === currentPage + 2
                ) {
                  return <span key={page} className="px-1 text-[#64748b]">...</span>;
                }
                return null;
              })}
            </div>

            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="w-8 h-8 rounded-lg border border-[#cbd5e1] flex items-center justify-center text-[#475569] hover:bg-[#f8fafc] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <AdminIcon name="chevron_right" className="text-[18px]" />
            </button>
          </div>
        )}
      </div>

      {/* Modal Form */}
      <ModalForm
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingRow ? "Chỉnh Sửa Khoa / Viện" : "Thêm Khoa / Viện Mới"}
        onSubmit={handleSave}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-[12px] font-bold text-[#1e293b] mb-1">
              Mã Khoa/Viện:
            </label>
            <input
              type="text"
              required
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Vd: CNTT"
              className="w-full px-3 py-2 bg-[#f8fafc] border border-[#cbd5e1] rounded-lg text-[13px] font-bold outline-none uppercase"
            />
          </div>

          <div>
            <label className="block text-[12px] font-bold text-[#1e293b] mb-1">
              Tên Khoa/Viện:
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Vd: Khoa Công nghệ Thông tin"
              className="w-full px-3 py-2 bg-[#f8fafc] border border-[#cbd5e1] rounded-lg text-[13px] font-bold outline-none"
            />
          </div>
        </div>
      </ModalForm>

      {/* Delete Confirmation Modal */}
      <ModalForm
        isOpen={!!deletingRow}
        onClose={() => setDeletingRow(null)}
        title="Xác Nhận Xóa"
        onSubmit={(e) => {
          e.preventDefault();
          return confirmDelete();
        }}
        submitText="Xóa"
      >
        <p className="text-[14px] text-[#1e293b]">
          Bạn có chắc chắn muốn xóa khoa/viện{" "}
          <span className="font-bold text-[#ba1a1a]">{deletingRow?.ten_khoi_nganh}</span> không?
        </p>
        <p className="text-[12px] text-[#64748b] mt-2 bg-[#f8fafc] p-3 rounded-lg border border-[#e2e8f0]">
          Lưu ý: Nếu có ngành học nào đang trực thuộc khoa/viện này, chúng sẽ bị chuyển về trạng thái &quot;Chưa xác định&quot; (SetNull).
        </p>
      </ModalForm>
    </div>
  );
}

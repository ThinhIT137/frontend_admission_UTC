"use client";

import { useState, useMemo } from "react";
import Fuse from "fuse.js";
import { DataTable, Column } from "@/components/admin/DataTable";
import { ModalForm } from "@/components/admin/ModalForm";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { createNganhHoc, updateNganhHoc, deleteNganhHoc } from "@/actions/nganh_hoc.action";
import { toast } from "sonner";

export default function NganhHocClient({ 
  initialData, 
  faculties 
}: { 
  initialData: any[],
  faculties: { ma_khoi_nganh: string; ten_khoi_nganh: string }[]
}) {
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<any | null>(null);
  const [deletingRow, setDeletingRow] = useState<any | null>(null);

  // Form State
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [faculty, setFaculty] = useState("");
  const [facultyName, setFacultyName] = useState("");
  const [khoiKienThuc, setKhoiKienThuc] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 10;

  // 1. Tạo bộ máy tìm kiếm Fuse.js
  const fuse = useMemo(() => {
    return new Fuse(initialData, {
      keys: ["ma_nganh", "ten_nganh"], // Tìm trên mã ngành và tên ngành
      threshold: 0.3, // Độ mờ: 0 là chính xác tuyệt đối, 1 là khớp lỏng lẻo
      ignoreLocation: true, // Tìm ở bất cứ đâu trong chuỗi
    });
  }, [initialData]);

  // 2. Lấy data để render
  const filteredData = useMemo(() => {
    if (!search.trim()) return initialData;
    // Bỏ vào máy xay Fuse
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
    const defaultFaculty = faculties[0];
    setFaculty(defaultFaculty?.ma_khoi_nganh || "");
    setFacultyName(defaultFaculty?.ten_khoi_nganh || "");
    setKhoiKienThuc("");
    setIsModalOpen(true);
  };

  const openEdit = (row: any) => {
    setEditingRow(row);
    setCode(row.ma_nganh);
    setName(row.ten_nganh);
    setFaculty(row.ma_khoi_nganh || "");
    const selected = faculties.find((f) => f.ma_khoi_nganh === row.ma_khoi_nganh);
    setFacultyName(selected?.ten_khoi_nganh || "");
    setKhoiKienThuc(row.khoi_kien_thuc || "");
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!faculty) {
      toast.error("Vui lòng chọn Khoa / Viện từ danh sách!");
      return;
    }
    try {
      if (editingRow) {
        await updateNganhHoc(editingRow.ma_nganh, code, name, faculty, khoiKienThuc);
        toast.success("Cập nhật ngành học thành công!");
      } else {
        await createNganhHoc(code, name, faculty, khoiKienThuc);
        toast.success("Thêm ngành học thành công!");
      }
      setIsModalOpen(false);
    } catch (err: any) {
      toast.error(err.message || "Lỗi lưu ngành học");
    }
  };

  const handleDelete = async () => {
    if (!deletingRow) return;
    try {
      await deleteNganhHoc(deletingRow.ma_nganh);
      toast.success("Xóa ngành học thành công!");
      setDeletingRow(null);
    } catch (err: any) {
      toast.error(err.message || "Lỗi xóa ngành học");
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
      header: "Mã Ngành",
      accessor: (r) => (
        <span className="font-stamp font-bold text-[#0d1b4e] bg-[#f4ede0] px-2 py-0.5 rounded border border-[#c6c5d0]">
          {r.ma_nganh}
        </span>
      ),
      className: "w-[120px]",
    },
    {
      header: "Tên Ngành Đào Tạo",
      accessor: (r) => (
        <div>
          <span className="font-bold text-[#1e1b14] text-[14px] block">{r.ten_nganh}</span>
          <span className="text-[12px] text-[#767680]">{r.khoi_nganh?.ten_khoi_nganh || "Khoa/Viện chưa xác định"}</span>
        </div>
      ),
      className: "w-full",
    },
    {
      header: "Số CTĐT",
      accessor: (r) => (
        <span className="font-bold text-[#0284c7] bg-[#e0f2fe] px-2 py-0.5 rounded-full whitespace-nowrap">
          {r.chuong_trinh?.length || 0} CTĐT
        </span>
      ),
      className: "w-[100px] text-center",
    },
    {
      header: "Trạng Thái",
      accessor: () => (
        <span className="px-2 py-0.5 rounded bg-[#86efac] text-[#111827] font-stamp text-[10px] font-bold">
          SUPABASE
        </span>
      ),
      className: "w-[120px] text-center",
    },
  ];

  return (
    <div className="space-y-6 pt-4">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-[26px] text-[#0d1b4e]">
            Quản Lý Danh Mục Ngành Học
          </h1>
        </div>

        <button
          onClick={openCreate}
          className="flex items-center gap-1.5 bg-[#fdb712] text-[#0d1b4e] hover:bg-[#e2a20a] px-4 py-2.5 rounded-xl font-bold text-[13px] shadow transition-all shrink-0"
        >
          <span className="material-symbols-outlined text-[18px]">add_circle</span>
          Thêm Ngành Học Mới
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-[#e9e2d5] shadow-sm flex items-center justify-between">
        <div className="relative w-full max-w-md">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#767680] text-[18px]">
            search
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo mã ngành hoặc tên ngành..."
            className="w-full pl-9 pr-4 py-1.5 rounded-lg bg-[#faf3e6] text-[#1e1b14] text-[13px] outline-none border border-[#c6c5d0]"
          />
        </div>
        <span className="text-[12px] font-bold text-[#45464f]">
          Tổng số: {filteredData.length} ngành
        </span>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-[#e9e2d5] overflow-hidden">
        {/* Table */}
        <DataTable
          columns={columns}
          data={paginatedData}
          onEdit={openEdit}
          onDelete={(row) => setDeletingRow(row)}
        />

        {/* Pagination Controls */}
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
                // Chỉ hiển thị tối đa 5 trang gần nhất để tránh quá dài
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
                          ? "bg-[#0d1b4e] text-white"
                          : "text-[#45464f] hover:bg-[#faf3e6]"
                      }`}
                    >
                      {page}
                    </button>
                  );
                } else if (
                  page === currentPage - 2 ||
                  page === currentPage + 2
                ) {
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

      {/* Modal Form */}
      <ModalForm
        isOpen={isModalOpen}
        title={editingRow ? "Chỉnh Sửa Ngành Học" : "Thêm Ngành Học Mới"}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSave}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-[12px] font-bold text-[#1e1b14] mb-1">
              Mã Ngành Học:
            </label>
            <input
              type="text"
              required
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Vd: 7480201"
              className="w-full px-3 py-2 bg-[#faf3e6] border border-[#c6c5d0] rounded-lg text-[13px] font-bold outline-none"
            />
          </div>

          <div>
            <label className="block text-[12px] font-bold text-[#1e1b14] mb-1">
              Tên Ngành Đào Tạo:
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Vd: Công nghệ Thông tin"
              className="w-full px-3 py-2 bg-[#faf3e6] border border-[#c6c5d0] rounded-lg text-[13px] font-bold outline-none"
            />
          </div>

          <div className="relative">
            <label className="block text-[12px] font-bold text-[#1e1b14] mb-1">
              Khoa / Viện Quản Lý:
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={facultyName}
                onFocus={() => setIsDropdownOpen(true)}
                onBlur={() => setTimeout(() => setIsDropdownOpen(false), 150)}
                onChange={(e) => {
                  const val = e.target.value;
                  setFacultyName(val);
                  setIsDropdownOpen(true);
                  if (!val) setFaculty("");
                }}
                placeholder="Gõ để tìm kiếm hoặc chọn..."
                className={`w-full pl-3 pr-10 py-2 bg-[#faf3e6] border rounded-lg text-[13px] font-bold outline-none transition-colors cursor-text ${
                  !faculty && facultyName ? "border-red-500 focus:border-red-500" : "border-[#c6c5d0] focus:border-[#0d1b4e]"
                }`}
              />
              <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-[#767680] pointer-events-none">
                arrow_drop_down
              </span>
            </div>
            
            {/* Custom Dropdown */}
            {isDropdownOpen && (
              <ul className="absolute z-[100] w-full mt-1 bg-white border border-[#c6c5d0] rounded-lg shadow-lg max-h-48 overflow-y-auto divide-y divide-[#e9e2d5]">
                {faculties.filter(f => f.ten_khoi_nganh.toLowerCase().includes(facultyName.toLowerCase())).length > 0 ? (
                  faculties
                    .filter(f => f.ten_khoi_nganh.toLowerCase().includes(facultyName.toLowerCase()))
                    .map((f) => (
                      <li
                        key={f.ma_khoi_nganh}
                        onMouseDown={() => {
                          setFaculty(f.ma_khoi_nganh);
                          setFacultyName(f.ten_khoi_nganh);
                          setIsDropdownOpen(false);
                        }}
                        className={`px-3 py-2 text-[13px] font-medium cursor-pointer transition-colors ${
                          faculty === f.ma_khoi_nganh ? "bg-[#fdb712] text-[#0d1b4e] font-bold" : "text-[#1e1b14] hover:bg-[#faf3e6]"
                        }`}
                      >
                        {f.ten_khoi_nganh}
                      </li>
                    ))
                ) : (
                  <li className="px-3 py-2 text-[13px] text-[#767680] italic text-center">
                    Không tìm thấy kết quả phù hợp
                  </li>
                )}
              </ul>
            )}

            {!faculty && facultyName && (
              <span className="text-[11px] text-red-500 mt-1 block">
                * Khoa/Viện không tồn tại. Vui lòng chọn từ danh sách.
              </span>
            )}
          </div>

          <div>
            <label className="block text-[12px] font-bold text-[#1e1b14] mb-1">
              Khối Kiến Thức (Tuỳ chọn):
            </label>
            <input
              type="text"
              value={khoiKienThuc}
              onChange={(e) => setKhoiKienThuc(e.target.value)}
              placeholder="Vd: Công nghệ Thông tin"
              className="w-full px-3 py-2 bg-[#faf3e6] border border-[#c6c5d0] rounded-lg text-[13px] font-bold outline-none"
            />
          </div>
        </div>
      </ModalForm>

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={!!deletingRow}
        title="Xác Nhận Xóa Ngành Học"
        message={`Bạn có chắc chắn muốn xóa ngành "${deletingRow?.ten_nganh}" (${deletingRow?.ma_nganh}) khỏi cơ sở dữ liệu Supabase?`}
        onConfirm={handleDelete}
        onCancel={() => setDeletingRow(null)}
      />
    </div>
  );
}

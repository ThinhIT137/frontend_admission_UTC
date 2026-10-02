"use client";

import { useState, useMemo } from "react";
import Fuse from "fuse.js";
import { DataTable, Column } from "@/components/admin/DataTable";
import { ModalForm } from "@/components/admin/ModalForm";
import { createCTDTAction, updateCTDTAction, deleteCTDTAction } from "@/actions/chuong_trinh_dao_tao.action";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";

const CHUAN_DAU_RA_LABELS: Record<string, string> = {
  CU_NHAN: "Cử nhân",
  KY_SU: "Kỹ sư",
  THAC_SI: "Thạc sĩ",
  TIEN_SI: "Tiến sĩ",
  KHAC: "Khác"
};

const CHUAN_DAU_RA_OPTIONS = Object.keys(CHUAN_DAU_RA_LABELS).map(key => ({
  value: key,
  label: CHUAN_DAU_RA_LABELS[key]
}));

export default function CTDTClient({ initialData, majors }: { initialData: any[]; majors: any[] }) {
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<any | null>(null);
  const [deletingRow, setDeletingRow] = useState<any | null>(null);

  // Form State
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [maNganh, setMaNganh] = useState("");
  const [maNganhName, setMaNganhName] = useState("");
  const [deCuong, setDeCuong] = useState("");
  const [moTaNgan, setMoTaNgan] = useState("");
  const [chuanDauRa, setChuanDauRa] = useState<string[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 10;

  // 1. Máy tìm kiếm Fuse.js
  const fuse = useMemo(() => {
    return new Fuse(initialData, {
      keys: ["ten_chuong_trinh", "ma_chuong_trinh", "nganh.ten_nganh"],
      threshold: 0.3,
    });
  }, [initialData]);

  // 2. Data render
  const filteredData = useMemo(() => {
    if (!search.trim()) return initialData;
    const results = fuse.search(search);
    return results.map((result) => result.item);
  }, [search, initialData, fuse]);

  useMemo(() => setCurrentPage(1), [search]);

  const totalPages = Math.ceil(filteredData.length / PAGE_SIZE);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredData.slice(start, start + PAGE_SIZE);
  }, [filteredData, currentPage]);

  // Kéo lên đầu page khi đổi trang
  useMemo(() => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [currentPage]);

  const openCreate = () => {
    setEditingRow(null);
    setCode("");
    setName("");
    setDeCuong("");
    setMoTaNgan("");
    setChuanDauRa([]);
    const defaultMajor = majors[0];
    setMaNganh(defaultMajor?.ma_nganh || "");
    setMaNganhName(defaultMajor?.ten_nganh || "");
    setIsModalOpen(true);
  };

  const openEdit = (row: any) => {
    setEditingRow(row);
    setCode(row.ma_chuong_trinh);
    setName(row.ten_chuong_trinh);
    setDeCuong(row.de_cuong || "");
    setMoTaNgan(row.mo_ta_ngan || "");
    setChuanDauRa(row.chuan_dau_ra || []);
    setMaNganh(row.ma_nganh);
    setMaNganhName(row.nganh?.ten_nganh || "");
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!maNganh) {
      toast.error("Vui lòng chọn ngành học hợp lệ từ danh sách!");
      return;
    }
    try {
      if (editingRow) {
        await updateCTDTAction(editingRow.ma_chuong_trinh, maNganh, name, deCuong, chuanDauRa as any, moTaNgan);
        toast.success("Cập nhật CTĐT thành công!");
      } else {
        if (!code.trim()) {
          toast.error("Vui lòng nhập mã CTĐT!");
          return;
        }
        await createCTDTAction(code, maNganh, name, deCuong, chuanDauRa as any, moTaNgan);
        toast.success("Thêm mới CTĐT thành công!");
      }
      setIsModalOpen(false);
    } catch (error: any) {
      toast.error(error.message || "Có lỗi xảy ra!");
    }
  };

  const confirmDelete = async () => {
    if (!deletingRow) return;
    try {
      await deleteCTDTAction(deletingRow.ma_chuong_trinh);
      toast.success("Xóa CTĐT thành công!");
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
      header: "Mã CTĐT",
      accessor: (r) => (
        <span className="font-stamp font-bold text-[#0d1b4e] bg-[#f4ede0] px-2 py-0.5 rounded border border-[#c6c5d0]">
          {r.ma_chuong_trinh}
        </span>
      ),
      className: "w-[120px]",
    },
    {
      header: "Tên Chương Trình",
      accessor: (r) => (
        <div>
          <span className="font-bold text-[#1e1b14] text-[14px] block">{r.ten_chuong_trinh}</span>
          <span className="text-[12px] text-[#767680]">Thuộc: <span className="font-bold">{r.nganh?.ten_nganh || "Không xác định"}</span></span>
        </div>
      ),
      className: "w-full",
    },
  ];

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[24px] font-bold text-[#0d1b4e]">
            Quản Lý Chương Trình Đào Tạo
          </h1>
          <p className="text-[13px] text-[#767680] mt-1">
            Quản lý các chương trình đào tạo thuộc các ngành học
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-[#0d1b4e] hover:bg-[#1a2c6d] text-white px-4 py-2.5 rounded-lg font-bold text-[13px] transition-colors shadow-sm"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          Thêm CTĐT Mới
        </button>
      </div>

      <div className="flex items-center justify-between mb-4">
        <div className="relative w-80">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#767680] text-[18px]">
            search
          </span>
          <input
            type="text"
            placeholder="Tìm CTĐT hoặc mã ngành..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-[#c6c5d0] rounded-lg text-[13px] outline-none focus:border-[#0d1b4e] focus:ring-1 focus:ring-[#0d1b4e] transition-all"
          />
        </div>
        <span className="text-[12px] font-bold text-[#45464f]">
          Tổng số: {filteredData.length} CTĐT
        </span>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-[#e9e2d5] overflow-hidden">
        <DataTable
          columns={columns}
          data={paginatedData}
          onEdit={openEdit}
          onDelete={(row) => setDeletingRow(row)}
        />

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

      <ModalForm
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingRow ? "Chỉnh Sửa CTĐT" : "Thêm CTĐT Mới"}
        onSubmit={handleSave}
      >
        <div className="space-y-4 max-h-[75vh] overflow-y-auto custom-scrollbar p-2">
          <div className="flex gap-4">
            {!editingRow && (
              <div className="flex-1 max-w-[200px]">
                <label className="block text-[11px] font-bold text-[#767680] mb-1 uppercase">
                  Mã CTĐT:
                </label>
                <input
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Vd: 7480201CLC"
                  className="w-full px-3 py-2 bg-[#faf3e6] border border-[#c6c5d0] rounded-lg text-[13px] font-bold outline-none focus:border-[#0d1b4e] focus:ring-1 focus:ring-[#0d1b4e] transition-all"
                />
              </div>
            )}
            <div className="flex-[2]">
              <label className="block text-[11px] font-bold text-[#767680] mb-1 uppercase">
                Tên CTĐT:
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Vd: Kỹ sư Phần mềm Chất lượng cao"
                className="w-full px-3 py-2 bg-[#faf3e6] border border-[#c6c5d0] rounded-lg text-[13px] font-bold outline-none focus:border-[#0d1b4e] focus:ring-1 focus:ring-[#0d1b4e] transition-all"
              />
            </div>
          </div>

          <div className="relative">
            <label className="block text-[12px] font-bold text-[#767680] mb-1 uppercase">
              Trực thuộc Ngành:
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={maNganhName}
                onFocus={() => setIsDropdownOpen(true)}
                onBlur={() => setTimeout(() => setIsDropdownOpen(false), 150)}
                onChange={(e) => {
                  const val = e.target.value;
                  setMaNganhName(val);
                  setIsDropdownOpen(true);
                  if (!val) setMaNganh("");
                }}
                placeholder="Gõ để tìm kiếm..."
                className={`w-full pl-3 pr-10 py-2 bg-[#faf3e6] border rounded-lg text-[13px] font-bold outline-none transition-colors cursor-text ${
                  !maNganh && maNganhName ? "border-red-500 focus:border-red-500" : "border-[#c6c5d0] focus:border-[#0d1b4e]"
                }`}
              />
              <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-[#767680] pointer-events-none">
                arrow_drop_down
              </span>
            </div>
            
            {/* Custom Dropdown */}
            {isDropdownOpen && (
              <ul className="absolute z-[100] w-full mt-1 bg-white border border-[#c6c5d0] rounded-lg shadow-lg max-h-48 overflow-y-auto divide-y divide-[#e9e2d5]">
                {majors.filter(f => f.ten_nganh.toLowerCase().includes(maNganhName.toLowerCase())).length > 0 ? (
                  majors
                    .filter(f => f.ten_nganh.toLowerCase().includes(maNganhName.toLowerCase()))
                    .map((f) => (
                      <li
                        key={f.ma_nganh}
                        onMouseDown={() => {
                          setMaNganh(f.ma_nganh);
                          setMaNganhName(f.ten_nganh);
                          setIsDropdownOpen(false);
                        }}
                        className={`px-3 py-2 text-[13px] font-medium cursor-pointer transition-colors flex flex-col ${
                          maNganh === f.ma_nganh ? "bg-[#fdb712] text-[#0d1b4e]" : "text-[#1e1b14] hover:bg-[#faf3e6]"
                        }`}
                      >
                        <span className="font-bold">{f.ten_nganh}</span>
                        <span className="text-[11px] opacity-80">Mã: {f.ma_nganh}</span>
                      </li>
                    ))
                ) : (
                  <li className="px-3 py-2 text-[13px] text-[#767680] italic text-center">
                    Không tìm thấy kết quả phù hợp
                  </li>
                )}
              </ul>
            )}

            {!maNganh && maNganhName && (
              <span className="text-[11px] text-red-500 mt-1 block">
                * Ngành học không tồn tại. Vui lòng chọn từ danh sách.
              </span>
            )}
          </div>

          <div>
            <label className="block text-[11px] font-bold text-[#767680] mb-1 uppercase">
              Chuẩn Đầu Ra:
            </label>
            <div className="grid grid-cols-4 gap-2 bg-white p-2 border border-[#c6c5d0] rounded-lg">
              {CHUAN_DAU_RA_OPTIONS.map((opt) => (
                <label key={opt.value} className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-3.5 h-3.5 text-[#0d1b4e] rounded focus:ring-[#0d1b4e]"
                    checked={chuanDauRa.includes(opt.value)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setChuanDauRa((prev) => [...prev, opt.value]);
                      } else {
                        setChuanDauRa((prev) => prev.filter((v) => v !== opt.value));
                      }
                    }}
                  />
                  <span className="text-[13px] text-[#1e1b14] font-medium">{opt.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-[11px] font-bold text-[#767680] mb-1 uppercase">
                Mô tả ngắn:
              </label>
              <textarea
                value={moTaNgan}
                onChange={(e) => setMoTaNgan(e.target.value)}
                placeholder="Nhập mô tả ngắn gọn về chương trình..."
                className="w-full px-3 py-2 bg-[#faf3e6] border border-[#c6c5d0] rounded-lg text-[13px] outline-none min-h-[60px] focus:border-[#0d1b4e] focus:ring-1 focus:ring-[#0d1b4e] transition-all"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#767680] mb-1 uppercase">
                Đề cương:
              </label>
              <textarea
                value={deCuong}
                onChange={(e) => setDeCuong(e.target.value)}
                placeholder="Nhập đề cương chương trình..."
                className="w-full px-3 py-2 bg-[#faf3e6] border border-[#c6c5d0] rounded-lg text-[13px] outline-none min-h-[80px] focus:border-[#0d1b4e] focus:ring-1 focus:ring-[#0d1b4e] transition-all"
              />
            </div>
          </div>
        </div>
      </ModalForm>

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={!!deletingRow}
        title="Xác Nhận Xóa"
        message={`Bạn có chắc chắn muốn xóa CTĐT "${deletingRow?.ten_chuong_trinh}" không?`}
        onConfirm={confirmDelete}
        onCancel={() => setDeletingRow(null)}
      />
    </div>
  );
}

"use client";
import { AdminIcon } from "@/components/admin/AdminIcon";
import { publicError } from "@/libs/client-error";

import { useState, useMemo } from "react";
import Fuse from "fuse.js";
import { DataTable, Column } from "@/components/admin/DataTable";
import { ModalForm } from "@/components/admin/ModalForm";
import { createCTDTAction, updateCTDTAction, deleteCTDTAction } from "@/actions/chuong_trinh_dao_tao.action";
import { toast } from "@/libs/admin-toast";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { saveProgramCombinationsAction } from "@/actions/program-combinations.action";

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

export default function CTDTClient({ initialData, majors, combinations = [] }: { initialData: any[]; majors: any[]; combinations?: any[] }) {
  const [mappingProgram, setMappingProgram] = useState<any>(null);
  const [mappingYear, setMappingYear] = useState(new Date().getFullYear());
  const [mappingCodes, setMappingCodes] = useState<string[]>([]);
  const [mappingError, setMappingError] = useState("");
  const chooseMappingYear = (row: any, year: number) => {
    setMappingYear(year); setMappingError("");
    setMappingCodes((row.ctdt_to_hop || []).filter((link: any) => link.nam === year).map((link: any) => link.ma_to_hop));
  };
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<any | null>(null);
  const [deletingRow, setDeletingRow] = useState<any | null>(null);

  // Form State
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [maNganh, setMaNganh] = useState("");
  const [deCuong, setDeCuong] = useState("");
  const [moTaNgan, setMoTaNgan] = useState("");
  const [chuanDauRa, setChuanDauRa] = useState<string[]>([]);

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

  const [selectedMajorFilter, setSelectedMajorFilter] = useState("all");

  // 2. Data render có hỗ trợ lọc theo ngành học
  const filteredData = useMemo(() => {
    let result = initialData;
    if (selectedMajorFilter !== "all") {
      result = result.filter((item) => item.ma_nganh === selectedMajorFilter);
    }
    if (!search.trim()) return result;
    const searchFuse = new Fuse(result, {
      keys: ["ten_chuong_trinh", "ma_chuong_trinh", "nganh.ten_nganh"],
      threshold: 0.3,
    });
    return searchFuse.search(search).map((r) => r.item);
  }, [search, initialData, selectedMajorFilter]);

  useMemo(() => setCurrentPage(1), [search, selectedMajorFilter]);

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
    setMaNganh("");
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
      toast.error(publicError(error.message || "Có lỗi xảy ra!"));
    }
  };

  const confirmDelete = async () => {
    if (!deletingRow) return;
    try {
      await deleteCTDTAction(deletingRow.ma_chuong_trinh);
      toast.success("Xóa CTĐT thành công!");
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
      header: "Mã CTĐT",
      accessor: (r) => (
        <span className="font-stamp font-bold text-[#192b59] bg-[#f1f5f9] px-2 py-0.5 rounded border border-[#cbd5e1]">
          {r.ma_chuong_trinh}
        </span>
      ),
      className: "w-[120px]",
    },
    {
      header: "Tên Chương Trình Đào Tạo",
      accessor: (r) => (
        <div>
          <span className="font-bold text-[#1e293b] text-[14px] block">{r.ten_chuong_trinh}</span>
          <span className="text-[12px] text-[#64748b]">
            Ngành: <span className="font-bold text-[#192b59]">{r.nganh?.ten_nganh || "Chưa xác định"}</span>
            {r.nganh?.khoi_nganh?.ten_khoi_nganh && (
              <span className="ml-1 text-[#0284c7]">({r.nganh.khoi_nganh.ten_khoi_nganh})</span>
            )}
          </span>
        </div>
      ),
      className: "w-[30%]",
    },
    {
      header: "Tổ Hợp Xét Tuyển",
      accessor: (r) => {
        const combinations = r.ctdt_to_hop || [];
        return (
          <div className="flex flex-wrap gap-1 max-w-[220px]">
            {!combinations.length && <span className="text-xs text-slate-500">Chưa gán</span>}
            {combinations.slice(0, 4).map((c: any) => (
              <span
                key={`${c.ma_to_hop}:${c.nam}`}
                className="font-bold text-[11px] px-2 py-0.5 rounded bg-[#f1f5f9] text-[#192b59] border border-[#cbd5e1]"
              >
                {c.ma_to_hop} · {c.nam}
              </span>
            ))}
            {combinations.length > 4 && (
              <span className="text-[11px] text-[#64748b] font-bold self-center">
                +{combinations.length - 4}
              </span>
            )}
            <button type="button" className="w-full py-2 text-left text-sm font-bold text-blue-800 underline"
              onClick={() => { setMappingProgram(r); chooseMappingYear(r, new Date().getFullYear()); }}>Gán tổ hợp</button>
          </div>
        );
      },
      className: "w-[200px]",
    },
    {
      header: "Chuẩn Đầu Ra",
      accessor: (r) => {
        const cdr = r.chuan_dau_ra || [];
        if (!cdr.length) return <span className="text-[12px] text-[#64748b] italic">-</span>;
        return (
          <div className="flex flex-wrap gap-1">
            {cdr.map((k: string) => (
              <span
                key={k}
                className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#e0f2fe] text-[#0284c7] whitespace-nowrap"
              >
                {CHUAN_DAU_RA_LABELS[k] || k}
              </span>
            ))}
          </div>
        );
      },
      className: "w-[140px]",
    },
  ];

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[24px] font-bold text-[#192b59]">
            Quản Lý Chương Trình Đào Tạo
          </h1>
          <p className="text-[13px] text-[#64748b] mt-1">
            Quản lý {initialData.length} chương trình đào tạo chuẩn & chất lượng cao trực thuộc các ngành học UTC
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-[#192b59] hover:bg-[#243c78] text-white px-4 py-2.5 rounded-lg font-bold text-[13px] transition-colors shadow-sm"
        >
          <AdminIcon name="add" className="text-[18px]" />
          Thêm CTĐT Mới
        </button>
      </div>

      {/* Toolbar with Major filter and Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-4">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative w-72">
            <AdminIcon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748b] text-[18px]" />
            <input
              type="text"
              placeholder="Tìm theo tên CTĐT hoặc mã..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-[#cbd5e1] rounded-lg text-[13px] outline-none focus:border-[#192b59] focus:ring-1 focus:ring-[#192b59] transition-all"
            />
          </div>

          <select
            value={selectedMajorFilter}
            onChange={(e) => setSelectedMajorFilter(e.target.value)}
            className="px-3 py-2 bg-white border border-[#cbd5e1] rounded-lg text-[13px] font-bold text-[#192b59] outline-none focus:border-[#192b59]"
          >
            <option value="all">Tất cả ngành học ({majors.length})</option>
            {majors.map((m) => (
              <option key={m.ma_nganh} value={m.ma_nganh}>
                {m.ten_nganh}
              </option>
            ))}
          </select>
        </div>

        <span className="text-[12px] font-bold text-[#475569] self-end sm:self-center">
          Hiển thị: {filteredData.length} / {initialData.length} CTĐT
        </span>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-[#e2e8f0] overflow-hidden">
        <DataTable
          columns={columns}
          data={paginatedData}
          onEdit={openEdit}
          onDelete={(row) => setDeletingRow(row)}
        />

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
                <label className="block text-[11px] font-bold text-[#64748b] mb-1 uppercase">
                  Mã CTĐT:
                </label>
                <input
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Vd: 7480201CLC"
                  className="w-full px-3 py-2 bg-[#f8fafc] border border-[#cbd5e1] rounded-lg text-[13px] font-bold outline-none focus:border-[#192b59] focus:ring-1 focus:ring-[#192b59] transition-all"
                />
              </div>
            )}
            <div className="flex-[2]">
              <label className="block text-[11px] font-bold text-[#64748b] mb-1 uppercase">
                Tên CTĐT:
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Vd: Kỹ sư Phần mềm Chất lượng cao"
                className="w-full px-3 py-2 bg-[#f8fafc] border border-[#cbd5e1] rounded-lg text-[13px] font-bold outline-none focus:border-[#192b59] focus:ring-1 focus:ring-[#192b59] transition-all"
              />
            </div>
          </div>

          <label className="block text-sm font-bold text-slate-600">Trực thuộc ngành
            <select aria-label="Trực thuộc ngành" required value={maNganh} onChange={e => setMaNganh(e.target.value)} className="mt-2 w-full rounded-xl border border-slate-300 bg-white p-3">
              <option value="">Chọn ngành học</option>
              {majors.map(major => <option key={major.ma_nganh} value={major.ma_nganh}>{major.ma_nganh} — {major.ten_nganh}</option>)}
            </select>
          </label>

          <div>
            <label className="block text-[11px] font-bold text-[#64748b] mb-1 uppercase">
              Chuẩn Đầu Ra:
            </label>
            <div className="grid grid-cols-4 gap-2 bg-white p-2 border border-[#cbd5e1] rounded-lg">
              {CHUAN_DAU_RA_OPTIONS.map((opt) => (
                <label key={opt.value} className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-3.5 h-3.5 text-[#192b59] rounded focus:ring-[#192b59]"
                    checked={chuanDauRa.includes(opt.value)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setChuanDauRa((prev) => [...prev, opt.value]);
                      } else {
                        setChuanDauRa((prev) => prev.filter((v) => v !== opt.value));
                      }
                    }}
                  />
                  <span className="text-[13px] text-[#1e293b] font-medium">{opt.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-[11px] font-bold text-[#64748b] mb-1 uppercase">
                Mô tả ngắn:
              </label>
              <textarea
                value={moTaNgan}
                onChange={(e) => setMoTaNgan(e.target.value)}
                placeholder="Nhập mô tả ngắn gọn về chương trình..."
                className="w-full px-3 py-2 bg-[#f8fafc] border border-[#cbd5e1] rounded-lg text-[13px] outline-none min-h-[60px] focus:border-[#192b59] focus:ring-1 focus:ring-[#192b59] transition-all"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#64748b] mb-1 uppercase">
                Đề cương:
              </label>
              <textarea
                value={deCuong}
                onChange={(e) => setDeCuong(e.target.value)}
                placeholder="Nhập đề cương chương trình..."
                className="w-full px-3 py-2 bg-[#f8fafc] border border-[#cbd5e1] rounded-lg text-[13px] outline-none min-h-[80px] focus:border-[#192b59] focus:ring-1 focus:ring-[#192b59] transition-all"
              />
            </div>
          </div>
        </div>
      </ModalForm>

      <ModalForm isOpen={!!mappingProgram} title={`Gán tổ hợp — ${mappingProgram?.ten_chuong_trinh || ""}`} onClose={() => setMappingProgram(null)}
        onSubmit={async event => { event.preventDefault(); setMappingError(""); try {
          await saveProgramCombinationsAction(mappingProgram.ma_chuong_trinh, mappingYear, mappingCodes);
          toast.success("Đã lưu tổ hợp theo năm tuyển sinh"); setMappingProgram(null);
        } catch { setMappingError("Không lưu được tổ hợp. Kiểm tra năm tuyển sinh; không thể bỏ tổ hợp đang có hồ sơ."); } }}>
        <label className="block">Năm tuyển sinh<input aria-label="Năm gán tổ hợp" className="mt-2 block rounded-xl border p-3" type="number" min={2000} max={2100} required
          value={mappingYear} onChange={e => chooseMappingYear(mappingProgram, Number(e.target.value))} /></label>
        <p className="my-3 text-sm text-slate-600">Chọn tổ hợp cho năm này. Dữ liệu các năm khác được giữ nguyên.</p>
        <div className="grid max-h-72 gap-2 overflow-y-auto sm:grid-cols-2">{combinations.map(combination => <label key={combination.ma_to_hop} className="flex items-center gap-3 rounded-xl border p-3">
          <input type="checkbox" checked={mappingCodes.includes(combination.ma_to_hop)} onChange={e => setMappingCodes(prev => e.target.checked ? [...prev, combination.ma_to_hop] : prev.filter(code => code !== combination.ma_to_hop))} />
          {combination.ma_to_hop}</label>)}</div>
        {!combinations.length && <p>Chưa có tổ hợp. Hãy tạo tổ hợp xét tuyển trước.</p>}
        {mappingError && <p role="alert" className="mt-3 text-red-700">{mappingError}</p>}
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

"use client";
import { AdminIcon } from "@/components/admin/AdminIcon";
import { useAdminTask } from "@/hooks/useAdminTask";
import { useAdminDialog } from "@/hooks/useAdminDialog";
import { publicError } from "@/libs/client-error";

import { useState, useMemo, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Fuse from "fuse.js";
import { DataTable, Column } from "@/components/admin/DataTable";
import { ModalForm } from "@/components/admin/ModalForm";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { createNganhHoc, updateNganhHoc, deleteNganhHoc } from "@/actions/nganh_hoc.action";
import { reassignProgramsToMajorAction, deleteCTDTAction, createCTDTAction } from "@/actions/chuong_trinh_dao_tao.action";
import { toast } from "@/libs/admin-toast";

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

export default function NganhHocClient({
  initialData,
  faculties
}: {
  initialData: any[],
  faculties: { ma_khoi_nganh: string; ten_khoi_nganh: string }[]
}) {
  const { pending: programPending, run: runProgram } = useAdminTask();
  const router = useRouter();
  const searchParams = useSearchParams();
  const facultyParam = searchParams.get("faculty") || "";

  const [selectedFaculty, setSelectedFaculty] = useState(facultyParam);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<any | null>(null);
  const [deletingRow, setDeletingRow] = useState<any | null>(null);

  // Sync state with URL params if query param changes
  useEffect(() => {
    setSelectedFaculty(searchParams.get("faculty") || "");
  }, [searchParams]);

  const handleFacultyFilterChange = (facultyCode: string) => {
    setSelectedFaculty(facultyCode);
    const params = new URLSearchParams(searchParams.toString());
    if (facultyCode && facultyCode !== "ALL") {
      params.set("faculty", facultyCode);
    } else {
      params.delete("faculty");
    }
    router.push(`/admin/quan-ly-nganh-hoc?${params.toString()}`);
  };

  // Filter by Faculty first
  const facultyFilteredData = useMemo(() => {
    if (!selectedFaculty || selectedFaculty === "ALL") return initialData;
    return initialData.filter((item) => {
      return (
        item.ma_khoi_nganh === selectedFaculty ||
        item.khoi_nganh?.ma_khoi_nganh === selectedFaculty ||
        item.khoi_nganh?.ten_khoi_nganh?.toLowerCase() === selectedFaculty.toLowerCase()
      );
    });
  }, [initialData, selectedFaculty]);

  // Programs Modal State
  const [viewingPrograms, setViewingPrograms] = useState<any | null>(null);
  const programsDialogRef = useAdminDialog(!!viewingPrograms, () => setViewingPrograms(null), programPending);
  const [searchNewProgram, setSearchNewProgram] = useState("");
  const [searchAssignedProgram, setSearchAssignedProgram] = useState("");
  const [selectedNewPrograms, setSelectedNewPrograms] = useState<string[]>([]);
  const [isAddingPrograms, setIsAddingPrograms] = useState(false);
  const [deletingProgram, setDeletingProgram] = useState<any | null>(null);

  // Create New Program inside Modal State
  const [isCreatingProgram, setIsCreatingProgram] = useState(false);
  const [newProgramCode, setNewProgramCode] = useState("");
  const [newProgramName, setNewProgramName] = useState("");
  const [newProgramDeCuong, setNewProgramDeCuong] = useState("");
  const [newProgramMoTaNgan, setNewProgramMoTaNgan] = useState("");
  const [newProgramChuanDauRa, setNewProgramChuanDauRa] = useState<string[]>([]);
  const [isSubmittingNewProgram, setIsSubmittingNewProgram] = useState(false);

  // Form State
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [faculty, setFaculty] = useState("");
  const [facultyName, setFacultyName] = useState("");
  const [khoiKienThuc, setKhoiKienThuc] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const filteredFaculties = useMemo(() => {
    if (!facultyName.trim()) return faculties;
    const isCurrentSelected =
      faculty &&
      faculties.find((f) => f.ma_khoi_nganh === faculty)?.ten_khoi_nganh ===
        facultyName;
    if (isCurrentSelected) return faculties;
    return faculties.filter((f) =>
      f.ten_khoi_nganh.toLowerCase().includes(facultyName.toLowerCase()),
    );
  }, [faculties, faculty, facultyName]);

  // Phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 10;

  // 1. Tạo bộ máy tìm kiếm Fuse.js trên danh sách đã lọc theo Khoa
  const fuse = useMemo(() => {
    return new Fuse(facultyFilteredData, {
      keys: ["ma_nganh", "ten_nganh"], // Tìm trên mã ngành và tên ngành
      threshold: 0.3, // Độ mờ: 0 là chính xác tuyệt đối, 1 là khớp lỏng lẻo
      ignoreLocation: true, // Tìm ở bất cứ đâu trong chuỗi
    });
  }, [facultyFilteredData]);

  // 2. Lấy data để render
  const filteredData = useMemo(() => {
    if (!search.trim()) return facultyFilteredData;
    const results = fuse.search(search);
    return results.map((result) => result.item);
  }, [search, facultyFilteredData, fuse]);

  // reset page khi search hoặc đổi khoa
  useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedFaculty]);

  // Cắt data theo trang
  const totalPages = Math.ceil(filteredData.length / PAGE_SIZE);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredData.slice(start, start + PAGE_SIZE);
  }, [filteredData, currentPage]);

  // Lấy tất cả các chương trình đào tạo từ initialData
  const allPrograms = useMemo(() => {
    const programs: any[] = [];
    initialData.forEach(major => {
      if (major.chuong_trinh) {
        major.chuong_trinh.forEach((p: any) => {
          programs.push({
            ...p,
            ten_nganh_cu: major.ten_nganh
          });
        });
      }
    });
    return programs;
  }, [initialData]);

  // Các CTĐT chưa thuộc ngành hiện tại (để có thể Add)
  const availableProgramsToAdd = useMemo(() => {
    if (!viewingPrograms) return [];
    let list = allPrograms.filter(p => p.ma_nganh !== viewingPrograms.ma_nganh);
    if (searchNewProgram.trim()) {
      const lower = searchNewProgram.toLowerCase();
      list = list.filter(p => p.ten_chuong_trinh.toLowerCase().includes(lower) || p.ma_chuong_trinh.toLowerCase().includes(lower));
    }
    return list;
  }, [allPrograms, viewingPrograms, searchNewProgram]);

  // Các CTĐT đã thuộc ngành hiện tại
  const assignedPrograms = useMemo(() => {
    if (!viewingPrograms) return [];
    let list = viewingPrograms.chuong_trinh || [];
    if (searchAssignedProgram.trim()) {
      const lower = searchAssignedProgram.toLowerCase();
      list = list.filter((p: any) => p.ten_chuong_trinh.toLowerCase().includes(lower) || p.ma_chuong_trinh.toLowerCase().includes(lower));
    }
    return list;
  }, [viewingPrograms, searchAssignedProgram]);

  const handleAddPrograms = async () => {
    if (!viewingPrograms || selectedNewPrograms.length === 0) return;
    setIsAddingPrograms(true);
    try {
      await reassignProgramsToMajorAction(selectedNewPrograms, viewingPrograms.ma_nganh);
      toast.success("Đã thêm các chương trình đào tạo vào ngành!");

      // Update local state temporarily so UI reflects instantly without closing modal
      setViewingPrograms((prev: any) => {
        if (!prev) return prev;
        const newlyAdded = allPrograms.filter(p => selectedNewPrograms.includes(p.ma_chuong_trinh));
        return {
          ...prev,
          chuong_trinh: [...(prev.chuong_trinh || []), ...newlyAdded]
        };
      });
      setSelectedNewPrograms([]);
      setSearchNewProgram("");
    } catch (err: any) {
      toast.error(publicError(err.message || "Có lỗi xảy ra khi thêm CTĐT"));
    } finally {
      setIsAddingPrograms(false);
    }
  };

  const handleConfirmDeleteProgram = async () => {
    if (!deletingProgram || !viewingPrograms) return;
    try {
      await deleteCTDTAction(deletingProgram.ma_chuong_trinh);
      toast.success("Đã xóa chương trình đào tạo!");

      setViewingPrograms((prev: any) => {
        if (!prev) return prev;
        return {
          ...prev,
          chuong_trinh: prev.chuong_trinh.filter((p: any) => p.ma_chuong_trinh !== deletingProgram.ma_chuong_trinh)
        };
      });
      setDeletingProgram(null);
    } catch (err: any) {
      toast.error(publicError(err.message || "Có lỗi xảy ra khi xóa CTĐT"));
    }
  };

  const openCreate = () => {
    setEditingRow(null);
    setCode("");
    setName("");
    setFaculty("");
    setFacultyName("");
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
      toast.error(publicError(err.message || "Lỗi lưu ngành học"));
    }
  };

  const handleDelete = async () => {
    if (!deletingRow) return;
    try {
      await deleteNganhHoc(deletingRow.ma_nganh);
      toast.success("Xóa ngành học thành công!");
      setDeletingRow(null);
    } catch (err: any) {
      toast.error(publicError(err.message || "Lỗi xóa ngành học"));
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
      className: "w-[6%] text-center",
    },
    {
      header: "Mã Ngành",
      accessor: (r) => (
        <span className="font-stamp font-bold text-[#192b59] bg-[#f1f5f9] px-2 py-0.5 rounded border border-[#cbd5e1]">
          {r.ma_nganh}
        </span>
      ),
      className: "w-[13%]",
    },
    {
      header: "Tên Ngành Đào Tạo",
      accessor: (r) => (
        <div>
          <span className="font-bold text-[#1e293b] text-[14px] block">{r.ten_nganh}</span>
          <span className="text-[12px] text-[#64748b]">{r.khoi_nganh?.ten_khoi_nganh || "Khoa/Viện chưa xác định"}</span>
        </div>
      ),
      className: "w-[32%]",
    },
    {
      header: "Số CTĐT",
      accessor: (r) => (
        <span className="font-bold text-[#0284c7] bg-[#e0f2fe] px-2 py-0.5 rounded-full whitespace-nowrap">
          {r.chuong_trinh?.length || 0} CTĐT
        </span>
      ),
      className: "w-[11%] text-center",
    },
    {
      header: "Khối Kiến Thức",
      accessor: (r) => (
        <span className="text-[12px] font-semibold text-[#475569] bg-[#f8fafc] px-2.5 py-1 rounded border border-[#e2e8f0] inline-block max-w-full whitespace-normal break-words leading-5">
          {r.khoi_kien_thuc || r.khoi_nganh?.ten_khoi_nganh || "Đại cương & Chuyên ngành"}
        </span>
      ),
      className: "w-[26%]",
    },
  ];

  return (
    <div className="space-y-6 pt-4">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-[26px] text-[#192b59]">
            Quản Lý Danh Mục Ngành Học
          </h1>
          <p className="text-[13px] text-[#475569] mt-0.5">
            Danh mục các ngành đào tạo Đại học chính quy và chương trình chuẩn UTC.
          </p>
        </div>

        <button
          onClick={openCreate}
          className="flex items-center gap-1.5 bg-[#fdb712] text-[#192b59] hover:bg-[#e2a20a] px-4 py-2.5 rounded-xl font-bold text-[13px] shadow transition-all shrink-0"
        >
          <AdminIcon name="add_circle" className="text-[18px]" />
          Thêm Ngành Học Mới
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-[#e2e8f0] shadow-sm space-y-3">
        <div className="flex min-w-0 flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          {/* Search Box */}
          <div className="relative min-w-0 w-full xl:max-w-md xl:flex-1">
            <AdminIcon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748b] text-[18px]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm theo mã ngành hoặc tên ngành..."
              className="w-full pl-9 pr-4 py-2 rounded-lg bg-[#f8fafc] text-[#1e293b] text-[13px] outline-none border border-[#cbd5e1] focus:border-[#192b59]"
            />
          </div>

          {/* Faculty Selector & Count */}
          <div className="flex min-w-0 w-full flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end xl:w-auto xl:flex-1">
            <div className="flex min-w-0 flex-1 flex-col gap-2 sm:min-w-[220px]">
              <span className="text-[12px] font-bold text-[#475569]">
                Lọc theo Khoa/Viện:
              </span>
              <select
                value={selectedFaculty}
                onChange={(e) => handleFacultyFilterChange(e.target.value)}
                className="min-w-0 w-full max-w-full px-3 py-2 bg-[#f8fafc] border border-[#cbd5e1] rounded-lg text-[13px] font-bold text-[#192b59] outline-none focus:border-[#192b59]"
              >
                <option value="">-- Tất cả Khoa / Viện ({initialData.length} ngành) --</option>
                {faculties.map((f) => {
                  const countInFaculty = initialData.filter(
                    (m) =>
                      m.ma_khoi_nganh === f.ma_khoi_nganh ||
                      m.khoi_nganh?.ma_khoi_nganh === f.ma_khoi_nganh
                  ).length;
                  return (
                    <option key={f.ma_khoi_nganh} value={f.ma_khoi_nganh}>
                      {f.ten_khoi_nganh} ({countInFaculty} ngành)
                    </option>
                  );
                })}
              </select>
            </div>
            <span className="self-start shrink-0 text-[12px] font-bold text-[#192b59] whitespace-nowrap bg-[#f8fafc] px-3 py-2 rounded-lg border border-[#e2e8f0] sm:self-end">
              Hiển thị: <strong>{filteredData.length}</strong> ngành
            </span>
          </div>
        </div>

        {/* Active Faculty Filter Alert Banner */}
        {selectedFaculty && (
          <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-3.5 py-2 bg-[#e0f2fe] border border-[#bae6fd] rounded-lg text-[12px] text-[#0369a1] animate-in fade-in duration-150">
            <div className="flex min-w-0 flex-1 items-start gap-2 break-words">
              <AdminIcon name="filter_alt" className="text-[18px] text-[#0284c7]" />
              <span>
                Đang lọc danh sách theo:{" "}
                <strong className="text-[#192b59]">
                  {faculties.find((f) => f.ma_khoi_nganh === selectedFaculty)?.ten_khoi_nganh || selectedFaculty}
                </strong>{" "}
                (Tìm thấy {filteredData.length} ngành đào tạo)
              </span>
            </div>
            <button
              onClick={() => handleFacultyFilterChange("")}
              className="flex self-start shrink-0 items-center gap-1 px-2.5 py-1 bg-white hover:bg-red-50 text-[#ba1a1a] rounded-md font-bold text-[11px] border border-red-200 transition-colors shadow-xs sm:self-center"
            >
              <AdminIcon name="close" className="text-[14px]" />
              Bỏ lọc (Xem tất cả)
            </button>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-[#e2e8f0] overflow-hidden">
        {/* Table */}
        <DataTable
          tableClassName="min-w-[960px] table-fixed"
          actionClassName="w-[12%]"
          columns={columns}
          data={paginatedData}
          onEdit={(row) => {
             // Ngăn chặn nổi bọt sự kiện click row
             openEdit(row);
          }}
          onDelete={(row) => {
             setDeletingRow(row);
          }}
          onClickRow={(row) => {
            setViewingPrograms(row);
            setSearchNewProgram("");
            setSearchAssignedProgram("");
            setSelectedNewPrograms([]);
            setIsCreatingProgram(false);
            setNewProgramCode("");
            setNewProgramName("");
            setNewProgramDeCuong("");
            setNewProgramMoTaNgan("");
            setNewProgramChuanDauRa([]);
          }}
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
        title={editingRow ? "Chỉnh Sửa Ngành Học" : "Thêm Ngành Học Mới"}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSave}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-[12px] font-bold text-[#1e293b] mb-1">
              Mã Ngành Học:
            </label>
            <input
              type="text"
              required
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Vd: 7480201"
              className="w-full px-3 py-2 bg-[#f8fafc] border border-[#cbd5e1] rounded-lg text-[13px] font-bold outline-none"
            />
          </div>

          <div>
            <label className="block text-[12px] font-bold text-[#1e293b] mb-1">
              Tên Ngành Đào Tạo:
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Vd: Công nghệ Thông tin"
              className="w-full px-3 py-2 bg-[#f8fafc] border border-[#cbd5e1] rounded-lg text-[13px] font-bold outline-none"
            />
          </div>

          <div className="relative">
            <label className="block text-[12px] font-bold text-[#1e293b] mb-1">
              Khoa / Viện Quản Lý:
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={facultyName}
                onFocus={() => setIsDropdownOpen(true)}
                onBlur={() => setTimeout(() => setIsDropdownOpen(false), 200)}
                onChange={(e) => {
                  const val = e.target.value;
                  setFacultyName(val);
                  setIsDropdownOpen(true);
                  const matched = faculties.find(
                    (f) =>
                      f.ten_khoi_nganh.toLowerCase() === val.trim().toLowerCase(),
                  );
                  setFaculty(matched ? matched.ma_khoi_nganh : "");
                }}
                placeholder="Chọn hoặc gõ để tìm kiếm..."
                className={`w-full pl-3 pr-10 py-2 bg-[#f8fafc] border rounded-lg text-[13px] font-bold outline-none transition-colors cursor-text ${
                  !faculty && facultyName ? "border-red-500 focus:border-red-500" : "border-[#cbd5e1] focus:border-[#192b59]"
                }`}
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setIsDropdownOpen((prev) => !prev)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-[#64748b] hover:text-[#192b59]"
                title="Mở danh sách khoa / viện"
              >
                <AdminIcon name="arrow_drop_down" className="text-[20px]" />
              </button>
            </div>

            {/* Custom Dropdown */}
            {isDropdownOpen && (
              <ul className="absolute z-[100] w-full mt-1 bg-white border border-[#cbd5e1] rounded-lg shadow-lg max-h-48 overflow-y-auto divide-y divide-[#e2e8f0]">
                {filteredFaculties.length > 0 ? (
                  filteredFaculties.map((f) => (
                    <li
                      key={f.ma_khoi_nganh}
                      onMouseDown={() => {
                        setFaculty(f.ma_khoi_nganh);
                        setFacultyName(f.ten_khoi_nganh);
                        setIsDropdownOpen(false);
                      }}
                      className={`px-3 py-2 text-[13px] font-medium cursor-pointer transition-colors ${
                        faculty === f.ma_khoi_nganh ? "bg-[#fdb712] text-[#192b59] font-bold" : "text-[#1e293b] hover:bg-[#f8fafc]"
                      }`}
                    >
                      {f.ten_khoi_nganh}
                    </li>
                  ))
                ) : (
                  <li className="px-3 py-2 text-[13px] text-[#64748b] italic text-center">
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
            <label className="block text-[12px] font-bold text-[#1e293b] mb-1">
              Khối Kiến Thức (Tuỳ chọn):
            </label>
            <input
              type="text"
              value={khoiKienThuc}
              onChange={(e) => setKhoiKienThuc(e.target.value)}
              placeholder="Vd: Công nghệ Thông tin"
              className="w-full px-3 py-2 bg-[#f8fafc] border border-[#cbd5e1] rounded-lg text-[13px] font-bold outline-none"
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

      {/* Viewing Programs Modal */}
      {viewingPrograms && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div
            ref={programsDialogRef} role="dialog" aria-modal="true" aria-label={`Chương trình đào tạo thuộc ${viewingPrograms.ten_nganh}`} aria-busy={programPending} tabIndex={-1}
            className="bg-[#f8fafc] rounded-2xl min-w-0 w-full max-w-4xl max-h-[95vh] flex flex-col shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 shrink-0 border-b border-[#e2e8f0] flex flex-wrap items-start justify-between gap-3 bg-white relative">
              <h2 className="min-w-0 flex-1 text-base sm:text-[18px] font-bold text-[#192b59]">
                Các Chương Trình Đào Tạo Thuộc <span className="text-[#0284c7]">{viewingPrograms.ten_nganh}</span>
              </h2>
              <div className="flex items-center gap-3">
                <button
                  type="button" disabled={programPending}
                  onClick={() => setIsCreatingProgram(!isCreatingProgram)}
                  className="flex items-center gap-1.5 bg-[#fdb712] text-[#192b59] px-3 py-1.5 rounded-lg font-bold text-[12px] shadow-sm transition-colors hover:bg-[#e5a610]"
                >
                  <span className="material-symbols-outlined text-[16px]">{isCreatingProgram ? 'remove_circle' : 'add_circle'}</span>
                  {isCreatingProgram ? "Hủy Thêm Mới" : "Tạo Mới CTĐT"}
                </button>
                <button
                  type="button" aria-label="Đóng danh sách chương trình đào tạo" disabled={programPending} onClick={() => setViewingPrograms(null)}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-gray-500"
                >
                  <AdminIcon name="close" className="text-[20px]" />
                </button>
              </div>
            </div>

            <div className="p-4 sm:p-5 min-h-0 min-w-0 overflow-y-auto custom-scrollbar flex-1 bg-[#f8fafc] flex flex-col gap-4">

              {/* Form tạo mới CTĐT inline */}
              {isCreatingProgram && (
                <div className="bg-white rounded-xl shadow-sm border border-[#fdb712] p-4 bg-yellow-50/30">
                  <h3 className="font-bold text-[14px] text-[#192b59] mb-2 flex items-center gap-1">
                    <AdminIcon name="add_box" className="text-[18px] text-[#fdb712]" />
                    Tạo Chương Trình Đào Tạo Mới
                  </h3>
                  <div className="flex flex-col sm:flex-row gap-2 sm:items-end">
                    <div className="min-w-0 w-full sm:flex-1 sm:max-w-[200px]">
                      <label className="block text-[11px] font-bold text-[#64748b] mb-1 uppercase">Mã CTĐT</label>
                      <input
                        type="text"
                        placeholder="Vd: 7480201CLC"
                        value={newProgramCode}
                        onChange={(e) => setNewProgramCode(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-[#cbd5e1] rounded-lg text-[13px] outline-none focus:border-[#192b59] focus:ring-1 focus:ring-[#192b59] transition-all"
                        autoFocus
                      />
                    </div>
                    <div className="min-w-0 w-full sm:flex-1">
                      <label className="block text-[11px] font-bold text-[#64748b] mb-1 uppercase">Tên Chương Trình Mới</label>
                      <input
                        type="text"
                        placeholder="Vd: Ngôn ngữ Anh (Chất lượng cao)..."
                        value={newProgramName}
                        onChange={(e) => setNewProgramName(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-[#cbd5e1] rounded-lg text-[13px] outline-none focus:border-[#192b59] focus:ring-1 focus:ring-[#192b59] transition-all"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 items-start mt-2">
                    <div className="flex-1">
                      <label className="block text-[11px] font-bold text-[#64748b] mb-1 uppercase">Chuẩn Đầu Ra</label>
                      <div className="grid grid-cols-4 gap-2 bg-white p-2 border border-[#cbd5e1] rounded-lg">
                        {CHUAN_DAU_RA_OPTIONS.map((opt) => (
                          <label key={opt.value} className="flex items-center gap-1.5 cursor-pointer">
                            <input
                              type="checkbox"
                              className="w-3.5 h-3.5 text-[#192b59] rounded focus:ring-[#192b59]"
                              checked={newProgramChuanDauRa.includes(opt.value)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setNewProgramChuanDauRa(prev => [...prev, opt.value]);
                                } else {
                                  setNewProgramChuanDauRa(prev => prev.filter(v => v !== opt.value));
                                }
                              }}
                            />
                            <span className="text-[12px]">{opt.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-2">
                    <div className="flex-1">
                      <label className="block text-[11px] font-bold text-[#64748b] mb-1 uppercase">Mô tả ngắn</label>
                      <textarea
                        placeholder="Nhập mô tả..."
                        value={newProgramMoTaNgan}
                        onChange={(e) => setNewProgramMoTaNgan(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-[#cbd5e1] rounded-lg text-[13px] outline-none focus:border-[#192b59] focus:ring-1 focus:ring-[#192b59] transition-all min-h-[60px]"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-[11px] font-bold text-[#64748b] mb-1 uppercase">Đề cương</label>
                      <textarea
                        placeholder="Nhập đề cương..."
                        value={newProgramDeCuong}
                        onChange={(e) => setNewProgramDeCuong(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-[#cbd5e1] rounded-lg text-[13px] outline-none focus:border-[#192b59] focus:ring-1 focus:ring-[#192b59] transition-all min-h-[60px]"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end mt-3">
                    <button
                      onClick={() => void runProgram(async () => {
                        if (!newProgramCode.trim()) {
                          toast.error("Vui lòng nhập mã chương trình!");
                          return;
                        }
                        if (!newProgramName.trim()) {
                          toast.error("Vui lòng nhập tên chương trình!");
                          return;
                        }
                        setIsSubmittingNewProgram(true);
                        try {
                          const newProg = await createCTDTAction(
                            newProgramCode,
                            viewingPrograms.ma_nganh,
                            newProgramName,
                            newProgramDeCuong,
                            newProgramChuanDauRa as any,
                            newProgramMoTaNgan
                          );
                          toast.success("Tạo chương trình đào tạo thành công!");
                          setViewingPrograms((prev: any) => {
                            if (!prev) return prev;
                            return {
                              ...prev,
                              chuong_trinh: [...(prev.chuong_trinh || []), newProg]
                            };
                          });
                          setNewProgramCode("");
                          setNewProgramName("");
                          setNewProgramDeCuong("");
                          setNewProgramMoTaNgan("");
                          setNewProgramChuanDauRa([]);
                          setIsCreatingProgram(false);
                        } catch (err: any) {
                          toast.error(publicError(err.message || "Lỗi tạo chương trình!"));
                        } finally {
                          setIsSubmittingNewProgram(false);
                        }
                      })}
                      disabled={programPending || isSubmittingNewProgram || !newProgramName.trim() || !newProgramCode.trim()}
                      className="bg-[#192b59] text-white h-[38px] px-5 rounded-lg font-bold text-[13px] hover:bg-[#1a2b6d] disabled:opacity-50 transition-colors whitespace-nowrap"
                    >
                      {isSubmittingNewProgram ? "Đang lưu..." : "Lưu Lại"}
                    </button>
                  </div>
                </div>
              )}

              {/* Phần thêm CTĐT */}
              <div className="bg-white rounded-xl shadow-sm border border-[#e2e8f0] p-4">
                <h3 className="font-bold text-[14px] text-[#192b59] mb-3">Thêm CTĐT từ ngành khác</h3>
                <div className="flex flex-col sm:flex-row gap-2 mb-3">
                  <div className="relative min-w-0 flex-1">
                    <AdminIcon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748b] text-[16px]" />
                    <input
                      type="text"
                      placeholder="Tìm kiếm chương trình đào tạo..."
                      value={searchNewProgram}
                      onChange={(e) => setSearchNewProgram(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-white border border-[#cbd5e1] rounded-lg text-[13px] outline-none focus:border-[#192b59] focus:ring-1 focus:ring-[#192b59] transition-all"
                    />
                  </div>
                  <button
                    onClick={() => void runProgram(handleAddPrograms)}
                    disabled={programPending || selectedNewPrograms.length === 0 || isAddingPrograms}
                    className="bg-[#192b59] text-white h-[38px] px-4 rounded-lg font-bold text-[13px] hover:bg-[#1a2b6d] disabled:opacity-50 transition-colors whitespace-nowrap"
                  >
                    {isAddingPrograms ? "Đang xử lý..." : `Thêm ${selectedNewPrograms.length > 0 ? `(${selectedNewPrograms.length})` : ''}`}
                  </button>
                </div>

                <div className="bg-white border border-[#e2e8f0] rounded-lg h-48 overflow-y-auto">
                  <div className="p-2 border-b border-[#e2e8f0] flex flex-wrap gap-2 items-center justify-between sticky top-0 bg-white z-10">
                    <span className="text-[12px] font-bold text-[#475569] ml-1">Đã chọn: {selectedNewPrograms.length}</span>
                    <div>
                      <button
                        onClick={() => setSelectedNewPrograms(availableProgramsToAdd.map(p => p.ma_chuong_trinh))}
                        className="text-[11px] font-bold text-[#0284c7] hover:underline px-2"
                      >
                        Chọn tất cả (đang hiển thị)
                      </button>
                      <span className="text-[#cbd5e1]">|</span>
                      <button
                        onClick={() => setSelectedNewPrograms([])}
                        className="text-[11px] font-bold text-red-500 hover:underline px-2"
                      >
                        Bỏ chọn tất cả
                      </button>
                    </div>
                  </div>

                  <ul className="divide-y divide-[#e2e8f0]">
                    {availableProgramsToAdd.map(p => (
                      <li key={p.ma_chuong_trinh} className="flex items-start gap-3 p-2 hover:bg-[#f8fafc] transition-colors">
                        <input
                          type="checkbox"
                          id={`prog-${p.ma_chuong_trinh}`}
                          className="mt-1 w-4 h-4 cursor-pointer"
                          checked={selectedNewPrograms.includes(p.ma_chuong_trinh)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedNewPrograms(prev => [...prev, p.ma_chuong_trinh]);
                            } else {
                              setSelectedNewPrograms(prev => prev.filter(id => id !== p.ma_chuong_trinh));
                            }
                          }}
                        />
                        <label htmlFor={`prog-${p.ma_chuong_trinh}`} className="cursor-pointer flex-1">
                          <span className="text-[13px] font-bold text-[#1e293b] block">{p.ten_chuong_trinh}</span>
                          <span className="text-[11px] text-[#64748b] block">{p.ma_chuong_trinh} - Thuộc ngành: {p.ten_nganh_cu}</span>
                        </label>
                      </li>
                    ))}
                    {availableProgramsToAdd.length === 0 && (
                      <li className="p-4 text-center text-[#64748b] text-[13px] italic">
                        Không có CTĐT nào khớp với tìm kiếm.
                      </li>
                    )}
                  </ul>
                </div>
              </div>

              {/* Phần danh sách đã gán */}
              <div className="bg-white rounded-xl shadow-sm border border-[#e2e8f0] p-4">
                <div className="flex min-w-0 flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                  <h3 className="font-bold text-[14px] text-[#192b59]">Danh sách đã gán ({assignedPrograms.length})</h3>
                  <div className="relative min-w-0 w-full sm:w-64">
                    <AdminIcon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748b] text-[16px]" />
                    <input
                      type="text"
                      placeholder="Tìm trong danh sách..."
                      value={searchAssignedProgram}
                      onChange={(e) => setSearchAssignedProgram(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 bg-[#f8fafc] border border-[#e2e8f0] rounded-md text-[12px] outline-none focus:border-[#192b59]"
                    />
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full min-w-[480px] text-left border-collapse">
                    <thead>
                      <tr className="bg-[#f1f5f9] text-[11px] uppercase text-[#475569]">
                        <th className="p-3 font-bold border-b border-[#e2e8f0] w-[150px]">Mã CTĐT</th>
                        <th className="p-3 font-bold border-b border-[#e2e8f0]">Tên Chương Trình</th>
                        <th className="p-3 font-bold border-b border-[#e2e8f0] w-[80px] text-center">Xóa</th>
                      </tr>
                    </thead>
                    <tbody>
                      {assignedPrograms.length > 0 ? (
                        assignedPrograms.map((p: any) => (
                          <tr key={p.ma_chuong_trinh} className="hover:bg-[#f8fafc]/50 transition-colors border-b border-[#e2e8f0] text-[13px]">
                            <td className="p-3">
                              <span className="font-stamp font-bold text-[#192b59] bg-[#f1f5f9] px-2 py-0.5 rounded border border-[#cbd5e1]">
                                {p.ma_chuong_trinh}
                              </span>
                            </td>
                            <td className="p-3 font-bold text-[#1e293b]">{p.ten_chuong_trinh}</td>
                            <td className="p-3 text-center">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDeletingProgram(p);
                                }}
                                className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 text-[#ba1a1a] transition-colors mx-auto"
                                title="Xóa chương trình này khỏi hệ thống"
                              >
                                <AdminIcon name="delete" className="text-[18px]" />
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={3} className="p-6 text-center text-[#64748b] text-[13px] italic bg-[#f8fafc]/30">
                            Chưa có chương trình đào tạo nào thuộc ngành này
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Delete Program Dialog */}
      <ConfirmDialog
        isOpen={!!deletingProgram}
        title="Xác Nhận Xóa CTĐT"
        message={`Chương trình đào tạo bắt buộc phải có một ngành học. Việc Xóa ở đây sẽ xóa vĩnh viễn "${deletingProgram?.ten_chuong_trinh}" khỏi hệ thống. Bạn có chắc chắn?`}
        onConfirm={handleConfirmDeleteProgram}
        onCancel={() => setDeletingProgram(null)}
      />
    </div>
  );
}

"use client";
import { AdminIcon } from "@/components/admin/AdminIcon";
import { publicError } from "@/libs/client-error";

import { useState, useMemo, useRef, useId } from "react";
import { useAdminTask } from "@/hooks/useAdminTask";
import { useAdminDialog } from "@/hooks/useAdminDialog";
import Fuse from "fuse.js";
import { DataTable, Column } from "@/components/admin/DataTable";
import { ModalForm } from "@/components/admin/ModalForm";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { createToHopAction, updateToHopAction, deleteToHopAction, getProgramsByToHopAction, addProgramToToHopAction, removeProgramFromToHopAction } from "@/actions/to_hop_xet_tuyen.action";
import { toast } from "@/libs/admin-toast";
import { combinationKey } from "@/libs/admission-catalog";

export default function ToHopClient({ initialData, subjects, allPrograms }: { initialData: any[]; subjects: any[]; allPrograms: any[] }) {
  const { pending: programPending, run: runProgram } = useAdminTask();
  const programsRequest = useRef(0);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<any | null>(null);
  const [deletingRow, setDeletingRow] = useState<any | null>(null);

  // Form State
  const [code, setCode] = useState("");
  const [mon1, setMon1] = useState("");
  const [mon2, setMon2] = useState("");
  const [mon3, setMon3] = useState("");

  // Modal Ngành
  const [isProgramsModalOpen, setIsProgramsModalOpen] = useState(false);
  const [selectedToHop, setSelectedToHop] = useState<any | null>(null);
  const [programsList, setProgramsList] = useState<any[]>([]);
  const [isLoadingPrograms, setIsLoadingPrograms] = useState(false);
  const programsTitleId = useId();
  const closePrograms = () => { ++programsRequest.current; setIsProgramsModalOpen(false); };
  const programsDialogRef = useAdminDialog(isProgramsModalOpen, closePrograms, programPending);

  // Thêm Ngành mới vào Tổ Hợp
  const [searchNewProgram, setSearchNewProgram] = useState("");
  const [selectedNewPrograms, setSelectedNewPrograms] = useState<string[]>([]);
  const [newYear, setNewYear] = useState(new Date().getFullYear());

  // Search & Filter ở bảng ngành đã gắn
  const [searchAssignedProgram, setSearchAssignedProgram] = useState("");
  const [filterAssignedYear, setFilterAssignedYear] = useState<number | "">("");

  // Phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 10;

  const fuse = useMemo(() => {
    return new Fuse(initialData, {
      keys: ["ma_to_hop", "mon_1.ten_mon", "mon_2.ten_mon", "mon_3.ten_mon"],
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

  useMemo(() => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [currentPage]);

  const openCreate = () => {
    setEditingRow(null);
    setCode("");
    setMon1(subjects[0]?.ma_mon || "");
    setMon2(subjects[1]?.ma_mon || "");
    setMon3(subjects[2]?.ma_mon || "");
    setIsModalOpen(true);
  };

  const openEdit = (row: any) => {
    setEditingRow(row);
    setCode(row.ma_to_hop);
    setMon1(row.ma_mon_1);
    setMon2(row.ma_mon_2);
    setMon3(row.ma_mon_3);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mon1 || !mon2 || !mon3) {
      toast.error("Vui lòng chọn đầy đủ 3 môn học!");
      return;
    }
    if (mon1 === mon2 || mon2 === mon3 || mon1 === mon3) {
      toast.error("Các môn học trong tổ hợp không được trùng nhau!");
      return;
    }
    if (initialData.some(row => row.ma_to_hop !== editingRow?.ma_to_hop &&
      combinationKey([row.ma_mon_1, row.ma_mon_2, row.ma_mon_3]) === combinationKey([mon1, mon2, mon3]))) {
      toast.error("Bộ ba môn này đã có trong một tổ hợp khác, kể cả khi đổi thứ tự.");
      return;
    }

    try {
      if (editingRow) {
        await updateToHopAction(code, mon1, mon2, mon3);
        toast.success("Cập nhật tổ hợp thành công!");
      } else {
        await createToHopAction(code, mon1, mon2, mon3);
        toast.success("Thêm mới tổ hợp thành công!");
      }
      setIsModalOpen(false);
    } catch (error: any) {
      toast.error(publicError(error.message || "Có lỗi xảy ra!"));
    }
  };

  const confirmDelete = async () => {
    if (!deletingRow) return;
    try {
      await deleteToHopAction(deletingRow.ma_to_hop);
      toast.success("Xóa tổ hợp thành công!");
      setDeletingRow(null);
    } catch (error: any) {
      toast.error(publicError(error.message || "Có lỗi xảy ra!"));
    }
  };

  const openProgramsModal = async (row: any) => {
    const request = ++programsRequest.current;
    setSelectedToHop(row);
    setIsProgramsModalOpen(true);
    setSearchNewProgram("");
    setSelectedNewPrograms([]);
    setSearchAssignedProgram("");
    setFilterAssignedYear("");
    setIsLoadingPrograms(true);
    setProgramsList([]);
    try {
      const data = await getProgramsByToHopAction(row.ma_to_hop);
      if (request === programsRequest.current) setProgramsList(data);
    } catch (error: any) {
      if (request === programsRequest.current) toast.error("Không thể lấy danh sách ngành");
    } finally {
      if (request === programsRequest.current) setIsLoadingPrograms(false);
    }
  };

  const handleAddProgram = async () => {
    if (!selectedToHop || selectedNewPrograms.length === 0 || !newYear) return;
    try {
      await addProgramToToHopAction(selectedToHop.ma_to_hop, selectedNewPrograms, newYear);
      setSelectedNewPrograms([]);
    } catch (error: any) {
      toast.error(publicError(error.message || "Thêm ngành thất bại!"));
      return;
    }
    try {
      const data = await getProgramsByToHopAction(selectedToHop.ma_to_hop);
      setProgramsList(data);
      toast.success("Thêm ngành thành công!");
    } catch {
      toast.warning("Đã thêm ngành, nhưng chưa tải lại được danh sách. Hãy mở lại tổ hợp để cập nhật.");
    }
  };

  const filteredAllPrograms = useMemo(() => {
    if (!searchNewProgram.trim()) return allPrograms;
    const lower = searchNewProgram.toLowerCase();
    return allPrograms.filter(p => p.ten_chuong_trinh.toLowerCase().includes(lower) || p.ma_chuong_trinh.toLowerCase().includes(lower));
  }, [searchNewProgram, allPrograms]);

  const filteredAssignedPrograms = useMemo(() => {
    let result = programsList;
    if (filterAssignedYear !== "") {
      result = result.filter(p => p.nam === filterAssignedYear);
    }
    if (searchAssignedProgram.trim()) {
      const lower = searchAssignedProgram.toLowerCase();
      result = result.filter(p => p.chuong_trinh.ten_chuong_trinh.toLowerCase().includes(lower) || p.chuong_trinh.ma_chuong_trinh.toLowerCase().includes(lower));
    }
    return result;
  }, [searchAssignedProgram, filterAssignedYear, programsList]);

  const uniqueYears = useMemo(() => {
    return Array.from(new Set(programsList.map(p => p.nam))).filter(Boolean).sort((a, b) => b - a);
  }, [programsList]);


  const handleRemoveProgram = async (ma_ctdt_to_hop: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa ngành này khỏi tổ hợp?")) return;
    try {
      await removeProgramFromToHopAction(ma_ctdt_to_hop);
      setProgramsList(previous => previous.filter(item => item.ma_ctdt_to_hop !== ma_ctdt_to_hop));
    } catch (error: any) {
      toast.error(publicError(error.message || "Xóa ngành thất bại!"));
      return;
    }
    try {
      const data = await getProgramsByToHopAction(selectedToHop.ma_to_hop);
      setProgramsList(data);
      toast.success("Xóa ngành thành công!");
    } catch {
      toast.warning("Đã xóa ngành, nhưng chưa tải lại được danh sách. Hãy mở lại tổ hợp để cập nhật.");
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
      header: "Mã Tổ Hợp",
      accessor: (r) => (
        <span className="font-stamp font-bold text-[#0284c7] bg-[#e0f2fe] px-2.5 py-1 rounded border border-[#192b59]">
          {r.ma_to_hop}
        </span>
      ),
      className: "w-[120px]"
    },
    {
      header: "Các Môn Thành Phần",
      accessor: (r) => (
        <span className="font-bold text-[#1e293b]">
          {r.mon_1?.ten_mon}, {r.mon_2?.ten_mon}, {r.mon_3?.ten_mon}
        </span>
      )
    },
    {
      header: "Số Ngành Đang Gắn",
      accessor: (r) => (
        <span className="font-bold text-[#16a34a]">
          {r._count?.ctdt_to_hop || 0} Ngành
        </span>
      ),
      className: "text-center w-[160px]"
    },
  ];

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-[24px] font-bold text-[#192b59]">Quản Lý Tổ Hợp Xét Tuyển</h1>
          <p className="text-[13px] text-[#475569] mt-1">Quản lý các tổ hợp môn xét tuyển THPT Quốc gia (A00, A01, D01...).</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-1.5 bg-[#fdb712] text-[#192b59] px-4 py-2.5 rounded-xl font-bold text-[13px] shadow-sm transition-colors hover:bg-[#e5a610]">
          <AdminIcon name="add_circle" className="text-[18px]" /> Thêm Tổ Hợp
        </button>
      </div>

      <div className="flex items-center justify-between mb-4">
        <div className="relative w-80">
          <AdminIcon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748b] text-[18px]" />
          <input
            type="text"
            placeholder="Tìm theo mã hoặc tên môn..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-[#cbd5e1] rounded-lg text-[13px] outline-none focus:border-[#192b59] focus:ring-1 focus:ring-[#192b59] transition-all"
          />
        </div>
        <span className="text-[12px] font-bold text-[#475569]">
          Tổng số: {filteredData.length} tổ hợp
        </span>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-[#e2e8f0] overflow-hidden">
        <DataTable
          columns={columns}
          data={paginatedData}
          keyExtractor={(row) => row.ma_to_hop}
          onEdit={openEdit}
          onDelete={(row) => setDeletingRow(row)}
          onClickRow={openProgramsModal}
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
                if (page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1) {
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-8 h-8 rounded-lg text-[13px] font-bold transition-colors ${
                        currentPage === page ? "bg-[#192b59] text-white" : "text-[#475569] hover:bg-[#f8fafc]"
                      }`}
                    >
                      {page}
                    </button>
                  );
                } else if (page === currentPage - 2 || page === currentPage + 2) {
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

      <ModalForm isOpen={isModalOpen} title={editingRow ? "Sửa Tổ Hợp" : "Thêm Tổ Hợp Mới"} onClose={() => setIsModalOpen(false)} onSubmit={handleSave}>
        <div className="space-y-4">
          <div>
            <label className="block text-[12px] font-bold mb-1">Mã Tổ Hợp (Vd: A00):</label>
            <input
              type="text"
              required
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              disabled={!!editingRow}
              className={`w-full px-3 py-2 bg-[#f8fafc] border border-[#cbd5e1] rounded-lg text-[13px] font-bold uppercase ${editingRow ? 'opacity-70 cursor-not-allowed' : ''}`}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-[12px] font-bold mb-1">Môn 1:</label>
              <select required value={mon1} onChange={(e) => setMon1(e.target.value)} className="w-full px-3 py-2 bg-[#f8fafc] border border-[#cbd5e1] rounded-lg text-[13px] font-bold outline-none">
                <option value="" disabled>Chọn môn</option>
                {subjects.map(s => <option key={s.ma_mon} value={s.ma_mon}>{s.ten_mon}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[12px] font-bold mb-1">Môn 2:</label>
              <select required value={mon2} onChange={(e) => setMon2(e.target.value)} className="w-full px-3 py-2 bg-[#f8fafc] border border-[#cbd5e1] rounded-lg text-[13px] font-bold outline-none">
                <option value="" disabled>Chọn môn</option>
                {subjects.map(s => <option key={s.ma_mon} value={s.ma_mon}>{s.ten_mon}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[12px] font-bold mb-1">Môn 3:</label>
              <select required value={mon3} onChange={(e) => setMon3(e.target.value)} className="w-full px-3 py-2 bg-[#f8fafc] border border-[#cbd5e1] rounded-lg text-[13px] font-bold outline-none">
                <option value="" disabled>Chọn môn</option>
                {subjects.map(s => <option key={s.ma_mon} value={s.ma_mon}>{s.ten_mon}</option>)}
              </select>
            </div>
          </div>
        </div>
      </ModalForm>

      {/* Modal Ngành */}
      {isProgramsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div ref={programsDialogRef} role="dialog" aria-modal="true" aria-labelledby={programsTitleId} aria-busy={programPending || isLoadingPrograms} tabIndex={-1} className="bg-white rounded-2xl min-w-0 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden shadow-xl">
            <div className="px-4 sm:px-6 py-4 shrink-0 border-b border-[#e2e8f0] flex items-start justify-between gap-3">
              <h2 id={programsTitleId} className="min-w-0 flex-1 font-bold text-base sm:text-[18px] text-[#192b59]">
                Các Ngành Gắn Với Tổ Hợp <span className="text-[#0284c7]">{selectedToHop?.ma_to_hop}</span>
              </h2>
              <button type="button" aria-label="Đóng danh sách ngành của tổ hợp" disabled={programPending} onClick={closePrograms} className="shrink-0 text-[#475569] hover:bg-[#f8fafc] p-1.5 rounded-lg transition-colors">
                <AdminIcon name="close" className="text-[20px]" />
              </button>
            </div>

            <div className="p-4 sm:p-6 min-h-0 min-w-0 flex-1 overflow-y-auto space-y-6">
              <div className="bg-[#f8fafc] rounded-xl border border-[#e2e8f0] p-4 flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row sm:items-end gap-3">
                  <div className="min-w-0 w-full sm:flex-1">
                    <label className="block text-[12px] font-bold mb-1 text-[#475569]">Tìm & Chọn Ngành Mới</label>
                    <div className="relative">
                      <AdminIcon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748b] text-[18px]" />
                      <input
                        type="text"
                        placeholder="Tìm kiếm theo mã hoặc tên chương trình đào tạo..."
                        value={searchNewProgram}
                        onChange={(e) => setSearchNewProgram(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-white border border-[#cbd5e1] rounded-lg text-[13px] outline-none focus:border-[#192b59] focus:ring-1 focus:ring-[#192b59] transition-all"
                      />
                    </div>
                  </div>
                  <div className="w-full sm:w-24 sm:shrink-0">
                    <label className="block text-[12px] font-bold mb-1 text-[#475569]">Năm</label>
                    <input type="number" value={newYear} onChange={(e) => setNewYear(Number(e.target.value))} className="w-full px-3 py-2 bg-white border border-[#cbd5e1] rounded-lg text-[13px] outline-none" />
                  </div>
                  <button onClick={() => void runProgram(handleAddProgram)} disabled={programPending || isLoadingPrograms || selectedNewPrograms.length === 0} className="bg-[#192b59] text-white h-[38px] px-4 rounded-lg font-bold text-[13px] hover:bg-[#1a2b6d] disabled:opacity-50 transition-colors whitespace-nowrap">
                    Thêm {selectedNewPrograms.length > 0 && `(${selectedNewPrograms.length})`}
                  </button>
                </div>

                <div className="bg-white border border-[#e2e8f0] rounded-lg h-48 overflow-y-auto">
                  <div className="p-2 border-b border-[#e2e8f0] flex flex-wrap items-center justify-between sticky top-0 bg-white z-10 gap-2">
                    <span className="text-[12px] font-bold text-[#475569] ml-1">Đã chọn: {selectedNewPrograms.length}</span>
                    <div className="flex items-center gap-2 flex-wrap">
                      {uniqueYears.length > 0 && (
                        <>
                          <select
                            className="text-[12px] font-bold text-[#192b59] bg-[#f8fafc] border border-[#e2e8f0] rounded px-1.5 py-0.5 outline-none cursor-pointer"
                            onChange={(e) => {
                              if (!e.target.value) return;
                              const year = Number(e.target.value);
                              const programIds = programsList.filter(p => p.nam === year).map(p => p.chuong_trinh.ma_chuong_trinh);
                              setSelectedNewPrograms(programIds);
                              e.target.value = "";
                            }}
                          >
                            <option value="">Chọn theo năm cũ...</option>
                            {uniqueYears.map(y => (
                              <option key={y} value={y}>Năm {y}</option>
                            ))}
                          </select>
                          <span className="text-[#cbd5e1]">|</span>
                        </>
                      )}
                      <button
                        onClick={() => setSelectedNewPrograms(filteredAllPrograms.map(p => p.ma_chuong_trinh))}
                        className="text-[12px] font-bold text-[#0284c7] hover:underline"
                      >
                        Chọn tất cả (đang hiển thị)
                      </button>
                      <span className="text-[#cbd5e1]">|</span>
                      <button
                        onClick={() => setSelectedNewPrograms([])}
                        className="text-[12px] font-bold text-[#ba1a1a] hover:underline"
                      >
                        Bỏ chọn
                      </button>
                    </div>
                  </div>
                  {filteredAllPrograms.length === 0 ? (
                    <div className="p-4 text-center text-[13px] text-[#64748b]">Không tìm thấy chương trình đào tạo nào.</div>
                  ) : (
                    filteredAllPrograms.map(p => (
                      <label key={p.ma_chuong_trinh} className="flex items-start gap-2 p-2 hover:bg-[#f8fafc] cursor-pointer border-b border-[#f1f5f9] last:border-0">
                        <input
                          type="checkbox"
                          className="mt-0.5 accent-[#192b59] w-4 h-4"
                          checked={selectedNewPrograms.includes(p.ma_chuong_trinh)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedNewPrograms(prev => [...prev, p.ma_chuong_trinh]);
                            } else {
                              setSelectedNewPrograms(prev => prev.filter(id => id !== p.ma_chuong_trinh));
                            }
                          }}
                        />
                        <div className="flex-1">
                          <div className="text-[13px] font-medium text-[#1e293b] leading-tight">{p.ten_chuong_trinh}</div>
                          <div className="text-[11px] text-[#64748b]">{p.ma_chuong_trinh}</div>
                        </div>
                      </label>
                    ))
                  )}
                </div>
              </div>

              <div>
                <div className="flex min-w-0 flex-col gap-3 mb-3">
                  <h3 className="font-bold text-[14px] text-[#192b59]">Danh sách đã gán ({filteredAssignedPrograms.length})</h3>
                  <div className="flex min-w-0 flex-col sm:flex-row sm:items-center gap-2">
                    <select
                      value={filterAssignedYear}
                      onChange={(e) => setFilterAssignedYear(e.target.value === "" ? "" : Number(e.target.value))}
                      className="bg-[#f8fafc] border border-[#e2e8f0] rounded-md text-[12px] py-1.5 px-2 outline-none focus:border-[#192b59] font-bold text-[#192b59] cursor-pointer"
                    >
                      <option value="">Tất cả các năm</option>
                      {uniqueYears.map(y => (
                        <option key={y} value={y}>Năm {y}</option>
                      ))}
                    </select>
                    <div className="relative min-w-0 w-full sm:flex-1">
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
                </div>

                {isLoadingPrograms ? (
                <div className="text-center py-8 text-[#64748b]">Đang tải...</div>
              ) : filteredAssignedPrograms.length === 0 ? (
                <div className="text-center py-8 text-[#64748b]">Không có dữ liệu phù hợp.</div>
              ) : (
                <div className="min-w-0 w-full overflow-x-auto rounded-lg border border-[#e2e8f0]">
                <table className="w-full min-w-[420px] text-left border-collapse">
                  <thead>
                    <tr className="bg-[#f1f5f9] border-b border-[#e2e8f0] text-[12px] font-bold text-[#192b59] uppercase">
                      <th className="py-2.5 px-3">Tên Ngành</th>
                      <th className="py-2.5 px-3 w-20 text-center">Năm</th>
                      <th className="py-2.5 px-3 w-16 text-right">Xóa</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e2e8f0] text-[13px]">
                    {filteredAssignedPrograms.map(p => (
                      <tr key={p.ma_ctdt_to_hop} className="hover:bg-[#f8fafc]/60">
                        <td className="py-2.5 px-3 font-medium text-[#1e293b]">{p.chuong_trinh.ten_chuong_trinh}</td>
                        <td className="py-2.5 px-3 text-center">{p.nam}</td>
                        <td className="py-2.5 px-3 text-right">
                          <button disabled={programPending || isLoadingPrograms} onClick={() => void runProgram(() => handleRemoveProgram(p.ma_ctdt_to_hop))} className="text-[#ba1a1a] hover:bg-[#ffdad6] p-1.5 rounded transition-colors" title="Xóa">
                            <AdminIcon name="delete" className="text-[16px] block" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                </div>
              )}
              </div>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog isOpen={!!deletingRow} title="Xác Nhận Xóa Tổ Hợp" message={`Bạn có chắc muốn xóa tổ hợp ${deletingRow?.ma_to_hop}?`} onConfirm={confirmDelete} onCancel={() => setDeletingRow(null)} />
    </div>
  );
}

"use client";
import { AdminIcon } from "@/components/admin/AdminIcon";
import { publicError } from "@/libs/client-error";

import { useState, useEffect, useRef, useTransition } from "react";
import { useRouter } from "next/navigation";
import { DataTable, Column } from "@/components/admin/DataTable";
import { ModalForm } from "@/components/admin/ModalForm";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { toast } from "@/libs/admin-toast";
import { YearPicker } from "@/components/admin/YearPicker";
import {
  createChiTieuAction,
  updateChiTieuAction,
  deleteChiTieuAction,
  lockScoreYearAction,
} from "@/actions/chi_tieu.action";
import { useLoading } from "@/contexts/loadingContext";

interface ChiTieuClientProps {
  initialData: any[];
  programs: any[];
  methods: any[];
  currentYear: number;
  yearLocked?: boolean;
}

export default function ChiTieuClient({ initialData, programs, methods, currentYear, yearLocked = false }: ChiTieuClientProps) {
  const [lockModal, setLockModal] = useState(false);
  const [lockConfirmation, setLockConfirmation] = useState("");
  const [lockError, setLockError] = useState("");
  const router = useRouter();
  const { setLoading } = useLoading();
  const [data, setData] = useState(initialData);
  const saving = useRef(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isRefreshing, startRefresh] = useTransition();
  const refreshData = () => startRefresh(() => router.refresh());

  const [yearFilter, setYearFilter] = useState(currentYear.toString());

  useEffect(() => {
    setData(initialData);
    setYearFilter(String(currentYear));
    setLoading(false);
  }, [initialData, currentYear, setLoading]);
  
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [deletingRow, setDeletingRow] = useState<any | null>(null);

  // Create Form State
  const [createProgram, setCreateProgram] = useState("");
  const [createYear, setCreateYear] = useState(currentYear.toString());
  const [createTarget, setCreateTarget] = useState("");
  const [selectedMethods, setSelectedMethods] = useState<string[]>([]);

  // Edit Form State (for both Chi Tieu and Diem Trung Tuyen)
  const [editingRow, setEditingRow] = useState<any | null>(null);
  const [editTarget, setEditTarget] = useState("");
  const [editEnrolled, setEditEnrolled] = useState("");
  const [editScores, setEditScores] = useState<{ ma_diem_tt?: string; diem: string; original: string; ma_phuong_thuc: string; ten_phuong_thuc: string; nguyen_vong_toi_da: string; diem_uu_tien: string; min?: number; max?: number }[]>([]);

  const handleYearChange = (year: number) => {
    const y = String(year);
    setYearFilter(y);
    setLoading(true);
    router.push(`/admin/chi-tieu-diem-chuan?year=${y}`);
  };

  const openCreate = () => {
    setCreateProgram(programs[0]?.ma_chuong_trinh || "");
    setCreateYear(currentYear.toString());
    setCreateTarget("");
    setSelectedMethods([]);
    setIsCreateOpen(true);
  };

  const handleMethodToggle = (methodId: string) => {
    setSelectedMethods(prev => 
      prev.includes(methodId) ? prev.filter(id => id !== methodId) : [...prev, methodId]
    );
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createProgram || !createTarget || selectedMethods.length === 0) {
      toast.error("Vui lòng điền đủ thông tin và chọn ít nhất 1 phương thức xét tuyển!");
      return;
    }
    if (saving.current || isRefreshing) return;
    saving.current = true; setIsSaving(true);
    try {
      await createChiTieuAction({
        ma_chuong_trinh: createProgram,
        nam: parseInt(createYear),
        chi_tieu: parseInt(createTarget),
        phuong_thuc_ids: selectedMethods,
      });
      toast.success("Khởi tạo chỉ tiêu thành công!");
      setIsCreateOpen(false);
      refreshData();
    } catch (err: any) {
      toast.error(publicError(err.message || "Có lỗi xảy ra"));
    } finally {
      saving.current = false; setIsSaving(false);
    }
  };

  const openEdit = (row: any) => {
    setEditingRow(row);
    setEditTarget(row.chi_tieu.toString());
    setEditEnrolled(row.trung_tuyen?.toString() || "");
    
    // Map existing scores
    const codes = [...new Set<string>([...(row.phuong_thuc_ap_dung || []).map((item: any) => item.ma_phuong_thuc), ...row.diem_trung_tuyen.map((item: any) => item.ma_phuong_thuc)])];
    const mappedScores = codes.map(code => {
      const stored = row.diem_trung_tuyen.find((item: any) => item.ma_phuong_thuc === code);
      const method = methods.find(item => item.ma_phuong_thuc === code);
      return { ma_diem_tt: stored?.ma_diem_tt, diem: stored?.diem?.toString() ?? "", original: stored?.diem?.toString() ?? "",
        ma_phuong_thuc: code, ten_phuong_thuc: method?.ten_phuong_thuc ?? code,
        min: method?.diem_toi_thieu ?? undefined, max: method?.diem_toi_da ?? undefined,
        nguyen_vong_toi_da: stored?.nguyen_vong_toi_da?.toString() ?? "", diem_uu_tien: stored?.diem_uu_tien_toi_thieu?.toString() ?? "" };
    });
    setEditScores(mappedScores);
    setIsEditOpen(true);
  };

  const handleScoreChange = (index: number, field: string, value: string) => {
    const newScores = [...editScores];
    newScores[index] = { ...newScores[index], [field]: value };
    setEditScores(newScores);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const invalid = !yearLocked && editScores.find(score => score.diem.trim() !== "" && score.diem !== score.original &&
      (!Number.isFinite(Number(score.diem)) || score.min === undefined || score.max === undefined || Number(score.diem) < score.min || Number(score.diem) > score.max));
    if (invalid) { toast.error(`Điểm ${invalid.ten_phuong_thuc} phải trong khoảng ${invalid.min ?? "chưa cấu hình"}–${invalid.max ?? "chưa cấu hình"}.`); return; }
    if (saving.current || isRefreshing) return;
    saving.current = true; setIsSaving(true);
    try {
      await updateChiTieuAction(editingRow.ma_ls_dc, {
        chi_tieu: parseInt(editTarget),
        trung_tuyen: editEnrolled ? parseInt(editEnrolled) : undefined,
        phuong_thuc_ids: editScores.map(score => score.ma_phuong_thuc),
        diem_trung_tuyen: editScores.map(s => ({
          ma_diem_tt: s.ma_diem_tt,
          ma_phuong_thuc: s.ma_phuong_thuc,
          diem: s.diem.trim() === "" ? null : Number(s.diem),
          nguyen_vong_toi_da: s.nguyen_vong_toi_da ? parseInt(s.nguyen_vong_toi_da) : null,
          diem_uu_tien_toi_thieu: s.diem_uu_tien ? parseFloat(s.diem_uu_tien) : null,
        }))
      });
      toast.success("Cập nhật thành công!");
      setIsEditOpen(false);
      refreshData();
    } catch (err: any) {
      toast.error(publicError(err.message || "Có lỗi xảy ra"));
    } finally {
      saving.current = false; setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingRow) return;
    if (saving.current || isRefreshing) return;
    saving.current = true; setIsSaving(true);
    try {
      await deleteChiTieuAction(deletingRow.ma_ls_dc);
      toast.success("Xóa chỉ tiêu thành công!");
      setDeletingRow(null);
      refreshData();
    } catch (err: any) {
      toast.error(publicError(err.message || "Có lỗi xảy ra khi xóa"));
    } finally {
      saving.current = false; setIsSaving(false);
    }
  };

  const [search, setSearch] = useState("");

  const filteredData = data.filter((item: any) => {
    if (!search.trim()) return true;
    const term = search.toLowerCase();
    const progName = item.chuong_trinh?.ten_chuong_trinh?.toLowerCase() || "";
    const progCode = item.ma_chuong_trinh?.toLowerCase() || "";
    const majorCode = item.chuong_trinh?.ma_nganh?.toLowerCase() || "";
    return progName.includes(term) || progCode.includes(term) || majorCode.includes(term);
  });

  const columns: Column<any>[] = [
    {
      header: "Chương Trình Đào Tạo",
      accessor: (r) => (
        <div>
          <span className="font-bold block text-[14px] text-[#1e293b]">{r.chuong_trinh?.ten_chuong_trinh}</span>
          <span className="text-[11px] text-[#64748b]">Mã Ngành: <span className="font-bold text-[#192b59]">{r.chuong_trinh?.ma_nganh}</span></span>
        </div>
      ),
      className: "w-[30%]",
    },
    {
      header: "Năm Xét",
      accessor: (r) => <span className="font-bold text-[13px] bg-[#f1f5f9] px-2 py-0.5 rounded border border-[#cbd5e1]">{r.nam}</span>,
      className: "w-[90px] text-center",
    },
    {
      header: "Chỉ Tiêu",
      accessor: (r) => <span className="font-extrabold text-[13px] text-[#0284c7]">{r.chi_tieu} SV</span>,
      className: "w-[100px] text-center",
    },
    {
      header: "Trúng Tuyển",
      accessor: (r) => <span className="font-extrabold text-[13px] text-[#16a34a]">{r.trung_tuyen || 0} SV</span>,
      className: "w-[100px] text-center",
    },
    {
      header: "Điểm Chuẩn (Theo Phương Thức)",
      accessor: (r) => {
        const scores = r.diem_trung_tuyen || [];
        if (!scores.length) return <span className="text-[12px] text-[#64748b] italic">Chưa nhập điểm</span>;
        return (
          <div className="flex flex-wrap gap-1.5">
            {scores.map((s: any) => (
              <span
                key={s.ma_diem_tt || s.ma_phuong_thuc}
                className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded bg-[#f1f5f9] border border-[#cbd5e1]"
              >
                <span className="text-[#64748b] uppercase">{s.ma_phuong_thuc}:</span>
                <span className="text-[#ba1a1a] font-extrabold">{s.diem}đ</span>
              </span>
            ))}
          </div>
        );
      },
      className: "w-[35%]",
    },
  ];

  return (
    <fieldset disabled={isSaving || isRefreshing} aria-busy={isSaving || isRefreshing} className="min-w-0">
    <div className="space-y-6 pt-4">
      <div className="flex flex-col xl:flex-row xl:items-start justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-[26px] text-[#192b59]">Thiết Lập Chỉ Tiêu & Điểm Chuẩn</h1>
          <p className="text-[13px] text-[#475569]">Quản lý chỉ tiêu tuyển sinh theo từng năm và cài đặt điểm trúng tuyển chính thức cho các phương thức.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <YearPicker value={Number(yearFilter)} onChange={handleYearChange}
            years={[...new Set([currentYear, ...Array.from({ length: new Date().getFullYear() - 2000 + 2 }, (_, index) => new Date().getFullYear() + 1 - index)])].sort((a, b) => b - a)} />

          {!yearLocked && <button onClick={() => { setLockConfirmation(""); setLockError(""); setLockModal(true); }} className="rounded-xl border border-blue-900 px-4 py-2.5 font-bold text-blue-900">Khóa điểm năm {currentYear}</button>}
          <button disabled={yearLocked} onClick={openCreate} className="flex items-center gap-1.5 bg-[#fdb712] text-[#192b59] px-4 py-2.5 rounded-xl font-bold text-[13px] transition-colors hover:bg-[#e2a20a] disabled:opacity-50">
            <AdminIcon name="add_circle" className="text-[18px]" /> Thiết Lập Chỉ Tiêu
          </button>
        </div>
      </div>

      {yearLocked && <p role="status" className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-blue-950">Điểm năm {currentYear} đã khóa. Không thể thêm, sửa hoặc xóa điểm; vẫn có thể cập nhật chỉ tiêu và số trúng tuyển.</p>}
      {/* Toolbar with Search */}
      <div className="flex items-center justify-between">
        <div className="relative w-80">
          <AdminIcon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748b] text-[18px]" />
          <input
            type="text"
            placeholder="Tìm theo tên CTĐT hoặc mã ngành..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-[#cbd5e1] rounded-lg text-[13px] outline-none focus:border-[#192b59] focus:ring-1 focus:ring-[#192b59] transition-all"
          />
        </div>
        <span className="text-[12px] font-bold text-[#475569]">
          Tổng số: {filteredData.length} chương trình đào tạo
        </span>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-[#e2e8f0] overflow-hidden">
        <DataTable columns={columns} data={filteredData} onEdit={openEdit} onDelete={yearLocked ? undefined : (row) => setDeletingRow(row)} />
      </div>

      {/* CREATE MODAL */}
      <ModalForm isOpen={isCreateOpen} title="Khởi Tạo Chỉ Tiêu Tuyển Sinh Mới" onClose={() => setIsCreateOpen(false)} onSubmit={handleCreateSubmit}>
        <div className="space-y-4">
          <div>
            <label className="block text-[12px] font-bold mb-1 text-[#64748b] uppercase">Chương Trình Đào Tạo:</label>
            <select required value={createProgram} onChange={(e) => setCreateProgram(e.target.value)} className="w-full px-3 py-2 bg-[#f8fafc] border border-[#cbd5e1] rounded-lg text-[13px] font-bold focus:border-[#192b59] outline-none">
              <option value="" disabled>-- Chọn Chương Trình --</option>
              {programs.map(p => <option key={p.ma_chuong_trinh} value={p.ma_chuong_trinh}>{p.ma_chuong_trinh} — {p.ten_chuong_trinh}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[12px] font-bold mb-1 text-[#64748b] uppercase">Năm Tuyển Sinh:</label>
              <input type="number" required value={createYear} onChange={(e) => setCreateYear(e.target.value)} className="w-full px-3 py-2 bg-[#f8fafc] border border-[#cbd5e1] rounded-lg text-[13px] font-bold focus:border-[#192b59] outline-none" />
            </div>
            <div>
              <label className="block text-[12px] font-bold mb-1 text-[#64748b] uppercase">Chỉ Tiêu (SV):</label>
              <input type="number" required min="1" value={createTarget} onChange={(e) => setCreateTarget(e.target.value)} className="w-full px-3 py-2 bg-[#f8fafc] border border-[#cbd5e1] rounded-lg text-[13px] font-bold focus:border-[#192b59] outline-none" />
            </div>
          </div>
          <div>
            <label className="block text-[12px] font-bold mb-2 text-[#64748b] uppercase">Phương Thức Xét Tuyển Áp Dụng (Để nhập điểm chuẩn):</label>
            <div className="space-y-2 max-h-[200px] overflow-y-auto border border-[#cbd5e1] rounded-lg p-3 bg-white">
              {methods.map(m => (
                <label key={m.ma_phuong_thuc} className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={selectedMethods.includes(m.ma_phuong_thuc)} onChange={() => handleMethodToggle(m.ma_phuong_thuc)} className="w-4 h-4" />
                  <span className="text-[13px] font-medium">{m.ma_phuong_thuc} — {m.ten_phuong_thuc} · {m.nhom_xet_tuyen ? `${m.diem_toi_thieu}–${m.diem_toi_da}` : "Cần cấu hình thang điểm trước khi nhập điểm"}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </ModalForm>

      {/* EDIT MODAL (Update Target & Scores) */}
      <ModalForm isOpen={isEditOpen} title={`Cập Nhật Chỉ Tiêu & Điểm Chuẩn ${editingRow?.nam}`} onClose={() => setIsEditOpen(false)} onSubmit={handleEditSubmit}>
        <div className="space-y-6">
          <div className="bg-[#f8f9fa] p-4 rounded-xl border border-[#e5e7eb]">
            <h3 className="font-bold text-[16px] text-[#192b59] mb-1">{editingRow?.chuong_trinh?.ten_chuong_trinh}</h3>
            <p className="text-[12px] text-[#475569]">Năm Xét Tuyển: {editingRow?.nam}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[12px] font-bold mb-1 text-[#64748b] uppercase">Chỉ Tiêu (SV):</label>
              <input type="number" required min="1" value={editTarget} onChange={(e) => setEditTarget(e.target.value)} className="w-full px-3 py-2 bg-[#f8fafc] border border-[#cbd5e1] rounded-lg text-[13px] font-bold focus:border-[#192b59] outline-none" />
            </div>
            <div>
              <label className="block text-[12px] font-bold mb-1 text-[#64748b] uppercase">Đã Trúng Tuyển (Thực tế):</label>
              <input type="number" min="0" value={editEnrolled} onChange={(e) => setEditEnrolled(e.target.value)} className="w-full px-3 py-2 bg-[#f8fafc] border border-[#cbd5e1] rounded-lg text-[13px] font-bold focus:border-[#192b59] outline-none" />
            </div>
          </div>

          <div>
            <label className="block text-[12px] font-bold mb-2 text-[#64748b] uppercase">Điểm Chuẩn Từng Phương Thức:</label>
            {!yearLocked && <label className="mb-3 block text-sm">Thêm phương thức nhập điểm
              <select aria-label="Thêm phương thức nhập điểm" value="" onChange={event => {
                const method = methods.find(item => item.ma_phuong_thuc === event.target.value);
                if (!method) return;
                setEditScores(prev => [...prev, { ma_phuong_thuc: method.ma_phuong_thuc, ten_phuong_thuc: method.ten_phuong_thuc,
                  diem: "", original: "", min: method.diem_toi_thieu ?? undefined, max: method.diem_toi_da ?? undefined, nguyen_vong_toi_da: "", diem_uu_tien: "" }]);
              }} className="mt-2 w-full rounded-xl border border-slate-300 bg-white p-3">
                <option value="">Chọn phương thức cần thêm</option>
                {methods.filter(method => !editScores.some(score => score.ma_phuong_thuc === method.ma_phuong_thuc)).map(method => <option key={method.ma_phuong_thuc} value={method.ma_phuong_thuc}>{method.ma_phuong_thuc} — {method.ten_phuong_thuc}</option>)}
              </select></label>}
            <p className="mb-3 text-sm text-slate-500">Để trống nếu chưa có điểm chuẩn. Nhập 0 chỉ khi điểm chuẩn chính thức là 0.</p>
            <div className="space-y-3">
              {editScores.map((score, idx) => (
                <div key={score.ma_phuong_thuc} className="flex items-center gap-3 p-3 border border-[#e5e7eb] rounded-lg bg-white">
                  <div className="w-[40%]">
                    <span className="text-[12px] font-bold block">{score.ten_phuong_thuc}</span>
                  </div>
                  <div className="w-[20%]">
                    <input aria-label={`Điểm chuẩn ${score.ma_phuong_thuc}`} disabled={yearLocked} type="number" min={score.min} max={score.max} step="0.01" placeholder="Chưa nhập điểm" value={score.diem} onChange={(e) => handleScoreChange(idx, "diem", e.target.value)} className="w-full px-2 py-1.5 border border-[#cbd5e1] rounded-lg text-[13px] outline-none focus:border-[#192b59]" />
                    <small>{score.min === undefined || score.max === undefined ? "Chưa cấu hình giới hạn" : `${score.min}–${score.max}`}</small>
                  </div>
                  <div className="w-[20%]">
                    <input disabled={yearLocked} type="number" placeholder="NV Tối Đa (VD: 2)" value={score.nguyen_vong_toi_da} onChange={(e) => handleScoreChange(idx, "nguyen_vong_toi_da", e.target.value)} className="w-full px-2 py-1.5 border border-[#cbd5e1] rounded-lg text-[13px] outline-none focus:border-[#192b59]" />
                  </div>
                  <div className="w-[20%]">
                    <input disabled={yearLocked} type="number" step="0.01" placeholder="Điểm Ưu Tiên" value={score.diem_uu_tien} onChange={(e) => handleScoreChange(idx, "diem_uu_tien", e.target.value)} className="w-full px-2 py-1.5 border border-[#cbd5e1] rounded-lg text-[13px] outline-none focus:border-[#192b59]" />
                  </div>
                </div>
              ))}
              {editScores.length === 0 && (
                <p className="text-[12px] text-center text-[#64748b] py-4 italic">Chưa có phương thức. Chọn phương thức ở trên để nhập điểm; chỉ tiêu cũ được giữ nguyên.</p>
              )}
            </div>
          </div>
        </div>
      </ModalForm>

      <ModalForm isOpen={lockModal} title={`Khóa điểm năm ${currentYear}`} onClose={() => setLockModal(false)} onSubmit={async event => {
        event.preventDefault(); if (lockConfirmation !== String(currentYear)) { setLockError("Nhập đúng năm để xác nhận khóa"); return; }
        try { await lockScoreYearAction(currentYear, Number(lockConfirmation)); setLockModal(false); toast.success(`Đã khóa điểm năm ${currentYear}`); refreshData(); }
        catch { setLockError("Không khóa được điểm. Vui lòng tải lại và thử lại."); }
      }}>
        <p>Khóa điểm toàn bộ chương trình trong năm {currentYear}. Sau khi khóa không thể thêm, đổi hoặc xóa điểm chuẩn, kể cả gửi trực tiếp qua API.</p>
        <label className="block">Nhập năm để khóa<input aria-label="Năm xác nhận khóa điểm" required value={lockConfirmation} onChange={e => setLockConfirmation(e.target.value)} className="mt-2 w-full rounded-xl border p-3" /></label>
        {lockError && <p role="alert" className="text-red-700">{lockError}</p>}
      </ModalForm>
      <ConfirmDialog isOpen={!!deletingRow} title="Xác Nhận Xóa Chỉ Tiêu" message={`Bạn có chắc muốn xóa cấu hình chỉ tiêu của "${deletingRow?.chuong_trinh?.ten_chuong_trinh}" năm ${deletingRow?.nam}? Thao tác này sẽ xóa toàn bộ điểm chuẩn liên quan.`} onConfirm={handleDelete} onCancel={() => setDeletingRow(null)} />
    </div>
    </fieldset>
  );
}

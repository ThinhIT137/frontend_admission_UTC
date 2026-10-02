"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DataTable, Column } from "@/components/admin/DataTable";
import { ModalForm } from "@/components/admin/ModalForm";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { toast } from "sonner";
import {
  createChiTieuAction,
  updateChiTieuAction,
  deleteChiTieuAction,
} from "@/actions/chi_tieu.action";
import { useLoading } from "@/contexts/loadingContext";

interface ChiTieuClientProps {
  initialData: any[];
  programs: any[];
  methods: any[];
  currentYear: number;
}

export default function ChiTieuClient({ initialData, programs, methods, currentYear }: ChiTieuClientProps) {
  const router = useRouter();
  const { setLoading } = useLoading();
  const [data, setData] = useState(initialData);
  const [yearFilter, setYearFilter] = useState(currentYear.toString());

  useEffect(() => {
    setData(initialData);
    setLoading(false);
  }, [initialData, setLoading]);
  
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
  const [editScores, setEditScores] = useState<{ ma_diem_tt: string; diem: string; ma_phuong_thuc: string; ten_phuong_thuc: string; nguyen_vong_toi_da: string; diem_uu_tien: string }[]>([]);

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const y = e.target.value;
    setYearFilter(y);
    setLoading(true);
    toast.success(`Đang tải dữ liệu năm ${y}...`);
    router.push(`/admin/chi-tieu-diem-chuan?year=${y}`);
  };

  const openCreate = () => {
    setCreateProgram(programs[0]?.ma_chuong_trinh || "");
    setCreateYear(currentYear.toString());
    setCreateTarget("");
    setSelectedMethods(methods.map(m => m.ma_phuong_thuc)); // Default select all
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
    try {
      await createChiTieuAction({
        ma_chuong_trinh: createProgram,
        nam: parseInt(createYear),
        chi_tieu: parseInt(createTarget),
        phuong_thuc_ids: selectedMethods,
      });
      toast.success("Khởi tạo chỉ tiêu thành công!");
      setIsCreateOpen(false);
      window.location.reload();
    } catch (err: any) {
      toast.error(err.message || "Có lỗi xảy ra");
    }
  };

  const openEdit = (row: any) => {
    setEditingRow(row);
    setEditTarget(row.chi_tieu.toString());
    setEditEnrolled(row.trung_tuyen?.toString() || "");
    
    // Map existing scores
    const mappedScores = row.diem_trung_tuyen.map((d: any) => ({
      ma_diem_tt: d.ma_diem_tt,
      diem: d.diem.toString(),
      ma_phuong_thuc: d.phuong_thuc.ma_phuong_thuc,
      ten_phuong_thuc: d.phuong_thuc.ten_phuong_thuc,
      nguyen_vong_toi_da: d.nguyen_vong_toi_da?.toString() || "",
      diem_uu_tien: d.diem_uu_tien_toi_thieu?.toString() || "",
    }));
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
    try {
      await updateChiTieuAction(editingRow.ma_ls_dc, {
        chi_tieu: parseInt(editTarget),
        trung_tuyen: editEnrolled ? parseInt(editEnrolled) : undefined,
        diem_trung_tuyen: editScores.map(s => ({
          ma_diem_tt: s.ma_diem_tt,
          diem: parseFloat(s.diem) || 0,
          nguyen_vong_toi_da: s.nguyen_vong_toi_da ? parseInt(s.nguyen_vong_toi_da) : null,
          diem_uu_tien_toi_thieu: s.diem_uu_tien ? parseFloat(s.diem_uu_tien) : null,
        }))
      });
      toast.success("Cập nhật thành công!");
      setIsEditOpen(false);
      window.location.reload();
    } catch (err: any) {
      toast.error(err.message || "Có lỗi xảy ra");
    }
  };

  const handleDelete = async () => {
    if (!deletingRow) return;
    try {
      await deleteChiTieuAction(deletingRow.ma_ls_dc);
      toast.success("Xóa chỉ tiêu thành công!");
      setDeletingRow(null);
      window.location.reload();
    } catch (err: any) {
      toast.error(err.message || "Có lỗi xảy ra khi xóa");
    }
  };

  const columns: Column<any>[] = [
    {
      header: "Chương Trình Đào Tạo",
      accessor: (r) => (
        <div>
          <span className="font-bold block text-[14px] text-[#1e1b14]">{r.chuong_trinh.ten_chuong_trinh}</span>
          <span className="text-[11px] text-[#767680]">Mã Ngành: {r.chuong_trinh.ma_nganh}</span>
        </div>
      ),
      className: "w-[40%]",
    },
    {
      header: "Năm Xét Tuyển",
      accessor: (r) => <span className="font-bold text-[13px]">{r.nam}</span>,
      className: "w-[120px] text-center",
    },
    {
      header: "Chỉ Tiêu",
      accessor: (r) => <span className="font-bold text-[13px] text-[#0284c7]">{r.chi_tieu} Sinh Viên</span>,
      className: "w-[120px] text-center",
    },
    {
      header: "Trúng Tuyển",
      accessor: (r) => <span className="font-bold text-[13px] text-[#16a34a]">{r.trung_tuyen || 0} Sinh Viên</span>,
      className: "w-[120px] text-center",
    },
  ];

  return (
    <div className="space-y-6 pt-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-[26px] text-[#0d1b4e]">Thiết Lập Chỉ Tiêu & Điểm Chuẩn</h1>
          <p className="text-[13px] text-[#45464f]">Quản lý chỉ tiêu tuyển sinh theo từng năm và cài đặt điểm chuẩn cho các phương thức.</p>
        </div>
        <div className="flex items-center gap-3">
          <select 
            value={yearFilter} 
            onChange={handleYearChange}
            className="px-4 py-2.5 bg-white border border-[#c6c5d0] rounded-xl text-[13px] font-bold outline-none cursor-pointer"
          >
            {[currentYear + 1, currentYear, currentYear - 1, currentYear - 2].map(y => (
              <option key={y} value={y}>Năm {y}</option>
            ))}
          </select>

          <button onClick={openCreate} className="flex items-center gap-1.5 bg-[#fdb712] text-[#0d1b4e] px-4 py-2.5 rounded-xl font-bold text-[13px] transition-colors hover:bg-[#e2a20a]">
            <span className="material-symbols-outlined text-[18px]">add_circle</span> Thiết Lập Chỉ Tiêu
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-[#e9e2d5] overflow-hidden">
        <DataTable columns={columns} data={data} onEdit={openEdit} onDelete={(row) => setDeletingRow(row)} />
      </div>

      {/* CREATE MODAL */}
      <ModalForm isOpen={isCreateOpen} title="Khởi Tạo Chỉ Tiêu Tuyển Sinh Mới" onClose={() => setIsCreateOpen(false)} onSubmit={handleCreateSubmit}>
        <div className="space-y-4">
          <div>
            <label className="block text-[12px] font-bold mb-1 text-[#767680] uppercase">Chương Trình Đào Tạo:</label>
            <select required value={createProgram} onChange={(e) => setCreateProgram(e.target.value)} className="w-full px-3 py-2 bg-[#faf3e6] border border-[#c6c5d0] rounded-lg text-[13px] font-bold focus:border-[#0d1b4e] outline-none">
              <option value="" disabled>-- Chọn Chương Trình --</option>
              {programs.map(p => <option key={p.ma_chuong_trinh} value={p.ma_chuong_trinh}>{p.ten_chuong_trinh}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[12px] font-bold mb-1 text-[#767680] uppercase">Năm Tuyển Sinh:</label>
              <input type="number" required value={createYear} onChange={(e) => setCreateYear(e.target.value)} className="w-full px-3 py-2 bg-[#faf3e6] border border-[#c6c5d0] rounded-lg text-[13px] font-bold focus:border-[#0d1b4e] outline-none" />
            </div>
            <div>
              <label className="block text-[12px] font-bold mb-1 text-[#767680] uppercase">Chỉ Tiêu (SV):</label>
              <input type="number" required min="1" value={createTarget} onChange={(e) => setCreateTarget(e.target.value)} className="w-full px-3 py-2 bg-[#faf3e6] border border-[#c6c5d0] rounded-lg text-[13px] font-bold focus:border-[#0d1b4e] outline-none" />
            </div>
          </div>
          <div>
            <label className="block text-[12px] font-bold mb-2 text-[#767680] uppercase">Phương Thức Xét Tuyển Áp Dụng (Để nhập điểm chuẩn):</label>
            <div className="space-y-2 max-h-[200px] overflow-y-auto border border-[#c6c5d0] rounded-lg p-3 bg-white">
              {methods.map(m => (
                <label key={m.ma_phuong_thuc} className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={selectedMethods.includes(m.ma_phuong_thuc)} onChange={() => handleMethodToggle(m.ma_phuong_thuc)} className="w-4 h-4" />
                  <span className="text-[13px] font-medium">{m.ten_phuong_thuc}</span>
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
            <h3 className="font-bold text-[16px] text-[#0d1b4e] mb-1">{editingRow?.chuong_trinh?.ten_chuong_trinh}</h3>
            <p className="text-[12px] text-[#45464f]">Năm Xét Tuyển: {editingRow?.nam}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[12px] font-bold mb-1 text-[#767680] uppercase">Chỉ Tiêu (SV):</label>
              <input type="number" required min="1" value={editTarget} onChange={(e) => setEditTarget(e.target.value)} className="w-full px-3 py-2 bg-[#faf3e6] border border-[#c6c5d0] rounded-lg text-[13px] font-bold focus:border-[#0d1b4e] outline-none" />
            </div>
            <div>
              <label className="block text-[12px] font-bold mb-1 text-[#767680] uppercase">Đã Trúng Tuyển (Thực tế):</label>
              <input type="number" min="0" value={editEnrolled} onChange={(e) => setEditEnrolled(e.target.value)} className="w-full px-3 py-2 bg-[#faf3e6] border border-[#c6c5d0] rounded-lg text-[13px] font-bold focus:border-[#0d1b4e] outline-none" />
            </div>
          </div>

          <div>
            <label className="block text-[12px] font-bold mb-2 text-[#767680] uppercase">Điểm Chuẩn Từng Phương Thức:</label>
            <div className="space-y-3">
              {editScores.map((score, idx) => (
                <div key={score.ma_diem_tt} className="flex items-center gap-3 p-3 border border-[#e5e7eb] rounded-lg bg-white">
                  <div className="w-[40%]">
                    <span className="text-[12px] font-bold block">{score.ten_phuong_thuc}</span>
                  </div>
                  <div className="w-[20%]">
                    <input type="number" step="0.01" placeholder="Điểm Chuẩn" value={score.diem} onChange={(e) => handleScoreChange(idx, "diem", e.target.value)} className="w-full px-2 py-1.5 border border-[#c6c5d0] rounded-lg text-[13px] outline-none focus:border-[#0d1b4e]" />
                  </div>
                  <div className="w-[20%]">
                    <input type="number" placeholder="NV Tối Đa (VD: 2)" value={score.nguyen_vong_toi_da} onChange={(e) => handleScoreChange(idx, "nguyen_vong_toi_da", e.target.value)} className="w-full px-2 py-1.5 border border-[#c6c5d0] rounded-lg text-[13px] outline-none focus:border-[#0d1b4e]" />
                  </div>
                  <div className="w-[20%]">
                    <input type="number" step="0.01" placeholder="Điểm Ưu Tiên" value={score.diem_uu_tien} onChange={(e) => handleScoreChange(idx, "diem_uu_tien", e.target.value)} className="w-full px-2 py-1.5 border border-[#c6c5d0] rounded-lg text-[13px] outline-none focus:border-[#0d1b4e]" />
                  </div>
                </div>
              ))}
              {editScores.length === 0 && (
                <p className="text-[12px] text-center text-[#767680] py-4 italic">Chưa có phương thức nào được thiết lập. Hãy xóa và khởi tạo lại chỉ tiêu này để thêm phương thức.</p>
              )}
            </div>
          </div>
        </div>
      </ModalForm>

      <ConfirmDialog isOpen={!!deletingRow} title="Xác Nhận Xóa Chỉ Tiêu" message={`Bạn có chắc muốn xóa cấu hình chỉ tiêu của "${deletingRow?.chuong_trinh?.ten_chuong_trinh}" năm ${deletingRow?.nam}? Thao tác này sẽ xóa toàn bộ điểm chuẩn liên quan.`} onConfirm={handleDelete} onCancel={() => setDeletingRow(null)} />
    </div>
  );
}

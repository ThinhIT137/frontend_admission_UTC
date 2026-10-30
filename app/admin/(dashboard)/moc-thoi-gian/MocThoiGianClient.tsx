"use client";
import { AdminIcon } from "@/components/admin/AdminIcon";
import { publicError } from "@/libs/client-error";

import { useState, useEffect, useRef, useTransition } from "react";
import { useRouter } from "next/navigation";
import { DataTable, Column } from "@/components/admin/DataTable";
import { ModalForm } from "@/components/admin/ModalForm";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { toast } from "@/libs/admin-toast";
import {
  createLoTrinhTuyenSinhAction,
  updateLoTrinhTuyenSinhAction,
  deleteLoTrinhTuyenSinhAction,
} from "@/actions/lo_trinh_tuyen_sinh.action";

export default function MocThoiGianClient({ initialData }: { initialData: any[] }) {
  const [data, setData] = useState(initialData);
  const router = useRouter();
  const saving = useRef(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isRefreshing, startRefresh] = useTransition();
  const refreshData = () => startRefresh(() => router.refresh());

  // Đồng bộ dữ liệu mới từ Server Component sau router.refresh().
  useEffect(() => setData(initialData), [initialData]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<any | null>(null);
  const [deletingRow, setDeletingRow] = useState<any | null>(null);

  const [title, setTitle] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [description, setDescription] = useState("");
  const dateError = !!startDate && !!endDate && startDate > endDate ? "Ngày bắt đầu không được sau ngày kết thúc" : "";

  const formatDateForInput = (dateString: string | null) => {
    if (!dateString) return "";
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return "";
    return d.toISOString().split("T")[0];
  };

  const openCreate = () => {
    setEditingRow(null);
    setTitle("");
    setStartDate("");
    setEndDate("");
    setDescription("");
    setIsModalOpen(true);
  };

  const openEdit = (row: any) => {
    setEditingRow(row);
    setTitle(row.ten_su_kien);
    setStartDate(formatDateForInput(row.thoi_gian_bat_dau));
    setEndDate(formatDateForInput(row.thoi_gian_ket_thuc));
    setDescription(row.ghi_chu || "");
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !startDate) {
      toast.error("Vui lòng nhập tên sự kiện và ngày bắt đầu!");
      return;
    }
    if (dateError) { toast.error(dateError); return; }

    if (saving.current || isRefreshing) return;
    saving.current = true; setIsSaving(true);
    try {
      if (editingRow) {
        await updateLoTrinhTuyenSinhAction(editingRow.ma_su_kien, {
          ten_su_kien: title,
          thoi_gian_bat_dau: new Date(startDate),
          thoi_gian_ket_thuc: endDate ? new Date(endDate) : null,
          ghi_chu: description,
        });
        toast.success("Cập nhật sự kiện thành công!");
      } else {
        await createLoTrinhTuyenSinhAction({
          ten_su_kien: title,
          thoi_gian_bat_dau: new Date(startDate),
          thoi_gian_ket_thuc: endDate ? new Date(endDate) : null,
          ghi_chu: description,
        });
        toast.success("Thêm mới sự kiện thành công!");
      }
      setIsModalOpen(false);
      
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
      await deleteLoTrinhTuyenSinhAction(deletingRow.ma_su_kien);
      toast.success("Xóa sự kiện thành công!");
      setDeletingRow(null);
      refreshData();
    } catch (err: any) {
      toast.error(publicError(err.message || "Có lỗi xảy ra khi xóa"));
    } finally {
      saving.current = false; setIsSaving(false);
    }
  };

  const getStatus = (start: string, end: string | null) => {
    const now = new Date().getTime();
    const startTime = new Date(start).getTime();
    const endTime = end ? new Date(end).getTime() : Infinity;

    if (now < startTime) return { label: "SẮP DIỄN RA", code: "UPCOMING" };
    if (now > endTime) return { label: "ĐÃ KẾT THÚC", code: "PAST" };
    return { label: "ĐANG DIỄN RA", code: "ACTIVE" };
  };

  const columns: Column<any>[] = [
    {
      header: "Tên Mốc Thời Gian",
      accessor: (r) => (
        <div>
          <span className="font-bold block text-[14px] text-[#1e293b]">{r.ten_su_kien}</span>
          <span className="text-[11px] text-[#64748b]">{r.ghi_chu}</span>
        </div>
      ),
      className: "w-full",
    },
    {
      header: "Thời Gian",
      accessor: (r) => {
        const start = new Date(r.thoi_gian_bat_dau).toLocaleDateString("vi-VN");
        const end = r.thoi_gian_ket_thuc ? new Date(r.thoi_gian_ket_thuc).toLocaleDateString("vi-VN") : "Chưa xác định";
        return (
          <span className="font-mono font-bold text-[#0284c7]">
            {start} → {end}
          </span>
        );
      },
      className: "w-[220px]",
    },
    {
      header: "Trạng Thái",
      accessor: (r) => {
        const status = getStatus(r.thoi_gian_bat_dau, r.thoi_gian_ket_thuc);
        let bgColor = "bg-[#eef2ff]";
        let textColor = "text-[#192b59]";
        if (status.code === "ACTIVE") {
          bgColor = "bg-[#86efac]";
          textColor = "text-[#111827]";
        } else if (status.code === "PAST") {
          bgColor = "bg-[#e5e7eb]";
          textColor = "text-[#4b5563]";
        }

        return (
          <span className={`px-2 py-0.5 rounded font-bold text-[10px] whitespace-nowrap ${bgColor} ${textColor}`}>
            {status.label}
          </span>
        );
      },
      className: "w-[120px] text-center",
    },
  ];

  const [viewMode, setViewMode] = useState<"timeline" | "table">("timeline");
  const [search, setSearch] = useState("");

  const filteredData = data.filter((item) => {
    if (!search.trim()) return true;
    const term = search.toLowerCase();
    return (
      item.ten_su_kien?.toLowerCase().includes(term) ||
      item.ghi_chu?.toLowerCase().includes(term)
    );
  });

  return (
    <fieldset disabled={isSaving || isRefreshing} aria-busy={isSaving || isRefreshing} className="min-w-0">
    <div className="space-y-6 pt-4">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#e2e8f0] pb-4">
        <div>
          <div className="inline-block px-2.5 py-0.5 rounded bg-[#fdb712] text-[#192b59] font-stamp text-[11px] font-bold uppercase mb-2">
            Tuyển Sinh K66 UTC
          </div>
          <h1 className="font-display font-black text-[28px] text-[#192b59] leading-tight">
            Quản Lý Mốc Thời Gian Lộ Trình
          </h1>
          <p className="text-[13px] text-[#475569] mt-0.5">
            Theo dõi và cấu hình các mốc quan trọng trong kế hoạch tuyển sinh UTC.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Mode Switcher */}
          <div className="flex bg-[#f8fafc] p-1 rounded-xl border border-[#cbd5e1]">
            <button
              onClick={() => setViewMode("timeline")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-bold transition-all ${
                viewMode === "timeline"
                  ? "bg-[#192b59] text-white shadow-xs"
                  : "text-[#64748b] hover:text-[#192b59]"
              }`}
            >
              <AdminIcon name="timeline" className="text-[16px]" />
              Lộ Trình
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-bold transition-all ${
                viewMode === "table"
                  ? "bg-[#192b59] text-white shadow-xs"
                  : "text-[#64748b] hover:text-[#192b59]"
              }`}
            >
              <AdminIcon name="table_rows" className="text-[16px]" />
              Dạng Bảng
            </button>
          </div>

          <button
            onClick={openCreate}
            className="flex items-center gap-1.5 bg-[#fdb712] text-[#192b59] px-4 py-2.5 rounded-xl font-bold text-[13px] transition-colors hover:bg-[#e2a20a] shadow-xs"
          >
            <AdminIcon name="add_circle" className="text-[18px]" />
            Thêm Mốc Mới
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="relative w-80">
          <AdminIcon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748b] text-[18px]" />
          <input
            type="text"
            placeholder="Tìm theo tên mốc hoặc nội dung..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-[#cbd5e1] rounded-lg text-[13px] outline-none focus:border-[#192b59] focus:ring-1 focus:ring-[#192b59] transition-all"
          />
        </div>
        <span className="text-[12px] font-bold text-[#475569]">
          Tổng số: {filteredData.length} mốc thời gian
        </span>
      </div>

      {/* Content: Timeline Mode vs Table Mode */}
      {viewMode === "timeline" ? (
        <div className="relative pl-6 sm:pl-8 border-l-2 border-[#192b59]/20 space-y-6 ml-4 sm:ml-6 my-4">
          {filteredData.map((item, idx) => {
            const status = getStatus(item.thoi_gian_bat_dau, item.thoi_gian_ket_thuc);
            const start = new Date(item.thoi_gian_bat_dau).toLocaleDateString("vi-VN");
            const end = item.thoi_gian_ket_thuc
              ? new Date(item.thoi_gian_ket_thuc).toLocaleDateString("vi-VN")
              : "Chưa xác định";

            const isCurrent = status.code === "ACTIVE";

            return (
              <div key={item.ma_su_kien || idx} className="relative group">
                {/* Node icon on timeline */}
                <div
                  className={`absolute -left-[35px] sm:-left-[43px] top-1.5 w-6 h-6 rounded-full border-4 flex items-center justify-center transition-all ${
                    isCurrent
                      ? "bg-[#16a34a] border-white shadow-[0_0_12px_rgba(22,163,74,0.6)] animate-pulse"
                      : status.code === "PAST"
                      ? "bg-[#94a3b8] border-white"
                      : "bg-[#fdb712] border-white"
                  }`}
                />

                {/* Event Card */}
                <div className="bg-white p-5 rounded-2xl border border-[#e2e8f0] shadow-xs hover:shadow-md transition-all">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[#e2e8f0]/60">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[12px] font-extrabold text-[#0284c7] bg-[#e0f2fe] px-2.5 py-0.5 rounded-md">
                        {start} → {end}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                          isCurrent
                            ? "bg-[#86efac] text-[#065f46]"
                            : status.code === "PAST"
                            ? "bg-[#e2e8f0] text-[#475569]"
                            : "bg-[#fef3c7] text-[#92400e]"
                        }`}
                      >
                        {status.label}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 opacity-90 group-hover:opacity-100">
                      <button
                        onClick={() => openEdit(item)}
                        className="px-2.5 py-1 text-[12px] font-bold text-[#192b59] hover:bg-[#f8fafc] rounded-md transition-colors flex items-center gap-1"
                      >
                        <AdminIcon name="edit" className="text-[15px]" />
                        Sửa
                      </button>
                      <button
                        onClick={() => setDeletingRow(item)}
                        className="px-2.5 py-1 text-[12px] font-bold text-[#ba1a1a] hover:bg-rose-50 rounded-md transition-colors flex items-center gap-1"
                      >
                        <AdminIcon name="delete" className="text-[15px]" />
                        Xóa
                      </button>
                    </div>
                  </div>

                  <h3 className="font-display font-bold text-[16px] text-[#192b59] mt-2.5">
                    {item.ten_su_kien}
                  </h3>
                  {item.ghi_chu && (
                    <p className="text-[13px] text-[#64748b] mt-1 leading-relaxed whitespace-pre-line">
                      {item.ghi_chu}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-[#e2e8f0] overflow-hidden">
          <DataTable
            columns={columns}
            data={filteredData}
            onEdit={openEdit}
            onDelete={(row) => setDeletingRow(row)}
          />
        </div>
      )}

      <ModalForm isOpen={isModalOpen} title={editingRow ? "Sửa Mốc Thời Gian" : "Thêm Mốc Thời Gian"} onClose={() => setIsModalOpen(false)} onSubmit={handleSave}>
        <div className="space-y-4">
          <div>
            <label className="block text-[12px] font-bold mb-1 text-[#64748b] uppercase">Tên Mốc Tuyển Sinh:</label>
            <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-3 py-2 bg-[#f8fafc] border border-[#cbd5e1] rounded-lg text-[13px] font-bold focus:border-[#192b59] outline-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[12px] font-bold mb-1 text-[#64748b] uppercase">Ngày Bắt Đầu:</label>
              <input aria-label="Ngày bắt đầu" type="date" required max={endDate || undefined} aria-invalid={!!dateError} value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full px-3 py-2 bg-[#f8fafc] border border-[#cbd5e1] rounded-lg text-[13px] focus:border-[#192b59] outline-none" />
            </div>
            <div>
              <label className="block text-[12px] font-bold mb-1 text-[#64748b] uppercase">Ngày Kết Thúc (Tùy chọn):</label>
              <input aria-label="Ngày kết thúc" type="date" min={startDate || undefined} aria-invalid={!!dateError} value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full px-3 py-2 bg-[#f8fafc] border border-[#cbd5e1] rounded-lg text-[13px] focus:border-[#192b59] outline-none" />
            </div>
          </div>
          {dateError && <p role="alert" className="text-sm font-semibold text-red-700">{dateError}</p>}
          <div>
            <label className="block text-[12px] font-bold mb-1 text-[#64748b] uppercase">Mô Tả Chi Tiết:</label>
            <textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} className="w-full px-3 py-2 bg-[#f8fafc] border border-[#cbd5e1] rounded-lg text-[13px] focus:border-[#192b59] outline-none" />
          </div>
        </div>
      </ModalForm>

      <ConfirmDialog isOpen={!!deletingRow} title="Xác Nhận Xóa Mốc Thời Gian" message={`Bạn có chắc muốn xóa mốc "${deletingRow?.ten_su_kien}"?`} onConfirm={handleDelete} onCancel={() => setDeletingRow(null)} />
    </div>
    </fieldset>
  );
}

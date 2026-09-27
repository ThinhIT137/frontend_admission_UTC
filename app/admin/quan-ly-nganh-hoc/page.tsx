"use client";

import { useState, useEffect } from "react";
import { DataTable, Column } from "@/components/admin/DataTable";
import { ModalForm } from "@/components/admin/ModalForm";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { MajorFromApi } from "@/app/(main)/tra-cuu-nganh-hoc/page";

export default function ManageMajorsPage() {
  const [data, setData] = useState<MajorFromApi[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<MajorFromApi | null>(null);
  const [deletingRow, setDeletingRow] = useState<MajorFromApi | null>(null);

  // Form State
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [faculty, setFaculty] = useState("Khoa Công nghệ Thông tin");

  const fetchMajors = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/nganh-hoc?search=${encodeURIComponent(search)}`);
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setData(json.data);
      }
    } catch (err) {
      console.error("Lỗi lấy danh sách ngành:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchMajors();
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const openCreate = () => {
    setEditingRow(null);
    setCode("");
    setName("");
    setFaculty("Khoa Công nghệ Thông tin");
    setIsModalOpen(true);
  };

  const openEdit = (row: MajorFromApi) => {
    setEditingRow(row);
    setCode(row.ma_nganh);
    setName(row.ten_nganh);
    setFaculty(row.khoi_kien_thuc || "Khoa Công nghệ Thông tin");
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingRow) {
        await fetch("/api/nganh-hoc", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ma_nganh: editingRow.ma_nganh,
            ma_nganh_moi: code,
            ten_nganh: name,
            khoi_kien_thuc: faculty,
          }),
        });
      } else {
        await fetch("/api/nganh-hoc", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ma_nganh: code,
            ten_nganh: name,
            khoi_kien_thuc: faculty,
          }),
        });
      }
      setIsModalOpen(false);
      fetchMajors();
    } catch (err) {
      console.error("Lỗi lưu ngành học:", err);
    }
  };

  const handleDelete = async () => {
    if (!deletingRow) return;
    try {
      await fetch(`/api/nganh-hoc?ma_nganh=${encodeURIComponent(deletingRow.ma_nganh)}`, {
        method: "DELETE",
      });
      setDeletingRow(null);
      fetchMajors();
    } catch (err) {
      console.error("Lỗi xóa ngành học:", err);
    }
  };

  const columns: Column<MajorFromApi>[] = [
    {
      header: "Mã Ngành",
      accessor: (r) => (
        <span className="font-stamp font-bold text-[#0d1b4e] bg-[#f4ede0] px-2 py-0.5 rounded border border-[#c6c5d0]">
          {r.ma_nganh}
        </span>
      ),
    },
    {
      header: "Tên Ngành Đào Tạo",
      accessor: (r) => (
        <div>
          <span className="font-bold text-[#1e1b14] block">{r.ten_nganh}</span>
          <span className="text-[11px] text-[#767680]">{r.khoi_kien_thuc || "Cơ sở UTC"}</span>
        </div>
      ),
    },
    {
      header: "Số CTĐT",
      accessor: (r) => <span className="font-bold text-[#0284c7]">{r.chuong_trinh?.length || 0} CTĐT</span>,
    },
    {
      header: "Trạng Thái DB",
      accessor: () => (
        <span className="px-2 py-0.5 rounded bg-[#86efac] text-[#111827] font-stamp text-[10px] font-bold">
          SUPABASE
        </span>
      ),
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
          Tổng số: {data.length} ngành
        </span>
      </div>

      {/* Table */}
      {loading ? (
        <div className="bg-white p-12 rounded-xl border border-[#e9e2d5] flex justify-center">
          <LoadingSpinner />
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={data}
          onEdit={openEdit}
          onDelete={(row) => setDeletingRow(row)}
        />
      )}

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

          <div>
            <label className="block text-[12px] font-bold text-[#1e1b14] mb-1">
              Khối Kiến Thức / Khoa:
            </label>
            <input
              type="text"
              value={faculty}
              onChange={(e) => setFaculty(e.target.value)}
              placeholder="Vd: Khoa Công nghệ Thông tin"
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

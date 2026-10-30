"use client";
import { AdminIcon } from "@/components/admin/AdminIcon";
import { publicError } from "@/libs/client-error";
import { useAdminDialog } from "@/hooks/useAdminDialog";

import { useState } from "react";
import { DataTable, Column } from "@/components/admin/DataTable";
import { ModalForm } from "@/components/admin/ModalForm";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { saveArticle, deleteArticle } from "@/actions/content.action";
import { toast } from "@/libs/admin-toast";

export interface ArticleData {
  id: string;
  title: string;
  category: "ĐỀ ÁN" | "QUY CHẾ" | "TIN TỨC" | "HƯỚNG DẪN";
  summary: string;
  content: string;
  fileUrl?: string;
  fileName?: string;
  fileSize?: string;
  publishedDate: string;
  status: "PUBLISHED" | "DRAFT";
}

export default function TinTucDeAnClient({ initialData }: { initialData: ArticleData[] }) {
  const [data, setData] = useState<ArticleData[]>(initialData);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<ArticleData | null>(null);
  const [deletingRow, setDeletingRow] = useState<ArticleData | null>(null);
  const [viewingArticle, setViewingArticle] = useState<ArticleData | null>(null);
  const articleDialogRef = useAdminDialog(!!viewingArticle, () => setViewingArticle(null));

  // Form State
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<"ĐỀ ÁN" | "QUY CHẾ" | "TIN TỨC" | "HƯỚNG DẪN">("ĐỀ ÁN");
  const [summary, setSummary] = useState("");
  const [content, setContent] = useState("");
  const [fileName, setFileName] = useState("");
  const [status, setStatus] = useState<"PUBLISHED" | "DRAFT">("PUBLISHED");

  const filteredData = data.filter((item) => {
    const matchSearch =
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.summary.toLowerCase().includes(search.toLowerCase());
    const matchCategory = selectedCategory === "ALL" || item.category === selectedCategory;
    return matchSearch && matchCategory;
  });

  const openCreate = () => {
    setEditingRow(null);
    setTitle("");
    setCategory("ĐỀ ÁN");
    setSummary("");
    setContent("");
    setFileName("De_an_tuyen_sinh_UTC_2026.pdf");
    setStatus("PUBLISHED");
    setIsModalOpen(true);
  };

  const openEdit = (row: ArticleData) => {
    setEditingRow(row);
    setTitle(row.title);
    setCategory(row.category);
    setSummary(row.summary);
    setContent(row.content);
    setFileName(row.fileName || "");
    setStatus(row.status);
    setIsModalOpen(true);
  };

  const [saving, setSaving] = useState(false);
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;
    setSaving(true);
    try {
      const row = await saveArticle({ id: editingRow?.id, title, category, content, status });
      setData(prev => editingRow ? prev.map(item => item.id === row.id ? row : item) : [row, ...prev]);
      toast.success("Đã lưu bài viết");
      setIsModalOpen(false);
    } catch (err) { toast.error(publicError(err instanceof Error ? err.message : "Không thể lưu bài viết")); }
    finally { setSaving(false); }
  };
  const handleDelete = async () => {
    if (!deletingRow || saving) return;
    setSaving(true);
    try {
      await deleteArticle(deletingRow.id);
      setData(prev => prev.filter(item => item.id !== deletingRow.id));
      setDeletingRow(null);
      toast.success("Đã xóa bài viết");
    } catch (err) { toast.error(publicError(err instanceof Error ? err.message : "Không thể xóa bài viết")); }
    finally { setSaving(false); }
  };

  const handleDownload = (article: ArticleData) => {
    toast.success(`Bắt đầu tải tệp: ${article.fileName || article.title + ".pdf"}`);
    const element = document.createElement("a");
    const file = new Blob([article.content || article.summary], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = article.fileName || `${article.title}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const columns: Column<ArticleData>[] = [
    {
      header: "Tiêu Đề Văn Bản / Đề Án",
      accessor: (r) => (
        <div className="space-y-1 py-1 max-w-xl">
          <span
            className="font-bold block text-[14px] text-[#1e293b] leading-snug hover:text-[#192b59] cursor-pointer"
            onClick={() => setViewingArticle(r)}
          >
            {r.title}
          </span>
          <p className="text-[12px] text-[#64748b] line-clamp-1">{r.summary}</p>
        </div>
      ),
      className: "w-full",
    },
    {
      header: "Phân Loại",
      accessor: (r) => {
        const badgeColors: Record<string, string> = {
          "ĐỀ ÁN": "bg-amber-100 text-amber-900 border-amber-300",
          "QUY CHẾ": "bg-blue-100 text-blue-900 border-blue-300",
          "TIN TỨC": "bg-emerald-100 text-emerald-900 border-emerald-300",
          "HƯỚNG DẪN": "bg-purple-100 text-purple-900 border-purple-300",
        };
        return (
          <span
            className={`px-2.5 py-1 rounded-md font-bold text-[11px] border whitespace-nowrap inline-block ${
              badgeColors[r.category] || "bg-gray-100 text-gray-800"
            }`}
          >
            {r.category}
          </span>
        );
      },
      className: "w-[120px] text-center",
    },
    {
      header: "Tài Liệu PDF",
      accessor: (r) => (
        <div className="flex items-center gap-2">
          {r.fileName ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDownload(r);
              }}
              className="group flex items-center gap-1.5 px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-lg text-[11px] font-bold transition-all"
              title={`Tải file: ${r.fileName}`}
            >
              <AdminIcon name="picture_as_pdf" className="text-[15px] text-red-600" />
              <span className="font-mono">{r.fileSize || "PDF"}</span>
              <AdminIcon name="download" className="text-[14px] group-hover:translate-y-0.5 transition-transform" />
            </button>
          ) : (
            <span className="text-[11px] text-[#64748b] italic">Không có file</span>
          )}
        </div>
      ),
      className: "w-[150px]",
    },
    {
      header: "Ngày Đăng",
      accessor: (r) => (
        <span className="font-mono text-[12px] text-[#475569] whitespace-nowrap">{r.publishedDate}</span>
      ),
      className: "w-[120px]",
    },
    {
      header: "Đọc / Xem",
      accessor: (r) => (
        <button
          onClick={() => setViewingArticle(r)}
          className="flex items-center gap-1 px-3 py-1.5 bg-[#f8fafc] hover:bg-[#192b59] hover:text-white text-[#192b59] border border-[#cbd5e1] rounded-lg text-[12px] font-bold transition-colors whitespace-nowrap"
        >
          <AdminIcon name="visibility" className="text-[16px]" />
          Đọc bài
        </button>
      ),
      className: "w-[110px] text-center",
    },
  ];

  return (
    <div className="space-y-6 pt-2">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-black text-[28px] text-[#192b59] tracking-tight">
            Quản Lý Tin Tức & Đề Án Tuyển Sinh
          </h1>
          <p className="text-[14px] text-[#475569] mt-0.5">
            Đăng tải quy chế, đề án tuyển sinh K66, biểu mẫu hướng dẫn và tài liệu đính kèm chính thức.
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-[#fdb712] hover:bg-[#e2a20a] text-[#192b59] px-5 py-2.5 rounded-xl font-black text-[14px] shadow-sm transition-all hover:scale-[1.02] active:scale-95 whitespace-nowrap"
        >
          <AdminIcon name="add_circle" className="text-[20px]" />
          Đăng Tải Đề Án Mới
        </button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:max-w-md">
          <AdminIcon name="search" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#64748b] text-[20px]" />
          <input
            type="text"
            placeholder="Tìm theo tiêu đề văn bản, đề án tuyển sinh..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#cbd5e1] rounded-xl text-[14px] font-medium outline-none focus:border-[#192b59] focus:ring-2 focus:ring-[#192b59]/20 transition-all shadow-sm"
          />
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto p-1 bg-[#f8fafc] rounded-xl border border-[#e2e8f0]">
          {["ALL", "ĐỀ ÁN", "QUY CHẾ", "TIN TỨC"].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-lg text-[12px] font-bold transition-all whitespace-nowrap ${
                selectedCategory === cat
                  ? "bg-[#192b59] text-white shadow-sm"
                  : "text-[#475569] hover:bg-white/60"
              }`}
            >
              {cat === "ALL" ? "Tất Cả Thể Loại" : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-[#e2e8f0] overflow-hidden">
        <DataTable
          columns={columns}
          data={filteredData}
          onEdit={openEdit}
          onDelete={(row) => setDeletingRow(row)}
        />
      </div>

      {/* Article Reader / Preview Modal */}
      {viewingArticle && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#1e293b]/50 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div ref={articleDialogRef} role="dialog" aria-modal="true" aria-label="Xem nội dung bài viết" tabIndex={-1} className="bg-[#f6f8fc] min-w-0 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden border border-[#e2e8f0] flex flex-col max-h-[85vh]">
            <div className="px-6 py-4 border-b border-[#e2e8f0] flex justify-between items-center bg-white">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded bg-[#ffdea8] text-[#7c5800] font-bold text-[11px]">
                  {viewingArticle.category}
                </span>
                <span className="text-[12px] font-mono text-[#64748b]">{viewingArticle.publishedDate}</span>
              </div>
              <button
                type="button" aria-label="Đóng nội dung bài viết" onClick={() => setViewingArticle(null)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#f1f5f9] text-[#64748b] transition-colors"
              >
                <AdminIcon name="close" className="text-[20px]" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4">
              <h2 className="text-[20px] font-black font-display text-[#192b59] leading-snug">
                {viewingArticle.title}
              </h2>

              <div className="p-3.5 bg-[#f8fafc] border-l-4 border-[#fdb712] rounded-r-xl">
                <p className="text-[13px] font-medium text-[#1e293b] italic leading-relaxed">
                  {viewingArticle.summary}
                </p>
              </div>

              <div className="prose prose-sm text-[#1e293b] leading-relaxed whitespace-pre-line text-[14px]">
                {viewingArticle.content}
              </div>

              {viewingArticle.fileName && (
                <div className="p-4 bg-white border border-[#e2e8f0] rounded-xl flex items-center justify-between mt-4">
                  <div className="flex items-center gap-3">
                    <AdminIcon name="picture_as_pdf" className="text-[32px] text-red-600" />
                    <div>
                      <h4 className="font-bold text-[13px] text-[#192b59]">{viewingArticle.fileName}</h4>
                      <p className="text-[11px] text-[#64748b]">Dung lượng: {viewingArticle.fileSize || "Tài liệu PDF chính thức"}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDownload(viewingArticle)}
                    className="flex items-center gap-1.5 px-4 py-2 bg-[#192b59] text-[#fdb712] rounded-lg font-bold text-[12px] hover:bg-[#071033] transition-colors"
                  >
                    <AdminIcon name="download" className="text-[16px]" />
                    Tải Tệp Về
                  </button>
                </div>
              )}
            </div>

            <div className="px-6 py-3 bg-white border-t border-[#e2e8f0] flex justify-end">
              <button
                onClick={() => setViewingArticle(null)}
                className="px-5 py-2 bg-[#f8fafc] hover:bg-[#f1f5f9] text-[#192b59] font-bold text-[13px] rounded-lg border border-[#cbd5e1] transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Add / Edit */}
      <ModalForm
        isOpen={isModalOpen}
        title={editingRow ? "Chỉnh Sửa Văn Bản / Đề Án" : "Đăng Tải Đề Án Tuyển Sinh Mới"}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSave}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-[12px] font-bold mb-1 text-[#475569] uppercase tracking-wider">
              Tiêu Đề Bài Viết / Đề Án <span className="text-red-500">*</span>:
            </label>
            <input
              type="text"
              required
              placeholder="VD: Đề án tuyển sinh Đại học Giao thông Vận tải K66..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 bg-[#f8fafc] border border-[#cbd5e1] rounded-xl text-[14px] font-bold text-[#1e293b] focus:border-[#192b59] outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[12px] font-bold mb-1 text-[#475569] uppercase tracking-wider">
                Phân Loại Thể Loại:
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full px-3 py-2.5 bg-[#f8fafc] border border-[#cbd5e1] rounded-xl text-[13px] font-bold text-[#192b59] outline-none"
              >
                <option value="ĐỀ ÁN">ĐỀ ÁN TUYỂN SINH</option>
                <option value="QUY CHẾ">QUY CHẾ & HƯỚNG DẪN</option>
                <option value="TIN TỨC">TIN TỨC TUYỂN SINH</option>
                <option value="HƯỚNG DẪN">HƯỚNG DẪN NHẬP HỌC</option>
              </select>
            </div>
            <div>
              <label className="block text-[12px] font-bold mb-1 text-[#475569] uppercase tracking-wider">
                Trạng Thái:
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full px-3 py-2.5 bg-[#f8fafc] border border-[#cbd5e1] rounded-xl text-[13px] font-bold text-[#192b59] outline-none"
              >
                <option value="PUBLISHED">XUẤT BẢN CÔNG KHAI</option>
                <option value="DRAFT">LƯU BẢN NHÁP</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[12px] font-bold mb-1 text-[#475569] uppercase tracking-wider">
              Tên Tệp Đính Kèm (PDF):
            </label>
            <input
              type="text"
              placeholder="VD: De_an_tuyen_sinh_UTC_2026.pdf"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              className="w-full px-4 py-2.5 bg-[#f8fafc] border border-[#cbd5e1] rounded-xl text-[13px] font-medium text-[#1e293b] outline-none"
            />
          </div>

          <div>
            <label className="block text-[12px] font-bold mb-1 text-[#475569] uppercase tracking-wider">
              Tóm Tắt Ngắn:
            </label>
            <textarea
              rows={2}
              placeholder="Tóm tắt thông tin quan trọng nhất của văn bản..."
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              className="w-full px-4 py-2.5 bg-[#f8fafc] border border-[#cbd5e1] rounded-xl text-[13px] outline-none resize-none"
            />
          </div>

          <div>
            <label className="block text-[12px] font-bold mb-1 text-[#475569] uppercase tracking-wider">
              Nội Dung Chi Tiết Văn Bản:
            </label>
            <textarea
              rows={4}
              placeholder="Nội dung chi tiết quy chế, đề án hoặc hướng dẫn..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full px-4 py-2.5 bg-[#f8fafc] border border-[#cbd5e1] rounded-xl text-[13px] outline-none resize-none font-mono"
            />
          </div>
        </div>
      </ModalForm>

      {/* Delete Dialog */}
      <ConfirmDialog
        isOpen={!!deletingRow}
        title="Xác Nhận Xóa Bài Viết"
        message={`Bạn có chắc muốn xóa bài viết "${deletingRow?.title}"?`}
        onConfirm={handleDelete}
        onCancel={() => setDeletingRow(null)}
      />
    </div>
  );
}

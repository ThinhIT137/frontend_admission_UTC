"use client";

import { useState } from "react";
import { DataTable, Column } from "@/components/admin/DataTable";
import { ModalForm } from "@/components/admin/ModalForm";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { toast } from "sonner";

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

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Vui lòng nhập tiêu đề văn bản/bài viết!");
      return;
    }

    if (editingRow) {
      setData((prev) =>
        prev.map((item) =>
          item.id === editingRow.id
            ? {
                ...item,
                title,
                category,
                summary,
                content,
                fileName,
                status,
              }
            : item
        )
      );
      toast.success("Cập nhật bài viết thành công!");
    } else {
      const newArticle: ArticleData = {
        id: Date.now().toString(),
        title,
        category,
        summary,
        content,
        fileName: fileName || "Tai_lieu_dinh_kem_UTC.pdf",
        fileSize: "2.4 MB",
        publishedDate: new Date().toISOString().split("T")[0],
        status,
      };
      setData((prev) => [newArticle, ...prev]);
      toast.success("Thêm văn bản đề án mới thành công!");
    }
    setIsModalOpen(false);
  };

  const handleDelete = () => {
    if (!deletingRow) return;
    setData((prev) => prev.filter((item) => item.id !== deletingRow.id));
    toast.success("Đã xóa bài viết thành công!");
    setDeletingRow(null);
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
            className="font-bold block text-[14px] text-[#1e1b14] leading-snug hover:text-[#0d1b4e] cursor-pointer"
            onClick={() => setViewingArticle(r)}
          >
            {r.title}
          </span>
          <p className="text-[12px] text-[#767680] line-clamp-1">{r.summary}</p>
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
              <span className="material-symbols-outlined text-[15px] text-red-600">picture_as_pdf</span>
              <span className="font-mono">{r.fileSize || "PDF"}</span>
              <span className="material-symbols-outlined text-[14px] group-hover:translate-y-0.5 transition-transform">
                download
              </span>
            </button>
          ) : (
            <span className="text-[11px] text-[#767680] italic">Không có file</span>
          )}
        </div>
      ),
      className: "w-[150px]",
    },
    {
      header: "Ngày Đăng",
      accessor: (r) => (
        <span className="font-mono text-[12px] text-[#45464f] whitespace-nowrap">{r.publishedDate}</span>
      ),
      className: "w-[120px]",
    },
    {
      header: "Đọc / Xem",
      accessor: (r) => (
        <button
          onClick={() => setViewingArticle(r)}
          className="flex items-center gap-1 px-3 py-1.5 bg-[#faf3e6] hover:bg-[#0d1b4e] hover:text-white text-[#0d1b4e] border border-[#c6c5d0] rounded-lg text-[12px] font-bold transition-colors whitespace-nowrap"
        >
          <span className="material-symbols-outlined text-[16px]">visibility</span>
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
          <h1 className="font-display font-black text-[28px] text-[#0d1b4e] tracking-tight">
            Quản Lý Tin Tức & Đề Án Tuyển Sinh
          </h1>
          <p className="text-[14px] text-[#45464f] mt-0.5">
            Đăng tải quy chế, đề án tuyển sinh K66, biểu mẫu hướng dẫn và tài liệu đính kèm chính thức.
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-[#fdb712] hover:bg-[#e2a20a] text-[#0d1b4e] px-5 py-2.5 rounded-xl font-black text-[14px] shadow-sm transition-all hover:scale-[1.02] active:scale-95 whitespace-nowrap"
        >
          <span className="material-symbols-outlined text-[20px]">add_circle</span>
          Đăng Tải Đề Án Mới
        </button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:max-w-md">
          <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#767680] text-[20px]">
            search
          </span>
          <input
            type="text"
            placeholder="Tìm theo tiêu đề văn bản, đề án tuyển sinh..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#c6c5d0] rounded-xl text-[14px] font-medium outline-none focus:border-[#0d1b4e] focus:ring-2 focus:ring-[#0d1b4e]/20 transition-all shadow-sm"
          />
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto p-1 bg-[#faf3e6] rounded-xl border border-[#e9e2d5]">
          {["ALL", "ĐỀ ÁN", "QUY CHẾ", "TIN TỨC"].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-lg text-[12px] font-bold transition-all whitespace-nowrap ${
                selectedCategory === cat
                  ? "bg-[#0d1b4e] text-white shadow-sm"
                  : "text-[#45464f] hover:bg-white/60"
              }`}
            >
              {cat === "ALL" ? "Tất Cả Thể Loại" : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-[#e9e2d5] overflow-hidden">
        <DataTable
          columns={columns}
          data={filteredData}
          onEdit={openEdit}
          onDelete={(row) => setDeletingRow(row)}
        />
      </div>

      {/* Article Reader / Preview Modal */}
      {viewingArticle && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#1e1b14]/50 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="bg-[#fff9ee] w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden border border-[#e9e2d5] flex flex-col max-h-[85vh]">
            <div className="px-6 py-4 border-b border-[#e9e2d5] flex justify-between items-center bg-white">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded bg-[#ffdea8] text-[#7c5800] font-bold text-[11px]">
                  {viewingArticle.category}
                </span>
                <span className="text-[12px] font-mono text-[#767680]">{viewingArticle.publishedDate}</span>
              </div>
              <button
                onClick={() => setViewingArticle(null)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#f4ede0] text-[#767680] transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4">
              <h2 className="text-[20px] font-black font-display text-[#0d1b4e] leading-snug">
                {viewingArticle.title}
              </h2>

              <div className="p-3.5 bg-[#faf3e6] border-l-4 border-[#fdb712] rounded-r-xl">
                <p className="text-[13px] font-medium text-[#1e1b14] italic leading-relaxed">
                  {viewingArticle.summary}
                </p>
              </div>

              <div className="prose prose-sm text-[#1e1b14] leading-relaxed whitespace-pre-line text-[14px]">
                {viewingArticle.content}
              </div>

              {viewingArticle.fileName && (
                <div className="p-4 bg-white border border-[#e9e2d5] rounded-xl flex items-center justify-between mt-4">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-[32px] text-red-600">picture_as_pdf</span>
                    <div>
                      <h4 className="font-bold text-[13px] text-[#0d1b4e]">{viewingArticle.fileName}</h4>
                      <p className="text-[11px] text-[#767680]">Dung lượng: {viewingArticle.fileSize || "Tài liệu PDF chính thức"}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDownload(viewingArticle)}
                    className="flex items-center gap-1.5 px-4 py-2 bg-[#0d1b4e] text-[#fdb712] rounded-lg font-bold text-[12px] hover:bg-[#071033] transition-colors"
                  >
                    <span className="material-symbols-outlined text-[16px]">download</span>
                    Tải Tệp Về
                  </button>
                </div>
              )}
            </div>

            <div className="px-6 py-3 bg-white border-t border-[#e9e2d5] flex justify-end">
              <button
                onClick={() => setViewingArticle(null)}
                className="px-5 py-2 bg-[#faf3e6] hover:bg-[#f4ede0] text-[#0d1b4e] font-bold text-[13px] rounded-lg border border-[#c6c5d0] transition-colors"
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
            <label className="block text-[12px] font-bold mb-1 text-[#45464f] uppercase tracking-wider">
              Tiêu Đề Bài Viết / Đề Án <span className="text-red-500">*</span>:
            </label>
            <input
              type="text"
              required
              placeholder="VD: Đề án tuyển sinh Đại học Giao thông Vận tải K66..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 bg-[#faf3e6] border border-[#c6c5d0] rounded-xl text-[14px] font-bold text-[#1e1b14] focus:border-[#0d1b4e] outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[12px] font-bold mb-1 text-[#45464f] uppercase tracking-wider">
                Phân Loại Thể Loại:
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full px-3 py-2.5 bg-[#faf3e6] border border-[#c6c5d0] rounded-xl text-[13px] font-bold text-[#0d1b4e] outline-none"
              >
                <option value="ĐỀ ÁN">ĐỀ ÁN TUYỂN SINH</option>
                <option value="QUY CHẾ">QUY CHẾ & HƯỚNG DẪN</option>
                <option value="TIN TỨC">TIN TỨC TUYỂN SINH</option>
                <option value="HƯỚNG DẪN">HƯỚNG DẪN NHẬP HỌC</option>
              </select>
            </div>
            <div>
              <label className="block text-[12px] font-bold mb-1 text-[#45464f] uppercase tracking-wider">
                Trạng Thái:
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full px-3 py-2.5 bg-[#faf3e6] border border-[#c6c5d0] rounded-xl text-[13px] font-bold text-[#0d1b4e] outline-none"
              >
                <option value="PUBLISHED">XUẤT BẢN CÔNG KHAI</option>
                <option value="DRAFT">LƯU BẢN NHÁP</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[12px] font-bold mb-1 text-[#45464f] uppercase tracking-wider">
              Tên Tệp Đính Kèm (PDF):
            </label>
            <input
              type="text"
              placeholder="VD: De_an_tuyen_sinh_UTC_2026.pdf"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              className="w-full px-4 py-2.5 bg-[#faf3e6] border border-[#c6c5d0] rounded-xl text-[13px] font-medium text-[#1e1b14] outline-none"
            />
          </div>

          <div>
            <label className="block text-[12px] font-bold mb-1 text-[#45464f] uppercase tracking-wider">
              Tóm Tắt Ngắn:
            </label>
            <textarea
              rows={2}
              placeholder="Tóm tắt thông tin quan trọng nhất của văn bản..."
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              className="w-full px-4 py-2.5 bg-[#faf3e6] border border-[#c6c5d0] rounded-xl text-[13px] outline-none resize-none"
            />
          </div>

          <div>
            <label className="block text-[12px] font-bold mb-1 text-[#45464f] uppercase tracking-wider">
              Nội Dung Chi Tiết Văn Bản:
            </label>
            <textarea
              rows={4}
              placeholder="Nội dung chi tiết quy chế, đề án hoặc hướng dẫn..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full px-4 py-2.5 bg-[#faf3e6] border border-[#c6c5d0] rounded-xl text-[13px] outline-none resize-none font-mono"
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

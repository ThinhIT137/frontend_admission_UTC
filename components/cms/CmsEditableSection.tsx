"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { Edit3, ExternalLink, ShieldCheck } from "lucide-react";
import { ModalForm } from "@/components/admin/ModalForm";
import { TiptapEditor } from "./TiptapEditor";
import { ContentRenderer } from "./ContentRenderer";
import { extractCmsSummary } from "./cms.service";
import { saveArticle } from "@/actions/content.action";
import { toast } from "@/libs/admin-toast";
import { publicError } from "@/libs/client-error";

export interface CmsArticleItem {
  id: string;
  title: string;
  content: string;
  category: "ĐỀ ÁN" | "QUY CHẾ" | "TIN TỨC" | "HƯỚNG DẪN";
}

interface CmsEditableSectionProps {
  sectionId: string;
  title: string;
  icon?: ReactNode;
  initialArticle?: CmsArticleItem | null;
  defaultContentHtml: string;
  canEdit?: boolean;
  category?: "ĐỀ ÁN" | "QUY CHẾ" | "TIN TỨC" | "HƯỚNG DẪN";
  variant?: "amber" | "blue" | "slate";
  sourceUrl?: string;
  sourceLabel?: string;
  className?: string;
}

export function CmsEditableSection({
  sectionId,
  title,
  icon,
  initialArticle = null,
  defaultContentHtml,
  canEdit = false,
  category = "QUY CHẾ",
  variant = "amber",
  sourceUrl,
  sourceLabel,
  className = "",
}: CmsEditableSectionProps) {
  const [currentArticle, setCurrentArticle] = useState<CmsArticleItem | null>(initialArticle);
  const [contentHtml, setContentHtml] = useState<string>(
    initialArticle?.content || defaultContentHtml
  );

  // Modal Editor State (Chỉ dùng khi canEdit === true)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editorContent, setEditorContent] = useState("");
  const [editorTab, setEditorTab] = useState<"edit" | "preview">("edit");
  const [saving, setSaving] = useState(false);

  // Mở modal chỉnh sửa nội dung
  const handleOpenEdit = () => {
    if (!canEdit) return;
    setEditorContent(contentHtml);
    setEditorTab("edit");
    setIsModalOpen(true);
  };

  // Lưu nội dung bài viết qua Server Action
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEdit || saving) return;

    if (!editorContent.trim()) {
      toast.error("Nội dung không được để trống!");
      return;
    }

    setSaving(true);
    try {
      const saved = await saveArticle({
        id: currentArticle?.id,
        title: `[SECTION] ${title}`,
        category,
        content: editorContent,
        status: "PUBLISHED",
      });

      const updatedItem: CmsArticleItem = {
        id: saved.id,
        title: saved.title,
        content: saved.content,
        category: saved.category,
      };

      setCurrentArticle(updatedItem);
      setContentHtml(saved.content);
      setIsModalOpen(false);
      toast.success("Đã cập nhật nội dung thành công!");
    } catch (err) {
      toast.error(publicError(err instanceof Error ? err.message : "Không thể lưu nội dung"));
    } finally {
      setSaving(false);
    }
  };

  // Khôi phục nội dung về mặc định của UTC
  const handleResetToDefault = () => {
    if (window.confirm("Bạn có chắc muốn khôi phục về nội dung mặc định ban đầu của trường?")) {
      setEditorContent(defaultContentHtml);
      toast.info("Đã nạp lại nội dung mặc định. Nhấn Lưu Thay Đổi để áp dụng.");
    }
  };

  // Cấu hình màu sắc theo variant UTC
  const variantStyles = {
    amber: "rounded-2xl border border-amber-200 bg-amber-50 p-5 sm:p-6 shadow-xs",
    blue: "rounded-2xl border border-blue-200 bg-blue-50/60 p-5 sm:p-6 shadow-xs",
    slate: "rounded-2xl border border-slate-300 bg-slate-50 p-5 sm:p-6 shadow-xs",
  };

  const titleStyles = {
    amber: "text-amber-950 font-bold",
    blue: "text-[#14244e] font-bold",
    slate: "text-slate-900 font-bold",
  };

  return (
    <section id={sectionId} className={`${variantStyles[variant]} ${className} relative group transition-all`}>
      {/* Header của Section */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <h2 className={`flex items-center gap-2 text-lg ${titleStyles[variant]}`}>
          {icon}
          {title}
        </h2>

        {/* Nút bấm Quản trị: CHỈ HIỂN THỊ KHI canEdit === true */}
        {canEdit && (
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#14244e] text-amber-300 border border-amber-400/30 shadow-xs">
              <ShieldCheck size={13} className="text-amber-400" />
              Quyền Quản Trị
            </span>
            <button
              type="button"
              onClick={handleOpenEdit}
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-white hover:bg-[#14244e] text-[#14244e] hover:text-white border border-[#14244e]/30 hover:border-[#14244e] rounded-lg text-xs font-bold transition-all shadow-xs active:scale-95 cursor-pointer"
              title="Chỉnh sửa nội dung section này bằng TipTap Rich-Text CMS"
            >
              <Edit3 size={13} />
              Sửa Nhanh (TipTap)
            </button>
          </div>
        )}
      </div>

      {/* Nội dung Section hiển thị an toàn qua ContentRenderer */}
      <div className="text-slate-800 text-sm leading-relaxed min-w-0 max-w-full overflow-hidden">
        <ContentRenderer content={contentHtml} />
      </div>

      {/* Đường dẫn nguồn đối chiếu nếu có */}
      {sourceUrl && (
        <div className="mt-4 pt-3 border-t border-amber-200/60 flex items-center justify-between text-xs">
          <a
            href={sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 font-semibold text-blue-700 hover:text-blue-900 underline underline-offset-2"
          >
            Nguồn: {sourceLabel || "Thông báo chính thức UTC"}
            <ExternalLink size={12} aria-hidden="true" />
          </a>
          {currentArticle && (
            <span className="text-slate-400 italic text-[11px]">
              Đã được tùy biến qua CMS TipTap
            </span>
          )}
        </div>
      )}

      {/* MODAL SOẠN THẢO TIPTAP: CHỈ TỒN TẠI KHI canEdit === true */}
      {canEdit && (
        <ModalForm
          isOpen={isModalOpen}
          title={`Chỉnh Sửa Nội Dung: ${title}`}
          maxWidth="max-w-4xl"
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleSave}
          submitText="Lưu & Xuất Bản Ngay"
        >
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900">
              <div>
                <p className="font-bold">Chế độ quản trị: Chỉnh sửa trực tiếp tại trang tuyển sinh</p>
                <p className="text-blue-700 mt-0.5">
                  Nội dung được lưu thật vào cơ sở dữ liệu và hiển thị ngay lập tức cho toàn bộ thí sinh.
                </p>
              </div>
              <button
                type="button"
                onClick={handleResetToDefault}
                className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-blue-300 text-blue-800 rounded-lg font-semibold text-xs transition-colors shrink-0"
              >
                Khôi phục mặc định
              </button>
            </div>

            {/* Tab chuyển đổi: Soạn thảo vs Live Preview */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-[12px] font-bold text-[#475569] uppercase tracking-wider">
                  Nội dung chi tiết (Trình soạn thảo TipTap):
                </label>
                <div className="inline-flex rounded-lg border border-[#e2e8f0] bg-[#f1f5f9] p-0.5 text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => setEditorTab("edit")}
                    className={`px-3 py-1 rounded-md transition-all ${
                      editorTab === "edit"
                        ? "bg-white text-[#192b59] shadow-sm font-bold"
                        : "text-[#64748b] hover:text-[#1e293b]"
                    }`}
                  >
                    Soạn Thảo (TipTap)
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditorTab("preview")}
                    className={`px-3 py-1 rounded-md transition-all ${
                      editorTab === "preview"
                        ? "bg-white text-[#192b59] shadow-sm font-bold"
                        : "text-[#64748b] hover:text-[#1e293b]"
                    }`}
                  >
                    Xem Trước (Live Preview)
                  </button>
                </div>
              </div>

              {editorTab === "edit" ? (
                <TiptapEditor
                  key={currentArticle ? `edit-${currentArticle.id}` : `default-${sectionId}`}
                  initialContent={editorContent}
                  onChange={(html) => setEditorContent(html)}
                  draftKey={`section_${sectionId}`}
                  placeholder="Nhập nội dung thông báo, quy định hoặc lưu ý tuyển sinh... Hỗ trợ in đậm, bảng biểu, danh sách việc cần làm, chèn ảnh từ máy tính hoặc URL."
                  minHeight="280px"
                />
              ) : (
                <div className="p-5 bg-white border border-[#cbd5e1] rounded-xl min-h-[280px] max-h-[480px] overflow-y-auto">
                  <ContentRenderer
                    content={editorContent}
                    fallbackText="Chưa có nội dung văn bản để xem trước."
                  />
                </div>
              )}
            </div>
          </div>
        </ModalForm>
      )}
    </section>
  );
}

export default CmsEditableSection;

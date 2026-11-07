"use client";

import { useEffect, useState } from "react";
import { EditorContent } from "@tiptap/react";
import { TiptapToolbar } from "./TiptapToolbar";
import { useCmsEditor } from "./useCmsEditor";
import { clearLocalDraft } from "./cms.service";
import type { CmsEditorProps } from "./cms.types";
import "./tiptap.css";

export function TiptapEditor({
  initialContent = "",
  placeholder = "Nhập nội dung văn bản, đề án, quy chế hoặc hướng dẫn tại đây...",
  onChange,
  editable = true,
  draftKey,
  minHeight = "260px",
  className = "",
}: CmsEditorProps) {
  const { editor, stats, lastSaved } = useCmsEditor({
    initialContent,
    placeholder,
    onChange,
    editable,
    draftKey,
  });

  const [formattedLastSaved, setFormattedLastSaved] = useState<string>("");

  useEffect(() => {
    if (lastSaved) {
      const date = new Date(lastSaved);
      setFormattedLastSaved(
        date.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
      );
    }
  }, [lastSaved]);

  if (!editor) {
    return (
      <div className="w-full h-48 border border-slate-200 rounded-xl bg-slate-50/50 flex items-center justify-center text-slate-400 text-xs">
        Đang khởi tạo trình soạn thảo...
      </div>
    );
  }

  return (
    <div className={`tiptap-editor-wrapper ${className}`}>
      {/* Sticky Top Toolbar */}
      {editable && <TiptapToolbar editor={editor} />}

      {/* Editor Surface */}
      <div style={{ minHeight }} className="w-full">
        <EditorContent editor={editor} className="tiptap-editor-content" />
      </div>

      {/* Status Bar / Footer */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-1.5 bg-slate-50 border-t border-slate-100 text-[11px] text-slate-500">
        <div className="flex items-center gap-3">
          <span>{stats.words} từ</span>
          <span>·</span>
          <span>{stats.chars} ký tự</span>
        </div>

        <div className="flex items-center gap-2">
          {draftKey && formattedLastSaved && (
            <span className="text-emerald-700 flex items-center gap-1 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Đã lưu nháp ({formattedLastSaved})
            </span>
          )}

          {draftKey && formattedLastSaved && (
            <button
              type="button"
              onClick={() => {
                clearLocalDraft(draftKey);
                setFormattedLastSaved("");
              }}
              className="text-slate-400 hover:text-red-600 transition-colors ml-1"
              title="Xóa bản lưu nháp trên trình duyệt này"
            >
              Xóa nháp
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
export default TiptapEditor;

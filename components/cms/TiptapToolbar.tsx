"use client";

import { useState } from "react";
import type { Editor } from "@tiptap/react";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Highlighter,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  CheckSquare,
  Quote,
  Code,
  Minus,
  Table as TableIcon,
  Link as LinkIcon,
  Image as ImageIcon,
  RotateCcw,
  RotateCw,
  RemoveFormatting,
  ChevronDown,
  Plus,
  Trash2,
  X,
} from "lucide-react";

interface TiptapToolbarProps {
  editor: Editor | null;
}

export function TiptapToolbar({ editor }: TiptapToolbarProps) {
  const [showTableMenu, setShowTableMenu] = useState(false);
  const [linkInputOpen, setLinkInputOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [imageInputOpen, setImageInputOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState("");

  if (!editor) return null;

  // Handlers for Link
  const handleSetLink = () => {
    if (!linkUrl.trim()) {
      editor.chain().focus().unsetLink().run();
    } else {
      let finalUrl = linkUrl.trim();
      if (!/^https?:\/\//i.test(finalUrl)) {
        finalUrl = `https://${finalUrl}`;
      }
      editor.chain().focus().extendMarkRange("link").setLink({ href: finalUrl }).run();
    }
    setLinkUrl("");
    setLinkInputOpen(false);
  };

  const handleOpenLinkModal = () => {
    const previousUrl = editor.getAttributes("link").href || "";
    setLinkUrl(previousUrl);
    setLinkInputOpen(true);
  };

  // Handlers for Image
  const handleSetImage = () => {
    if (imageUrl.trim()) {
      editor.chain().focus().setImage({ src: imageUrl.trim() }).run();
    }
    setImageUrl("");
    setImageInputOpen(false);
  };

  const btnClass = (active: boolean) =>
    `p-1.5 rounded text-xs transition-colors flex items-center justify-center ${
      active
        ? "bg-[#14244e] text-white shadow-xs"
        : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
    }`;

  const iconSize = 15;

  return (
    <div className="flex flex-wrap items-center gap-1 p-2 bg-slate-50 border-b border-slate-200 text-slate-700 select-none">
      {/* 1. History Group */}
      <div className="flex items-center gap-0.5 pr-1 border-r border-slate-200">
        <button
          type="button"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          className="p-1.5 rounded text-xs text-slate-700 hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none"
          title="Hoàn tác (Ctrl+Z)"
          aria-label="Hoàn tác"
        >
          <RotateCcw size={iconSize} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          className="p-1.5 rounded text-xs text-slate-700 hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none"
          title="Làm lại (Ctrl+Y)"
          aria-label="Làm lại"
        >
          <RotateCw size={iconSize} />
        </button>
      </div>

      {/* 2. Headings Selector */}
      <div className="flex items-center px-1 border-r border-slate-200">
        <select
          value={
            editor.isActive("heading", { level: 1 })
              ? "h1"
              : editor.isActive("heading", { level: 2 })
              ? "h2"
              : editor.isActive("heading", { level: 3 })
              ? "h3"
              : "p"
          }
          onChange={(e) => {
            const val = e.target.value;
            if (val === "p") editor.chain().focus().setParagraph().run();
            else if (val === "h1") editor.chain().focus().toggleHeading({ level: 1 }).run();
            else if (val === "h2") editor.chain().focus().toggleHeading({ level: 2 }).run();
            else if (val === "h3") editor.chain().focus().toggleHeading({ level: 3 }).run();
          }}
          className="bg-white border border-slate-200 rounded px-2 py-1 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-600"
          aria-label="Cấp độ văn bản"
        >
          <option value="p">Văn bản thường</option>
          <option value="h1">Tiêu đề chính (H1)</option>
          <option value="h2">Tiêu đề mục (H2)</option>
          <option value="h3">Tiêu đề con (H3)</option>
        </select>
      </div>

      {/* 3. Text Formatting Group */}
      <div className="flex items-center gap-0.5 px-1 border-r border-slate-200">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={btnClass(editor.isActive("bold"))}
          title="In đậm (Ctrl+B)"
          aria-label="In đậm"
        >
          <Bold size={iconSize} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={btnClass(editor.isActive("italic"))}
          title="In nghiêng (Ctrl+I)"
          aria-label="In nghiêng"
        >
          <Italic size={iconSize} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={btnClass(editor.isActive("underline"))}
          title="Gạch chân (Ctrl+U)"
          aria-label="Gạch chân"
        >
          <UnderlineIcon size={iconSize} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={btnClass(editor.isActive("strike"))}
          title="Gạch ngang"
          aria-label="Gạch ngang"
        >
          <Strikethrough size={iconSize} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHighlight().run()}
          className={btnClass(editor.isActive("highlight"))}
          title="Đánh dấu highlight màu vàng"
          aria-label="Highlight"
        >
          <Highlighter size={iconSize} />
        </button>
      </div>

      {/* 4. Text Alignment */}
      <div className="flex items-center gap-0.5 px-1 border-r border-slate-200">
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          className={btnClass(editor.isActive({ textAlign: "left" }))}
          title="Căn trái"
          aria-label="Căn trái"
        >
          <AlignLeft size={iconSize} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          className={btnClass(editor.isActive({ textAlign: "center" }))}
          title="Căn giữa"
          aria-label="Căn giữa"
        >
          <AlignCenter size={iconSize} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
          className={btnClass(editor.isActive({ textAlign: "right" }))}
          title="Căn phải"
          aria-label="Căn phải"
        >
          <AlignRight size={iconSize} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign("justify").run()}
          className={btnClass(editor.isActive({ textAlign: "justify" }))}
          title="Căn đều hai bên"
          aria-label="Căn đều"
        >
          <AlignJustify size={iconSize} />
        </button>
      </div>

      {/* 5. Lists & Tasks */}
      <div className="flex items-center gap-0.5 px-1 border-r border-slate-200">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={btnClass(editor.isActive("bulletList"))}
          title="Danh sách gạch đầu dòng"
          aria-label="Danh sách gạch đầu dòng"
        >
          <List size={iconSize} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={btnClass(editor.isActive("orderedList"))}
          title="Danh sách đánh số"
          aria-label="Danh sách đánh số"
        >
          <ListOrdered size={iconSize} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleTaskList().run()}
          className={btnClass(editor.isActive("taskList"))}
          title="Checklist nhiệm vụ / hồ sơ"
          aria-label="Checklist nhiệm vụ"
        >
          <CheckSquare size={iconSize} />
        </button>
      </div>

      {/* 6. Blocks */}
      <div className="flex items-center gap-0.5 px-1 border-r border-slate-200">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={btnClass(editor.isActive("blockquote"))}
          title="Trích dẫn / Lời nhắn"
          aria-label="Trích dẫn"
        >
          <Quote size={iconSize} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={btnClass(editor.isActive("codeBlock"))}
          title="Khối mã lệnh / định dạng"
          aria-label="Khối mã lệnh"
        >
          <Code size={iconSize} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          className="p-1.5 rounded text-xs text-slate-700 hover:bg-slate-100"
          title="Đường phân cách ngang"
          aria-label="Đường phân cách"
        >
          <Minus size={iconSize} />
        </button>
      </div>

      {/* 7. Tables Dropdown */}
      <div className="relative px-1 border-r border-slate-200">
        <button
          type="button"
          onClick={() => setShowTableMenu(!showTableMenu)}
          className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold ${
            editor.isActive("table")
              ? "bg-[#14244e] text-white"
              : "text-slate-700 hover:bg-slate-100"
          }`}
          title="Công cụ bảng biểu"
          aria-label="Công cụ bảng"
        >
          <TableIcon size={iconSize} />
          <span>Bảng</span>
          <ChevronDown size={12} />
        </button>

        {showTableMenu && (
          <div className="absolute left-0 top-full mt-1 w-48 bg-white border border-slate-200 rounded-lg shadow-lg z-50 py-1 text-xs text-slate-700">
            {!editor.isActive("table") ? (
              <button
                type="button"
                onClick={() => {
                  editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
                  setShowTableMenu(false);
                }}
                className="w-full text-left px-3 py-1.5 hover:bg-slate-50 flex items-center gap-2"
              >
                <Plus size={13} className="text-blue-700" />
                <span>Tạo bảng 3x3</span>
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => {
                    editor.chain().focus().addRowAfter().run();
                    setShowTableMenu(false);
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-slate-50"
                >
                  Thêm dòng phía dưới
                </button>
                <button
                  type="button"
                  onClick={() => {
                    editor.chain().focus().deleteRow().run();
                    setShowTableMenu(false);
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-slate-50 text-red-600"
                >
                  Xóa dòng này
                </button>
                <div className="border-t border-slate-100 my-1" />
                <button
                  type="button"
                  onClick={() => {
                    editor.chain().focus().addColumnAfter().run();
                    setShowTableMenu(false);
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-slate-50"
                >
                  Thêm cột phía sau
                </button>
                <button
                  type="button"
                  onClick={() => {
                    editor.chain().focus().deleteColumn().run();
                    setShowTableMenu(false);
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-slate-50 text-red-600"
                >
                  Xóa cột này
                </button>
                <div className="border-t border-slate-100 my-1" />
                <button
                  type="button"
                  onClick={() => {
                    editor.chain().focus().deleteTable().run();
                    setShowTableMenu(false);
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-red-50 text-red-700 font-semibold flex items-center gap-2"
                >
                  <Trash2 size={13} />
                  <span>Xóa toàn bộ bảng</span>
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* 8. Links & Images */}
      <div className="flex items-center gap-0.5 px-1 border-r border-slate-200">
        <button
          type="button"
          onClick={handleOpenLinkModal}
          className={btnClass(editor.isActive("link"))}
          title="Chèn hoặc chỉnh sửa liên kết (Link)"
          aria-label="Chèn liên kết"
        >
          <LinkIcon size={iconSize} />
        </button>
        <button
          type="button"
          onClick={() => setImageInputOpen(true)}
          className="p-1.5 rounded text-xs text-slate-700 hover:bg-slate-100"
          title="Chèn ảnh qua đường dẫn URL"
          aria-label="Chèn ảnh"
        >
          <ImageIcon size={iconSize} />
        </button>
      </div>

      {/* 9. Clear formatting */}
      <div className="flex items-center pl-1">
        <button
          type="button"
          onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}
          className="p-1.5 rounded text-xs text-slate-600 hover:bg-slate-100"
          title="Xóa toàn bộ định dạng vùng chọn"
          aria-label="Xóa định dạng"
        >
          <RemoveFormatting size={iconSize} />
        </button>
      </div>

      {/* Modal / Dialog for Link */}
      {linkInputOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 p-5 w-full max-w-sm space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#14244e]">Chèn liên kết (URL)</h3>
              <button
                type="button"
                onClick={() => setLinkInputOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={16} />
              </button>
            </div>
            <input
              type="url"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="https://tuyensinh.utc.edu.vn..."
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleSetLink();
                }
              }}
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setLinkInputOpen(false)}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleSetLink}
                className="px-4 py-1.5 text-xs font-semibold bg-[#14244e] text-white hover:bg-blue-800 rounded-lg shadow-xs"
              >
                Áp dụng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal / Dialog for Image */}
      {imageInputOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 p-5 w-full max-w-sm space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#14244e]">Chèn ảnh qua URL</h3>
              <button
                type="button"
                onClick={() => setImageInputOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={16} />
              </button>
            </div>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://example.com/banner.jpg"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleSetImage();
                }
              }}
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setImageInputOpen(false)}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleSetImage}
                className="px-4 py-1.5 text-xs font-semibold bg-[#14244e] text-white hover:bg-blue-800 rounded-lg shadow-xs"
              >
                Chèn ảnh
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useRef, useState } from "react";
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
  Upload,
  Globe,
  FileImage,
  LayoutGrid,
  Columns,
} from "lucide-react";

interface TiptapToolbarProps {
  editor: Editor | null;
}

interface ToolbarBtnProps {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  title: string;
  ariaLabel: string;
  children: React.ReactNode;
}

function ToolbarBtn({
  onClick,
  active = false,
  disabled = false,
  title,
  ariaLabel,
  children,
}: ToolbarBtnProps) {
  return (
    <button
      type="button"
      onMouseDown={(e) => {
        // Ngăn trình duyệt chuyển focus sang button làm mất vị trí con trỏ & gây giật cuộn màn hình
        e.preventDefault();
      }}
      onClick={onClick}
      disabled={disabled}
      className={`p-1.5 rounded text-xs transition-colors flex items-center justify-center ${
        active
          ? "bg-[#14244e] text-white shadow-xs"
          : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
      } ${disabled ? "opacity-30 pointer-events-none" : ""}`}
      title={title}
      aria-label={ariaLabel}
    >
      {children}
    </button>
  );
}

export function TiptapToolbar({ editor }: TiptapToolbarProps) {
  const [showTableMenu, setShowTableMenu] = useState(false);
  const [showCardMenu, setShowCardMenu] = useState(false);
  const [linkInputOpen, setLinkInputOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");

  // Modal hình ảnh: hỗ trợ cả upload từ thiết bị và đường dẫn URL
  const [imageInputOpen, setImageInputOpen] = useState(false);
  const [imageTab, setImageTab] = useState<"upload" | "url">("upload");
  const [imageUrl, setImageUrl] = useState("");
  const [imageAlt, setImageAlt] = useState("");
  const [selectedFile, setSelectedFile] = useState<{
    name: string;
    size: string;
    dataUrl: string;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!editor) return null;

  // Xử lý Liên Kết (Link)
  const handleSetLink = () => {
    if (!linkUrl.trim()) {
      editor.chain().focus(null, { scrollIntoView: false }).unsetLink().run();
    } else {
      let finalUrl = linkUrl.trim();
      if (!/^https?:\/\//i.test(finalUrl)) {
        finalUrl = `https://${finalUrl}`;
      }
      editor
        .chain()
        .focus(null, { scrollIntoView: false })
        .extendMarkRange("link")
        .setLink({ href: finalUrl })
        .run();
    }
    setLinkUrl("");
    setLinkInputOpen(false);
  };

  const handleOpenLinkModal = () => {
    const previousUrl = editor.getAttributes("link").href || "";
    setLinkUrl(previousUrl);
    setLinkInputOpen(true);
  };

  // Xử lý chọn tệp hình ảnh từ thiết bị
  const handleFileChosen = (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("Vui lòng chọn một tệp hình ảnh hợp lệ (PNG, JPG, WEBP, GIF, SVG).");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const sizeStr =
        file.size > 1024 * 1024
          ? (file.size / (1024 * 1024)).toFixed(2) + " MB"
          : Math.round(file.size / 1024) + " KB";
      setSelectedFile({
        name: file.name,
        size: sizeStr,
        dataUrl: reader.result as string,
      });
    };
    reader.readAsDataURL(file);
  };

  // Xác nhận chèn ảnh vào nội dung bài viết
  const handleInsertImage = () => {
    if (imageTab === "upload") {
      if (!selectedFile?.dataUrl) return;
      editor
        .chain()
        .focus(null, { scrollIntoView: false })
        .setImage({
          src: selectedFile.dataUrl,
          alt: imageAlt.trim() || selectedFile.name,
        })
        .run();
    } else {
      if (!imageUrl.trim()) return;
      let finalUrl = imageUrl.trim();
      if (!/^https?:\/\//i.test(finalUrl) && !finalUrl.startsWith("/")) {
        finalUrl = `https://${finalUrl}`;
      }
      editor
        .chain()
        .focus(null, { scrollIntoView: false })
        .setImage({
          src: finalUrl,
          alt: imageAlt.trim() || "Hình ảnh bài viết",
        })
        .run();
    }

    // Reset modal state
    setSelectedFile(null);
    setImageUrl("");
    setImageAlt("");
    setImageInputOpen(false);
  };

  const iconSize = 15;

  return (
    <div className="tiptap-sticky-toolbar flex flex-wrap items-center gap-1 p-2 bg-white/95 backdrop-blur-xs border-b border-slate-200 text-slate-700 select-none shadow-xs">
      {/* 1. Lịch sử Thao tác (Undo / Redo) */}
      <div className="flex items-center gap-0.5 pr-1 border-r border-slate-200">
        <ToolbarBtn
          onClick={() => editor.chain().focus(null, { scrollIntoView: false }).undo().run()}
          disabled={!editor.can().undo()}
          title="Hoàn tác (Ctrl+Z)"
          ariaLabel="Hoàn tác"
        >
          <RotateCcw size={iconSize} />
        </ToolbarBtn>
        <ToolbarBtn
          onClick={() => editor.chain().focus(null, { scrollIntoView: false }).redo().run()}
          disabled={!editor.can().redo()}
          title="Làm lại (Ctrl+Y)"
          ariaLabel="Làm lại"
        >
          <RotateCw size={iconSize} />
        </ToolbarBtn>
      </div>

      {/* 2. Cấp độ Văn bản (Headings) */}
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
          onMouseDown={(e) => e.stopPropagation()}
          onChange={(e) => {
            const val = e.target.value;
            if (val === "p")
              editor.chain().focus(null, { scrollIntoView: false }).setParagraph().run();
            else if (val === "h1")
              editor.chain().focus(null, { scrollIntoView: false }).toggleHeading({ level: 1 }).run();
            else if (val === "h2")
              editor.chain().focus(null, { scrollIntoView: false }).toggleHeading({ level: 2 }).run();
            else if (val === "h3")
              editor.chain().focus(null, { scrollIntoView: false }).toggleHeading({ level: 3 }).run();
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

      {/* 3. Định dạng Văn bản Cơ bản */}
      <div className="flex items-center gap-0.5 px-1 border-r border-slate-200">
        <ToolbarBtn
          onClick={() => editor.chain().focus(null, { scrollIntoView: false }).toggleBold().run()}
          active={editor.isActive("bold")}
          title="In đậm (Ctrl+B)"
          ariaLabel="In đậm"
        >
          <Bold size={iconSize} />
        </ToolbarBtn>
        <ToolbarBtn
          onClick={() => editor.chain().focus(null, { scrollIntoView: false }).toggleItalic().run()}
          active={editor.isActive("italic")}
          title="In nghiêng (Ctrl+I)"
          ariaLabel="In nghiêng"
        >
          <Italic size={iconSize} />
        </ToolbarBtn>
        <ToolbarBtn
          onClick={() =>
            editor.chain().focus(null, { scrollIntoView: false }).toggleUnderline().run()
          }
          active={editor.isActive("underline")}
          title="Gạch chân (Ctrl+U)"
          ariaLabel="Gạch chân"
        >
          <UnderlineIcon size={iconSize} />
        </ToolbarBtn>
        <ToolbarBtn
          onClick={() =>
            editor.chain().focus(null, { scrollIntoView: false }).toggleStrike().run()
          }
          active={editor.isActive("strike")}
          title="Gạch ngang"
          ariaLabel="Gạch ngang"
        >
          <Strikethrough size={iconSize} />
        </ToolbarBtn>
        <ToolbarBtn
          onClick={() =>
            editor.chain().focus(null, { scrollIntoView: false }).toggleHighlight().run()
          }
          active={editor.isActive("highlight")}
          title="Đánh dấu highlight màu vàng"
          ariaLabel="Highlight"
        >
          <Highlighter size={iconSize} />
        </ToolbarBtn>
      </div>

      {/* 4. Căn Lề Văn bản */}
      <div className="flex items-center gap-0.5 px-1 border-r border-slate-200">
        <ToolbarBtn
          onClick={() =>
            editor.chain().focus(null, { scrollIntoView: false }).setTextAlign("left").run()
          }
          active={editor.isActive({ textAlign: "left" })}
          title="Căn trái"
          ariaLabel="Căn trái"
        >
          <AlignLeft size={iconSize} />
        </ToolbarBtn>
        <ToolbarBtn
          onClick={() =>
            editor.chain().focus(null, { scrollIntoView: false }).setTextAlign("center").run()
          }
          active={editor.isActive({ textAlign: "center" })}
          title="Căn giữa"
          ariaLabel="Căn giữa"
        >
          <AlignCenter size={iconSize} />
        </ToolbarBtn>
        <ToolbarBtn
          onClick={() =>
            editor.chain().focus(null, { scrollIntoView: false }).setTextAlign("right").run()
          }
          active={editor.isActive({ textAlign: "right" })}
          title="Căn phải"
          ariaLabel="Căn phải"
        >
          <AlignRight size={iconSize} />
        </ToolbarBtn>
        <ToolbarBtn
          onClick={() =>
            editor.chain().focus(null, { scrollIntoView: false }).setTextAlign("justify").run()
          }
          active={editor.isActive({ textAlign: "justify" })}
          title="Căn đều hai bên"
          ariaLabel="Căn đều hai bên"
        >
          <AlignJustify size={iconSize} />
        </ToolbarBtn>
      </div>

      {/* 5. Danh sách & Trích dẫn */}
      <div className="flex items-center gap-0.5 px-1 border-r border-slate-200">
        <ToolbarBtn
          onClick={() =>
            editor.chain().focus(null, { scrollIntoView: false }).toggleBulletList().run()
          }
          active={editor.isActive("bulletList")}
          title="Danh sách gạch đầu dòng"
          ariaLabel="Danh sách chấm"
        >
          <List size={iconSize} />
        </ToolbarBtn>
        <ToolbarBtn
          onClick={() =>
            editor.chain().focus(null, { scrollIntoView: false }).toggleOrderedList().run()
          }
          active={editor.isActive("orderedList")}
          title="Danh sách đánh số"
          ariaLabel="Danh sách số"
        >
          <ListOrdered size={iconSize} />
        </ToolbarBtn>
        <ToolbarBtn
          onClick={() =>
            editor.chain().focus(null, { scrollIntoView: false }).toggleTaskList().run()
          }
          active={editor.isActive("taskList")}
          title="Danh sách công việc (Checklist)"
          ariaLabel="Danh sách công việc"
        >
          <CheckSquare size={iconSize} />
        </ToolbarBtn>
        <ToolbarBtn
          onClick={() =>
            editor.chain().focus(null, { scrollIntoView: false }).toggleBlockquote().run()
          }
          active={editor.isActive("blockquote")}
          title="Trích dẫn"
          ariaLabel="Trích dẫn"
        >
          <Quote size={iconSize} />
        </ToolbarBtn>
        <ToolbarBtn
          onClick={() =>
            editor.chain().focus(null, { scrollIntoView: false }).toggleCodeBlock().run()
          }
          active={editor.isActive("codeBlock")}
          title="Khối mã code"
          ariaLabel="Mã code"
        >
          <Code size={iconSize} />
        </ToolbarBtn>
        <ToolbarBtn
          onClick={() =>
            editor.chain().focus(null, { scrollIntoView: false }).setHorizontalRule().run()
          }
          title="Đường kẻ ngang phân cách"
          ariaLabel="Kẻ ngang"
        >
          <Minus size={iconSize} />
        </ToolbarBtn>
      </div>

      {/* 6. Chèn Đa Phương Tiện (Bảng, Link, Ảnh) */}
      <div className="flex items-center gap-0.5 px-1 border-r border-slate-200 relative">
        {/* Nút chèn Bảng biểu */}
        <div className="relative">
          <ToolbarBtn
            onClick={() => setShowTableMenu(!showTableMenu)}
            active={editor.isActive("table") || showTableMenu}
            title="Quản lý Bảng biểu (Table)"
            ariaLabel="Bảng biểu"
          >
            <TableIcon size={iconSize} />
            <ChevronDown size={12} className="ml-0.5 opacity-70" />
          </ToolbarBtn>

          {showTableMenu && (
            <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-slate-200 rounded-lg shadow-xl p-1.5 z-50 text-xs flex flex-col gap-1">
              {!editor.isActive("table") ? (
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    editor
                      .chain()
                      .focus(null, { scrollIntoView: false })
                      .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
                      .run();
                    setShowTableMenu(false);
                  }}
                  className="flex items-center gap-1.5 px-2 py-1.5 rounded hover:bg-slate-100 text-slate-800 text-left font-medium"
                >
                  <Plus size={14} className="text-emerald-600" /> Tạo bảng mới (3x3)
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      editor.chain().focus(null, { scrollIntoView: false }).addColumnAfter().run();
                      setShowTableMenu(false);
                    }}
                    className="flex items-center gap-1.5 px-2 py-1.5 rounded hover:bg-slate-100 text-slate-800 text-left"
                  >
                    <Plus size={14} className="text-blue-600" /> Thêm cột bên phải
                  </button>
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      editor.chain().focus(null, { scrollIntoView: false }).addRowAfter().run();
                      setShowTableMenu(false);
                    }}
                    className="flex items-center gap-1.5 px-2 py-1.5 rounded hover:bg-slate-100 text-slate-800 text-left"
                  >
                    <Plus size={14} className="text-blue-600" /> Thêm dòng bên dưới
                  </button>
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      editor.chain().focus(null, { scrollIntoView: false }).deleteColumn().run();
                      setShowTableMenu(false);
                    }}
                    className="flex items-center gap-1.5 px-2 py-1.5 rounded hover:bg-red-50 text-red-600 text-left"
                  >
                    <Trash2 size={14} /> Xóa cột hiện tại
                  </button>
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      editor.chain().focus(null, { scrollIntoView: false }).deleteRow().run();
                      setShowTableMenu(false);
                    }}
                    className="flex items-center gap-1.5 px-2 py-1.5 rounded hover:bg-red-50 text-red-600 text-left"
                  >
                    <Trash2 size={14} /> Xóa dòng hiện tại
                  </button>
                  <div className="border-t border-slate-100 my-0.5" />
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      editor.chain().focus(null, { scrollIntoView: false }).deleteTable().run();
                      setShowTableMenu(false);
                    }}
                    className="flex items-center gap-1.5 px-2 py-1.5 rounded hover:bg-red-100 text-red-700 text-left font-bold"
                  >
                    <Trash2 size={14} /> Xóa toàn bộ bảng
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        {/* Nút quản lý Bố cục Thẻ Card (Grid & Tiles) */}
        <div className="relative">
          <ToolbarBtn
            onClick={() => {
              setShowCardMenu(!showCardMenu);
              setShowTableMenu(false);
            }}
            active={editor.isActive("cmsCard") || editor.isActive("cmsGrid") || showCardMenu}
            title="Bố cục Thẻ & Lưới (Cards Grid)"
            ariaLabel="Thẻ Card"
          >
            <LayoutGrid size={iconSize} />
            <ChevronDown size={12} className="ml-0.5 opacity-70" />
          </ToolbarBtn>

          {showCardMenu && (
            <div className="absolute top-full left-0 mt-1 w-56 bg-white border border-slate-200 rounded-lg shadow-xl p-1.5 z-50 text-xs flex flex-col gap-1 animate-in fade-in zoom-in-95 duration-100">
              {editor.isActive("cmsCard") ? (
                <>
                  <div className="px-2 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Thao tác thẻ hiện tại
                  </div>
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      editor.chain().focus(null, { scrollIntoView: false }).addCardToCurrentGrid().run();
                      setShowCardMenu(false);
                    }}
                    className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-slate-100 text-slate-800 text-left font-medium"
                  >
                    <Plus size={14} className="text-emerald-600" /> Thêm thẻ mới vào lưới này
                  </button>
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      editor.chain().focus(null, { scrollIntoView: false }).toggleGridColumns().run();
                      setShowCardMenu(false);
                    }}
                    className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-slate-100 text-slate-800 text-left font-medium"
                  >
                    <Columns size={14} className="text-blue-600" /> Đổi bố cục 2 cột ↔ 3 cột
                  </button>
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      editor.chain().focus(null, { scrollIntoView: false }).insertParagraphAfterGrid().run();
                      setShowCardMenu(false);
                    }}
                    className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-slate-100 text-slate-800 text-left font-medium"
                  >
                    <AlignLeft size={14} className="text-slate-600" /> Xuống dòng ngoài lưới thẻ
                  </button>
                  <div className="my-1 border-t border-slate-200" />
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      if (window.confirm("Bạn có chắc muốn xóa thẻ này?")) {
                        editor.chain().focus(null, { scrollIntoView: false }).deleteCurrentCard().run();
                        setShowCardMenu(false);
                      }
                    }}
                    className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-red-50 text-red-600 text-left font-medium"
                  >
                    <Trash2 size={14} /> Xóa thẻ này
                  </button>
                </>
              ) : (
                <>
                  <div className="px-2 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Tạo cụm thẻ thông tin
                  </div>
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      editor.chain().focus(null, { scrollIntoView: false }).insertCmsGrid({ cols: 2 }).run();
                      setShowCardMenu(false);
                    }}
                    className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-slate-100 text-slate-800 text-left font-medium"
                  >
                    <LayoutGrid size={14} className="text-blue-600" /> Lưới 2 Cột (2 Cards)
                  </button>
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      editor.chain().focus(null, { scrollIntoView: false }).insertCmsGrid({ cols: 3 }).run();
                      setShowCardMenu(false);
                    }}
                    className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-slate-100 text-slate-800 text-left font-medium"
                  >
                    <Columns size={14} className="text-blue-600" /> Lưới 3 Cột (3 Cards)
                  </button>
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      editor.chain().focus(null, { scrollIntoView: false }).insertCmsCard().run();
                      setShowCardMenu(false);
                    }}
                    className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-slate-100 text-slate-800 text-left font-medium"
                  >
                    <Plus size={14} className="text-emerald-600" /> Thẻ Card Đơn (1 Card)
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        {/* Nút chèn Link */}
        <ToolbarBtn
          onClick={handleOpenLinkModal}
          active={editor.isActive("link")}
          title="Chèn liên kết web"
          ariaLabel="Chèn link"
        >
          <LinkIcon size={iconSize} />
        </ToolbarBtn>

        {/* Nút chèn Ảnh (Upload từ thiết bị hoặc URL) */}
        <ToolbarBtn
          onClick={() => setImageInputOpen(true)}
          active={editor.isActive("image") || imageInputOpen}
          title="Chèn hình ảnh (Từ thiết bị hoặc URL)"
          ariaLabel="Chèn hình ảnh"
        >
          <ImageIcon size={iconSize} />
        </ToolbarBtn>
      </div>

      {/* 7. Xóa định dạng */}
      <div className="flex items-center px-1">
        <ToolbarBtn
          onClick={() =>
            editor.chain().focus(null, { scrollIntoView: false }).unsetAllMarks().clearNodes().run()
          }
          title="Xóa tất cả định dạng về mặc định"
          ariaLabel="Xóa định dạng"
        >
          <RemoveFormatting size={iconSize} />
        </ToolbarBtn>
      </div>

      {/* MODAL CHÈN LINK */}
      {linkInputOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-md w-full p-5 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h4 className="font-bold text-sm text-[#14244e] flex items-center gap-1.5">
                <LinkIcon size={16} className="text-blue-600" /> Chèn Liên Kết Web
              </h4>
              <button
                type="button"
                onClick={() => setLinkInputOpen(false)}
                className="w-7 h-7 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-500"
              >
                <X size={16} />
              </button>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Địa chỉ URL (https://...):
              </label>
              <input
                type="url"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://tuyensinh.utc.edu.vn/..."
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-blue-600"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleSetLink();
                  }
                }}
              />
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setLinkInputOpen(false)}
                className="px-3.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleSetLink}
                className="px-4 py-1.5 rounded-lg bg-[#14244e] text-white text-xs font-semibold hover:bg-[#1e3a8a] shadow-xs"
              >
                Áp Dụng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL CHÈN ẢNH (Từ thiết bị hoặc URL) */}
      {imageInputOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-lg w-full p-5 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h4 className="font-bold text-sm text-[#14244e] flex items-center gap-1.5">
                <ImageIcon size={18} className="text-amber-500" /> Chèn Hình Ảnh Vào Bài Viết
              </h4>
              <button
                type="button"
                onClick={() => setImageInputOpen(false)}
                className="w-7 h-7 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-500"
              >
                <X size={16} />
              </button>
            </div>

            {/* Tab chuyển đổi: Tải từ thiết bị vs URL */}
            <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100 rounded-lg text-xs font-bold">
              <button
                type="button"
                onClick={() => setImageTab("upload")}
                className={`py-2 px-3 rounded-md flex items-center justify-center gap-1.5 transition-all ${
                  imageTab === "upload"
                    ? "bg-white text-[#14244e] shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Upload size={14} /> Tải từ thiết bị (Máy tính)
              </button>
              <button
                type="button"
                onClick={() => setImageTab("url")}
                className={`py-2 px-3 rounded-md flex items-center justify-center gap-1.5 transition-all ${
                  imageTab === "url"
                    ? "bg-white text-[#14244e] shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Globe size={14} /> Đường dẫn URL trực tiếp
              </button>
            </div>

            {imageTab === "upload" ? (
              <div className="space-y-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png, image/jpeg, image/webp, image/gif, image/svg+xml"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleFileChosen(f);
                  }}
                />

                {!selectedFile ? (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      const f = e.dataTransfer.files?.[0];
                      if (f) handleFileChosen(f);
                    }}
                    className="border-2 border-dashed border-slate-300 hover:border-[#14244e] rounded-xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer bg-slate-50 hover:bg-blue-50/30 transition-all text-center"
                  >
                    <div className="w-12 h-12 rounded-full bg-blue-100 text-[#14244e] flex items-center justify-center shadow-xs">
                      <Upload size={22} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800">
                        Nhấp để chọn ảnh từ máy tính hoặc kéo thả vào đây
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Hỗ trợ PNG, JPG, JPEG, WEBP, GIF, SVG (tối đa 10MB)
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-16 h-16 rounded-lg overflow-hidden border border-slate-200 bg-white shrink-0 flex items-center justify-center">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={selectedFile.dataUrl}
                          alt="Xem trước ảnh"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-800 truncate">
                          {selectedFile.name}
                        </p>
                        <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                          Dung lượng: {selectedFile.size}
                        </p>
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="text-[11px] font-bold text-blue-700 hover:underline mt-1"
                        >
                          Chọn tệp khác
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedFile(null)}
                        className="w-8 h-8 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 flex items-center justify-center transition-colors"
                        title="Xóa ảnh đã chọn"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Đường dẫn URL hình ảnh:
                  </label>
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://tuyensinh.utc.edu.vn/images/banner-k66.jpg"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-blue-600"
                    autoFocus
                  />
                </div>
                {imageUrl && (
                  <div className="w-full h-32 rounded-lg border border-slate-200 bg-slate-50 overflow-hidden flex items-center justify-center p-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={imageUrl}
                      alt="Xem trước ảnh"
                      className="max-h-full max-w-full object-contain"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = "none";
                      }}
                    />
                  </div>
                )}
              </div>
            )}

            {/* Chú thích Alt text (tùy chọn) */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Chú thích ảnh / Mô tả Alt (Tùy chọn):
              </label>
              <input
                type="text"
                value={imageAlt}
                onChange={(e) => setImageAlt(e.target.value)}
                placeholder="VD: Sơ đồ phương thức tuyển sinh Đại học UTC K66..."
                className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-blue-600"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setImageInputOpen(false)}
                className="px-3.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleInsertImage}
                disabled={imageTab === "upload" ? !selectedFile : !imageUrl.trim()}
                className="px-4 py-1.5 rounded-lg bg-[#14244e] text-white text-xs font-semibold hover:bg-[#1e3a8a] disabled:opacity-40 shadow-xs flex items-center gap-1.5"
              >
                <Plus size={14} /> Chèn Ảnh Vào Bài Viết
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TiptapToolbar;

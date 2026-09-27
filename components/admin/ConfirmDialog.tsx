"use client";

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDanger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmText = "Xác nhận",
  cancelText = "Hủy bỏ",
  isDanger = true,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-[#e9e2d5] animate-in zoom-in-95 duration-150">
        <div className="flex items-center gap-3 mb-4">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
              isDanger
                ? "bg-[#ffdad6] text-[#ba1a1a]"
                : "bg-[#dde1ff] text-[#0d1b4e]"
            }`}
          >
            <span className="material-symbols-outlined text-[24px]">
              {isDanger ? "warning" : "help"}
            </span>
          </div>
          <div>
            <h3 className="font-display font-bold text-[18px] text-[#1e1b14]">
              {title}
            </h3>
            <p className="text-[13px] text-[#45464f] mt-0.5 leading-relaxed">
              {message}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 mt-6">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-lg text-[13px] font-semibold text-[#45464f] bg-[#f4ede0] hover:bg-[#e9e2d5] transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 rounded-lg text-[13px] font-bold text-white shadow-sm transition-colors ${
              isDanger
                ? "bg-[#ba1a1a] hover:bg-[#93000a]"
                : "bg-[#0d1b4e] hover:bg-[#000525]"
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

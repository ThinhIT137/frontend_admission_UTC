"use client";

import { ReactNode } from "react";

interface ModalFormProps {
  isOpen: boolean;
  title: string;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  submitText?: string;
  children: ReactNode;
}

export function ModalForm({
  isOpen,
  title,
  onClose,
  onSubmit,
  submitText = "Lưu Thay Đổi",
  children,
}: ModalFormProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150 overflow-y-auto">
      <div className="bg-white rounded-xl max-w-lg w-full shadow-2xl border border-[#e9e2d5] overflow-hidden animate-in zoom-in-95 duration-150 my-8">
        {/* Header */}
        <div className="bg-[#0d1b4e] text-white p-4 flex items-center justify-between">
          <h3 className="font-display font-bold text-[18px] flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px] text-[#fdb712]">
              edit_note
            </span>
            {title}
          </h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Body */}
        <form onSubmit={onSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {children}

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#e9e2d5]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-[13px] font-semibold text-[#45464f] bg-[#f4ede0] hover:bg-[#e9e2d5] transition-colors"
            >
              Hủy Bỏ
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg text-[13px] font-bold text-[#0d1b4e] bg-[#fdb712] hover:bg-[#e2a20a] shadow transition-colors"
            >
              {submitText}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

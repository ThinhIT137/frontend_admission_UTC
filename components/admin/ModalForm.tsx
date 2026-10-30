"use client";

import { AdminIcon } from "@/components/admin/AdminIcon";
import { ReactNode, useId } from "react";
import { LoaderCircle, X } from "lucide-react";
import { toast } from "@/libs/admin-toast";
import { useAdminTask } from "@/hooks/useAdminTask";
import { useAdminDialog } from "@/hooks/useAdminDialog";

interface ModalFormProps {
  isOpen: boolean;
  title: string;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void | Promise<void>;
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
  const { pending, run } = useAdminTask();
  const titleId = useId();
  const dialogRef = useAdminDialog(isOpen, onClose, pending);
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150 overflow-y-auto">
      <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby={titleId} aria-busy={pending} tabIndex={-1} className="bg-white rounded-xl max-w-lg w-full shadow-2xl border border-[#e2e8f0] overflow-hidden animate-in zoom-in-95 duration-150 my-8">
        {/* Header */}
        <div className="bg-[#192b59] text-white p-4 flex items-center justify-between">
          <h3 id={titleId} className="font-display font-bold text-[18px] flex items-center gap-2">
            <AdminIcon name="edit_note" className="text-[20px] text-[#fdb712]" />
            {title}
          </h3>
          <button
            onClick={onClose}
            disabled={pending}
            aria-label="Đóng hộp thoại"
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={(event) => {
          event.preventDefault();
          void run(() => onSubmit(event)).catch(() => toast.error("Không thể lưu thay đổi. Vui lòng thử lại."));
        }} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          <fieldset disabled={pending} className="space-y-4 min-w-0">{children}</fieldset>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#e2e8f0]">
            <button
              type="button"
              onClick={onClose}
              disabled={pending}
              className="px-4 py-2 rounded-lg text-[13px] font-semibold text-[#475569] bg-[#f1f5f9] hover:bg-[#e2e8f0] transition-colors"
            >
              Hủy Bỏ
            </button>
            <button
              type="submit"
              disabled={pending}
              className="px-5 py-2 rounded-lg text-[13px] font-bold text-[#192b59] bg-[#fdb712] hover:bg-[#e2a20a] shadow transition-colors"
            >
              {pending ? <span className="inline-flex items-center gap-2"><LoaderCircle size={16} className="animate-spin motion-reduce:animate-none" aria-hidden="true" />Đang xử lý…</span> : submitText}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

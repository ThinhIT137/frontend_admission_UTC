"use client";
import { useId } from "react";
import { AdminIcon } from "./AdminIcon";
import { LoaderCircle } from "lucide-react";
import { toast } from "@/libs/admin-toast";
import { useAdminTask } from "@/hooks/useAdminTask";
import { useAdminDialog } from "@/hooks/useAdminDialog";

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDanger?: boolean;
  onConfirm: () => void | Promise<void>;
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
  const { pending, run } = useAdminTask();
  const titleId = useId();
  const messageId = useId();
  const dialogRef = useAdminDialog(isOpen, onCancel, pending);
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div ref={dialogRef} role="alertdialog" aria-modal="true" aria-labelledby={titleId} aria-describedby={messageId} aria-busy={pending} tabIndex={-1} className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-[#e2e8f0] animate-in zoom-in-95 duration-150">
        <div className="flex items-center gap-3 mb-4">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
              isDanger
                ? "bg-[#ffdad6] text-[#ba1a1a]"
                : "bg-[#eef2ff] text-[#192b59]"
            }`}
          >
            <AdminIcon name={isDanger ? "warning" : "help"} className="h-6 w-6" />
          </div>
          <div className="min-w-0">
            <h3 id={titleId} className="font-display font-bold text-[18px] text-[#1e293b]">
              {title}
            </h3>
            <p id={messageId} className="text-[13px] text-[#475569] mt-0.5 leading-relaxed [overflow-wrap:anywhere]">
              {message}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 mt-6">
          <button
            type="button" disabled={pending} onClick={onCancel}
            className="px-4 py-2 rounded-lg text-[13px] font-semibold text-[#475569] bg-[#f1f5f9] hover:bg-[#e2e8f0] transition-colors"
          >
            {cancelText}
          </button>
          <button
            type="button" disabled={pending} onClick={() => {
              void run(onConfirm).catch(() => toast.error("Không thể thực hiện thao tác. Vui lòng thử lại."));
            }}
            className={`px-4 py-2 rounded-lg text-[13px] font-bold text-white shadow-sm transition-colors ${
              isDanger
                ? "bg-[#ba1a1a] hover:bg-[#93000a]"
                : "bg-[#192b59] hover:bg-[#102044]"
            }`}
          >
            {pending ? <span className="inline-flex items-center gap-2"><LoaderCircle size={16} className="animate-spin motion-reduce:animate-none" aria-hidden="true" />Đang xử lý…</span> : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

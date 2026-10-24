"use client";
import { Info } from "lucide-react";
export function DisclaimerBanner({ text = "Mọi thông tin trên hệ thống chỉ mang tính chất tham khảo, không thay thế thông báo tuyển sinh chính thức của nhà trường.", className = "" }: { text?: string; className?: string }) {
  return <aside className={`flex items-start gap-3 rounded-xl border border-slate-200 border-l-4 border-l-amber-400 bg-white p-4 text-[#14244e] ${className}`}><Info size={20} aria-hidden="true" className="mt-0.5 shrink-0 text-amber-600" /><p className="text-sm leading-7"><strong className="mr-1">Lưu ý:</strong>{text}</p></aside>;
}

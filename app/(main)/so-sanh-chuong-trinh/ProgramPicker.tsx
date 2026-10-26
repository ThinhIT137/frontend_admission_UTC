"use client";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, Check, Search } from "lucide-react";
type Program = { ma_chuong_trinh: string; ten_chuong_trinh: string };
/** Menu HTML tự xuống dòng, tránh giới hạn chiều rộng của native select. */
export default function ProgramPicker({ programs, value, onChange, index, selected, disabled }: { programs: Program[]; value: string; onChange: (value: string) => void; index: number; selected: string[]; disabled: boolean }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const search = useRef<HTMLInputElement>(null);
  const label = `Chương trình ${index + 1}`;
  const chosen = programs.find(p => p.ma_chuong_trinh === value);
  const options = programs.filter(p => `${p.ma_chuong_trinh} ${p.ten_chuong_trinh}`.toLocaleLowerCase("vi").includes(query.toLocaleLowerCase("vi")));
  useEffect(() => { if (!open) return; search.current?.focus(); const outside = (e: PointerEvent) => { if (!root.current?.contains(e.target as Node)) setOpen(false); }; document.addEventListener("pointerdown", outside); return () => document.removeEventListener("pointerdown", outside); }, [open]);
  function choose(id: string) { onChange(id); setOpen(false); setQuery(""); trigger.current?.focus(); }
  return <div ref={root} className="relative min-w-0" onKeyDown={e => { if (e.key === "Escape") { e.preventDefault(); setOpen(false); trigger.current?.focus(); } if (e.key === "ArrowDown" || e.key === "ArrowUp") { const buttons = Array.from(root.current?.querySelectorAll<HTMLButtonElement>("[data-option]:not(:disabled)") ?? []); const position = buttons.indexOf(document.activeElement as HTMLButtonElement); if (buttons.length) { e.preventDefault(); buttons[position === -1 ? (e.key === "ArrowDown" ? 0 : buttons.length - 1) : (position + (e.key === "ArrowDown" ? 1 : -1) + buttons.length) % buttons.length]?.focus(); } } }}>
    <p id={`program-label-${index}`} className="mb-2 text-sm font-semibold">{label} <span className="font-normal text-slate-500">{index === 2 ? "(tùy chọn)" : "(bắt buộc)"}</span></p>
    <button ref={trigger} type="button" aria-label={label} aria-expanded={open} aria-controls={`program-options-${index}`} aria-haspopup="dialog" disabled={disabled} onClick={() => setOpen(value => !value)} className="flex min-h-24 w-full items-start justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4 text-left text-sm leading-6 disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-orange-500"><span className="min-w-0 break-words">{chosen ? <>{chosen.ten_chuong_trinh}</> : `Chọn ${label.toLocaleLowerCase("vi")}`}</span><ChevronDown size={18} className="mt-1 shrink-0" /></button>
    {open && <div id={`program-options-${index}`} role="dialog" aria-labelledby={`program-label-${index}`} className="absolute inset-x-0 top-full z-30 mt-2 min-w-0 rounded-xl border border-slate-200 bg-white p-2 shadow-xl"><label className="flex items-center gap-2 rounded-lg bg-slate-50 px-3"><Search size={16} /><input ref={search} aria-label={`Tìm ${label.toLocaleLowerCase("vi")}`} placeholder="Tìm mã hoặc tên chương trình…" value={query} onChange={e => setQuery(e.target.value)} className="min-w-0 flex-1 bg-transparent py-3 text-sm outline-none" /></label><div className="mt-2 max-h-80 overflow-y-auto overscroll-contain">{index === 2 && <button data-option type="button" className="w-full rounded-lg p-3 text-left text-sm text-slate-500 hover:bg-slate-50" onClick={() => choose("")}>Không chọn chương trình thứ ba</button>}{options.map(p => <button data-option key={p.ma_chuong_trinh} type="button" disabled={selected.some((id, position) => position !== index && id === p.ma_chuong_trinh)} onClick={() => choose(p.ma_chuong_trinh)} className="flex w-full items-start gap-2 rounded-lg p-3 text-left text-sm leading-6 hover:bg-blue-50 focus:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-35"><span className="min-w-0 flex-1 break-words">{p.ten_chuong_trinh}</span>{p.ma_chuong_trinh === value && <Check size={16} className="shrink-0" />}</button>)}{!options.length && <p className="p-3 text-sm text-slate-500">Không có chương trình phù hợp.</p>}</div></div>}
  </div>;
}

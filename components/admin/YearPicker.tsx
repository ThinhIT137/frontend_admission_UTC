"use client";
import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

export function YearPicker({ value, years, onChange }: { value: number; years: number[]; onChange: (year: number) => void }) {
  const [open, setOpen] = useState(false);
  const [focused, setFocused] = useState(value);
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const list = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const close = (event: PointerEvent) => { if (!root.current?.contains(event.target as Node)) setOpen(false); };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, [open]);
  useEffect(() => {
    if (open) list.current?.querySelector<HTMLElement>(`[data-year="${focused}"]`)?.focus();
  }, [open, focused]);
  const choose = (year: number) => { setOpen(false); trigger.current?.focus(); onChange(year); };
  return <div ref={root} className="relative" onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget as Node)) setOpen(false); }}>
    <button ref={trigger} type="button" aria-label="Năm quản lý điểm chuẩn" aria-haspopup="listbox" aria-expanded={open}
      onClick={() => { setFocused(value); setOpen(!open); }} onKeyDown={event => {
        if (event.key === "ArrowDown" || event.key === "ArrowUp") { event.preventDefault(); setFocused(value); setOpen(true); }
      }} className="flex min-h-11 items-center gap-3 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-bold text-blue-950">
      Năm {value}<ChevronDown size={16} aria-hidden="true" />
    </button>
    {open && <div ref={list} role="listbox" aria-label="Danh sách năm tuyển sinh" className="absolute right-0 z-40 mt-2 max-h-64 w-44 overflow-y-auto overscroll-contain rounded-xl border border-slate-300 bg-white p-1 shadow-xl"
      onKeyDown={event => {
        const index = years.indexOf(focused);
        if (event.key === "Escape") { event.preventDefault(); event.stopPropagation(); setOpen(false); trigger.current?.focus(); }
        if (event.key === "ArrowDown" || event.key === "ArrowUp") { event.preventDefault(); setFocused(years[Math.max(0, Math.min(years.length - 1, index + (event.key === "ArrowDown" ? 1 : -1)))]); }
        if (event.key === "Home" || event.key === "End") { event.preventDefault(); setFocused(event.key === "Home" ? years[0] : years[years.length - 1]); }
      }}>
      {years.map(year => <button key={year} data-year={year} role="option" aria-selected={year === value} tabIndex={focused === year ? 0 : -1}
        type="button" onFocus={() => setFocused(year)} onClick={() => choose(year)}
        className={`block w-full rounded-lg px-3 py-2.5 text-left text-sm focus:bg-blue-100 focus:outline-2 focus:outline-blue-800 ${year === value ? "bg-blue-950 font-bold text-white focus:bg-blue-950" : "text-blue-950 hover:bg-blue-50"}`}>Năm {year}</button>)}
    </div>}
  </div>;
}

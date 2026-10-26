"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Calculator } from "lucide-react";

export type QuickCombination = { code: string; subjects: { code: string; name: string }[] };

/** Chỉ tính tổng ba môn. Tên môn và tổ hợp lấy từ danh mục DB phía server. */
export default function HomeQuickCalculator({ combinations, loadError = false }: {
  combinations: QuickCombination[]; loadError?: boolean;
}) {
  const [selectedCode, setSelectedCode] = useState(combinations[0]?.code ?? "");
  // Giữ điểm theo mã môn để đổi tổ hợp không biến điểm Vật lý thành điểm Tiếng Anh.
  const [bySubject, setBySubject] = useState<Record<string, string>>({});
  const selected = combinations.find(c => c.code === selectedCode);
  const scores = selected?.subjects.map(s => bySubject[s.code] ?? "") ?? [];
  const valid = scores.length === 3 && scores.every(s => s.trim() !== "" && Number.isFinite(Number(s)) && Number(s) >= 0 && Number(s) <= 10);
  const invalid = scores.some(s => s !== "" && (!Number.isFinite(Number(s)) || Number(s) < 0 || Number(s) > 10));
  const total = valid ? scores.reduce((sum, s) => sum + Number(s), 0).toFixed(2) : "—";
  return <section aria-labelledby="quick-calculator-title" className="min-w-0 rounded-2xl border border-white/10 bg-[#14214d] p-5 shadow-xl sm:p-6">
    <div className="flex items-start gap-3"><span className="rounded-xl bg-amber-400/10 p-2.5 text-amber-400"><Calculator size={22} aria-hidden="true" /></span><div><h2 id="quick-calculator-title" className="text-base font-bold text-white">Tính nhanh tổng điểm 3 môn</h2><p className="mt-1 text-xs leading-5 text-blue-200">Chọn tổ hợp và nhập điểm theo từng môn.</p></div></div>
    <label className="mt-5 block text-xs font-semibold text-blue-100">Khối / tổ hợp xét tuyển
      <select aria-label="Khối / tổ hợp tính nhanh" className="mt-2 h-12 w-full min-w-0 rounded-xl border border-[#40558c] bg-[#1d3064] px-3 text-sm text-white outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 disabled:opacity-60" value={selectedCode} onChange={e=>setSelectedCode(e.target.value)} disabled={!combinations.length}>
        {!combinations.length && <option value="">Chưa có tổ hợp</option>}
        {combinations.map(c=><option key={c.code} value={c.code}>{c.code} · {c.subjects.map(s=>s.name).join(" – ")}</option>)}
      </select>
    </label>
    {selected ? <div className="mt-4 grid grid-cols-3 gap-2 sm:gap-3">{selected.subjects.map((subject,i)=><label key={subject.code} className="flex min-w-0 flex-col text-xs font-semibold text-blue-100"><span className="flex min-h-10 items-end pb-2 leading-5">{subject.name}</span><input aria-label={`Điểm ${subject.name}`} type="number" inputMode="decimal" min="0" max="10" step="0.01" placeholder="0–10" value={scores[i]} onChange={e=>setBySubject(prev=>({...prev,[subject.code]:e.target.value}))} className="h-12 w-full min-w-0 rounded-xl border border-[#40558c] bg-[#1d3064] px-2 text-center text-base font-bold text-white outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20" /></label>)}</div> : <p role={loadError ? "alert" : "status"} className="mt-4 rounded-lg border border-white/10 bg-white/5 p-3 text-xs leading-6 text-blue-100">{loadError ? "Chưa tải được danh mục tổ hợp. Vui lòng thử lại sau." : "Chưa có tổ hợp đủ thông tin môn học để tính nhanh."}</p>}
    <div className="mt-5 flex items-center justify-between gap-3 rounded-xl border border-blue-400/20 bg-blue-400/10 p-4"><div><p className="text-xs font-semibold leading-5 text-blue-100">{selected ? `Tổng tổ hợp ${selected.code}` : "Tổng 3 môn"} · chưa cộng ưu tiên</p><p className="mt-1 text-[11px] leading-5 text-blue-200">Chưa đánh giá điều kiện xét tuyển</p></div><output aria-label="Tổng điểm tính nhanh" aria-live="polite" className="shrink-0 whitespace-nowrap text-3xl font-extrabold text-amber-400">{total}<span className="ml-1 text-xs text-blue-100">/30</span></output></div>
    {invalid && <p className="mt-3 text-xs text-orange-200" role="alert">Điểm mỗi môn phải từ 0 đến 10.</p>}
    <Link href="/tinh-diem-quy-doi" className="mt-4 flex min-h-12 items-center justify-center gap-2 rounded-xl bg-amber-500 px-3 py-3 text-center text-xs font-bold leading-5 text-[#15234f] transition-colors hover:bg-amber-400 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-400">Quy đổi &amp; đối chiếu điểm xét tuyển<ArrowRight size={16} aria-hidden="true" className="shrink-0" /></Link>
  </section>;
}

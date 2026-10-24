"use client";
import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import PublishedText from "@/components/admission/PublishedText";
export interface FaqPage { id: string; topic: string; question: string; answer: string }
export default function FaqNotebook({ pages }: { pages: FaqPage[] }) {
  const [page, setPage] = useState(0);
  const reduced = useReducedMotion();
  const index = Math.min(page, Math.max(0, pages.length - 1));
  const item = pages[index];
  if (!item) return null;
  const topics = [...new Set(pages.map(value => value.topic))];
  const turn = (next: number) => setPage(Math.max(0, Math.min(pages.length - 1, next)));
  const button = "min-h-11 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold hover:bg-blue-50 disabled:opacity-40";
  return <div role="group" aria-label="Sổ hỏi đáp tuyển sinh" tabIndex={0} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 sm:p-5" onKeyDown={event => {
    if (event.target !== event.currentTarget) return;
    if (event.key === "ArrowLeft" || event.key === "ArrowRight") { event.preventDefault(); turn(index + (event.key === "ArrowLeft" ? -1 : 1)); }
  }}>
    <div className="grid min-w-0 gap-0 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm md:grid-cols-[220px_minmax(0,1fr)]">
      <nav aria-label="Mục lục hỏi đáp" className="border-b border-slate-200 bg-[#14244e] p-5 text-white md:border-b-0 md:border-r">
        <p className="text-xs font-semibold uppercase tracking-widest text-amber-300">Sổ tay hỏi đáp</p><h3 className="mb-5 mt-2 text-xl font-bold">Bạn đang băn khoăn?</h3>
        <div className="flex flex-wrap gap-2 md:flex-col">{topics.map(topic => <button type="button" key={topic} onClick={() => turn(pages.findIndex(value => value.topic === topic))} aria-pressed={item.topic === topic} className={`min-h-11 rounded-lg px-3 py-2 text-left text-sm leading-6 ${item.topic === topic ? "bg-white text-[#14244e]" : "bg-white/5 text-blue-100 hover:bg-white/10"}`}>{topic}</button>)}</div>
      </nav>
      <div className="min-w-0 border-l-4 border-l-amber-300 bg-[#fffef9]" style={{ perspective: 1200 }}><AnimatePresence mode="wait" initial={false}><motion.article key={item.id} initial={{ opacity: .2, rotateY: reduced ? 0 : -5 }} animate={{ opacity: 1, rotateY: 0 }} exit={{ opacity: 0 }} transition={{ duration: reduced ? 0 : .18 }} style={{ transformOrigin: "left center" }} className="min-h-80 break-words p-5 sm:p-8 lg:p-10" aria-labelledby="faq-question">
        <p className="mb-4 text-sm font-semibold text-orange-700">{item.topic} · Câu hỏi {index + 1}</p><h3 id="faq-question" className="mb-6 max-w-3xl text-xl font-bold leading-8 text-[#14244e] sm:text-2xl">{item.question}</h3>
        <div className="max-w-3xl text-base leading-[1.8] text-slate-700 [&_p]:mb-4 [&_p]:leading-[1.8] [&_li]:mb-2 [&_a]:text-blue-700"><PublishedText content={item.answer} /></div>
        <p className="mt-8 border-t border-slate-200 pt-4 text-xs text-slate-500">Hỏi đáp tuyển sinh UTC · Trang {index + 1}</p>
      </motion.article></AnimatePresence></div>
    </div>
    <div className="mt-4 flex flex-wrap items-center justify-between gap-3"><button type="button" className={button} disabled={index === 0} onClick={() => turn(index - 1)}>← Trang trước</button><label className="flex items-center gap-2 text-sm">Trang<select aria-label="Chọn trang hỏi đáp" className="min-h-11 rounded-lg border border-slate-200 bg-white px-3" value={index} onChange={event => turn(Number(event.target.value))}>{pages.map((value, position) => <option key={value.id} value={position}>{position + 1}</option>)}</select><span aria-live="polite">/ {pages.length}</span></label><button type="button" className={button} disabled={index === pages.length - 1} onClick={() => turn(index + 1)}>Trang sau →</button></div>
  </div>;
}

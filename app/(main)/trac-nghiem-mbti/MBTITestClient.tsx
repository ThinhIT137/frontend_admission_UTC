"use client";
import { publicError } from "@/libs/client-error";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";
import PageMotion from "@/components/ui/PageMotion";
import { useLoading } from "@/contexts/loadingContext";
import { useRouter } from "next/navigation";
import type { MbtiQuestion } from "./mbtiData";
import { api } from "@/libs/api-services/browser-api";

interface MBTITestClientProps {
  initialQuestions?: MbtiQuestion[];
}

export default function MBTITestClient({ initialQuestions = [] }: MBTITestClientProps) {
  const router = useRouter();
  const { beginLoading } = useLoading();
  const reduced = useReducedMotion();
  const questionStart = useRef<HTMLDivElement>(null);
  const submitRelease = useRef<(() => void) | null>(null);
  useEffect(() => () => submitRelease.current?.(), []);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [studentName, setStudentName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [questionsList, setQuestions] = useState<MbtiQuestion[]>(initialQuestions);
  const [error, setError] = useState("");
  useEffect(() => {
    const release = beginLoading();
    let active = true;
    api<{ data: Array<{ id: number; text: string; dimension: "EI" | "SN" | "TF" | "JP"; positive_trait: string }> }>("ai", "/api/mbti/questions")
      .then(r => { if (active) setQuestions(r.data.map(q => ({ id: q.id, text: q.text, dimension: q.dimension, direction: ["I", "N", "F", "P"].includes(q.positive_trait) ? -1 : 1 }))); })
      .catch(e => { if (active) setError(publicError(e.message)); }).finally(release);
    return () => { active = false; release(); };
  }, [beginLoading]);

  const handleSelect = (qId: number, value: number) => {
    setAnswers((prev) => ({ ...prev, [qId]: value }));
  };

  const answeredCount = Object.keys(answers).length;
  const totalQuestions = questionsList.length;
  const isComplete = totalQuestions > 0 && answeredCount === totalQuestions;

  const handleSubmit = async () => {
    if (!isComplete || isSubmitting) return;

    setIsSubmitting(true);
    const release = beginLoading();
    submitRelease.current = release;
    setError("");
    try {
      const response = await api<{ data: { result_id: string; mbti_type: string } }>("ai", "/api/mbti/submit", { studentName: studentName.trim() || undefined, answers });
      if (!response.data.result_id) throw Error("Backend chưa lưu được kết quả. Vui lòng thử lại.");
      router.push(`/ket-qua-tu-van?id=${encodeURIComponent(response.data.result_id)}`);
    } catch (e) { setError(publicError(e instanceof Error ? e.message : "Không thể nộp bài trắc nghiệm")); }
    finally { release(); submitRelease.current = null; setIsSubmitting(false); }
  };
  const [started, setStarted] = useState(false);
  const [step, setStep] = useState(0);
  // Cuộn sau khi React đã thay chặng câu hỏi, không cuộn mỗi lần chọn đáp án.
  useEffect(() => {
    if (!started || !questionStart.current) return;
    questionStart.current.focus({ preventScroll: true });
    questionStart.current.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
  }, [started, step, reduced]);
  const pageCount = Math.max(1, Math.ceil(totalQuestions / 5));
  const currentQuestions = questionsList.slice(step * 5, (step + 1) * 5);
  const groupComplete = currentQuestions.length > 0 && currentQuestions.every(q => answers[q.id] !== undefined);
  return <PageMotion className="space-y-6 pb-12 text-[#14244e]">
    <header className="rounded-2xl bg-gradient-to-br from-[#14244e] to-[#284b9c] p-7 text-white sm:p-10">
      <p className="mb-4 text-xs font-bold uppercase tracking-widest text-amber-300">Một chút tò mò, một góc nhìn mới về bạn</p>
      <h1 className="max-w-2xl text-3xl font-bold leading-tight sm:text-4xl">Ngành học nào hợp với <span className="text-amber-300">cách bạn là chính mình?</span></h1>
      <p className="mt-4 max-w-2xl text-sm leading-7 text-blue-100">Khám phá tính cách MBTI và những hướng học tập đáng để thử. Không có đáp án đúng hay sai — chỉ cần chọn điều gần với bạn nhất.</p>
      <div className="mt-6 flex flex-wrap gap-3 text-xs"><span className="rounded-full bg-white/10 px-4 py-2">{totalQuestions || "…"} câu hỏi ngắn</span><span className="rounded-full bg-white/10 px-4 py-2">Theo nhịp của bạn</span><span className="rounded-full bg-white/10 px-4 py-2">Có thể quay lại sửa đáp án</span></div>
    </header>
    {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-800">{error}</p>}
    <p className="text-sm leading-6 text-slate-500">MBTI là gợi ý tự khám phá, không quyết định năng lực, ngành học hay kết quả tuyển sinh của bạn.</p>
    {!started ? <section className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8"><h2 className="text-2xl font-bold">Bắt đầu từ việc hiểu mình hơn</h2><p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">Mỗi lượt chỉ có 5 câu để bạn dễ tập trung. Bạn có thể đổi lựa chọn trước khi xem kết quả; hãy trả lời theo điều thường đúng với mình.</p><label className="mt-6 block max-w-md text-sm font-semibold">Bạn muốn được gọi là gì? <span className="font-normal text-slate-500">(không bắt buộc)</span><input value={studentName} onChange={e => setStudentName(e.target.value)} placeholder="Tên của bạn" className="mt-2 w-full rounded-xl border border-slate-200 p-3 font-normal" /></label><button disabled={!totalQuestions} onClick={() => setStarted(true)} className="mt-6 rounded-xl bg-orange-500 px-6 py-3 font-semibold text-white hover:bg-orange-600 disabled:opacity-50">{totalQuestions ? "Khám phá bản thân →" : "Đang tải câu hỏi…"}</button></section> : <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-8">
      <div ref={questionStart} tabIndex={-1} className="mb-6 scroll-mt-24 border-b border-slate-100 pb-5 outline-none"><div className="mb-3 flex flex-wrap justify-between gap-2 text-sm"><h2 className="font-semibold">Chặng {step + 1} / {pageCount}</h2><p aria-live="polite">Đã trả lời {answeredCount} / {totalQuestions} câu</p></div><progress aria-label="Tiến độ trả lời" value={answeredCount} max={totalQuestions} className="h-2 w-full accent-orange-500" /></div>
      <div className="space-y-5">{currentQuestions.map((q, index) => <fieldset key={q.id} disabled={isSubmitting} className="rounded-xl border border-slate-200 bg-slate-50/70 p-5"><legend className="px-2 text-base font-semibold leading-7"><span className="mr-2 text-orange-700">{step * 5 + index + 1}.</span>{q.text}</legend><div className="mt-2 grid gap-2 sm:grid-cols-5">{["Rất không đồng ý", "Không đồng ý", "Trung lập", "Đồng ý", "Rất đồng ý"].map((label, i) => <label key={label} className={`flex min-h-16 cursor-pointer items-center gap-2 rounded-lg border p-3 text-xs leading-5 transition-colors ${answers[q.id] === i + 1 ? "border-orange-400 bg-orange-50 text-orange-900" : "border-slate-200 bg-white hover:border-blue-300"}`}><input type="radio" name={`question-${q.id}`} value={i + 1} checked={answers[q.id] === i + 1} onChange={() => handleSelect(q.id, i + 1)} className="shrink-0 accent-orange-500" />{label}</label>)}</div></fieldset>)}</div>
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-5"><button disabled={step === 0 || isSubmitting} onClick={() => setStep(value => value - 1)} className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold disabled:opacity-40">← Chặng trước</button><p className="text-xs text-slate-500">Bạn luôn có thể sửa câu trả lời.</p>{step < pageCount - 1 ? <button disabled={!groupComplete} onClick={() => setStep(value => value + 1)} className="rounded-xl bg-[#14244e] px-5 py-3 text-sm font-semibold text-white disabled:opacity-40">Tiếp tục khám phá →</button> : <button disabled={!isComplete || isSubmitting} onClick={handleSubmit} className="rounded-xl bg-orange-500 px-5 py-3 text-sm font-semibold text-white disabled:opacity-40">{isSubmitting ? "Đang phân tích…" : "Xem điều thú vị về bạn →"}</button>}</div>
    </section>}
  </PageMotion>;
}

"use client";

import { useState } from "react";
import Link from "next/link";
import PublishedText from "@/components/admission/PublishedText";
import { displayAdmissionDate, milestoneStatus, statusLabels, publishedContent } from "@/components/admission/admission-data";

interface AdmissionHistory {
  id: string; year: number; majorCode: string; majorName: string;
  programCode: string; programName: string; quota: number;
  scores: { methodCode: string; methodName: string; score: number }[];
}
interface Props {
  methods: { code: string; name: string }[];
  faculties: { code: string; name: string; majorCount: number }[];
  totalMajors: number | null;
  totalPrograms: number | null;
  faqs: { id: string; topic: string; question: string; answer: string }[];
  admissionHistory: AdmissionHistory[];
  articles: { id: string; title: string; category: string; content: string; publishedAt: string }[];
  milestones: { id: string; title: string; startDate: string; endDate: string | null; note: string | null }[];
  referenceTime: string;
  loadFailures?: string[];
}

export default function ThongTinTuyenSinhClient({ methods, faculties, totalMajors, totalPrograms, faqs, admissionHistory, articles, milestones, referenceTime, loadFailures = [] }: Props) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("ALL");
  const [year, setYear] = useState("ALL");
  const [method, setMethod] = useState("ALL");
  const [scoreSearch, setScoreSearch] = useState("");
  const query = search.trim().toLocaleLowerCase("vi");
  const matches = (text: string) => text.toLocaleLowerCase("vi").includes(query);
  const categories = ["ĐỀ ÁN", "QUY CHẾ", "TIN TỨC", "HƯỚNG DẪN"];
  const visibleArticles = articles.filter(a => (category === "ALL" || a.category === category) && matches(`${a.title} ${publishedContent(a.content).text}`));
  const visibleMethods = methods.filter(m => matches(`${m.code} ${m.name}`));
  const visibleFaqs = faqs.filter(f => matches(`${f.topic} ${f.question} ${f.answer}`));
  const visibleFaculties = faculties.filter(f => matches(f.name));
  const visibleMilestones = milestones.filter(m => matches(`${m.title} ${m.note ?? ""}`));
  const years = [...new Set(admissionHistory.map(h => h.year))].sort((a, b) => b - a);
  const latestYear = years[0];
  const totalQuota = [...new Map(admissionHistory.filter(h => h.year === latestYear).map(h => [h.programCode, h.quota])).values()].reduce((sum, quota) => sum + quota, 0);
  const scoreMethods = [...new Map(admissionHistory.flatMap(h => h.scores.map(s => [s.methodCode, s.methodName] as const))).entries()];
  const scores = admissionHistory.filter(h => (year === "ALL" || String(h.year) === year)
    && (method === "ALL" || h.scores.some(s => s.methodCode === method))
    && `${h.majorCode} ${h.majorName} ${h.programCode} ${h.programName}`.toLocaleLowerCase("vi").includes(scoreSearch.trim().toLocaleLowerCase("vi")));
  const card = "rounded-2xl border-[3px] border-[#111827] bg-[#fffdf7] p-5 sm:p-6 shadow-[4px_4px_0px_#111827]";
  const input = "mt-1 w-full rounded-lg border border-slate-400 bg-white p-2 font-normal";
  const empty = (source: string, hasData: boolean) => loadFailures.includes(source) ? "Chưa tải được dữ liệu. Vui lòng thử lại sau." : hasData ? "Không có kết quả phù hợp với bộ lọc." : "Chưa công bố dữ liệu cho mục này.";
  return <div className="space-y-6 pb-12 text-[#0d1b4e]">
    <header className={card}><p className="font-bold text-blue-700">TRƯỜNG ĐẠI HỌC GIAO THÔNG VẬN TẢI</p><h1 className="mt-2 text-2xl sm:text-3xl font-black">Thông tin tuyển sinh</h1>
      <p className="mt-3 text-slate-600">Tra cứu phương thức, chỉ tiêu, điểm chuẩn và các tin tức, đề án, hướng dẫn đã được công bố trong hệ thống. Điều kiện xét tuyển và học phí thực hiện theo văn bản công bố cho từng năm.</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">{[["Ngành học", totalMajors ?? "Chưa tải được"], ["Chương trình", totalPrograms ?? "Chưa tải được"], [latestYear ? `Chỉ tiêu năm ${latestYear}` : "Chỉ tiêu", latestYear ? totalQuota : "Chưa công bố"]].map(([label, value]) => <div key={label} className="rounded-xl border-2 border-[#111827] bg-[#faf3e6] p-4"><p className="text-sm font-bold">{label}</p><p className="mt-1 text-2xl font-black">{value}</p></div>)}</div>
      <nav className="mt-5 flex flex-wrap gap-4 font-bold underline"><Link href="/tra-cuu-nganh-hoc">Tra cứu ngành học</Link><Link href="/so-sanh-chuong-trinh">So sánh chương trình</Link><Link href="/lo-trinh-tuyen-sinh">Lộ trình tuyển sinh</Link><Link href="/nop-ho-so">Nộp hồ sơ</Link></nav>
    </header>
    {!!loadFailures.length && <p role="alert" className="rounded-xl border border-red-300 bg-red-50 p-4 text-red-800">Chưa tải được: {loadFailures.join(", ")}. Vui lòng thử lại sau.</p>}
    <section className={card}><label className="font-bold">Tìm thông tin tuyển sinh<input value={search} onChange={e => setSearch(e.target.value)} className={input} placeholder="Tìm phương thức, tin tức, đề án hoặc câu hỏi" /></label>
      <nav className="mt-4 flex flex-wrap gap-4 text-sm font-bold underline" aria-label="Mục thông tin tuyển sinh"><a href="#tin-tuc-de-an">Tin tức và đề án</a><a href="#phuong-thuc">Phương thức</a><a href="#chi-tieu-diem-chuan">Chỉ tiêu và điểm chuẩn</a><a href="#lo-trinh">Mốc thời gian</a><a href="#hoi-dap">Hỏi đáp</a></nav>
    </section>

    <section id="tin-tuc-de-an" className={card}><h2 className="text-xl font-black">Tin tức, đề án và hướng dẫn</h2>
      <label className="my-4 block max-w-sm font-bold">Chuyên mục<select className={input} value={category} onChange={e => setCategory(e.target.value)}><option value="ALL">Tất cả chuyên mục</option>{categories.map(c => <option key={c}>{c}</option>)}</select></label>
      <p className="mb-3 text-sm" aria-live="polite">{visibleArticles.length} bài viết</p>
      {!visibleArticles.length ? <p>{empty("tin tức và đề án", !!articles.length)}</p> : <div className="space-y-4">{visibleArticles.map(a => <article key={a.id} className="rounded-xl border-2 border-slate-300 bg-white p-4"><p className="text-sm font-bold text-blue-700">{a.category} · {displayAdmissionDate(a.publishedAt)}</p><h3 className="my-2 text-lg font-bold">{a.title}</h3><details><summary className="cursor-pointer font-bold underline">Đọc nội dung và tài liệu</summary><div className="mt-3"><PublishedText content={a.content} /></div></details></article>)}</div>}
      <p className="mt-4 text-sm text-slate-600">Tài liệu đính kèm xuất hiện khi bài viết có đường dẫn tài liệu đã công bố.</p>
    </section>

    <section id="phuong-thuc" className={card}><h2 className="mb-4 text-xl font-black">Phương thức xét tuyển</h2>
      {!visibleMethods.length ? <p>{empty("phương thức", !!methods.length)}</p> : <ul className="grid gap-3 sm:grid-cols-2">{visibleMethods.map(m => <li key={m.code} className="rounded-xl border-2 border-slate-300 bg-white p-4"><p className="font-mono text-sm font-bold text-blue-700">{m.code}</p><h3 className="mt-1 font-bold">{m.name}</h3><p className="mt-2 text-sm text-slate-600">Xem điều kiện và hướng dẫn trong đề án áp dụng cho năm xét tuyển.</p></li>)}</ul>}
    </section>

    <section className={card}><h2 className="mb-4 text-xl font-black">Khối ngành đào tạo</h2>{visibleFaculties.length ? <ul className="grid gap-3 sm:grid-cols-2">{visibleFaculties.map(f => <li key={f.code} className="rounded-xl border border-slate-300 p-3"><strong>{f.name}</strong> · {f.majorCount} ngành</li>)}</ul> : <p>{empty("khối ngành", !!faculties.length)}</p>}</section>

    <section id="chi-tieu-diem-chuan" className={card}><h2 className="text-xl font-black">Chỉ tiêu và lịch sử điểm chuẩn</h2><p className="mt-2 text-sm text-slate-600">Chỉ tiêu thuộc chương trình theo năm. Điểm lịch sử không bảo đảm kết quả xét tuyển tương lai; chỉ so sánh điểm trong cùng phương thức và thang điểm.</p>
      <div className="my-4 grid gap-3 sm:grid-cols-3"><label className="font-bold">Năm<select className={input} value={year} onChange={e => setYear(e.target.value)}><option value="ALL">Tất cả năm</option>{years.map(y => <option key={y}>{y}</option>)}</select></label><label className="font-bold">Phương thức<select className={input} value={method} onChange={e => setMethod(e.target.value)}><option value="ALL">Tất cả phương thức</option>{scoreMethods.map(([code, name]) => <option key={code} value={code}>{name}</option>)}</select></label><label className="font-bold">Tìm ngành / chương trình<input className={input} value={scoreSearch} onChange={e => setScoreSearch(e.target.value)} placeholder="Mã hoặc tên ngành/chương trình" /></label></div>
      {!scores.length ? <p>{empty("điểm chuẩn", !!admissionHistory.length)}</p> : <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr className="border-b-2 border-slate-400"><th className="p-2">Năm</th><th className="p-2">Ngành / Chương trình</th><th className="p-2">Chỉ tiêu</th><th className="p-2">Điểm theo phương thức</th></tr></thead><tbody>{scores.map(h => <tr key={h.id} className="border-b border-slate-200"><td className="p-2">{h.year}</td><td className="p-2"><Link className="font-bold underline" href={`/tra-cuu-nganh-hoc/${encodeURIComponent(h.programCode)}`}>{h.programCode} · {h.programName}</Link><p className="text-slate-600">{h.majorCode} · {h.majorName}</p></td><td className="p-2">{h.quota}</td><td className="p-2">{h.scores.length ? <ul>{h.scores.filter(s => method === "ALL" || s.methodCode === method).map(s => <li key={s.methodCode}>{s.methodName}: <strong>{s.score > 0 ? s.score : "Chưa công bố"}</strong></li>)}</ul> : "Chưa công bố điểm chuẩn"}</td></tr>)}</tbody></table></div>}
    </section>

    <section id="lo-trinh" className={card}><h2 className="mb-4 text-xl font-black">Mốc thời gian tuyển sinh</h2>{visibleMilestones.length ? <ul className="space-y-3">{visibleMilestones.map(m => <li key={m.id} className="border-l-4 border-blue-800 pl-3"><h3 className="font-bold">{m.title}</h3><p className="text-sm">{displayAdmissionDate(m.startDate)}{m.endDate ? ` → ${displayAdmissionDate(m.endDate)}` : " (sự kiện trong ngày)"} · {statusLabels[milestoneStatus(m.startDate, m.endDate, referenceTime)]}</p>{m.note && <p className="mt-1 whitespace-pre-wrap text-sm text-slate-600">{m.note}</p>}</li>)}</ul> : <p>{empty("lộ trình", !!milestones.length)}</p>}<Link href="/lo-trinh-tuyen-sinh" className="mt-4 inline-block font-bold underline">Xem và lọc toàn bộ lộ trình →</Link></section>

    <section id="hoi-dap" className={card}><h2 className="mb-4 text-xl font-black">Hỏi đáp tuyển sinh</h2>{!visibleFaqs.length ? <p>{empty("hỏi đáp", !!faqs.length)}</p> : <div className="space-y-3">{visibleFaqs.map(f => <details key={f.id} className="rounded-xl border border-slate-300 bg-white p-4"><summary className="cursor-pointer font-bold">{f.question}</summary><p className="my-2 text-sm text-blue-700">{f.topic}</p><PublishedText content={f.answer} /></details>)}</div>}</section>
  </div>;
}

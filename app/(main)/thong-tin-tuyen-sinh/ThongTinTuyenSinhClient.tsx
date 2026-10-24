"use client";

import { useState } from "react";
import Link from "next/link";
import PublishedText from "@/components/admission/PublishedText";
import { displayAdmissionDate, milestoneStatus, statusLabels, publishedContent } from "@/components/admission/admission-data";

import AdmissionHistoryTable, { type AdmissionHistory } from "./AdmissionHistoryTable";
import { admissionYear } from "@/libs/admission-year";
import PageMotion from "@/components/ui/PageMotion";

interface Props {
  methods: { code: string; name: string }[];
  faculties: { code: string; name: string; majorCount: number }[];
  totalMajors: number | null;
  totalPrograms: number | null;
  admissionHistory: AdmissionHistory[];
  programCatalog?: { programCode: string; programName: string; majorCode: string; majorName: string }[];
  articles: { id: string; title: string; category: string; content: string; publishedAt: string }[];
  milestones: { id: string; title: string; startDate: string; endDate: string | null; note: string | null }[];
  referenceTime: string;
  loadFailures?: string[];
}

export default function ThongTinTuyenSinhClient({ methods, faculties, totalMajors, totalPrograms, admissionHistory, programCatalog = [], articles, milestones, referenceTime, loadFailures = [] }: Props) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("ALL");
  const query = search.trim().toLocaleLowerCase("vi");
  const matches = (text: string) => text.toLocaleLowerCase("vi").includes(query);
  const categories = ["ĐỀ ÁN", "QUY CHẾ", "TIN TỨC", "HƯỚNG DẪN"];
  const visibleArticles = articles.filter(a => (category === "ALL" || a.category === category) && matches(`${a.title} ${publishedContent(a.content).text}`));
  const visibleMethods = methods.filter(m => matches(`${m.code} ${m.name}`));
  const visibleFaculties = faculties.filter(f => matches(f.name));
  const visibleMilestones = milestones.filter(m => matches(`${m.title} ${m.note ?? ""}`));
  const years = [...new Set(admissionHistory.map(h => h.year))].sort((a, b) => b - a);
  const referenceYear = Number(new Intl.DateTimeFormat("en", { year: "numeric", timeZone: "Asia/Ho_Chi_Minh" }).format(new Date(referenceTime)));
  const latestYear = admissionYear(years, referenceYear);
  const yearQuotas = [...new Map(admissionHistory.filter(h => h.year === latestYear).map(h => [h.programCode, h.quota])).values()];
  const totalQuota = yearQuotas.some(quota => quota !== null) ? yearQuotas.reduce<number>((sum, quota) => sum + (quota ?? 0), 0) : "Chưa công bố";
  const card = "rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm";
  const input = "mt-1 w-full rounded-lg border border-slate-400 bg-white p-2 font-normal";
  const empty = (source: string, hasData: boolean) => loadFailures.includes(source) ? "Chưa tải được dữ liệu. Vui lòng thử lại sau." : hasData ? "Không có kết quả phù hợp với bộ lọc." : "Chưa công bố dữ liệu cho mục này.";
  return <PageMotion className="space-y-6 pb-12 text-[#0d1b4e]">
    <header className="rounded-2xl bg-gradient-to-br from-[#14244e] to-[#284b9c] p-6 text-white sm:p-8 [&_a]:text-amber-300"><p className="font-bold text-amber-300">TRƯỜNG ĐẠI HỌC GIAO THÔNG VẬN TẢI</p><h1 className="mt-2 text-2xl sm:text-3xl font-black">Thông tin tuyển sinh</h1>
      <p className="mt-3 text-blue-100">Tra cứu phương thức, chỉ tiêu, điểm chuẩn và các tin tức, đề án, hướng dẫn đã được công bố trong hệ thống. Điều kiện xét tuyển và học phí thực hiện theo văn bản công bố cho từng năm.</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">{[["Ngành học", totalMajors ?? "Chưa tải được"], ["Chương trình", totalPrograms ?? "Chưa tải được"], [latestYear ? `Chỉ tiêu năm ${latestYear}` : "Chỉ tiêu", latestYear ? totalQuota : "Chưa công bố"]].map(([label, value]) => <div key={label} className="rounded-xl border border-slate-200 bg-slate-50 p-4"><p className="text-sm font-bold text-slate-500">{label}</p><p className="mt-1 text-2xl font-black text-[#14244e]">{value}</p></div>)}</div>
      <nav className="mt-5 flex flex-wrap gap-4 font-bold underline"><Link href="/tra-cuu-nganh-hoc">Tra cứu ngành học</Link><Link href="/so-sanh-chuong-trinh">So sánh chương trình</Link><Link href="/lo-trinh-tuyen-sinh">Lộ trình tuyển sinh</Link><Link href="/nop-ho-so">Nộp hồ sơ</Link></nav>
    </header>
    {!!loadFailures.length && <p role="alert" className="rounded-xl border border-red-300 bg-red-50 p-4 text-red-800">Chưa tải được: {loadFailures.join(", ")}. Vui lòng thử lại sau.</p>}
    <section className={card}><label className="font-bold">Tìm thông tin tuyển sinh<input value={search} onChange={e => setSearch(e.target.value)} className={input} placeholder="Tìm phương thức, tin tức hoặc đề án" /></label>
      <nav className="mt-4 flex flex-wrap gap-4 text-sm font-bold underline" aria-label="Mục thông tin tuyển sinh"><a href="#tin-tuc-de-an">Tin tức và đề án</a><a href="#phuong-thuc">Phương thức</a><a href="#chi-tieu-diem-chuan">Chỉ tiêu và điểm chuẩn</a><a href="#lo-trinh">Mốc thời gian</a></nav>
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

    <AdmissionHistoryTable admissionHistory={admissionHistory} programCatalog={programCatalog} loadFailed={loadFailures.includes("điểm chuẩn")} referenceYear={referenceYear} />

    <section id="lo-trinh" className={card}><h2 className="mb-4 text-xl font-black">Mốc thời gian tuyển sinh</h2>{visibleMilestones.length ? <ul className="space-y-3">{visibleMilestones.map(m => <li key={m.id} className="border-l-4 border-blue-800 pl-3"><h3 className="font-bold">{m.title}</h3><p className="text-sm">{displayAdmissionDate(m.startDate)}{m.endDate ? ` → ${displayAdmissionDate(m.endDate)}` : " (sự kiện trong ngày)"} · {statusLabels[milestoneStatus(m.startDate, m.endDate, referenceTime)]}</p>{m.note && <p className="mt-1 whitespace-pre-wrap text-sm text-slate-600">{m.note}</p>}</li>)}</ul> : <p>{empty("lộ trình", !!milestones.length)}</p>}<Link href="/lo-trinh-tuyen-sinh" className="mt-4 inline-block font-bold underline">Xem và lọc toàn bộ lộ trình →</Link></section>

  </PageMotion>;
}

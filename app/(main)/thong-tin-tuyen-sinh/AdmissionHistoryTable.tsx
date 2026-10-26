"use client";

import { Fragment, useState } from "react";
import Link from "next/link";

export interface AdmissionHistory {
  id: string; year: number; majorCode: string; majorName: string;
  programCode: string; programName: string; quota: number | null;
  combinations?: string[];
  scores: {
    methodCode: string; methodName: string; score: number;
    maxPreference?: number | null; minPriorityScore?: number | null;
    subjectConditions?: unknown;
  }[];
}

// Chỉ trình bày điều kiện có cấu trúc đã lưu, không diễn giải JSON thành HTML
// hoặc tự suy ra điều kiện từ điểm chuẩn hay tên phương thức.
function conditions(score: AdmissionHistory["scores"][number]): string[] {
  const result: string[] = [];
  if (typeof score.maxPreference === "number" && Number.isInteger(score.maxPreference) && score.maxPreference > 0)
    result.push(`Thứ tự nguyện vọng tối đa: ${score.maxPreference}`);
  if (typeof score.minPriorityScore === "number" && Number.isFinite(score.minPriorityScore) && score.minPriorityScore >= 0)
    result.push(`Điểm ưu tiên tối thiểu: ${score.minPriorityScore}`);
  if (score.subjectConditions && typeof score.subjectConditions === "object" && !Array.isArray(score.subjectConditions)) {
    for (const [subject, minimum] of Object.entries(score.subjectConditions)) {
      if (subject.trim() && typeof minimum === "number" && Number.isFinite(minimum) && minimum >= 0 && minimum <= 10)
        result.push(`${subject}: từ ${minimum} điểm`);
    }
  }
  return result;
}

export default function AdmissionHistoryTable({ admissionHistory, selectedYear, onYearChange, loadFailed = false }: {
  admissionHistory: AdmissionHistory[]; selectedYear: number; onYearChange: (year: number) => void; loadFailed?: boolean;
}) {
  const years = [...new Set(admissionHistory.map(row => row.year))].sort((a, b) => b - a);
  const year = String(selectedYear);
  const [method, setMethod] = useState("ALL");
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [view, setView] = useState<"quota" | "history">(() => admissionHistory.some(row => row.year === selectedYear && row.scores.some(score => Number.isFinite(score.score) && score.score > 0)) ? "history" : "quota");
  const allMethods = [...new Map(admissionHistory.filter(row => String(row.year) === year).flatMap(row => row.scores.map(score => [score.methodCode, score.methodName] as const))).entries()]
    .sort(([a], [b]) => a.localeCompare(b, "vi"));
  const visibleMethods = allMethods.filter(([code]) => method === "ALL" || method === code);
  const query = search.trim().toLocaleLowerCase("vi");
  // Lịch sử tuyển sinh là nguồn chính của từng năm; danh mục chương trình chỉ bổ sung tên/mã.
  // Không thêm chương trình của năm khác hoặc chỉ có cấu hình tổ hợp vào đề án năm này.
  const historicalRows = admissionHistory.filter(row => row.year === selectedYear);
  const rows = historicalRows.filter(row => (method === "ALL" || row.scores.some(score => score.methodCode === method))
    && `${row.majorCode} ${row.majorName} ${row.programCode} ${row.programName}`.toLocaleLowerCase("vi").includes(query));
  const groups = [...new Set(rows.map(row => row.year))].sort((a, b) => b - a).map(value => ({ year: value, rows: rows.filter(row => row.year === value) })).filter(group => group.rows.length);
  const cell = "border-b border-slate-200 px-3 py-3 align-middle";
  const input = "mt-1 w-full rounded-lg border border-slate-400 bg-white p-2 font-normal";
  const columnCount = view === "quota" ? 7 : 5 + visibleMethods.length;
  const programName = (row: AdmissionHistory) => <>
    <Link className="font-bold underline decoration-slate-400 underline-offset-4 hover:text-blue-700" href={`/tra-cuu-nganh-hoc/${encodeURIComponent(row.programCode)}`}>{row.programName}</Link>
    {row.majorCode !== row.programCode && <p className="mt-1 text-xs text-slate-600">Mã ngành: {row.majorCode}</p>}
  </>;
  return <section id="chi-tieu-diem-chuan" className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
    <h2 className="text-xl font-black">Chỉ tiêu và lịch sử điểm chuẩn</h2>
    <p className="mt-2 text-sm leading-relaxed text-slate-600">Tra cứu chỉ tiêu, phương thức, tổ hợp và điều kiện đã lưu theo từng năm. Điểm lịch sử không bảo đảm kết quả xét tuyển tương lai; chỉ so sánh trong cùng phương thức và thang điểm.</p>
    <div role="group" aria-label="Nội dung bảng tuyển sinh" className="mt-5 flex flex-wrap gap-2">
      {([ ["quota", "Chỉ tiêu tuyển sinh"], ["history", "Lịch sử điểm chuẩn"] ] as const).map(([value, label]) => <button key={value} type="button" aria-pressed={view === value} onClick={() => setView(value)} className={`rounded-lg border border-slate-200 px-4 py-2 text-sm font-bold focus-visible:outline-2 focus-visible:outline-offset-4 ${view === value ? "bg-[#0d1b4e] text-white" : "bg-slate-50 hover:bg-amber-100"}`}>{label}</button>)}
    </div>
    <div className="my-5 grid gap-3 sm:grid-cols-3">
      <label className="min-w-0 font-bold">Năm<select className={input} value={year} onChange={event => onYearChange(Number(event.target.value))}>{(years.length ? years : [selectedYear]).map(value => <option key={value} value={value}>{value}</option>)}</select></label>
      <label className="min-w-0 font-bold">Phương thức<select className={input} value={method} onChange={event => setMethod(event.target.value)}><option value="ALL">Tất cả phương thức</option>{allMethods.map(([code, name]) => <option key={code} value={code}>{code} · {name}</option>)}</select></label>
      <label className="min-w-0 font-bold">Tìm ngành / chương trình<input className={input} value={search} onChange={event => setSearch(event.target.value)} placeholder="Mã hoặc tên ngành/chương trình" /></label>
    </div>
    <p aria-live="polite" className="mb-3 text-sm text-slate-600">Năm {year} · {historicalRows.length} chương trình đã có bản ghi tuyển sinh{rows.length !== historicalRows.length ? ` · ${rows.length} kết quả phù hợp bộ lọc` : ""}</p>
    {loadFailed ? <p role="status">Chưa tải được dữ liệu. Vui lòng thử lại sau.</p> : !rows.length ? <p>{admissionHistory.length ? "Không có kết quả phù hợp với bộ lọc." : "Chưa công bố dữ liệu cho mục này."}</p> : <>
      <p className="mb-2 text-xs text-slate-600 sm:hidden">Vuốt ngang để xem đầy đủ các cột.</p>
      <div className="max-w-full overflow-x-auto rounded-lg border border-slate-200" role="region" aria-label={view === "quota" ? "Bảng chỉ tiêu tuyển sinh, có thể cuộn ngang" : "Bảng lịch sử điểm chuẩn, có thể cuộn ngang"} tabIndex={0}>
        <table className="w-full min-w-[960px] border-collapse text-left text-sm leading-relaxed border-2 border-slate-500 [&_th]:border [&_th]:!border-slate-500 [&_td]:border [&_td]:!border-slate-400">
          <caption className="sr-only">{view === "quota" ? "Chỉ tiêu tuyển sinh theo chương trình và năm" : "Lịch sử điểm chuẩn theo từng phương thức"}</caption>
          <thead className="bg-[#0d1b4e] text-white"><tr>
            <th scope="col" className={`${cell} w-12 text-center`}>STT</th>
            <th scope="col" className={`${cell} w-24`}>Mã CTĐT</th>
            <th scope="col" className={`${cell} min-w-72`}>Ngành / chương trình xét tuyển</th>
            <th scope="col" className={`${cell} w-20 text-center`}>Chỉ tiêu</th>
            {view === "quota" ? <><th scope="col" className={`${cell} w-36`}>Phương thức</th><th scope="col" className={`${cell} w-32`}>Tổ hợp</th><th scope="col" className={`${cell} w-28`}>Điều kiện</th></> : <>{visibleMethods.map(([code, name]) => <th key={code} scope="col" className={`${cell} w-24 text-center`}><span className="block text-xs">{name}</span><span className="text-xs font-normal text-blue-200">{code}</span></th>)}<th scope="col" className={`${cell} w-28`}>Tiêu chí phụ</th></>}
          </tr></thead>
          {groups.map(group => <tbody key={group.year}>
            <tr><th scope="rowgroup" colSpan={columnCount} className={`${cell} bg-blue-50 text-base font-black`}>{group.year ? `Năm ${group.year}` : "Chương trình chưa có dữ liệu tuyển sinh theo năm"} · {group.rows.length} chương trình · Chỉ tiêu đã có dữ liệu: {group.rows.some(row => row.quota !== null) ? group.rows.reduce((sum, row) => sum + (row.quota ?? 0), 0) : "Chưa công bố"}</th></tr>
            {group.rows.map((row, index) => <Fragment key={row.id}><tr className={`${index % 2 ? "bg-slate-50" : "bg-white"} hover:bg-blue-50/60`}>
              <td className={`${cell} text-center tabular-nums`}>{index + 1}</td>
              <th scope="row" className={`${cell} break-words font-mono text-xs font-bold`}>{row.programCode}</th>
              <td className={cell}>{programName(row)}</td>
              <td className={`${cell} text-center font-bold tabular-nums`}>{row.quota ?? "Chưa công bố"}</td>
              {view === "quota" ? <>
                <td className={cell}>{row.scores.filter(score => method === "ALL" || score.methodCode === method).length ? <ul className="space-y-2">{row.scores.filter(score => method === "ALL" || score.methodCode === method).map(score => <li key={score.methodCode}><span className="font-semibold">{score.methodCode}</span> · {score.methodName}</li>)}</ul> : "Chưa công bố"}</td>
                <td className={cell}>{row.combinations?.length ? [...new Set(row.combinations)].sort().join(", ") : "Chưa công bố"}</td>
                <td className={cell}><button type="button" aria-expanded={expanded === row.id} aria-controls={`criteria-${row.id}`} onClick={() => setExpanded(expanded === row.id ? null : row.id)} className="min-h-11 rounded-lg px-2 text-xs font-semibold text-blue-800 hover:bg-blue-50">{expanded === row.id ? "Thu gọn ↑" : "Xem chi tiết ↓"}</button></td>
              </> : <>{visibleMethods.map(([code]) => { const score = row.scores.find(item => item.methodCode === code)?.score; return <td key={code} className={`${cell} text-center font-bold tabular-nums`}>{typeof score === "number" && Number.isFinite(score) && score > 0 ? score.toFixed(2) : <span title="Chưa công bố" className="font-normal text-slate-400">—<span className="sr-only"> Chưa công bố</span></span>}</td>; })}<td className={cell}><button type="button" aria-expanded={expanded === row.id} aria-controls={`criteria-${row.id}`} onClick={() => setExpanded(expanded === row.id ? null : row.id)} className="min-h-11 rounded-lg px-2 text-xs font-semibold text-blue-800 hover:bg-blue-50">{expanded === row.id ? "Thu gọn ↑" : "Xem chi tiết ↓"}</button></td></>}
            </tr>{expanded === row.id && <tr id={`criteria-${row.id}`}><td colSpan={columnCount} className="border-b border-blue-200 bg-blue-50/70 p-5"><p className="mb-3 font-semibold">Điều kiện bổ sung · {row.programCode}</p><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{row.scores.filter(score => method === "ALL" || score.methodCode === method).map(score => <div key={score.methodCode}><p className="font-semibold">{score.methodName} ({score.methodCode})</p>{conditions(score).length ? <ul className="mt-2 list-disc space-y-1 pl-5 text-slate-600">{conditions(score).map(detail => <li key={detail}>{detail}</li>)}</ul> : <p className="mt-2 text-slate-500">Chưa công bố điều kiện bổ sung.</p>}</div>)}{!row.scores.length && <p>Chưa công bố điều kiện bổ sung.</p>}</div></td></tr>}</Fragment>)}
          </tbody>)}
        </table>
      </div>
      <p className="mt-3 text-xs leading-relaxed text-slate-600">Tổ hợp là cấu hình chung của chương trình trong đúng năm, chưa phân tách theo phương thức. Phương thức và điều kiện hiển thị theo dữ liệu đã lưu; “Chưa công bố” nghĩa là chưa có thông tin trong hệ thống.</p>
    </>}
  </section>;
}

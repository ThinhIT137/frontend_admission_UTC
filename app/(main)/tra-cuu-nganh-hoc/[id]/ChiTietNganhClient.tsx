"use client";

import { useState } from "react";
import Link from "next/link";
import PublishedText from "@/components/admission/PublishedText";
import { safeExternalUrl } from "@/components/admission/admission-data";

interface CourseFromDbItem {
  ma_ctdt_hoc_phan: string;
  ma_chuong_trinh: string;
  ma_hoc_phan: string;
  nam_ap_dung: number;
  hoc_ky: number;
  loai: string;
  khoi_kien_thuc?: string | null;
  hoc_phan?: {
    ma_hoc_phan: string;
    ten_hoc_phan: string;
    so_tin_chi: number;
    so_tiet_ly_thuyet?: number | null;
    so_tiet_thuc_hanh?: number | null;
    mo_ta?: string | null;
  } | null;
}

interface ProgramItem {
  ma_chuong_trinh: string;
  ten_chuong_trinh: string;
  mo_ta_ngan?: string | null;
  de_cuong?: string | null;
  chuan_dau_ra?: string[] | null;
  luot_xem?: number;
  lich_su_diem_chuan?: any[];
  ctdt_to_hop?: any[];
  hoc_phan?: CourseFromDbItem[];
}

interface CombinationItem {
  ma_to_hop: string;
  ten_mon_1?: string;
  ten_mon_2?: string;
  ten_mon_3?: string;
}

interface ScoreHistoryItem {
  nam: number;
  chi_tieu: number;
  diem: number | null;
  ma_phuong_thuc: string;
  ten_phuong_thuc: string;
  ma_chuong_trinh: string;
  ten_chuong_trinh: string;
}

interface Props {
  major: {
    ma_nganh: string;
    ten_nganh: string;
    khoi_kien_thuc?: string | null;
    khoi_nganh?: {
      ma_khoi_nganh: string;
      ten_khoi_nganh: string;
    } | null;
  };
  programs: ProgramItem[];
  initialProgramId?: string;
  combinations: CombinationItem[];
  scoreHistory: ScoreHistoryItem[];
}

export default function ChiTietNganhClient({ major, programs, initialProgramId, combinations, scoreHistory }: Props) {
  const [programId, setProgramId] = useState(() => programs.some(p => p.ma_chuong_trinh === initialProgramId)
    ? initialProgramId!
    : programs[0]?.ma_chuong_trinh ?? "");
  const program = programs.find(p => p.ma_chuong_trinh === programId);
  const cohortYears = [...new Set((program?.hoc_phan ?? []).map(c => c.nam_ap_dung))].sort((a, b) => b - a);
  const [cohort, setCohort] = useState("");
  const selectedCohort = cohortYears.includes(Number(cohort)) ? Number(cohort) : cohortYears[0];
  const [semester, setSemester] = useState("ALL");
  const [knowledge, setKnowledge] = useState("ALL");
  const [search, setSearch] = useState("");
  const courses = (program?.hoc_phan ?? []).filter(c => c.nam_ap_dung === selectedCohort);
  const semesters = [...new Set(courses.map(c => c.hoc_ky))].sort((a, b) => a - b);
  const blocks = [...new Set(courses.map(c => c.khoi_kien_thuc).filter((b): b is string => !!b))];
  const filteredCourses = courses.filter(c => (semester === "ALL" || String(c.hoc_ky) === semester)
    && (knowledge === "ALL" || c.khoi_kien_thuc === knowledge)
    && `${c.ma_hoc_phan} ${c.hoc_phan?.ten_hoc_phan ?? ""}`.toLocaleLowerCase("vi").includes(search.trim().toLocaleLowerCase("vi")));
  const years = [...new Set(scoreHistory.map(s => s.nam))].sort((a, b) => b - a);
  const [scoreYear, setScoreYear] = useState(String(years[0] ?? "ALL"));
  const [scoreMethod, setScoreMethod] = useState("ALL");
  const [scoreProgram, setScoreProgram] = useState("ALL");
  const methods = [...new Map(scoreHistory.filter(s => s.ma_phuong_thuc !== "N/A").map(s => [s.ma_phuong_thuc, s.ten_phuong_thuc])).entries()];
  const scores = scoreHistory.filter(s => (scoreYear === "ALL" || String(s.nam) === scoreYear)
    && (scoreMethod === "ALL" || s.ma_phuong_thuc === scoreMethod)
    && (scoreProgram === "ALL" || s.ma_chuong_trinh === scoreProgram));
  // Quota belongs to program/year, not to each method row.
  const latestQuota = [...new Map(scoreHistory.filter(s => s.nam === years[0]).map(s => [s.ma_chuong_trinh, s.chi_tieu])).values()].reduce((sum, n) => sum + n, 0);
  const outlineUrl = safeExternalUrl(program?.de_cuong);
  const card = "rounded-2xl border-[3px] border-[#111827] bg-[#fffdf7] p-5 sm:p-6 shadow-[4px_4px_0px_#111827]";
  const input = "mt-1 w-full rounded-lg border border-slate-400 bg-white p-2 font-normal";
  function resetCourses() { setCohort(""); setSemester("ALL"); setKnowledge("ALL"); setSearch(""); }
  return <div className="space-y-6 pb-12 text-[#0d1b4e]">
    <header className={card}>
      <p className="font-bold text-blue-700">{major.khoi_nganh?.ten_khoi_nganh || "Ngành đào tạo"} · {major.ma_nganh}</p>
      <h1 className="mt-2 text-2xl sm:text-3xl font-black">{major.ten_nganh}</h1>
      <p className="mt-3">{programs.length} chương trình · {years[0] ? `Chỉ tiêu đã công bố năm ${years[0]}: ${latestQuota}` : "Chưa công bố chỉ tiêu"}</p>
      <nav className="mt-4 flex flex-wrap gap-4 font-bold underline"><Link href="/so-sanh-chuong-trinh">So sánh chương trình</Link><Link href="/thong-tin-tuyen-sinh">Đề án và hướng dẫn</Link><Link href="/nop-ho-so">Nộp hồ sơ xét tuyển</Link></nav>
    </header>

    <section className={card} aria-labelledby="program-heading">
      <h2 id="program-heading" className="text-xl font-black">Chương trình đào tạo</h2>
      {!programs.length ? <p className="mt-3">Chưa công bố chương trình đào tạo.</p> : <>
        <label className="mt-4 block font-bold">Chọn chương trình<select className={input} value={programId} onChange={e => { setProgramId(e.target.value); resetCourses(); }}>{programs.map(p => <option key={p.ma_chuong_trinh} value={p.ma_chuong_trinh}>{p.ma_chuong_trinh} · {p.ten_chuong_trinh}</option>)}</select></label>
        <div className="mt-4 space-y-5">
          <div><h3 className="font-bold">Giới thiệu và định hướng</h3><PublishedText content={program?.mo_ta_ngan || "Chưa công bố giới thiệu hoặc định hướng nghề nghiệp cho chương trình này."} /></div>
          <div><h3 className="font-bold">Đề cương chương trình</h3>{outlineUrl ? <a href={outlineUrl} target="_blank" rel="noopener noreferrer" className="text-blue-800 underline">Xem đề cương đã công bố ↗</a> : <PublishedText content={program?.de_cuong || "Chưa công bố đề cương chương trình."} />}</div>
          <div><h3 className="font-bold">Chuẩn đầu ra</h3>{program?.chuan_dau_ra?.length ? <ul className="list-disc pl-5">{program.chuan_dau_ra.map((item, i) => <li key={`${item}-${i}`}>{item.replace(/_/g, " ")}</li>)}</ul> : <p>Chưa công bố chuẩn đầu ra.</p>}</div>
          <p className="text-sm text-slate-600">Thời gian đào tạo, văn bằng và cơ hội nghề nghiệp cụ thể được xác định theo đề cương và thông báo của chương trình.</p>
        </div>
      </>}
    </section>

    <section className={card} aria-labelledby="courses-heading">
      <h2 id="courses-heading" className="text-xl font-black">Học phần của chương trình {program?.ma_chuong_trinh}</h2>
      <div className="my-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <label className="font-bold">Năm áp dụng<select className={input} value={selectedCohort ?? ""} onChange={e => { setCohort(e.target.value); setSemester("ALL"); setKnowledge("ALL"); }}>{!cohortYears.length && <option value="">Chưa công bố</option>}{cohortYears.map(y => <option key={y} value={y}>{y}</option>)}</select></label>
        <label className="font-bold">Học kỳ<select className={input} value={semester} onChange={e => setSemester(e.target.value)}><option value="ALL">Tất cả học kỳ</option>{semesters.map(s => <option key={s} value={s}>{s}</option>)}</select></label>
        <label className="font-bold">Khối kiến thức<select className={input} value={knowledge} onChange={e => setKnowledge(e.target.value)}><option value="ALL">Tất cả khối kiến thức</option>{blocks.map(b => <option key={b}>{b}</option>)}</select></label>
        <label className="font-bold">Tìm học phần<input className={input} value={search} onChange={e => setSearch(e.target.value)} placeholder="Mã hoặc tên học phần" /></label>
      </div>
      {!courses.length ? <p>Chưa công bố học phần cho chương trình này.</p> : <>
        <p aria-live="polite" className="mb-3">{filteredCourses.length} / {courses.length} học phần · {filteredCourses.reduce((sum, c) => sum + (c.hoc_phan?.so_tin_chi ?? 0), 0)} tín chỉ trong kết quả lọc.</p>
        <div className="overflow-x-auto"><table className="w-full text-left text-sm"><caption className="sr-only">Học phần chương trình theo năm áp dụng</caption><thead><tr className="border-b-2 border-slate-400"><th className="p-2">Mã học phần</th><th className="p-2">Tên học phần</th><th className="p-2">Tín chỉ</th><th className="p-2">Học kỳ</th><th className="p-2">Loại / Khối kiến thức</th></tr></thead><tbody>{filteredCourses.map(c => <tr key={c.ma_ctdt_hoc_phan} className="border-b border-slate-200"><td className="p-2 font-mono">{c.ma_hoc_phan}</td><td className="p-2">{c.hoc_phan?.ten_hoc_phan ?? "Chưa có tên học phần"}{c.hoc_phan?.mo_ta && <details><summary className="cursor-pointer text-blue-800">Mô tả học phần</summary><p className="whitespace-pre-wrap">{c.hoc_phan.mo_ta}</p></details>}</td><td className="p-2">{c.hoc_phan?.so_tin_chi ?? "Chưa công bố"}</td><td className="p-2">{c.hoc_ky}</td><td className="p-2">{c.loai === "bat_buoc" ? "Bắt buộc" : c.loai === "tu_chon" ? "Tự chọn" : c.loai} / {c.khoi_kien_thuc || "Chưa phân loại"}</td></tr>)}</tbody></table></div>
        {!filteredCourses.length && <p className="mt-3">Không tìm thấy học phần phù hợp với bộ lọc.</p>}
      </>}
    </section>

    <section className={card}><h2 className="text-xl font-black">Tổ hợp xét tuyển</h2>
      <p className="my-2 text-sm text-slate-600">Tổng hợp các tổ hợp đã lưu cho ngành; xem đề án và tra cứu theo năm để xác định tổ hợp áp dụng.</p>
      {combinations.length ? <ul className="grid gap-2 sm:grid-cols-2">{combinations.map(c => <li key={c.ma_to_hop} className="rounded-lg border border-slate-300 p-3"><strong>{c.ma_to_hop}</strong> · {[c.ten_mon_1, c.ten_mon_2, c.ten_mon_3].filter(Boolean).join(" – ")}</li>)}</ul> : <p>Chưa công bố tổ hợp xét tuyển.</p>}
    </section>

    <section className={card} id="diem-chuan"><h2 className="text-xl font-black">Chỉ tiêu và lịch sử điểm chuẩn</h2>
      <p className="mt-2 text-sm text-slate-600">Điểm lịch sử chỉ để tham khảo. Chỉ tiêu là tổng của chương trình theo năm, không cộng lặp theo từng phương thức.</p>
      <div className="my-4 grid gap-3 sm:grid-cols-3">
        <label className="font-bold">Năm điểm chuẩn<select className={input} value={scoreYear} onChange={e => setScoreYear(e.target.value)}><option value="ALL">Tất cả năm</option>{years.map(y => <option key={y}>{y}</option>)}</select></label>
        <label className="font-bold">Chương trình điểm chuẩn<select className={input} value={scoreProgram} onChange={e => setScoreProgram(e.target.value)}><option value="ALL">Tất cả chương trình</option>{programs.map(p => <option key={p.ma_chuong_trinh} value={p.ma_chuong_trinh}>{p.ten_chuong_trinh}</option>)}</select></label>
        <label className="font-bold">Phương thức điểm chuẩn<select className={input} value={scoreMethod} onChange={e => setScoreMethod(e.target.value)}><option value="ALL">Tất cả phương thức</option>{methods.map(([id, name]) => <option key={id} value={id}>{name}</option>)}</select></label>
      </div>
      {!scores.length ? <p>{scoreHistory.length ? "Không có dữ liệu phù hợp với bộ lọc." : "Chưa công bố chỉ tiêu hoặc điểm chuẩn."}</p> : <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr className="border-b-2 border-slate-400"><th className="p-2">Năm</th><th className="p-2">Chương trình</th><th className="p-2">Phương thức</th><th className="p-2">Chỉ tiêu chương trình</th><th className="p-2">Điểm chuẩn</th></tr></thead><tbody>{scores.map((s, i) => <tr key={`${s.nam}-${s.ma_chuong_trinh}-${s.ma_phuong_thuc}-${i}`} className="border-b border-slate-200"><td className="p-2">{s.nam}</td><td className="p-2">{s.ten_chuong_trinh}</td><td className="p-2">{s.ma_phuong_thuc === "N/A" ? "Chưa công bố" : s.ten_phuong_thuc}</td><td className="p-2">{s.chi_tieu}</td><td className="p-2">{s.diem != null && s.diem > 0 ? s.diem : "Chưa công bố"}</td></tr>)}</tbody></table></div>}
    </section>
  </div>;
}

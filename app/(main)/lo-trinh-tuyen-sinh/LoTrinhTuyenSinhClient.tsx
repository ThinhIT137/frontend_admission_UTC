"use client";

import { useState } from "react";
import Link from "next/link";
import { admissionDay, displayAdmissionDate, milestoneStatus, statusLabels, type MilestoneStatus } from "@/components/admission/admission-data";

interface Milestone {
  ma_su_kien: string;
  ten_su_kien: string;
  thoi_gian_bat_dau: string | Date;
  thoi_gian_ket_thuc: string | Date | null;
  ghi_chu: string | null;
}

export default function LoTrinhTuyenSinhClient({ dbMilestones, referenceTime, loadError = false }: {
  dbMilestones: Milestone[];
  referenceTime: string;
  loadError?: boolean;
}) {
  const [year, setYear] = useState("ALL");
  const [status, setStatus] = useState<MilestoneStatus | "ALL">("ALL");
  const [search, setSearch] = useState("");
  const milestones = [...dbMilestones].sort((a, b) => (admissionDay(a.thoi_gian_bat_dau) ?? "9999").localeCompare(admissionDay(b.thoi_gian_bat_dau) ?? "9999"));
  const years = [...new Set(milestones.map(m => admissionDay(m.thoi_gian_bat_dau)?.slice(0, 4)).filter((y): y is string => !!y))].sort().reverse();
  const filtered = milestones.filter(m => (year === "ALL" || admissionDay(m.thoi_gian_bat_dau)?.startsWith(year))
    && (status === "ALL" || milestoneStatus(m.thoi_gian_bat_dau, m.thoi_gian_ket_thuc, referenceTime) === status)
    && `${m.ten_su_kien} ${m.ghi_chu ?? ""}`.toLocaleLowerCase("vi").includes(search.trim().toLocaleLowerCase("vi")));
  const card = "rounded-2xl border-[3px] border-[#111827] bg-[#fffdf7] p-5 sm:p-6 shadow-[4px_4px_0px_#111827]";
  return <div className="space-y-6 pb-12 text-[#0d1b4e]">
    <header className={card}><p className="font-bold text-blue-700">KẾ HOẠCH TUYỂN SINH</p><h1 className="mt-2 text-2xl sm:text-3xl font-black">Lộ trình tuyển sinh</h1>
      <p className="mt-3 text-slate-600">Các mốc thời gian đã được cập nhật trong hệ thống. Mốc không có ngày kết thúc được hiển thị như sự kiện trong ngày bắt đầu; xem ghi chú để biết hướng dẫn cụ thể.</p>
      <p className="mt-2 text-sm">Trạng thái theo ngày {displayAdmissionDate(referenceTime)} (giờ Việt Nam).</p>
      <nav className="mt-4 flex flex-wrap gap-4 font-bold underline"><Link href="/thong-tin-tuyen-sinh">Thông tin và đề án</Link><Link href="/tra-cuu-nganh-hoc">Tra cứu ngành học</Link><Link href="/nop-ho-so">Nộp hồ sơ</Link></nav>
    </header>
    {loadError && <p role="alert" className="rounded-xl border border-red-300 bg-red-50 p-4 text-red-800">Chưa tải được lộ trình tuyển sinh. Vui lòng thử lại sau.</p>}
    <section className={card} aria-label="Bộ lọc lộ trình"><div className="grid gap-4 sm:grid-cols-3">
      <label className="font-bold">Tìm kiếm<input className="mt-1 w-full rounded-lg border border-slate-400 bg-white p-2 font-normal" value={search} onChange={e => setSearch(e.target.value)} placeholder="Tên mốc hoặc ghi chú" /></label>
      <label className="font-bold">Năm<select className="mt-1 w-full rounded-lg border border-slate-400 bg-white p-2 font-normal" value={year} onChange={e => setYear(e.target.value)}><option value="ALL">Tất cả năm</option>{years.map(y => <option key={y}>{y}</option>)}</select></label>
      <label className="font-bold">Trạng thái<select className="mt-1 w-full rounded-lg border border-slate-400 bg-white p-2 font-normal" value={status} onChange={e => setStatus(e.target.value as MilestoneStatus | "ALL")}><option value="ALL">Tất cả trạng thái</option>{Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
    </div><button className="mt-4 rounded-lg border border-slate-400 px-3 py-2 font-bold" onClick={() => { setYear("ALL"); setStatus("ALL"); setSearch(""); }}>Xóa bộ lọc</button></section>
    <p aria-live="polite" className="font-bold">{filtered.length} / {milestones.length} mốc thời gian</p>
    {!filtered.length && !loadError && <p className={card}>{milestones.length ? "Không tìm thấy mốc phù hợp với bộ lọc." : "Chưa công bố mốc thời gian tuyển sinh."}</p>}
    {filtered.map(m => <article key={m.ma_su_kien} className={card}>
      <p className="text-sm font-bold text-blue-700">{statusLabels[milestoneStatus(m.thoi_gian_bat_dau, m.thoi_gian_ket_thuc, referenceTime)]}</p>
      <h2 className="mt-2 text-xl font-black">{m.ten_su_kien}</h2>
      <p className="my-3 font-mono font-bold">{displayAdmissionDate(m.thoi_gian_bat_dau)}{m.thoi_gian_ket_thuc ? ` → ${displayAdmissionDate(m.thoi_gian_ket_thuc)}` : ""}</p>
      <details><summary className="cursor-pointer font-bold underline">Ghi chú và hướng dẫn</summary><p className="mt-3 whitespace-pre-wrap text-slate-700">{m.ghi_chu || "Chưa công bố hướng dẫn cho mốc này."}</p></details>
    </article>)}
  </div>;
}

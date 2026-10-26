"use client";

import { useState } from "react";
import Link from "next/link";

import AdmissionHistoryTable, { type AdmissionHistory } from "./AdmissionHistoryTable";
import { admissionYear } from "@/libs/admission-year";
import PageMotion from "@/components/ui/PageMotion";
import AdmissionTimeline from "@/components/admission/AdmissionTimeline";
import UtcOfficialInfo from "./UtcOfficialInfo";
import UtcAdmissionReference from "./UtcAdmissionReference";
import AdmissionSectionNav from "./AdmissionSectionNav";
import BackToTop from "./BackToTop";

interface Props {
  admissionHistory: AdmissionHistory[];
  milestones: { id: string; title: string; startDate: string; endDate: string | null; note: string | null }[];
  referenceTime: string;
  loadFailures?: string[];
}

export default function ThongTinTuyenSinhClient({ admissionHistory, milestones, referenceTime, loadFailures = [] }: Props) {
  const years = [...new Set(admissionHistory.map(h => h.year))].sort((a, b) => b - a);
  const referenceYear = Number(new Intl.DateTimeFormat("en", { year: "numeric", timeZone: "Asia/Ho_Chi_Minh" }).format(new Date(referenceTime)));
  const [selectedYear, setSelectedYear] = useState(() => admissionYear(years, referenceYear));
  // Thống kê và bảng dùng cùng một tập bản ghi của năm, không trộn danh mục toàn lịch sử.
  const annualRows = admissionHistory.filter(h => h.year === selectedYear);
  const annualMajors = new Set(annualRows.map(h => h.majorCode)).size;
  const annualPrograms = new Set(annualRows.map(h => h.programCode)).size;
  const yearQuotas = [...new Map(annualRows.map(h => [h.programCode, h.quota])).values()];
  const totalQuota = yearQuotas.some(quota => quota !== null) ? yearQuotas.reduce<number>((sum, quota) => sum + (quota ?? 0), 0) : "Chưa công bố";
  return <PageMotion className="space-y-6 pb-12 text-[#0d1b4e] [&_section[id]]:scroll-mt-24">
    <BackToTop />
    <header className="rounded-2xl bg-gradient-to-br from-[#14244e] to-[#284b9c] p-6 text-white sm:p-8 [&_a]:text-amber-300"><p className="font-bold text-amber-300">TRƯỜNG ĐẠI HỌC GIAO THÔNG VẬN TẢI</p><h1 className="mt-2 text-2xl sm:text-3xl font-black">Thông tin tuyển sinh</h1>
      <p className="mt-3 text-blue-100">Tra cứu lịch tuyển sinh, điều kiện xét tuyển, học phí dự kiến, chỉ tiêu và điểm chuẩn. Mỗi nhóm thông tin có đường dẫn đến văn bản chính thức của UTC để đối chiếu.</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">{[[`Ngành tuyển sinh ${selectedYear}`, annualMajors], [`Chương trình ${selectedYear}`, annualPrograms], [`Chỉ tiêu ${selectedYear}`, totalQuota]].map(([label, value]) => <div key={label} className="rounded-xl border border-slate-200 bg-slate-50 p-4"><p className="text-sm font-bold text-slate-500">{label}</p><p className="mt-1 text-2xl font-black text-[#14244e]">{loadFailures.includes("điểm chuẩn") ? "Chưa tải được" : value}</p></div>)}</div>
      <nav className="mt-5 flex flex-wrap gap-4 font-bold underline"><Link href="/tra-cuu-nganh-hoc">Tra cứu chương trình đào tạo</Link><Link href="/so-sanh-chuong-trinh">So sánh chương trình</Link><Link href="/lo-trinh-tuyen-sinh">Lộ trình tuyển sinh</Link><Link href="/nop-ho-so">Nộp hồ sơ</Link></nav>
    </header>
    <AdmissionSectionNav />
    <AdmissionTimeline milestones={milestones} referenceTime={referenceTime} />
    <p className="text-xs leading-6 text-slate-500">Timeline hiển thị lịch đang lưu trong hệ thống. Riêng đợt nộp minh chứng, <a href="https://tuyensinh.utc.edu.vn/?q=node/23059" target="_blank" rel="noopener noreferrer" className="font-semibold text-blue-700 underline">đối chiếu hướng dẫn UTC</a> và thông báo cập nhật; không dùng lịch đăng ký xét kết hợp của trường khác.</p>
    <UtcOfficialInfo />
    {!!loadFailures.length && <p role="alert" className="rounded-xl border border-red-300 bg-red-50 p-4 text-red-800">Chưa tải được: {loadFailures.join(", ")}. Vui lòng thử lại sau.</p>}
<AdmissionHistoryTable key={selectedYear} admissionHistory={admissionHistory} selectedYear={selectedYear} onYearChange={setSelectedYear} loadFailed={loadFailures.includes("điểm chuẩn")} />
    <UtcAdmissionReference history={admissionHistory} loadFailed={loadFailures.includes("điểm chuẩn")} />

  </PageMotion>;
}

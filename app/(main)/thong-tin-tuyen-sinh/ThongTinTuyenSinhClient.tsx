"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { DisclaimerBanner } from "@/components/ui/DisclaimerBanner";

export interface MilestoneItem {
  id: string;
  title: string;
  startDate: string;
  endDate?: string | null;
  note?: string | null;
  status: "PAST" | "ACTIVE" | "UPCOMING";
  statusText: string;
}

export interface MethodItem {
  code: string;
  name: string;
  description?: string;
  target?: string;
  requirements?: string[];
}

export interface FaqItem {
  id: string;
  topic: string;
  question: string;
  answer: string;
}

export interface FacultySummary {
  code: string;
  name: string;
  majorCount: number;
}

export interface AdmissionInfoProps {
  initialMilestones: MilestoneItem[];
  initialMethods: MethodItem[];
  faculties: FacultySummary[];
  totalMajors: number;
  totalPrograms: number;
  totalQuota: number;
  initialFaqs: FaqItem[];
}

export default function ThongTinTuyenSinhClient({
  initialMilestones,
  initialMethods,
  faculties,
  totalMajors,
  totalPrograms,
  totalQuota,
  initialFaqs,
}: AdmissionInfoProps) {
  // Search query
  const [search, setSearch] = useState("");
  // Filter timeline status
  const [timelineFilter, setTimelineFilter] = useState<"ALL" | "ACTIVE" | "UPCOMING" | "PAST">("ALL");
  // Open FAQ index
  const [openFaq, setOpenFaq] = useState<string | null>(initialFaqs[0]?.id || null);
  // Active section for TOC
  const [activeSection, setActiveSection] = useState("timeline");
  // Toggle conversion table viewer
  const [showConversionTable, setShowConversionTable] = useState(false);

  // Track active section on scroll
  useEffect(() => {
    const handleScroll = () => {
      const sections = ["timeline", "phuong-thuc", "chi-tieu", "quy-che", "faq", "lien-he"];
      const scrollPosition = window.scrollY + 200;

      for (const sectionId of sections) {
        const element = document.getElementById(sectionId);
        if (element) {
          const top = element.offsetTop;
          const height = element.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(sectionId);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Filter Milestones
  const filteredMilestones = useMemo(() => {
    return initialMilestones.filter((m) => {
      const matchSearch =
        m.title.toLowerCase().includes(search.toLowerCase()) ||
        (m.note || "").toLowerCase().includes(search.toLowerCase());
      const matchFilter = timelineFilter === "ALL" || m.status === timelineFilter;
      return matchSearch && matchFilter;
    });
  }, [initialMilestones, search, timelineFilter]);

  // Filter Methods
  const filteredMethods = useMemo(() => {
    if (!search.trim()) return initialMethods;
    const lower = search.toLowerCase();
    return initialMethods.filter(
      (m) =>
        m.name.toLowerCase().includes(lower) ||
        m.code.toLowerCase().includes(lower) ||
        (m.description || "").toLowerCase().includes(lower)
    );
  }, [initialMethods, search]);

  // Filter FAQs
  const filteredFaqs = useMemo(() => {
    if (!search.trim()) return initialFaqs;
    const lower = search.toLowerCase();
    return initialFaqs.filter(
      (f) =>
        f.question.toLowerCase().includes(lower) ||
        f.answer.toLowerCase().includes(lower) ||
        f.topic.toLowerCase().includes(lower)
    );
  }, [initialFaqs, search]);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const yOffset = -90;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  const handleDownloadScheme = () => {
    const element = document.createElement("a");
    const content = `TRƯỜNG ĐẠI HỌC GIAO THÔNG VẬN TẢI - CƠ SỞ HÀ NỘI
ĐỀ ÁN TUYỂN SINH TRÌNH ĐỘ ĐẠI HỌC CHÍNH QUY NĂM 2026
Mã trường: GHA
Địa chỉ: Số 3 phố Cầu Giấy, P. Láng Thượng, Q. Đống Đa, Hà Nội
Tổng chỉ tiêu dự kiến: ${totalQuota || 6000} sinh viên.
Chi tiết xem tại cổng thông tin tuyển sinh chính thức: https://tuyensinh.utc.edu.vn`;
    const file = new Blob([content], { type: "text/plain;charset=utf-8" });
    element.href = URL.createObjectURL(file);
    element.download = "De_an_tuyen_sinh_UTC_HaNoi_K66_2026.txt";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const activeMilestonesCount = initialMilestones.filter((m) => m.status === "ACTIVE").length;

  return (
    <div className="flex flex-col w-full space-y-8 pb-16">
      {/* 1. Header Banner */}
      <div className="bg-[#fffdf7] p-6 lg:p-8 border-[3px] border-[#111827] shadow-[6px_6px_0px_#111827] rounded-2xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#fdb712] border-[2px] border-[#111827] font-stamp text-[12px] font-black text-[#111827] uppercase rotate-[-1deg] shadow-[2px_2px_0px_#111827]">
              <span className="material-symbols-outlined text-[16px]">verified</span>
              HỘI ĐỒNG TUYỂN SINH K66 • CƠ SỞ HÀ NỘI (GHA)
            </div>
            <h1 className="font-display font-black text-[28px] sm:text-[34px] text-[#0d1b4e] uppercase leading-tight tracking-tight">
              THÔNG TIN & QUY CHẾ TUYỂN SINH UTC HÀ NỘI
            </h1>
            <p className="text-[14px] sm:text-[15px] text-[#45464f] font-medium leading-relaxed">
              Cổng tra cứu quy chế tuyển sinh, các mốc thời gian xét tuyển, phương thức xét tuyển và chỉ tiêu đào tạo Đại học chính quy Trường Đại học Giao thông Vận tải (Cơ sở Hà Nội - Mã trường: GHA).
            </p>
          </div>

          <div className="hidden md:flex flex-col items-end gap-1 shrink-0 bg-[#faf3e6] px-4 py-3 rounded-xl border-[2px] border-[#111827] shadow-[3px_3px_0px_#111827]">
            <span className="text-[11px] font-black uppercase text-[#767680] font-stamp">Khóa Tuyển Sinh</span>
            <span className="font-display font-black text-[22px] text-[#0d1b4e]">K66 (2026 - 2027)</span>
            <span className="text-[11px] font-bold text-[#15803d] flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#15803d]" />
              Áp dụng Cơ sở Hà Nội
            </span>
          </div>
        </div>

        {/* Decorative corner stamp */}
        <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-[#fdb712]/15 rounded-full pointer-events-none blur-xl" />
      </div>

      {/* 2. Disclaimer Banner */}
      <DisclaimerBanner
        text="Thông tin chỉ tiêu, phương thức và mốc thời gian áp dụng cho Cơ sở Hà Nội (Mã trường: GHA). Thí sinh lưu ý theo dõi lịch điều chỉnh nguyện vọng trực tuyến trên Cổng dịch vụ công của Bộ GD&ĐT."
      />

      {/* 3. Global Quick Search Bar */}
      <div className="bg-[#fffdf7] p-4 sm:p-5 border-[3px] border-[#111827] shadow-[5px_5px_0px_#111827] rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#767680] text-[22px]">
            search
          </span>
          <input
            type="text"
            placeholder="Tìm nhanh mốc thời gian, phương thức (PT100, IELTS, ĐGNL...), quy chế hoặc câu hỏi FAQ..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-10 py-3 bg-[#faf3e6] border-[2px] border-[#111827] rounded-xl text-[14px] font-medium text-[#1e1b14] outline-none focus:bg-white focus:ring-2 focus:ring-[#0d1b4e] transition-all placeholder:text-[#767680]"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#767680] hover:text-[#111827] text-[18px]"
            >
              ✕
            </button>
          )}
        </div>

        {search && (
          <div className="shrink-0 text-[13px] font-bold text-[#0d1b4e] px-3 py-1.5 bg-[#ffdea8] rounded-lg border border-[#111827]">
            Đang lọc theo từ khóa: &quot;{search}&quot;
          </div>
        )}
      </div>

      {/* 4. Main Layout with Content and Sticky TOC */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Content Column */}
        <div className="lg:col-span-8 xl:col-span-9 space-y-10 min-w-0">

          {/* BLOCK 1: TIMELINE MỐC THỜI GIAN */}
          <section id="timeline" className="scroll-mt-24 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-[3px] border-[#111827] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#0d1b4e] text-[#fdb712] flex items-center justify-center font-bold shrink-0">
                  <span className="material-symbols-outlined text-[22px]">event</span>
                </div>
                <div>
                  <h2 className="font-display font-black text-[22px] sm:text-[24px] text-[#0d1b4e] uppercase leading-tight">
                    Lộ Trình & Mốc Thời Gian Tuyển Sinh
                  </h2>
                  <p className="text-[12px] text-[#767680] font-medium">
                    Theo dõi tiến độ xét tuyển sớm, thi tốt nghiệp, đăng ký NV và nhập học K66
                  </p>
                </div>
              </div>

              {/* Status Tabs Filter */}
              <div className="flex items-center gap-1 bg-[#faf3e6] p-1 border-[2px] border-[#111827] rounded-xl overflow-x-auto shrink-0">
                <button
                  onClick={() => setTimelineFilter("ALL")}
                  className={`px-3 py-1 rounded-lg text-[12px] font-bold transition-all ${
                    timelineFilter === "ALL" ? "bg-[#0d1b4e] text-white shadow-xs" : "text-[#45464f] hover:bg-white/60"
                  }`}
                >
                  Tất cả ({initialMilestones.length})
                </button>
                <button
                  onClick={() => setTimelineFilter("ACTIVE")}
                  className={`px-3 py-1 rounded-lg text-[12px] font-bold transition-all flex items-center gap-1 ${
                    timelineFilter === "ACTIVE" ? "bg-[#15803d] text-white shadow-xs" : "text-[#15803d] hover:bg-white/60"
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-[#86efac] animate-ping" />
                  Đang diễn ra ({activeMilestonesCount})
                </button>
                <button
                  onClick={() => setTimelineFilter("UPCOMING")}
                  className={`px-3 py-1 rounded-lg text-[12px] font-bold transition-all ${
                    timelineFilter === "UPCOMING" ? "bg-[#0284c7] text-white shadow-xs" : "text-[#0284c7] hover:bg-white/60"
                  }`}
                >
                  Sắp tới
                </button>
                <button
                  onClick={() => setTimelineFilter("PAST")}
                  className={`px-3 py-1 rounded-lg text-[12px] font-bold transition-all ${
                    timelineFilter === "PAST" ? "bg-gray-600 text-white shadow-xs" : "text-gray-600 hover:bg-white/60"
                  }`}
                >
                  Đã kết thúc
                </button>
              </div>
            </div>

            {/* Timeline Cards */}
            {filteredMilestones.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-2xl border-[2px] border-dashed border-[#c6c5d0] text-[#767680]">
                <span className="material-symbols-outlined text-[36px] text-gray-400 mb-2">event_busy</span>
                <p className="font-bold text-[14px]">Không tìm thấy mốc thời gian phù hợp với bộ lọc!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredMilestones.map((item, idx) => {
                  const isCurrent = item.status === "ACTIVE";
                  const isPast = item.status === "PAST";

                  return (
                    <div
                      key={item.id || idx}
                      className={`p-5 rounded-2xl border-[3px] border-[#111827] shadow-[4px_4px_0px_#111827] transition-all ${
                        isCurrent
                          ? "bg-[#fffdf7] border-[#15803d] shadow-[5px_5px_0px_#15803d]"
                          : isPast
                          ? "bg-[#f9fafb] opacity-80"
                          : "bg-white"
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
                        <div className="flex items-center gap-2.5">
                          <span
                            className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-[13px] border-[2px] border-[#111827] ${
                              isCurrent
                                ? "bg-[#fdb712] text-[#0d1b4e]"
                                : isPast
                                ? "bg-[#86efac] text-[#15803d]"
                                : "bg-[#faf3e6] text-[#767680]"
                            }`}
                          >
                            {isPast ? "✓" : idx + 1}
                          </span>
                          <span className="font-mono text-[13px] font-bold text-[#0d1b4e] bg-[#faf3e6] px-2.5 py-1 rounded-lg border border-[#c6c5d0]">
                            {item.startDate}
                            {item.endDate && ` ➔ ${item.endDate}`}
                          </span>
                        </div>

                        {/* Status Tag */}
                        <div>
                          {item.status === "ACTIVE" && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#86efac] text-[#14532d] font-black text-[11px] font-stamp border border-[#16a34a] shadow-xs animate-pulse">
                              <span className="w-2 h-2 rounded-full bg-[#16a34a]" />
                              ĐANG DIỄN RA
                            </span>
                          )}
                          {item.status === "UPCOMING" && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#e0f2fe] text-[#0369a1] font-black text-[11px] font-stamp border border-[#0284c7]">
                              <span className="material-symbols-outlined text-[14px]">schedule</span>
                              SẮP DIỄN RA
                            </span>
                          )}
                          {item.status === "PAST" && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f3f4f6] text-[#6b7280] font-black text-[11px] font-stamp border border-[#d1d5db]">
                              <span className="material-symbols-outlined text-[14px]">check_circle</span>
                              ĐÃ KẾT THÚC
                            </span>
                          )}
                        </div>
                      </div>

                      <h3 className="font-display font-bold text-[17px] text-[#0d1b4e] mt-1 leading-snug">
                        {item.title}
                      </h3>

                      {item.note && (
                        <p className="text-[13px] text-[#45464f] mt-2 font-medium leading-relaxed bg-[#faf3e6] p-3 rounded-xl border border-[#e9e2d5]">
                          {item.note}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* BLOCK 2: PHƯƠNG THỨC XÉT TUYỂN */}
          <section id="phuong-thuc" className="scroll-mt-24 space-y-4">
            <div className="flex items-center gap-2.5 border-b-[3px] border-[#111827] pb-3">
              <div className="w-9 h-9 rounded-xl bg-[#0284c7] text-white flex items-center justify-center font-bold shrink-0">
                <span className="material-symbols-outlined text-[22px]">how_to_reg</span>
              </div>
              <div>
                <h2 className="font-display font-black text-[22px] sm:text-[24px] text-[#0d1b4e] uppercase leading-tight">
                  Các Phương Thức Xét Tuyển Chính Thức 2026
                </h2>
                <p className="text-[12px] text-[#767680] font-medium">
                  Căn cứ xét tuyển và điều kiện đăng ký nguyện vọng vào các ngành UTC Cơ sở Hà Nội
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {filteredMethods.map((pt) => (
                <div
                  key={pt.code}
                  className="bg-white p-5 rounded-2xl border-[3px] border-[#111827] shadow-[4px_4px_0px_#111827] hover:shadow-[6px_6px_0px_#111827] transition-all space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="font-stamp font-black text-[13px] text-[#0d1b4e] bg-[#fdb712] px-3 py-1 rounded-lg border border-[#111827] shadow-xs">
                        {pt.code}
                      </span>
                      <h3 className="font-display font-black text-[16px] text-[#0d1b4e]">
                        {pt.name}
                      </h3>
                    </div>
                  </div>

                  <p className="text-[14px] text-[#374151] leading-relaxed font-medium">
                    {pt.description || "Xét tuyển theo kết quả học tập và năng lực đáp ứng chuẩn đầu vào theo đề án."}
                  </p>

                  <div className="pt-2 flex flex-wrap items-center gap-2 text-[12px]">
                    <span className="px-2.5 py-1 bg-[#faf3e6] border border-[#c6c5d0] rounded-md font-bold text-[#0d1b4e]">
                      Áp dụng: Cơ sở Hà Nội (Mã trường: GHA)
                    </span>
                    <span className="px-2.5 py-1 bg-[#f0fdf4] border border-[#bbf7d0] rounded-md font-semibold text-[#166534]">
                      Chỉ tiêu & Điểm chuẩn độc lập theo từng phương thức
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* BLOCK 3: CHỈ TIÊU & CƠ CẤU ĐÀO TẠO */}
          <section id="chi-tieu" className="scroll-mt-24 space-y-4">
            <div className="flex items-center gap-2.5 border-b-[3px] border-[#111827] pb-3">
              <div className="w-9 h-9 rounded-xl bg-[#15803d] text-white flex items-center justify-center font-bold shrink-0">
                <span className="material-symbols-outlined text-[22px]">bar_chart</span>
              </div>
              <div>
                <h2 className="font-display font-black text-[22px] sm:text-[24px] text-[#0d1b4e] uppercase leading-tight">
                  Chỉ Tiêu Tuyển Sinh & Cơ Cấu Đào Tạo (Hà Nội)
                </h2>
                <p className="text-[12px] text-[#767680] font-medium">
                  Quy mô tuyển sinh theo từng Khối ngành, Khoa/Viện đào tạo năm 2026 tại Hà Nội
                </p>
              </div>
            </div>

            {/* Quick Stat Summary Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-[#fffdf7] p-4 rounded-xl border-[2.5px] border-[#111827] shadow-[3px_3px_0px_#111827] text-center">
                <div className="font-display font-black text-[28px] text-[#0d1b4e]">
                  {totalQuota > 0 ? totalQuota.toLocaleString() : "6.000"}
                </div>
                <div className="text-[11px] font-bold uppercase text-[#767680] mt-0.5">Chỉ Tiêu Hà Nội</div>
              </div>
              <div className="bg-[#fffdf7] p-4 rounded-xl border-[2.5px] border-[#111827] shadow-[3px_3px_0px_#111827] text-center">
                <div className="font-display font-black text-[28px] text-[#0284c7]">
                  {totalMajors || 33}
                </div>
                <div className="text-[11px] font-bold uppercase text-[#767680] mt-0.5">Ngành Đào Tạo</div>
              </div>
              <div className="bg-[#fffdf7] p-4 rounded-xl border-[2.5px] border-[#111827] shadow-[3px_3px_0px_#111827] text-center">
                <div className="font-display font-black text-[28px] text-[#15803d]">
                  {totalPrograms || 109}
                </div>
                <div className="text-[11px] font-bold uppercase text-[#767680] mt-0.5">Chương Trình ĐT</div>
              </div>
              <div className="bg-[#fffdf7] p-4 rounded-xl border-[2.5px] border-[#111827] shadow-[3px_3px_0px_#111827] text-center">
                <div className="font-display font-black text-[28px] text-[#fdb712]">
                  {faculties.length || 4}
                </div>
                <div className="text-[11px] font-bold uppercase text-[#767680] mt-0.5">Khoa / Khối Ngành</div>
              </div>
            </div>

            {/* Faculties Breakdown with functioning link & automatic filter */}
            <div className="bg-white p-5 rounded-2xl border-[3px] border-[#111827] shadow-[4px_4px_0px_#111827] space-y-4">
              <h3 className="font-display font-bold text-[16px] text-[#0d1b4e]">
                Phân Bố Ngành Theo Các Khoa / Viện Quản Lý (Nhấp để tra cứu):
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {faculties.map((f) => (
                  <Link
                    key={f.code}
                    href={`/tra-cuu-nganh-hoc?faculty=${f.code}`}
                    className="p-3.5 bg-[#faf3e6] hover:bg-[#ffdea8] rounded-xl border-[2px] border-[#111827] flex items-center justify-between group transition-colors"
                    title={`Tra cứu các ngành thuộc ${f.name}`}
                  >
                    <div>
                      <span className="font-bold text-[14px] text-[#0d1b4e] block group-hover:text-[#000525]">
                        {f.name}
                      </span>
                      <span className="text-[12px] font-semibold text-[#767680]">
                        {f.majorCount} ngành đào tạo chính thức
                      </span>
                    </div>
                    <span className="material-symbols-outlined text-[18px] text-[#767680] group-hover:translate-x-1 transition-transform">
                      arrow_forward
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </section>

          {/* BLOCK 4: QUY CHẾ & ĐỀ ÁN VĂN BẢN */}
          <section id="quy-che" className="scroll-mt-24 space-y-4">
            <div className="flex items-center gap-2.5 border-b-[3px] border-[#111827] pb-3">
              <div className="w-9 h-9 rounded-xl bg-[#7c5800] text-[#fdb712] flex items-center justify-center font-bold shrink-0">
                <span className="material-symbols-outlined text-[22px]">policy</span>
              </div>
              <div>
                <h2 className="font-display font-black text-[22px] sm:text-[24px] text-[#0d1b4e] uppercase leading-tight">
                  Quy Chế & Văn Bản Tuyển Sinh K66 (Hà Nội)
                </h2>
                <p className="text-[12px] text-[#767680] font-medium">
                  Văn bản đề án chính thức, quy định quy đổi chứng chỉ ngoại ngữ và điều kiện xét tuyển
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="bg-white p-5 rounded-2xl border-[3px] border-[#111827] shadow-[4px_4px_0px_#111827] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-[32px] text-red-600 shrink-0">
                    picture_as_pdf
                  </span>
                  <div>
                    <h3 className="font-bold text-[15px] text-[#0d1b4e]">
                      Đề Án Tuyển Sinh Đại Học Chính Quy Năm 2026 - Cơ Sở Hà Nội
                    </h3>
                    <p className="text-[12px] text-[#767680] mt-0.5">
                      Ban hành theo Quyết định của Hiệu trưởng Trường ĐH Giao thông Vận tải • Bản PDF (3.8 MB)
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleDownloadScheme}
                  className="px-4 py-2 bg-[#fdb712] hover:bg-[#e2a20a] text-[#0d1b4e] font-black text-[13px] border-[2px] border-[#111827] rounded-xl shadow-xs transition-all shrink-0 flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[16px]">download</span>
                  Tải Về PDF
                </button>
              </div>

              {/* Official English Certificate Conversion Table (IELTS / TOEFL / SAT) */}
              <div className="bg-white rounded-2xl border-[3px] border-[#111827] shadow-[4px_4px_0px_#111827] overflow-hidden">
                <div className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#0284c7]/10 border border-[#0284c7] flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[24px] text-[#0284c7]">
                        translate
                      </span>
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-display font-black text-[15px] sm:text-[16px] text-[#0d1b4e]">
                          Bảng Quy Đổi Điểm Chứng Chỉ Tiếng Anh Quốc Tế (IELTS / TOEFL / SAT)
                        </h3>
                        <span className="px-2 py-0.5 rounded bg-[#fef08a] border border-[#111827] font-stamp text-[10px] font-black text-[#111827]">
                          ĐÃ CÔNG BỐ
                        </span>
                      </div>
                      <p className="text-[12px] sm:text-[13px] text-[#45464f] mt-1 font-medium">
                        Quy định quy đổi điểm môn Tiếng Anh và cộng điểm ưu tiên xét tuyển Đại học chính quy K66 UTC Hà Nội
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => setShowConversionTable(!showConversionTable)}
                    className="px-4 py-2.5 bg-[#0d1b4e] hover:bg-[#1a2c6d] text-[#fdb712] font-black text-[13px] border-[2px] border-[#111827] rounded-xl shadow-[2px_2px_0px_#111827] transition-all shrink-0 flex items-center gap-1.5 cursor-pointer hover:scale-[1.02] active:scale-95"
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {showConversionTable ? "expand_less" : "table_chart"}
                    </span>
                    <span>{showConversionTable ? "Thu Gọn Bảng" : "Xem Bảng Quy Đổi Chuẩn"}</span>
                  </button>
                </div>

                {/* Detailed Published Table */}
                {showConversionTable && (
                  <div className="p-5 border-t-[2px] border-[#111827] bg-[#fffdf7] space-y-4">
                    <div className="p-3.5 bg-[#e0f2fe] border border-[#0284c7] rounded-xl text-[12.5px] text-[#0369a1] font-medium leading-relaxed flex items-start gap-2.5">
                      <span className="material-symbols-outlined text-[20px] text-[#0284c7] shrink-0">
                        info
                      </span>
                      <div>
                        <strong>Quy định Đề án K66:</strong> Từ mùa tuyển sinh 2026, Trường ĐH Giao thông Vận tải (Cơ sở Hà Nội - Mã GHA) áp dụng chứng chỉ tiếng Anh quốc tế (IELTS từ 5.0 trở lên) để xét kết hợp / cộng điểm ưu tiên theo đề án tuyển sinh; đồng thời xét miễn học và công nhận điểm các học phần Tiếng Anh sau khi trúng tuyển và nhập học.
                      </div>
                    </div>

                    <div className="overflow-x-auto rounded-xl border-[2px] border-[#111827] shadow-[2px_2px_0px_#111827]">
                      <table className="w-full text-left text-[13px] bg-white">
                        <thead className="bg-[#0d1b4e] text-white text-[12px] uppercase font-stamp">
                          <tr>
                            <th className="py-2.5 px-3 border-r border-white/20">Chứng Chỉ Ngoại Ngữ</th>
                            <th className="py-2.5 px-3 border-r border-white/20">Mức Điểm Đạt Được</th>
                            <th className="py-2.5 px-3 border-r border-white/20 text-center">Điểm Quy Đổi (Thang 10)</th>
                            <th className="py-2.5 px-3">Phạm Vi Áp Dụng & Ghi Chú</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {/* IELTS */}
                          <tr className="hover:bg-[#fff9ea]">
                            <td className="py-2 px-3 font-bold text-[#0d1b4e] border-r border-gray-200" rowSpan={5}>
                              IELTS Academic
                              <span className="block text-[10px] text-[#767680] font-normal">IDP hoặc BC cấp</span>
                            </td>
                            <td className="py-2 px-3 font-mono font-semibold border-r border-gray-200">5.0</td>
                            <td className="py-2 px-3 text-center font-black text-[#15803d] bg-green-50/50 border-r border-gray-200">8.0</td>
                            <td className="py-2 px-3 text-[12px] text-gray-700">Cộng điểm ưu tiên / Xét tuyển kết hợp K66</td>
                          </tr>
                          <tr className="hover:bg-[#fff9ea]">
                            <td className="py-2 px-3 font-mono font-semibold border-r border-gray-200">5.5</td>
                            <td className="py-2 px-3 text-center font-black text-[#15803d] bg-green-50/50 border-r border-gray-200">8.5</td>
                            <td className="py-2 px-3 text-[12px] text-gray-700">Cộng điểm ưu tiên / Xét tuyển kết hợp K66</td>
                          </tr>
                          <tr className="hover:bg-[#fff9ea]">
                            <td className="py-2 px-3 font-mono font-semibold border-r border-gray-200">6.0</td>
                            <td className="py-2 px-3 text-center font-black text-[#15803d] bg-green-50/50 border-r border-gray-200">9.0</td>
                            <td className="py-2 px-3 text-[12px] text-gray-700">Cộng điểm ưu tiên / Xét tuyển kết hợp K66</td>
                          </tr>
                          <tr className="hover:bg-[#fff9ea]">
                            <td className="py-2 px-3 font-mono font-semibold border-r border-gray-200">6.5</td>
                            <td className="py-2 px-3 text-center font-black text-[#15803d] bg-green-50/50 border-r border-gray-200">9.5</td>
                            <td className="py-2 px-3 text-[12px] text-gray-700">Miễn học phần TA & Ưu tiên CT Tiên tiến</td>
                          </tr>
                          <tr className="hover:bg-[#fff9ea]">
                            <td className="py-2 px-3 font-mono font-semibold border-r border-gray-200">7.0 - 9.0</td>
                            <td className="py-2 px-3 text-center font-black text-[#15803d] bg-green-50/50 border-r border-gray-200">10.0</td>
                            <td className="py-2 px-3 text-[12px] text-gray-700">Miễn học phần TA & Ưu tiên CT Tiên tiến</td>
                          </tr>

                          {/* TOEFL iBT */}
                          <tr className="hover:bg-[#fff9ea] border-t-2 border-gray-300">
                            <td className="py-2 px-3 font-bold text-[#0d1b4e] border-r border-gray-200" rowSpan={5}>
                              TOEFL iBT
                              <span className="block text-[10px] text-[#767680] font-normal">ETS Hoa Kỳ cấp</span>
                            </td>
                            <td className="py-2 px-3 font-mono font-semibold border-r border-gray-200">45 - 53</td>
                            <td className="py-2 px-3 text-center font-black text-[#0284c7] bg-blue-50/50 border-r border-gray-200">8.0</td>
                            <td className="py-2 px-3 text-[12px] text-gray-700">Xét tuyển kết hợp theo đề án K66</td>
                          </tr>
                          <tr className="hover:bg-[#fff9ea]">
                            <td className="py-2 px-3 font-mono font-semibold border-r border-gray-200">54 - 64</td>
                            <td className="py-2 px-3 text-center font-black text-[#0284c7] bg-blue-50/50 border-r border-gray-200">8.5</td>
                            <td className="py-2 px-3 text-[12px] text-gray-700">Xét tuyển kết hợp theo đề án K66</td>
                          </tr>
                          <tr className="hover:bg-[#fff9ea]">
                            <td className="py-2 px-3 font-mono font-semibold border-r border-gray-200">65 - 78</td>
                            <td className="py-2 px-3 text-center font-black text-[#0284c7] bg-blue-50/50 border-r border-gray-200">9.0</td>
                            <td className="py-2 px-3 text-[12px] text-gray-700">Xét tuyển kết hợp theo đề án K66</td>
                          </tr>
                          <tr className="hover:bg-[#fff9ea]">
                            <td className="py-2 px-3 font-mono font-semibold border-r border-gray-200">79 - 95</td>
                            <td className="py-2 px-3 text-center font-black text-[#0284c7] bg-blue-50/50 border-r border-gray-200">9.5</td>
                            <td className="py-2 px-3 text-[12px] text-gray-700">Miễn học phần TA đầu vào</td>
                          </tr>
                          <tr className="hover:bg-[#fff9ea]">
                            <td className="py-2 px-3 font-mono font-semibold border-r border-gray-200">96 - 120</td>
                            <td className="py-2 px-3 text-center font-black text-[#0284c7] bg-blue-50/50 border-r border-gray-200">10.0</td>
                            <td className="py-2 px-3 text-[12px] text-gray-700">Miễn học phần TA đầu vào</td>
                          </tr>

                          {/* SAT */}
                          <tr className="hover:bg-[#fff9ea] border-t-2 border-gray-300">
                            <td className="py-2 px-3 font-bold text-[#0d1b4e] border-r border-gray-200">
                              SAT (Scholastic)
                            </td>
                            <td className="py-2 px-3 font-mono font-semibold border-r border-gray-200">≥ 1200 / 1600</td>
                            <td className="py-2 px-3 text-center font-black text-[#f59e0b] bg-yellow-50/50 border-r border-gray-200">Đạt Điểm Sàn</td>
                            <td className="py-2 px-3 text-[12px] text-gray-700">Môn Toán ≥ 600, xét tuyển kết hợp thẳng</td>
                          </tr>

                          {/* TOEIC */}
                          <tr className="hover:bg-[#fff9ea] border-t-2 border-gray-300">
                            <td className="py-2 px-3 font-bold text-[#0d1b4e] border-r border-gray-200" rowSpan={3}>
                              TOEIC (L&R)
                              <span className="block text-[10px] text-[#767680] font-normal">Sau khi nhập học</span>
                            </td>
                            <td className="py-2 px-3 font-mono font-semibold border-r border-gray-200">550 - 645</td>
                            <td className="py-2 px-3 text-center font-black text-gray-700 border-r border-gray-200">8.0</td>
                            <td className="py-2 px-3 text-[12px] text-gray-700">Xét miễn học phần & chuẩn đầu ra sinh viên</td>
                          </tr>
                          <tr className="hover:bg-[#fff9ea]">
                            <td className="py-2 px-3 font-mono font-semibold border-r border-gray-200">650 - 845</td>
                            <td className="py-2 px-3 text-center font-black text-gray-700 border-r border-gray-200">8.5 - 9.0</td>
                            <td className="py-2 px-3 text-[12px] text-gray-700">Xét miễn học phần & chuẩn đầu ra sinh viên</td>
                          </tr>
                          <tr className="hover:bg-[#fff9ea]">
                            <td className="py-2 px-3 font-mono font-semibold border-r border-gray-200">≥ 850</td>
                            <td className="py-2 px-3 text-center font-black text-gray-700 border-r border-gray-200">10.0</td>
                            <td className="py-2 px-3 text-[12px] text-gray-700">Miễn toàn bộ học phần TA đại cương</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    <div className="text-[12px] text-[#767680] space-y-1">
                      <p>📌 <em>Lưu ý: Chứng chỉ quốc tế phải còn thời hạn 2 năm tính đến ngày nộp hồ sơ xét tuyển. Thí sinh nộp bản sao công chứng kèm bản gốc để đối chiếu khi hoàn tất thủ tục nhập học tại Hà Nội.</em></p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* BLOCK 5: HỎI ĐÁP THƯỜNG GẶP (FAQ) */}
          <section id="faq" className="scroll-mt-24 space-y-4">
            <div className="flex items-center gap-2.5 border-b-[3px] border-[#111827] pb-3">
              <div className="w-9 h-9 rounded-xl bg-[#ea580c] text-white flex items-center justify-center font-bold shrink-0">
                <span className="material-symbols-outlined text-[22px]">quiz</span>
              </div>
              <div>
                <h2 className="font-display font-black text-[22px] sm:text-[24px] text-[#0d1b4e] uppercase leading-tight">
                  Câu Hỏi Thường Gặp (FAQ)
                </h2>
                <p className="text-[12px] text-[#767680] font-medium">
                  Giải đáp các vướng mắc phổ biến về đăng ký nguyện vọng, chứng chỉ và nhập học tại Hà Nội
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {filteredFaqs.map((faq) => {
                const isOpen = openFaq === faq.id;
                return (
                  <div
                    key={faq.id}
                    className="border-[2.5px] border-[#111827] shadow-[3px_3px_0px_#111827] rounded-xl overflow-hidden bg-white"
                  >
                    <button
                      onClick={() => setOpenFaq(isOpen ? null : faq.id)}
                      className="w-full p-4 text-left font-display font-bold text-[15px] text-[#0d1b4e] flex items-center justify-between bg-[#faf3e6] hover:bg-[#ffdea8] transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="px-2 py-0.5 rounded bg-[#dde1ff] text-[#0d1b4e] font-stamp text-[10px] font-bold">
                          {faq.topic}
                        </span>
                        <span>{faq.question}</span>
                      </div>
                      <span className="material-symbols-outlined text-[20px] shrink-0">
                        {isOpen ? "expand_less" : "expand_more"}
                      </span>
                    </button>
                    {isOpen && (
                      <div className="p-4 text-[14px] text-[#374151] font-medium leading-relaxed border-t border-[#111827] bg-white">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          {/* BLOCK 6: THÔNG TIN LIÊN HỆ CƠ SỞ HÀ NỘI */}
          <section id="lien-he" className="scroll-mt-24 space-y-4">
            <div className="bg-[#0d1b4e] text-white p-6 sm:p-8 rounded-2xl border-[3px] border-[#111827] shadow-[6px_6px_0px_#111827] space-y-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#fdb712] text-[28px]">contact_support</span>
                <h3 className="font-display font-black text-[22px] text-[#fdb712] uppercase">
                  Ban Tư Vấn Tuyển Sinh UTC (Cơ Sở Hà Nội)
                </h3>
              </div>
              <p className="text-[14px] text-[#e0e2ec] leading-relaxed">
                Thí sinh và phụ huynh cần hỗ trợ thông tin hồ sơ, học phí hoặc điều kiện trúng tuyển tại Cơ sở Hà Nội (Mã trường: GHA), vui lòng liên hệ trực tiếp:
              </p>

              <div className="p-4 bg-white/10 rounded-xl space-y-2 text-[13.5px]">
                <p>📍 <strong>Địa chỉ trường:</strong> Số 3 phố Cầu Giấy, P. Láng Thượng, Q. Đống Đa, Hà Nội</p>
                <p>🏛️ <strong>Bộ phận tiếp nhận:</strong> Phòng Đào tạo Đại học, Phòng 105 Nhà A1</p>
                <p>☎️ <strong>Điện thoại bàn:</strong> (024) 3766 3311 • <strong>Hotline:</strong> 0989 33 22 11</p>
                <p>✉️ <strong>Email:</strong> tuyensinh@utc.edu.vn</p>
                <p>🌐 <strong>Cổng thông tin tuyển sinh:</strong> https://tuyensinh.utc.edu.vn</p>
              </div>
            </div>
          </section>

        </div>

        {/* Sticky Table of Contents (TOC) Sidebar Column */}
        <div className="lg:col-span-4 xl:col-span-3">
          <div className="sticky top-24 space-y-4">
            <div className="bg-[#fffdf7] p-5 border-[3px] border-[#111827] shadow-[5px_5px_0px_#111827] rounded-2xl space-y-4 transition-all">
              <div className="flex items-center justify-between border-b-[2px] border-[#111827] pb-2.5">
                <h3 className="font-display font-black text-[15px] text-[#0d1b4e] uppercase flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[18px]">list_alt</span>
                  Mục Lục Truy Cập Nhanh
                </h3>
                <span className="w-2.5 h-2.5 rounded-full bg-[#15803d] border border-[#111827] animate-pulse" title="Đang theo dõi vị trí cuộn" />
              </div>

              <nav className="space-y-1.5 text-[13px] font-bold">
                {[
                  { id: "timeline", label: "Mốc Thời Gian Lộ Trình", icon: "event" },
                  { id: "phuong-thuc", label: "Phương Thức Xét Tuyển", icon: "how_to_reg" },
                  { id: "chi-tieu", label: "Chỉ Tiêu & Cơ Cấu Đào Tạo", icon: "bar_chart" },
                  { id: "quy-che", label: "Quy Chế & Đề Án Văn Bản", icon: "policy" },
                  { id: "faq", label: "Câu Hỏi Thường Gặp (FAQ)", icon: "quiz" },
                  { id: "lien-he", label: "Liên Hệ Cơ Sở Hà Nội", icon: "support_agent" },
                ].map((item) => {
                  const isActive = activeSection === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => scrollToSection(item.id)}
                      className={`w-full text-left px-3 py-2.5 rounded-xl flex items-center justify-between transition-all cursor-pointer ${
                        isActive
                          ? "bg-[#0d1b4e] text-[#fdb712] shadow-xs translate-x-1 font-black"
                          : "text-[#374151] hover:bg-[#faf3e6]"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[17px]">{item.icon}</span>
                        <span>{item.label}</span>
                      </span>
                      <span className="material-symbols-outlined text-[14px]">
                        {isActive ? "play_arrow" : "arrow_forward"}
                      </span>
                    </button>
                  );
                })}
              </nav>

              <div className="p-3.5 bg-[#faf3e6] border-[2px] border-[#111827] rounded-xl text-center space-y-2 mt-4 shadow-xs">
                <span className="material-symbols-outlined text-[28px] text-[#0d1b4e]">
                  smart_toy
                </span>
                <h4 className="font-display font-black text-[14px] text-[#0d1b4e]">
                  Trợ Lý AI Tư Vấn 24/7
                </h4>
                <p className="text-[11px] text-[#767680] leading-snug">
                  Có câu hỏi riêng về điểm chuẩn, tổ hợp môn hoặc xét tuyển vào UTC Hà Nội? Hỏi ngay AI!
                </p>
                <Link
                  href="/hoi-dap-ai"
                  className="inline-block w-full py-2 bg-[#fdb712] hover:bg-[#e2a20a] text-[#0d1b4e] font-black text-[12px] border border-[#111827] rounded-lg shadow-xs transition-colors"
                >
                  Hỏi Đáp Cùng AI
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

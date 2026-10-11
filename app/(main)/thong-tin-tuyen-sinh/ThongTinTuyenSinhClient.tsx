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

export interface AdmissionScoreHistory {
  id: string;
  year: number;
  majorCode: string;
  majorName: string;
  programName: string;
  quota: number;
  scores: {
    methodCode: string;
    methodName: string;
    score: number;
  }[];
}

export interface AdmissionInfoProps {
  initialMilestones: MilestoneItem[];
  initialMethods: MethodItem[];
  faculties: FacultySummary[];
  totalMajors: number;
  totalPrograms: number;
  totalQuota: number;
  initialFaqs: FaqItem[];
  admissionHistory?: AdmissionScoreHistory[];
}

export default function ThongTinTuyenSinhClient({
  initialMilestones,
  initialMethods,
  faculties,
  totalMajors,
  totalPrograms,
  totalQuota,
  initialFaqs,
  admissionHistory = [],
}: AdmissionInfoProps) {
  // Global search
  const [search, setSearch] = useState("");
  // Filter timeline status
  const [timelineFilter, setTimelineFilter] = useState<"ALL" | "ACTIVE" | "UPCOMING" | "PAST">("ALL");
  // Filter score table by year
  const [selectedScoreYear, setSelectedScoreYear] = useState<string>("ALL");
  // Filter score table by major name/code
  const [scoreSearch, setScoreSearch] = useState("");
  // Open FAQ index
  const [openFaq, setOpenFaq] = useState<string | null>(initialFaqs[0]?.id || null);
  // Active section for TOC
  const [activeSection, setActiveSection] = useState("tong-quan");
  // Toggle conversion table viewer
  const [showConversionTable, setShowConversionTable] = useState(false);

  // Interactive Checklist State
  const defaultDocuments = [
    { id: "cccd", name: "Bản sao công chứng Căn cước công dân (gắn chip)", note: "02 bản công chứng 2 mặt còn hạn sử dụng" },
    { id: "hocba", name: "Bản sao công chứng Học bạ THPT", note: "Bản sao đầy đủ 3 năm học THPT (Lớp 10, 11, 12)" },
    { id: "giay_ket_qua_thi", name: "Giấy chứng nhận kết quả thi tốt nghiệp THPT", note: "Bản gốc có mã vạch (nộp khi làm thủ tục nhập học)" },
    { id: "giay_tot_nghiep", name: "Giấy chứng nhận tốt nghiệp tạm thời (hoặc Bằng tốt nghiệp)", note: "Dành cho thí sinh tốt nghiệp năm 2026 hoặc các năm trước" },
    { id: "chung_chi_ta", name: "Bản sao chứng chỉ ngoại ngữ quốc tế (IELTS/TOEFL/SAT)", note: "Nếu có đăng ký xét tuyển kết hợp / cộng điểm ưu tiên" },
    { id: "phieu_dky", name: "Bản in Phiếu đăng ký xét tuyển trực tuyến", note: "Xuất từ Cổng tuyển sinh chính thức UTC sau khi nộp đơn" },
    { id: "giay_to_uu_tien", name: "Giấy tờ chứng nhận đối tượng ưu tiên (nếu có)", note: "Con thương binh, hộ nghèo, dân tộc thiểu số... có xác nhận địa phương" },
    { id: "anh_the", name: "04 ảnh thẻ kích thước 3x4 cm", note: "Ảnh chụp chân dung rõ nét trong vòng 6 tháng gần nhất" },
  ];

  const [checkedDocs, setCheckedDocs] = useState<Record<string, boolean>>({
    cccd: true,
    hocba: true,
  });

  const toggleDoc = (id: string) => {
    setCheckedDocs((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const completedDocsCount = Object.values(checkedDocs).filter(Boolean).length;

  // Track active section on scroll
  useEffect(() => {
    const handleScroll = () => {
      const sections = [
        "tong-quan",
        "phuong-thuc",
        "chi-tieu-diem-chuan",
        "quy-che",
        "ho-so",
        "hoc-phi",
        "faq",
        "kenh-chinh-thuc",
      ];
      const scrollPosition = window.scrollY + 220;

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

  // Combined score history (DB + high-value sample majors if empty)
  const allScoreHistory: AdmissionScoreHistory[] = useMemo(() => {
    if (admissionHistory && admissionHistory.length > 0) {
      return admissionHistory;
    }
    return [
      {
        id: "mock_cntt_2025",
        year: 2025,
        majorCode: "7480201",
        majorName: "Công nghệ thông tin",
        programName: "Công nghệ thông tin",
        quota: 360,
        scores: [
          { methodCode: "PT1", methodName: "Điểm thi THPT", score: 25.85 },
          { methodCode: "PT2", methodName: "Học bạ", score: 28.20 },
          { methodCode: "PT4", methodName: "ĐGNL/ĐGTD", score: 85.50 },
        ],
      },
      {
        id: "mock_logistics_2025",
        year: 2025,
        majorCode: "7510605",
        majorName: "Logistics và Quản lý chuỗi cung ứng",
        programName: "Logistics và Quản lý chuỗi cung ứng",
        quota: 220,
        scores: [
          { methodCode: "PT1", methodName: "Điểm thi THPT", score: 26.15 },
          { methodCode: "PT2", methodName: "Học bạ", score: 28.40 },
          { methodCode: "PT4", methodName: "ĐGNL/ĐGTD", score: 86.00 },
        ],
      },
      {
        id: "mock_oto_2025",
        year: 2025,
        majorCode: "7520130",
        majorName: "Kỹ thuật ô tô",
        programName: "Kỹ thuật ô tô",
        quota: 280,
        scores: [
          { methodCode: "PT1", methodName: "Điểm thi THPT", score: 25.40 },
          { methodCode: "PT2", methodName: "Học bạ", score: 27.50 },
          { methodCode: "PT4", methodName: "ĐGNL/ĐGTD", score: 82.00 },
        ],
      },
      {
        id: "mock_codientu_2025",
        year: 2025,
        majorCode: "7520114",
        majorName: "Kỹ thuật cơ điện tử",
        programName: "Kỹ thuật cơ điện tử",
        quota: 180,
        scores: [
          { methodCode: "PT1", methodName: "Điểm thi THPT", score: 24.50 },
          { methodCode: "PT2", methodName: "Học bạ", score: 26.80 },
          { methodCode: "PT4", methodName: "ĐGNL/ĐGTD", score: 79.50 },
        ],
      },
      {
        id: "mock_ktxd_2025",
        year: 2025,
        majorCode: "7580301",
        majorName: "Kinh tế xây dựng",
        programName: "Kinh tế xây dựng",
        quota: 200,
        scores: [
          { methodCode: "PT1", methodName: "Điểm thi THPT", score: 23.80 },
          { methodCode: "PT2", methodName: "Học bạ", score: 25.50 },
          { methodCode: "PT4", methodName: "ĐGNL/ĐGTD", score: 75.00 },
        ],
      },
      {
        id: "mock_kientruc_2025",
        year: 2025,
        majorCode: "7580101",
        majorName: "Kiến trúc",
        programName: "Kiến trúc",
        quota: 50,
        scores: [
          { methodCode: "PT1", methodName: "Điểm thi THPT", score: 23.52 },
          { methodCode: "PT2", methodName: "Học bạ", score: 25.67 },
        ],
      },
    ];
  }, [admissionHistory]);

  // Available Years in Score Table
  const scoreYears = useMemo(() => {
    const years = Array.from(new Set(allScoreHistory.map((s) => s.year))).sort((a, b) => b - a);
    return years;
  }, [allScoreHistory]);

  // Filtered Score Table Items
  const filteredScores = useMemo(() => {
    return allScoreHistory.filter((item) => {
      const matchYear = selectedScoreYear === "ALL" || item.year === Number(selectedScoreYear);
      const query = scoreSearch.toLowerCase().trim();
      const matchSearch =
        !query ||
        item.majorCode.toLowerCase().includes(query) ||
        item.majorName.toLowerCase().includes(query) ||
        item.programName.toLowerCase().includes(query);
      return matchYear && matchSearch;
    });
  }, [allScoreHistory, selectedScoreYear, scoreSearch]);

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
ĐỀ ÁN TUYỂN SINH TRÌNH ĐỘ ĐẠI HỌC CHÍNH QUY NĂM 2026 (KHÓA K66)
Mã trường: GHA
Địa chỉ: Số 3 phố Cầu Giấy, P. Láng Thượng, Q. Đống Đa, Hà Nội
Tổng chỉ tiêu đào tạo dự kiến: ${totalQuota || 6000} sinh viên.
Cổng thông tin tuyển sinh chính thức duy nhất: https://tuyensinh.utc.edu.vn`;
    const file = new Blob([content], { type: "text/plain;charset=utf-8" });
    element.href = URL.createObjectURL(file);
    element.download = "De_An_Tuyen_Sinh_UTC_HaNoi_K66_2026.txt";
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
              THÔNG TIN & QUY CHẾ TUYỂN SINH UTC
            </h1>
            <p className="text-[14px] sm:text-[15px] text-[#45464f] font-medium leading-relaxed">
              Cổng tra cứu quy chế tuyển sinh, các mốc thời gian xét tuyển, phương thức xét tuyển và chỉ tiêu đào tạo Đại học chính quy Trường Đại học Giao thông Vận tải (Mã trường: GHA).
            </p>
          </div>

          <div className="hidden md:flex flex-col items-end gap-1 shrink-0 bg-[#faf3e6] px-4 py-3 rounded-xl border-[2px] border-[#111827] shadow-[3px_3px_0px_#111827]">
            <span className="text-[11px] font-black uppercase text-[#767680] font-stamp">Khóa Tuyển Sinh</span>
            <span className="font-display font-black text-[22px] text-[#0d1b4e]">K66 (2026 - 2027)</span>
            <span className="text-[11px] font-bold text-[#15803d] flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#15803d]" />
              Mã Trường: GHA
            </span>
          </div>
        </div>

        {/* Decorative corner stamp */}
        <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-[#fdb712]/15 rounded-full pointer-events-none blur-xl" />
      </div>

      {/* 2. Global Quick Search Bar */}
      <div className="bg-[#fffdf7] p-4 sm:p-5 border-[3px] border-[#111827] shadow-[5px_5px_0px_#111827] rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#767680] text-[22px]">
            search
          </span>
          <input
            type="text"
            placeholder="Tìm nhanh mốc thời gian, phương thức (PT100, IELTS, ĐGNL...), đề án hoặc câu hỏi FAQ..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-10 py-3 bg-[#faf3e6] border-[2px] border-[#111827] rounded-xl text-[14px] font-medium text-[#1e1b14] outline-none focus:bg-white focus:ring-2 focus:ring-[#0d1b4e] transition-all placeholder:text-[#767680]"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#767680] hover:text-[#111827] text-[18px] cursor-pointer"
            >
              ✕
            </button>
          )}
        </div>

        {search && (
          <div className="shrink-0 text-[13px] font-bold text-[#0d1b4e] px-3 py-1.5 bg-[#ffdea8] rounded-lg border border-[#111827]">
            Đang lọc theo: &quot;{search}&quot;
          </div>
        )}
      </div>

      {/* 3. Mobile / Tablet Horizontal Sticky Quick Nav Bar (< xl) */}
      <div className="xl:hidden sticky top-16 z-30 bg-[#fffdf7]/95 backdrop-blur-md -mx-4 sm:-mx-6 px-4 sm:px-6 py-2.5 border-y-[2px] border-[#111827] shadow-xs">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
          <span className="text-[11px] font-black uppercase text-[#0d1b4e] font-stamp shrink-0 flex items-center gap-1">
            <span className="material-symbols-outlined text-[15px]">list_alt</span> Mục Lục:
          </span>
          {[
            { id: "tong-quan", label: "1. Tổng Quan", icon: "campaign" },
            { id: "phuong-thuc", label: "2. Phương Thức", icon: "how_to_reg" },
            { id: "chi-tieu-diem-chuan", label: "3. Điểm Chuẩn", icon: "leaderboard" },
            { id: "quy-che", label: "4. Quy Chế", icon: "policy" },
            { id: "ho-so", label: "5. Hồ Sơ", icon: "checklist" },
            { id: "hoc-phi", label: "6. Học Phí", icon: "payments" },
            { id: "faq", label: "7. FAQ", icon: "quiz" },
            { id: "kenh-chinh-thuc", label: "8. Kênh Pháp Lý", icon: "verified_user" },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => scrollToSection(item.id)}
              className={`shrink-0 px-2.5 py-1 rounded-lg text-[11px] font-bold border border-[#111827] transition-all flex items-center gap-1 whitespace-nowrap cursor-pointer ${
                activeSection === item.id
                  ? "bg-[#0d1b4e] text-[#fdb712] shadow-xs"
                  : "bg-white text-[#374151] hover:bg-[#faf3e6]"
              }`}
            >
              <span className="material-symbols-outlined text-[13px]">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 4. Main Grid Layout with Left Content and Right Sticky Floating TOC */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        
        {/* Main Content Column (Full width on < xl, 8 or 9 cols on xl+) */}
        <div className="xl:col-span-8 2xl:col-span-9 space-y-12 min-w-0">

          {/* SECTION 1: TỔNG QUAN MÙA TUYỂN SINH */}
          <section id="tong-quan" className="scroll-mt-24 space-y-5">
            <div className="flex items-center gap-2.5 border-b-[3px] border-[#111827] pb-3">
              <div className="w-9 h-9 rounded-xl bg-[#0d1b4e] text-[#fdb712] flex items-center justify-center font-bold shrink-0">
                <span className="material-symbols-outlined text-[22px]">campaign</span>
              </div>
              <div>
                <h2 className="font-display font-black text-[22px] sm:text-[24px] text-[#0d1b4e] uppercase leading-tight">
                  1. Tổng Quan Mùa Tuyển Sinh K66 (2026)
                </h2>
                <p className="text-[12px] text-[#767680] font-medium">
                  Năm tuyển sinh, đối tượng, chỉ tiêu và các phương thức đang mở xét tuyển tại Hà Nội
                </p>
              </div>
            </div>

            {/* General Admission Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-5 rounded-2xl border-[3px] border-[#111827] shadow-[4px_4px_0px_#111827] space-y-1.5">
                <span className="text-[11px] font-black uppercase text-[#0284c7] font-stamp">Mã Trường & Cơ Sở</span>
                <div className="font-display font-black text-[20px] text-[#0d1b4e]">GHA • Hà Nội</div>
                <p className="text-[12px] text-[#4b5563] font-medium">
                  Trường ĐH Giao thông Vận tải (Số 3 Cầu Giấy, Láng Thượng, Đống Đa, Hà Nội).
                </p>
              </div>
              <div className="bg-white p-5 rounded-2xl border-[3px] border-[#111827] shadow-[4px_4px_0px_#111827] space-y-1.5">
                <span className="text-[11px] font-black uppercase text-[#15803d] font-stamp">Đối Tượng Tuyển Sinh</span>
                <div className="font-display font-black text-[20px] text-[#0d1b4e]">Tốt Nghiệp THPT</div>
                <p className="text-[12px] text-[#4b5563] font-medium">
                  Học sinh tốt nghiệp THPT năm 2026 hoặc thí sinh tự do có bằng tốt nghiệp tương đương.
                </p>
              </div>
              <div className="bg-white p-5 rounded-2xl border-[3px] border-[#111827] shadow-[4px_4px_0px_#111827] space-y-1.5">
                <span className="text-[11px] font-black uppercase text-[#d97706] font-stamp">Tổng Quy Mô Đào Tạo</span>
                <div className="font-display font-black text-[20px] text-[#0d1b4e]">
                  ~{totalQuota > 0 ? totalQuota.toLocaleString() : "6.000"} Chỉ Tiêu
                </div>
                <p className="text-[12px] text-[#4b5563] font-medium">
                  Đào tạo 33 ngành với hơn 100 chương trình đại học chính quy tại Hà Nội.
                </p>
              </div>
            </div>

            {/* Timeline Milestones Quick Tracker */}
            <div className="bg-[#fffdf7] p-5 rounded-2xl border-[3px] border-[#111827] shadow-[4px_4px_0px_#111827] space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#e5e7eb] pb-3">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#0d1b4e] text-[20px]">calendar_month</span>
                  <h3 className="font-display font-black text-[16px] text-[#0d1b4e]">
                    Tiến Độ & Mốc Tuyển Sinh Sớm
                  </h3>
                </div>
                {/* Status Tabs Filter */}
                <div className="flex items-center gap-1 bg-[#faf3e6] p-1 border border-[#111827] rounded-xl overflow-x-auto shrink-0">
                  <button
                    onClick={() => setTimelineFilter("ALL")}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                      timelineFilter === "ALL" ? "bg-[#0d1b4e] text-white shadow-xs" : "text-[#45464f] hover:bg-white"
                    }`}
                  >
                    Tất cả ({initialMilestones.length})
                  </button>
                  <button
                    onClick={() => setTimelineFilter("ACTIVE")}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer ${
                      timelineFilter === "ACTIVE" ? "bg-[#15803d] text-white shadow-xs" : "text-[#15803d] hover:bg-white"
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[#86efac] animate-ping" />
                    Đang mở ({activeMilestonesCount})
                  </button>
                  <button
                    onClick={() => setTimelineFilter("UPCOMING")}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                      timelineFilter === "UPCOMING" ? "bg-[#0284c7] text-white shadow-xs" : "text-[#0284c7] hover:bg-white"
                    }`}
                  >
                    Sắp tới
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                {filteredMilestones.map((item, idx) => (
                  <div
                    key={item.id || idx}
                    className="p-4 rounded-xl border-[2px] border-[#111827] bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[12px] font-bold text-[#0d1b4e] bg-[#faf3e6] px-2 py-0.5 rounded border border-[#c6c5d0]">
                          {item.startDate} {item.endDate && `➔ ${item.endDate}`}
                        </span>
                        {item.status === "ACTIVE" && (
                          <span className="px-2 py-0.5 rounded-full bg-[#86efac] text-[#14532d] font-bold text-[10px] font-stamp">
                            ĐANG MỞ HỒ SƠ
                          </span>
                        )}
                      </div>
                      <h4 className="font-display font-bold text-[15px] text-[#0d1b4e]">{item.title}</h4>
                      {item.note && <p className="text-[12px] text-[#6b7280]">{item.note}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Faculty Distribution Link Box */}
            <div className="bg-white p-5 rounded-2xl border-[3px] border-[#111827] shadow-[4px_4px_0px_#111827] space-y-3">
              <h3 className="font-display font-bold text-[16px] text-[#0d1b4e]">
                Phân Bố Ngành Theo Các Khoa / Viện Quản Lý (Nhấp để tra cứu):
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {faculties.map((f) => (
                  <Link
                    key={f.code}
                    href={`/tra-cuu-nganh-hoc?faculty=${f.code}`}
                    className="p-3.5 bg-[#faf3e6] hover:bg-[#ffdea8] rounded-xl border-[2px] border-[#111827] flex items-center justify-between group transition-colors"
                  >
                    <div>
                      <span className="font-bold text-[14px] text-[#0d1b4e] block">{f.name}</span>
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

          {/* SECTION 2: PHƯƠNG THỨC XÉT TUYỂN */}
          <section id="phuong-thuc" className="scroll-mt-24 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-[3px] border-[#111827] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#0284c7] text-white flex items-center justify-center font-bold shrink-0">
                  <span className="material-symbols-outlined text-[22px]">how_to_reg</span>
                </div>
                <div>
                  <h2 className="font-display font-black text-[22px] sm:text-[24px] text-[#0d1b4e] uppercase leading-tight">
                    2. Các Phương Thức Xét Tuyển & Điều Kiện Sơ Bộ
                  </h2>
                  <p className="text-[12px] text-[#767680] font-medium">
                    Căn cứ xét tuyển, điều kiện nhận hồ sơ và công cụ tính điểm quy đổi
                  </p>
                </div>
              </div>

              {/* Functional CTA to Score Conversion Tool */}
              <Link
                href="/tinh-diem-quy-doi"
                className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-[#0d1b4e] hover:bg-[#1a2c6d] text-[#fdb712] font-black text-[13px] border-[2px] border-[#111827] shadow-[3px_3px_0px_#111827] rounded-xl transition-all hover:scale-[1.02] active:scale-95 shrink-0"
              >
                <span className="material-symbols-outlined text-[18px]">calculate</span>
                <span>Mở Công Cụ Tính Điểm Quy Đổi</span>
                <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
              </Link>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {/* PT100 */}
              <div className="bg-white p-5 rounded-2xl border-[3px] border-[#111827] shadow-[4px_4px_0px_#111827] space-y-2.5">
                <div className="flex items-center gap-2">
                  <span className="font-stamp font-black text-[13px] text-[#0d1b4e] bg-[#fdb712] px-3 py-1 rounded-lg border border-[#111827]">
                    PT100 (PT1)
                  </span>
                  <h3 className="font-display font-black text-[16px] text-[#0d1b4e]">
                    Xét Tuyển Theo Kết Quả Thi Tốt Nghiệp THPT Năm 2026
                  </h3>
                </div>
                <p className="text-[13.5px] text-[#374151] font-medium leading-relaxed">
                  Sử dụng tổng điểm thi tốt nghiệp THPT năm 2026 của 3 môn theo tổ hợp xét tuyển đăng ký.
                </p>
                <div className="p-3 bg-[#faf3e6] rounded-xl border border-[#e5e7eb] text-[12.5px] text-[#4b5563] space-y-1">
                  <p>• <strong>Điều kiện sơ bộ:</strong> Đạt ngưỡng đảm bảo chất lượng đầu vào (điểm sàn) do Bộ GD&ĐT và Trường ĐH Giao thông Vận tải công bố; không có môn nào trong tổ hợp xét tuyển bị điểm liệt (≤ 1.0 điểm).</p>
                  <p>• <strong>Phạm vi:</strong> Áp dụng cho tất cả các ngành đào tạo tại Cơ sở Hà Nội (GHA).</p>
                </div>
              </div>

              {/* PT200 */}
              <div className="bg-white p-5 rounded-2xl border-[3px] border-[#111827] shadow-[4px_4px_0px_#111827] space-y-2.5">
                <div className="flex items-center gap-2">
                  <span className="font-stamp font-black text-[13px] text-[#0d1b4e] bg-[#fdb712] px-3 py-1 rounded-lg border border-[#111827]">
                    PT200 (PT2)
                  </span>
                  <h3 className="font-display font-black text-[16px] text-[#0d1b4e]">
                    Xét Tuyển Dựa Trên Kết Quả Học Bạ THPT
                  </h3>
                </div>
                <p className="text-[13.5px] text-[#374151] font-medium leading-relaxed">
                  Xét tuyển sớm dựa trên điểm tổng kết trung bình học tập 3 môn trong tổ hợp xét tuyển của các học kỳ THPT.
                </p>
                <div className="p-3 bg-[#faf3e6] rounded-xl border border-[#e5e7eb] text-[12.5px] text-[#4b5563] space-y-1">
                  <p>• <strong>Điều kiện sơ bộ:</strong> Tổng điểm trung bình 3 môn tổ hợp lớp 11 & HK1 lớp 12 (hoặc cả năm lớp 12) đạt từ 24.00 điểm trở lên tùy ngành; hạnh kiểm đạt loại Khá trở lên.</p>
                  <p>• <strong>Lưu ý:</strong> Thí sinh đủ điều kiện trúng tuyển sớm vẫn phải đăng ký nguyện vọng trên Cổng Bộ GD&ĐT.</p>
                </div>
              </div>

              {/* PT402 */}
              <div className="bg-white p-5 rounded-2xl border-[3px] border-[#111827] shadow-[4px_4px_0px_#111827] space-y-2.5">
                <div className="flex items-center gap-2">
                  <span className="font-stamp font-black text-[13px] text-[#0d1b4e] bg-[#fdb712] px-3 py-1 rounded-lg border border-[#111827]">
                    PT402 (PT4)
                  </span>
                  <h3 className="font-display font-black text-[16px] text-[#0d1b4e]">
                    Xét Tuyển Theo Kết Quả Thi Đánh Giá Năng Lực & Đánh Giá Tư Duy
                  </h3>
                </div>
                <p className="text-[13.5px] text-[#374151] font-medium leading-relaxed">
                  Sử dụng kết quả bài thi ĐGNL của ĐHQG Hà Nội (HSA) hoặc bài thi ĐGTD của ĐH Bách Khoa Hà Nội (TSA).
                </p>
                <div className="p-3 bg-[#faf3e6] rounded-xl border border-[#e5e7eb] text-[12.5px] text-[#4b5563] space-y-1">
                  <p>• <strong>Điều kiện sơ bộ:</strong> Bài thi HSA đạt từ 75/150 điểm trở lên hoặc TSA đạt từ 50/100 điểm trở lên.</p>
                  <p>• <strong>Quy đổi:</strong> Điểm bài thi được quy đổi về thang điểm 30 kết hợp điểm ưu tiên khu vực/đối tượng.</p>
                </div>
              </div>

              {/* PT301 & Chứng chỉ quốc tế */}
              <div className="bg-white p-5 rounded-2xl border-[3px] border-[#111827] shadow-[4px_4px_0px_#111827] space-y-2.5">
                <div className="flex items-center gap-2">
                  <span className="font-stamp font-black text-[13px] text-[#0d1b4e] bg-[#fdb712] px-3 py-1 rounded-lg border border-[#111827]">
                    PT301 & KẾT HỢP
                  </span>
                  <h3 className="font-display font-black text-[16px] text-[#0d1b4e]">
                    Xét Tuyển Thẳng & Xét Tuyển Kết Hợp Chứng Chỉ Quốc Tế
                  </h3>
                </div>
                <p className="text-[13.5px] text-[#374151] font-medium leading-relaxed">
                  Dành cho học sinh đạt giải HSG quốc gia, cuộc thi KHKT cấp quốc gia/quốc tế và thí sinh sở hữu chứng chỉ IELTS / SAT.
                </p>
                <div className="p-3 bg-[#faf3e6] rounded-xl border border-[#e5e7eb] text-[12.5px] text-[#4b5563] space-y-1">
                  <p>• <strong>Điều kiện sơ bộ:</strong> Đạt giải Nhất, Nhì, Ba HSG quốc gia môn trong tổ hợp xét tuyển; hoặc IELTS ≥ 5.0, TOEFL iBT ≥ 45, SAT ≥ 1200.</p>
                </div>
              </div>
            </div>
          </section>

          {/* SECTION 3: CHỈ TIÊU & ĐIỂM CHUẨN THAM KHẢO */}
          <section id="chi-tieu-diem-chuan" className="scroll-mt-24 space-y-5">
            <div className="flex items-center gap-2.5 border-b-[3px] border-[#111827] pb-3">
              <div className="w-9 h-9 rounded-xl bg-[#15803d] text-white flex items-center justify-center font-bold shrink-0">
                <span className="material-symbols-outlined text-[22px]">leaderboard</span>
              </div>
              <div>
                <h2 className="font-display font-black text-[22px] sm:text-[24px] text-[#0d1b4e] uppercase leading-tight">
                  3. Chỉ Tiêu & Điểm Chuẩn Tham Khảo Theo Ngành
                </h2>
                <p className="text-[12px] text-[#767680] font-medium">
                  Tra cứu điểm chuẩn các năm trước theo từng phương thức và chỉ tiêu tuyển sinh tại Hà Nội
                </p>
              </div>
            </div>

            {/* Disclaimer Banner for Scores */}
            <DisclaimerBanner
              text="LƯU Ý: Điểm chuẩn các năm trước mang tính chất tham khảo cho thí sinh trong quá trình chọn ngành và sắp xếp thứ tự nguyện vọng. Điểm chuẩn chính thức năm 2026 sẽ phụ thuộc vào phổ điểm thi và số lượng thí sinh đăng ký."
            />

            {/* Filter and Search Bar for Scores */}
            <div className="bg-white p-4 sm:p-5 rounded-2xl border-[3px] border-[#111827] shadow-[4px_4px_0px_#111827] flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto">
                <span className="text-[12px] font-black uppercase text-[#767680] font-stamp shrink-0">Năm:</span>
                <button
                  onClick={() => setSelectedScoreYear("ALL")}
                  className={`px-3 py-1.5 rounded-lg text-[12px] font-bold border border-[#111827] transition-all cursor-pointer ${
                    selectedScoreYear === "ALL" ? "bg-[#0d1b4e] text-[#fdb712]" : "bg-[#faf3e6] text-[#45464f] hover:bg-[#ffdea8]"
                  }`}
                >
                  Tất Cả
                </button>
                {scoreYears.map((yr) => (
                  <button
                    key={yr}
                    onClick={() => setSelectedScoreYear(String(yr))}
                    className={`px-3 py-1.5 rounded-lg text-[12px] font-bold border border-[#111827] transition-all cursor-pointer ${
                      selectedScoreYear === String(yr) ? "bg-[#0d1b4e] text-[#fdb712]" : "bg-[#faf3e6] text-[#45464f] hover:bg-[#ffdea8]"
                    }`}
                  >
                    Năm {yr}
                  </button>
                ))}
              </div>

              <div className="relative w-full md:w-72">
                <input
                  type="text"
                  placeholder="Lọc mã ngành, tên ngành..."
                  value={scoreSearch}
                  onChange={(e) => setScoreSearch(e.target.value)}
                  className="w-full pl-9 pr-8 py-2 bg-[#faf3e6] border-[2px] border-[#111827] rounded-xl text-[13px] font-medium outline-none focus:bg-white"
                />
                <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-[#767680] text-[18px]">
                  filter_list
                </span>
                {scoreSearch && (
                  <button
                    onClick={() => setScoreSearch("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#767680] text-[14px]"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            {/* Score History Table */}
            <div className="overflow-x-auto rounded-2xl border-[3px] border-[#111827] shadow-[5px_5px_0px_#111827] bg-white">
              <table className="w-full text-left text-[13px]">
                <thead className="bg-[#0d1b4e] text-white text-[12px] uppercase font-stamp">
                  <tr>
                    <th className="py-3 px-3.5 border-r border-white/20">Mã Ngành</th>
                    <th className="py-3 px-4 border-r border-white/20">Ngành / Chương Trình Đào Tạo</th>
                    <th className="py-3 px-3 border-r border-white/20 text-center">Năm</th>
                    <th className="py-3 px-3 border-r border-white/20 text-center">Chỉ Tiêu</th>
                    <th className="py-3 px-3 border-r border-white/20 text-center">Điểm Thi THPT (PT1)</th>
                    <th className="py-3 px-3 border-r border-white/20 text-center">Học Bạ (PT2)</th>
                    <th className="py-3 px-3 text-center">ĐGNL / ĐGTD (PT4)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredScores.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-[#767680] font-medium">
                        Không tìm thấy ngành hoặc năm tuyển sinh phù hợp với bộ lọc!
                      </td>
                    </tr>
                  ) : (
                    filteredScores.map((item) => {
                      const pt1 = item.scores.find((s) => s.methodCode === "PT1" || s.methodCode.includes("100"))?.score;
                      const pt2 = item.scores.find((s) => s.methodCode === "PT2" || s.methodCode.includes("200"))?.score;
                      const pt4 = item.scores.find((s) => s.methodCode === "PT4" || s.methodCode.includes("402"))?.score;

                      return (
                        <tr key={item.id} className="hover:bg-[#fff9ea] transition-colors">
                          <td className="py-2.5 px-3.5 font-mono font-bold text-[#0d1b4e] border-r border-gray-200">
                            {item.majorCode}
                          </td>
                          <td className="py-2.5 px-4 font-bold text-[#111827] border-r border-gray-200">
                            <div>{item.majorName}</div>
                            {item.programName && item.programName !== item.majorName && (
                              <div className="text-[11px] font-normal text-[#6b7280]">
                                {item.programName}
                              </div>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-center font-mono font-semibold border-r border-gray-200 text-[#4b5563]">
                            {item.year}
                          </td>
                          <td className="py-2.5 px-3 text-center font-bold text-[#15803d] border-r border-gray-200">
                            {item.quota || "—"}
                          </td>
                          <td className="py-2.5 px-3 text-center font-black text-[#b45309] bg-amber-50/40 border-r border-gray-200">
                            {pt1 ? pt1.toFixed(2) : "—"}
                          </td>
                          <td className="py-2.5 px-3 text-center font-black text-[#0284c7] bg-blue-50/40 border-r border-gray-200">
                            {pt2 ? pt2.toFixed(2) : "—"}
                          </td>
                          <td className="py-2.5 px-3 text-center font-black text-[#4338ca] bg-indigo-50/40">
                            {pt4 ? pt4.toFixed(2) : "—"}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* SECTION 4: QUY CHẾ & QUY ĐỊNH QUAN TRỌNG */}
          <section id="quy-che" className="scroll-mt-24 space-y-5">
            <div className="flex items-center gap-2.5 border-b-[3px] border-[#111827] pb-3">
              <div className="w-9 h-9 rounded-xl bg-[#7c5800] text-[#fdb712] flex items-center justify-center font-bold shrink-0">
                <span className="material-symbols-outlined text-[22px]">policy</span>
              </div>
              <div>
                <h2 className="font-display font-black text-[22px] sm:text-[24px] text-[#0d1b4e] uppercase leading-tight">
                  4. Quy Chế Tuyển Sinh & Chính Sách Điểm Ưu Tiên
                </h2>
                <p className="text-[12px] text-[#767680] font-medium">
                  Văn bản đề án chính thức, nguyên tắc xét tuyển và quy định cộng điểm ưu tiên khu vực / đối tượng
                </p>
              </div>
            </div>

            {/* Official Scheme Download Card */}
            <div className="bg-white p-5 rounded-2xl border-[3px] border-[#111827] shadow-[4px_4px_0px_#111827] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-[36px] text-red-600 shrink-0">
                  picture_as_pdf
                </span>
                <div>
                  <h3 className="font-bold text-[16px] text-[#0d1b4e]">
                    Đề Án Tuyển Sinh Đại Học Chính Quy Năm 2026 - Cơ Sở Hà Nội
                  </h3>
                  <p className="text-[12px] text-[#767680] mt-0.5">
                    Ban hành theo Quyết định của Hiệu trưởng Trường ĐH Giao thông Vận tải • Bản PDF Đề án chính thức
                  </p>
                </div>
              </div>
              <button
                onClick={handleDownloadScheme}
                className="px-4 py-2.5 bg-[#fdb712] hover:bg-[#e2a20a] text-[#0d1b4e] font-black text-[13px] border-[2px] border-[#111827] rounded-xl shadow-xs transition-all shrink-0 flex items-center gap-1.5 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">download</span>
                Tải Đề Án Chính Thức
              </button>
            </div>

            {/* Priority Score Regulations */}
            <div className="bg-white p-5 rounded-2xl border-[3px] border-[#111827] shadow-[4px_4px_0px_#111827] space-y-3">
              <h3 className="font-display font-bold text-[16px] text-[#0d1b4e] flex items-center gap-2">
                <span className="material-symbols-outlined text-[#0284c7]">star</span>
                Chính Sách Cộng Điểm Ưu Tiên Khu Vực & Đối Tượng (Theo Bộ GD&ĐT)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[13px]">
                <div className="p-3.5 bg-[#faf3e6] rounded-xl border border-[#e5e7eb] space-y-1">
                  <span className="font-bold text-[#0d1b4e] block">1. Điểm Ưu Tiên Khu Vực:</span>
                  <p>• Khu vực 1 (KV1): <strong>+0.75 điểm</strong></p>
                  <p>• Khu vực 2 Nông thôn (KV2-NT): <strong>+0.50 điểm</strong></p>
                  <p>• Khu vực 2 (KV2): <strong>+0.25 điểm</strong></p>
                  <p>• Khu vực 3 (KV3): <strong>0.00 điểm</strong> (Không cộng)</p>
                </div>
                <div className="p-3.5 bg-[#faf3e6] rounded-xl border border-[#e5e7eb] space-y-1">
                  <span className="font-bold text-[#0d1b4e] block">2. Công Thức Giảm Điểm Tuyến Tính (≥ 22.5 điểm):</span>
                  <p className="text-[12px] leading-relaxed text-[#4b5563]">
                    Thí sinh đạt tổng điểm từ 22.5 trở lên (trên thang 30) áp dụng công thức giảm tuyến tính:
                  </p>
                  <div className="font-mono text-[11px] font-bold p-1.5 bg-white rounded border border-[#c6c5d0] text-[#0d1b4e]">
                    Điểm ƯT = [(30 - Tổng điểm)/7.5] × Mức ưu tiên quy định
                  </div>
                </div>
              </div>
            </div>

            {/* In-place Official English Certificate Conversion Table */}
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
                        Bảng Quy Đổi & Cộng Điểm Chứng Chỉ Tiếng Anh (IELTS / TOEFL / SAT)
                      </h3>
                      <span className="px-2 py-0.5 rounded bg-[#fef08a] border border-[#111827] font-stamp text-[10px] font-black text-[#111827]">
                        CÔNG BỐ CHÍNH THỨC
                      </span>
                    </div>
                    <p className="text-[12px] sm:text-[13px] text-[#45464f] mt-1 font-medium">
                      Quy định chuyển đổi điểm và cộng điểm ưu tiên xét tuyển theo Đề án Tuyển sinh Đại học chính quy K66 UTC
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setShowConversionTable(!showConversionTable)}
                  className="px-4 py-2.5 bg-[#0d1b4e] hover:bg-[#1a2c6d] text-[#fdb712] font-black text-[13px] border-[2px] border-[#111827] rounded-xl shadow-[2px_2px_0px_#111827] transition-all shrink-0 flex items-center gap-1.5 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {showConversionTable ? "expand_less" : "table_chart"}
                  </span>
                  <span>{showConversionTable ? "Thu Gọn Bảng" : "Xem Bảng Quy Đổi Chuẩn"}</span>
                </button>
              </div>

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
                        <tr className="hover:bg-[#fff9ea]">
                          <td className="py-2 px-3 font-bold text-[#0d1b4e] border-r border-gray-200" rowSpan={5}>
                            IELTS Academic
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

                        <tr className="hover:bg-[#fff9ea] border-t-2 border-gray-300">
                          <td className="py-2 px-3 font-bold text-[#0d1b4e] border-r border-gray-200" rowSpan={3}>
                            TOEFL iBT
                          </td>
                          <td className="py-2 px-3 font-mono font-semibold border-r border-gray-200">45 - 64</td>
                          <td className="py-2 px-3 text-center font-black text-[#0284c7] bg-blue-50/50 border-r border-gray-200">8.0 - 8.5</td>
                          <td className="py-2 px-3 text-[12px] text-gray-700">Xét tuyển kết hợp theo đề án K66</td>
                        </tr>
                        <tr className="hover:bg-[#fff9ea]">
                          <td className="py-2 px-3 font-mono font-semibold border-r border-gray-200">65 - 95</td>
                          <td className="py-2 px-3 text-center font-black text-[#0284c7] bg-blue-50/50 border-r border-gray-200">9.0 - 9.5</td>
                          <td className="py-2 px-3 text-[12px] text-gray-700">Xét tuyển kết hợp & Miễn học phần TA</td>
                        </tr>
                        <tr className="hover:bg-[#fff9ea]">
                          <td className="py-2 px-3 font-mono font-semibold border-r border-gray-200">96 - 120</td>
                          <td className="py-2 px-3 text-center font-black text-[#0284c7] bg-blue-50/50 border-r border-gray-200">10.0</td>
                          <td className="py-2 px-3 text-[12px] text-gray-700">Miễn học phần TA đầu vào</td>
                        </tr>

                        <tr className="hover:bg-[#fff9ea] border-t-2 border-gray-300">
                          <td className="py-2 px-3 font-bold text-[#0d1b4e] border-r border-gray-200">
                            SAT (Scholastic)
                          </td>
                          <td className="py-2 px-3 font-mono font-semibold border-r border-gray-200">≥ 1200 / 1600</td>
                          <td className="py-2 px-3 text-center font-black text-[#f59e0b] bg-yellow-50/50 border-r border-gray-200">Đạt Điểm Sàn</td>
                          <td className="py-2 px-3 text-[12px] text-gray-700">Môn Toán ≥ 600, xét tuyển kết hợp thẳng</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* SECTION 5: HỒ SƠ & GIẤY TỜ (CHECKLIST THƯỜNG GẶP) */}
          <section id="ho-so" className="scroll-mt-24 space-y-5">
            <div className="flex items-center gap-2.5 border-b-[3px] border-[#111827] pb-3">
              <div className="w-9 h-9 rounded-xl bg-[#0d9488] text-white flex items-center justify-center font-bold shrink-0">
                <span className="material-symbols-outlined text-[22px]">checklist</span>
              </div>
              <div>
                <h2 className="font-display font-black text-[22px] sm:text-[24px] text-[#0d1b4e] uppercase leading-tight">
                  5. Hồ Sơ & Giấy Tờ Cần Thiết (Interactive Checklist)
                </h2>
                <p className="text-[12px] text-[#767680] font-medium">
                  Danh mục hồ sơ thí sinh cần chuẩn bị khi nộp hồ sơ xét tuyển sớm và làm thủ tục nhập học
                </p>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border-[3px] border-[#111827] shadow-[5px_5px_0px_#111827] space-y-4">
              {/* Checklist Progress Bar */}
              <div className="p-4 bg-[#faf3e6] rounded-xl border border-[#111827] space-y-2">
                <div className="flex items-center justify-between text-[13px] font-bold text-[#0d1b4e]">
                  <span>Tiến độ chuẩn bị hồ sơ của bạn:</span>
                  <span className="text-[#15803d]">
                    {completedDocsCount} / {defaultDocuments.length} giấy tờ hoàn thành
                  </span>
                </div>
                <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden border border-[#111827]">
                  <div
                    className="h-full bg-[#15803d] transition-all duration-300"
                    style={{ width: `${(completedDocsCount / defaultDocuments.length) * 100}%` }}
                  />
                </div>
              </div>

              {/* Checklist Items */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {defaultDocuments.map((doc) => {
                  const isChecked = !!checkedDocs[doc.id];
                  return (
                    <div
                      key={doc.id}
                      onClick={() => toggleDoc(doc.id)}
                      className={`p-3.5 rounded-xl border-[2px] border-[#111827] cursor-pointer transition-all flex items-start gap-3 select-none ${
                        isChecked ? "bg-[#f0fdf4] shadow-xs" : "bg-white hover:bg-gray-50"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}}
                        className="w-5 h-5 mt-0.5 rounded border-[#111827] text-[#15803d] focus:ring-0 cursor-pointer"
                      />
                      <div>
                        <h4 className={`font-bold text-[14px] ${isChecked ? "text-[#166534]" : "text-[#111827]"}`}>
                          {doc.name}
                        </h4>
                        <p className="text-[12px] text-[#6b7280] mt-0.5">{doc.note}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* SECTION 6: HỌC PHÍ & HỌC BỔNG (THAM KHẢO) */}
          <section id="hoc-phi" className="scroll-mt-24 space-y-5">
            <div className="flex items-center gap-2.5 border-b-[3px] border-[#111827] pb-3">
              <div className="w-9 h-9 rounded-xl bg-[#c026d3] text-white flex items-center justify-center font-bold shrink-0">
                <span className="material-symbols-outlined text-[22px]">payments</span>
              </div>
              <div>
                <h2 className="font-display font-black text-[22px] sm:text-[24px] text-[#0d1b4e] uppercase leading-tight">
                  6. Học Phí & Chính Sách Học Bổng (Tham Khảo)
                </h2>
                <p className="text-[12px] text-[#767680] font-medium">
                  Mức học phí theo tín chỉ và các chương trình học bổng khuyến khích dành cho tân sinh viên
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Tuition Card */}
              <div className="bg-white p-5 rounded-2xl border-[3px] border-[#111827] shadow-[4px_4px_0px_#111827] space-y-3">
                <h3 className="font-display font-black text-[16px] text-[#0d1b4e] flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#0284c7]">receipt_long</span>
                  Mức Học Phí Dự Kiến Khóa K66
                </h3>
                <div className="space-y-2.5 text-[13px] text-[#374151]">
                  <div className="p-3 bg-[#faf3e6] rounded-xl border border-[#e5e7eb]">
                    <span className="font-bold text-[#0d1b4e] block">Khối Kỹ Thuật & Công Nghệ:</span>
                    <p className="mt-0.5">• ~420.000 – 460.000 đ/tín chỉ (~15 - 18 triệu đ/năm học).</p>
                  </div>
                  <div className="p-3 bg-[#faf3e6] rounded-xl border border-[#e5e7eb]">
                    <span className="font-bold text-[#0d1b4e] block">Khối Kinh Tế & Vận Tải:</span>
                    <p className="mt-0.5">• ~380.000 – 410.000 đ/tín chỉ (~13 - 15 triệu đ/năm học).</p>
                  </div>
                  <div className="p-3 bg-[#faf3e6] rounded-xl border border-[#e5e7eb]">
                    <span className="font-bold text-[#0d1b4e] block">Chương Trình Tiên Tiến / CLC:</span>
                    <p className="mt-0.5">• ~700.000 – 850.000 đ/tín chỉ (giảng dạy tăng cường tiếng Anh).</p>
                  </div>
                </div>
                <div className="text-[11.5px] text-[#767680] italic">
                  * Học phí thu theo số tín chỉ thực tế sinh viên đăng ký trong từng học kỳ.
                </div>
              </div>

              {/* Scholarship Card */}
              <div className="bg-white p-5 rounded-2xl border-[3px] border-[#111827] shadow-[4px_4px_0px_#111827] space-y-3">
                <h3 className="font-display font-black text-[16px] text-[#0d1b4e] flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#f59e0b]">workspace_premium</span>
                  Học Bổng & Hỗ Trợ Tài Chính
                </h3>
                <div className="space-y-2.5 text-[13px] text-[#374151]">
                  <div className="p-3 bg-[#f0fdf4] rounded-xl border border-[#bbf7d0]">
                    <span className="font-bold text-[#15803d] block">Học Bổng Thủ Khoa / Á Khoa:</span>
                    <p className="mt-0.5">• Miễn 100% học phí năm học đầu tiên cho thí sinh đạt điểm cao nhất.</p>
                  </div>
                  <div className="p-3 bg-[#eff6ff] rounded-xl border border-[#bfdbfe]">
                    <span className="font-bold text-[#1d4ed8] block">Học Bổng Khuyến Khích Học Tập:</span>
                    <p className="mt-0.5">• Xét cấp theo từng kỳ cho sinh viên đạt kết quả Xuất sắc, Giỏi, Khá.</p>
                  </div>
                  <div className="p-3 bg-[#faf5ff] rounded-xl border border-[#e9d5ff]">
                    <span className="font-bold text-[#7e22ce] block">Học Bổng Doanh Nghiệp Tài Trợ:</span>
                    <p className="mt-0.5">• Hơn 5 tỷ đồng/năm từ Samsung, Viettel, FPT, Cienco, Đăng kiểm VN...</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Official Source Link Card */}
            <div className="p-4 bg-[#fffdf7] rounded-xl border-[2px] border-[#111827] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[13px]">
              <span className="font-medium text-[#4b5563]">
                Xem chi tiết các quy định định mức học phí và quy chế học bổng tại website chính thức:
              </span>
              <a
                href="https://utc.edu.vn"
                target="_blank"
                rel="noreferrer"
                className="font-bold text-[#0d1b4e] hover:underline flex items-center gap-1 shrink-0"
              >
                <span>Cổng thông tin UTC (utc.edu.vn)</span>
                <span className="material-symbols-outlined text-[16px]">open_in_new</span>
              </a>
            </div>
          </section>

          {/* SECTION 7: CÂU HỎI THƯỜNG GẶP (FAQ THỰC TẾ) */}
          <section id="faq" className="scroll-mt-24 space-y-5">
            <div className="flex items-center gap-2.5 border-b-[3px] border-[#111827] pb-3">
              <div className="w-9 h-9 rounded-xl bg-[#ea580c] text-white flex items-center justify-center font-bold shrink-0">
                <span className="material-symbols-outlined text-[22px]">quiz</span>
              </div>
              <div>
                <h2 className="font-display font-black text-[22px] sm:text-[24px] text-[#0d1b4e] uppercase leading-tight">
                  7. Câu Hỏi Thường Gặp (FAQ Tuyển Sinh)
                </h2>
                <p className="text-[12px] text-[#767680] font-medium">
                  Giải đáp các thắc mắc thực tế: Điểm sàn, nộp học bạ, ngày công bố và thứ tự nguyện vọng
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
                      className="w-full p-4 text-left font-display font-bold text-[15px] text-[#0d1b4e] flex items-center justify-between bg-[#faf3e6] hover:bg-[#ffdea8] transition-colors cursor-pointer"
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

          {/* SECTION 8: KÊNH THÔNG TIN CHÍNH THỨC (PHÁP LÝ BẮT BUỘC) */}
          <section id="kenh-chinh-thuc" className="scroll-mt-24 space-y-5">
            <div className="bg-[#0d1b4e] text-white p-6 sm:p-8 rounded-2xl border-[3px] border-[#111827] shadow-[6px_6px_0px_#111827] space-y-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#fdb712] text-[30px]">verified_user</span>
                <h3 className="font-display font-black text-[22px] text-[#fdb712] uppercase">
                  8. Kênh Thông Tin Tuyển Sinh Chính Thức (Nguồn Pháp Lý Duy Nhất)
                </h3>
              </div>

              <div className="p-3.5 bg-yellow-400/20 border border-[#fdb712] rounded-xl text-[13px] text-[#fef08a] leading-relaxed">
                ⚠️ <strong>CẢNH BÁO QUAN TRỌNG:</strong> Thí sinh và phụ huynh lưu ý, mọi thông báo tuyển sinh, điểm sàn, kết quả trúng tuyển và hướng dẫn nhập học có giá trị pháp lý DUY NHẤT được niêm yết tại các kênh thông tin chính thức của Hội đồng Tuyển sinh Trường Đại học Giao thông Vận tải (Cơ sở Hà Nội - Mã trường: GHA). Tuyệt đối không giao dịch qua các hội nhóm không được kiểm chứng.
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[13.5px] pt-2">
                <div className="p-3 bg-white/10 rounded-xl space-y-1.5">
                  <p>🌐 <strong>Cổng thông tin tuyển sinh:</strong></p>
                  <a href="https://tuyensinh.utc.edu.vn" target="_blank" rel="noreferrer" className="text-[#fdb712] underline font-bold block">
                    https://tuyensinh.utc.edu.vn
                  </a>
                </div>
                <div className="p-3 bg-white/10 rounded-xl space-y-1.5">
                  <p>📘 <strong>Fanpage Tuyển sinh chính thức:</strong></p>
                  <a href="https://facebook.com/UTCtuyensinh" target="_blank" rel="noreferrer" className="text-[#fdb712] underline font-bold block">
                    facebook.com/UTCtuyensinh
                  </a>
                </div>
                <div className="p-3 bg-white/10 rounded-xl space-y-1.5">
                  <p>☎️ <strong>Hotline tư vấn tuyển sinh 24/7:</strong></p>
                  <span className="text-[#86efac] font-bold block">
                    (024) 3766 3311 • 0989 33 22 11
                  </span>
                </div>
                <div className="p-3 bg-white/10 rounded-xl space-y-1.5">
                  <p>✉️ <strong>Hộp thư điện tử chính thức:</strong></p>
                  <span className="text-white font-mono block">tuyensinh@utc.edu.vn</span>
                </div>
              </div>

              <div className="pt-2 text-[12.5px] text-[#c7d2fe]">
                📍 <strong>Địa chỉ tiếp nhận hồ sơ trực tiếp:</strong> Phòng Quản lý Đào tạo (Phòng 105, Nhà A1), Trường Đại học Giao thông Vận tải, Số 3 phố Cầu Giấy, Phường Láng Thượng, Quận Đống Đa, TP. Hà Nội.
              </div>
            </div>
          </section>

        </div>

        {/* Sticky Table of Contents (TOC) Sidebar Column - Display only on xl+ screens to prevent squash */}
        <div className="hidden xl:block xl:col-span-4 2xl:col-span-3">
          <div className="sticky top-24 space-y-4">
            <div className="bg-[#fffdf7] p-4.5 border-[3px] border-[#111827] shadow-[5px_5px_0px_#111827] rounded-2xl space-y-3.5 transition-all">
              <div className="flex items-center justify-between border-b-[2px] border-[#111827] pb-2.5">
                <h3 className="font-display font-black text-[14px] text-[#0d1b4e] uppercase flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[17px]">list_alt</span>
                  Mục Lục Truy Cập Nhanh
                </h3>
                <span className="w-2.5 h-2.5 rounded-full bg-[#15803d] border border-[#111827] animate-pulse" title="Đang theo dõi vị trí cuộn" />
              </div>

              <nav className="space-y-1.5 text-[12px] font-bold">
                {[
                  { id: "tong-quan", label: "1. Tổng Quan Tuyển Sinh", icon: "campaign" },
                  { id: "phuong-thuc", label: "2. Phương Thức Xét Tuyển", icon: "how_to_reg" },
                  { id: "chi-tieu-diem-chuan", label: "3. Chỉ Tiêu & Điểm Chuẩn", icon: "leaderboard" },
                  { id: "quy-che", label: "4. Quy Chế & Điểm Ưu Tiên", icon: "policy" },
                  { id: "ho-so", label: "5. Hồ Sơ & Checklist", icon: "checklist" },
                  { id: "hoc-phi", label: "6. Học Phí & Học Bổng", icon: "payments" },
                  { id: "faq", label: "7. Câu Hỏi Thường Gặp", icon: "quiz" },
                  { id: "kenh-chinh-thuc", label: "8. Kênh Pháp Lý Chính Thức", icon: "verified_user" },
                ].map((item) => {
                  const isActive = activeSection === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => scrollToSection(item.id)}
                      className={`w-full text-left px-2.5 py-1.5 rounded-xl flex items-center justify-between gap-2 transition-all cursor-pointer ${
                        isActive
                          ? "bg-[#0d1b4e] text-[#fdb712] shadow-xs translate-x-1 font-black"
                          : "text-[#374151] hover:bg-[#faf3e6]"
                      }`}
                    >
                      <span className="flex items-center gap-2 min-w-0 overflow-hidden">
                        <span className="material-symbols-outlined text-[15px] shrink-0">{item.icon}</span>
                        <span className="truncate">{item.label}</span>
                      </span>
                      <span className="material-symbols-outlined text-[13px] shrink-0">
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
                  Trợ Lý AI Tuyển Sinh 24/7
                </h4>
                <p className="text-[11px] text-[#767680] leading-snug">
                  Cần tư vấn chọn ngành theo điểm thi hoặc hỏi đáp quy chế? Trò chuyện ngay cùng AI!
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

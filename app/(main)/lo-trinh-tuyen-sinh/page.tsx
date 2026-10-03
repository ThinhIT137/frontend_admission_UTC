"use client";

import { useState, useEffect } from "react";
import { DisclaimerBanner } from "@/components/ui/DisclaimerBanner";
import { Timeline } from "@/components/ui/Timeline";

interface RoadmapMilestone {
  phase: string;
  timeRange: string;
  title: string;
  status: "PAST" | "ACTIVE" | "UPCOMING";
  statusText: string;
  details: string[];
}

const mockMilestones: RoadmapMilestone[] = [
  {
    phase: "GIAI ĐOẠN 1",
    timeRange: "01/03/2026 - 30/05/2026",
    title: "Đăng Ký Hồ Sơ Xét Tuyển Sớm & Chứng Chỉ Quốc Tế",
    status: "ACTIVE",
    statusText: "ĐANG MỞ NỘP HỒ SƠ",
    details: [
      "Nộp bản sao công chứng chứng chỉ IELTS, SAT hoặc kết quả thi ĐGNL ĐHQG Hà Nội.",
      "Đăng ký trực tuyến trên Cổng thông tin Tuyển sinh UTC.",
      "Nhận thông báo sơ tuyển đủ điều kiện xét tuyển thẳng.",
    ],
  },
  {
    phase: "GIAI ĐOẠN 2",
    timeRange: "26/06/2026 - 29/06/2026",
    title: "Thi Tốt Nghiệp THPT Quốc Gia Năm 2026",
    status: "UPCOMING",
    statusText: "SẮP DIỄN RA",
    details: [
      "Thí sinh dự thi các môn bắt buộc và tổ hợp tự chọn tại điểm thi THPT đăng ký.",
      "Nhận Giấy chứng nhận kết quả thi chính thức từ Hội đồng thi.",
    ],
  },
  {
    phase: "GIAI ĐOẠN 3",
    timeRange: "10/07/2026 - 30/07/2026",
    title: "Đăng Ký Nguyện Vọng Trên Cổng Thông Tin Bộ GD&ĐT",
    status: "UPCOMING",
    statusText: "CHỜ MỞ CỔNG",
    details: [
      "Đăng ký tất cả nguyện vọng theo thứ tự ưu tiên (Nguyện vọng 1 là cao nhất).",
      "Thực hiện nộp lệ phí đăng ký xét tuyển trực tuyến theo quy định.",
    ],
  },
  {
    phase: "GIAI ĐOẠN 4",
    timeRange: "20/08/2026 - 31/08/2026",
    title: "Công Bố Điểm Chuẩn & Làm Thủ Tục Nhập Học Tân Sinh Viên K66",
    status: "UPCOMING",
    statusText: "CHUẨN BỊ K66",
    details: [
      "Tra cứu danh sách trúng tuyển chính thức trên website UTC.",
      "Nộp hồ sơ gốc, xác nhận nhập học trực tuyến và hoàn tất học phí đợt 1.",
    ],
  },
];

export default function RoadmapPage() {
  const [milestones, setMilestones] = useState<RoadmapMilestone[]>(mockMilestones);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("utc_admission_milestones");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const mapped: RoadmapMilestone[] = parsed.map((m: any, idx: number) => {
            const formatD = (d: string) => {
              if (!d) return "";
              const parts = d.split("T")[0].split("-");
              return parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : d;
            };
            const timeRange = `${formatD(m.thoi_gian_bat_dau)} - ${formatD(m.thoi_gian_ket_thuc)}`;
            const status = m.trang_thai || "UPCOMING";
            let statusText = "SẮP DIỄN RA";
            if (status === "ACTIVE") statusText = "ĐANG MỞ HỒ SƠ";
            if (status === "PAST") statusText = "ĐÃ KẾT THÚC";

            return {
              phase: m.giai_doan || `GIAI ĐOẠN ${idx + 1}`,
              timeRange,
              title: m.ten_su_kien,
              status,
              statusText,
              details: m.ghi_chu
                ? [m.ghi_chu]
                : ["Theo dõi thông báo chính thức từ Hội đồng Tuyển sinh UTC."],
            };
          });
          setMilestones(mapped);
        }
      }
    } catch (e) {
      console.error("Lỗi đồng bộ mốc thời gian:", e);
    }
  }, []);

  return (
    <div className="flex flex-col w-full space-y-6 pb-12">
      {/* Title Card */}
      <div className="bg-[#fffdf7] p-6 border-[3px] border-[#111827] shadow-[5px_5px_0px_#111827] rounded-[16px] relative">
        <div className="absolute -top-3 left-6 px-3 py-0.5 bg-[#a78bfa] border-[2px] border-[#111827] font-stamp text-[11px] font-bold text-[#111827] uppercase rotate-[-2deg] shadow-[1px_1px_0px_#111827]">
          KẾ HOẠCH TUYỂN SINH K66
        </div>
        <h1 className="font-display font-extrabold text-[28px] lg:text-[34px] text-[#111827] uppercase mt-2">
          LỘ TRÌNH TUYỂN SINH UTC 2026
        </h1>
        <p className="text-[14px] text-[#4b5563] font-medium mt-1">
          Theo dõi các mốc thời gian xét tuyển sớm, lịch thi THPT, đăng ký nguyện vọng và thủ tục nhập học dành cho thí sinh 2k8.
        </p>
      </div>

      <DisclaimerBanner />

      <Timeline />

      {/* Detailed Milestone List */}
      <div className="space-y-6">
        <h3 className="font-display font-bold text-[22px] text-[#111827] uppercase flex items-center gap-2">
          <span className="material-symbols-outlined text-[#0284c7]">event_note</span>
          CHI TIẾT CÁC MỐC THỜI GIAN
        </h3>

        <div className="space-y-4">
          {milestones.map((ms, idx) => (
            <div
              key={idx}
              className="bg-white p-6 border-[3px] border-[#111827] shadow-[5px_5px_0px_#111827] rounded-[14px] flex flex-col md:flex-row gap-6 justify-between items-start"
            >
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="font-stamp text-[11px] font-bold text-[#0284c7] bg-[#e0f2fe] px-2 py-0.5 border border-[#111827] rounded">
                    {ms.phase}
                  </span>
                  <span className="font-mono text-[12px] font-bold text-[#4b5563]">
                    {ms.timeRange}
                  </span>
                </div>

                <h4 className="font-display font-bold text-[18px] text-[#111827]">
                  {ms.title}
                </h4>

                <ul className="space-y-1.5 pt-2 text-[13px] text-[#374151]">
                  {ms.details.map((d, dIdx) => (
                    <li key={dIdx} className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[#16a34a] text-[16px]">
                        check
                      </span>
                      {d}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="shrink-0">
                <span
                  className={`px-3 py-1 font-stamp text-[11px] font-bold border-[2px] border-[#111827] shadow-[2px_2px_0px_#111827] rounded-[6px] uppercase ${
                    ms.status === "ACTIVE"
                      ? "bg-[#86efac] text-[#111827] animate-pulse"
                      : "bg-[#faf3e6] text-[#767680]"
                  }`}
                >
                  {ms.statusText}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

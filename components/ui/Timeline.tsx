"use client";

import Link from "next/link";

export interface TimelineStep {
  title: string;
  subtitle: string;
  bg: string;
  icon: string;
  rotateClass: string;
}

const defaultSteps: TimelineStep[] = [
  {
    title: "Đăng ký hồ sơ",
    subtitle: "Xét tuyển sớm & ĐGNL",
    bg: "bg-[#fde047]",
    icon: "edit_document",
    rotateClass: "rotate-[-4deg]",
  },
  {
    title: "Thi tốt nghiệp",
    subtitle: "Kỳ thi THPT Quốc gia",
    bg: "bg-[#0284c7]",
    icon: "assignment",
    rotateClass: "rotate-2",
  },
  {
    title: "Xét tuyển",
    subtitle: "Đăng ký NV trên cổng Bộ",
    bg: "bg-[#f87171]",
    icon: "filter_alt",
    rotateClass: "rotate-[-2deg]",
  },
  {
    title: "Nhập học",
    subtitle: "Chào đón Tân sinh viên K66",
    bg: "bg-[#818cf8]",
    icon: "school",
    rotateClass: "rotate-3",
  },
];

export function Timeline({ steps = defaultSteps }: { steps?: TimelineStep[] }) {
  return (
    <section className="relative bg-[#fffdf5] p-6 lg:p-8 border-[3px] border-[#111827] shadow-[5px_5px_0px_#111827] rounded-[18px] overflow-hidden my-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h3 className="font-bold text-[20px] text-[#111827] font-display">
            Lộ trình tuyển sinh
          </h3>
          <div className="hidden sm:flex items-center gap-1">
            <span className="material-symbols-outlined text-[#fdb712]">star</span>
            <span className="material-symbols-outlined text-[#fdb712] text-[18px] rotate-12">
              star
            </span>
          </div>
        </div>
        <Link
          href="/lo-trinh-tuyen-sinh"
          className="inline-flex items-center gap-1 text-[13px] font-bold text-[#0284c7] hover:underline"
        >
          <span>Chi tiết mốc thời gian</span>
          <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
        </Link>
      </div>

      <div className="relative py-4 px-2">
        {/* Connector Line for desktop */}
        <div className="hidden md:block absolute top-[45px] left-[10%] right-[10%] h-[3px] border-t-[3px] border-dashed border-[#111827] z-0"></div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 relative z-10">
          {steps.map((step, idx) => (
            <div key={idx} className="flex flex-col items-center text-center">
              <div
                className={`w-14 h-14 rounded-full ${step.bg} border-[2.5px] border-[#111827] text-[#111827] flex items-center justify-center font-black text-[20px] mb-2 shadow-[2px_2px_0px_#111827] ${step.rotateClass}`}
              >
                <span className="material-symbols-outlined text-[24px]">
                  {step.icon}
                </span>
              </div>
              <h5 className="font-bold text-[15px] text-[#111827] font-display">
                {step.title}
              </h5>
              <span className="text-[12px] text-[#6b7280] font-medium">
                {step.subtitle}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

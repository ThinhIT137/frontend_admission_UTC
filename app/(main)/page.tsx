"use client";

import Link from "next/link";
import { DisclaimerBanner } from "@/components/ui/DisclaimerBanner";
import { FeatureCard } from "@/components/ui/FeatureCard";
import { Timeline } from "@/components/ui/Timeline";
import { StatCard } from "@/components/ui/StatCard";

export default function HomePage() {
  return (
    <div className="flex flex-col w-full space-y-8 pb-12">
      {/* 1. Hero Scrapbook Section */}
      <section
        className="relative bg-[#fffdf7] p-6 lg:p-8 pt-8 border-[3px] border-[#1e1b14] shadow-[6px_6px_0px_#000525] rounded-[24px]"
        style={{ borderRadius: "255px 15px 225px 15px / 15px 225px 15px 255px" }}
      >
        {/* Stickers Top */}
        <div className="absolute top-1 left-10 w-28 h-7 bg-[#fcd34d] border-[2px] border-[#1e1b14] -rotate-3 shadow-[2px_2px_0px_#000525] pointer-events-none z-20 flex items-center justify-center">
          <span className="font-bold text-[12px] text-[#1e1b14] uppercase tracking-wider font-display">
            UTC
          </span>
        </div>
        <div className="absolute top-3 right-16 w-24 h-7 bg-[#a78bfa] border-[2px] border-[#1e1b14] rotate-6 shadow-[2px_2px_0px_#000525] pointer-events-none z-20"></div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Left Hero Column */}
          <div className="lg:col-span-7 flex flex-col space-y-4 z-10">
            <div className="inline-flex items-center gap-2 self-start bg-[#fed7aa] border-[2.5px] border-[#1e1b14] px-3 py-1 shadow-[2px_2px_0px_#000525] rotate-[-1deg]">
              <span className="w-2.5 h-2.5 rounded-full bg-[#0284c7] animate-ping"></span>
              <span className="font-bold text-[12px] text-[#1e1b14] uppercase font-display">
                CỔNG TƯ VẤN 
              </span>
            </div>

            <h1 className="text-[32px] lg:text-[42px] font-extrabold text-[#111827] tracking-tight leading-[1.15] font-display uppercase">
              HỆ THỐNG TƯ VẤN & HỖ TRỢ THÔNG TIN TUYỂN SINH UTC
            </h1>

            <p className="text-[15px] lg:text-[16px] text-[#4b5563] font-medium leading-relaxed max-w-xl">
              Cổng thông tin hỗ trợ thí sinh tra cứu điểm chuẩn, quy đổi điểm xét tuyển đa phương thức và trắc nghiệm MBTI hướng nghiệp kỹ sư công nghệ.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                href="/tra-cuu-nganh-hoc"
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#0284c7] hover:bg-[#0369a1] text-white font-bold text-[16px] border-[3px] border-[#111827] shadow-[4px_4px_0px_#111827] hover:shadow-[6px_6px_0px_#111827] hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-1 active:translate-y-1 active:shadow-none transition-all rounded-[12px]"
              >
                <span>Khám phá ngay</span>
                <span className="material-symbols-outlined text-[20px] font-bold">
                  north_east
                </span>
              </Link>

              <Link
                href="/tinh-diem-quy-doi"
                className="inline-flex items-center gap-2 px-5 py-3 bg-[#fff] text-[#111827] font-bold text-[15px] border-[2.5px] border-[#111827] shadow-[3px_3px_0px_#111827] hover:bg-[#fef08a] transition-all rounded-[10px]"
              >
                <span className="material-symbols-outlined text-[#0284c7] text-[20px]">
                  calculate
                </span>
                <span>Tính điểm ngay</span>
              </Link>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#dbeafe] border-[2px] border-[#111827] shadow-[2px_2px_0px_#111827] rotate-2 ml-auto lg:ml-2 rounded-[8px]">
                <span className="material-symbols-outlined text-[#0284c7] text-[18px]">
                  verified
                </span>
                <span className="font-bold text-[12px] text-[#1e1b14] uppercase">
                  MÃ TRƯỜNG: GHA
                </span>
              </div>
            </div>
          </div>

          {/* Right Hero Image Card */}
          <div className="lg:col-span-5 relative flex justify-center items-center py-4">
            <div className="relative w-full max-w-[340px]">
              <div className="relative bg-white p-3 pb-8 border-[3px] border-[#111827] shadow-[6px_6px_0px_#111827] rotate-[-2deg] rounded-[8px]">
                <div className="absolute -top-3 left-1/3 w-20 h-6 bg-[#fdba74] border-[2px] border-[#111827] rotate-2 pointer-events-none z-10 shadow-[1px_1px_0px_#111827]"></div>
                <div className="relative aspect-[4/3] w-full overflow-hidden border-[2px] border-[#111827] bg-[#000525] flex items-center justify-center p-4">
                  <div className="text-center text-white">
                    <span className="material-symbols-outlined text-[64px] text-[#fdb712] mb-1">
                      school
                    </span>
                    <p className="font-display font-bold text-[18px]">UTC CAMPUS 2026</p>
                    <p className="font-stamp text-[11px] text-[#ffdea8]">
                      ĐẠI HỌC GIAO THÔNG VẬN TẢI
                    </p>
                  </div>
                </div>

                <div className="pt-3 px-1 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-[15px] text-[#111827] leading-tight font-display">
                      Cơ sở Cầu Giấy • Hà Nội
                    </p>
                    <p className="text-[11px] text-[#4b5563] font-semibold uppercase tracking-wider">
                      Trường ĐH Giao thông Vận tải
                    </p>
                  </div>
                  <span className="font-extrabold text-[13px] text-white bg-[#0284c7] px-2.5 py-0.5 border-[2px] border-[#111827] shadow-[2px_2px_0px_#111827] rounded-[4px]">
                    2026
                  </span>
                </div>
              </div>

              {/* Decorative Badges */}
              <div className="absolute -bottom-4 -left-3 px-3 py-1 bg-[#86efac] border-[2.5px] border-[#111827] text-[#111827] font-black text-[13px] rotate-6 shadow-[3px_3px_0px_#111827] uppercase tracking-wider rounded-[6px] z-30">
                MỚI NHẤT
              </div>
              <div className="absolute -top-4 -right-3 px-3 py-1 bg-[#38bdf8] border-[2.5px] border-[#111827] text-[#111827] font-black text-[12px] -rotate-6 shadow-[3px_3px_0px_#111827] uppercase tracking-wider rounded-[6px] z-30">
                K66 SELECTION
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Disclaimer Banner */}
      <DisclaimerBanner />

      {/* 3. Feature Tool Cards (4 Bento modules) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-3 h-8 bg-[#fdb712] border-[2px] border-[#000525] shadow-[2px_2px_0px_#000525]"></div>
            <h2 className="font-display font-bold text-[24px] text-[#000525] uppercase tracking-tight">
              CÔNG CỤ NỔI BẬT
            </h2>
          </div>
          <span className="font-stamp text-[12px] text-[#45464f] bg-[#eee7db] px-2.5 py-1 border border-[#000525] shadow-[2px_2px_0px_#000525] font-bold">
            4 CHỨC NĂNG CỐT LÕI
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 pt-2">
          <FeatureCard
            title="Tính điểm quy đổi"
            description="Quy đổi điểm thi IELTS, HSA, TSA, V-SAT và tốt nghiệp THPT sang thang điểm UTC."
            badge="QUY ĐỔI"
            badgeBg="bg-[#fef08a]"
            icon="laptop_mac"
            iconBg="bg-[#e0f2fe]"
            iconColor="text-[#0284c7]"
            btnText="Bắt đầu tính"
            btnBg="bg-[#0284c7]"
            btnColor="text-white"
            href="/tinh-diem-quy-doi"
            rotateClass="-rotate-1"
          />

          <FeatureCard
            title="Trắc nghiệm MBTI"
            description="Khám phá tính cách kỹ sư công nghệ và gợi ý ngành học phù hợp tại trường."
            badge="20 CÂU"
            badgeBg="bg-[#dbeafe]"
            icon="psychology"
            iconBg="bg-[#ffedd5]"
            iconColor="text-[#ea580c]"
            btnText="Làm trắc nghiệm"
            btnBg="bg-[#ea580c]"
            btnColor="text-white"
            href="/trac-nghiem-mbti"
            rotateClass="rotate-1"
            tapeBg="bg-[#fed7aa]"
          />

          <FeatureCard
            title="Tra cứu ngành học"
            description="Thông tin chỉ tiêu, điểm chuẩn 3 năm, học phí và các tổ hợp xét tuyển UTC."
            badge="35+ NGÀNH"
            badgeBg="bg-[#bbf7d0]"
            icon="manage_search"
            iconBg="bg-[#f0fdf4]"
            iconColor="text-[#16a34a]"
            btnText="Xem chi tiết"
            btnBg="bg-white"
            btnColor="text-[#111827]"
            href="/tra-cuu-nganh-hoc"
            rotateClass="-rotate-1"
            tapeBg="bg-[#bbf7d0]"
          />

          <FeatureCard
            title="Lộ trình nhập học"
            description="Các mốc thời gian xét tuyển sớm, đăng ký NV và nộp hồ sơ K66 chính thức."
            badge="QUAN TRỌNG"
            badgeBg="bg-[#fecdd3]"
            icon="map"
            iconBg="bg-[#faf5ff]"
            iconColor="text-[#9333ea]"
            btnText="Xem mốc thời gian"
            btnBg="bg-white"
            btnColor="text-[#111827]"
            href="/lo-trinh-tuyen-sinh"
            rotateClass="rotate-1"
            tapeBg="bg-[#e9d5ff]"
          />
        </div>
      </section>

      {/* 4. Timeline Component */}
      <Timeline />

      {/* 5. Stats Highlights Bento */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <StatCard
          value="35+"
          title="Ngành & Chương Trình"
          subtitle="Kỹ thuật Giao thông, CNTT, Logistics, Tự động hóa, Kinh tế..."
        />
        <StatCard
          value="05"
          title="Phương Thức Xét Tuyển"
          subtitle="Xét tuyển thẳng, học bạ, thi tốt nghiệp THPT, ĐGNL ĐHQG & ĐHBK."
        />
        <StatCard
          value="96%"
          title="Sinh Viên Có Việc Làm"
          subtitle="Được các tập đoàn công nghệ và hạ tầng săn đón ngay sau tốt nghiệp."
        />
      </section>
    </div>
  );
}

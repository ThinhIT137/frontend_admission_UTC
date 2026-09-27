"use client";

import { useState } from "react";
import { DisclaimerBanner } from "@/components/ui/DisclaimerBanner";

interface FAQItem {
  q: string;
  a: string;
}

const faqs: FAQItem[] = [
  {
    q: "Trường Đại học Giao thông Vận tải có mấy cơ sở đào tạo?",
    a: "Trường có 2 cơ sở đào tạo chính: Cơ sở chính tại Số 3 phố Cầu Giấy, Q. Đống Đa, Hà Nội và Phân hiệu tại Phường Tăng Nhơn Phú A, Thành phố Thủ Đức, TP. Hồ Chí Minh.",
  },
  {
    q: "Thí sinh sử dụng chứng chỉ IELTS để xét tuyển cần đáp ứng điều kiện gì?",
    a: "Chứng chỉ IELTS phải đạt từ 5.0 trở lên, còn hiệu lực tính đến ngày nộp hồ sơ. Điểm IELTS được quy đổi sang thang điểm 10 môn Tiếng Anh trong tổ hợp xét tuyển.",
  },
  {
    q: "Chính sách học bổng dành cho Tân sinh viên K66 như thế nào?",
    a: "Nhà trường dành hàng trăm suất học bổng Khuyến khích học tập, Học bổng Tài năng (100% học phí) cho các thí sinh có điểm xét tuyển đầu vào cao nhất ngành.",
  },
];

export default function AdmissionInfoPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <div className="flex flex-col w-full space-y-6 pb-12">
      {/* Title Card */}
      <div className="bg-[#fffdf7] p-6 border-[3px] border-[#111827] shadow-[5px_5px_0px_#111827] rounded-[16px] relative flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-block px-3 py-0.5 bg-[#fdb712] border-[2px] border-[#111827] font-stamp text-[11px] font-bold text-[#111827] uppercase rotate-[-2deg] shadow-[1px_1px_0px_#111827]">
            VĂN BẢN CHÍNH THỨC
          </div>
          <h1 className="font-display font-extrabold text-[28px] lg:text-[34px] text-[#111827] uppercase mt-2">
            THÔNG TIN & QUY CHẾ TUYỂN SINH UTC
          </h1>
          <p className="text-[14px] text-[#4b5563] font-medium mt-1">
            Tổng hợp quy chế, phương thức xét tuyển, chỉ tiêu đào tạo và các câu hỏi thường gặp của thí sinh K66.
          </p>
        </div>

        <a
          href="#"
          className="shrink-0 inline-flex items-center gap-2 px-5 py-3 bg-[#000525] text-[#fff9ee] font-bold text-[14px] border-[2.5px] border-[#111827] shadow-[3px_3px_0px_#7c5800] hover:bg-[#fdb712] hover:text-[#000525] transition-all rounded-[10px]"
        >
          <span className="material-symbols-outlined text-[18px]">download</span>
          Tải Đề án 2026 (PDF)
        </a>
      </div>

      <DisclaimerBanner />

      {/* Sections Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* News & Regulations */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white p-6 border-[3px] border-[#111827] shadow-[5px_5px_0px_#111827] rounded-[14px] space-y-4">
            <h3 className="font-display font-bold text-[20px] text-[#111827] border-b-[2px] border-dashed border-[#c6c5d0] pb-2 flex items-center gap-2">
              <span className="material-symbols-outlined text-[#0284c7]">menu_book</span>
              Phương Thức Xét Tuyển Đại Học 2026
            </h3>

            <div className="space-y-3 text-[14px] text-[#374151]">
              <div className="p-3 bg-[#faf3e6] border-[2px] border-[#111827] rounded-[8px] space-y-1">
                <span className="font-bold text-[#0d1b4e] font-display text-[15px]">
                  PT1: Xét tuyển theo kết quả thi THPT 2026
                </span>
                <p className="text-[13px] text-[#4b5563]">
                  Sử dụng kết quả tổ hợp 3 môn thi tốt nghiệp THPT Quốc gia năm 2026 theo mã tổ hợp ngành đăng ký.
                </p>
              </div>

              <div className="p-3 bg-[#faf3e6] border-[2px] border-[#111827] rounded-[8px] space-y-1">
                <span className="font-bold text-[#0d1b4e] font-display text-[15px]">
                  PT2: Xét tuyển kết hợp Chứng chỉ Quốc tế & THPT
                </span>
                <p className="text-[13px] text-[#4b5563]">
                  Xét kết hợp IELTS từ 5.0+ hoặc SAT với tổng điểm 2 môn THPT trong tổ hợp xét tuyển.
                </p>
              </div>

              <div className="p-3 bg-[#faf3e6] border-[2px] border-[#111827] rounded-[8px] space-y-1">
                <span className="font-bold text-[#0d1b4e] font-display text-[15px]">
                  PT3: Xét tuyển theo kết quả Thi ĐGNL ĐHQG & ĐHBK
                </span>
                <p className="text-[13px] text-[#4b5563]">
                  Sử dụng điểm kỳ thi ĐGNL ĐHQG Hà Nội (HSA) hoặc ĐGTD Bách Khoa (TSA) năm 2026.
                </p>
              </div>
            </div>
          </div>

          {/* FAQ Accordion */}
          <div className="bg-white p-6 border-[3px] border-[#111827] shadow-[5px_5px_0px_#111827] rounded-[14px] space-y-4">
            <h3 className="font-display font-bold text-[20px] text-[#111827] border-b-[2px] border-dashed border-[#c6c5d0] pb-2 flex items-center gap-2">
              <span className="material-symbols-outlined text-[#ea580c]">quiz</span>
              Hỏi Đáp Thường Gặp (FAQ)
            </h3>

            <div className="space-y-3">
              {faqs.map((faq, idx) => (
                <div
                  key={idx}
                  className="border-[2px] border-[#111827] rounded-[10px] overflow-hidden bg-[#fffdf7]"
                >
                  <button
                    onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                    className="w-full p-4 text-left font-display font-bold text-[15px] text-[#111827] flex items-center justify-between bg-[#faf3e6] hover:bg-[#ffdea8] transition-colors"
                  >
                    <span>{faq.q}</span>
                    <span className="material-symbols-outlined text-[20px]">
                      {openFaq === idx ? "expand_less" : "expand_more"}
                    </span>
                  </button>
                  {openFaq === idx && (
                    <div className="p-4 text-[13px] text-[#4b5563] font-medium leading-relaxed border-t border-[#111827] bg-white">
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar TOC Links */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-[#fffdf7] p-5 border-[3px] border-[#111827] shadow-[5px_5px_0px_#111827] rounded-[14px] space-y-3">
            <h4 className="font-display font-bold text-[16px] text-[#111827] uppercase border-b pb-2">
              MỤC LỤC TRUY CẬP NHANH
            </h4>
            <nav className="space-y-2 text-[13px] font-bold text-[#0284c7]">
              <a href="#" className="block hover:underline">
                • Đề án Tuyển sinh K66 đầy đủ
              </a>
              <a href="#" className="block hover:underline">
                • Quy chế quy đổi điểm ngoại ngữ
              </a>
              <a href="#" className="block hover:underline">
                • Khung học phí & Học bổng tài năng
              </a>
              <a href="#" className="block hover:underline">
                • Thông tin Ký túc xá & Đời sống Sinh viên
              </a>
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { DisclaimerBanner } from "@/components/ui/DisclaimerBanner";

interface Question {
  id: number;
  text: string;
  category: "EI" | "SN" | "TF" | "JP";
}

const mockQuestions: Question[] = [
  { id: 1, text: "Bạn thích làm việc nhóm hơn là làm việc một mình độc lập?", category: "EI" },
  { id: 2, text: "Bạn thích tập trung vào các sự thật cụ thể hơn là các ý tưởng lý thuyết?", category: "SN" },
  { id: 3, text: "Bạn ra quyết định dựa trên logic và dữ liệu hơn là cảm xúc cá nhân?", category: "TF" },
  { id: 4, text: "Bạn thích lên kế hoạch chi tiết trước khi hành động thay vì tùy cơ ứng biến?", category: "JP" },
  { id: 5, text: "Bạn cảm thấy tràn đầy năng lượng khi ở trong đám đông hoặc sự kiện lớn?", category: "EI" },
  { id: 6, text: "Bạn tò mò về công nghệ mới và tương lai nhiều hơn thực tại?", category: "SN" },
  { id: 7, text: "Bạn ưu tiên tính công bằng và chính xác tuyệt đối trong giải quyết vấn đề?", category: "TF" },
  { id: 8, text: "Bạn luôn giữ bàn học và lịch làm việc ngăn nắp, có hệ thống?", category: "JP" },
];

export default function MBTITestPage() {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [studentName, setStudentName] = useState("");

  const handleSelect = (qId: number, value: number) => {
    setAnswers((prev) => ({ ...prev, [qId]: value }));
  };

  const answeredCount = Object.keys(answers).length;
  const isComplete = answeredCount === mockQuestions.length;

  const handleSubmit = () => {
    if (!isComplete) return;
    setIsSubmitted(true);
  };

  const handleReset = () => {
    setAnswers({});
    setIsSubmitted(false);
  };

  return (
    <div className="flex flex-col w-full space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-[#fffdf7] p-6 pt-10 border-[3px] border-[#111827] shadow-[5px_5px_0px_#111827] rounded-[16px] relative">
        <div className="absolute top-1 left-6 px-3 py-0.5 bg-[#ffedd5] border-[2px] border-[#111827] font-stamp text-[11px] font-bold text-[#ea580c] uppercase rotate-[-2deg] shadow-[1px_1px_0px_#111827]">
          TƯ VẤN HƯỚNG NGHIỆP KỸ SƯ
        </div>
        <h1 className="font-display font-extrabold text-[28px] lg:text-[34px] text-[#111827] uppercase">
          TRẮC NGHIỆM MBTI HƯỚNG NGHIỆP UTC
        </h1>
        <p className="text-[14px] text-[#4b5563] font-medium mt-1">
          Khám phá nhóm tính cách của bản thân để nhận gợi ý ngành học kỹ thuật & kinh tế phù hợp nhất tại Đại học Giao thông Vận tải.
        </p>
      </div>

      <DisclaimerBanner />

      {!isSubmitted ? (
        <div className="bg-white p-6 border-[3px] border-[#111827] shadow-[5px_5px_0px_#111827] rounded-[16px] space-y-6">
          {/* Form Header info */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b-[2px] border-dashed border-[#c6c5d0] pb-4">
            <div className="w-full sm:w-72">
              <label className="block text-[12px] font-bold text-[#111827] mb-1">
                Họ và tên thí sinh (Tùy chọn):
              </label>
              <input
                type="text"
                placeholder="Nhập tên của bạn..."
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                className="w-full px-3 py-1.5 bg-[#faf3e6] border-[2px] border-[#111827] rounded-[8px] font-bold text-[13px] outline-none"
              />
            </div>

            <div className="text-right w-full sm:w-auto">
              <span className="font-stamp text-[12px] font-bold text-[#0d1b4e]">
                TIẾN ĐỘ: {answeredCount} / {mockQuestions.length} CÂU HỎI
              </span>
              <div className="w-full sm:w-48 h-2 bg-[#f4ede0] rounded-full overflow-hidden mt-1 border border-[#111827]">
                <div
                  className="h-full bg-[#0284c7] transition-all duration-300"
                  style={{ width: `${(answeredCount / mockQuestions.length) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Question Items */}
          <div className="space-y-6">
            {mockQuestions.map((q) => (
              <div
                key={q.id}
                className="bg-[#faf3e6] p-4 border-[2px] border-[#111827] shadow-[3px_3px_0px_#111827] rounded-[12px] space-y-3"
              >
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#000525] text-white font-stamp text-[11px] font-bold flex items-center justify-center shrink-0">
                    {q.id}
                  </span>
                  <p className="font-display font-bold text-[15px] text-[#111827]">
                    {q.text}
                  </p>
                </div>

                {/* Rating options 1-5 scale */}
                <div className="flex items-center justify-between gap-2 pt-1 px-2">
                  <span className="text-[11px] font-bold text-[#ba1a1a]">
                    Không đồng ý
                  </span>
                  <div className="flex items-center gap-3">
                    {[1, 2, 3, 4, 5].map((val) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => handleSelect(q.id, val)}
                        className={`w-9 h-9 rounded-full border-[2px] border-[#111827] font-bold text-[13px] transition-all ${
                          answers[q.id] === val
                            ? "bg-[#0284c7] text-white shadow-[2px_2px_0px_#111827] scale-110"
                            : "bg-white text-[#111827] hover:bg-[#ffdea8]"
                        }`}
                      >
                        {val}
                      </button>
                    ))}
                  </div>
                  <span className="text-[11px] font-bold text-[#16a34a]">
                    Rất đồng ý
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Submit Button */}
          <button
            disabled={!isComplete}
            onClick={handleSubmit}
            className={`w-full py-3.5 font-extrabold text-[16px] border-[3px] border-[#111827] shadow-[4px_4px_0px_#111827] rounded-[10px] transition-all uppercase tracking-wider ${
              isComplete
                ? "bg-[#ea580c] hover:bg-[#c2410c] text-white cursor-pointer active:translate-x-[2px] active:translate-y-[2px]"
                : "bg-[#e5e7eb] text-[#9ca3af] cursor-not-allowed shadow-none"
            }`}
          >
            {isComplete
              ? "Xem Báo Cáo Phân Tích MBTI"
              : `Vui lòng trả lời đủ ${mockQuestions.length} câu hỏi để xem kết quả`}
          </button>
        </div>
      ) : (
        /* Report Result view */
        <div className="bg-[#fffdf7] p-6 lg:p-8 border-[3px] border-[#111827] shadow-[6px_6px_0px_#111827] rounded-[16px] space-y-6">
          <div className="bg-[#0d1b4e] text-white p-6 border-[3px] border-[#111827] shadow-[4px_4px_0px_#fdb712] rounded-[14px] flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <span className="font-stamp text-[12px] text-[#fdb712] uppercase font-bold">
                BÁO CÁO HƯỚNG NGHIỆP DÀNH CHO: {studentName.toUpperCase() || "THÍ SINH 2K8"}
              </span>
              <h2 className="font-display font-black text-[32px] text-white mt-1">
                NHÓM TÍNH CÁCH: INTJ - NHA THIẾT KẾ KỸ THUẬT
              </h2>
              <p className="text-[13px] text-[#b8c4ff] mt-1">
                Bạn sở hữu tư duy phân tích sắc bén, logic hệ thống cao và khát khao sáng tạo trong lĩnh vực kỹ thuật hạ tầng.
              </p>
            </div>
            <div className="w-20 h-20 rounded-full bg-[#fdb712] border-[3px] border-[#111827] text-[#0d1b4e] font-display font-black text-[24px] flex items-center justify-center shrink-0 shadow-[2px_2px_0px_#111827]">
              INTJ
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-5 border-[2.5px] border-[#111827] shadow-[4px_4px_0px_#111827] rounded-[12px]">
              <h4 className="font-display font-bold text-[16px] text-[#111827] mb-2 border-b pb-2">
                Môi Trường Học Tập Phù Hợp
              </h4>
              <p className="text-[13px] text-[#4b5563] leading-relaxed font-medium">
                Môi trường chú trọng tư duy thuật toán, ứng dụng công nghệ hiện đại, lập trình tự động hóa hoặc phân tích quản lý vận tải logistic đa phương thức.
              </p>
            </div>

            <div className="bg-white p-5 border-[2.5px] border-[#111827] shadow-[4px_4px_0px_#111827] rounded-[12px]">
              <h4 className="font-display font-bold text-[16px] text-[#111827] mb-2 border-b pb-2">
                Top Ngành Gợi Ý Tại UTC
              </h4>
              <div className="space-y-2 text-[13px]">
                <Link
                  href="/tra-cuu-nganh-hoc/cntt"
                  className="block p-2 bg-[#e0f2fe] hover:bg-[#bae6fd] border border-[#111827] rounded font-bold text-[#0284c7]"
                >
                  1. Công nghệ Thông tin (Mã: 7480201)
                </Link>
                <Link
                  href="/tra-cuu-nganh-hoc/logistics"
                  className="block p-2 bg-[#ffedd5] hover:bg-[#fed7aa] border border-[#111827] rounded font-bold text-[#ea580c]"
                >
                  2. Logistics & Quản lý Chuỗi Cung Ứng (Mã: 7510605)
                </Link>
                <Link
                  href="/tra-cuu-nganh-hoc"
                  className="block p-2 bg-[#f0fdf4] hover:bg-[#dcfce7] border border-[#111827] rounded font-bold text-[#16a34a]"
                >
                  3. Kỹ thuật Điều khiển & Tự động hóa (Mã: 7520216)
                </Link>
              </div>
            </div>
          </div>

          <div className="flex gap-4 pt-2">
            <button
              onClick={handleReset}
              className="px-6 py-2.5 bg-white hover:bg-[#faf3e6] text-[#111827] font-bold text-[14px] border-[2.5px] border-[#111827] shadow-[3px_3px_0px_#111827] rounded-[8px]"
            >
              Làm lại bài trắc nghiệm
            </button>
            <Link
              href="/tra-cuu-nganh-hoc"
              className="px-6 py-2.5 bg-[#0284c7] hover:bg-[#0369a1] text-white font-bold text-[14px] border-[2.5px] border-[#111827] shadow-[3px_3px_0px_#111827] rounded-[8px]"
            >
              Xem tất cả ngành học
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

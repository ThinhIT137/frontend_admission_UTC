"use client";
import { publicError } from "@/libs/client-error";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DisclaimerBanner } from "@/components/ui/DisclaimerBanner";
import { MBTI_QUESTIONS, MbtiQuestion, calculateMbtiType } from "./mbtiData";
import { api } from "@/libs/api-services/browser-api";

interface MBTITestClientProps {
  initialQuestions?: MbtiQuestion[];
}

export default function MBTITestClient({ initialQuestions = [] }: MBTITestClientProps) {
  const router = useRouter();
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [studentName, setStudentName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [questionsList, setQuestions] = useState<MbtiQuestion[]>(initialQuestions);
  const [error, setError] = useState("");
  useEffect(() => {
    api<{ data: Array<{ id: number; text: string; dimension: "EI" | "SN" | "TF" | "JP"; positive_trait: string }> }>("ai", "/api/mbti/questions")
      .then(r => setQuestions(r.data.map(q => ({ id: q.id, text: q.text, dimension: q.dimension, direction: ["I", "N", "F", "P"].includes(q.positive_trait) ? -1 : 1 }))))
      .catch(e => setError(publicError(e.message)));
  }, []);

  const handleSelect = (qId: number, value: number) => {
    setAnswers((prev) => ({ ...prev, [qId]: value }));
  };

  const answeredCount = Object.keys(answers).length;
  const totalQuestions = questionsList.length;
  const isComplete = totalQuestions > 0 && answeredCount === totalQuestions;
  const progressPercent = Math.round(totalQuestions ? (answeredCount / totalQuestions) * 100 : 0);

  const handleSubmit = async () => {
    if (!isComplete || isSubmitting) return;

    setIsSubmitting(true);
    setError("");
    try {
      const response = await api<{ data: { result_id: string; mbti_type: string } }>("ai", "/api/mbti/submit", { studentName: studentName.trim() || undefined, answers });
      if (!response.data.result_id) throw Error("Backend chưa lưu được kết quả. Vui lòng thử lại.");
      router.push(`/ket-qua-tu-van?id=${encodeURIComponent(response.data.result_id)}`);
    } catch (e) { setError(publicError(e instanceof Error ? e.message : "Không thể nộp bài trắc nghiệm")); }
    finally { setIsSubmitting(false); }
  };

  return (
    <div className="flex flex-col w-full space-y-7 pb-16">
      {error && <p role="alert" className="text-red-700">{error}</p>}
      {/* 1. Header Banner Phong Cách Neo-Brutalism */}
      <div className="bg-[#fffdf7] p-6 lg:p-8 border-[3px] border-[#111827] shadow-[6px_6px_0px_#111827] rounded-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-52 h-52 bg-[#fdb712]/15 rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className="px-3 py-1 bg-[#0d1b4e] text-white font-stamp text-[12px] font-black border-[2px] border-[#111827] rounded-lg shadow-[2px_2px_0px_#111827]">
            TƯ VẤN HƯỚNG NGHIỆP UTC
          </span>
          <span className="px-3 py-1 bg-[#fdb712] text-[#0d1b4e] font-stamp text-[12px] font-black border-[2px] border-[#111827] rounded-lg shadow-[2px_2px_0px_#111827]">
            {totalQuestions} CÂU HỎI
          </span>
          <span className="px-3 py-1 bg-[#e0f2fe] text-[#0369a1] font-bold text-[12px] border-[1.5px] border-[#111827] rounded-lg">
            Khám phá tiềm năng kỹ sư & nhà quản lý
          </span>
        </div>

        <h1 className="font-display font-black text-[26px] sm:text-[34px] text-[#0d1b4e] uppercase leading-tight tracking-tight">
          Trắc Nghiệm Tính Cách MBTI & Định Hướng Ngành Học UTC
        </h1>

        <p className="text-[14px] text-[#4b5563] mt-2 max-w-4xl leading-relaxed">
          Bài trắc nghiệm được lấy trực tiếp từ ngân hàng câu hỏi chuẩn của Nhà trường trên cơ sở dữ liệu, kết hợp với đặc thù đào tạo các khối ngành <strong>Kỹ thuật - Công nghệ - Kinh tế - Quản lý Vận tải</strong> tại Trường Đại học Giao thông Vận tải. Giúp bạn thấu hiểu điểm mạnh, chọn môi trường học tập lý tưởng và tự tin gửi gắm nguyện vọng.
        </p>
      </div>

      <DisclaimerBanner />

      {/* 2. Container Bảng Câu Hỏi & Form Nhập Tên */}
      <div className="bg-white p-6 lg:p-8 border-[3px] border-[#111827] shadow-[6px_6px_0px_#111827] rounded-2xl space-y-6">
        {/* Thanh Thông Tin Thí Sinh & Tiến Độ */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-5 bg-[#fffdf7] p-5 border-[2px] border-[#111827] rounded-xl">
          <div className="w-full md:w-80">
            <label className="block text-[12.5px] font-black text-[#0d1b4e] mb-1.5 uppercase">
              Họ và tên thí sinh (Tùy chọn):
            </label>
            <input
              type="text"
              placeholder="Ví dụ: Nguyễn Văn An..."
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border-[2px] border-[#111827] rounded-xl font-bold text-[13.5px] text-[#0d1b4e] outline-none placeholder:text-[#9ca3af] focus:ring-2 focus:ring-[#fdb712]"
            />
          </div>

          <div className="w-full md:w-96 text-left md:text-right">
            <div className="flex items-center justify-between md:justify-end gap-3 mb-1.5">
              <span className="font-stamp text-[12px] font-black text-[#0d1b4e] uppercase">
                Tiến độ trả lời:
              </span>
              <span className="px-2.5 py-0.5 bg-[#fdb712] text-[#0d1b4e] border border-[#111827] font-black font-stamp text-[12px] rounded-md shadow-[1px_1px_0px_#111827]">
                {answeredCount} / {totalQuestions} CÂU ({progressPercent}%)
              </span>
            </div>

            <div className="w-full h-3.5 bg-[#f3f4f6] rounded-full border-[2px] border-[#111827] overflow-hidden p-0.5">
              <div
                className="h-full bg-gradient-to-r from-[#0284c7] to-[#16a34a] rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <p className="text-[11px] text-[#6b7280] italic mt-1">
              * Hãy chọn đáp án theo phản xạ tự nhiên chân thật nhất của bạn.
            </p>
          </div>
        </div>

        {/* Danh Sách 20 Câu Hỏi Trắc Nghiệm Liền Mạch (Đã Bỏ Bộ Lọc) */}
        <div className="space-y-4">
          {questionsList.map((q, index) => {
            const currentVal = answers[q.id];

            return (
              <div
                key={q.id}
                className={`p-5 border-[2px] border-[#111827] rounded-xl transition-all ${
                  currentVal !== undefined
                    ? "bg-[#fffdf7] shadow-[3px_3px_0px_#111827]"
                    : "bg-[#faf8f5] shadow-[2px_2px_0px_#cbd5e1]"
                }`}
              >
                <div className="flex items-start gap-3 mb-3.5">
                  <span className="w-7 h-7 rounded-lg bg-[#0d1b4e] text-[#fdb712] font-stamp text-[12px] font-black flex items-center justify-center shrink-0 border border-[#111827] shadow-[1px_1px_0px_#111827]">
                    {index + 1}
                  </span>
                  <div className="flex-1">
                    <p className="font-display font-bold text-[15px] sm:text-[16px] text-[#0d1b4e] leading-snug">
                      {q.text}
                    </p>
                  </div>
                </div>

                {/* Thang đo 5 mức độ */}
                <div className="bg-white p-3 border border-[#e5e7eb] rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3">
                  <span className="text-[11.5px] font-bold text-[#ba1a1a] flex items-center gap-1 shrink-0">
                    <span className="material-symbols-outlined text-[16px]">close</span>
                    Hoàn toàn không đồng ý
                  </span>

                  <div className="flex items-center gap-2 sm:gap-3.5 w-full sm:w-auto justify-center">
                    {[
                      { val: 1, label: "Rất không đồng ý", size: "w-8 h-8 sm:w-9 sm:h-9" },
                      { val: 2, label: "Không đồng ý", size: "w-7 h-7 sm:w-8 sm:h-8" },
                      { val: 3, label: "Trung lập", size: "w-6 h-6 sm:w-7 sm:h-7" },
                      { val: 4, label: "Đồng ý", size: "w-7 h-7 sm:w-8 sm:h-8" },
                      { val: 5, label: "Rất đồng ý", size: "w-8 h-8 sm:w-9 sm:h-9" },
                    ].map((opt) => {
                      const isSelected = currentVal === opt.val;

                      let activeBg = "bg-[#0284c7]";
                      if (opt.val <= 2) activeBg = "bg-[#ba1a1a]";
                      if (opt.val === 3) activeBg = "bg-[#64748b]";
                      if (opt.val >= 4) activeBg = "bg-[#16a34a]";

                      return (
                        <button
                          key={opt.val}
                          type="button"
                          title={opt.label}
                          onClick={() => handleSelect(q.id, opt.val)}
                          className={`${opt.size} rounded-full border-[2px] border-[#111827] font-display font-black text-[12px] sm:text-[13px] transition-all flex items-center justify-center cursor-pointer ${
                            isSelected
                              ? `${activeBg} text-white scale-110 shadow-[2px_2px_0px_#111827]`
                              : "bg-[#fffdf7] text-[#4b5563] hover:bg-[#ffdea8] hover:scale-105"
                          }`}
                        >
                          {opt.val}
                        </button>
                      );
                    })}
                  </div>

                  <span className="text-[11.5px] font-bold text-[#16a34a] flex items-center gap-1 shrink-0">
                    Rất đồng ý
                    <span className="material-symbols-outlined text-[16px]">check</span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Nút Xem Kết Quả Tư Vấn & Lưu DB */}
        <div className="pt-4 border-t-[2px] border-dashed border-[#e5e7eb] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-[13px] text-[#4b5563] font-medium">
            {isComplete ? (
              <span className="text-[#16a34a] font-bold flex items-center gap-1">
                <span className="material-symbols-outlined text-[18px]">check_circle</span>
                Bạn đã hoàn thành đủ tất cả 20 câu hỏi! Nhấn nút bên cạnh để phân tích và lưu kết quả vào hệ thống.
              </span>
            ) : (
              <span>
                Còn lại <strong>{totalQuestions - answeredCount}</strong> câu chưa trả lời. Hãy hoàn thành để nhận báo cáo chuẩn xác nhất.
              </span>
            )}
          </div>

          <button
            type="button"
            disabled={!isComplete || isSubmitting}
            onClick={handleSubmit}
            className={`w-full sm:w-auto px-8 py-4 font-display font-black text-[16px] uppercase tracking-wider rounded-xl border-[3px] border-[#111827] shadow-[4px_4px_0px_#111827] transition-all flex items-center justify-center gap-2 ${
              isComplete && !isSubmitting
                ? "bg-[#ea580c] hover:bg-[#c2410c] text-white active:translate-x-[2px] active:translate-y-[2px] active:shadow-none cursor-pointer"
                : "bg-[#e5e7eb] text-[#9ca3af] cursor-not-allowed shadow-none"
            }`}
          >
            {isSubmitting ? (
              <>
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Đang Lưu & Phân Tích...</span>
              </>
            ) : (
              <>
                <span>Xem Báo Cáo Tư Vấn Ngành Học UTC</span>
                <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

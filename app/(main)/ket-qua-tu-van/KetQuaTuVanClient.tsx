"use client";

import { useMemo, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { DisclaimerBanner } from "@/components/ui/DisclaimerBanner";
import { MBTI_PERSONALITIES, MbtiPersonality } from "../trac-nghiem-mbti/mbtiData";

interface DbMajor {
  ma_nganh: string;
  ten_nganh: string;
  khoi_kien_thuc?: string | null;
  khoi_nganh?: {
    ten_khoi_nganh: string;
  } | null;
  chuong_trinh?: Array<{
    ma_chuong_trinh: string;
    ten_chuong_trinh: string;
    lich_su_diem_chuan?: Array<{
      nam: number;
      chi_tieu: number;
      diem_trung_tuyen?: Array<{
        diem: number;
        ma_phuong_thuc: string;
      }>;
    }>;
  }>;
}

interface Props {
  dbMajors: DbMajor[];
}

export default function KetQuaTuVanClient({ dbMajors }: Props) {
  const searchParams = useSearchParams();
  const typeParam = (searchParams.get("type") || "INTJ").toUpperCase();
  const nameParam = searchParams.get("name") || "";

  const [studentName, setStudentName] = useState<string>(nameParam);
  const [completedDate, setCompletedDate] = useState<string>("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = sessionStorage.getItem("UTC_MBTI_RESULT");
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed.studentName && !studentName) {
            setStudentName(parsed.studentName);
          }
          if (parsed.completedAt) {
            const d = new Date(parsed.completedAt);
            setCompletedDate(
              d.toLocaleDateString("vi-VN", {
                hour: "2-digit",
                minute: "2-digit",
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              })
            );
          }
        }
      } catch (e) {
        // ignore
      }
    }
  }, [studentName]);

  // Lấy dữ liệu phân tích MBTI
  const personality: MbtiPersonality =
    MBTI_PERSONALITIES[typeParam] || MBTI_PERSONALITIES.INTJ;

  // Ghép nối danh sách ngành gợi ý với dữ liệu thực tế từ Database
  const matchedMajors = useMemo(() => {
    return personality.suggestedMajors.map((sug) => {
      // Tìm trong DB xem ngành có mã hoặc tên tương ứng không
      const foundInDb = dbMajors.find(
        (m) =>
          m.ma_nganh === sug.code ||
          m.ten_nganh.toLowerCase().includes(sug.name.toLowerCase()) ||
          sug.name.toLowerCase().includes(m.ten_nganh.toLowerCase())
      );

      // Điểm chuẩn tham khảo gần nhất nếu có từ DB
      let latestScore: number | null = null;
      let quota = "Chỉ tiêu mở";
      if (foundInDb && foundInDb.chuong_trinh && foundInDb.chuong_trinh.length > 0) {
        const ctdt = foundInDb.chuong_trinh[0];
        const ls = ctdt.lich_su_diem_chuan?.[0];
        if (ls) {
          quota = `${ls.chi_tieu} SV`;
          if (ls.diem_trung_tuyen && ls.diem_trung_tuyen[0]) {
            latestScore = ls.diem_trung_tuyen[0].diem;
          }
        }
      }

      return {
        ...sug,
        realId: foundInDb ? foundInDb.ma_nganh : sug.code,
        realName: foundInDb ? foundInDb.ten_nganh : sug.name,
        realFaculty: foundInDb?.khoi_nganh?.ten_khoi_nganh || sug.faculty,
        latestScore,
        quota,
      };
    });
  }, [personality, dbMajors]);

  return (
    <div className="flex flex-col w-full space-y-7 pb-16">
      {/* 1. Header Báo Cáo Phong Cách Neo-Brutalism */}
      <div className="bg-[#fffdf7] p-6 lg:p-8 border-[3px] border-[#111827] shadow-[6px_6px_0px_#111827] rounded-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-52 h-52 bg-[#fdb712]/15 rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 bg-[#0d1b4e] text-white font-stamp text-[12px] font-black border-[2px] border-[#111827] rounded-lg shadow-[2px_2px_0px_#111827]">
              KẾT QUẢ ĐỊNH HƯỚNG NGHỀ NGHIỆP
            </span>
            <span className="px-3 py-1 bg-[#fdb712] text-[#0d1b4e] font-stamp text-[12px] font-black border-[2px] border-[#111827] rounded-lg shadow-[2px_2px_0px_#111827]">
              MBTI • K66
            </span>
          </div>

          <div className="text-[12px] font-bold text-[#6b7280]">
            {completedDate ? `Hoàn thành lúc: ${completedDate}` : "Hệ thống tư vấn tuyển sinh UTC"}
          </div>
        </div>

        <h1 className="font-display font-black text-[26px] sm:text-[34px] text-[#0d1b4e] uppercase leading-tight tracking-tight">
          Báo Cáo Phân Tích Tính Cách & Tư Vấn Ngành Học UTC
        </h1>

        <p className="text-[14px] text-[#4b5563] mt-2 max-w-4xl leading-relaxed">
          Báo cáo phân tích chuyên sâu các thiên hướng tính cách, thế mạnh tư duy kỹ thuật và mô hình môi trường học tập tối ưu dành cho bạn tại Trường Đại học Giao thông Vận tải.
        </p>
      </div>

      <DisclaimerBanner />

      {/* 2. Hero Card Nhóm Tính Cách Chính */}
      <div className="bg-[#0d1b4e] text-white p-6 sm:p-8 border-[3px] border-[#111827] shadow-[6px_6px_0px_#fdb712] rounded-2xl relative overflow-hidden">
        <div className="absolute -right-8 -bottom-8 w-44 h-44 bg-[#fdb712]/10 rounded-full blur-xl pointer-events-none" />

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#fdb712] text-[#0d1b4e] rounded-md font-stamp text-[12px] font-black border border-[#111827]">
              <span className="material-symbols-outlined text-[16px]">psychology</span>
              HỒ SƠ TƯ VẤN DÀNH CHO: {studentName ? studentName.toUpperCase() : "THÍ SINH 2K8"}
            </div>

            <div className="flex flex-wrap items-baseline gap-3 pt-1">
              <h2 className="font-display font-black text-[32px] sm:text-[42px] text-white leading-tight">
                {personality.name}
              </h2>
              <span className="text-[#fdb712] font-mono text-[18px] sm:text-[22px] font-bold">
                ({personality.role})
              </span>
            </div>

            <p className="text-[14px] sm:text-[15px] text-[#dbeafe] max-w-3xl leading-relaxed pt-1">
              {personality.summary}
            </p>
          </div>

          {/* Badge MBTI 4 Chữ Cái Neo-Brutalism */}
          <div className="shrink-0 self-center md:self-auto">
            <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl bg-[#fdb712] border-[3px] border-[#111827] shadow-[4px_4px_0px_#ffffff] flex flex-col items-center justify-center text-center rotate-1 transform hover:rotate-0 transition-transform">
              <span className="font-display font-black text-[36px] sm:text-[42px] text-[#0d1b4e] leading-none tracking-tight">
                {personality.type}
              </span>
              <span className="font-stamp text-[10px] sm:text-[11px] font-black text-[#0d1b4e] uppercase mt-1">
                UTC FIT SCORE
              </span>
            </div>
          </div>
        </div>

        {/* Đặc Trưng Tính Cách Nổi Bật */}
        <div className="mt-6 pt-6 border-t border-white/15 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {personality.traits.map((trait, idx) => (
            <div
              key={idx}
              className="bg-white/10 backdrop-blur-sm px-3.5 py-2.5 rounded-xl border border-white/20 text-[12.5px] font-semibold text-[#f8fafc] flex items-center gap-2"
            >
              <span className="w-2 h-2 rounded-full bg-[#fdb712] shrink-0" />
              <span>{trait}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Môi Trường Học Tập Phù Hợp & Thế Mạnh Nổi Trội */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Môi Trường Học Tập Phù Hợp (Yêu cầu bắt buộc) */}
        <div className="lg:col-span-7 bg-white p-6 border-[3px] border-[#111827] shadow-[5px_5px_0px_#111827] rounded-2xl space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b-[2px] border-dashed border-[#e5e7eb]">
            <div className="w-9 h-9 rounded-xl bg-[#e0f2fe] border-[2px] border-[#111827] flex items-center justify-center text-[#0284c7] shadow-[2px_2px_0px_#111827]">
              <span className="material-symbols-outlined text-[20px]">school</span>
            </div>
            <div>
              <h3 className="font-display font-black text-[18px] text-[#0d1b4e] uppercase">
                Môi Trường Học Tập Phù Hợp Nhất
              </h3>
              <p className="text-[12px] text-[#6b7280]">
                Điều kiện giảng dạy & sinh hoạt giúp bạn phát huy tối đa tiềm năng tại UTC
              </p>
            </div>
          </div>

          <div className="space-y-3 pt-1">
            {personality.learningEnvironment.map((env, idx) => (
              <div
                key={idx}
                className="bg-[#fffdf7] p-4 border-[2px] border-[#111827] rounded-xl shadow-[3px_3px_0px_#111827] flex items-start gap-3"
              >
                <span className="w-6 h-6 rounded-full bg-[#0284c7] text-white font-black text-[12px] flex items-center justify-center shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <p className="text-[13.5px] text-[#1e293b] font-medium leading-relaxed">
                  {env}
                </p>
              </div>
            ))}
          </div>

          <div className="p-3.5 bg-[#f0fdf4] border-[1.5px] border-[#16a34a] rounded-xl text-[12px] text-[#166534] flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px] shrink-0">verified</span>
            <span>
              UTC cung cấp đầy đủ hệ thống phòng thí nghiệm hiện đại, trạm thực hành đường sắt, xưởng cơ khí ô tô và ký túc xá khang trang ngay tại trung tâm Hà Nội.
            </span>
          </div>
        </div>

        {/* Điểm Mạnh Kỹ Thuật & Tố Chất Cốt Lõi */}
        <div className="lg:col-span-5 bg-white p-6 border-[3px] border-[#111827] shadow-[5px_5px_0px_#111827] rounded-2xl space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b-[2px] border-dashed border-[#e5e7eb]">
            <div className="w-9 h-9 rounded-xl bg-[#fef3c7] border-[2px] border-[#111827] flex items-center justify-center text-[#d97706] shadow-[2px_2px_0px_#111827]">
              <span className="material-symbols-outlined text-[20px]">stars</span>
            </div>
            <div>
              <h3 className="font-display font-black text-[18px] text-[#0d1b4e] uppercase">
                Thế Mạnh Nổi Bật Của Bạn
              </h3>
              <p className="text-[12px] text-[#6b7280]">
                Vũ khí giúp bạn dẫn đầu trong ngành nghề tương lai
              </p>
            </div>
          </div>

          <div className="space-y-3 pt-1">
            {personality.strengths.map((str, idx) => (
              <div
                key={idx}
                className="bg-[#faf3e6] p-3.5 border-[2px] border-[#111827] rounded-xl flex items-center justify-between shadow-[2px_2px_0px_#111827]"
              >
                <div className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-[#ea580c] text-[18px]">
                    check_circle
                  </span>
                  <span className="font-display font-bold text-[14px] text-[#0d1b4e]">
                    {str}
                  </span>
                </div>
                <span className="px-2 py-0.5 bg-white text-[#0d1b4e] border border-[#111827] rounded text-[10px] font-black uppercase font-stamp">
                  ĐỘT PHÁ
                </span>
              </div>
            ))}
          </div>

          <div className="p-3.5 bg-[#fdf2f8] border-[1.5px] border-[#db2777] rounded-xl text-[12px] text-[#9d174d] flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px] shrink-0">tips_and_updates</span>
            <span>
              Hãy rèn luyện thêm kỹ năng ngoại ngữ (Tiếng Anh / Tiếng Nhật) để mở rộng cơ hội việc làm toàn cầu sau khi tốt nghiệp.
            </span>
          </div>
        </div>
      </div>

      {/* 4. DANH SÁCH NGÀNH UTC GỢI Ý (Có Link sang /tra-cuu-nganh-hoc/[id]) */}
      <div className="bg-white p-6 lg:p-8 border-[3px] border-[#111827] shadow-[6px_6px_0px_#111827] rounded-2xl space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b-[2px] border-[#111827]">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 bg-[#16a34a] text-white font-stamp text-[11px] font-black rounded-md border border-[#111827]">
                TOP LỰA CHỌN PHÙ HỢP NHẤT
              </span>
              <h3 className="font-display font-black text-[22px] sm:text-[24px] text-[#0d1b4e] uppercase">
                Ngành Học Gợi Ý Tại Trường ĐH Giao Thông Vận Tải
              </h3>
            </div>
            <p className="text-[13px] text-[#4b5563] mt-1">
              Được thuật toán đối soát dựa trên chỉ số tính cách của bạn và chương trình đào tạo thực tế tại UTC (Mã tuyển sinh GHA).
            </p>
          </div>

          <Link
            href="/tra-cuu-nganh-hoc"
            className="px-4 py-2 bg-[#faf3e6] hover:bg-[#fed7aa] text-[#0d1b4e] font-bold text-[13px] border-[2px] border-[#111827] shadow-[2px_2px_0px_#111827] rounded-xl transition-all flex items-center gap-1.5 shrink-0"
          >
            <span>Xem tất cả ngành</span>
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </Link>
        </div>

        {/* Grid Các Ngành Học Gợi Ý */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {matchedMajors.map((m, idx) => (
            <div
              key={idx}
              className="bg-[#fffdf7] border-[3px] border-[#111827] shadow-[5px_5px_0px_#111827] rounded-2xl p-5 flex flex-col justify-between hover:-translate-y-1 hover:shadow-[7px_7px_0px_#111827] transition-all relative overflow-hidden"
            >
              {/* Top Tag & Mã Ngành */}
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <span className="px-2.5 py-0.5 bg-[#0d1b4e] text-white font-stamp text-[11px] font-black rounded-md border border-[#111827]">
                    MÃ: {m.realId}
                  </span>
                  <span className="px-2.5 py-0.5 bg-[#86efac] text-[#065f46] font-stamp text-[11px] font-black rounded-md border border-[#111827] shadow-[1px_1px_0px_#111827]">
                    {m.tag}
                  </span>
                </div>

                <div className="text-[11px] font-bold text-[#0284c7] uppercase mb-1">
                  {m.realFaculty}
                </div>

                <h4 className="font-display font-black text-[18px] text-[#0d1b4e] leading-snug mb-2.5 min-h-[44px]">
                  {m.realName}
                </h4>

                {/* Lý Do Phù Hợp */}
                <div className="bg-white p-3 rounded-xl border-[1.5px] border-[#111827] mb-4 text-[12px] text-[#4b5563] leading-relaxed">
                  <span className="font-bold text-[#0d1b4e] block mb-0.5">
                    💡 Vì sao ngành này hợp với bạn:
                  </span>
                  {m.matchReason}
                </div>
              </div>

              {/* Thông tin Chỉ tiêu / Điểm Chuẩn & Nút Chi Tiết */}
              <div className="pt-3 border-t-[1.5px] border-dashed border-[#d1d5db]">
                <div className="flex items-center justify-between mb-3 text-[12px]">
                  <span className="text-[#6b7280] font-medium">Điểm chuẩn tham khảo:</span>
                  <span className="font-display font-black text-[15px] text-[#dc2626]">
                    {m.latestScore ? `${m.latestScore.toFixed(2)} đ` : "Đang cập nhật"}
                  </span>
                </div>

                <Link
                  href={`/tra-cuu-nganh-hoc/${encodeURIComponent(m.realId)}`}
                  className="w-full py-2.5 bg-[#0284c7] hover:bg-[#0369a1] text-white font-extrabold text-[13px] border-[2px] border-[#111827] shadow-[3px_3px_0px_#111827] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none rounded-xl transition-all flex items-center justify-center gap-1.5 uppercase tracking-wide"
                >
                  <span>Xem Chi Tiết Ngành & Khung CTĐT</span>
                  <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. CÁC NÚT ĐIỀU HƯỚNG & HÀNH ĐỘNG (Có Nút "Làm lại" về /mbti) */}
      <div className="bg-[#fffbeb] p-6 border-[3px] border-[#111827] shadow-[5px_5px_0px_#111827] rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center sm:text-left">
          <h4 className="font-display font-black text-[16px] text-[#0d1b4e] uppercase">
            Bạn muốn kiểm tra lại hoặc thử một lượt làm mới?
          </h4>
          <p className="text-[13px] text-[#6b7280]">
            Bạn có thể làm lại bài trắc nghiệm bất cứ lúc nào hoặc chuyển sang công cụ tính điểm quy đổi xét tuyển.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto justify-center">
          {/* NÚT LÀM LẠI VỀ /mbti (theo yêu cầu bắt buộc của user) */}
          <Link
            href="/mbti"
            className="w-full sm:w-auto px-6 py-3 bg-white hover:bg-[#f3f4f6] text-[#0d1b4e] font-black text-[14px] border-[2.5px] border-[#111827] shadow-[3px_3px_0px_#111827] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none rounded-xl transition-all flex items-center justify-center gap-2 uppercase font-display"
          >
            <span className="material-symbols-outlined text-[18px]">replay</span>
            <span>Làm Lại Bài Trắc Nghiệm</span>
          </Link>

          {/* NÚT TÍNH ĐIỂM QUY ĐỔI */}
          <Link
            href="/tinh-diem-quy-doi"
            className="w-full sm:w-auto px-6 py-3 bg-[#fdb712] hover:bg-[#e2a20a] text-[#0d1b4e] font-black text-[14px] border-[2.5px] border-[#111827] shadow-[3px_3px_0px_#111827] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none rounded-xl transition-all flex items-center justify-center gap-2 uppercase font-display"
          >
            <span className="material-symbols-outlined text-[18px]">calculate</span>
            <span>Tính Điểm Quy Đổi K66</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

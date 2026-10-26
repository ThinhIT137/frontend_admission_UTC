"use client";

import { Fragment, useState, useMemo, useEffect, useRef } from "react";
import { motion } from "motion/react";
import { api, BrowserApiError } from "@/libs/api-services/browser-api";
import { comparePrograms, yearReferenceAvailability, type CalculationSnapshot, type AiBenchmark } from "./comparison";
import { loadAiBenchmarks } from "./ai-benchmarks";
import { useLoading } from "@/contexts/loadingContext";
import Link from "next/link";
import { DisclaimerBanner } from "@/components/ui/DisclaimerBanner";
import AdmissionLikelihood from "./AdmissionLikelihood";


export interface ProgramScoreItem {
  ma_chuong_trinh: string;
  ten_chuong_trinh: string;
  ma_nganh: string;
  nganh?: {
    ma_nganh: string;
    ten_nganh: string;
    khoi_kien_thuc?: string | null;
    khoi_nganh?: {
      ma_khoi_nganh: string;
      ten_khoi_nganh: string;
    } | null;
  } | null;
  ctdt_to_hop?: Array<{
    nam?: number;
    ma_to_hop: string;
    to_hop?: {
      ma_to_hop: string;
      mon_1?: { ten_mon: string };
      mon_2?: { ten_mon: string };
      mon_3?: { ten_mon: string };
    } | null;
  }>;
  lich_su_diem_chuan?: Array<{
    nam: number;
    chi_tieu: number;
    diem_trung_tuyen: Array<{
      diem: number;
      ma_phuong_thuc: string;
      dieu_kien_mon?: unknown;
      diem_uu_tien_toi_thieu?: number | null;
      nguyen_vong_toi_da?: number | null;
      phuong_thuc?: {
        ma_phuong_thuc: string;
        ten_phuong_thuc: string;
      } | null;
    }>;
  }>;
}

export interface ToHopItem {
  ma_to_hop: string;
  ma_mon_1: string;
  ma_mon_2: string;
  ma_mon_3: string;
  mon_1?: { ten_mon: string };
  mon_2?: { ten_mon: string };
  mon_3?: { ten_mon: string };
}

interface Props {
  initialPrograms: ProgramScoreItem[];
  initialToHops: ToHopItem[];
  referenceYear?: number;
}

export default function TinhDiemQuyDoiClient({ initialPrograms, initialToHops, referenceYear = new Date().getFullYear() }: Props) {
  // Phương thức xét tuyển đang chọn
  // 1: Điểm thi tốt nghiệp THPT (Mã 100)
  // 2: Điểm học bạ THPT (Mã 200)
  // 3: Kết hợp Chứng chỉ Quốc tế + THPT (Mã 402)
  // 4: Đánh giá Năng lực HSA / Tư duy TSA (Mã 405)
  const [methodTab, setMethodTab] = useState<"THPT" | "HOC_BA" | "CHUNG_CHI" | "DGNL">("THPT");

  // Danh sách tổ hợp
  const combinations = initialToHops;
  const [selectedToHop, setSelectedToHop] = useState<string>(initialToHops[0]?.ma_to_hop ?? "");

  const currentCombination = useMemo(() => {
    return combinations.find((c) => c.ma_to_hop === selectedToHop) || combinations[0];
  }, [combinations, selectedToHop]);

  // Tên 3 môn của tổ hợp hiện tại
  const m1Name = currentCombination?.mon_1?.ten_mon || currentCombination?.ma_mon_1 || "Môn 1";
  const m2Name = currentCombination?.mon_2?.ten_mon || currentCombination?.ma_mon_2 || "Môn 2";
  const m3Name = currentCombination?.mon_3?.ten_mon || currentCombination?.ma_mon_3 || "Môn 3";

  // Điểm thành phần các môn thi
  const [m1Score, setM1Score] = useState<number | "">("");
  const [m2Score, setM2Score] = useState<number | "">("");
  const [m3Score, setM3Score] = useState<number | "">("");

  // Điểm Chứng chỉ Quốc tế (PT 402)
  const [certType, setCertType] = useState<"IELTS" | "TOEFL" | "SAT">("IELTS");
  const [certScore, setCertScore] = useState<number | "">("");
  const [certM2Score, setCertM2Score] = useState<number | "">(""); // Môn thứ 2 (Lý/Hóa/Văn...)

  // Điểm Kỳ thi ĐGNL / ĐGTD (PT 405)
  const [dgnlType, setDgnlType] = useState<"HSA" | "TSA">("HSA");
  const [dgnlScore, setDgnlScore] = useState<number | "">("");

  // Điểm ưu tiên
  const [region, setRegion] = useState<"KV3" | "KV2" | "KV2-NT" | "KV1">("KV2");
  const [priorityObj, setPriorityObj] = useState<"NONE" | "UT1" | "UT2">("NONE");

  // Kết quả tính toán
  const [calculationResult, setCalculationResult] = useState<CalculationSnapshot | null>(null);

  const [errorMessage, setErrorMessage] = useState("");

  // Bộ lọc bảng so sánh ngành
  const [searchMajorText, setSearchMajorText] = useState("");
  const [filterChance, setFilterChance] = useState<"all" | "high" | "medium" | "low">("all");
  const [expandedProgram, setExpandedProgram] = useState<string | null>(null);
  const toggleProgram = (key: string) => setExpandedProgram(current => current === key ? null : key);
  const availableYears = [...new Set([referenceYear, ...initialPrograms.flatMap(program => [
    ...(program.lich_su_diem_chuan ?? []).map(history => history.nam),
  ])].filter(year => Number.isInteger(year) && year > 0))].sort((a, b) => b - a);
  // A future catalog entry must not silently move the calculator away from this year.
  const [compareYear, setCompareYear] = useState<number>(referenceYear);

  const calculationYear = referenceYear;
  const referenceAvailability = useMemo(
    () => yearReferenceAvailability(initialPrograms, compareYear),
    [initialPrograms, compareYear],
  );
  const referenceHeading = referenceAvailability.official === referenceAvailability.total && referenceAvailability.official > 0
    ? "Điểm chuẩn" : referenceAvailability.official > 0 ? "Điểm tham chiếu" : "Dự đoán";
  // API hiện cung cấp bộ dự đoán 2026. Không gọi khi đã đủ điểm chính thức,
  // không lấy dự đoán 2026 để thay cho một năm khác.
  const needsAiPrediction = compareYear === 2026 && referenceAvailability.missing > 0;
  const [aiBenchmarks, setAiBenchmarks] = useState<AiBenchmark[]>([]);
  const [aiError, setAiError] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiAttempt, setAiAttempt] = useState(0);
  useEffect(() => {
    if (!needsAiPrediction) {
      setAiError(false); setAiLoading(false);
      return;
    }
    let active = true;
    setAiError(false); setAiLoading(true);
    loadAiBenchmarks().then(data => { if (active) setAiBenchmarks(data); })
      .catch(() => { if (active) setAiError(true); })
      .finally(() => { if (active) setAiLoading(false); });
    return () => { active = false; };
  }, [needsAiPrediction, aiAttempt]);
  const matchedPrograms = useMemo(
    () => calculationResult ? comparePrograms(initialPrograms, calculationResult, compareYear, aiBenchmarks) : [],
    [initialPrograms, calculationResult, compareYear, aiBenchmarks],
  );
  const [busy, setBusy] = useState(false);
  const { beginLoading } = useLoading();
  const requestId = useRef(0);
  const releaseLoading = useRef<(() => void) | null>(null);
  // Any input change invalidates the result; a late response cannot restore stale scores.
  useEffect(() => {
    requestId.current += 1;
    releaseLoading.current?.(); releaseLoading.current = null;
    setBusy(false); setCalculationResult(null); setErrorMessage("");
    return () => { requestId.current += 1; releaseLoading.current?.(); };
  }, [methodTab, selectedToHop, m1Score, m2Score, m3Score, certType, certScore, certM2Score, dgnlType, dgnlScore, region, priorityObj, calculationYear]);

  const handleCalculate = async () => {
    if (busy) return;
    if (!currentCombination) {
      setErrorMessage("Chưa tải được tổ hợp môn từ database. Vui lòng tải lại trang.");
      return;
    }
    const subjectInputs = methodTab === "DGNL" ? [0, 0, 0] : methodTab === "CHUNG_CHI" ? [m1Score, certM2Score, 0] : [m1Score, m2Score, m3Score];
    if (subjectInputs.some(value => value === "" || !Number.isFinite(Number(value)) || Number(value) < 0 || Number(value) > 10)
        || (methodTab === "DGNL" && (dgnlScore === "" || !Number.isFinite(Number(dgnlScore))))
        || (methodTab === "CHUNG_CHI" && (certScore === "" || !Number.isFinite(Number(certScore))))) {
      setErrorMessage("Vui lòng nhập đủ điểm hợp lệ trước khi đối soát."); return;
    }
    const id = ++requestId.current;
    const release = beginLoading(); releaseLoading.current = release;
    setBusy(true); setErrorMessage(""); setCalculationResult(null); setFilterChance("all");
    try {
      const result = await api<{ calculation: Omit<CalculationSnapshot, "subjects" | "calculationYear"> }>("score", "/diem/tinh-diem-doi-soat", {
        method: methodTab, year: calculationYear, combination: selectedToHop, scores: subjectInputs.map(Number),
        region, priority: priorityObj, exam: dgnlType, exam_score: Number(dgnlScore || 0),
        certificate: certType, certificate_score: Number(certScore || 0),
      });
      if (id !== requestId.current) return;
      if (!result?.calculation) throw new Error("Missing calculation");
      // Ignore legacy backend program rows: comparison is derived locally from SSR data.
      setCalculationResult({ ...result.calculation, calculationYear,
        subjects: methodTab === "DGNL" || methodTab === "CHUNG_CHI" ? [] : subjectInputs.map((score, index) => ({
          code: [currentCombination?.ma_mon_1, currentCombination?.ma_mon_2, currentCombination?.ma_mon_3][index] ?? "",
          name: [m1Name, m2Name, m3Name][index], score: Number(score),
        })),
      });
    } catch (error) {
      if (id === requestId.current) setErrorMessage(error instanceof BrowserApiError && error.status === 404
        ? "Backend điểm đang chạy phiên bản chưa có API tính điểm và đối soát. Cần triển khai phiên bản mới có /diem/tinh-diem-doi-soat rồi thử lại."
        : error instanceof BrowserApiError && [400, 422].includes(error.status)
          ? "Dữ liệu điểm hoặc tổ hợp chưa hợp lệ. Kiểm tra điểm môn, năm và phương thức rồi thử lại."
          : "Dịch vụ điểm đang không khả dụng hoặc phản hồi quá lâu. Vui lòng thử lại sau.");
    } finally {
      release();
      if (id === requestId.current) { setBusy(false); releaseLoading.current = null; }
    }
  };

  // Lọc ngành theo tìm kiếm và trạng thái cơ hội
  const filteredMatchedPrograms = useMemo(() => {
    return matchedPrograms.filter((p) => {
      const matchSearch =
        !searchMajorText.trim() ||
        p.ten_nganh.toLowerCase().includes(searchMajorText.toLowerCase()) ||
        p.ten_chuong_trinh.toLowerCase().includes(searchMajorText.toLowerCase()) ||
        p.ma_chuong_trinh.toLowerCase().includes(searchMajorText.toLowerCase()) ||
        p.ma_nganh.toLowerCase().includes(searchMajorText.toLowerCase()) ||
        p.sourceCodes.some(code => code.toLowerCase().includes(searchMajorText.toLowerCase()));

      const matchChance = filterChance === "all" || p.pointBand === filterChance;
      return matchSearch && matchChance;
    });
  }, [matchedPrograms, searchMajorText, filterChance]);

  // Thống kê nhanh cơ hội
  const highChanceCount = matchedPrograms.filter((p) => p.pointBand === "high").length;
  const mediumChanceCount = matchedPrograms.filter((p) => p.pointBand === "medium").length;
  const lowChanceCount = matchedPrograms.filter((p) => p.pointBand === "low").length;
  const unclassifiedCount = matchedPrograms.filter((p) => !p.pointBand).length;
  const ineligibleCount = matchedPrograms.filter((p) => p.chance === "ineligible").length;
  const unverifiedCount = matchedPrograms.filter((p) => p.chance === "unknown").length;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col w-full space-y-7 pb-16 text-[#14264d]">
      {/* Backend chỉ tính điểm; bảng đối soát và thống kê được tính ngay ở Next.js. */}
      <div className="bg-gradient-to-br from-[#14264d] to-[#253e78] p-6 lg:p-8 border border-slate-200 shadow-sm rounded-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-[#fdb712]/15 rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className="px-3 py-1 bg-[#0d1b4e] text-white font-stamp text-[12px] font-black border border-slate-200 rounded-lg shadow-[2px_2px_0px_#111827]">
            CÔNG CỤ TUYỂN SINH K66
          </span>
          <span className="px-3 py-1 bg-[#fdb712] text-[#0d1b4e] font-stamp text-[12px] font-black border border-slate-200 rounded-lg shadow-[2px_2px_0px_#111827]">
            MÃ TRƯỜNG: GHA
          </span>
          <span className="px-3 py-1 bg-[#e0f2fe] text-[#0369a1] font-bold text-[12px] border-[1.5px] border-[#111827] rounded-lg">
            Công cụ tham khảo · Kiểm tra đề án theo năm
          </span>
        </div>

        <h1 className="font-display font-black text-[26px] sm:text-[32px] text-white leading-tight tracking-tight">
          Tính Điểm Quy Đổi & Đối Soát Cơ Hội Trúng Tuyển UTC
        </h1>

        <p className="text-[13.5px] text-blue-100 mt-2 max-w-4xl leading-relaxed">
          Nhập điểm để quy đổi sang thang THPT. Bảng bên dưới so sánh ngay với điểm chuẩn đã công bố hoặc ước tính AI cùng năm; đổi năm, tìm kiếm và lọc nhóm không cần tính lại điểm.
        </p>
        <p className="mt-3 text-xs text-blue-100">Năm tính và quy đổi điểm: {calculationYear}. Năm đối soát trong bảng được chọn riêng.</p>
      </div>

      {/* 2. DISCLAIMER LỚN – BẮT BUỘC & RÕ RÀNG */}
      <div className="bg-[#fffbeb] p-5 sm:p-6 border border-slate-200 shadow-sm rounded-2xl space-y-2">
        <div className="flex items-center gap-2 text-[#b45309]">
          <span className="material-symbols-outlined text-[26px] font-black">gavel</span>
          <h2 className="font-display font-black text-[16px] sm:text-[18px] uppercase tracking-wide">
            LƯU Ý QUAN TRỌNG: KẾT QUẢ QUY ĐỔI VÀ ĐỐI SOÁT CHỈ MANG TÍNH THAM KHẢO
          </h2>
        </div>
        <p className="text-[13px] text-[#78350f] leading-relaxed">
          Mọi kết quả điểm số và phân loại cơ hội trúng tuyển tại công cụ này được tính toán dựa trên đề án tuyển sinh và dữ liệu điểm chuẩn trúng tuyển của các năm tuyển sinh trước nhằm giúp thí sinh định hướng việc sắp xếp nguyện vọng. Điểm chuẩn chính thức năm 2026 sẽ phụ thuộc vào số lượng thí sinh đăng ký, phổ điểm thi thực tế của Bộ GD&ĐT và chỉ tiêu do Hội đồng Tuyển sinh Trường Đại học Giao thông Vận tải phê duyệt. Nguồn thông tin pháp lý chính thức và duy nhất được công bố tại website:{" "}
          <a
            href="https://tuyensinh.utc.edu.vn"
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold underline text-[#92400e] hover:text-[#b45309]"
          >
            tuyensinh.utc.edu.vn
          </a>.
        </p>
      </div>

      {/* 3. BỐ CỤC CHÍNH: FORM NHẬP ĐIỂM (7 CỘT) + KẾT QUẢ QUY ĐỔI (5 CỘT) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-start">
        {/* CỘT TRÁI (7 CỘT): FORM NHẬP ĐIỂM CHUYÊN SÂU */}
        <div className="lg:col-span-7 bg-white p-6 sm:p-7 border border-slate-200 shadow-sm rounded-2xl space-y-6">
          {/* Thanh chọn 4 Phương thức tuyển sinh */}
          <div>
            <span className="text-[12px] font-black uppercase text-[#6b7280] block mb-2 font-stamp">
              Bước 1: Chọn Phương Thức Xét Tuyển Muốn Tính
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => setMethodTab("THPT")}
                className={`py-2.5 px-3 rounded-xl border border-slate-200 text-[12px] font-black uppercase transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${
                  methodTab === "THPT"
                    ? "bg-[#0284c7] text-white shadow-[3px_3px_0px_#111827] translate-x-[-1px] translate-y-[-1px]"
                    : "bg-white text-[#1f2937] hover:bg-slate-50"
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">school</span>
                <span>Thi THPT (100)</span>
              </button>

              <button
                type="button"
                onClick={() => setMethodTab("HOC_BA")}
                className={`py-2.5 px-3 rounded-xl border border-slate-200 text-[12px] font-black uppercase transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${
                  methodTab === "HOC_BA"
                    ? "bg-[#0284c7] text-white shadow-[3px_3px_0px_#111827] translate-x-[-1px] translate-y-[-1px]"
                    : "bg-white text-[#1f2937] hover:bg-slate-50"
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">menu_book</span>
                <span>Học Bạ (200)</span>
              </button>

              <button
                type="button"
                onClick={() => setMethodTab("CHUNG_CHI")}
                className={`py-2.5 px-3 rounded-xl border border-slate-200 text-[12px] font-black uppercase transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${
                  methodTab === "CHUNG_CHI"
                    ? "bg-[#0284c7] text-white shadow-[3px_3px_0px_#111827] translate-x-[-1px] translate-y-[-1px]"
                    : "bg-white text-[#1f2937] hover:bg-slate-50"
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">verified</span>
                <span>Chứng Chỉ (402)</span>
              </button>

              <button
                type="button"
                onClick={() => setMethodTab("DGNL")}
                className={`py-2.5 px-3 rounded-xl border border-slate-200 text-[12px] font-black uppercase transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${
                  methodTab === "DGNL"
                    ? "bg-[#0284c7] text-white shadow-[3px_3px_0px_#111827] translate-x-[-1px] translate-y-[-1px]"
                    : "bg-white text-[#1f2937] hover:bg-slate-50"
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">psychology</span>
                <span>ĐGNL/ĐGTD (405)</span>
              </button>
            </div>
          </div>

          <div className="border-t-[2px] border-dashed border-[#d1d5db] pt-5 space-y-5">
            {/* Form trường hợp 1: Thi THPT hoặc Học bạ */}
            {(methodTab === "THPT" || methodTab === "HOC_BA") && (
              <>
                <div>
                  <label className="block text-[13px] font-black text-[#0d1b4e] mb-1.5 uppercase">
                    Chọn Tổ Hợp Môn Xét Tuyển:
                  </label>
                  <select
                    value={selectedToHop}
                    onChange={(e) => setSelectedToHop(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl font-bold text-[13.5px] text-[#0d1b4e] outline-none shadow-xs cursor-pointer"
                  >
                    {combinations.map((c) => (
                      <option key={c.ma_to_hop} value={c.ma_to_hop}>
                        Tổ hợp {c.ma_to_hop}: {c.mon_1?.ten_mon || c.ma_mon_1} - {c.mon_2?.ten_mon || c.ma_mon_2} - {c.mon_3?.ten_mon || c.ma_mon_3}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <span className="block text-[13px] font-black text-[#0d1b4e] mb-2 uppercase">
                    Nhập Điểm {methodTab === "THPT" ? "Thi Tốt Nghiệp THPT" : "Học Bạ THPT (Thang 10)"}:
                  </span>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-white p-3 border border-slate-200 rounded-xl shadow-xs">
                      <label className="block text-[11.5px] font-bold text-[#64748b] truncate mb-1" title={m1Name}>
                        {m1Name}
                      </label>
                      <input
                        type="number"
                        step="0.05"
                        min="0"
                        max="10"
                        value={m1Score}
                        onChange={(e) => setM1Score(e.target.value === "" ? "" : Number(e.target.value))}
                        className="w-full text-center font-display font-black text-[20px] text-[#0d1b4e] bg-slate-50 rounded-lg py-1 border border-[#cbd5e1] outline-none"
                      />
                    </div>

                    <div className="bg-white p-3 border border-slate-200 rounded-xl shadow-xs">
                      <label className="block text-[11.5px] font-bold text-[#64748b] truncate mb-1" title={m2Name}>
                        {m2Name}
                      </label>
                      <input
                        type="number"
                        step="0.05"
                        min="0"
                        max="10"
                        value={m2Score}
                        onChange={(e) => setM2Score(e.target.value === "" ? "" : Number(e.target.value))}
                        className="w-full text-center font-display font-black text-[20px] text-[#0d1b4e] bg-slate-50 rounded-lg py-1 border border-[#cbd5e1] outline-none"
                      />
                    </div>

                    <div className="bg-white p-3 border border-slate-200 rounded-xl shadow-xs">
                      <label className="block text-[11.5px] font-bold text-[#64748b] truncate mb-1" title={m3Name}>
                        {m3Name}
                      </label>
                      <input
                        type="number"
                        step="0.05"
                        min="0"
                        max="10"
                        value={m3Score}
                        onChange={(e) => setM3Score(e.target.value === "" ? "" : Number(e.target.value))}
                        className="w-full text-center font-display font-black text-[20px] text-[#0d1b4e] bg-slate-50 rounded-lg py-1 border border-[#cbd5e1] outline-none"
                      />
                    </div>
                  </div>

                  <p className="text-[11.5px] text-[#6b7280] italic mt-1.5">
                    * Lưu ý sơ bộ UTC: Điểm thi môn Toán kỳ thi tốt nghiệp THPT phải đạt từ <strong>5.0 điểm</strong> trở lên.
                  </p>
                </div>
              </>
            )}

            {/* Form trường hợp 2: Chứng chỉ Quốc tế (PT 402) */}
            {methodTab === "CHUNG_CHI" && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-[12.5px] font-black text-[#0d1b4e] mb-1 uppercase">
                      Loại Chứng Chỉ Quốc Tế:
                    </label>
                    <select
                      value={certType}
                      onChange={(e) => setCertType(e.target.value as any)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-bold text-[13px] text-[#0d1b4e] outline-none cursor-pointer"
                    >
                      <option value="IELTS">IELTS Academic (Thang 9.0)</option>
                      <option value="TOEFL">TOEFL iBT (Thang 120)</option>
                      <option value="SAT">SAT General Test (Thang 1600)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[12.5px] font-black text-[#0d1b4e] mb-1 uppercase">
                      Điểm Chứng Chỉ Đạt Được:
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step={certType === "SAT" ? "10" : "0.5"}
                        placeholder={certType === "SAT" ? "Ví dụ: 1250" : "Ví dụ: 6.5"}
                        value={certScore}
                        onChange={(e) => setCertScore(e.target.value === "" ? "" : Number(e.target.value))}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-display font-black text-[16px] text-[#0d1b4e] outline-none"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-bold text-[#0284c7]">
                        Dịch vụ điểm kiểm tra cấu hình quy đổi theo năm
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-[#e0f2fe] border-[1.5px] border-[#0284c7] rounded-xl text-[12px] text-[#0369a1] space-y-1">
                  <p className="font-bold flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px]">info</span>
                    Bảng quy đổi điểm IELTS của UTC sang môn Tiếng Anh:
                  </p>
                  <p className="text-[11.5px] leading-snug">
                    IELTS 5.0 → 8.0 đ | IELTS 5.5 → 8.5 đ | IELTS 6.0 → 9.0 đ | IELTS 6.5 → 9.5 đ | IELTS ≥ 7.0 → 10.0 đ
                  </p>
                </div>

                <div>
                  <span className="block text-[12.5px] font-black text-[#0d1b4e] mb-2 uppercase">
                    Điểm 2 Môn Thi Tốt Nghiệp THPT Còn Lại Trong Tổ Hợp:
                  </span>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white p-3 border border-slate-200 rounded-xl">
                      <label className="block text-[11.5px] font-bold text-[#64748b] mb-1">
                        Môn Toán (Bắt buộc)
                      </label>
                      <input
                        type="number"
                        step="0.05"
                        min="0"
                        max="10"
                        value={m1Score}
                        onChange={(e) => setM1Score(e.target.value === "" ? "" : Number(e.target.value))}
                        className="w-full text-center font-display font-black text-[18px] text-[#0d1b4e] bg-slate-50 rounded-lg py-1 border border-[#cbd5e1] outline-none"
                      />
                    </div>

                    <div className="bg-white p-3 border border-slate-200 rounded-xl">
                      <label className="block text-[11.5px] font-bold text-[#64748b] mb-1">
                        Môn Thứ 2 (Vật lý / Hóa học / Văn)
                      </label>
                      <input
                        type="number"
                        step="0.05"
                        min="0"
                        max="10"
                        value={certM2Score}
                        onChange={(e) => setCertM2Score(e.target.value === "" ? "" : Number(e.target.value))}
                        className="w-full text-center font-display font-black text-[18px] text-[#0d1b4e] bg-slate-50 rounded-lg py-1 border border-[#cbd5e1] outline-none"
                      />
                    </div>
                  </div>
                  <p className="text-[11.5px] text-[#6b7280] italic mt-1.5">
                    * Điều kiện: Tổng 2 môn thi THPT ≥ 12.0 điểm và môn Toán ≥ 5.0 điểm.
                  </p>
                </div>
              </div>
            )}

            {/* Form trường hợp 3: Đánh giá Năng lực HSA / TSA (PT 405) */}
            {methodTab === "DGNL" && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-[12.5px] font-black text-[#0d1b4e] mb-1 uppercase">
                      Kỳ Thi Đánh Giá:
                    </label>
                    <select
                      value={dgnlType}
                      onChange={(e) => setDgnlType(e.target.value as any)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-bold text-[13px] text-[#0d1b4e] outline-none cursor-pointer"
                    >
                      <option value="HSA">ĐGNL ĐHQG Hà Nội (HSA - Thang 150)</option>
                      <option value="TSA">ĐGTD ĐH Bách Khoa (TSA - Thang 100)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[12.5px] font-black text-[#0d1b4e] mb-1 uppercase">
                      Điểm Đạt Được:
                    </label>
                    <input
                      type="number"
                      step="1"
                      placeholder={dgnlType === "HSA" ? "Ví dụ: 95" : "Ví dụ: 68"}
                      value={dgnlScore}
                      onChange={(e) => setDgnlScore(e.target.value === "" ? "" : Number(e.target.value))}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-display font-black text-[18px] text-[#0d1b4e] outline-none text-center"
                    />
                  </div>
                </div>

                <div className="p-3 bg-[#fef3c7] border-[1.5px] border-[#f59e0b] rounded-xl text-[12px] text-[#92400e] space-y-1 leading-snug">
                  <p className="font-bold">Công thức quy đổi chuẩn thang 30 tại UTC:</p>
                  {dgnlType === "HSA" ? (
                    <p>
                      Điểm xét tuyển = (Điểm HSA ÷ 150) × 30 + Điểm ưu tiên. Ngưỡng nhận hồ sơ tối thiểu: <strong>75/150 điểm</strong>.
                    </p>
                  ) : (
                    <p>
                      Điểm xét tuyển = (Điểm TSA ÷ 100) × 30 + Điểm ưu tiên. Ngưỡng nhận hồ sơ tối thiểu: <strong>50/100 điểm</strong>.
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Bước 2: Khu vực & Đối tượng ưu tiên */}
            <div className="border-t-[2px] border-dashed border-[#d1d5db] pt-4">
              <span className="text-[12px] font-black uppercase text-[#6b7280] block mb-2 font-stamp">
                Bước 2: Chọn Diện Ưu Tiên (Bộ GD&ĐT)
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[12px] font-bold text-[#0d1b4e] mb-1">
                    Khu Vực Ưu Tiên
                  </label>
                  <select
                    value={region}
                    onChange={(e) => setRegion(e.target.value as any)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-bold text-[12.5px] text-[#0d1b4e] outline-none cursor-pointer"
                  >
                    <option value="KV3">Khu vực 3 (+0.0 điểm)</option>
                    <option value="KV2">Khu vực 2 (+0.25 điểm)</option>
                    <option value="KV2-NT">Khu vực 2 - Nông thôn (+0.50 điểm)</option>
                    <option value="KV1">Khu vực 1 (+0.75 điểm)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[12px] font-bold text-[#0d1b4e] mb-1">
                    Đối Tượng Ưu Tiên
                  </label>
                  <select
                    value={priorityObj}
                    onChange={(e) => setPriorityObj(e.target.value as any)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-bold text-[12.5px] text-[#0d1b4e] outline-none cursor-pointer"
                  >
                    <option value="NONE">Không thuộc đối tượng ưu tiên (+0.0 đ)</option>
                    <option value="UT1">Đối tượng 01 - 04 (+2.0 điểm)</option>
                    <option value="UT2">Đối tượng 05 - 07 (+1.0 điểm)</option>
                  </select>
                </div>
              </div>

              <p className="text-[11px] text-[#767680] italic mt-2">
                * Áp dụng quy chế giảm dần điểm ưu tiên của Bộ GD&ĐT: Khi tổng điểm xét tuyển từ <strong>22.5 điểm</strong> trở lên, mức điểm ưu tiên sẽ giảm tuyến tính theo công thức: <code>Điểm UT = [(30 - Tổng điểm)/7.5] × Mức ưu tiên</code>.
              </p>
            </div>

            {/* Thông báo lỗi nếu có */}
            {errorMessage && (
              <div className="p-3 bg-[#fee2e2] border-[2px] border-[#ef4444] text-[#b91c1c] font-bold text-[12.5px] rounded-xl flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">error</span>
                {errorMessage}
              </div>
            )}

            {/* Nút bấm Tính điểm */}
            <button
              type="button"
              onClick={handleCalculate}
              disabled={busy}
              aria-busy={busy}
              className="w-full py-3.5 px-6 bg-[#ea8609] hover:bg-[#cc7005] text-white font-black text-[15px] sm:text-[16px] border border-slate-200 rounded-xl shadow-sm active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all uppercase tracking-wide cursor-pointer flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-[20px]">calculate</span>
              <span>{busy ? "Đang tính và đối soát…" : "Tính Điểm Quy Đổi & Đối Soát Ngành Ngay"}</span>
            </button>
          </div>
        </div>

        {/* CỘT PHẢI (5 CỘT): KẾT QUẢ QUY ĐỔI & PHÂN TÍCH */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-6 sm:p-7 border border-slate-200 shadow-sm rounded-2xl relative space-y-4">
            <div className="border-b-[2px] border-[#111827] pb-3">
              <span className="font-stamp text-[11px] font-bold text-[#6b7280] uppercase tracking-wider block">
                Kết Quả Xét Tuyển Dự Kiến
              </span>
              <h3 className="font-display font-black text-[20px] text-[#0d1b4e] uppercase">
                Tổng Điểm Xét Tuyển
              </h3>
            </div>

            {calculationResult ? (
              <div className="space-y-4 animate-in fade-in duration-200">
                {/* Thẻ điểm to nổi bật */}
                <div className="bg-[#0d1b4e] text-white p-5 rounded-2xl border border-slate-200 shadow-[4px_4px_0px_#fdb712] text-center space-y-1">
                  <span className="text-[11.5px] font-stamp text-[#fdb712] uppercase tracking-wider block">
                    ĐIỂM XÉT TUYỂN THAM KHẢO (THANG 30)
                  </span>
                  <div className="font-display font-black text-[48px] sm:text-[54px] text-white leading-none">
                    {(calculationResult.finalScore == null ? "Chưa có cấu hình" : calculationResult.finalScore.toFixed(2))}
                  </div>
                  <span className="text-[11.5px] text-[#93c5fd] block pt-1">
                    (Đã cộng {calculationResult.priorityBonus.toFixed(2)} đ ưu tiên sau giảm dần)
                  </span>
                </div>

                {/* Bảng phân rã điểm thành phần */}
                <div className="p-3.5 bg-white border border-slate-200 rounded-xl space-y-2 text-[12.5px] shadow-xs">
                  <div className="flex items-center justify-between font-bold text-[#0d1b4e] border-b border-dashed border-[#e2e8f0] pb-1.5">
                    <span>Tổng điểm gốc chưa ưu tiên:</span>
                    <span className="font-display font-black text-[15px]">{calculationResult.rawScore.toFixed(2)} đ</span>
                  </div>

                  {calculationResult.subDetails.map((sub, sIdx) => (
                    <div key={sIdx} className="flex items-center justify-between text-[#4b5563]">
                      <span>{sub.label}:</span>
                      <span className="font-semibold text-[#111827]">{sub.score}</span>
                    </div>
                  ))}

                  <div className="flex items-center justify-between text-[#b45309] font-bold pt-1 border-t border-dashed border-[#e2e8f0]">
                    <span>Điểm ưu tiên thực nhận:</span>
                    <span>+{calculationResult.priorityBonus.toFixed(2)} đ (Trần: {calculationResult.maxPriority} đ)</span>
                  </div>
                </div>

                {/* Đánh giá điều kiện sàn */}
                {calculationResult.preliminaryNotes.length > 0 && (
                  <div className="p-3 bg-[#fffbeb] border-[1.5px] border-[#f59e0b] rounded-xl text-[12px] text-[#92400e] space-y-1">
                    <span className="font-bold block flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px]">warning</span>
                      Lưu ý điều kiện sơ bộ UTC:
                    </span>
                    <ul className="list-disc pl-4 space-y-0.5 text-[11.5px]">
                      {calculationResult.preliminaryNotes.map((note, nIdx) => (
                        <li key={nIdx}>{note}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Tóm tắt nhanh số ngành phù hợp */}
                <div className="p-3.5 bg-[#f0f9ff] border-[2px] border-[#0284c7] rounded-xl space-y-2">
                  <span className="text-[12px] font-black uppercase text-[#0369a1] block">
                    Đối chiếu điểm tham khảo ({matchedPrograms.length} CTĐT):
                  </span>
                  <div className="grid grid-cols-3 gap-2 text-center text-[11.5px] font-bold">
                    <div className="p-2 bg-white rounded-lg border border-[#86efac]">
                      <span className="text-[#15803d] block font-black text-[16px]">{highChanceCount}</span>
                      <span className="text-[#16a34a]">Cao hơn điểm tham khảo (≥+0.5)</span>
                    </div>
                    <div className="p-2 bg-white rounded-lg border border-[#fde68a]">
                      <span className="text-[#b45309] block font-black text-[16px]">{mediumChanceCount}</span>
                      <span className="text-[#d97706]">Gần điểm tham khảo</span>
                    </div>
                    <div className="p-2 bg-white rounded-lg border border-[#fca5a5]">
                      <span className="text-[#dc2626] block font-black text-[16px]">{lowChanceCount}</span>
                      <span className="text-[#ef4444]">Thấp hơn điểm tham khảo (&lt;-0.5)</span>
                    </div>
                  </div>
                  <p className="text-xs leading-relaxed text-slate-600">
                    Ba nhóm chỉ đếm theo chênh lệch điểm, bao gồm cả chương trình chưa đạt điều kiện.
                    {" "}Chưa có điểm để đối chiếu: {unclassifiedCount}.
                    {" "}Không đủ điều kiện: {ineligibleCount} · Cần xác minh thêm: {unverifiedCount}.
                    {" "}Đây không phải kết luận trúng tuyển.
                  </p>
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-[#6b7280] space-y-3">
                <span className="material-symbols-outlined text-[48px] text-[#9ca3af]">
                  calculate
                </span>
                <p className="text-[13px] font-medium leading-relaxed">
                  Vui lòng chọn phương thức, điền điểm số và nhấn nút <br />
                  <strong className="text-[#0d1b4e]">"Tính Điểm Quy Đổi & Đối Soát Ngành Ngay"</strong> để xem kết quả chi tiết.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 4. BẢNG ĐỐI SOÁT & DỰ BÁO CƠ HỘI TRÚNG TUYỂN TOÀN BỘ NGÀNH UTC (FULL WIDTH) */}
      <div className="bg-white p-6 lg:p-8 border border-slate-200 shadow-sm rounded-2xl space-y-5">
        <div className="grid gap-5 border-b border-slate-200 pb-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
          <div className="min-w-0 space-y-2">
            <h2 className="flex items-start gap-2 font-display text-lg font-bold leading-snug text-[#0d1b4e] sm:text-[22px]">
              <span aria-hidden="true" className="material-symbols-outlined mt-0.5 shrink-0 text-[24px] text-[#0284c7]">leaderboard</span>
              <span>Đối chiếu điểm chương trình tuyển sinh</span>
            </h2>
            <p className="max-w-3xl text-sm leading-6 text-slate-500">
              So sánh với điểm chính thức hoặc ước tính AI của năm đang chọn. Điểm năm trước chỉ để tham khảo; kết quả không thay thế thông báo trúng tuyển.
            </p>
          </div>

          {/* Chọn năm điểm chuẩn so sánh */}
          <div className="flex shrink-0 items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 sm:justify-start">
            <label htmlFor="score-comparison-year" className="whitespace-nowrap text-sm font-medium text-slate-600">Năm đối soát</label>
            <select
              id="score-comparison-year"
              value={compareYear}
              onChange={(e) => setCompareYear(Number(e.target.value))}
              className="h-10 min-w-32 cursor-pointer rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-[#0d1b4e] shadow-xs outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              {availableYears.map(year => <option key={year} value={year}>Năm {year}</option>)}
            </select>
          </div>
        </div>

        {aiLoading && <p role="status" className="text-sm text-slate-500">Đang tải ước tính AI; điểm chuẩn chính thức có thể đối chiếu ngay.</p>}
        {aiError && <p role="status" className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">Chưa tải được ước tính AI; bảng điểm chính thức vẫn sử dụng bình thường. <button type="button" className="font-semibold underline" onClick={() => setAiAttempt(value => value + 1)}>Thử tải lại dự đoán</button></p>}
        {/* Thanh công cụ tìm kiếm và lọc cơ hội */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Ô tìm kiếm ngành */}
          <div className="relative flex-1 min-w-[240px]">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-[#94a3b8]">
              search
            </span>
            <input
              type="text"
              value={searchMajorText}
              onChange={(e) => setSearchMajorText(e.target.value)}
              placeholder="Tìm kiếm ngành học, mã ngành hoặc CTĐT..."
              className="w-full pl-9 pr-3 py-2 text-[12.5px] bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-[#0284c7] text-[#0f172a] shadow-xs"
            />
          </div>

          {/* Lọc theo mức độ cơ hội */}
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => setFilterChance("all")}
              className={`px-3 py-1.5 rounded-lg text-[12px] font-bold border transition-all cursor-pointer ${
                filterChance === "all"
                  ? "bg-[#0d1b4e] text-white border-[#111827]"
                  : "bg-white text-[#4b5563] border-[#cbd5e1] hover:bg-slate-50"
              }`}
            >
              Tất cả ({matchedPrograms.length})
            </button>
            <button
              onClick={() => setFilterChance("high")}
              className={`px-3 py-1.5 rounded-lg text-[12px] font-bold border transition-all cursor-pointer ${
                filterChance === "high"
                  ? "bg-[#15803d] text-white border-[#111827]"
                  : "bg-white text-[#15803d] border-[#86efac] hover:bg-[#dcfce7]"
              }`}
            >
              Cao hơn điểm tham khảo ({highChanceCount})
            </button>
            <button
              onClick={() => setFilterChance("medium")}
              className={`px-3 py-1.5 rounded-lg text-[12px] font-bold border transition-all cursor-pointer ${
                filterChance === "medium"
                  ? "bg-[#b45309] text-white border-[#111827]"
                  : "bg-white text-[#b45309] border-[#fde68a] hover:bg-[#fef3c7]"
              }`}
            >
              Gần điểm tham khảo ({mediumChanceCount})
            </button>
            <button
              onClick={() => setFilterChance("low")}
              className={`px-3 py-1.5 rounded-lg text-[12px] font-bold border transition-all cursor-pointer ${
                filterChance === "low"
                  ? "bg-[#dc2626] text-white border-[#111827]"
                  : "bg-white text-[#dc2626] border-[#fca5a5] hover:bg-[#fee2e2]"
              }`}
            >
              Thấp hơn điểm tham khảo ({lowChanceCount})
            </button>
          </div>
        </div>

        {/* Bảng Dữ Liệu Đối Soát Ngành */}
        <div className="border-2 border-slate-500 rounded-xl overflow-hidden shadow-xs">
          <div className="w-full min-w-0">
            <table className="w-full table-fixed text-left border-collapse text-xs leading-5 lg:text-sm lg:leading-6 [&_th]:align-middle [&_td]:align-middle [&_th]:!w-auto [&_th]:!whitespace-normal [&_th]:!px-1 [&_td]:!px-1 sm:[&_th]:!px-2 sm:[&_td]:!px-2 [&_th]:[overflow-wrap:anywhere] [&_td]:[overflow-wrap:anywhere] [&_th_span]:!whitespace-normal [&_th]:border [&_th]:!border-slate-500 [&_td]:border [&_td]:!border-slate-400">
              <colgroup>
                <col style={{ width: "4%" }} /><col style={{ width: "8%" }} />
                <col style={{ width: "27%" }} /><col style={{ width: "11%" }} />
                <col style={{ width: "11%" }} /><col style={{ width: "10%" }} />
                <col style={{ width: "9%" }} /><col style={{ width: "20%" }} />
              </colgroup>
              <thead>
                <tr className="bg-[#0d1b4e] text-white font-semibold text-sm uppercase">
                  <th className="py-3 px-3 text-center w-[50px] border-r border-[#1e293b]">STT</th>
                  <th className="py-4 px-2 text-center whitespace-nowrap border-r border-[#1e293b]">Mã CTĐT</th>
                  <th className="py-3 px-4 border-r border-[#1e293b]">Chương trình đào tạo</th>
                  <th className="py-4 px-2 text-center border-r border-[#1e293b]"><span className="block whitespace-nowrap">{referenceHeading}</span><span className="block">({compareYear})</span></th>
                  <th className="py-4 px-2 text-center border-r border-[#1e293b]"><span className="block whitespace-nowrap">Điểm chuẩn</span><span className="block">({compareYear - 1})</span></th>
                  <th className="py-4 px-2 text-center whitespace-nowrap border-r border-[#1e293b]">Điểm của bạn</th>
                  <th className="py-4 px-2 text-center whitespace-nowrap border-r border-[#1e293b]">Chênh lệch</th>
                  <th className="py-3 px-3 text-center border-r border-[#1e293b]">Khả năng trúng tuyển<span className="mt-1 block text-xs font-medium normal-case text-blue-200">Mức tham khảo theo điểm</span></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e5e7eb] bg-white font-medium text-[#374151]">
                {filteredMatchedPrograms.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-10 text-center text-[#6b7280] italic">
                      {calculationResult
                        ? "Không tìm thấy ngành học nào phù hợp với bộ lọc hiện tại."
                        : "Vui lòng nhập điểm ở form phía trên và nhấn 'Tính Điểm Quy Đổi' để hệ thống tự động so sánh cơ hội với tất cả các ngành!"}
                    </td>
                  </tr>
                ) : (
                  filteredMatchedPrograms.map((p, idx) => (
                    <Fragment key={p.ma_chuong_trinh}>
                    <tr
                      className={`cursor-pointer transition-colors hover:bg-blue-50/60 ${expandedProgram === `${compareYear}:${p.ma_chuong_trinh}` ? "bg-blue-50/60" : ""}`}
                      onClick={event => {
                        // Các nút/link và phần giải thích trong hàng vẫn hoạt động độc lập.
                        if ((event.target as HTMLElement).closest("button,a,summary,details")) return;
                        toggleProgram(`${compareYear}:${p.ma_chuong_trinh}`);
                      }}
                    >
                      <td className="py-3 px-3 text-center font-bold text-[#64748b] border-r border-[#e5e7eb]">
                        {idx + 1}
                      </td>
                      <td className="py-3 px-3 text-center font-semibold tabular-nums text-[#0d1b4e] border-r border-[#e5e7eb]">
                        {p.ma_chuong_trinh}
                      </td>
                      <td className="break-words py-3 px-4 border-r border-[#e5e7eb]">
                        <button
                          type="button"
                          aria-expanded={expandedProgram === `${compareYear}:${p.ma_chuong_trinh}`}
                          aria-controls={`program-details-${compareYear}-${idx}`}
                          onClick={() => toggleProgram(`${compareYear}:${p.ma_chuong_trinh}`)}
                          className="w-full rounded text-left font-semibold leading-6 text-[#111827] hover:text-blue-800 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-600"
                        >{p.ten_chuong_trinh}</button>
                      </td>
                      <td className="py-3 px-3 text-center font-bold text-[#0d1b4e] border-r border-[#e5e7eb]">
                        {p.benchmarkScore !== null ? (
                            <span className="font-semibold tabular-nums">{p.benchmarkScore.toFixed(2)}</span>
                          ) : p.predictionScore !== null ? (
                            <span className="font-semibold tabular-nums text-amber-800" title="Điểm dự đoán AI tham khảo">{p.predictionScore.toFixed(2)}</span>
                        ) : (
                          <span className="font-normal text-slate-400" aria-label={`Chưa có điểm năm ${compareYear}`}>—</span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-center font-semibold tabular-nums border-r border-[#e5e7eb]">{p.previousScore !== null ? p.previousScore.toFixed(2) : <span className="font-normal text-slate-400" aria-label={p.previousConflict ? "Mã lịch sử chưa thống nhất" : "Chưa công bố"}>—</span>}</td>
                      <td className="py-3 px-3 text-center font-bold text-[#0284c7] border-r border-[#e5e7eb]">
                        {calculationResult ? (
                          <span className="font-semibold tabular-nums">
                            {calculationResult.finalScore == null ? "Chưa có cấu hình quy đổi" : `${calculationResult.finalScore.toFixed(2)} đ`}
                          </span>
                        ) : (
                          <span className="text-[#9ca3af]">—</span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-center font-bold border-r border-[#e5e7eb]">
                        {calculationResult && p.diff !== null ? (
                          <span
                            className={`font-semibold tabular-nums ${
                              p.chance === "ineligible" || p.chance === "unknown" ? "text-slate-600" : (p.diff ?? 0) >= 0 ? "text-[#15803d]" : "text-[#dc2626]"
                            }`}
                          >
                            {(p.diff ?? 0) > 0 ? `+${p.diff?.toFixed(2)}` : p.diff?.toFixed(2)} đ
                          </span>
                        ) : (
                          <span className="text-[#9ca3af]">—</span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-center border-r border-[#e5e7eb]">
                        <AdmissionLikelihood row={p} hasConvertedScore={calculationResult?.finalScore != null} />
                      </td>
                    </tr>
                    <tr id={`program-details-${compareYear}-${idx}`} hidden={expandedProgram !== `${compareYear}:${p.ma_chuong_trinh}`}>
                      <td colSpan={8} className="bg-slate-50 px-5 py-4">
                        <div className="flex flex-wrap items-center justify-between gap-4">
                          <p className="font-medium text-[#14264d]">{p.ma_chuong_trinh} · {p.ten_chuong_trinh}</p>
                          <div className="flex shrink-0 items-center gap-3">
                            <Link href={`/tra-cuu-nganh-hoc/${p.ma_nganh}`} className="rounded-lg bg-[#0d1b4e] px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600">Xem chi tiết →</Link>
                            <button type="button" onClick={() => {
                              setExpandedProgram(null);
                              document.getElementById(`program-details-${compareYear}-${idx}`)?.previousElementSibling?.querySelector("button")?.focus();
                            }} className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100">Đóng</button>
                          </div>
                        </div>
                      </td>
                    </tr>
                    </Fragment>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer Ghi chú disclaimer bên dưới bảng */}
        <div className="pt-2 text-[11.5px] text-[#64748b] italic flex items-center justify-between flex-wrap gap-2">
          <span>
            * Số liệu điểm chuẩn các ngành tham khảo từ Quyết định điểm trúng tuyển chính thức các năm của Hội đồng Tuyển sinh UTC.
          </span>
          <Link
            href="/thong-tin-tuyen-sinh"
            className="text-[#0284c7] font-bold hover:underline inline-flex items-center gap-1 not-italic"
          >
            <span>Xem chi tiết Đề án Tuyển sinh K66</span>
            <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

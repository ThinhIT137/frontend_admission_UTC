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
import { ScoreInput } from "@/components/admission/ScoreInput";
import { parseScoreInput } from "@/libs/score-input";


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
  // THPT: PT1; học bạ kết hợp điều kiện thi THPT: PT2.
  // IELTS là điểm cộng vào phương thức nền, không phải phương thức thay môn riêng.
  // HSA: PT3 tại Hà Nội; TSA: PT4. Quy tắc hiện được cấu hình cho năm 2026.
  const [methodTab, setMethodTab] = useState<"THPT" | "HOC_BA" | "DGNL">("THPT");

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
  const [m1Score, setM1Score] = useState<string>("");
  const [m2Score, setM2Score] = useState<string>("");
  const [m3Score, setM3Score] = useState<string>("");

  const handoffApplied = useRef(false);
  const pendingHandoff = useRef<{ combination: string; scores: number[] } | null>(null);
  useEffect(() => {
    if (handoffApplied.current) return;
    const params = new URLSearchParams(window.location.search);
    const combination = initialToHops.find(item => item.ma_to_hop === params.get("combination"));
    if (!combination) return;
    const subjectCodes = [combination.ma_mon_1, combination.ma_mon_2, combination.ma_mon_3];
    if (subjectCodes.some(code => !code) || new Set(subjectCodes).size !== 3) return;
    const rawScores = [params.get("score1"), params.get("score2"), params.get("score3")];
    if (rawScores.some(value => value === null || value.trim() === "")) return;
    const scores = rawScores.map(value => parseScoreInput(value ?? "", 10));
    if (scores.some(score => score === null)) return;

    // Chỉ nhận dữ liệu hợp lệ một lần; không ghi đè điểm người dùng sửa sau đó.
    handoffApplied.current = true;
    pendingHandoff.current = { combination: combination.ma_to_hop, scores: scores as number[] };
    setMethodTab("THPT");
    setSelectedToHop(combination.ma_to_hop);
    setM1Score(String(scores[0]));
    setM2Score(String(scores[1]));
    setM3Score(String(scores[2]));
  }, [initialToHops]);

  // IELTS được kiểm tra band và ngày cấp trước khi cộng điểm.
  const [certScore, setCertScore] = useState<string>("");
  const [certDate, setCertDate] = useState("");
  const [annualScores, setAnnualScores] = useState<Record<string, Array<string>>>({});
  const [thptMath, setThptMath] = useState<string>("");
  const [thptEnglish, setThptEnglish] = useState<string>("");
  const subjectCodes = [currentCombination?.ma_mon_1 ?? "", currentCombination?.ma_mon_2 ?? "", currentCombination?.ma_mon_3 ?? ""];
  const annualMatrix = subjectCodes.map(code => annualScores[code] ?? ["", "", ""]);

  // Điểm Kỳ thi ĐGNL / ĐGTD (PT 405)
  const [dgnlType, setDgnlType] = useState<"HSA" | "TSA">("HSA");
  const [dgnlScore, setDgnlScore] = useState<string>("");

  // Điểm ưu tiên
  const [region, setRegion] = useState<"KV3" | "KV2" | "KV2-NT" | "KV1">("KV2");
  const [priorityObj, setPriorityObj] = useState<"NONE" | "UT1" | "UT2">("NONE");

  // Kết quả tính toán
  const [calculationResult, setCalculationResult] = useState<CalculationSnapshot | null>(null);

  const [errorMessage, setErrorMessage] = useState("");
  const [submitAttempted, setSubmitAttempted] = useState(false);

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
  const invalidateCalculation = () => {
    requestId.current += 1;
    releaseLoading.current?.(); releaseLoading.current = null;
    setBusy(false); setCalculationResult(null); setErrorMessage("");
  };
  // Any input change invalidates the result; a late response cannot restore stale scores.
  useEffect(() => {
    requestId.current += 1;
    releaseLoading.current?.(); releaseLoading.current = null;
    setBusy(false); setCalculationResult(null); setErrorMessage("");
    return () => { requestId.current += 1; releaseLoading.current?.(); };
  }, [methodTab, selectedToHop, m1Score, m2Score, m3Score, certScore, certDate, annualScores, thptMath, thptEnglish, dgnlType, dgnlScore, region, priorityObj, calculationYear]);

  const handleCalculate = async () => {
    if (busy) return;
    setSubmitAttempted(true);
    if (calculationYear !== 2026) { setErrorMessage("Công cụ hiện áp dụng quy tắc UTC GHA 2026; chưa có cấu hình năm khác."); return; }
    if (methodTab !== "DGNL" && !currentCombination) {
      setErrorMessage("Chưa tải được tổ hợp môn từ database. Vui lòng tải lại trang.");
      return;
    }
    const parsedAnnual = annualMatrix.map(row => row.map(value => parseScoreInput(value, 10)));
    const subjectInputs = methodTab === "DGNL" ? [] : methodTab === "HOC_BA"
      ? parsedAnnual.map(row => row.some(value => value === null) ? NaN : row.reduce<number>((sum, value) => sum + (value ?? 0), 0) / 3)
      : [m1Score, m2Score, m3Score].map(value => parseScoreInput(value, 10) ?? NaN);
    const mathScore = thptMath.trim() === "" ? undefined : parseScoreInput(thptMath, 10);
    const englishScore = thptEnglish.trim() === "" ? undefined : parseScoreInput(thptEnglish, 10);
    const examScore = parseScoreInput(dgnlScore, dgnlType === "HSA" ? 150 : 100);
    const certificateScore = certScore.trim() === "" ? undefined : parseScoreInput(certScore, 9, 0.5);
    if (subjectInputs.some(value => !Number.isFinite(value))
      || (methodTab === "HOC_BA" && (mathScore === null || englishScore === null))
      || (methodTab === "DGNL" && examScore === null)
      || (certificateScore !== undefined && (certificateScore === null || !certDate || certDate <= "2024-06-30" || certDate > new Date().toISOString().slice(0,10)))) {
      setErrorMessage("Vui lòng nhập đủ điểm hợp lệ trước khi đối soát."); return;
    }
    const id = ++requestId.current;
    const release = beginLoading(); releaseLoading.current = release;
    setBusy(true); setErrorMessage(""); setCalculationResult(null); setFilterChance("all");
    try {
      const result = await api<{ calculation: Omit<CalculationSnapshot, "subjects" | "calculationYear"> }>("score", "/diem/tinh-diem-doi-soat", {
        method: methodTab, year: calculationYear, combination: methodTab === "DGNL" ? "DGNL" : selectedToHop, scores: subjectInputs.map(Number),
        ...(methodTab === "HOC_BA" ? { annual_scores: parsedAnnual, ...(mathScore !== undefined ? {thpt_math_score: mathScore} : {}), ...(englishScore !== undefined ? {thpt_english_score: englishScore} : {}) } : {}),
        region, priority: priorityObj, exam: dgnlType, ...(methodTab === "DGNL" ? {exam_score: examScore} : {}),
        ...(certificateScore !== undefined ? { certificate: "IELTS", certificate_score: certificateScore, certificate_date: certDate } : {}),
      });
      if (id !== requestId.current) return;
      if (result?.calculation?.contractVersion !== "utc-gha-2026-v2") throw new Error("Legacy score contract");
      // Ignore legacy backend program rows: comparison is derived locally from SSR data.
      setCalculationResult({ ...result.calculation, calculationYear,
        subjects: methodTab === "DGNL" ? [] : subjectInputs.map((score, index) => ({
          code: [currentCombination?.ma_mon_1, currentCombination?.ma_mon_2, currentCombination?.ma_mon_3][index] ?? "",
          name: [m1Name, m2Name, m3Name][index], score: Number(score),
        })),
      });
    } catch (error) {
      if (id === requestId.current) setErrorMessage(error instanceof BrowserApiError && error.status === 404
        ? "Backend điểm đang chạy phiên bản chưa có API tính điểm và đối soát. Cần triển khai phiên bản mới có /diem/tinh-diem-doi-soat rồi thử lại."
        : error instanceof BrowserApiError && [400, 422].includes(error.status)
          ? "API từ chối dữ liệu (400/422). Backend trên Render có thể vẫn là bản cũ chưa hỗ trợ học bạ 3 năm hoặc ngày cấp IELTS. Cần triển khai backend điểm có hợp đồng utc-gha-2026-v2, đồng thời kiểm tra điểm môn, tổ hợp và năm 2026."
          : error instanceof Error && error.message === "Legacy score contract" ? "Backend điểm cần triển khai bản UTC GHA 2026 mới trước khi dùng công thức này." : "Dịch vụ điểm đang không khả dụng hoặc phản hồi quá lâu. Vui lòng thử lại sau.");
    } finally {
      release();
      if (id === requestId.current) { setBusy(false); releaseLoading.current = null; }
    }
  };

  // Chờ tổ hợp và ba điểm từ trang chủ được cập nhật đủ rồi dùng đúng luồng tính tay.
  // Tiêu thụ yêu cầu trước khi gửi để StrictMode/rerender không gọi API lặp lại.
  useEffect(() => {
    const handoff = pendingHandoff.current;
    if (!handoff || busy || methodTab !== "THPT" || selectedToHop !== handoff.combination) return;
    if (![m1Score, m2Score, m3Score].every((score, index) => parseScoreInput(score, 10) === handoff.scores[index])) return;
    pendingHandoff.current = null;
    void handleCalculate();
  }, [busy, methodTab, selectedToHop, m1Score, m2Score, m3Score, handleCalculate]);

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
          {/* Thanh chọn phương thức tính điểm */}
          <div>
            <span className="text-[12px] font-black uppercase text-[#6b7280] block mb-2 font-stamp">
              Bước 1: Chọn Phương Thức Xét Tuyển Muốn Tính
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
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
                <span>Thi THPT (PT1)</span>
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
                <span>Học bạ + THPT (PT2)</span>
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
                <span>HSA / TSA</span>
              </button>
            </div>
          </div>

          <div className="border-t-[2px] border-dashed border-[#d1d5db] pt-5 space-y-5">
            {methodTab !== "DGNL" && <div className="space-y-5">
              <label className="block text-sm font-semibold text-slate-700">Tổ hợp xét tuyển
                <select aria-label="Tổ hợp xét tuyển" value={selectedToHop} onChange={e=>setSelectedToHop(e.target.value)} className="mt-2 w-full rounded-xl border border-slate-300 bg-white p-3 text-sm">
                  {combinations.map(c=><option key={c.ma_to_hop} value={c.ma_to_hop}>{c.ma_to_hop} · {[c.mon_1?.ten_mon || c.ma_mon_1,c.mon_2?.ten_mon || c.ma_mon_2,c.mon_3?.ten_mon || c.ma_mon_3].join(" – ")}</option>)}
                </select>
              </label>
              {methodTab === "HOC_BA" ? <>
                <p className="rounded-xl bg-blue-50 p-3 text-sm leading-6 text-blue-900">Nhập điểm trung bình cả năm của từng môn ở lớp 10, 11, 12. Mỗi ô phải từ 5,5 để đạt điều kiện PT2; hệ thống lấy trung bình ba năm, nhân hệ số Toán rồi quy đổi theo bảng.</p>
                <div className="space-y-4">{[m1Name,m2Name,m3Name].map((name,index)=><fieldset key={subjectCodes[index]} className="rounded-xl border border-slate-200 p-3"><legend className="px-1 text-sm font-bold text-slate-800">{name}</legend><div className="grid grid-cols-3 gap-3">{[10,11,12].map((grade,yearIndex)=><label key={grade} className="text-xs font-medium text-slate-600">Lớp {grade}<ScoreInput aria-label={`${name} lớp ${grade}`} showRequired={submitAttempted} value={annualMatrix[index][yearIndex]} onValueChange={value=>{invalidateCalculation();setAnnualScores(old=>({...old,[subjectCodes[index]]:(old[subjectCodes[index]]??["","",""]).map((v,j)=>j===yearIndex?value:v)}));}} className="mt-2 w-full rounded-lg border border-slate-300 p-2 text-center text-base font-semibold"/></label>)}</div></fieldset>)}</div>
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4"><h3 className="text-sm font-bold text-amber-900">Điều kiện điểm thi THPT 2026 (khác điểm học bạ)</h3><div className="mt-3 grid gap-3 sm:grid-cols-2"><label className="text-sm">Toán THPT (chưa có điểm có thể để trống)<ScoreInput aria-label="Toán THPT điều kiện PT2" value={thptMath} onValueChange={value=>{invalidateCalculation();setThptMath(value);}} className="mt-2 w-full rounded-lg border border-amber-200 bg-white p-2"/></label><label className="text-sm">Tiếng Anh THPT (nếu xét Ngôn ngữ Anh)<ScoreInput aria-label="Tiếng Anh THPT điều kiện PT2" value={thptEnglish} onValueChange={value=>{invalidateCalculation();setThptEnglish(value);}} className="mt-2 w-full rounded-lg border border-amber-200 bg-white p-2"/></label></div><p className="mt-3 text-xs leading-5 text-amber-900">Có thể tính học bạ khi chưa có điểm thi; trạng thái điều kiện sẽ là chưa kiểm tra được. Toán từ 5; Toán ứng dụng từ 6. Ngôn ngữ Anh: tiếng Anh THPT từ 6 hoặc IELTS từ 4,5.</p></div>
              </> : <div className="grid grid-cols-3 gap-3">{[m1Name,m2Name,m3Name].map((name,index)=><label key={subjectCodes[index]} className="min-w-0 text-sm font-semibold text-slate-700">{name}<ScoreInput aria-label={`Điểm thi ${name}`} showRequired={submitAttempted} value={[m1Score,m2Score,m3Score][index]} onValueChange={value=>{invalidateCalculation();[setM1Score,setM2Score,setM3Score][index](value);}} className="mt-2 w-full rounded-xl border border-slate-300 p-3 text-center text-lg"/></label>)}</div>}
              <p className="text-xs leading-6 text-slate-500">Điểm cơ sở: (Toán × 2 + hai môn còn lại) × 3/4. Ngành Ngôn ngữ Anh dùng tổng ba môn không nhân hệ số; bảng đối chiếu tính riêng theo ngành.</p>
            </div>}
            {methodTab === "DGNL" && <div className="space-y-4"><label className="block text-sm font-semibold">Kỳ thi tại Hà Nội<select aria-label="Kỳ thi đánh giá" value={dgnlType} onChange={e=>setDgnlType(e.target.value as "HSA"|"TSA")} className="mt-2 w-full rounded-xl border border-slate-300 bg-white p-3"><option value="HSA">HSA · ĐHQG Hà Nội · thang 150</option><option value="TSA">TSA · ĐH Bách khoa Hà Nội · thang 100</option></select></label><label className="block text-sm font-semibold">Điểm {dgnlType}<ScoreInput aria-label={`Điểm ${dgnlType}`} maxScore={dgnlType==="HSA"?150:100} showRequired={submitAttempted} value={dgnlScore} onValueChange={value=>{invalidateCalculation();setDgnlScore(value);}} className="mt-2 w-full rounded-xl border border-slate-300 p-3"/></label><p className="rounded-xl bg-blue-50 p-3 text-sm leading-6 text-blue-900">Quy đổi theo từng khoảng trong bảng năm 2026 bằng nội suy, không chia tuyến tính toàn thang. Ngoài khoảng bảng sẽ báo chưa quy đổi được. Cần kiểm tra phương thức và điều kiện bổ sung từng chương trình GHA.</p></div>}
            <fieldset className="rounded-xl border border-slate-200 p-4"><legend className="px-1 text-sm font-bold text-slate-800">IELTS (không bắt buộc)</legend><div className="grid gap-3 sm:grid-cols-2"><label className="text-sm">Điểm IELTS<ScoreInput aria-label="Điểm IELTS" maxScore={9} scoreStep={0.5} value={certScore} onValueChange={value=>{invalidateCalculation();setCertScore(value);if(value==="")setCertDate("");}} className="mt-2 w-full rounded-lg border border-slate-300 p-2"/></label><label className="text-sm">Ngày cấp chứng chỉ<input aria-label="Ngày cấp IELTS" type="date" min="2024-07-01" max={new Date().toISOString().slice(0,10)} value={certDate} onChange={e=>setCertDate(e.target.value)} className="mt-2 w-full rounded-lg border border-slate-300 p-2"/></label></div><p className="mt-3 text-xs leading-6 text-slate-600">IELTS chỉ cộng điểm, không thay môn tiếng Anh: 5,0 +0,50; 5,5 +0,75; 6,0 +1,00; 6,5 +1,25; từ 7,0 +1,50. Chứng chỉ cấp sau 30/06/2024. IELTS 4,5 có thể đáp ứng điều kiện PT2 Ngôn ngữ Anh nhưng không có điểm cộng.</p></fieldset>
            <a href="https://tuyensinh.utc.edu.vn/?q=tin-tuyen-sinh/th%C3%B4ng-tin-tuy%E1%BB%83n-sinh-%C4%91%E1%BA%A1i-h%E1%BB%8Dc-h%E1%BB%87-ch%C3%ADnh-quy-2026" target="_blank" rel="noreferrer" className="block text-sm font-medium text-blue-700 underline">Nguồn: Thông tin tuyển sinh UTC 2026 · mục 2 và 5.3</a>
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
                    (Đã cộng {calculationResult.priorityBonus.toFixed(3)} đ ưu tiên sau giảm dần)
                  </span>
                </div>

                <p className="text-sm leading-6 text-slate-600">Kết quả trên áp dụng nhóm nhân hệ số Toán. Ngành Ngôn ngữ Anh dùng tổng ba môn không nhân hệ số; điểm riêng được hiển thị tại từng dòng đối chiếu. Các điều kiện hồ sơ và phương thức mở tuyển vẫn cần kiểm tra theo đề án.</p>

                {/* Bảng phân rã điểm thành phần */}
                <div className="p-3.5 bg-white border border-slate-200 rounded-xl space-y-2 text-[12.5px] shadow-xs">
                  <div className="flex items-center justify-between font-bold text-[#0d1b4e] border-b border-dashed border-[#e2e8f0] pb-1.5">
                    <span>Điểm cơ sở trước quy đổi, ưu tiên:</span>
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
                    <span>+{calculationResult.priorityBonus.toFixed(3)} đ (Trần: {calculationResult.maxPriority} đ)</span>
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
                            {p.personalScore == null ? "Chưa có cấu hình quy đổi" : `${p.personalScore.toFixed(2)} đ`}
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
                        <AdmissionLikelihood row={p} hasConvertedScore={p.personalScore != null} />
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

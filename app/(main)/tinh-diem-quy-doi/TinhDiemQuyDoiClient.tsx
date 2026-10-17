"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { DisclaimerBanner } from "@/components/ui/DisclaimerBanner";

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
}

// Bảng quy đổi chứng chỉ Tiếng Anh chính thức của UTC sang thang điểm 10
function convertEnglishCertToScore(certType: string, score: number): number {
  if (certType === "IELTS") {
    if (score >= 7.0) return 10.0;
    if (score >= 6.5) return 9.5;
    if (score >= 6.0) return 9.0;
    if (score >= 5.5) return 8.5;
    if (score >= 5.0) return 8.0;
    if (score >= 4.5) return 7.0;
    return 0;
  }

  if (certType === "TOEFL") {
    if (score >= 102) return 10.0;
    if (score >= 94) return 9.5;
    if (score >= 79) return 9.0;
    if (score >= 60) return 8.5;
    if (score >= 45) return 8.0;
    return 0;
  }

  if (certType === "SAT") {
    if (score >= 1300) return 10.0;
    if (score >= 1200) return 9.5;
    if (score >= 1100) return 9.0;
    if (score >= 1000) return 8.0;
    return 0;
  }

  return 0;
}

// Danh mục tổ hợp phổ biến dự phòng nếu CSDL chưa đủ
const DEFAULT_COMBINATIONS: ToHopItem[] = [
  { ma_to_hop: "A00", ma_mon_1: "Toán", ma_mon_2: "Vật lý", ma_mon_3: "Hóa học" },
  { ma_to_hop: "A01", ma_mon_1: "Toán", ma_mon_2: "Vật lý", ma_mon_3: "Tiếng Anh" },
  { ma_to_hop: "D01", ma_mon_1: "Toán", ma_mon_2: "Ngữ văn", ma_mon_3: "Tiếng Anh" },
  { ma_to_hop: "D07", ma_mon_1: "Toán", ma_mon_2: "Hóa học", ma_mon_3: "Tiếng Anh" },
  { ma_to_hop: "B00", ma_mon_1: "Toán", ma_mon_2: "Hóa học", ma_mon_3: "Sinh học" },
  { ma_to_hop: "V00", ma_mon_1: "Toán", ma_mon_2: "Vật lý", ma_mon_3: "Vẽ mỹ thuật" },
];

export default function TinhDiemQuyDoiClient({ initialPrograms, initialToHops }: Props) {
  // Phương thức xét tuyển đang chọn
  // 1: Điểm thi tốt nghiệp THPT (Mã 100)
  // 2: Điểm học bạ THPT (Mã 200)
  // 3: Kết hợp Chứng chỉ Quốc tế + THPT (Mã 402)
  // 4: Đánh giá Năng lực HSA / Tư duy TSA (Mã 405)
  const [methodTab, setMethodTab] = useState<"THPT" | "HOC_BA" | "CHUNG_CHI" | "DGNL">("THPT");

  // Danh sách tổ hợp
  const combinations = initialToHops.length > 0 ? initialToHops : DEFAULT_COMBINATIONS;
  const [selectedToHop, setSelectedToHop] = useState<string>("A00");

  const currentCombination = useMemo(() => {
    return combinations.find((c) => c.ma_to_hop === selectedToHop) || combinations[0];
  }, [combinations, selectedToHop]);

  // Tên 3 môn của tổ hợp hiện tại
  const m1Name = currentCombination?.mon_1?.ten_mon || currentCombination?.ma_mon_1 || "Môn 1 (Toán)";
  const m2Name = currentCombination?.mon_2?.ten_mon || currentCombination?.ma_mon_2 || "Môn 2";
  const m3Name = currentCombination?.mon_3?.ten_mon || currentCombination?.ma_mon_3 || "Môn 3";

  // Điểm thành phần các môn thi
  const [m1Score, setM1Score] = useState<number | "">(8.5);
  const [m2Score, setM2Score] = useState<number | "">(8.0);
  const [m3Score, setM3Score] = useState<number | "">(8.5);

  // Điểm Chứng chỉ Quốc tế (PT 402)
  const [certType, setCertType] = useState<"IELTS" | "TOEFL" | "SAT">("IELTS");
  const [certScore, setCertScore] = useState<number | "">(6.5);
  const [certM2Score, setCertM2Score] = useState<number | "">(8.5); // Môn thứ 2 (Lý/Hóa/Văn...)

  // Điểm Kỳ thi ĐGNL / ĐGTD (PT 405)
  const [dgnlType, setDgnlType] = useState<"HSA" | "TSA">("HSA");
  const [dgnlScore, setDgnlScore] = useState<number | "">(95);

  // Điểm ưu tiên
  const [region, setRegion] = useState<"KV3" | "KV2" | "KV2-NT" | "KV1">("KV2");
  const [priorityObj, setPriorityObj] = useState<"NONE" | "UT1" | "UT2">("NONE");

  // Kết quả tính toán
  const [calculationResult, setCalculationResult] = useState<{
    method: "THPT" | "HOC_BA" | "CHUNG_CHI" | "DGNL";
    rawScore: number; // Tổng điểm trước ưu tiên
    priorityBonus: number; // Điểm ưu tiên đã điều chỉnh giảm dần
    maxPriority: number; // Mức ưu tiên trần
    finalScore: number; // Tổng điểm xét tuyển thang 30
    subDetails: { label: string; score: string }[];
    passPreliminary: boolean;
    preliminaryNotes: string[];
  } | null>(null);

  const [errorMessage, setErrorMessage] = useState("");

  // Bộ lọc bảng so sánh ngành
  const [searchMajorText, setSearchMajorText] = useState("");
  const [filterChance, setFilterChance] = useState<"all" | "high" | "medium" | "low">("all");
  const [compareYear, setCompareYear] = useState<number>(2025);

  // Hàm tính toán điểm quy đổi chính thức
  const handleCalculate = () => {
    setErrorMessage("");

    let rawScore = 0;
    const subDetails: { label: string; score: string }[] = [];
    const preliminaryNotes: string[] = [];
    let passPreliminary = true;

    // 1. Phương thức THPT (Mã 100)
    if (methodTab === "THPT") {
      const s1 = Number(m1Score);
      const s2 = Number(m2Score);
      const s3 = Number(m3Score);

      if (isNaN(s1) || isNaN(s2) || isNaN(s3) || s1 < 0 || s1 > 10 || s2 < 0 || s2 > 10 || s3 < 0 || s3 > 10) {
        setErrorMessage("Vui lòng nhập điểm các môn thi trong thang điểm từ 0.0 đến 10.0!");
        return;
      }

      if (s1 < 5.0) {
        passPreliminary = false;
        preliminaryNotes.push(`Môn Toán đạt ${s1.toFixed(2)} đ (< 5.0 đ) - Chưa đạt điều kiện sàn môn Toán của UTC.`);
      }

      rawScore = s1 + s2 + s3;
      subDetails.push({ label: `${m1Name}`, score: `${s1.toFixed(2)} đ` });
      subDetails.push({ label: `${m2Name}`, score: `${s2.toFixed(2)} đ` });
      subDetails.push({ label: `${m3Name}`, score: `${s3.toFixed(2)} đ` });
    }

    // 2. Phương thức Học bạ (Mã 200)
    else if (methodTab === "HOC_BA") {
      const s1 = Number(m1Score);
      const s2 = Number(m2Score);
      const s3 = Number(m3Score);

      if (isNaN(s1) || isNaN(s2) || isNaN(s3) || s1 < 0 || s1 > 10 || s2 < 0 || s2 > 10 || s3 < 0 || s3 > 10) {
        setErrorMessage("Vui lòng nhập điểm học bạ từ 0.0 đến 10.0!");
        return;
      }

      rawScore = s1 + s2 + s3;
      if (s1 < 7.0) {
        preliminaryNotes.push(`Điểm học bạ môn Toán đạt ${s1.toFixed(2)} đ (Khuyến nghị ≥ 7.0 đ đối với khối Kỹ thuật/Công nghệ).`);
      }
      if (rawScore < 24.0) {
        preliminaryNotes.push(`Tổng 3 môn học bạ đạt ${rawScore.toFixed(2)} đ (Một số ngành HOT yêu cầu ngưỡng sàn học bạ ≥ 24.0 đ).`);
      }

      subDetails.push({ label: `Học bạ ${m1Name}`, score: `${s1.toFixed(2)} đ` });
      subDetails.push({ label: `Học bạ ${m2Name}`, score: `${s2.toFixed(2)} đ` });
      subDetails.push({ label: `Học bạ ${m3Name}`, score: `${s3.toFixed(2)} đ` });
    }

    // 3. Phương thức Kết hợp Chứng chỉ Quốc tế (Mã 402)
    else if (methodTab === "CHUNG_CHI") {
      const cScore = Number(certScore);
      const sToan = Number(m1Score);
      const sM2 = Number(certM2Score);

      if (isNaN(cScore) || cScore <= 0) {
        setErrorMessage("Vui lòng nhập điểm chứng chỉ hợp lệ!");
        return;
      }
      if (isNaN(sToan) || isNaN(sM2) || sToan < 0 || sToan > 10 || sM2 < 0 || sM2 > 10) {
        setErrorMessage("Vui lòng nhập điểm môn Toán và môn thứ 2 từ 0.0 đến 10.0!");
        return;
      }

      const convertedEng = convertEnglishCertToScore(certType, cScore);
      if (convertedEng === 0) {
        passPreliminary = false;
        preliminaryNotes.push(`Điểm ${certType} chưa đạt ngưỡng tối thiểu theo đề án UTC (IELTS ≥ 5.0, SAT ≥ 1000).`);
      }
      if (sToan < 5.0) {
        passPreliminary = false;
        preliminaryNotes.push(`Điểm môn Toán đạt ${sToan.toFixed(2)} đ (< 5.0 đ) - Chưa đạt điều kiện sơ bộ.`);
      }
      if (sToan + sM2 < 12.0) {
        passPreliminary = false;
        preliminaryNotes.push(`Tổng 2 môn thi THPT (Toán + Môn 2) đạt ${(sToan + sM2).toFixed(2)} đ (< 12.0 đ).`);
      }

      rawScore = sToan + sM2 + convertedEng;
      subDetails.push({ label: `Môn Toán THPT`, score: `${sToan.toFixed(2)} đ` });
      subDetails.push({ label: `Môn 2 (${m2Name})`, score: `${sM2.toFixed(2)} đ` });
      subDetails.push({
        label: `Quy đổi ${certType} (${cScore})`,
        score: `${convertedEng.toFixed(2)} đ (Thang 10)`,
      });
    }

    // 4. Phương thức Đánh giá Năng lực HSA / TSA (Mã 405)
    else if (methodTab === "DGNL") {
      const dScore = Number(dgnlScore);
      if (isNaN(dScore) || dScore <= 0) {
        setErrorMessage("Vui lòng nhập điểm kỳ thi ĐGNL/ĐGTD hợp lệ!");
        return;
      }

      if (dgnlType === "HSA") {
        if (dScore < 75) {
          passPreliminary = false;
          preliminaryNotes.push(`Điểm HSA đạt ${dScore} (< 75/150 đ) - Chưa đạt ngưỡng nộp hồ sơ xét tuyển UTC.`);
        }
        rawScore = (dScore / 150) * 30;
        subDetails.push({ label: `Điểm HSA gốc`, score: `${dScore} / 150 đ` });
        subDetails.push({ label: `Công thức quy đổi UTC`, score: `(${dScore} ÷ 150) × 30` });
      } else {
        if (dScore < 50) {
          passPreliminary = false;
          preliminaryNotes.push(`Điểm TSA đạt ${dScore} (< 50/100 đ) - Chưa đạt ngưỡng nộp hồ sơ xét tuyển UTC.`);
        }
        rawScore = (dScore / 100) * 30;
        subDetails.push({ label: `Điểm TSA gốc`, score: `${dScore} / 100 đ` });
        subDetails.push({ label: `Công thức quy đổi UTC`, score: `(${dScore} ÷ 100) × 30` });
      }
    }

    // Tính điểm ưu tiên khu vực & đối tượng (Áp dụng công thức giảm dần chuẩn Bộ GD&ĐT)
    let baseBonus = 0;
    if (region === "KV1") baseBonus += 0.75;
    if (region === "KV2-NT") baseBonus += 0.50;
    if (region === "KV2") baseBonus += 0.25;

    if (priorityObj === "UT1") baseBonus += 2.0;
    if (priorityObj === "UT2") baseBonus += 1.0;

    let adjustedBonus = baseBonus;
    if (rawScore >= 22.5 && baseBonus > 0) {
      // Công thức Bộ GD&ĐT: Điểm UT = [(30 - Tổng điểm)/7.5] * Mức điểm ưu tiên
      adjustedBonus = Number((((30 - rawScore) / 7.5) * baseBonus).toFixed(2));
      if (adjustedBonus < 0) adjustedBonus = 0;
    }

    const finalScore = Math.min(30.0, Number((rawScore + adjustedBonus).toFixed(2)));

    setCalculationResult({
      method: methodTab,
      rawScore: Number(rawScore.toFixed(2)),
      priorityBonus: Number(adjustedBonus.toFixed(2)),
      maxPriority: Number(baseBonus.toFixed(2)),
      finalScore,
      subDetails,
      passPreliminary,
      preliminaryNotes,
    });
  };

  // Tính toán bảng đối soát cơ hội trúng tuyển với toàn bộ ngành của UTC
  const matchedPrograms = useMemo(() => {
    if (!calculationResult) return [];

    const myScore = calculationResult.finalScore;

    return initialPrograms.map((p) => {
      // Tìm điểm chuẩn của năm so sánh
      const historyYears = p.lich_su_diem_chuan || [];
      const targetHistory =
        historyYears.find((h) => h.nam === compareYear) ||
        historyYears.find((h) => h.nam === 2025) ||
        historyYears.find((h) => h.nam === 2024) ||
        historyYears[0];

      // Tìm điểm theo phương thức tương ứng
      let benchmarkScore: number | null = null;
      let matchedMethodName = "Điểm thi THPT";

      if (targetHistory && targetHistory.diem_trung_tuyen) {
        if (calculationResult.method === "THPT") {
          const dt = targetHistory.diem_trung_tuyen.find(
            (d) => d.ma_phuong_thuc === "PT1" || d.ma_phuong_thuc === "100"
          );
          benchmarkScore = dt ? dt.diem : targetHistory.diem_trung_tuyen[0]?.diem ?? null;
          matchedMethodName = dt?.phuong_thuc?.ten_phuong_thuc || "Điểm thi THPT (PT1)";
        } else if (calculationResult.method === "HOC_BA") {
          const dt = targetHistory.diem_trung_tuyen.find(
            (d) => d.ma_phuong_thuc === "PT2" || d.ma_phuong_thuc === "200"
          );
          benchmarkScore = dt ? dt.diem : (targetHistory.diem_trung_tuyen[0]?.diem ?? null);
          matchedMethodName = dt?.phuong_thuc?.ten_phuong_thuc || "Học bạ THPT (PT2)";
        } else if (calculationResult.method === "CHUNG_CHI") {
          const dt = targetHistory.diem_trung_tuyen.find(
            (d) => d.ma_phuong_thuc === "PT3" || d.ma_phuong_thuc === "402"
          );
          benchmarkScore = dt ? dt.diem : (targetHistory.diem_trung_tuyen[0]?.diem ?? null);
          matchedMethodName = dt?.phuong_thuc?.ten_phuong_thuc || "Kết hợp Chứng chỉ (PT3)";
        } else {
          const dt = targetHistory.diem_trung_tuyen.find(
            (d) => d.ma_phuong_thuc === "PT4" || d.ma_phuong_thuc === "405"
          );
          benchmarkScore = dt ? dt.diem : (targetHistory.diem_trung_tuyen[0]?.diem ?? null);
          matchedMethodName = dt?.phuong_thuc?.ten_phuong_thuc || "ĐGNL / ĐGTD (PT4)";
        }
      }

      // Đánh giá cơ hội trúng tuyển
      let chance: "high" | "medium" | "low" = "medium";
      let diff = 0;

      if (benchmarkScore !== null) {
        diff = Number((myScore - benchmarkScore).toFixed(2));
        if (diff >= 0.5) chance = "high";
        else if (diff >= -0.5) chance = "medium";
        else chance = "low";
      }

      return {
        ma_chuong_trinh: p.ma_chuong_trinh,
        ten_chuong_trinh: p.ten_chuong_trinh,
        ma_nganh: p.ma_nganh,
        ten_nganh: p.nganh?.ten_nganh || p.ten_chuong_trinh,
        faculty: p.nganh?.khoi_nganh?.ten_khoi_nganh || "Khoa Quản Lý",
        benchmarkYear: targetHistory?.nam || compareYear,
        benchmarkScore,
        matchedMethodName,
        diff,
        chance,
      };
    });
  }, [calculationResult, initialPrograms, compareYear]);

  // Lọc ngành theo tìm kiếm và trạng thái cơ hội
  const filteredMatchedPrograms = useMemo(() => {
    return matchedPrograms.filter((p) => {
      const matchSearch =
        !searchMajorText.trim() ||
        p.ten_nganh.toLowerCase().includes(searchMajorText.toLowerCase()) ||
        p.ten_chuong_trinh.toLowerCase().includes(searchMajorText.toLowerCase()) ||
        p.ma_chuong_trinh.toLowerCase().includes(searchMajorText.toLowerCase()) ||
        p.ma_nganh.toLowerCase().includes(searchMajorText.toLowerCase());

      const matchChance = filterChance === "all" || p.chance === filterChance;
      return matchSearch && matchChance;
    });
  }, [matchedPrograms, searchMajorText, filterChance]);

  // Thống kê nhanh cơ hội
  const highChanceCount = matchedPrograms.filter((p) => p.chance === "high").length;
  const mediumChanceCount = matchedPrograms.filter((p) => p.chance === "medium").length;
  const lowChanceCount = matchedPrograms.filter((p) => p.chance === "low").length;

  return (
    <div className="flex flex-col w-full space-y-7 pb-16">
      {/* 1. Header Card Phong Cách Neo-Brutalism */}
      <div className="bg-[#fffdf7] p-6 lg:p-8 border-[3px] border-[#111827] shadow-[6px_6px_0px_#111827] rounded-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-[#fdb712]/15 rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className="px-3 py-1 bg-[#0d1b4e] text-white font-stamp text-[12px] font-black border-[2px] border-[#111827] rounded-lg shadow-[2px_2px_0px_#111827]">
            CÔNG CỤ TUYỂN SINH K66
          </span>
          <span className="px-3 py-1 bg-[#fdb712] text-[#0d1b4e] font-stamp text-[12px] font-black border-[2px] border-[#111827] rounded-lg shadow-[2px_2px_0px_#111827]">
            MÃ TRƯỜNG: GHA
          </span>
          <span className="px-3 py-1 bg-[#e0f2fe] text-[#0369a1] font-bold text-[12px] border-[1.5px] border-[#111827] rounded-lg">
            Áp dụng chuẩn quy chế Bộ GD&ĐT & UTC
          </span>
        </div>

        <h1 className="font-display font-black text-[26px] sm:text-[32px] text-[#0d1b4e] uppercase leading-tight tracking-tight">
          Tính Điểm Quy Đổi & Đối Soát Cơ Hội Trúng Tuyển UTC
        </h1>

        <p className="text-[13.5px] text-[#4b5563] mt-2 max-w-4xl leading-relaxed">
          Hỗ trợ thí sinh tính toán chính xác điểm xét tuyển theo các phương thức chính thức của Trường Đại học Giao thông Vận tải (Điểm thi THPT, Học bạ, Quy đổi IELTS / SAT, ĐGNL ĐHQG Hà Nội HSA, ĐGTD ĐH Bách Khoa TSA) và tự động đối soát nhanh cơ hội trúng tuyển so với điểm chuẩn tất cả các ngành của trường.
        </p>
      </div>

      {/* 2. DISCLAIMER LỚN – BẮT BUỘC & RÕ RÀNG */}
      <div className="bg-[#fffbeb] p-5 sm:p-6 border-[3px] border-[#111827] shadow-[5px_5px_0px_#111827] rounded-2xl space-y-2">
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
        <div className="lg:col-span-7 bg-[#fffdf7] p-6 sm:p-7 border-[3px] border-[#111827] shadow-[5px_5px_0px_#111827] rounded-2xl space-y-6">
          {/* Thanh chọn 4 Phương thức tuyển sinh */}
          <div>
            <span className="text-[12px] font-black uppercase text-[#6b7280] block mb-2 font-stamp">
              Bước 1: Chọn Phương Thức Xét Tuyển Muốn Tính
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => setMethodTab("THPT")}
                className={`py-2.5 px-3 rounded-xl border-[2px] border-[#111827] text-[12px] font-black uppercase transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${
                  methodTab === "THPT"
                    ? "bg-[#0284c7] text-white shadow-[3px_3px_0px_#111827] translate-x-[-1px] translate-y-[-1px]"
                    : "bg-white text-[#1f2937] hover:bg-[#faf3e6]"
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">school</span>
                <span>Thi THPT (100)</span>
              </button>

              <button
                type="button"
                onClick={() => setMethodTab("HOC_BA")}
                className={`py-2.5 px-3 rounded-xl border-[2px] border-[#111827] text-[12px] font-black uppercase transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${
                  methodTab === "HOC_BA"
                    ? "bg-[#0284c7] text-white shadow-[3px_3px_0px_#111827] translate-x-[-1px] translate-y-[-1px]"
                    : "bg-white text-[#1f2937] hover:bg-[#faf3e6]"
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">menu_book</span>
                <span>Học Bạ (200)</span>
              </button>

              <button
                type="button"
                onClick={() => setMethodTab("CHUNG_CHI")}
                className={`py-2.5 px-3 rounded-xl border-[2px] border-[#111827] text-[12px] font-black uppercase transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${
                  methodTab === "CHUNG_CHI"
                    ? "bg-[#0284c7] text-white shadow-[3px_3px_0px_#111827] translate-x-[-1px] translate-y-[-1px]"
                    : "bg-white text-[#1f2937] hover:bg-[#faf3e6]"
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">verified</span>
                <span>Chứng Chỉ (402)</span>
              </button>

              <button
                type="button"
                onClick={() => setMethodTab("DGNL")}
                className={`py-2.5 px-3 rounded-xl border-[2px] border-[#111827] text-[12px] font-black uppercase transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${
                  methodTab === "DGNL"
                    ? "bg-[#0284c7] text-white shadow-[3px_3px_0px_#111827] translate-x-[-1px] translate-y-[-1px]"
                    : "bg-white text-[#1f2937] hover:bg-[#faf3e6]"
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
                    className="w-full px-3.5 py-2.5 bg-white border-[2px] border-[#111827] rounded-xl font-bold text-[13.5px] text-[#0d1b4e] outline-none shadow-xs cursor-pointer"
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
                    <div className="bg-white p-3 border-[2px] border-[#111827] rounded-xl shadow-xs">
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
                        className="w-full text-center font-display font-black text-[20px] text-[#0d1b4e] bg-[#faf3e6] rounded-lg py-1 border border-[#cbd5e1] outline-none"
                      />
                    </div>

                    <div className="bg-white p-3 border-[2px] border-[#111827] rounded-xl shadow-xs">
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
                        className="w-full text-center font-display font-black text-[20px] text-[#0d1b4e] bg-[#faf3e6] rounded-lg py-1 border border-[#cbd5e1] outline-none"
                      />
                    </div>

                    <div className="bg-white p-3 border-[2px] border-[#111827] rounded-xl shadow-xs">
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
                        className="w-full text-center font-display font-black text-[20px] text-[#0d1b4e] bg-[#faf3e6] rounded-lg py-1 border border-[#cbd5e1] outline-none"
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
                      className="w-full px-3 py-2 bg-white border-[2px] border-[#111827] rounded-xl font-bold text-[13px] text-[#0d1b4e] outline-none cursor-pointer"
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
                        className="w-full px-3 py-2 bg-white border-[2px] border-[#111827] rounded-xl font-display font-black text-[16px] text-[#0d1b4e] outline-none"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-bold text-[#0284c7]">
                        Quy đổi: {convertEnglishCertToScore(certType, Number(certScore))} đ
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
                    <div className="bg-white p-3 border-[2px] border-[#111827] rounded-xl">
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
                        className="w-full text-center font-display font-black text-[18px] text-[#0d1b4e] bg-[#faf3e6] rounded-lg py-1 border border-[#cbd5e1] outline-none"
                      />
                    </div>

                    <div className="bg-white p-3 border-[2px] border-[#111827] rounded-xl">
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
                        className="w-full text-center font-display font-black text-[18px] text-[#0d1b4e] bg-[#faf3e6] rounded-lg py-1 border border-[#cbd5e1] outline-none"
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
                      className="w-full px-3 py-2 bg-white border-[2px] border-[#111827] rounded-xl font-bold text-[13px] text-[#0d1b4e] outline-none cursor-pointer"
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
                      className="w-full px-3 py-2 bg-white border-[2px] border-[#111827] rounded-xl font-display font-black text-[18px] text-[#0d1b4e] outline-none text-center"
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
                    className="w-full px-3 py-2 bg-white border-[2px] border-[#111827] rounded-xl font-bold text-[12.5px] text-[#0d1b4e] outline-none cursor-pointer"
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
                    className="w-full px-3 py-2 bg-white border-[2px] border-[#111827] rounded-xl font-bold text-[12.5px] text-[#0d1b4e] outline-none cursor-pointer"
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
              className="w-full py-3.5 px-6 bg-[#0284c7] hover:bg-[#0369a1] text-white font-black text-[15px] sm:text-[16px] border-[3px] border-[#111827] rounded-xl shadow-[4px_4px_0px_#111827] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all uppercase tracking-wide cursor-pointer flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-[20px]">calculate</span>
              <span>Tính Điểm Quy Đổi & Đối Soát Ngành Ngay</span>
            </button>
          </div>
        </div>

        {/* CỘT PHẢI (5 CỘT): KẾT QUẢ QUY ĐỔI & PHÂN TÍCH */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-[#fffdf7] p-6 sm:p-7 border-[3px] border-[#111827] shadow-[5px_5px_0px_#111827] rounded-2xl relative space-y-4">
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
                <div className="bg-[#0d1b4e] text-white p-5 rounded-2xl border-[3px] border-[#111827] shadow-[4px_4px_0px_#fdb712] text-center space-y-1">
                  <span className="text-[11.5px] font-stamp text-[#fdb712] uppercase tracking-wider block">
                    ĐIỂM XÉT TUYỂN CHÍNH THỨC (THANG 30)
                  </span>
                  <div className="font-display font-black text-[48px] sm:text-[54px] text-white leading-none">
                    {calculationResult.finalScore.toFixed(2)}
                  </div>
                  <span className="text-[11.5px] text-[#93c5fd] block pt-1">
                    (Đã cộng {calculationResult.priorityBonus.toFixed(2)} đ ưu tiên sau giảm dần)
                  </span>
                </div>

                {/* Bảng phân rã điểm thành phần */}
                <div className="p-3.5 bg-white border-[2px] border-[#111827] rounded-xl space-y-2 text-[12.5px] shadow-xs">
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
                    Khảo Sát Khả Năng Trúng Tuyển ({matchedPrograms.length} CTĐT):
                  </span>
                  <div className="grid grid-cols-3 gap-2 text-center text-[11.5px] font-bold">
                    <div className="p-2 bg-white rounded-lg border border-[#86efac]">
                      <span className="text-[#15803d] block font-black text-[16px]">{highChanceCount}</span>
                      <span className="text-[#16a34a]">Đỗ cao (≥+0.5)</span>
                    </div>
                    <div className="p-2 bg-white rounded-lg border border-[#fde68a]">
                      <span className="text-[#b45309] block font-black text-[16px]">{mediumChanceCount}</span>
                      <span className="text-[#d97706]">Cạnh tranh</span>
                    </div>
                    <div className="p-2 bg-white rounded-lg border border-[#fca5a5]">
                      <span className="text-[#dc2626] block font-black text-[16px]">{lowChanceCount}</span>
                      <span className="text-[#ef4444]">Thử thách (&lt;-0.5)</span>
                    </div>
                  </div>
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
      <div className="bg-[#fffdf7] p-6 lg:p-8 border-[3px] border-[#111827] shadow-[6px_6px_0px_#111827] rounded-2xl space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b-[2px] border-[#111827] pb-4">
          <div>
            <h2 className="font-display font-black text-[20px] sm:text-[23px] text-[#0d1b4e] uppercase flex items-center gap-2">
              <span className="material-symbols-outlined text-[#0284c7] text-[24px]">leaderboard</span>
              Bảng Đối Soát Cơ Hội Trúng Tuyển Các Ngành UTC
            </h2>
            <p className="text-[12.5px] text-[#6b7280]">
              So sánh điểm xét tuyển của bạn với điểm trúng tuyển tham khảo các năm trước
            </p>
          </div>

          {/* Chọn năm điểm chuẩn so sánh */}
          <div className="flex items-center gap-2 self-start md:self-auto">
            <span className="text-[12px] font-bold text-[#64748b]">Năm đối soát:</span>
            <select
              value={compareYear}
              onChange={(e) => setCompareYear(Number(e.target.value))}
              className="px-3 py-1.5 bg-white border-[2px] border-[#111827] rounded-xl font-bold text-[12.5px] text-[#0d1b4e] outline-none cursor-pointer shadow-xs"
            >
              <option value={2025}>Năm 2025</option>
              <option value={2024}>Năm 2024</option>
              <option value={2023}>Năm 2023</option>
            </select>
          </div>
        </div>

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
              className="w-full pl-9 pr-3 py-2 text-[12.5px] bg-white border-[2px] border-[#111827] rounded-xl focus:outline-none focus:border-[#0284c7] text-[#0f172a] shadow-xs"
            />
          </div>

          {/* Lọc theo mức độ cơ hội */}
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => setFilterChance("all")}
              className={`px-3 py-1.5 rounded-lg text-[12px] font-bold border transition-all cursor-pointer ${
                filterChance === "all"
                  ? "bg-[#0d1b4e] text-white border-[#111827]"
                  : "bg-white text-[#4b5563] border-[#cbd5e1] hover:bg-[#faf3e6]"
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
              🟢 Đỗ cao ({highChanceCount})
            </button>
            <button
              onClick={() => setFilterChance("medium")}
              className={`px-3 py-1.5 rounded-lg text-[12px] font-bold border transition-all cursor-pointer ${
                filterChance === "medium"
                  ? "bg-[#b45309] text-white border-[#111827]"
                  : "bg-white text-[#b45309] border-[#fde68a] hover:bg-[#fef3c7]"
              }`}
            >
              🟡 Cạnh tranh ({mediumChanceCount})
            </button>
            <button
              onClick={() => setFilterChance("low")}
              className={`px-3 py-1.5 rounded-lg text-[12px] font-bold border transition-all cursor-pointer ${
                filterChance === "low"
                  ? "bg-[#dc2626] text-white border-[#111827]"
                  : "bg-white text-[#dc2626] border-[#fca5a5] hover:bg-[#fee2e2]"
              }`}
            >
              🔴 Khó ({lowChanceCount})
            </button>
          </div>
        </div>

        {/* Bảng Dữ Liệu Đối Soát Ngành */}
        <div className="border-[2px] border-[#111827] rounded-xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-[12.5px]">
              <thead>
                <tr className="bg-[#0d1b4e] text-white font-black text-[12px] uppercase">
                  <th className="py-3 px-3 text-center w-[50px] border-r border-[#1e293b]">STT</th>
                  <th className="py-3 px-3 text-center w-[90px] border-r border-[#1e293b]">Mã CTDT</th>
                  <th className="py-3 px-4 border-r border-[#1e293b]">Tên ngành & Chương trình đào tạo</th>
                  <th className="py-3 px-3 text-center w-[100px] border-r border-[#1e293b]">Điểm chuẩn ({compareYear})</th>
                  <th className="py-3 px-3 text-center w-[95px] border-r border-[#1e293b]">Điểm của bạn</th>
                  <th className="py-3 px-3 text-center w-[95px] border-r border-[#1e293b]">Chênh lệch</th>
                  <th className="py-3 px-3 text-center w-[130px] border-r border-[#1e293b]">Dự báo cơ hội</th>
                  <th className="py-3 px-3 text-center w-[90px]">Chi tiết</th>
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
                    <tr key={p.ma_chuong_trinh} className="hover:bg-[#faf3e6]/60 transition-colors">
                      <td className="py-3 px-3 text-center font-bold text-[#64748b] border-r border-[#e5e7eb]">
                        {idx + 1}
                      </td>
                      <td className="py-3 px-3 text-center font-mono font-bold text-[#0d1b4e] border-r border-[#e5e7eb]">
                        {p.ma_chuong_trinh}
                      </td>
                      <td className="py-3 px-4 border-r border-[#e5e7eb]">
                        <div className="font-bold text-[#111827]">{p.ten_chuong_trinh}</div>
                        <div className="text-[11px] text-[#6b7280]">
                          Ngành: {p.ten_nganh} • {p.faculty}
                        </div>
                      </td>
                      <td className="py-3 px-3 text-center font-bold text-[#0d1b4e] border-r border-[#e5e7eb]">
                        {p.benchmarkScore !== null ? (
                          <span className="font-display font-black text-[14px]">
                            {p.benchmarkScore.toFixed(2)} đ
                          </span>
                        ) : (
                          <span className="text-[#9ca3af] italic text-[11px]">Đang cập nhật</span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-center font-bold text-[#0284c7] border-r border-[#e5e7eb]">
                        {calculationResult ? (
                          <span className="font-display font-black text-[14px]">
                            {calculationResult.finalScore.toFixed(2)} đ
                          </span>
                        ) : (
                          <span className="text-[#9ca3af]">—</span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-center font-bold border-r border-[#e5e7eb]">
                        {calculationResult && p.benchmarkScore !== null ? (
                          <span
                            className={`font-black ${
                              p.diff >= 0 ? "text-[#15803d]" : "text-[#dc2626]"
                            }`}
                          >
                            {p.diff > 0 ? `+${p.diff.toFixed(2)}` : p.diff.toFixed(2)} đ
                          </span>
                        ) : (
                          <span className="text-[#9ca3af]">—</span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-center border-r border-[#e5e7eb]">
                        {calculationResult && p.benchmarkScore !== null ? (
                          p.chance === "high" ? (
                            <span className="px-2.5 py-0.5 bg-[#dcfce7] text-[#15803d] border border-[#86efac] rounded-full text-[11px] font-black inline-block">
                              🟢  cao
                            </span>
                          ) : p.chance === "medium" ? (
                            <span className="px-2.5 py-0.5 bg-[#fef3c7] text-[#92400e] border border-[#fde68a] rounded-full text-[11px] font-black inline-block">
                              🟡 Cạnh tranh
                            </span>
                          ) : (
                            <span className="px-2.5 py-0.5 bg-[#fee2e2] text-[#b91c1c] border border-[#fca5a5] rounded-full text-[11px] font-black inline-block">
                              🔴 Thử thách
                            </span>
                          )
                        ) : (
                          <span className="text-[#9ca3af] text-[11px] italic">Chờ tính điểm</span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <Link
                          href={`/tra-cuu-nganh-hoc/${p.ma_nganh}`}
                          className="inline-flex items-center gap-1 text-[11.5px] font-black text-[#0284c7] hover:underline"
                        >
                          <span>Xem</span>
                          <span className="material-symbols-outlined text-[13px]">arrow_forward</span>
                        </Link>
                      </td>
                    </tr>
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
    </div>
  );
}

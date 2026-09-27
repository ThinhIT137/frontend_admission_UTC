"use client";

import { useState } from "react";
import { DisclaimerBanner } from "@/components/ui/DisclaimerBanner";

export default function ScoreCalculatorPage() {
  const [certType, setCertType] = useState("IELTS");
  const [certScore, setCertScore] = useState<number | "">("");
  const [m1, setM1] = useState<number | "">(8.5);
  const [m2, setM2] = useState<number | "">(8.0);
  const [m3, setM3] = useState<number | "">(9.0);
  const [region, setRegion] = useState("KV2");
  const [priorityObj, setPriorityObj] = useState("NONE");

  const [result, setResult] = useState<{
    convertedCertScore: number;
    totalTHPT: number;
    priorityBonus: number;
    finalScore: number;
    recommendedMethods: string[];
  } | null>(null);

  const [errorMsg, setErrorMsg] = useState("");

  const handleCalculate = () => {
    setErrorMsg("");
    const scoreVal = Number(certScore);

    // Validate cert score if provided
    if (certScore !== "") {
      if (certType === "IELTS" && (scoreVal < 3.0 || scoreVal > 9.0)) {
        setErrorMsg("Điểm IELTS phải nằm trong khoảng 3.0 - 9.0!");
        return;
      }
      if (certType === "SAT" && (scoreVal < 400 || scoreVal > 1600)) {
        setErrorMsg("Điểm SAT phải nằm trong khoảng 400 - 1600!");
        return;
      }
    }

    const n1 = Number(m1) || 0;
    const n2 = Number(m2) || 0;
    const n3 = Number(m3) || 0;

    if (n1 < 0 || n1 > 10 || n2 < 0 || n2 > 10 || n3 < 0 || n3 > 10) {
      setErrorMsg("Điểm môn THPT phải từ 0 đến 10!");
      return;
    }

    // Calculation logic
    let certConverted = 0;
    if (certScore !== "") {
      if (certType === "IELTS") {
        if (scoreVal >= 6.5) certConverted = 10.0;
        else if (scoreVal >= 6.0) certConverted = 9.0;
        else if (scoreVal >= 5.5) certConverted = 8.5;
        else if (scoreVal >= 5.0) certConverted = 8.0;
        else certConverted = 7.0;
      } else if (certType === "SAT") {
        certConverted = Math.min(10.0, (scoreVal / 1600) * 10);
      } else {
        certConverted = 8.5;
      }
    }

    // Priority bonus points
    let bonus = 0;
    if (region === "KV1") bonus += 0.75;
    if (region === "KV2-NT") bonus += 0.5;
    if (region === "KV2") bonus += 0.25;
    if (priorityObj === "UT1") bonus += 2.0;
    if (priorityObj === "UT2") bonus += 1.0;

    const totalTHPT = n1 + n2 + n3;
    const finalScore = Math.min(30, totalTHPT + bonus);

    setResult({
      convertedCertScore: Number(certConverted.toFixed(2)),
      totalTHPT: Number(totalTHPT.toFixed(2)),
      priorityBonus: Number(bonus.toFixed(2)),
      finalScore: Number(finalScore.toFixed(2)),
      recommendedMethods: [
        "Xét tuyển kết hợp Chứng chỉ quốc tế + THPT (Mã 402)",
        "Xét tuyển theo điểm thi THPT Quốc gia (Mã 100)",
        "Xét tuyển Học bạ THPT 3 năm (Mã 200)",
      ],
    });
  };

  return (
    <div className="flex flex-col w-full space-y-6 pb-12">
      {/* Title Scrapbook Card */}
      <div className="bg-[#fffdf7] p-6 border-[3px] border-[#111827] shadow-[5px_5px_0px_#111827] rounded-[16px] relative">
        <div className="absolute -top-3 left-6 px-3 py-0.5 bg-[#fdb712] border-[2px] border-[#111827] font-stamp text-[11px] font-bold text-[#111827] uppercase rotate-[-2deg] shadow-[1px_1px_0px_#111827]">
          CÔNG CỤ QUY ĐỔI K66
        </div>
        <h1 className="font-display font-extrabold text-[28px] lg:text-[34px] text-[#111827] uppercase mt-2">
          TÍNH ĐIỂM QUY ĐỔI XÉT TUYỂN UTC
        </h1>
        <p className="text-[14px] text-[#4b5563] font-medium mt-1">
          Nhập điểm thi THPT, Chứng chỉ Tiếng Anh hoặc Kỳ thi ĐGNL để quy đổi sang thang điểm chuẩn tuyển sinh trường Đại học Giao thông Vận tải.
        </p>
      </div>

      <DisclaimerBanner />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form Section */}
        <div className="lg:col-span-7 bg-white p-6 border-[3px] border-[#111827] shadow-[5px_5px_0px_#111827] rounded-[16px] space-y-6">
          <h3 className="font-display font-bold text-[18px] text-[#111827] flex items-center gap-2 border-b-[2px] border-dashed border-[#c6c5d0] pb-3">
            <span className="material-symbols-outlined text-[#0284c7]">edit_square</span>
            1. Chứng chỉ Quốc tế & ĐGNL (Tùy chọn)
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[13px] font-bold text-[#111827] mb-1">
                Loại chứng chỉ / Kỳ thi
              </label>
              <select
                value={certType}
                onChange={(e) => setCertType(e.target.value)}
                className="w-full px-3 py-2 bg-[#faf3e6] border-[2px] border-[#111827] rounded-[8px] font-bold text-[13px] outline-none"
              >
                <option value="IELTS">IELTS Academic</option>
                <option value="SAT">SAT General Test</option>
                <option value="HSA">ĐGNL ĐHQG Hà Nội (HSA)</option>
                <option value="TSA">ĐGTD Bách Khoa (TSA)</option>
              </select>
            </div>

            <div>
              <label className="block text-[13px] font-bold text-[#111827] mb-1">
                Điểm đạt được
              </label>
              <input
                type="number"
                step="0.5"
                placeholder="Ví dụ: 6.5"
                value={certScore}
                onChange={(e) => setCertScore(e.target.value === "" ? "" : Number(e.target.value))}
                className="w-full px-3 py-2 bg-[#faf3e6] border-[2px] border-[#111827] rounded-[8px] font-bold text-[13px] outline-none"
              />
            </div>
          </div>

          <h3 className="font-display font-bold text-[18px] text-[#111827] flex items-center gap-2 border-b-[2px] border-dashed border-[#c6c5d0] pb-3 pt-2">
            <span className="material-symbols-outlined text-[#ea580c]">grade</span>
            2. Điểm các môn trong tổ hợp xét tuyển
          </h3>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-[12px] font-bold text-[#111827] mb-1">
                Môn 1 (Vd: Toán)
              </label>
              <input
                type="number"
                step="0.1"
                value={m1}
                onChange={(e) => setM1(e.target.value === "" ? "" : Number(e.target.value))}
                className="w-full px-3 py-2 bg-[#faf3e6] border-[2px] border-[#111827] rounded-[8px] font-bold text-[13px] text-center outline-none"
              />
            </div>
            <div>
              <label className="block text-[12px] font-bold text-[#111827] mb-1">
                Môn 2 (Vd: Lý)
              </label>
              <input
                type="number"
                step="0.1"
                value={m2}
                onChange={(e) => setM2(e.target.value === "" ? "" : Number(e.target.value))}
                className="w-full px-3 py-2 bg-[#faf3e6] border-[2px] border-[#111827] rounded-[8px] font-bold text-[13px] text-center outline-none"
              />
            </div>
            <div>
              <label className="block text-[12px] font-bold text-[#111827] mb-1">
                Môn 3 (Vd: Hóa/Anh)
              </label>
              <input
                type="number"
                step="0.1"
                value={m3}
                onChange={(e) => setM3(e.target.value === "" ? "" : Number(e.target.value))}
                className="w-full px-3 py-2 bg-[#faf3e6] border-[2px] border-[#111827] rounded-[8px] font-bold text-[13px] text-center outline-none"
              />
            </div>
          </div>

          <h3 className="font-display font-bold text-[18px] text-[#111827] flex items-center gap-2 border-b-[2px] border-dashed border-[#c6c5d0] pb-3 pt-2">
            <span className="material-symbols-outlined text-[#16a34a]">military_tech</span>
            3. Đối tượng & Khu vực ưu tiên
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[13px] font-bold text-[#111827] mb-1">
                Khu vực ưu tiên
              </label>
              <select
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className="w-full px-3 py-2 bg-[#faf3e6] border-[2px] border-[#111827] rounded-[8px] font-bold text-[13px] outline-none"
              >
                <option value="KV3">Khu vực 3 (Không cộng điểm)</option>
                <option value="KV2">Khu vực 2 (+0.25 điểm)</option>
                <option value="KV2-NT">Khu vực 2 - Nông thôn (+0.5 điểm)</option>
                <option value="KV1">Khu vực 1 (+0.75 điểm)</option>
              </select>
            </div>

            <div>
              <label className="block text-[13px] font-bold text-[#111827] mb-1">
                Đối tượng ưu tiên
              </label>
              <select
                value={priorityObj}
                onChange={(e) => setPriorityObj(e.target.value)}
                className="w-full px-3 py-2 bg-[#faf3e6] border-[2px] border-[#111827] rounded-[8px] font-bold text-[13px] outline-none"
              >
                <option value="NONE">Không thuộc đối tượng ưu tiên</option>
                <option value="UT1">Đối tượng 01 - 04 (+2.0 điểm)</option>
                <option value="UT2">Đối tượng 05 - 07 (+1.0 điểm)</option>
              </select>
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 bg-[#ffdad6] border-[2px] border-[#ba1a1a] text-[#ba1a1a] font-bold text-[13px] rounded-[8px] flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">error</span>
              {errorMsg}
            </div>
          )}

          <button
            onClick={handleCalculate}
            className="w-full py-3 bg-[#0284c7] hover:bg-[#0369a1] text-white font-extrabold text-[16px] border-[3px] border-[#111827] shadow-[4px_4px_0px_#111827] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none rounded-[10px] transition-all uppercase tracking-wider"
          >
            Tính Điểm Quy Đổi Ngay
          </button>
        </div>

        {/* Right Result Section */}
        <div className="lg:col-span-5 flex flex-col space-y-4">
          <div className="bg-[#fffdf7] p-6 border-[3px] border-[#111827] shadow-[5px_5px_0px_#111827] rounded-[16px] relative flex-1">
            <div className="absolute -top-3 right-6 px-3 py-0.5 bg-[#86efac] border-[2px] border-[#111827] font-stamp text-[11px] font-bold text-[#111827] uppercase rotate-2 shadow-[1px_1px_0px_#111827]">
              KẾT QUẢ DỰ ĐOÁN
            </div>

            <h3 className="font-display font-bold text-[20px] text-[#111827] uppercase mb-4">
              KẾT QUẢ QUY ĐỔI ĐIỂM
            </h3>

            {result ? (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="bg-[#000525] text-white p-5 border-[3px] border-[#111827] shadow-[4px_4px_0px_#fdb712] rounded-[12px] text-center">
                  <span className="font-stamp text-[12px] text-[#fdb712] uppercase tracking-wider">
                    TỔNG ĐIỂM QUY ĐỔI XÉT TUYỂN (THANG 30)
                  </span>
                  <div className="font-display font-black text-[46px] text-white leading-tight">
                    {result.finalScore.toFixed(2)}
                  </div>
                  <span className="text-[12px] text-[#b8c4ff] block mt-1">
                    (Đã bao gồm điểm ưu tiên KV & Đối tượng)
                  </span>
                </div>

                <div className="space-y-2 bg-[#faf3e6] p-4 border-[2px] border-[#111827] rounded-[10px] text-[13px]">
                  <div className="flex justify-between font-medium">
                    <span>Tổng 3 môn THPT:</span>
                    <span className="font-bold text-[#111827]">{result.totalTHPT} / 30</span>
                  </div>
                  {result.convertedCertScore > 0 && (
                    <div className="flex justify-between font-medium">
                      <span>Quy đổi chứng chỉ ({certType}):</span>
                      <span className="font-bold text-[#0284c7]">{result.convertedCertScore} / 10</span>
                    </div>
                  )}
                  <div className="flex justify-between font-medium">
                    <span>Điểm ưu tiên khu vực / ĐT:</span>
                    <span className="font-bold text-[#ea580c]">+{result.priorityBonus} điểm</span>
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-[14px] text-[#111827] mb-2 font-display">
                    PHƯƠNG THỨC XÉT TUYỂN TỐI ƯU GỢI Ý:
                  </h4>
                  <ul className="space-y-2">
                    {result.recommendedMethods.map((m, idx) => (
                      <li
                        key={idx}
                        className="bg-white p-2.5 border-[2px] border-[#111827] rounded-[8px] text-[12px] font-bold text-[#000525] shadow-[2px_2px_0px_#111827] flex items-center gap-2"
                      >
                        <span className="material-symbols-outlined text-[#16a34a] text-[18px]">
                          check_circle
                        </span>
                        {m}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-[#6b7280] space-y-3">
                <span className="material-symbols-outlined text-[48px] text-[#9ca3af]">
                  calculate
                </span>
                <p className="font-medium text-[14px]">
                  Vui lòng điền thông tin điểm và nhấn nút <br />
                  <strong className="text-[#111827]">"Tính Điểm Quy Đổi Ngay"</strong> để xem kết quả chi tiết.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

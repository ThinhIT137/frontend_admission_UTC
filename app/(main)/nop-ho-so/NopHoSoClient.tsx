"use client";

import { useState } from "react";
import Link from "next/link";
import { DisclaimerBanner } from "@/components/ui/DisclaimerBanner";

export interface MethodOption {
  ma_phuong_thuc: string;
  ten_phuong_thuc: string;
}

export interface ProgramOption {
  ma_chuong_trinh: string;
  ten_chuong_trinh: string;
  ma_nganh: string;
  ten_nganh?: string;
  to_hop?: string[];
}

interface Props {
  methods: MethodOption[];
  programs: ProgramOption[];
}

export default function NopHoSoClient({ methods, programs }: Props) {
  // 4 Bước nộp hồ sơ chuẩn:
  // Bước 1: Chọn Phương thức & Nguyện vọng ngành
  // Bước 2: Thông tin cá nhân & Đối tượng ưu tiên
  // Bước 3: Checklist giấy tờ & Upload minh chứng
  // Bước 4: Kiểm tra & Xác nhận nộp hồ sơ
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Form State
  const [selectedMethod, setSelectedMethod] = useState<string>(methods[0]?.ma_phuong_thuc || "PT1");
  const [selectedProgram, setSelectedProgram] = useState<string>(programs[0]?.ma_chuong_trinh || "");
  const [selectedToHop, setSelectedToHop] = useState<string>("");
  const [rawScore, setRawScore] = useState<string>("");

  const [hoTen, setHoTen] = useState("");
  const [cccd, setCccd] = useState("");
  const [soDienThoai, setSoDienThoai] = useState("");
  const [email, setEmail] = useState("");
  const [khuVuc, setKhuVuc] = useState("KV2");
  const [doiTuongUuTien, setDoiTuongUuTien] = useState("NONE");

  // Checklist & Upload files
  const [uploadedFiles, setUploadedFiles] = useState<
    Array<{ id: string; loaiGiayTo: string; fileName: string; fileSize?: string; uploadedAt: string }>
  >([]);

  // Submission Status
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState<{
    maHoSo: string;
    cccd: string;
    hoTen: string;
  } | null>(null);

  // Lấy danh sách tổ hợp của chương trình đào tạo đang chọn
  const currentProgramData = programs.find((p) => p.ma_chuong_trinh === selectedProgram);
  const availableToHops = currentProgramData?.to_hop || ["A00", "A01", "D01", "D07"];

  // Checklist giấy tờ yêu cầu tương ứng với từng phương thức xét tuyển
  const getRequiredDocuments = (methodCode: string) => {
    switch (methodCode) {
      case "PT2": // Học bạ
        return [
          { key: "hoc_ba", title: "Bản sao công chứng Học bạ THPT (cả 3 năm)", required: true },
          { key: "cccd_doc", title: "Bản sao CCCD / Định danh cá nhân 2 mặt", required: true },
          { key: "giay_tot_nghiep", title: "Giấy chứng nhận tốt nghiệp THPT tạm thời / Bằng tốt nghiệp", required: true },
          { key: "uu_tien_doc", title: "Minh chứng đối tượng ưu tiên (nếu có)", required: false },
        ];
      case "PT3": // ĐGNL ĐHQG Hà Nội
      case "PT4": // ĐGTD ĐH Bách Khoa
        return [
          { key: "phieu_dgnl", title: "Phiếu báo điểm kết quả thi ĐGNL (HSA) hoặc ĐGTD (TSA)", required: true },
          { key: "cccd_doc", title: "Bản sao CCCD / Định danh cá nhân 2 mặt", required: true },
          { key: "hoc_ba", title: "Bản sao Học bạ THPT (để đối soát điều kiện sơ bộ)", required: true },
          { key: "uu_tien_doc", title: "Minh chứng đối tượng ưu tiên (nếu có)", required: false },
        ];
      case "PT5": // Xét kết hợp Chứng chỉ Quốc tế
        return [
          { key: "chung_chi_eng", title: "Bản sao chứng chỉ IELTS / TOEFL / SAT còn thời hạn", required: true },
          { key: "phieu_diem_thpt", title: "Phiếu điểm thi tốt nghiệp THPT (2 môn còn lại)", required: true },
          { key: "cccd_doc", title: "Bản sao CCCD / Định danh cá nhân 2 mặt", required: true },
          { key: "hoc_ba", title: "Bản sao công chứng Học bạ THPT", required: true },
        ];
      default: // PT1 - Thi tốt nghiệp THPT
        return [
          { key: "phieu_diem_thpt", title: "Giấy chứng nhận kết quả thi Tốt nghiệp THPT bản chính", required: true },
          { key: "cccd_doc", title: "Bản sao CCCD / Định danh cá nhân 2 mặt", required: true },
          { key: "giay_tot_nghiep", title: "Bản sao Giấy chứng nhận tốt nghiệp THPT tạm thời", required: true },
          { key: "uu_tien_doc", title: "Minh chứng diện ưu tiên tuyển sinh (nếu có)", required: false },
        ];
    }
  };

  const currentChecklist = getRequiredDocuments(selectedMethod);

  // Xử lý giả lập upload file minh chứng
  const handleSimulateUpload = (docTitle: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const newDoc = {
      id: Math.random().toString(),
      loaiGiayTo: docTitle,
      fileName: file.name,
      fileSize: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
      uploadedAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setUploadedFiles((prev) => [...prev.filter((f) => f.loaiGiayTo !== docTitle), newDoc]);
  };

  const handleRemoveFile = (docTitle: string) => {
    setUploadedFiles((prev) => prev.filter((f) => f.loaiGiayTo !== docTitle));
  };

  // Xác nhận nộp hồ sơ (Thuần Frontend UI/Client)
  const handleFinalSubmit = async () => {
    setSubmitError("");
    setIsSubmitting(true);

    try {
      // Giả lập độ trễ xử lý nộp hồ sơ của hệ thống (500ms)
      await new Promise((resolve) => setTimeout(resolve, 500));

      const randomSuffix = Math.random().toString(36).substring(2, 8).toUpperCase();
      const generatedMaHoSo = `UTC26-${randomSuffix}`;

      const newSubmission = {
        maHoSo: generatedMaHoSo,
        cccd: cccd.trim(),
        hoTen: hoTen.trim(),
        soDienThoai: soDienThoai.trim(),
        email: email.trim(),
        khuVuc,
        doiTuongUuTien,
        maPhuongThuc: selectedMethod,
        tenPhuongThuc: methods.find((m) => m.ma_phuong_thuc === selectedMethod)?.ten_phuong_thuc || selectedMethod,
        maChuongTrinh: selectedProgram,
        tenChuongTrinh: currentProgramData?.ten_chuong_trinh || selectedProgram,
        maToHop: selectedToHop || availableToHops[0] || "A00",
        tongDiemXetTuyen: rawScore ? Number(rawScore) : null,
        trangThai: "cho" as const,
        ketQuaGhiChu: "Đã tiếp nhận hồ sơ trực tuyến, đang chờ Hội đồng Tuyển sinh đối soát",
        ngayNop: new Date().toLocaleDateString("vi-VN", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        }),
        giayToDinhKem: uploadedFiles.map((f) => ({
          ma_chung_chi: f.id,
          loai_chung_chi: f.loaiGiayTo,
          diem_hoac_hang: "Đã tải lên",
          file_dinh_kem: f.fileName,
          trang_thai_duyet: "cho",
        })),
        historyTimeline: [
          {
            step: 1,
            title: "Nộp hồ sơ trực tuyến",
            time: new Date().toLocaleDateString("vi-VN", {
              hour: "2-digit",
              minute: "2-digit",
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            }),
            description: "Thí sinh đã hoàn tất nộp thông tin và tải lên các bản scan giấy tờ trên cổng tuyển sinh.",
            status: "COMPLETED" as const,
          },
          {
            step: 2,
            title: "Tiếp nhận & Kiểm tra tính hợp lệ",
            time: "Đang tiến hành",
            description: "Ban Thư ký tuyển sinh đang tiến hành đối soát minh chứng học bạ / chứng chỉ / điểm thi.",
            status: "CURRENT" as const,
          },
          {
            step: 3,
            title: "Công bố kết quả xét tuyển",
            time: "Theo kế hoạch",
            description: "Kết quả trúng tuyển chính thức sẽ được phê duyệt và gửi thông báo qua SMS/Email.",
            status: "PENDING" as const,
          },
        ],
      };

      // Lưu tạm vào localStorage / sessionStorage để trang /tra-cuu-ho-so có thể tra cứu ngay phía Client
      if (typeof window !== "undefined") {
        try {
          const existingListStr = localStorage.getItem("UTC_SUBMITTED_APPLICATIONS") || "[]";
          const existingList = JSON.parse(existingListStr);
          existingList.unshift(newSubmission);
          localStorage.setItem("UTC_SUBMITTED_APPLICATIONS", JSON.stringify(existingList));
        } catch (e) {
          // ignore
        }
      }

      setSubmitSuccess({
        maHoSo: generatedMaHoSo,
        cccd: cccd.trim(),
        hoTen: hoTen.trim(),
      });
      setCurrentStep(4);
    } catch (e: any) {
      setSubmitError("Lỗi xử lý nộp hồ sơ. Vui lòng thử lại.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col w-full space-y-7 pb-16">
      {/* 1. Header Banner Phong Cách Neo-Brutalism */}
      <div className="bg-[#fffdf7] p-6 lg:p-8 border-[3px] border-[#111827] shadow-[6px_6px_0px_#111827] rounded-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-52 h-52 bg-[#fdb712]/15 rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className="px-3 py-1 bg-[#0d1b4e] text-white font-stamp text-[12px] font-black border-[2px] border-[#111827] rounded-lg shadow-[2px_2px_0px_#111827]">
            CỔNG TUYỂN SINH K66
          </span>
          <span className="px-3 py-1 bg-[#fdb712] text-[#0d1b4e] font-stamp text-[12px] font-black border-[2px] border-[#111827] rounded-lg shadow-[2px_2px_0px_#111827]">
            NỘP HỒ SƠ TRỰC TUYẾN
          </span>
          <span className="px-3 py-1 bg-[#dcfce7] text-[#166534] font-bold text-[12px] border-[1.5px] border-[#111827] rounded-lg">
            Bảo mật & Đồng bộ trực tiếp CSDL UTC
          </span>
        </div>

        <h1 className="font-display font-black text-[26px] sm:text-[34px] text-[#0d1b4e] uppercase leading-tight tracking-tight">
          Hệ Thống Tiếp Nhận Hồ Sơ Xét Tuyển Trực Tuyến UTC
        </h1>

        <p className="text-[14px] text-[#4b5563] mt-2 max-w-4xl leading-relaxed">
          Thí sinh hoàn tất quy trình 4 bước: <strong>Chọn phương thức $\rightarrow$ Điền thông tin $\rightarrow$ Tải lên minh chứng checklist $\rightarrow$ Nhận Mã hồ sơ chính thức</strong> để theo dõi đối soát và công nhận trúng tuyển.
        </p>
      </div>

      <DisclaimerBanner />

      {/* 2. Thanh Tiến Trình 4 Bước Neo-Brutalism */}
      <div className="bg-white p-4 sm:p-6 border-[3px] border-[#111827] shadow-[5px_5px_0px_#111827] rounded-2xl">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { step: 1, title: "1. Chọn Phương Thức", icon: "tune" },
            { step: 2, title: "2. Thông Tin Thí Sinh", icon: "person" },
            { step: 3, title: "3. Checklist & Upload", icon: "fact_check" },
            { step: 4, title: "4. Xác Nhận Nộp", icon: "task_alt" },
          ].map((s) => {
            const isPassed = currentStep > s.step;
            const isCurrent = currentStep === s.step;

            return (
              <div
                key={s.step}
                className={`p-3 rounded-xl border-[2px] transition-all flex items-center gap-2.5 ${
                  isCurrent
                    ? "bg-[#0d1b4e] text-white border-[#111827] shadow-[3px_3px_0px_#111827]"
                    : isPassed
                    ? "bg-[#dcfce7] text-[#166534] border-[#16a34a]"
                    : "bg-[#faf3e6] text-[#6b7280] border-[#d1d5db]"
                }`}
              >
                <span
                  className={`w-7 h-7 rounded-lg font-black text-[12px] flex items-center justify-center shrink-0 border ${
                    isCurrent
                      ? "bg-[#fdb712] text-[#0d1b4e] border-[#111827]"
                      : isPassed
                      ? "bg-[#16a34a] text-white border-[#16a34a]"
                      : "bg-white text-[#9ca3af] border-[#d1d5db]"
                  }`}
                >
                  {isPassed ? "✓" : s.step}
                </span>
                <span className="font-display font-bold text-[13px] sm:text-[13.5px] truncate">
                  {s.title}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Nội Dung Từng Bước Nộp Hồ Sơ */}
      <div className="bg-white p-6 lg:p-8 border-[3px] border-[#111827] shadow-[6px_6px_0px_#111827] rounded-2xl space-y-6">
        {/* ===================== BƯỚC 1 ===================== */}
        {currentStep === 1 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="border-b-[2px] border-dashed border-[#e5e7eb] pb-3">
              <h3 className="font-display font-black text-[20px] text-[#0d1b4e] uppercase flex items-center gap-2">
                <span className="material-symbols-outlined text-[#0284c7]">tune</span>
                Bước 1: Chọn Phương Thức Tuyển Sinh & Nguyện Vọng Ngành
              </h3>
              <p className="text-[13px] text-[#6b7280]">
                Lựa chọn phương thức bạn dự định nộp và ngành đào tạo tại Cơ sở Hà Nội (GHA)
              </p>
            </div>

            {/* Chọn Phương thức */}
            <div>
              <label className="block text-[13px] font-black text-[#0d1b4e] uppercase mb-2">
                Phương thức xét tuyển:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {methods.map((m) => (
                  <button
                    key={m.ma_phuong_thuc}
                    type="button"
                    onClick={() => setSelectedMethod(m.ma_phuong_thuc)}
                    className={`p-4 rounded-xl border-[2.5px] text-left transition-all flex flex-col justify-between ${
                      selectedMethod === m.ma_phuong_thuc
                        ? "bg-[#e0f2fe] border-[#0284c7] shadow-[3px_3px_0px_#111827]"
                        : "bg-[#fffdf7] border-[#111827] hover:bg-[#faf3e6]"
                    }`}
                  >
                    <span className="px-2 py-0.5 bg-[#0d1b4e] text-white font-stamp text-[10.5px] font-bold rounded w-fit mb-2">
                      MÃ: {m.ma_phuong_thuc}
                    </span>
                    <span className="font-display font-bold text-[14px] text-[#0d1b4e] leading-snug">
                      {m.ten_phuong_thuc}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Chọn Ngành & Tổ hợp */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
              <div>
                <label className="block text-[13px] font-black text-[#0d1b4e] uppercase mb-1.5">
                  Ngành / Chương trình đào tạo đăng ký:
                </label>
                <select
                  value={selectedProgram}
                  onChange={(e) => setSelectedProgram(e.target.value)}
                  className="w-full px-3.5 py-3 bg-[#fffdf7] border-[2px] border-[#111827] rounded-xl font-bold text-[13.5px] text-[#0d1b4e] outline-none cursor-pointer"
                >
                  {programs.map((p) => (
                    <option key={p.ma_chuong_trinh} value={p.ma_chuong_trinh}>
                      {p.ma_chuong_trinh} - {p.ten_chuong_trinh}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[13px] font-black text-[#0d1b4e] uppercase mb-1.5">
                  Tổ hợp môn xét tuyển:
                </label>
                <select
                  value={selectedToHop || availableToHops[0]}
                  onChange={(e) => setSelectedToHop(e.target.value)}
                  className="w-full px-3.5 py-3 bg-[#fffdf7] border-[2px] border-[#111827] rounded-xl font-bold text-[13.5px] text-[#0d1b4e] outline-none cursor-pointer"
                >
                  {availableToHops.map((th) => (
                    <option key={th} value={th}>
                      Tổ hợp: {th}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Điểm tổng xét tuyển (dự kiến/đạt được) */}
            <div>
              <label className="block text-[13px] font-black text-[#0d1b4e] uppercase mb-1.5">
                Tổng điểm xét tuyển dự kiến (Thang 30):
              </label>
              <input
                type="number"
                step="0.05"
                placeholder="Ví dụ: 25.50"
                value={rawScore}
                onChange={(e) => setRawScore(e.target.value)}
                className="w-full sm:w-64 px-3.5 py-2.5 bg-[#fffdf7] border-[2px] border-[#111827] rounded-xl font-display font-black text-[16px] text-[#0d1b4e] outline-none"
              />
              <span className="text-[11.5px] text-[#6b7280] italic ml-2">
                * Có thể để trống nếu chưa có điểm thi chính thức.
              </span>
            </div>

            <div className="flex justify-end pt-4 border-t border-[#e5e7eb]">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="px-6 py-3 bg-[#0d1b4e] hover:bg-[#1e293b] text-white font-display font-black text-[14px] uppercase tracking-wider rounded-xl border-[2px] border-[#111827] shadow-[3px_3px_0px_#111827] flex items-center gap-2"
              >
                <span>Tiếp tục: Điền thông tin cá nhân</span>
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </button>
            </div>
          </div>
        )}

        {/* ===================== BƯỚC 2 ===================== */}
        {currentStep === 2 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="border-b-[2px] border-dashed border-[#e5e7eb] pb-3">
              <h3 className="font-display font-black text-[20px] text-[#0d1b4e] uppercase flex items-center gap-2">
                <span className="material-symbols-outlined text-[#16a34a]">person</span>
                Bước 2: Thông Tin Cá Nhân & Đối Tượng Ưu Tiên
              </h3>
              <p className="text-[13px] text-[#6b7280]">
                Vui lòng điền thông tin chính xác theo Căn cước công dân và học bạ THPT
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-[12.5px] font-black text-[#0d1b4e] uppercase mb-1.5">
                  Họ và tên thí sinh (*):
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: NGUYỄN VĂN AN"
                  value={hoTen}
                  onChange={(e) => setHoTen(e.target.value.toUpperCase())}
                  className="w-full px-3.5 py-2.5 bg-[#fffdf7] border-[2px] border-[#111827] rounded-xl font-bold text-[14px] text-[#0d1b4e] outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-[12.5px] font-black text-[#0d1b4e] uppercase mb-1.5">
                  Số CCCD / Mã định danh (*):
                </label>
                <input
                  type="text"
                  placeholder="Gồm 12 chữ số"
                  value={cccd}
                  maxLength={12}
                  onChange={(e) => setCccd(e.target.value.replace(/\D/g, ""))}
                  className="w-full px-3.5 py-2.5 bg-[#fffdf7] border-[2px] border-[#111827] rounded-xl font-bold text-[14px] text-[#0d1b4e] outline-none font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-[12.5px] font-black text-[#0d1b4e] uppercase mb-1.5">
                  Số điện thoại liên hệ (*):
                </label>
                <input
                  type="tel"
                  placeholder="Ví dụ: 0912345678"
                  value={soDienThoai}
                  onChange={(e) => setSoDienThoai(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#fffdf7] border-[2px] border-[#111827] rounded-xl font-bold text-[14px] text-[#0d1b4e] outline-none font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-[12.5px] font-black text-[#0d1b4e] uppercase mb-1.5">
                  Email nhận kết quả:
                </label>
                <input
                  type="email"
                  placeholder="email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#fffdf7] border-[2px] border-[#111827] rounded-xl font-bold text-[14px] text-[#0d1b4e] outline-none"
                />
              </div>

              <div>
                <label className="block text-[12.5px] font-black text-[#0d1b4e] uppercase mb-1.5">
                  Khu vực ưu tiên:
                </label>
                <select
                  value={khuVuc}
                  onChange={(e) => setKhuVuc(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#fffdf7] border-[2px] border-[#111827] rounded-xl font-bold text-[13.5px] text-[#0d1b4e] outline-none cursor-pointer"
                >
                  <option value="KV3">Khu vực 3 (Không cộng điểm)</option>
                  <option value="KV2">Khu vực 2 (+0.25 điểm)</option>
                  <option value="KV2-NT">Khu vực 2 - Nông thôn (+0.50 điểm)</option>
                  <option value="KV1">Khu vực 1 (+0.75 điểm)</option>
                </select>
              </div>

              <div>
                <label className="block text-[12.5px] font-black text-[#0d1b4e] uppercase mb-1.5">
                  Đối tượng chính sách ưu tiên:
                </label>
                <select
                  value={doiTuongUuTien}
                  onChange={(e) => setDoiTuongUuTien(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#fffdf7] border-[2px] border-[#111827] rounded-xl font-bold text-[13.5px] text-[#0d1b4e] outline-none cursor-pointer"
                >
                  <option value="NONE">Không thuộc đối tượng ưu tiên</option>
                  <option value="UT1">Nhóm ưu tiên 1 (Đối tượng 01 - 04: +2.0 điểm)</option>
                  <option value="UT2">Nhóm ưu tiên 2 (Đối tượng 05 - 07: +1.0 điểm)</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-[#e5e7eb]">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="px-5 py-2.5 bg-white text-[#111827] font-bold text-[13.5px] border-[2px] border-[#111827] rounded-xl hover:bg-[#f3f4f6]"
              >
                ← Quay lại bước 1
              </button>

              <button
                type="button"
                disabled={!hoTen.trim() || !cccd.trim() || !soDienThoai.trim()}
                onClick={() => setCurrentStep(3)}
                className={`px-6 py-3 font-display font-black text-[14px] uppercase tracking-wider rounded-xl border-[2px] border-[#111827] shadow-[3px_3px_0px_#111827] flex items-center gap-2 ${
                  hoTen.trim() && cccd.trim() && soDienThoai.trim()
                    ? "bg-[#0d1b4e] hover:bg-[#1e293b] text-white cursor-pointer"
                    : "bg-[#e5e7eb] text-[#9ca3af] cursor-not-allowed shadow-none"
                }`}
              >
                <span>Tiếp tục: Checklist hồ sơ & Upload</span>
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </button>
            </div>
          </div>
        )}

        {/* ===================== BƯỚC 3 ===================== */}
        {currentStep === 3 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="border-b-[2px] border-dashed border-[#e5e7eb] pb-3">
              <h3 className="font-display font-black text-[20px] text-[#0d1b4e] uppercase flex items-center gap-2">
                <span className="material-symbols-outlined text-[#ea580c]">fact_check</span>
                Bước 3: Checklist Giấy Tờ & Tải Lên Minh Chứng
              </h3>
              <p className="text-[13px] text-[#6b7280]">
                Kiểm tra danh mục giấy tờ bắt buộc theo phương thức xét tuyển và tải file scan (PDF, JPG, PNG)
              </p>
            </div>

            {/* Bảng Checklist Giấy Tờ Bắt Buộc */}
            <div className="space-y-3">
              {currentChecklist.map((item, idx) => {
                const uploaded = uploadedFiles.find((f) => f.loaiGiayTo === item.title);

                return (
                  <div
                    key={idx}
                    className={`p-4 rounded-xl border-[2px] border-[#111827] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                      uploaded ? "bg-[#f0fdf4] shadow-[2px_2px_0px_#16a34a]" : "bg-[#fffdf7] shadow-[2px_2px_0px_#111827]"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-[12px] font-black shrink-0 mt-0.5 border ${
                          uploaded ? "bg-[#16a34a] text-white border-[#16a34a]" : "bg-[#faf3e6] text-[#0d1b4e] border-[#111827]"
                        }`}
                      >
                        {uploaded ? "✓" : idx + 1}
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-display font-bold text-[14px] text-[#0d1b4e]">
                            {item.title}
                          </span>
                          {item.required ? (
                            <span className="px-2 py-0.2 bg-[#fee2e2] text-[#b91c1c] text-[10px] font-bold rounded border border-[#ef4444]">
                              BẮT BUỘC
                            </span>
                          ) : (
                            <span className="px-2 py-0.2 bg-[#f3f4f6] text-[#6b7280] text-[10px] font-bold rounded">
                              TÙY CHỌN
                            </span>
                          )}
                        </div>

                        {uploaded ? (
                          <p className="text-[12px] text-[#166534] font-medium mt-0.5 flex items-center gap-1">
                            <span className="material-symbols-outlined text-[15px]">attach_file</span>
                            Đã tải: <strong>{uploaded.fileName}</strong> ({uploaded.fileSize}) lúc {uploaded.uploadedAt}
                          </p>
                        ) : (
                          <p className="text-[12px] text-[#6b7280] mt-0.5">
                            Chấp nhận định dạng .pdf, .jpg, .png (Dung lượng tối đa 10MB)
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                      {uploaded ? (
                        <button
                          type="button"
                          onClick={() => handleRemoveFile(item.title)}
                          className="px-3 py-1.5 bg-[#fee2e2] hover:bg-[#fecaca] text-[#dc2626] font-bold text-[12px] rounded-lg border border-[#dc2626] flex items-center gap-1"
                        >
                          <span className="material-symbols-outlined text-[14px]">delete</span>
                          Xóa & tải lại
                        </button>
                      ) : (
                        <label className="px-4 py-2 bg-[#0284c7] hover:bg-[#0369a1] text-white font-bold text-[12px] rounded-lg border-[1.5px] border-[#111827] shadow-[2px_2px_0px_#111827] cursor-pointer flex items-center gap-1.5 transition-all active:translate-y-[1px]">
                          <span className="material-symbols-outlined text-[16px]">upload</span>
                          <span>Tải file lên</span>
                          <input
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            className="hidden"
                            onChange={(e) => handleSimulateUpload(item.title, e)}
                          />
                        </label>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Cảnh báo tính pháp lý của giấy tờ */}
            <div className="p-4 bg-[#fef3c7] border-[2px] border-[#f59e0b] rounded-xl text-[12.5px] text-[#92400e] space-y-1">
              <p className="font-bold flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[18px]">verified_user</span>
                Cam kết của thí sinh về tính chính xác:
              </p>
              <p className="leading-relaxed">
                Thí sinh hoàn toàn chịu trách nhiệm trước pháp luật về tính xác thực của các bản sao và văn bằng chứng chỉ tải lên. Nhà trường sẽ tiến hành đối chiếu bản gốc khi thí sinh làm thủ tục nhập học trực tiếp tại trường.
              </p>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-[#e5e7eb]">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="px-5 py-2.5 bg-white text-[#111827] font-bold text-[13.5px] border-[2px] border-[#111827] rounded-xl hover:bg-[#f3f4f6]"
              >
                ← Quay lại bước 2
              </button>

              <button
                type="button"
                onClick={() => setCurrentStep(4)}
                className="px-6 py-3 bg-[#0d1b4e] hover:bg-[#1e293b] text-white font-display font-black text-[14px] uppercase tracking-wider rounded-xl border-[2px] border-[#111827] shadow-[3px_3px_0px_#111827] flex items-center gap-2"
              >
                <span>Tiếp tục: Rà soát & Xác nhận nộp</span>
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </button>
            </div>
          </div>
        )}

        {/* ===================== BƯỚC 4: RÀ SOÁT & KẾT QUẢ NỘP ===================== */}
        {currentStep === 4 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {submitSuccess ? (
              /* Màn hình thông báo NỘP THÀNH CÔNG */
              <div className="p-6 bg-[#f0fdf4] border-[3px] border-[#16a34a] rounded-2xl shadow-[6px_6px_0px_#16a34a] space-y-5 text-center sm:text-left">
                <div className="flex flex-col sm:flex-row items-center gap-4 border-b border-[#bbf7d0] pb-4">
                  <div className="w-16 h-16 rounded-full bg-[#16a34a] text-white flex items-center justify-center shrink-0 border-[3px] border-[#111827] shadow-[2px_2px_0px_#111827]">
                    <span className="material-symbols-outlined text-[36px]">check</span>
                  </div>
                  <div>
                    <span className="px-3 py-0.5 bg-[#86efac] text-[#065f46] font-stamp text-[12px] font-black rounded-md border border-[#16a34a] uppercase">
                      ĐÃ TIẾP NHẬN HỒ SƠ
                    </span>
                    <h3 className="font-display font-black text-[24px] sm:text-[28px] text-[#14532d] mt-1">
                      NỘP HỒ SƠ XÉT TUYỂN TRỰC TUYẾN THÀNH CÔNG!
                    </h3>
                    <p className="text-[13.5px] text-[#166534]">
                      Hệ thống tuyển sinh Trường ĐH Giao thông Vận tải đã ghi nhận hồ sơ của bạn vào cơ sở dữ liệu.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white p-5 border-[2px] border-[#16a34a] rounded-xl text-[13.5px]">
                  <div>
                    <span className="text-[#64748b] block text-[12px] font-bold">MÃ HỒ SƠ CỦA BẠN:</span>
                    <span className="font-mono font-black text-[22px] text-[#0284c7] tracking-wider">
                      {submitSuccess.maHoSo}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#64748b] block text-[12px] font-bold">SỐ CCCD / ĐỊNH DANH:</span>
                    <span className="font-mono font-black text-[18px] text-[#0d1b4e]">
                      {submitSuccess.cccd}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#64748b] block text-[12px] font-bold">HỌ VÀ TÊN THÍ SINH:</span>
                    <span className="font-bold text-[16px] text-[#0d1b4e]">
                      {submitSuccess.hoTen}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#64748b] block text-[12px] font-bold">TRẠNG THÁI HIỆN TẠI:</span>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#fef3c7] text-[#92400e] font-bold text-[12px] rounded-lg border border-[#f59e0b]">
                      <span className="w-2 h-2 rounded-full bg-[#f59e0b] animate-pulse" />
                      Chờ Thư ký Tuyển sinh đối soát hồ sơ
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <Link
                    href={`/tra-cuu-ho-so?q=${encodeURIComponent(submitSuccess.maHoSo)}`}
                    className="px-6 py-3 bg-[#0284c7] hover:bg-[#0369a1] text-white font-display font-black text-[14px] uppercase tracking-wider rounded-xl border-[2px] border-[#111827] shadow-[3px_3px_0px_#111827] flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-[18px]">search_check</span>
                    <span>Tra Cứu Tiến Độ Hồ Sơ Ngay</span>
                  </Link>

                  <button
                    type="button"
                    onClick={() => {
                      setSubmitSuccess(null);
                      setCurrentStep(1);
                      setUploadedFiles([]);
                    }}
                    className="px-5 py-3 bg-white text-[#111827] font-bold text-[13.5px] border-[2px] border-[#111827] rounded-xl hover:bg-[#f3f4f6]"
                  >
                    Nộp thêm hồ sơ khác
                  </button>
                </div>
              </div>
            ) : (
              /* Màn hình RÀ SOÁT TRƯỚC KHI BẤM NỘP */
              <div className="space-y-6">
                <div className="border-b-[2px] border-dashed border-[#e5e7eb] pb-3">
                  <h3 className="font-display font-black text-[20px] text-[#0d1b4e] uppercase flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#16a34a]">task_alt</span>
                    Bước 4: Rà Soát Lại Toàn Bộ Thông Tin & Xác Nhận Nộp
                  </h3>
                  <p className="text-[13px] text-[#6b7280]">
                    Vui lòng kiểm tra kỹ lưỡng các thông tin dưới đây trước khi gửi lên cổng tuyển sinh
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 bg-[#fffdf7] p-5 border-[2px] border-[#111827] rounded-xl text-[13.5px]">
                  <div className="space-y-2">
                    <h4 className="font-display font-bold text-[15px] text-[#0d1b4e] border-b pb-1">
                      1. Thông tin đăng ký nguyện vọng:
                    </h4>
                    <p>
                      <strong>Phương thức:</strong> {methods.find((m) => m.ma_phuong_thuc === selectedMethod)?.ten_phuong_thuc} ({selectedMethod})
                    </p>
                    <p>
                      <strong>Chương trình:</strong> {currentProgramData?.ten_chuong_trinh} ({selectedProgram})
                    </p>
                    <p>
                      <strong>Tổ hợp môn:</strong> {selectedToHop || availableToHops[0]}
                    </p>
                    <p>
                      <strong>Điểm dự kiến:</strong> {rawScore ? `${rawScore} điểm` : "Chưa cập nhật"}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-display font-bold text-[15px] text-[#0d1b4e] border-b pb-1">
                      2. Thông tin thí sinh:
                    </h4>
                    <p>
                      <strong>Họ và tên:</strong> {hoTen || "Chưa nhập"}
                    </p>
                    <p>
                      <strong>Số CCCD:</strong> {cccd || "Chưa nhập"}
                    </p>
                    <p>
                      <strong>Số điện thoại:</strong> {soDienThoai || "Chưa nhập"}
                    </p>
                    <p>
                      <strong>Khu vực / Đối tượng:</strong> {khuVuc} - {doiTuongUuTien}
                    </p>
                  </div>
                </div>

                {/* Giấy tờ đã đính kèm */}
                <div>
                  <h4 className="font-display font-bold text-[14px] text-[#0d1b4e] mb-2">
                    3. Danh sách minh chứng đính kèm ({uploadedFiles.length} file):
                  </h4>
                  {uploadedFiles.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {uploadedFiles.map((f, i) => (
                        <div key={i} className="p-2.5 bg-white border border-[#111827] rounded-lg text-[12.5px] flex items-center gap-2">
                          <span className="material-symbols-outlined text-[18px] text-[#16a34a]">check_circle</span>
                          <span className="font-bold truncate">{f.loaiGiayTo}:</span>
                          <span className="text-[#64748b] truncate">{f.fileName}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[12.5px] text-[#ea580c] italic">
                      * Bạn chưa đính kèm file minh chứng nào. Bạn vẫn có thể nộp trước và bổ sung sau hoặc nộp trực tiếp tại trường.
                    </p>
                  )}
                </div>

                {submitError && (
                  <div className="p-3 bg-[#fee2e2] border-[1.5px] border-[#ef4444] rounded-xl text-[#b91c1c] font-bold text-[13px] flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px]">error</span>
                    <span>{submitError}</span>
                  </div>
                )}

                <div className="flex items-center justify-between pt-4 border-t border-[#e5e7eb]">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(3)}
                    className="px-5 py-2.5 bg-white text-[#111827] font-bold text-[13.5px] border-[2px] border-[#111827] rounded-xl hover:bg-[#f3f4f6]"
                  >
                    ← Quay lại bước 3
                  </button>

                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={handleFinalSubmit}
                    className="px-8 py-3.5 bg-[#ea580c] hover:bg-[#c2410c] text-white font-display font-black text-[15px] uppercase tracking-wider rounded-xl border-[2.5px] border-[#111827] shadow-[4px_4px_0px_#111827] transition-all flex items-center gap-2 active:translate-x-[1px] active:translate-y-[1px]"
                  >
                    {isSubmitting ? (
                      <>
                        <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Đang Lưu Hồ Sơ...</span>
                      </>
                    ) : (
                      <>
                        <span>Xác Nhận Nộp Hồ Sơ Chính Thức</span>
                        <span className="material-symbols-outlined text-[20px]">send</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

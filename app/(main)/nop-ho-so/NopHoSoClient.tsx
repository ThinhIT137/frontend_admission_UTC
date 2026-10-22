"use client";
import { publicError } from "@/libs/client-error";

import { useState } from "react";
import { toast } from "sonner";
import AcademicEvidenceFields, { AcademicDraft, emptyTranscript } from "./AcademicEvidenceFields";
import { academicPayload } from "./academic-payload";
import Link from "next/link";
import { DisclaimerBanner } from "@/components/ui/DisclaimerBanner";
import { submitApplication } from "./submit-api.server";
import CandidateSession from "@/components/CandidateSession";

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
  subjects?: Array<{ ma_mon: string; ten_mon: string }>;
}

export default function NopHoSoClient({ methods, programs, subjects = [] }: Props) {
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
    Array<{ id: string; loaiGiayTo: string; fileName: string; fileSize?: string; storageKey: string; uploadedAt: string }>
  >([]);

  const [year, setYear] = useState(new Date().getFullYear());
  const [preference, setPreference] = useState(1);
  const [academic, setAcademic] = useState<AcademicDraft>({ bang_diem: [emptyTranscript(new Date().getFullYear())], chung_chi: [], giai_thuong: [] });
  // Submission Status
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState<{
    maHoSo: string;
    cccd: string;
    hoTen: string;
  } | null>(null);
  const [hasCopied, setHasCopied] = useState(false);
  const [uploading, setUploading] = useState(false);

  const copyMaHoSo = (code: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(code);
      setHasCopied(true);
      setTimeout(() => setHasCopied(false), 2500);
    }
  };

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

  const handleSimulateUpload = async (docTitle: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    if (uploading) return;
    setUploading(true);
    const form = new FormData(); form.set("file", file); setSubmitError("");
    const previous = uploadedFiles.find(f => f.loaiGiayTo === docTitle);
    if (previous) form.set("key", previous.storageKey);
    try {
      const response = await fetch("/api/evidence", { method: previous ? "PUT" : "POST", body: form });
      const data = await response.json(); if (!response.ok) throw Error(data.message);
      const newDoc = { id: data.key, storageKey: data.key, loaiGiayTo: docTitle, fileName: file.name, fileSize: (file.size / 1048576).toFixed(2) + " MB", uploadedAt: new Date().toLocaleTimeString("vi-VN") };
      setUploadedFiles(prev => [...prev.filter(f => f.loaiGiayTo !== docTitle), newDoc]);
      toast.success(previous ? "Đã thay minh chứng" : "Đã tải minh chứng");
    } catch (err) { toast.error(publicError(err)); } finally { setUploading(false); e.target.value = ""; }
  };

  // Xác nhận nộp hồ sơ qua server action và API backend điểm.
  const handleFinalSubmit = async () => {
    if (uploading) { toast.error("Vui lòng chờ tải minh chứng hoàn tất."); return; }
    setSubmitError("");

    const trimmedCccd = cccd.trim();
    const trimmedHoTen = hoTen.trim();
    const trimmedPhone = soDienThoai.trim();

    if (!trimmedHoTen) {
      setSubmitError("Vui lòng nhập đầy đủ Họ và tên thí sinh.");
      return;
    }
    if (!trimmedCccd || trimmedCccd.length < 9) {
      setSubmitError("Vui lòng nhập đúng Số CCCD / Số định danh cá nhân hợp lệ (9-12 chữ số).");
      return;
    }
    if (!trimmedPhone || trimmedPhone.length < 10) {
      setSubmitError("Vui lòng nhập Số điện thoại liên lạc chính xác (tối thiểu 10 chữ số).");
      return;
    }
    if (!selectedProgram || !selectedMethod) {
      setSubmitError("Vui lòng chọn Nguyện vọng Chương trình đào tạo và Phương thức xét tuyển.");
      return;
    }

    setIsSubmitting(true);

    try {
      const evidence = academicPayload(academic);
      const linkedKeys = new Set([...evidence.chung_chi, ...evidence.giai_thuong].map(c => c.file_dinh_kem));
      const result = await submitApplication({
        cccd: trimmedCccd, ma_phuong_thuc: selectedMethod, ma_chuong_trinh: selectedProgram,
        profile: { ho_ten: trimmedHoTen, so_dien_thoai: trimmedPhone, khu_vuc: khuVuc, doi_tuong_uu_tien: doiTuongUuTien, ...(email.trim() ? {email:email.trim()} : {}) },
        ma_to_hop: selectedToHop || availableToHops[0] || undefined, nam_tuyen_sinh: year, nguyen_vong: preference,
        ...evidence,
        chung_chi: [...evidence.chung_chi, ...uploadedFiles.filter(f => !linkedKeys.has(f.storageKey)).map(f => ({ loai_chung_chi: "MINH_CHUNG: " + f.loaiGiayTo, diem_hoac_hang: "Không áp dụng — tài liệu hồ sơ", file_dinh_kem: f.storageKey }))],
      });

      if (!result.success || !result.maHoSo) {
        setSubmitError(publicError(result.error || "Lỗi lưu hồ sơ vào hệ thống tuyển sinh. Vui lòng kiểm tra lại kết nối."));
        return;
      }

      const generatedMaHoSo = result.maHoSo;

      setSubmitSuccess({
        maHoSo: generatedMaHoSo,
        cccd: trimmedCccd,
        hoTen: trimmedHoTen,
      });
      setCurrentStep(4);
    } catch (e: any) {
      setSubmitError(publicError(e?.message || "Lỗi hệ thống khi nộp hồ sơ. Vui lòng thử lại sau."));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col w-full space-y-7 pb-16">
      <CandidateSession onAuthenticated={user => {
        setHoTen(user.ho_ten); setCccd(user.cccd); setSoDienThoai(user.so_dien_thoai);
        fetch("/api/evidence?list=1").then(async response => {
          if (!response.ok) throw Error("Không tải được minh chứng");
          const files: Array<{key:string;name:string}> = await response.json();
          setUploadedFiles(files.map(f=>({id:f.key,storageKey:f.key,fileName:f.name,loaiGiayTo:f.key,uploadedAt:"Đã lưu"})));
        }).catch(error=>console.error("[Danh sách minh chứng]", error));
      }} onLogout={() => { setUploadedFiles([]); setCccd(""); setAcademic({bang_diem:[emptyTranscript(year)],chung_chi:[],giai_thuong:[]}); }} />
      <section className="border rounded-xl bg-white p-4 space-y-3"><h2 className="font-bold">Mùa tuyển sinh và nguyện vọng</h2>
        <label>Năm <input aria-label="Năm nộp hồ sơ" className="border p-2 w-24" type="number" min={2000} max={2100} value={year} onChange={e => setYear(Number(e.target.value))} /></label>
        <label className="ml-4">Nguyện vọng <input aria-label="Thứ tự nguyện vọng" className="border p-2 w-20" type="number" min={1} value={preference} onChange={e => setPreference(Number(e.target.value))} /></label>
      </section>
      <AcademicEvidenceFields value={academic} onChange={setAcademic} subjects={subjects} year={year} files={uploadedFiles} />
      <section className="border rounded-xl bg-white p-4 space-y-3"><h2 className="font-bold">Kho minh chứng của tôi</h2>
        <p className="text-sm">File lưu trong thư mục CCCD của tài khoản. Có thể dùng lại file đã có hoặc thay bằng file cùng định dạng khi hồ sơ chưa được xử lý. Tối đa 5 MB/file.</p>
        <label className="underline cursor-pointer">Tải thêm minh chứng chứng chỉ / giải thưởng<input type="file" className="block" disabled={uploading} accept=".pdf,.jpg,.jpeg,.png" onChange={e=>handleSimulateUpload("Tài liệu bổ sung " + Date.now(),e)} /></label>
        {uploading && <p role="status">Đang tải minh chứng…</p>}
        {uploadedFiles.map(f=><div key={f.storageKey} className="flex flex-wrap items-center gap-3"><a target="_blank" rel="noreferrer" className="underline" href={`/api/evidence?key=${encodeURIComponent(f.storageKey)}`}>{f.fileName}</a><label className="underline cursor-pointer">Thay file<input type="file" aria-label={"Thay file " + f.fileName} disabled={uploading} accept=".pdf,.jpg,.jpeg,.png" onChange={e=>handleSimulateUpload(f.loaiGiayTo,e)} /></label></div>)}
      </section>
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
            <div className="space-y-3" data-testid="application-checklist">
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
                            Đã tải: <a className="underline" target="_blank" rel="noreferrer" href={`/api/evidence?key=${encodeURIComponent(uploaded.storageKey)}`}>{uploaded.fileName}</a> ({uploaded.fileSize}) lúc {uploaded.uploadedAt}
                          </p>
                        ) : (
                          <p className="text-[12px] text-[#6b7280] mt-0.5">
                            Chấp nhận định dạng .pdf, .jpg, .png (Dung lượng tối đa 5MB)
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                      {!uploaded && uploadedFiles.length > 0 && <select aria-label={"Dùng minh chứng đã có: " + item.title} className="border rounded p-2" value="" onChange={e=>setUploadedFiles(prev=>prev.map(f=>f.storageKey===e.target.value?{...f,loaiGiayTo:item.title}:f))}><option value="">Dùng file đã có</option>{uploadedFiles.map(f=><option key={f.storageKey} value={f.storageKey}>{f.fileName}</option>)}</select>}
                      <label className="px-4 py-2 bg-blue-800 text-white rounded cursor-pointer">
                        {uploaded ? "Thay minh chứng" : "Tải file lên"}
                        <input type="file" aria-label={uploaded ? "Thay " + item.title : item.title} accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={e => handleSimulateUpload(item.title, e)} />
                      </label>
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
              <div className="p-6 bg-[#f0fdf4] border-[3px] border-[#16a34a] rounded-2xl shadow-[6px_6px_0px_#16a34a] space-y-5 text-center sm:text-left print:border-none print:shadow-none print:p-0">
                <div className="flex flex-col sm:flex-row items-center gap-4 border-b border-[#bbf7d0] pb-4">
                  <div className="w-16 h-16 rounded-full bg-[#16a34a] text-white flex items-center justify-center shrink-0 border-[3px] border-[#111827] shadow-[2px_2px_0px_#111827] print:hidden">
                    <span className="material-symbols-outlined text-[36px]">check</span>
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1 justify-center sm:justify-start">
                      <span className="px-3 py-0.5 bg-[#86efac] text-[#065f46] font-stamp text-[12px] font-black rounded-md border border-[#16a34a] uppercase">
                        ĐÃ TIẾP NHẬN HỒ SƠ
                      </span>
                      <span className="px-2.5 py-0.5 bg-[#dbeafe] text-[#1e40af] text-[11px] font-bold rounded-md border border-[#93c5fd]">
                        Chờ đối soát
                      </span>
                    </div>
                    <h3 className="font-display font-black text-[24px] sm:text-[28px] text-[#14532d] mt-1">
                      NỘP HỒ SƠ XÉT TUYỂN TRỰC TUYẾN THÀNH CÔNG!
                    </h3>
                    <p className="text-[13.5px] text-[#166534]">
                      Hệ thống tuyển sinh Trường ĐH Giao thông Vận tải đã tiếp nhận và cấp mã hồ sơ chính thức cho thí sinh.
                    </p>
                  </div>
                </div>

                {/* Thẻ hiển thị mã hồ sơ nổi bật */}
                <div className="bg-[#fffdf7] p-5 border-[2.5px] border-[#111827] rounded-xl shadow-[4px_4px_0px_#111827] flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div>
                    <span className="text-[12px] font-bold text-[#64748b] uppercase tracking-wider block">
                      MÃ HỒ SƠ XÉT TUYỂN (DÙNG ĐỂ TRA CỨU ĐỐI SOÁT):
                    </span>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="font-mono font-black text-[28px] sm:text-[32px] text-[#0284c7] tracking-wider select-all">
                        {submitSuccess.maHoSo}
                      </span>
                      <button
                        type="button"
                        onClick={() => copyMaHoSo(submitSuccess.maHoSo)}
                        className="px-3 py-1.5 bg-white hover:bg-[#f1f5f9] text-[#0f172a] text-[12px] font-bold rounded-lg border-[1.5px] border-[#111827] shadow-[1.5px_1.5px_0px_#111827] flex items-center gap-1 active:translate-x-0.5 active:translate-y-0.5 print:hidden"
                        title="Sao chép mã hồ sơ"
                      >
                        <span className="material-symbols-outlined text-[16px]">
                          {hasCopied ? "check" : "content_copy"}
                        </span>
                        <span>{hasCopied ? "Đã chép!" : "Sao chép"}</span>
                      </button>
                    </div>
                  </div>

                  <div className="text-right sm:border-l-[2px] sm:border-[#e2e8f0] sm:pl-6 w-full sm:w-auto">
                    <span className="text-[12px] font-bold text-[#64748b] block">THỜI GIAN TIẾP NHẬN:</span>
                    <span className="text-[14px] font-mono font-bold text-[#1e293b]">
                      {new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })} -{" "}
                      {new Date().toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" })}
                    </span>
                  </div>
                </div>

                {/* Thông tin tóm tắt hồ sơ */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white p-5 border-[2px] border-[#16a34a] rounded-xl text-[13.5px]">
                  <div>
                    <span className="text-[#64748b] block text-[12px] font-bold">HỌ VÀ TÊN THÍ SINH:</span>
                    <span className="font-bold text-[16px] text-[#0d1b4e]">
                      {submitSuccess.hoTen}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#64748b] block text-[12px] font-bold">SỐ CCCD / ĐỊNH DANH:</span>
                    <span className="font-mono font-black text-[16px] text-[#0d1b4e]">
                      {submitSuccess.cccd}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#64748b] block text-[12px] font-bold">CHƯƠNG TRÌNH XÉT TUYỂN:</span>
                    <span className="font-bold text-[#0d1b4e]">
                      {currentProgramData?.ten_chuong_trinh || selectedProgram}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#64748b] block text-[12px] font-bold">PHƯƠNG THỨC & TỔ HỢP:</span>
                    <span className="font-bold text-[#0d1b4e]">
                      {methods.find((m) => m.ma_phuong_thuc === selectedMethod)?.ten_phuong_thuc} ({selectedToHop || availableToHops[0] || "A00"})
                    </span>
                  </div>
                  <div className="sm:col-span-2 pt-2 border-t border-[#e2e8f0]">
                    <span className="text-[#64748b] block text-[12px] font-bold">TRẠNG THÁI HIỆN TẠI:</span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#fef3c7] text-[#92400e] font-bold text-[12.5px] rounded-lg border border-[#f59e0b] mt-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b] animate-pulse" />
                      Chờ Thư ký Tuyển sinh đối soát minh chứng (Dữ liệu đã sẵn sàng trên hệ thống)
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-2 print:hidden">
                  <Link
                    href={`/tra-cuu-ho-so?q=${encodeURIComponent(submitSuccess.maHoSo)}`}
                    className="px-6 py-3.5 bg-[#0284c7] hover:bg-[#0369a1] text-white font-display font-black text-[14px] uppercase tracking-wider rounded-xl border-[2px] border-[#111827] shadow-[3px_3px_0px_#111827] flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-[20px]">search_check</span>
                    <span>Tra Cứu Tiến Độ Hồ Sơ Này Ngay →</span>
                  </Link>

                  <button
                    type="button"
                    onClick={() => {
                      if (typeof window !== "undefined") window.print();
                    }}
                    className="px-5 py-3.5 bg-[#f8fafc] hover:bg-[#f1f5f9] text-[#0f172a] font-bold text-[13.5px] border-[2px] border-[#111827] shadow-[2px_2px_0px_#111827] rounded-xl flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-[18px]">print</span>
                    <span>In Phiếu Biên Nhận</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSubmitSuccess(null);
                      setCurrentStep(1);
                      setUploadedFiles([]);
                    }}
                    className="px-5 py-3.5 bg-white text-[#475569] font-bold text-[13.5px] border-[2px] border-[#cbd5e1] rounded-xl hover:bg-[#f8fafc] ml-auto"
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

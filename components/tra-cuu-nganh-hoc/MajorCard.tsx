import { Search, ArrowRight, GraduationCap, RotateCcw, Check, Building2, SlidersHorizontal, CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import type { MajorFromApi } from "@/app/(main)/tra-cuu-nganh-hoc/MajorLookupClient";

interface MajorCardProps {
    major: MajorFromApi;
    idx: number;
    selectedYear: number;
    selectedMethod?: string;
}

export default function MajorCard({ major, idx, selectedYear, selectedMethod = "PT1" }: MajorCardProps) {
    const historyList = major.lich_su_diem_chuan || [];

    // Find current year (selectedYear)
    const currentYear = selectedYear || 2026;

    // Danh sách chỉ chứa phương thức đã lọc trên server; không mượn chỉ tiêu năm cũ.
    const displayYear = currentYear;
    const scoreRecord = historyList.find(h => h.nam === currentYear)?.diem_trung_tuyen?.find(score => score.ma_phuong_thuc === selectedMethod && Number.isFinite(score.diem) && score.diem > 0);
    // Dự đoán hiện chưa lưu phương thức/thang điểm: ghi rõ để không nhầm với PT1.
    const prediction = [...(major.du_doan_diem_chuan ?? [])].filter(p => p.nam_du_doan === currentYear && Number.isFinite(p.diem_du_doan) && p.diem_du_doan > 0)
        .sort((a, b) => new Date(b.ngay_tinh_toan).getTime() - new Date(a.ngay_tinh_toan).getTime() || a.ma_du_doan_dc.localeCompare(b.ma_du_doan_dc))[0];
    const displayScore = scoreRecord?.diem ?? prediction?.diem_du_doan;
    const methodLabel = scoreRecord?.phuong_thuc?.ten_phuong_thuc ?? selectedMethod;
    const formattedScore = typeof displayScore === "number" && Number.isFinite(displayScore) && displayScore > 0 ? displayScore.toFixed(2) : "Chưa công bố";
    const latestQuota = historyList.find(h => h.nam === currentYear)?.chi_tieu ?? "Chưa công bố";

    // Extract combinations
    const combosSet = new Set<string>();
    major.ctdt_to_hop?.forEach((ct: any) => {
        if (ct.ma_to_hop) combosSet.add(ct.ma_to_hop);
    });
    const combinationsList = Array.from(combosSet);
    // Removed fake fallback combinations


    // Clean authentic label
    const categoryLabel = major.nganh?.khoi_kien_thuc || "ĐẠI HỌC CHÍNH QUY";

    return (
        <div className="bg-white border border-slate-200 shadow-sm rounded-[16px] p-5 flex flex-col relative hover:-translate-y-1 hover:shadow-md transition-all">
            {/* Header: Code & Faculty */}
            <div className="flex items-start justify-between gap-2 mb-3">
                <div className="bg-[#14244e] text-white px-2 py-0.5 rounded-[4px] font-stamp text-[11px] font-bold shrink-0">
                    MÃ: {major.ma_chuong_trinh}
                </div>
                <div className="text-[11px] text-[#0284c7] font-bold uppercase text-right leading-tight max-w-[65%] truncate">
                    {categoryLabel}
                </div>
            </div>

            {/* Title */}
            <h3 className="font-display font-extrabold text-[18px] text-[#14244e] leading-tight mb-3 min-h-[44px] ">
                {major.ten_chuong_trinh}
            </h3>

            {/* Description */}
            <p className="text-[12px] text-[#4b5563] leading-relaxed line-clamp-3 mb-5 flex-1">
                {major.de_cuong || "Đào tạo kỹ sư và chuyên gia chuyên môn cao, nắm vững kiến thức thực tiễn và sẵn sàng đáp ứng nhu cầu phát triển công nghệ hiện đại."}
            </p>

            {/* Stats Box */}
            <div className="flex border border-slate-200 rounded-[8px] overflow-hidden mb-5">
                <div className="flex-1 p-2.5 bg-white border-r border-slate-200">
                    <div className="text-[9px] font-bold text-[#6b7280] uppercase mb-0.5">
                        {scoreRecord ? "ĐIỂM CHUẨN" : prediction ? "ĐIỂM DỰ ĐOÁN" : "ĐIỂM CHUẨN"} {displayYear}{scoreRecord || !prediction ? ` · ${methodLabel}` : ""}
                    </div>
                    <div className="font-display font-black text-[22px] text-[#dc2626] leading-none">
                        {formattedScore}
                    </div>
                    {!scoreRecord && prediction && <p className="mt-2 text-[11px] leading-5 text-slate-500">Tham khảo · chưa xác định phương thức/thang điểm</p>}
                </div>
                <div className="flex-1 p-2.5 bg-white">
                    <div className="text-[9px] font-bold text-[#6b7280] uppercase mb-0.5">
                        CHỈ TIÊU {currentYear}
                    </div>
                    <div className="font-display font-black text-[18px] text-[#14244e] leading-none mt-1">
                        {latestQuota}{typeof latestQuota === "number" ? " SV" : ""}
                    </div>
                </div>
            </div>

            {/* Combinations */}
            <div className="flex items-center gap-2 mb-6 text-[12px]">
                <span className="text-[#6b7280] font-medium shrink-0">Tổ hợp:</span>
                <div className="flex gap-1.5 flex-wrap">
                    {combinationsList.map((c, i) => (
                        <span
                            key={i}
                            className="px-1.5 py-0.5 bg-white text-[#14244e] font-bold text-[10px] border border-slate-200 rounded-[4px]"
                        >
                            {c}
                        </span>
                    ))}
                </div>
            </div>

            {/* Footer Button: Xem Khung CTĐT & Chi Tiết */}
            <div className="mt-auto pt-2">
                <Link
                    href={`/tra-cuu-nganh-hoc/${major.ma_nganh}`}
                    className="w-full flex justify-center items-center gap-2 px-4 py-2.5 bg-[#0284c7] hover:bg-[#0369a1] text-white font-bold text-[13px] border border-slate-200 shadow-sm rounded-[10px] hover:translate-y-[1px] hover:shadow-md transition-all"
                >
                    <span>Xem Chi Tiết & Khung CTĐT</span>
                    <ArrowRight size={16} aria-hidden="true" />
                </Link>
            </div>
        </div>
    );
}

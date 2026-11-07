import { ArrowRight } from "lucide-react";
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

    // Clean authentic label
    const categoryLabel = major.nganh?.khoi_kien_thuc || "Đại học chính quy";
    const targetProgramId = major.ma_chuong_trinh || major.ma_nganh;

    return (
        <article className="group flex flex-col bg-white border border-slate-200/90 rounded-xl p-5 shadow-sm hover:shadow-md hover:border-blue-300 transition-all duration-200 relative">
            {/* Header: Code & Category */}
            <div className="flex items-center justify-between gap-2 mb-3">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-md bg-[#14244e] text-white font-mono text-[11px] font-semibold tracking-wide">
                    {major.ma_chuong_trinh}
                </span>
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider truncate max-w-[60%]">
                    {categoryLabel}
                </span>
            </div>

            {/* Title */}
            <h3 className="font-sans font-bold text-[17px] text-[#14244e] group-hover:text-blue-700 leading-snug mb-2 min-h-[44px] transition-colors">
                {major.ten_chuong_trinh}
            </h3>

            {/* Description */}
            <p className="text-[13px] text-slate-600 leading-relaxed line-clamp-3 mb-4 flex-1">
                {major.de_cuong || "Chương trình đào tạo chính quy theo chuẩn kiểm định chất lượng giáo dục quốc gia và quốc tế."}
            </p>

            {/* Stats Box */}
            <div className="grid grid-cols-2 divide-x divide-slate-100 bg-slate-50/80 border border-slate-100 rounded-lg p-3 mb-4">
                <div className="pr-3">
                    <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide mb-1">
                        {scoreRecord ? `Điểm chuẩn ${displayYear}` : prediction ? `Dự đoán ${displayYear}` : `Điểm chuẩn ${displayYear}`}
                    </p>
                    <div className="text-[20px] font-extrabold text-[#dc2626] leading-none tabular-nums">
                        {formattedScore}
                    </div>
                    {scoreRecord ? (
                        <p className="mt-1 text-[10px] text-slate-500 truncate">{methodLabel}</p>
                    ) : prediction ? (
                        <p className="mt-1 text-[10px] text-amber-700">Dự báo tham khảo</p>
                    ) : (
                        <p className="mt-1 text-[10px] text-slate-400">Đợi công bố Đề án</p>
                    )}
                </div>
                <div className="pl-3">
                    <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide mb-1">
                        Chỉ tiêu {currentYear}
                    </p>
                    <div className="text-[18px] font-bold text-[#14244e] leading-none mt-0.5 tabular-nums">
                        {latestQuota}{typeof latestQuota === "number" ? " SV" : ""}
                    </div>
                    <p className="mt-1 text-[10px] text-slate-500">Mã ngành: {major.ma_nganh}</p>
                </div>
            </div>

            {/* Combinations */}
            <div className="flex items-center gap-1.5 mb-5 text-[12px]">
                <span className="text-slate-500 font-medium text-[11px] shrink-0">Tổ hợp:</span>
                <div className="flex gap-1.5 flex-wrap">
                    {combinationsList.length > 0 ? (
                        combinationsList.map((c) => (
                            <span
                                key={c}
                                className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono text-[11px] font-medium rounded transition-colors"
                            >
                                {c}
                            </span>
                        ))
                    ) : (
                        <span className="text-[11px] text-slate-400">Theo thông báo tuyển sinh</span>
                    )}
                </div>
            </div>

            {/* Action Link */}
            <div className="mt-auto">
                <Link
                    href={`/tra-cuu-nganh-hoc/${targetProgramId}`}
                    className="w-full inline-flex justify-center items-center gap-2 px-4 py-2.5 bg-[#14244e] hover:bg-blue-800 text-white font-medium text-[13px] rounded-lg shadow-sm hover:shadow transition-all"
                >
                    <span>Xem khung CTĐT & chi tiết</span>
                    <ArrowRight size={15} aria-hidden="true" />
                </Link>
            </div>
        </article>
    );
}

import Link from "next/link";
import { MajorFromApi } from "@/app/(main)/tra-cuu-nganh-hoc/page";

interface MajorCardProps {
    major: MajorFromApi;
    idx: number;
    selectedYear: number;
}

export default function MajorCard({ major, idx, selectedYear }: MajorCardProps) {
    const historyList = major.lich_su_diem_chuan || [];

    // Find current year (selectedYear)
    const currentYear = selectedYear || 2026;
    const prevYear = currentYear - 1;

    const scoreCurrentYear = historyList.find((h: any) => h.nam === currentYear)?.diem_trung_tuyen?.[0]?.diem;
    const scorePrevYear = historyList.find((h: any) => h.nam === prevYear)?.diem_trung_tuyen?.[0]?.diem;

    let displayYear = currentYear;
    let displayScore = scoreCurrentYear;
    if (!displayScore) {
        displayYear = prevYear;
        displayScore = scorePrevYear;
    }

    const formattedScore = displayScore ? displayScore.toFixed(2) : "N/A";
    const currentYearQuota = historyList.find((h: any) => h.nam === displayYear)?.chi_tieu;
    const latestQuota = currentYearQuota || historyList[historyList.length - 1]?.chi_tieu || "N/A";

    // Extract combinations
    const combosSet = new Set<string>();
    major.ctdt_to_hop?.forEach((ct: any) => {
        if (ct.ma_to_hop) combosSet.add(ct.ma_to_hop);
    });
    const combinationsList = Array.from(combosSet);
    // Removed fake fallback combinations


    const badges = [
        { text: "HOT PICK ★", bg: "bg-[#fcd34d]", textCol: "text-[#111827]" },
        { text: "TOP RATED ⚡", bg: "bg-[#6ee7b7]", textCol: "text-[#111827]" },
        { text: "XE ĐIỆN & TỰ HÀNH", bg: "bg-[#e0f2fe]", textCol: "text-[#111827]" },
        { text: "TRUYỀN THỐNG UTC", bg: "bg-[#c4b5fd]", textCol: "text-[#111827]" },
        { text: "ĐÔ THỊ THÔNG MINH", bg: "bg-[#d1fae5]", textCol: "text-[#111827]" },
        { text: "MỚI RA MẮT 2026 ✨", bg: "bg-[#fbcfe8]", textCol: "text-[#111827]" },
    ];
    const badge = badges[idx % badges.length];

    return (
        <div className="bg-white border-[3px] border-[#111827] shadow-[6px_6px_0px_#111827] rounded-[16px] p-5 flex flex-col relative hover:-translate-y-1 hover:shadow-[8px_8px_0px_#111827] transition-all">
            {/* Floating Badge */}
            <div className={`absolute -top-4 left-4 px-3 py-0.5 border-[2px] border-[#111827] rounded-[6px] text-[10px] font-black uppercase tracking-wider shadow-[2px_2px_0px_#111827] ${badge.bg} ${badge.textCol}`}>
                {badge.text}
            </div>

            {/* Header: Code & Faculty */}
            <div className="flex items-start justify-between gap-2 mb-3 mt-1">
                <div className="bg-[#111827] text-white px-2 py-0.5 rounded-[4px] font-stamp text-[11px] font-bold shrink-0">
                    MÃ: {major.ma_chuong_trinh}
                </div>
                <div className="text-[10px] text-[#0284c7] font-bold uppercase text-right leading-tight max-w-[60%]">
                    {major.nganh?.khoi_kien_thuc || "KHOA ĐÀO TẠO"}
                </div>
            </div>

            {/* Title */}
            <h3 className="font-display font-extrabold text-[18px] text-[#111827] leading-tight mb-3 min-h-[44px] line-clamp-2">
                {major.ten_chuong_trinh}
            </h3>

            {/* Description */}
            <p className="text-[12px] text-[#4b5563] leading-relaxed line-clamp-3 mb-5 flex-1">
                {major.de_cuong || "Đào tạo kỹ sư và chuyên gia chuyên môn cao, nắm vững kiến thức thực tiễn và sẵn sàng đáp ứng nhu cầu phát triển công nghệ hiện đại."}
            </p>

            {/* Stats Box */}
            <div className="flex border-[2px] border-[#111827] rounded-[8px] overflow-hidden mb-5">
                <div className="flex-1 p-2.5 bg-[#fffdf7] border-r-[2px] border-[#111827]">
                    <div className="text-[9px] font-bold text-[#6b7280] uppercase mb-0.5">
                        ĐIỂM CHUẨN {displayYear}
                    </div>
                    <div className="font-display font-black text-[22px] text-[#dc2626] leading-none">
                        {formattedScore}
                    </div>
                </div>
                <div className="flex-1 p-2.5 bg-[#fffdf7]">
                    <div className="text-[9px] font-bold text-[#6b7280] uppercase mb-0.5">
                        CHỈ TIÊU TUYỂN
                    </div>
                    <div className="font-display font-black text-[18px] text-[#111827] leading-none mt-1">
                        {latestQuota} SV
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
                            className="px-1.5 py-0.5 bg-white text-[#111827] font-bold text-[10px] border border-[#111827] rounded-[4px]"
                        >
                            {c}
                        </span>
                    ))}
                </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center gap-3 mt-auto">
                <button className="flex-1 flex justify-center items-center gap-1.5 px-3 py-2 bg-white text-[#111827] font-bold text-[12px] border-[2px] border-[#111827] shadow-[2px_2px_0px_#111827] rounded-[8px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_#111827] transition-all">
                    <span className="material-symbols-outlined text-[14px]">compare_arrows</span>
                    So sánh
                </button>
                <Link
                    href={`/tra-cuu-nganh-hoc/${major.ma_nganh}`}
                    className="flex-1 flex justify-center items-center gap-1.5 px-3 py-2 bg-[#0284c7] text-white font-bold text-[12px] border-[2px] border-[#111827] shadow-[2px_2px_0px_#111827] rounded-[8px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_#111827] transition-all"
                >
                    Khung CTĐT
                    <span className="material-symbols-outlined text-[14px]">arrow_outward</span>
                </Link>
            </div>
        </div>
    );
}

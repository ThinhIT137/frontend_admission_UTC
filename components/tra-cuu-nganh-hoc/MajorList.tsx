import { Search, ArrowRight, GraduationCap, RotateCcw, Check, Building2, SlidersHorizontal, CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import type { MajorFromApi } from "@/app/(main)/tra-cuu-nganh-hoc/MajorLookupClient";
import MajorCard from "./MajorCard";

interface MajorListProps {
    dataNganhHoc: MajorFromApi[];
    selectedYear: number;
    selectedMethod?: string;
    currentPage: number;
    setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
    totalPages: number;
    pageSize: number;
}

export default function MajorList({
    dataNganhHoc,
    selectedYear,
    selectedMethod,
    currentPage,
    setCurrentPage,
    totalPages,
    pageSize,
}: MajorListProps) {
    if (dataNganhHoc.length === 0) {
        return (
            <div className="bg-white p-12 border border-slate-200 shadow-sm rounded-[16px] text-center space-y-3">
                <Search size={16} aria-hidden="true" />
                <h3 className="font-display font-bold text-[18px] text-[#14244e]">
                    Không tìm thấy ngành học phù hợp
                </h3>
                <p className="text-[13px] text-[#6b7280]">
                    Thử tìm kiếm với từ khóa khác hoặc bỏ chọn lọc khối kiến thức.
                </p>
            </div>
        );
    }

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-10 gap-x-6 mt-8">
                {dataNganhHoc.map((major, idx) => (
                    <MajorCard
                        key={major.ma_chuong_trinh}
                        major={major}
                        idx={idx}
                        selectedYear={selectedYear}
                        selectedMethod={selectedMethod}
                    />
                ))}
            </div>

            {/* Pagination Controls Bar */}
            {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 border border-slate-200 shadow-sm rounded-[12px] mt-6">
                    <div className="text-[13px] font-bold text-[#14244e]">
                        Hiển thị{" "}
                        <span className="text-[#0284c7]">
                            {(currentPage - 1) * pageSize + 1} -{" "}
                            {Math.min(
                                currentPage * pageSize,
                                dataNganhHoc.length + (currentPage - 1) * pageSize,
                            )}
                        </span>{" "}
                        trong tổng số{" "}
                        <span className="text-[#0284c7]">
                            {dataNganhHoc.length === pageSize ? "Nhiều hơn" : dataNganhHoc.length}
                        </span>{" "}
                        ngành học
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                            className="px-3 py-1.5 bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#fcd34d] text-[#14244e] font-bold text-[13px] border border-slate-200 shadow-sm rounded-[6px] transition-all flex items-center gap-1"
                        >
                            <ChevronLeft size={16} aria-hidden="true" />
                            Trang trước
                        </button>

                        <div className="flex items-center gap-1">
                            {Array.from({ length: totalPages }, (_, i) => i + 1)
                                .filter(
                                    (page) =>
                                        page === 1 ||
                                        page === totalPages ||
                                        Math.abs(page - currentPage) <= 2,
                                )
                                .map((page, idx, arr) => {
                                    const prev = arr[idx - 1];
                                    const showEllipsis = prev && page - prev > 1;
                                    return (
                                        <span key={page} className="flex items-center gap-1">
                                            {showEllipsis && (
                                                <span className="px-1 font-bold text-[#6b7280]">...</span>
                                            )}
                                            <button
                                                onClick={() => setCurrentPage(page)}
                                                className={`w-9 h-9 font-bold text-[13px] border border-slate-200 rounded-[6px] transition-all ${currentPage === page
                                                        ? "bg-[#0284c7] text-white shadow-sm"
                                                        : "bg-white text-[#14244e] hover:bg-[#fed7aa]"
                                                    }`}
                                            >
                                                {page}
                                            </button>
                                        </span>
                                    );
                                })}
                        </div>

                        <button
                            disabled={currentPage === totalPages}
                            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                            className="px-3 py-1.5 bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#fcd34d] text-[#14244e] font-bold text-[13px] border border-slate-200 shadow-sm rounded-[6px] transition-all flex items-center gap-1"
                        >
                            Trang sau
                            <ChevronRight size={16} aria-hidden="true" />
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}

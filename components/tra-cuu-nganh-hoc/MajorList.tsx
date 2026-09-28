import { MajorFromApi } from "@/app/(main)/tra-cuu-nganh-hoc/page";
import MajorCard from "./MajorCard";

interface MajorListProps {
    dataNganhHoc: MajorFromApi[];
    selectedYear: number;
    currentPage: number;
    setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
    totalPages: number;
    pageSize: number;
}

export default function MajorList({
    dataNganhHoc,
    selectedYear,
    currentPage,
    setCurrentPage,
    totalPages,
    pageSize,
}: MajorListProps) {
    if (dataNganhHoc.length === 0) {
        return (
            <div className="bg-white p-12 border-[3px] border-[#111827] shadow-[5px_5px_0px_#111827] rounded-[16px] text-center space-y-3">
                <span className="material-symbols-outlined text-[48px] text-[#9ca3af]">
                    search_off
                </span>
                <h3 className="font-display font-bold text-[18px] text-[#111827]">
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
                    />
                ))}
            </div>

            {/* Pagination Controls Bar */}
            {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 border-[3px] border-[#111827] shadow-[4px_4px_0px_#111827] rounded-[12px] mt-6">
                    <div className="text-[13px] font-bold text-[#111827]">
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
                            className="px-3 py-1.5 bg-[#faf3e6] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#fcd34d] text-[#111827] font-bold text-[13px] border-[2px] border-[#111827] shadow-[2px_2px_0px_#111827] rounded-[6px] transition-all flex items-center gap-1"
                        >
                            <span className="material-symbols-outlined text-[16px]">chevron_left</span>
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
                                                className={`w-9 h-9 font-bold text-[13px] border-[2px] border-[#111827] rounded-[6px] transition-all ${currentPage === page
                                                        ? "bg-[#0284c7] text-white shadow-[2px_2px_0px_#111827]"
                                                        : "bg-white text-[#111827] hover:bg-[#fed7aa]"
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
                            className="px-3 py-1.5 bg-[#faf3e6] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#fcd34d] text-[#111827] font-bold text-[13px] border-[2px] border-[#111827] shadow-[2px_2px_0px_#111827] rounded-[6px] transition-all flex items-center gap-1"
                        >
                            Trang sau
                            <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}

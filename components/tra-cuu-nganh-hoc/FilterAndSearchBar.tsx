import { KhoiNganh } from "@/app/generated/prisma/browser";
import { Dispatch, SetStateAction } from "react";

const FilterAndSearchBar = ({
    searchTerm,
    setSearchTerm,
    selectedFaculty,
    setSelectedFaculty,
    selectedToHop,
    setSelectedToHop,
    selectedDiemChuan,
    setSelectedDiemChuan,
    selectedYear,
    setSelectedYear,
    sortOption,
    setSortOption,
    data_khoa_vien,
    data_to_hop,
}: {
    // Tìm tên/ ngành
    searchTerm: string;
    setSearchTerm: Dispatch<SetStateAction<string>>;
    // Tìm theo khoa / viện
    selectedFaculty: string;
    setSelectedFaculty: Dispatch<SetStateAction<string>>;
    // Tìm theo tổ hợp
    selectedToHop: string;
    setSelectedToHop: Dispatch<SetStateAction<string>>;
    // Tìm theo điểm chuẩn
    selectedDiemChuan: number;
    setSelectedDiemChuan: Dispatch<SetStateAction<number>>;
    // Tìm theo năm
    selectedYear: number;
    setSelectedYear: Dispatch<SetStateAction<number>>;
    // Sắp xếp
    sortOption?: string;
    setSortOption?: Dispatch<SetStateAction<string>>;
    data_khoa_vien: KhoiNganh[];
    data_to_hop: any[];
}) => {
    const locNhanh = {
        toHopA00: () => {
            setSearchTerm("");
            setSelectedFaculty("");
            setSelectedToHop("A00");
            setSelectedDiemChuan(0);
            setSelectedYear(2026);
        },
        toHopA01: () => {
            setSearchTerm("");
            setSelectedFaculty("");
            setSelectedToHop("A01");
            setSelectedDiemChuan(0);
            setSelectedYear(2026);
        },
        toHopD01: () => {
            setSearchTerm("");
            setSelectedFaculty("");
            setSelectedToHop("D01");
            setSelectedDiemChuan(0);
            setSelectedYear(2026);
        },
        datlai: () => {
            setSearchTerm("");
            setSelectedFaculty("");
            setSelectedToHop("");
            setSelectedDiemChuan(0);
            setSelectedYear(2026);
        },
    };

    return (
        <div className="bg-white p-5 md:p-6 pt-7 md:pt-8 border-[3px] border-[#111827] shadow-[5px_5px_0px_#111827] rounded-[16px] relative flex flex-col gap-5">
            {/* QUICK SEARCH TOOL Badge */}
            <div className="absolute -top-4 right-6 px-3 py-1 bg-[#fdb712] border-[2px] border-[#111827] font-stamp text-[12px] font-bold text-[#111827] shadow-[2px_2px_0px_#111827]">
                QUICK SEARCH TOOL
            </div>

            {/* Top 5 Filters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                {/* TÌM TÊN / MÃ NGÀNH */}
                <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-bold text-[#0284c7] uppercase flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">
                            search
                        </span>
                        Tìm Tên / Mã Ngành
                    </label>
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Ví dụ: Logistics, CNTT,..."
                        className="w-full px-3 py-2 bg-white border-[2px] border-[#111827] rounded-[8px] font-bold text-[13px] text-[#111827] outline-none focus:shadow-[2px_2px_0px_#111827] transition-all placeholder:text-[#9ca3af] placeholder:font-normal"
                    />
                </div>

                {/* KHOA / VIỆN QUẢN LÝ */}
                <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-bold text-[#0284c7] uppercase flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">
                            domain
                        </span>
                        Khoa / Viện Quản Lý
                    </label>
                    <select
                        value={selectedFaculty}
                        onChange={(e) => setSelectedFaculty(e.target.value)}
                        className="w-full px-3 py-2 bg-white border-[2px] border-[#111827] rounded-[8px] font-bold text-[13px] text-[#111827] outline-none focus:shadow-[2px_2px_0px_#111827] transition-all appearance-none cursor-pointer"
                    >
                        <option value="">Tất cả các Khoa/ Viện</option>
                        {data_khoa_vien.map((data) => (
                            <option
                                key={data.ma_khoi_nganh}
                                value={data.ma_khoi_nganh}
                            >
                                {data.ten_khoi_nganh}
                            </option>
                        ))}
                    </select>
                </div>

                {/* TỔ HỢP XÉT TUYỂN */}
                <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-bold text-[#0284c7] uppercase flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">
                            checklist
                        </span>
                        Tổ Hợp Xét Tuyển
                    </label>
                    <select
                        value={selectedToHop}
                        onChange={(e) => setSelectedToHop(e.target.value)}
                        className="w-full px-3 py-2 bg-white border-[2px] border-[#111827] rounded-[8px] font-bold text-[13px] text-[#111827] outline-none focus:shadow-[2px_2px_0px_#111827] transition-all appearance-none cursor-pointer"
                    >
                        <option value="">Tất cả tổ hợp (A00, A01...)</option>
                        {data_to_hop?.map((toHop: any) => (
                            <option key={toHop.ma_to_hop} value={toHop.ma_to_hop}>
                                {toHop.ma_to_hop} ({toHop.mon_1?.ten_mon || toHop.ma_mon_1}, {toHop.mon_2?.ten_mon || toHop.ma_mon_2}, {toHop.mon_3?.ten_mon || toHop.ma_mon_3})
                            </option>
                        ))}
                    </select>
                </div>

                {/* MỨC ĐIỂM CHUẨN 2026 */}
                <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-bold text-[#0284c7] uppercase flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">
                            trending_up
                        </span>
                        Điểm tối đa tham khảo
                    </label>
                    <input
                        aria-label="Điểm tối đa tham khảo"
                        type="number"
                        min={0}
                        step={0.01}
                        placeholder="Không giới hạn"
                        value={selectedDiemChuan || ""}
                        onChange={(e) => setSelectedDiemChuan(Number(e.target.value))}
                        className="w-full px-3 py-2 bg-white border-[2px] border-[#111827] rounded-[8px] font-bold text-[13px] text-[#111827] outline-none focus:shadow-[2px_2px_0px_#111827] transition-all appearance-none cursor-pointer"
                    />
                </div>
                {/* NĂM HỌC */}
                <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-bold text-[#0284c7] uppercase flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">
                            calendar_month
                        </span>
                        Năm Tuyển Sinh
                    </label>
                    <select
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(Number(e.target.value))}
                        className="w-full px-3 py-2 bg-white border-[2px] border-[#111827] rounded-[8px] font-bold text-[13px] text-[#111827] outline-none focus:shadow-[2px_2px_0px_#111827] transition-all appearance-none cursor-pointer"
                    >
                        <option value={2026}>Năm 2026</option>
                        <option value={2025}>Năm 2025</option>
                        <option value={2024}>Năm 2024</option>
                        <option value={2023}>Năm 2023</option>
                    </select>
                </div>
            </div>

            {/* Separator */}
            <hr className="border-t-[2px] border-[#e5e7eb] w-full" />

            {/* Quick Filters and Sort Control */}
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
                <div className="flex flex-wrap items-center justify-start gap-2">
                    <span className="text-[11px] font-bold text-[#4b5563] uppercase flex items-center gap-1 mr-1">
                        <span className="material-symbols-outlined text-[14px]">
                            push_pin
                        </span>
                        Lọc Nhanh Tổ Hợp:
                    </span>
                    <button
                        onClick={() => locNhanh.toHopA00()}
                        className={`px-3 py-1 border-[2px] border-[#111827] rounded-full text-[11px] font-bold transition-all ${
                            selectedToHop === "A00"
                                ? "bg-[#0d1b4e] text-[#fdb712] shadow-[2px_2px_0px_#111827]"
                                : "bg-[#bae6fd] text-[#111827] hover:shadow-[2px_2px_0px_#111827]"
                        }`}
                    >
                        Tổ hợp A00 (Toán, Lý, Hóa)
                    </button>
                    <button
                        onClick={() => locNhanh.toHopA01()}
                        className={`px-3 py-1 border-[2px] border-[#111827] rounded-full text-[11px] font-bold transition-all ${
                            selectedToHop === "A01"
                                ? "bg-[#0d1b4e] text-[#fdb712] shadow-[2px_2px_0px_#111827]"
                                : "bg-[#38bdf8] text-[#111827] hover:shadow-[2px_2px_0px_#111827]"
                        }`}
                    >
                        Tổ hợp A01 (Toán, Lý, Anh)
                    </button>
                    <button
                        onClick={() => locNhanh.toHopD01()}
                        className={`px-3 py-1 border-[2px] border-[#111827] rounded-full text-[11px] font-bold transition-all ${
                            selectedToHop === "D01"
                                ? "bg-[#0d1b4e] text-[#fdb712] shadow-[2px_2px_0px_#111827]"
                                : "bg-[#fed7aa] text-[#111827] hover:shadow-[2px_2px_0px_#111827]"
                        }`}
                    >
                        Tổ hợp D01 (Toán, Văn, Anh)
                    </button>
                    <button
                        onClick={() => {
                            locNhanh.datlai();
                            if (setSortOption) setSortOption("score-desc");
                        }}
                        className="px-3 py-1 border-[2px] border-dashed border-[#111827] rounded-full text-[11px] font-bold text-[#111827] hover:bg-[#f3f4f6] transition-all whitespace-nowrap ml-1 cursor-pointer"
                    >
                        Đặt lại bộ lọc
                    </button>
                </div>

                {/* SẮP XẾP (SORT) */}
                {setSortOption && (
                    <div className="flex items-center gap-2 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-[#e5e7eb]">
                        <span className="text-[11px] font-black text-[#0d1b4e] uppercase flex items-center gap-1 shrink-0">
                            <span className="material-symbols-outlined text-[16px] text-[#0284c7]">
                                sort
                            </span>
                            Sắp xếp:
                        </span>
                        <select
                            value={sortOption || "score-desc"}
                            onChange={(e) => setSortOption(e.target.value)}
                            className="px-3 py-1.5 bg-[#faf3e6] border-[2px] border-[#111827] rounded-xl font-bold text-[12px] text-[#0d1b4e] outline-none cursor-pointer focus:shadow-[2px_2px_0px_#111827]"
                        >
                            <option value="score-desc">Điểm chuẩn: Cao → Thấp</option>
                            <option value="score-asc">Điểm chuẩn: Thấp → Cao</option>
                            <option value="default">Mặc định theo mã CTDT</option>
                            <option value="quota-desc">Chỉ tiêu: Nhiều nhất</option>
                            <option value="name-asc">Tên ngành: A → Z</option>
                            <option value="name-desc">Tên ngành: Z → A</option>
                        </select>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FilterAndSearchBar;

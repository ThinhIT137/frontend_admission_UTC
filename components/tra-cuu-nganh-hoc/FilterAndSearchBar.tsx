import { Search, ArrowRight, GraduationCap, RotateCcw, Check, Building2, SlidersHorizontal, CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
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
    availableYears,
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
    availableYears: number[];
}) => {
    const locNhanh = {
        datlai: () => {
            setSearchTerm("");
            setSelectedFaculty("");
            setSelectedToHop("");
            setSelectedDiemChuan(0);

        },
    };

    return (
        <div className="bg-white p-5 md:p-6 pt-7 md:pt-8 border border-slate-200 shadow-sm rounded-[16px] relative flex flex-col gap-5">
            {/* BỘ LỌC NGÀNH HỌC Badge */}
            <div className="self-start rounded-full bg-orange-50 px-3 py-1 text-xs font-bold text-orange-700">
                BỘ LỌC NGÀNH HỌC
            </div>

            {/* Top 5 Filters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                {/* TÌM TÊN / MÃ NGÀNH */}
                <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-bold text-[#0284c7] uppercase flex items-center gap-1">
                        <Search size={16} aria-hidden="true" />
                        Tìm Tên / Mã Ngành
                    </label>
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Ví dụ: Logistics, CNTT,..."
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-[8px] font-bold text-[13px] text-[#14244e] outline-none focus:shadow-sm transition-all placeholder:text-[#9ca3af] placeholder:font-normal"
                    />
                </div>

                {/* KHOA / VIỆN QUẢN LÝ */}
                <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-bold text-[#0284c7] uppercase flex items-center gap-1">
                        <Building2 size={16} aria-hidden="true" />
                        Khoa / Viện Quản Lý
                    </label>
                    <select
                        value={selectedFaculty}
                        onChange={(e) => setSelectedFaculty(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-[8px] font-bold text-[13px] text-[#14244e] outline-none focus:shadow-sm transition-all appearance-none cursor-pointer"
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
                        <SlidersHorizontal size={16} aria-hidden="true" />
                        Tổ Hợp Xét Tuyển
                    </label>
                    <select
                        value={selectedToHop}
                        onChange={(e) => setSelectedToHop(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-[8px] font-bold text-[13px] text-[#14244e] outline-none focus:shadow-sm transition-all appearance-none cursor-pointer"
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
                        <GraduationCap size={16} aria-hidden="true" />
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
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-[8px] font-bold text-[13px] text-[#14244e] outline-none focus:shadow-sm transition-all appearance-none cursor-pointer"
                    />
                </div>
                {/* NĂM HỌC */}
                <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-bold text-[#0284c7] uppercase flex items-center gap-1">
                        <CalendarDays size={16} aria-hidden="true" />
                        Năm Tuyển Sinh
                    </label>
                    <select
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(Number(e.target.value))}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-[8px] font-bold text-[13px] text-[#14244e] outline-none focus:shadow-sm transition-all appearance-none cursor-pointer"
                    >
                        {![...availableYears].includes(selectedYear) && <option value={selectedYear}>Năm {selectedYear} (chưa có dữ liệu)</option>}
                        {availableYears.map(year => <option key={year} value={year}>Năm {year}</option>)}
                    </select>
                </div>
            </div>

            {/* Separator */}
            <hr className="border-t-[2px] border-[#e5e7eb] w-full" />

            {/* Quick Filters and Sort Control */}
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
                <div className="flex flex-wrap items-center justify-start gap-2">
                    <span className="text-[11px] font-bold text-[#4b5563] uppercase flex items-center gap-1 mr-1">
                        <GraduationCap size={16} aria-hidden="true" />
                        Lọc Nhanh Tổ Hợp:
                    </span>
                    {data_to_hop.slice(0, 3).map((combination: any) => (
                        <button key={combination.ma_to_hop} type="button"
                            onClick={() => { setSearchTerm(""); setSelectedFaculty(""); setSelectedToHop(combination.ma_to_hop); setSelectedDiemChuan(0); }}
                            className={`rounded-full border px-3 py-1 text-[11px] font-bold transition-colors ${selectedToHop === combination.ma_to_hop ? "border-blue-950 bg-blue-950 text-white" : "border-blue-200 bg-blue-50 text-blue-900 hover:bg-blue-100"}`}>
                            {combination.ma_to_hop} ({combination.mon_1?.ten_mon ?? combination.ma_mon_1}, {combination.mon_2?.ten_mon ?? combination.ma_mon_2}, {combination.mon_3?.ten_mon ?? combination.ma_mon_3})
                        </button>
                    ))}
                    <button
                        onClick={() => {
                            locNhanh.datlai();
                            if (setSortOption) setSortOption("score-desc");
                        }}
                        className="px-3 py-1 border border-dashed border-slate-200 rounded-full text-[11px] font-bold text-[#14244e] hover:bg-[#f3f4f6] transition-all whitespace-nowrap ml-1 cursor-pointer"
                    >
                        Đặt lại bộ lọc
                    </button>
                </div>

                {/* SẮP XẾP (SORT) */}
                {setSortOption && (
                    <div className="flex items-center gap-2 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-[#e5e7eb]">
                        <span className="text-[11px] font-black text-[#0d1b4e] uppercase flex items-center gap-1 shrink-0">
                            <GraduationCap size={16} aria-hidden="true" />
                            Sắp xếp:
                        </span>
                        <select
                            value={sortOption || "score-desc"}
                            onChange={(e) => setSortOption(e.target.value)}
                            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-[12px] text-[#0d1b4e] outline-none cursor-pointer focus:shadow-sm"
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

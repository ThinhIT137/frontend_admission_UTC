"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type Dispatch, type SetStateAction } from "react";
import { getFilterCTDTAction } from "@/actions/chuong_trinh_dao_tao.action";
import type { KhoiNganh } from "@/app/generated/prisma/browser";
import FilterAndSearchBar from "@/components/tra-cuu-nganh-hoc/FilterAndSearchBar";
import Hero from "@/components/tra-cuu-nganh-hoc/Hero";
import MajorList from "@/components/tra-cuu-nganh-hoc/MajorList";
import { DisclaimerBanner } from "@/components/ui/DisclaimerBanner";
import PageMotion from "@/components/ui/PageMotion";
import { useLoading } from "@/contexts/loadingContext";
import { ArrowLeftRight, TrendingUp } from "lucide-react";

export type MajorFromApi = Awaited<ReturnType<typeof getFilterCTDTAction>>["data"][0];
type Result = Awaited<ReturnType<typeof getFilterCTDTAction>>;
export interface LookupFilters {
    page: number; pageSize: number; term: string; faculty: string; toHop: string;
    diemChuan: number; year: number; phuongThuc: string; sort: string;
}
interface Props {
    initialFilters: LookupFilters;
    initialResult: Result | null;
    faculties: KhoiNganh[];
    combinations: { ma_to_hop: string }[];
    initialError?: string;
    availableYears: number[];
    methods: { ma_phuong_thuc: string; ten_phuong_thuc: string }[];
}
export default function MajorLookupClient({ initialFilters, initialResult, faculties, combinations, availableYears, methods, initialError = "" }: Props) {
    const { beginLoading } = useLoading();
    const [filters, setFilters] = useState(initialFilters);
    const [queryTerm, setQueryTerm] = useState(initialFilters.term);
    const [dataNganhHoc, setDataNganhHoc] = useState(initialResult?.data ?? []);
    const [totalPages, setTotalPages] = useState(initialResult ? Math.max(1, Math.ceil(initialResult.total / initialFilters.pageSize)) : 0);
    const [error, setError] = useState(initialError);
    const [pending, setPending] = useState(false);
    const sequence = useRef(0);
    const interacted = useRef(false);
    const resultsStart = useRef<HTMLDivElement>(null);
    const scrollAfterPagination = useRef(false);
    const [completedPageRequest, setCompletedPageRequest] = useState(0);
    const { term: searchTerm, faculty: selectedFaculty, toHop: selectedToHop,
        diemChuan: selectedDiemChuan, year: selectedYear, phuongThuc: selectedMethod,
        page: currentPage, pageSize } = filters;
    const dataKhoaVien = faculties;
    const dataToHop = combinations;

    // Bộ lọc và số trang đổi cùng một lần, không gửi truy vấn với trang cũ.
    function field<K extends keyof LookupFilters>(key: K): Dispatch<SetStateAction<LookupFilters[K]>> {
        return value => {
            scrollAfterPagination.current = false;
            interacted.current = true;
            sequence.current += 1;
            setPending(true);
            // Chọn bộ lọc là thao tác xác nhận: gửi cả chữ đang gõ ngay,
            // không tiếp tục chờ timer tìm kiếm trước đó.
            if (key !== "term") setQueryTerm(filters.term);
            setFilters(previous => ({ ...previous, page: 1,
                [key]: typeof value === "function" ? (value as (old: LookupFilters[K]) => LookupFilters[K])(previous[key]) : value }));
        };
    }
    const setSearchTerm = field("term");
    const setSelectedFaculty = field("faculty");
    const setSelectToHop = field("toHop");
    const setSelectedDiemChuan = field("diemChuan");
    const setSelectedYear = field("year");
    const setSelectedMethod = field("phuongThuc");
    const setSortOption = field("sort");
    const setCurrentPage: Dispatch<SetStateAction<number>> = value => {
        scrollAfterPagination.current = true;
        interacted.current = true;
        sequence.current += 1;
        setPending(true);
        setQueryTerm(filters.term);
        setFilters(previous => ({ ...previous, page: typeof value === "function" ? value(previous.page) : value }));
    };

    // Chỉ chờ khi gõ chữ; dropdown và phân trang không bị trì hoãn 300 ms.
    useEffect(() => {
        if (filters.term === queryTerm) return;
        const timer = setTimeout(() => setQueryTerm(filters.term), 300);
        return () => clearTimeout(timer);
    }, [filters.term, queryTerm]);
    useEffect(() => {
        // Dữ liệu đã có từ server. Cả hai lượt effect của StrictMode đều bỏ qua mount.
        if (!interacted.current) return;
        if (filters.term !== queryTerm) return;
        const requestId = ++sequence.current;
        const release = beginLoading();
        let active = true;
        setPending(true);
        setError("");
        getFilterCTDTAction({ ...filters, term: queryTerm }).then(result => {
            if (!active || requestId !== sequence.current) return;
            setDataNganhHoc(result.data);
            setTotalPages(Math.max(1, Math.ceil(result.total / pageSize)));
            if (scrollAfterPagination.current) {
                scrollAfterPagination.current = false;
                setCompletedPageRequest(requestId);
            }
        }).catch(err => {
            if (!active || requestId !== sequence.current) return;
            console.error("Không tải được danh sách ngành học:", err);
            // Không gắn kết quả của bộ lọc cũ vào lựa chọn mới sau khi truy vấn lỗi.
            setDataNganhHoc([]);
            setTotalPages(0);
            setError("Không thể tải danh sách ngành học. Vui lòng thử lại.");
        }).finally(() => {
            release();
            if (active && requestId === sequence.current) setPending(false);
        });
        return () => { active = false; release(); };
    }, [filters, queryTerm, pageSize, beginLoading]);

    // Đợi React cập nhật thẻ chương trình mới rồi mới cuộn, không cuộn lúc mount.
    useEffect(() => {
        if (!completedPageRequest) return;
        resultsStart.current?.scrollIntoView({
            block: "start",
            behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
        });
    }, [completedPageRequest]);

    return (
        <PageMotion className="flex flex-col w-full space-y-6 pb-16 text-slate-900">
            {/* Title Header Card */}
            <Hero />

            {/* Quick Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-white border border-slate-200/90 rounded-xl px-4 py-3 shadow-xs">
                <div className="flex flex-wrap items-center gap-3">
                    <label className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                        <span>Phương thức lọc điểm:</span>
                        <select
                            className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-800 transition-colors focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
                            aria-label="Phương thức lọc ngành"
                            value={selectedMethod}
                            onChange={e => setSelectedMethod(e.target.value)}
                        >
                            {!methods.length && <option value={selectedMethod}>Chưa tải được phương thức</option>}
                            {methods.map(method => (
                                <option key={method.ma_phuong_thuc} value={method.ma_phuong_thuc}>
                                    {method.ma_phuong_thuc} · {method.ten_phuong_thuc}
                                </option>
                            ))}
                        </select>
                    </label>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-xs font-medium">
                    <Link
                        href="/so-sanh-chuong-trinh"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 transition-colors"
                    >
                        <ArrowLeftRight size={13} className="text-slate-500" />
                        <span>So sánh chương trình</span>
                    </Link>
                    <Link
                        href="/du-bao-tuyen-sinh"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200/60 transition-colors"
                    >
                        <TrendingUp size={13} className="text-blue-600" />
                        <span>Dự báo điểm chuẩn</span>
                    </Link>
                </div>
            </div>

            <DisclaimerBanner />

            {/* Filter and Search Bar */}
            <FilterAndSearchBar
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                selectedFaculty={selectedFaculty}
                setSelectedFaculty={setSelectedFaculty}
                selectedToHop={selectedToHop}
                setSelectedToHop={setSelectToHop}
                selectedDiemChuan={selectedDiemChuan}
                setSelectedDiemChuan={setSelectedDiemChuan}
                selectedYear={selectedYear}
                setSelectedYear={setSelectedYear}
                sortOption={filters.sort}
                setSortOption={setSortOption}
                data_khoa_vien={dataKhoaVien}
                data_to_hop={dataToHop}
                availableYears={availableYears}
            />

            <div role="status" aria-live="polite" className="text-xs text-slate-500 italic">
                {pending ? "Đang cập nhật danh sách chương trình..." : ""}
            </div>
            {error && <p role="alert" className="text-xs font-semibold text-red-700">{error}</p>}

            {/* Giữ kết quả trước trong lúc tải để tránh nhấp nháy toàn trang. */}
            <div ref={resultsStart} className="scroll-mt-24" aria-busy={pending}>
                {(dataNganhHoc.length > 0 || !error) && (
                    <MajorList
                        dataNganhHoc={dataNganhHoc}
                        selectedYear={selectedYear}
                        currentPage={currentPage}
                        selectedMethod={selectedMethod}
                        setCurrentPage={setCurrentPage}
                        totalPages={totalPages}
                        pageSize={pageSize}
                    />
                )}
            </div>
        </PageMotion>
    );
}

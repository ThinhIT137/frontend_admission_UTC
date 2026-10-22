"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { getFilterCTDTAction } from "@/actions/chuong_trinh_dao_tao.action";
import { getAllKhoiNganh } from "@/actions/khoi_nganh.action";
import { getAllToHopAction } from "@/actions/to_hop_xet_tuyen.action";
import { KhoiNganh } from "@/app/generated/prisma/browser";
import FilterAndSearchBar from "@/components/tra-cuu-nganh-hoc/FilterAndSearchBar";
import Hero from "@/components/tra-cuu-nganh-hoc/Hero";
import MajorList from "@/components/tra-cuu-nganh-hoc/MajorList";
import { DisclaimerBanner } from "@/components/ui/DisclaimerBanner";
import { useLoading } from "@/contexts/loadingContext";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

export type MajorFromApi = Awaited<ReturnType<typeof getFilterCTDTAction>>["data"][0];

function MajorLookupContent() {
    const { setLoading } = useLoading();
    const searchParams = useSearchParams();
    const initialFacultyParam = searchParams.get("faculty") || searchParams.get("khoi") || searchParams.get("khoi_nganh") || "";

    const [dataKhoaVien, setDataKhoaVien] = useState<KhoiNganh[]>([]);
    const [dataToHop, setDataToHop] = useState<any[]>([]);
    const [dataNganhHoc, setDataNganhHoc] = useState<
        Awaited<ReturnType<typeof getFilterCTDTAction>>["data"]
    >([]);
    // selected
    const [searchTerm, setSearchTerm] = useState(searchParams.get("term") || "");
    const [selectedFaculty, setSelectedFaculty] = useState(initialFacultyParam);
    const [selectedToHop, setSelectToHop] = useState("");
    const [selectedDiemChuan, setSelectedDiemChuan] = useState<number>(0);
    const [selectedYear, setSelectedYear] = useState<number>(2026);
    const [selectedMethod, setSelectedMethod] = useState("PT1");
    const [sortOption, setSortOption] = useState<string>("score-desc");

    // Sync when searchParams change in URL
    useEffect(() => {
        const param = searchParams.get("faculty") || searchParams.get("khoi") || searchParams.get("khoi_nganh") || "";
        if (param) {
            setSelectedFaculty(param);
        }
    }, [searchParams]);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState<number>(0);
    const pageSize = 9;

    // Lấy danh sách Khoa/Viện & Tổ hợp (chỉ chạy 1 lần)
    const fetchInitialData = async () => {
        try {
            const [khoaVienData, toHopData] = await Promise.all([
                getAllKhoiNganh(),
                getAllToHopAction(),
            ]);
            setDataKhoaVien(khoaVienData);
            setDataToHop(toHopData);
        } catch (err) {
            console.error("Lỗi tải dữ liệu ban đầu:", err);
        }
    };

    // Lấy danh sách Ngành Học (chạy mỗi khi filter thay đổi)
    const fetchNganhHoc = async () => {
        try {
            setLoading(true);
            const res = await getFilterCTDTAction({
                page: currentPage,
                pageSize,
                term: searchTerm,
                toHop: selectedToHop,
                diemChuan: selectedDiemChuan,
                phuongThuc: selectedMethod,
                faculty: selectedFaculty,
                year: selectedYear,
            });
            setDataNganhHoc(res?.data || []);
            setTotalPages(res?.total ? Math.ceil(res.total / pageSize) : 1);
        } catch (err) {
            console.error("Lỗi tải ngành học:", err);
            setDataNganhHoc([]);
        } finally {
            setLoading(false);
        }
    };

    // Mount: lấy Khoa/Viện & Tổ hợp 1 lần
    useEffect(() => {
        fetchInitialData();
    }, []);

    // Bộ lọc thay đổi → reset về trang 1
    useEffect(() => {
        setCurrentPage(1);
    }, [
        searchTerm,
        selectedFaculty,
        selectedToHop,
        selectedDiemChuan,
        selectedMethod,
        selectedYear,
        sortOption,
    ]);

    // Khi trang hoặc bộ lọc thay đổi → debounce 300ms → fetch API
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchNganhHoc();
        }, 300);
        return () => clearTimeout(timer);
    }, [
        searchTerm,
        selectedFaculty,
        selectedToHop,
        selectedDiemChuan,
        selectedMethod,
        selectedYear,
        currentPage,
    ]);

    // Xử lý sắp xếp (Sort) phía client trên tập dữ liệu hiển thị
    const sortedNganhHoc = [...dataNganhHoc].sort((a, b) => {
        if (sortOption === "name-asc") {
            return a.ten_chuong_trinh.localeCompare(b.ten_chuong_trinh, "vi");
        }
        if (sortOption === "name-desc") {
            return b.ten_chuong_trinh.localeCompare(a.ten_chuong_trinh, "vi");
        }
        if (sortOption === "score-desc" || sortOption === "score-asc") {
            const scoreA =
                a.lich_su_diem_chuan?.find((h: any) => h.nam === selectedYear)?.diem_trung_tuyen?.[0]?.diem ||
                a.lich_su_diem_chuan?.[0]?.diem_trung_tuyen?.[0]?.diem ||
                0;
            const scoreB =
                b.lich_su_diem_chuan?.find((h: any) => h.nam === selectedYear)?.diem_trung_tuyen?.[0]?.diem ||
                b.lich_su_diem_chuan?.[0]?.diem_trung_tuyen?.[0]?.diem ||
                0;
            return sortOption === "score-desc" ? scoreB - scoreA : scoreA - scoreB;
        }
        if (sortOption === "quota-desc") {
            const quotaA =
                a.lich_su_diem_chuan?.find((h: any) => h.nam === selectedYear)?.chi_tieu ||
                a.lich_su_diem_chuan?.[0]?.chi_tieu ||
                0;
            const quotaB =
                b.lich_su_diem_chuan?.find((h: any) => h.nam === selectedYear)?.chi_tieu ||
                b.lich_su_diem_chuan?.[0]?.chi_tieu ||
                0;
            return quotaB - quotaA;
        }
        return 0;
    });

    return (
        <div className="flex flex-col w-full space-y-6 pb-12">
            {/* Title Header Card */}
            <Hero />
            <Link className="underline font-bold" href="/so-sanh-chuong-trinh">So sánh chương trình và lịch sử điểm chuẩn</Link>
            <DisclaimerBanner />
            <label className="font-bold">Phương thức lọc điểm <select className="border rounded p-2 ml-3" aria-label="Phương thức lọc ngành" value={selectedMethod} onChange={e => setSelectedMethod(e.target.value)}>
              <option value="PT1">THPT (thang 30)</option><option value="PT2">Học bạ</option><option value="PT3">ĐGNL</option><option value="PT4">ĐGTD</option><option value="PT5">Kết hợp</option>
            </select></label>
            <Link className="underline" href="/du-bao-tuyen-sinh">Dự báo điểm chuẩn và đánh giá theo điểm môn</Link>
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
                sortOption={sortOption}
                setSortOption={setSortOption}
                data_khoa_vien={dataKhoaVien}
                data_to_hop={dataToHop}
            />
            {/* Major Cards Grid and Pagination */}
            <MajorList
                dataNganhHoc={sortedNganhHoc}
                selectedYear={selectedYear}
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
                totalPages={totalPages}
                pageSize={pageSize}
            />
        </div>
    );
}

export default function MajorLookupPage() {
    return (
        <Suspense fallback={<LoadingSpinner label="Đang tải dữ liệu tra cứu ngành học..." />}>
            <MajorLookupContent />
        </Suspense>
    );
}

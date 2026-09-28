"use client";

import { getFilterCTDTAction } from "@/actions/chuong_trinh_dao_tao.action";
import { getAllKhoiNganh } from "@/actions/khoi_nganh.action";
import { getAllToHopAction } from "@/actions/to_hop_xet_tuyen.action";
import { KhoiNganh } from "@/app/generated/prisma/browser";
import FilterAndSearchBar from "@/components/tra-cuu-nganh-hoc/FilterAndSearchBar";
import Hero from "@/components/tra-cuu-nganh-hoc/Hero";
import MajorList from "@/components/tra-cuu-nganh-hoc/MajorList";
import { DisclaimerBanner } from "@/components/ui/DisclaimerBanner";
import { useLoading } from "@/contexts/loadingContext";
import Link from "next/link";
import { useEffect, useState } from "react";

export type MajorFromApi = Awaited<ReturnType<typeof getFilterCTDTAction>>["data"][0];

export default function MajorLookupPage() {
    const { setLoading } = useLoading();
    const [dataKhoaVien, setDataKhoaVien] = useState<KhoiNganh[]>([]);
    const [dataToHop, setDataToHop] = useState<any[]>([]);
    const [dataNganhHoc, setDataNganhHoc] = useState<
        Awaited<ReturnType<typeof getFilterCTDTAction>>["data"]
    >([]);
    // selected
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedFaculty, setSelectedFaculty] = useState("");
    const [selectedToHop, setSelectToHop] = useState("");
    const [selectedDiemChuan, setSelectedDiemChuan] = useState<number>(0);
    const [selectedYear, setSelectedYear] = useState<number>(2026);

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
            console.log({
                page: currentPage,
                pageSize,
                term: searchTerm,
                toHop: selectedToHop,
                diemChuan: selectedDiemChuan,
                faculty: selectedFaculty,
                year: selectedYear,
            });
            setLoading(true);
            const res = await getFilterCTDTAction({
                page: currentPage,
                pageSize,
                term: searchTerm,
                toHop: selectedToHop,
                diemChuan: selectedDiemChuan,
                faculty: selectedFaculty,
                year: selectedYear,
            });
            // Lấy data và totalPages từ object trả về
            setDataNganhHoc(res?.data || []);
            setTotalPages(res?.total ? Math.ceil(res.total / pageSize) : 1);
            console.log(res?.data);
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
        selectedYear,
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
        selectedYear,
        currentPage,
    ]);

    return (
        <div className="flex flex-col w-full space-y-6 pb-12">
            {/* Title Header Card */}
            <Hero />
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
                data_khoa_vien={dataKhoaVien}
                data_to_hop={dataToHop}
            />
            {/* Major Cards Grid and Pagination */}
            <MajorList
                dataNganhHoc={dataNganhHoc}
                selectedYear={selectedYear}
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
                totalPages={totalPages}
                pageSize={pageSize}
            />
        </div>
    );
}

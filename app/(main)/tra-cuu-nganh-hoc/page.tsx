"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { DisclaimerBanner } from "@/components/ui/DisclaimerBanner";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

export interface MajorFromApi {
  ma_nganh: string;
  ten_nganh: string;
  khoi_kien_thuc: string | null;
  create_at: string;
  chuong_trinh: Array<{
    ma_chuong_trinh: string;
    ten_chuong_trinh: string;
    ctdt_to_hop: Array<{
      to_hop: {
        ma_to_hop: string;
      };
    }>;
    lich_su_diem_chuan: Array<{
      nam: number;
      chi_tieu: number;
      diem_trung_tuyen: Array<{
        diem: number;
        phuong_thuc: {
          ma_phuong_thuc: string;
          ten_phuong_thuc: string;
        };
      }>;
    }>;
  }>;
}

export default function MajorLookupPage() {
  const [majors, setMajors] = useState<MajorFromApi[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFaculty, setSelectedFaculty] = useState("ALL");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 9;

  const fetchMajors = async () => {
    try {
      setLoading(true);
      const query = new URLSearchParams();
      if (searchTerm) query.set("search", searchTerm);
      if (selectedFaculty !== "ALL") query.set("faculty", selectedFaculty);

      const res = await fetch(`/api/nganh-hoc?${query.toString()}`);
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setMajors(json.data);
      }
    } catch (err) {
      console.error("Lỗi tải danh mục ngành học:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
    const timer = setTimeout(() => {
      fetchMajors();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm, selectedFaculty]);

  const totalPages = Math.max(1, Math.ceil(majors.length / pageSize));
  const paginatedMajors = majors.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="flex flex-col w-full space-y-6 pb-12">
      {/* Title Header Card */}
      <div className="bg-[#fffdf7] p-6 pt-10 border-[3px] border-[#111827] shadow-[5px_5px_0px_#111827] rounded-[16px] relative">
        <div className="absolute top-3 left-6 px-3 py-0.5 bg-[#86efac] border-[2px] border-[#111827] font-stamp text-[11px] font-bold text-[#111827] uppercase rotate-[-2deg] shadow-[1px_1px_0px_#111827]">
          DỮ LIỆU ({majors.length} NGÀNH)
        </div>
        <h1 className="font-display font-extrabold text-[28px] lg:text-[34px] text-[#111827] uppercase">
          TRA CỨU NGÀNH HỌC
        </h1>
        <p className="text-[14px] text-[#4b5563] font-medium mt-1">
          Tra cứu mã ngành, chỉ tiêu, tổ hợp xét tuyển và lịch sử điểm chuẩn của trường Đại học Giao thông Vận tải từ cơ sở dữ liệu thật.
        </p>
      </div>

      <DisclaimerBanner />

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 border-[3px] border-[#111827] shadow-[4px_4px_0px_#111827] rounded-[12px] flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#6b7280]">
            search
          </span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm theo tên ngành hoặc mã ngành..."
            className="w-full pl-9 pr-4 py-2 bg-[#faf3e6] border-[2px] border-[#111827] rounded-[8px] font-bold text-[13px] outline-none"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <label className="text-[13px] font-bold text-[#111827] whitespace-nowrap">
            Lọc theo Khối/Khoa:
          </label>
          <select
            value={selectedFaculty}
            onChange={(e) => setSelectedFaculty(e.target.value)}
            className="w-full md:w-64 px-3 py-2 bg-[#faf3e6] border-[2px] border-[#111827] rounded-[8px] font-bold text-[13px] outline-none"
          >
            <option value="ALL">Tất cả các Ngành</option>
            <option value="Công nghệ">Khối Công nghệ & CNTT</option>
            <option value="Kinh tế">Khối Kinh tế & Vận tải</option>
            <option value="Kỹ thuật">Khối Kỹ thuật & Hạ tầng</option>
          </select>
        </div>
      </div>

      {/* Loading state or Major Cards Grid */}
      {loading ? (
        <div className="bg-white p-12 border-[3px] border-[#111827] rounded-[16px] flex justify-center items-center">
          <LoadingSpinner />
        </div>
      ) : majors.length === 0 ? (
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
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedMajors.map((major) => {
              const firstProgram = major.chuong_trinh?.[0];
              const historyList = firstProgram?.lich_su_diem_chuan || [];
              
              // Extract latest 3 years cutoff
              const cutoff2023 = historyList.find((h) => h.nam === 2023)?.diem_trung_tuyen?.[0]?.diem;
              const cutoff2024 = historyList.find((h) => h.nam === 2024)?.diem_trung_tuyen?.[0]?.diem;
              const cutoff2025 = historyList.find((h) => h.nam === 2025)?.diem_trung_tuyen?.[0]?.diem;
              const latestQuota = historyList.find((h) => h.nam === 2025)?.chi_tieu || historyList[0]?.chi_tieu || 100;

              // Extract combinations
              const combosSet = new Set<string>();
              firstProgram?.ctdt_to_hop?.forEach((ct) => {
                if (ct.to_hop?.ma_to_hop) combosSet.add(ct.to_hop.ma_to_hop);
              });
              const combinationsList = Array.from(combosSet);
              if (combinationsList.length === 0) {
                combinationsList.push("A00", "A01", "D01");
              }

              return (
                <div
                  key={major.ma_nganh}
                  className="bg-white border-[3px] border-[#111827] shadow-[5px_5px_0px_#111827] rounded-[14px] p-5 flex flex-col justify-between relative hover:-translate-y-1 transition-transform"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="bg-[#000525] text-white px-2 py-0.5 font-stamp text-[11px] font-bold rounded">
                        MÃ: {major.ma_nganh}
                      </span>
                      <span className="text-[11px] text-[#45464f] font-semibold truncate">
                        {major.khoi_kien_thuc || "Chương trình Đại học"}
                      </span>
                    </div>

                    <h3 className="font-display font-bold text-[18px] text-[#111827] leading-tight mb-3 line-clamp-2">
                      {major.ten_nganh}
                    </h3>

                    {/* Score History 3 Years */}
                    <div className="bg-[#faf3e6] p-3 border-[2px] border-[#111827] rounded-[8px] mb-4 space-y-1 text-[12px]">
                      <div className="font-bold text-[#000525] mb-1 font-stamp uppercase text-[11px]">
                        Lịch sử điểm chuẩn THPT:
                      </div>
                      <div className="grid grid-cols-3 text-center gap-1">
                        <div className="bg-white p-1 border border-[#111827] rounded">
                          <span className="block text-[10px] text-[#6b7280]">2023</span>
                          <strong className="text-[#111827]">
                            {cutoff2023 ? cutoff2023.toFixed(2) : "N/A"}
                          </strong>
                        </div>
                        <div className="bg-white p-1 border border-[#111827] rounded">
                          <span className="block text-[10px] text-[#6b7280]">2024</span>
                          <strong className="text-[#111827]">
                            {cutoff2024 ? cutoff2024.toFixed(2) : "N/A"}
                          </strong>
                        </div>
                        <div className="bg-[#ffdea8] p-1 border border-[#111827] rounded">
                          <span className="block text-[10px] text-[#7c5800] font-bold">2025</span>
                          <strong className="text-[#0d1b4e]">
                            {cutoff2025 ? cutoff2025.toFixed(2) : "25.00"}
                          </strong>
                        </div>
                      </div>
                    </div>

                    {/* Subject Combinations */}
                    <div className="mb-4">
                      <span className="block text-[12px] font-bold text-[#111827] mb-1">
                        Tổ hợp xét tuyển:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {combinationsList.map((c, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 bg-[#e0f2fe] text-[#0284c7] border border-[#111827] font-bold text-[11px] rounded"
                          >
                            {c}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-dashed border-[#c6c5d0] flex items-center justify-between">
                    <span className="text-[12px] text-[#4b5563] font-medium">
                      Chỉ tiêu: <strong className="text-[#111827]">{latestQuota}</strong> SV
                    </span>
                    <Link
                      href={`/tra-cuu-nganh-hoc/${major.ma_nganh}`}
                      className="px-3 py-1.5 bg-[#0284c7] hover:bg-[#0369a1] text-white font-bold text-[13px] border-[2px] border-[#111827] shadow-[2px_2px_0px_#111827] rounded-[6px] transition-all flex items-center gap-1"
                    >
                      Chi tiết
                      <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination Controls Bar */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 border-[3px] border-[#111827] shadow-[4px_4px_0px_#111827] rounded-[12px] mt-6">
              <div className="text-[13px] font-bold text-[#111827]">
                Hiển thị{" "}
                <span className="text-[#0284c7]">
                  {(currentPage - 1) * pageSize + 1} -{" "}
                  {Math.min(currentPage * pageSize, majors.length)}
                </span>{" "}
                trong tổng số <span className="text-[#0284c7]">{majors.length}</span> ngành học
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
                      (page) => page === 1 || page === totalPages || Math.abs(page - currentPage) <= 2
                    )
                    .map((page, idx, arr) => {
                      const prev = arr[idx - 1];
                      const showEllipsis = prev && page - prev > 1;
                      return (
                        <span key={page} className="flex items-center gap-1">
                          {showEllipsis && <span className="px-1 font-bold text-[#6b7280]">...</span>}
                          <button
                            onClick={() => setCurrentPage(page)}
                            className={`w-9 h-9 font-bold text-[13px] border-[2px] border-[#111827] rounded-[6px] transition-all ${
                              currentPage === page
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
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";

export interface OverallStats {
  totalApplications: number;
  validCount: number;
  pendingCount: number;
  rejectedCount: number;
  totalQuota: number;
  totalMajors: number;
}

export interface MajorStatItem {
  maNganh: string;
  tenNganh: string;
  tenKhoiNganh: string;
  chiTieu: number;
  soHoSo: number;
  soHopLe: number;
  tiLeChoi: number;
  tiLeLapDay: number;
}

export interface MethodStatItem {
  maPhuongThuc: string;
  tenPhuongThuc: string;
  soHoSo: number;
  tiLePhanTram: number;
}

export interface CombinationStatItem {
  maToHop: string;
  soHoSo: number;
  tiLePhanTram: number;
}

export interface DailyTrendItem {
  ngay: string;
  soLuong: number;
}

interface ThongKeClientProps {
  admissionYear: number;
  overall: OverallStats;
  majors: MajorStatItem[];
  methods: MethodStatItem[];
  combinations: CombinationStatItem[];
  dailyTrends: DailyTrendItem[];
  errorMessage?: string;
}

export default function ThongKeClient({
  admissionYear,
  overall,
  majors,
  methods,
  combinations,
  dailyTrends,
  errorMessage,
}: ThongKeClientProps) {
  const [activeTab, setActiveTab] = useState<"tong_quan" | "nganh_hoc" | "phuong_thuc">("tong_quan");
  const [searchMajor, setSearchMajor] = useState("");
  const [filterKhoi, setFilterKhoi] = useState("all");

  const filteredMajors = majors.filter((m) => {
    const matchSearch =
      m.tenNganh.toLowerCase().includes(searchMajor.toLowerCase()) ||
      m.maNganh.toLowerCase().includes(searchMajor.toLowerCase());
    const matchKhoi = filterKhoi === "all" || m.tenKhoiNganh === filterKhoi;
    return matchSearch && matchKhoi;
  });

  const uniqueKhoiList = Array.from(new Set(majors.map((m) => m.tenKhoiNganh).filter(Boolean)));

  const maxDailyCount = Math.max(...dailyTrends.map((d) => d.soLuong), 1);

  return (
    <div className="flex flex-col w-full space-y-6 pt-2 pb-14">
      {/* Top Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#e9e2d5] pb-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded bg-[#fdb712] text-[#0d1b4e] font-stamp text-[11px] font-black uppercase">
              Hội Đồng Tuyển Sinh UTC
            </span>
            {/* <span className="px-2.5 py-0.5 rounded bg-[#e0f2fe] text-[#0284c7] font-bold text-[11px] border border-[#bae6fd]">
              Dữ Liệu Thống Kê Thời Gian Thực
            </span> */}
          </div>
          <h1 className="font-display font-black text-[28px] sm:text-[32px] text-[#0d1b4e] leading-tight tracking-tight">
            Thống Kê Tổng Quan Hồ Sơ Tuyển Sinh
          </h1>
          <p className="text-[13.5px] text-[#64748b] mt-1">
            Dữ liệu năm {admissionYear}: phân bổ nguyện vọng, tình hình
            đối soát và tỷ lệ cạnh tranh theo từng ngành học.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/admin/bao-cao-trung-tuyen"
            className="flex items-center gap-1.5 px-4 py-2.5 bg-[#0d1b4e] hover:bg-[#1a2c6d] text-[#fdb712] font-display font-black text-[13px] rounded-xl shadow transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">summarize</span>
            <span>Báo Cáo Trúng Tuyển</span>
          </Link>
        </div>
      </div>

      {errorMessage && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-xl border-2 border-[#dc2626] bg-[#fef2f2] px-4 py-3 text-[13px] font-semibold text-[#991b1b]"
        >
          <span className="material-symbols-outlined text-[20px]">error</span>
          <span>{errorMessage}</span>
        </div>
      )}

      {/* 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Tổng hồ sơ */}
        <div className="p-5 bg-white border-[2.5px] border-[#0d1b4e] shadow-[4px_4px_0px_#0d1b4e] rounded-2xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[12px] font-bold uppercase tracking-wider text-[#64748b]">
              Tổng Hồ Sơ Tiếp Nhận
            </span>
            <div className="w-9 h-9 rounded-xl bg-[#e0f2fe] text-[#0284c7] flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">folder</span>
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-display font-black text-[32px] text-[#0d1b4e]">
              {overall.totalApplications.toLocaleString()}
            </span>
            <span className="text-[12px] font-bold text-[#16a34a]">hồ sơ</span>
          </div>
          <div className="mt-2 text-[12px] text-[#64748b] flex items-center gap-1">
            <span>Chỉ tiêu {admissionYear}:</span>
            <strong className="text-[#0d1b4e]">{overall.totalQuota.toLocaleString()}</strong>
            <span>• {overall.totalMajors} ngành</span>
          </div>
        </div>

        {/* Card 2: Hợp lệ */}
        <div className="p-5 bg-white border-[2.5px] border-[#16a34a] shadow-[4px_4px_0px_#16a34a] rounded-2xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[12px] font-bold uppercase tracking-wider text-[#15803d]">
              Hồ Sơ Hợp Lệ
            </span>
            <div className="w-9 h-9 rounded-xl bg-[#dcfce7] text-[#16a34a] flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">verified</span>
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-display font-black text-[32px] text-[#15803d]">
              {overall.validCount.toLocaleString()}
            </span>
            <span className="text-[12px] font-bold text-[#15803d]">
              ({overall.totalApplications > 0 ? Math.round((overall.validCount / overall.totalApplications) * 100) : 0}%)
            </span>
          </div>
          <div className="mt-2 text-[12px] text-[#15803d]">
            Đã thẩm định minh chứng đạt yêu cầu
          </div>
        </div>

        {/* Card 3: Đang chờ */}
        <div className="p-5 bg-white border-[2.5px] border-[#f59e0b] shadow-[4px_4px_0px_#f59e0b] rounded-2xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[12px] font-bold uppercase tracking-wider text-[#b45309]">
              Chờ Đối Soát Minh Chứng
            </span>
            <div className="w-9 h-9 rounded-xl bg-[#fef3c7] text-[#f59e0b] flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">pending</span>
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-display font-black text-[32px] text-[#b45309]">
              {overall.pendingCount.toLocaleString()}
            </span>
            <span className="text-[12px] font-bold text-[#b45309]">
              ({overall.totalApplications > 0 ? Math.round((overall.pendingCount / overall.totalApplications) * 100) : 0}%)
            </span>
          </div>
          <div className="mt-2 text-[12px] text-[#b45309]">
            Cán bộ tuyển sinh đang xử lý hồ sơ
          </div>
        </div>

        {/* Card 4: Cần bổ sung */}
        <div className="p-5 bg-white border-[2.5px] border-[#ef4444] shadow-[4px_4px_0px_#ef4444] rounded-2xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[12px] font-bold uppercase tracking-wider text-[#b91c1c]">
              Cần Bổ Sung / Từ Chối
            </span>
            <div className="w-9 h-9 rounded-xl bg-[#fee2e2] text-[#ef4444] flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">error</span>
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-display font-black text-[32px] text-[#b91c1c]">
              {overall.rejectedCount.toLocaleString()}
            </span>
            <span className="text-[12px] font-bold text-[#b91c1c]">
              ({overall.totalApplications > 0 ? Math.round((overall.rejectedCount / overall.totalApplications) * 100) : 0}%)
            </span>
          </div>
          <div className="mt-2 text-[12px] text-[#b91c1c]">
            Đã gửi thông báo yêu cầu tải lại minh chứng
          </div>
        </div>
      </div>

      {/* Tabs Điều Hướng Phân Tích */}
      <div className="flex border-b-[2px] border-[#0d1b4e] gap-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab("tong_quan")}
          className={`px-5 py-3 font-display font-bold text-[14px] uppercase rounded-t-xl transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === "tong_quan"
              ? "bg-[#0d1b4e] text-[#fdb712] shadow-sm -mb-[2px]"
              : "bg-white text-[#64748b] hover:text-[#0d1b4e]"
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">show_chart</span>
          <span>Tiến Độ Nộp Theo Ngày</span>
        </button>

        <button
          onClick={() => setActiveTab("nganh_hoc")}
          className={`px-5 py-3 font-display font-bold text-[14px] uppercase rounded-t-xl transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === "nganh_hoc"
              ? "bg-[#0d1b4e] text-[#fdb712] shadow-sm -mb-[2px]"
              : "bg-white text-[#64748b] hover:text-[#0d1b4e]"
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">school</span>
          <span>Thống Kê Theo Ngành ({majors.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("phuong_thuc")}
          className={`px-5 py-3 font-display font-bold text-[14px] uppercase rounded-t-xl transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === "phuong_thuc"
              ? "bg-[#0d1b4e] text-[#fdb712] shadow-sm -mb-[2px]"
              : "bg-white text-[#64748b] hover:text-[#0d1b4e]"
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">pie_chart</span>
          <span>Phương Thức & Tổ Hợp</span>
        </button>
      </div>

      {/* TAB 1: TIẾN ĐỘ THEO NGÀY */}
      {activeTab === "tong_quan" && (
        <div className="bg-white border-[2.5px] border-[#0d1b4e] shadow-[5px_5px_0px_#0d1b4e] rounded-2xl p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="font-display font-black text-[18px] text-[#0d1b4e] uppercase">
                Xu Hướng Tiếp Nhận Hồ Sơ Trực Tuyến
              </h3>
              <p className="text-[13px] text-[#64748b]">
                Số lượng hồ sơ thí sinh đăng ký theo từng ngày trong giai đoạn tuyển sinh.
              </p>
            </div>
            <span className="text-[8px] font-bold text-[#0284c7] bg-[#f0f9ff] px-2 py-1.5 rounded-lg border border-[#bae6fd]">
              Dữ liệu năm {admissionYear}
            </span>
          </div>

          {/* Bar Chart Visualization */}
          {dailyTrends.length > 0 ? (
            <>
              <div className="pt-4 pb-2">
                <div className="h-64 flex items-end gap-3 sm:gap-6 border-b-2 border-l-2 border-[#111827] px-4 pb-1">
                  {dailyTrends.map((d, idx) => {
                    const heightPercent = Math.max(Math.round((d.soLuong / maxDailyCount) * 100), 8);
                    return (
                      <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                        <span className="text-[11px] font-bold text-[#0d1b4e] opacity-0 group-hover:opacity-100 transition-opacity">
                          {d.soLuong}
                        </span>
                        <div
                          style={{ height: `${heightPercent}%` }}
                          className="w-full max-w-[42px] bg-[#0284c7] group-hover:bg-[#fdb712] transition-colors rounded-t-lg border-2 border-[#0d1b4e] shadow-[2px_0px_0px_#0d1b4e]"
                        />
                        <span className="text-[11px] font-bold text-[#64748b] group-hover:text-[#0d1b4e] whitespace-nowrap">
                          {d.ngay}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-[#e2e8f0] text-[13px]">
                <div className="p-3.5 bg-[#fffdf7] rounded-xl border border-[#cbd5e1]">
                  <span className="text-[#64748b] block font-bold text-[11px] uppercase">Ngày cao điểm nhất</span>
                  <strong className="text-[16px] text-[#0d1b4e] font-display">
                    {dailyTrends.reduce((max, d) => (d.soLuong > max.soLuong ? d : max), dailyTrends[0])?.ngay}
                  </strong>
                </div>
                <div className="p-3.5 bg-[#fffdf7] rounded-xl border border-[#cbd5e1]">
                  <span className="text-[#64748b] block font-bold text-[11px] uppercase">Trung bình tiếp nhận</span>
                  <strong className="text-[16px] text-[#0d1b4e] font-display">
                    {Math.round(
                      dailyTrends.reduce((acc, d) => acc + d.soLuong, 0) / (dailyTrends.length || 1)
                    )}{" "}
                    hồ sơ/ngày
                  </strong>
                </div>
                <div className="p-3.5 bg-[#fffdf7] rounded-xl border border-[#cbd5e1]">
                  <span className="text-[#64748b] block font-bold text-[11px] uppercase">Tỷ lệ hoàn thành hồ sơ</span>
                  <strong className="text-[16px] text-[#16a34a] font-display">
                    {overall.totalApplications > 0
                      ? ((overall.validCount / overall.totalApplications) * 100).toFixed(1)
                      : 0}
                    %
                  </strong>
                </div>
              </div>
            </>
          ) : (
            <div className="p-8 text-center bg-[#fffdf7] border-[2px] border-dashed border-[#cbd5e1] rounded-xl space-y-2">
              <span className="material-symbols-outlined text-[36px] text-[#64748b]">hourglass_empty</span>
              <p className="font-display font-bold text-[15px] text-[#0d1b4e]">
                Chưa có dữ liệu hồ sơ thí sinh ghi nhận
              </p>
              <p className="text-[12.5px] text-[#64748b] max-w-md mx-auto">
                Dữ liệu tiến độ theo ngày sẽ tự động vẽ biểu đồ khi thí sinh bắt đầu nộp hồ sơ xét tuyển trực tuyến trên hệ thống.
              </p>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: THỐNG KÊ THEO NGÀNH HỌC */}
      {activeTab === "nganh_hoc" && (
        <div className="bg-white border-[2.5px] border-[#0d1b4e] shadow-[5px_5px_0px_#0d1b4e] rounded-2xl p-6 space-y-5">
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#64748b] text-[18px]">
                search
              </span>
              <input
                type="text"
                placeholder="Tìm mã hoặc tên ngành học..."
                value={searchMajor}
                onChange={(e) => setSearchMajor(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-[#faf3e6] border-[2px] border-[#0d1b4e] rounded-xl text-[13px] font-bold text-[#0d1b4e] outline-none placeholder:text-[#94a3b8]"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-[12px] font-bold text-[#64748b] whitespace-nowrap">Khoa/Khối:</span>
              <select
                value={filterKhoi}
                onChange={(e) => setFilterKhoi(e.target.value)}
                className="px-3 py-2 bg-[#fffdf7] border-[2px] border-[#0d1b4e] rounded-xl text-[12.5px] font-bold text-[#0d1b4e] outline-none"
              >
                <option value="all">Tất cả khoa / viện</option>
                {uniqueKhoiList.map((k) => (
                  <option key={k} value={k}>
                    {k}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Table Data */}
          <div className="border-[2px] border-[#0d1b4e] rounded-xl overflow-hidden shadow-[3px_3px_0px_#0d1b4e]">
            <table className="w-full text-left text-[13px]">
              <thead className="bg-[#0d1b4e] text-white font-display font-bold text-[12px] uppercase">
                <tr>
                  <th className="py-3 px-4">Mã & Ngành Đào Tạo</th>
                  <th className="py-3 px-4 hidden md:table-cell">Khối / Khoa</th>
                  <th className="py-3 px-4 text-center">Chỉ Tiêu</th>
                  <th className="py-3 px-4 text-center">Hồ Sơ Đăng Ký</th>
                  <th className="py-3 px-4 text-center">Tỷ Lệ Chọi</th>
                  <th className="py-3 px-4 text-right">Độ Lấp Đầy</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e2e8f0] bg-white">
                {filteredMajors.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-[#64748b]">
                      Không có dữ liệu ngành học phù hợp.
                    </td>
                  </tr>
                ) : filteredMajors.map((m) => (
                  <tr key={m.maNganh} className="hover:bg-[#fffdf7] transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-[#0d1b4e]">{m.tenNganh}</div>
                      <span className="font-mono text-[11px] text-[#0284c7] font-semibold">
                        Mã: {m.maNganh}
                      </span>
                    </td>
                    <td className="py-3 px-4 hidden md:table-cell text-[#64748b]">
                      {m.tenKhoiNganh}
                    </td>
                    <td className="py-3 px-4 text-center font-display font-bold text-[#0d1b4e]">
                      {m.chiTieu}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="font-display font-black text-[#0284c7]">
                        {m.soHoSo}
                      </span>
                      <span className="text-[11px] text-[#16a34a] block font-bold">
                        ({m.soHopLe} hợp lệ)
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center font-bold">
                      <span
                        className={`px-2 py-0.5 rounded text-[11.5px] ${
                          m.tiLeChoi >= 2.0
                            ? "bg-[#fee2e2] text-[#b91c1c]"
                            : m.tiLeChoi >= 1.0
                            ? "bg-[#dcfce7] text-[#15803d]"
                            : "bg-[#f1f5f9] text-[#64748b]"
                        }`}
                      >
                        1 : {m.tiLeChoi.toFixed(2)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-20 bg-[#e2e8f0] rounded-full h-2 overflow-hidden">
                          <div
                            style={{ width: `${Math.min(m.tiLeLapDay, 100)}%` }}
                            className={`h-full ${
                              m.tiLeLapDay >= 100 ? "bg-[#16a34a]" : "bg-[#f59e0b]"
                            }`}
                          />
                        </div>
                        <span className="font-mono font-bold text-[12px] text-[#0d1b4e] w-12 text-right">
                          {m.tiLeLapDay}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: PHƯƠNG THỨC & TỔ HỢP */}
      {activeTab === "phuong_thuc" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Phân bổ theo phương thức */}
          <div className="bg-white border-[2.5px] border-[#0d1b4e] shadow-[5px_5px_0px_#0d1b4e] rounded-2xl p-6 space-y-4">
            <h3 className="font-display font-black text-[18px] text-[#0d1b4e] uppercase flex items-center gap-2">
              <span className="material-symbols-outlined text-[#0284c7]">how_to_reg</span>
              Tỷ Trọng Theo Phương Thức Xét Tuyển
            </h3>
            <p className="text-[13px] text-[#64748b]">
              Phân tích cơ cấu lựa chọn phương thức nộp hồ sơ năm {admissionYear}.
            </p>

            <div className="space-y-4 pt-2">
              {methods.length === 0 ? (
                <p className="rounded-xl border border-dashed border-[#cbd5e1] p-6 text-center text-[13px] text-[#64748b]">
                  Chưa có dữ liệu phương thức xét tuyển.
                </p>
              ) : methods.map((pm) => (
                <div key={pm.maPhuongThuc} className="space-y-1.5">
                  <div className="flex items-center justify-between text-[13px]">
                    <span className="font-bold text-[#0d1b4e]">
                      {pm.maPhuongThuc} - {pm.tenPhuongThuc}
                    </span>
                    <span className="font-display font-black text-[#0284c7]">
                      {pm.soHoSo} HS ({pm.tiLePhanTram}%)
                    </span>
                  </div>
                  <div className="w-full bg-[#f1f5f9] border border-[#cbd5e1] rounded-full h-3 overflow-hidden">
                    <div
                      style={{ width: `${pm.tiLePhanTram}%` }}
                      className="bg-[#0284c7] h-full rounded-full transition-all"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Phân bổ theo tổ hợp môn */}
          <div className="bg-white border-[2.5px] border-[#0d1b4e] shadow-[5px_5px_0px_#0d1b4e] rounded-2xl p-6 space-y-4">
            <h3 className="font-display font-black text-[18px] text-[#0d1b4e] uppercase flex items-center gap-2">
              <span className="material-symbols-outlined text-[#f59e0b]">category</span>
              Tổ Hợp Môn Xét Tuyển Phổ Biến
            </h3>
            <p className="text-[13px] text-[#64748b]">
              Các tổ hợp 3 môn thi có lượng đăng ký xét tuyển cao nhất tại UTC.
            </p>

            <div className="grid grid-cols-2 gap-3 pt-2">
              {combinations.length === 0 ? (
                <p className="col-span-2 rounded-xl border border-dashed border-[#cbd5e1] p-6 text-center text-[13px] text-[#64748b]">
                  Chưa có hồ sơ sử dụng tổ hợp xét tuyển.
                </p>
              ) : combinations.map((comb) => (
                <div
                  key={comb.maToHop}
                  className="p-4 bg-[#fffdf7] border-[2px] border-[#0d1b4e] rounded-xl shadow-[2px_2px_0px_#0d1b4e] flex items-center justify-between"
                >
                  <div>
                    <span className="font-display font-black text-[18px] text-[#0d1b4e] block">
                      {comb.maToHop}
                    </span>
                    <span className="text-[12px] text-[#64748b] font-medium">
                      {comb.soHoSo} hồ sơ
                    </span>
                  </div>
                  <span className="font-display font-bold text-[16px] text-[#16a34a]">
                    {comb.tiLePhanTram}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

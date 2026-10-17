"use client";

import { useState } from "react";
import Link from "next/link";

export interface CandidateRecord {
  stt: number;
  maHoSo: string;
  cccd: string;
  hoTen: string;
  ngaySinh: string;
  gioiTinh: string;
  soDienThoai: string;
  khuVuc: string;
  doiTuongUuTien: string;
  maChuongTrinh: string;
  tenChuongTrinh: string;
  maPhuongThuc: string;
  tenPhuongThuc: string;
  maToHop: string;
  diemXetTuyen: number;
  diemChuanNganh: number;
  trangThai: "TRUNG_TUYEN_SO_BO" | "CHUA_DAT" | "CHO_XAC_NHAN";
  ngayDuyet: string;
}

export interface ProgramFilterOption {
  maChuongTrinh: string;
  tenChuongTrinh: string;
}

interface BaoCaoClientProps {
  candidates: CandidateRecord[];
  programs: ProgramFilterOption[];
  methods: Array<{ maPhuongThuc: string; tenPhuongThuc: string }>;
}

export default function BaoCaoClient({
  candidates,
  programs,
  methods,
}: BaoCaoClientProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProgram, setSelectedProgram] = useState("all");
  const [selectedMethod, setSelectedMethod] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [minScore, setMinScore] = useState<string>("");

  // Lọc dữ liệu theo đa tiêu chí
  const filteredCandidates = candidates.filter((item) => {
    const sTerm = searchTerm.toLowerCase().trim();
    const matchSearch =
      !sTerm ||
      item.hoTen.toLowerCase().includes(sTerm) ||
      item.cccd.includes(sTerm) ||
      item.maHoSo.toLowerCase().includes(sTerm) ||
      item.soDienThoai.includes(sTerm);

    const matchProgram =
      selectedProgram === "all" || item.maChuongTrinh === selectedProgram;
    const matchMethod =
      selectedMethod === "all" || item.maPhuongThuc === selectedMethod;
    const matchStatus =
      selectedStatus === "all" || item.trangThai === selectedStatus;

    const minScoreNum = parseFloat(minScore);
    const matchMinScore =
      isNaN(minScoreNum) || item.diemXetTuyen >= minScoreNum;

    return (
      matchSearch &&
      matchProgram &&
      matchMethod &&
      matchStatus &&
      matchMinScore
    );
  });

  // Xuất file Excel (.csv với UTF-8 BOM để Excel hiển thị tiếng Việt hoàn hảo)
  const handleExportCSV = () => {
    const headers = [
      "STT",
      "Mã Hồ Sơ",
      "Số CCCD",
      "Họ Và Tên",
      "Ngày Sinh",
      "Giới Tính",
      "Số Điện Thoại",
      "Khu Vực",
      "Mã Ngành",
      "Tên Chương Trình Đào Tạo",
      "Phương Thức",
      "Tổ Hợp",
      "Điểm Xét Tuyển",
      "Điểm Chuẩn",
      "Kết Quả Xét Tuyển",
      "Ngày Duyệt",
    ];

    const rows = filteredCandidates.map((c) => [
      c.stt,
      `"${c.maHoSo}"`,
      `"\t${c.cccd}"`, // \t để Excel giữ nguyên số 0 ở đầu CCCD
      `"${c.hoTen}"`,
      c.ngaySinh,
      c.gioiTinh,
      `"\t${c.soDienThoai}"`,
      c.khuVuc,
      c.maChuongTrinh,
      `"${c.tenChuongTrinh}"`,
      c.maPhuongThuc,
      c.maToHop,
      c.diemXetTuyen,
      c.diemChuanNganh,
      c.trangThai === "TRUNG_TUYEN_SO_BO" ? "Trúng Tuyển Sơ Bộ" : "Chưa Đạt",
      c.ngayDuyet,
    ]);

    const csvContent =
      "\uFEFF" + // UTF-8 BOM
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `Bao_Cao_Trung_Tuyen_UTC_K66_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // In / Xuất PDF qua trình duyệt
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex flex-col w-full space-y-6 pt-2 pb-16">
      {/* Header Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#e9e2d5] pb-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded bg-[#fdb712] text-[#0d1b4e] font-stamp text-[11px] font-black uppercase">
              Báo Cáo Tuyển Sinh Chính Thức
            </span>
            <span className="px-2.5 py-0.5 rounded bg-[#dcfce7] text-[#15803d] font-bold text-[11px] border border-[#86efac]">
              Đủ Điều Kiện Trúng Tuyển Sớm
            </span>
          </div>
          <h1 className="font-display font-black text-[28px] sm:text-[32px] text-[#0d1b4e] leading-tight tracking-tight">
            Báo Cáo Kết Quả Xét Tuyển & Danh Sách Trúng Tuyển
          </h1>
          <p className="text-[13.5px] text-[#64748b] mt-1">
            Tổng hợp danh sách thí sinh đạt ngưỡng điểm chuẩn điều kiện, sẵn sàng công bố và xuất file dữ liệu báo cáo Bộ GD&ĐT.
          </p>
        </div>

        {/* Nút Xuất Excel & In Báo Cáo */}
        <div className="flex flex-wrap items-center gap-2.5 print:hidden">
          <Link
            href="/admin/thong-ke"
            className="flex items-center gap-1.5 px-3.5 py-2.5 bg-white border-[2px] border-[#0d1b4e] text-[#0d1b4e] font-display font-bold text-[13px] rounded-xl shadow-[2px_2px_0px_#0d1b4e] hover:bg-[#fffdf7] transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">monitoring</span>
            <span>Dashboard Thống Kê</span>
          </Link>

          <button
            type="button"
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-[#16a34a] hover:bg-[#15803d] text-white font-display font-black text-[13px] uppercase rounded-xl border-[2px] border-[#0d1b4e] shadow-[3px_3px_0px_#0d1b4e] transition-all cursor-pointer active:translate-x-[1px] active:translate-y-[1px]"
          >
            <span className="material-symbols-outlined text-[18px]">file_download</span>
            <span>Xuất Excel (.csv)</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-[#0284c7] hover:bg-[#0369a1] text-white font-display font-black text-[13px] uppercase rounded-xl border-[2px] border-[#0d1b4e] shadow-[3px_3px_0px_#0d1b4e] transition-all cursor-pointer active:translate-x-[1px] active:translate-y-[1px]"
          >
            <span className="material-symbols-outlined text-[18px]">print</span>
            <span>In / Xuất PDF</span>
          </button>
        </div>
      </div>

      {/* Filter Box Neo-Brutalism */}
      <div className="bg-white border-[2.5px] border-[#0d1b4e] shadow-[5px_5px_0px_#0d1b4e] rounded-2xl p-5 space-y-4 print:hidden">
        <div className="flex items-center justify-between">
          <h3 className="font-display font-black text-[16px] text-[#0d1b4e] uppercase flex items-center gap-2">
            <span className="material-symbols-outlined text-[#0284c7]">filter_alt</span>
            Bộ Lọc Đa Tiêu Chí
          </h3>
          <span className="text-[12px] font-bold text-[#64748b]">
            Tìm thấy: <strong className="text-[#0d1b4e]">{filteredCandidates.length}</strong> / {candidates.length} thí sinh
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* 1. Tìm kiếm họ tên / cccd / mã hồ sơ */}
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#64748b] text-[18px]">
              search
            </span>
            <input
              type="text"
              placeholder="CCCD, Họ tên, Mã hồ sơ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-[#faf3e6] border-[2px] border-[#0d1b4e] rounded-xl text-[13px] font-bold text-[#0d1b4e] outline-none placeholder:text-[#94a3b8]"
            />
          </div>

          {/* 2. Lọc theo ngành */}
          <div>
            <select
              value={selectedProgram}
              onChange={(e) => setSelectedProgram(e.target.value)}
              className="w-full px-3 py-2 bg-[#faf3e6] border-[2px] border-[#0d1b4e] rounded-xl text-[12.5px] font-bold text-[#0d1b4e] outline-none"
            >
              <option value="all">Tất cả ngành / CTĐT</option>
              {programs.map((p) => (
                <option key={p.maChuongTrinh} value={p.maChuongTrinh}>
                  {p.tenChuongTrinh}
                </option>
              ))}
            </select>
          </div>

          {/* 3. Lọc theo phương thức */}
          <div>
            <select
              value={selectedMethod}
              onChange={(e) => setSelectedMethod(e.target.value)}
              className="w-full px-3 py-2 bg-[#faf3e6] border-[2px] border-[#0d1b4e] rounded-xl text-[12.5px] font-bold text-[#0d1b4e] outline-none"
            >
              <option value="all">Tất cả phương thức</option>
              {methods.map((m) => (
                <option key={m.maPhuongThuc} value={m.maPhuongThuc}>
                  {m.maPhuongThuc} - {m.tenPhuongThuc}
                </option>
              ))}
            </select>
          </div>

          {/* 4. Lọc theo trạng thái */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 bg-[#faf3e6] border-[2px] border-[#0d1b4e] rounded-xl text-[12.5px] font-bold text-[#0d1b4e] outline-none"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="TRUNG_TUYEN_SO_BO">Đạt điều kiện trúng tuyển</option>
              <option value="CHO_XAC_NHAN">Chờ đối soát điểm sàn</option>
              <option value="CHUA_DAT">Chưa đạt ngưỡng</option>
            </select>
          </div>

          {/* 5. Điểm xét tuyển tối thiểu */}
          <div>
            <input
              type="number"
              step="0.1"
              placeholder="Điểm XT tối thiểu (VD: 24.5)..."
              value={minScore}
              onChange={(e) => setMinScore(e.target.value)}
              className="w-full px-3 py-2 bg-[#faf3e6] border-[2px] border-[#0d1b4e] rounded-xl text-[13px] font-bold text-[#0d1b4e] outline-none placeholder:text-[#94a3b8]"
            />
          </div>
        </div>
      </div>

      {/* Main Results Table */}
      <div className="bg-white border-[2.5px] border-[#0d1b4e] shadow-[6px_6px_0px_#0d1b4e] rounded-2xl overflow-hidden">
        {/* Table Header Printable Info */}
        <div className="hidden print:block p-6 text-center border-b border-[#111827] space-y-1">
          <h3 className="font-display font-black text-[18px] uppercase">
            BỘ GIÁO DỤC VÀ ĐÀO TẠO — TRƯỜNG ĐẠI HỌC GIAO THÔNG VẬN TẢI
          </h3>
          <h2 className="font-display font-black text-[22px] uppercase">
            DANH SÁCH THÍ SINH ĐỦ ĐIỀU KIỆN TRÚNG TUYỂN SỚM ĐẠI HỌC K66
          </h2>
          <p className="text-[12px] italic">
            (Kèm theo Quyết định của Hội đồng Tuyển sinh Đại học chính quy năm 2026)
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-[13px]">
            <thead className="bg-[#0d1b4e] text-white font-display font-bold text-[12px] uppercase">
              <tr>
                <th className="py-3 px-3.5 text-center w-12">STT</th>
                <th className="py-3 px-3.5">Mã Hồ Sơ</th>
                <th className="py-3 px-3.5">Họ Và Tên</th>
                <th className="py-3 px-3.5 font-mono">Số CCCD</th>
                <th className="py-3 px-3.5">Ngành Trúng Tuyển</th>
                <th className="py-3 px-3.5 text-center">PT / Tổ Hợp</th>
                <th className="py-3 px-3.5 text-center">Điểm XT</th>
                <th className="py-3 px-3.5 text-center">Điểm Chuẩn</th>
                <th className="py-3 px-3.5 text-center">Kết Quả</th>
                <th className="py-3 px-3.5 text-right hidden sm:table-cell">Ngày Duyệt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e2e8f0] bg-white">
              {filteredCandidates.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-10 text-center text-[#64748b]">
                    Không tìm thấy thí sinh nào khớp với bộ lọc hiện tại.
                  </td>
                </tr>
              ) : (
                filteredCandidates.map((c, idx) => (
                  <tr key={c.maHoSo} className="hover:bg-[#fffdf7] transition-colors">
                    <td className="py-3 px-3.5 text-center font-bold text-[#64748b]">
                      {idx + 1}
                    </td>
                    <td className="py-3 px-3.5 font-mono font-bold text-[#0284c7]">
                      {c.maHoSo}
                    </td>
                    <td className="py-3 px-3.5 font-bold text-[#0d1b4e]">
                      {c.hoTen}
                      <span className="block text-[11px] font-normal text-[#64748b]">
                        {c.gioiTinh} • {c.ngaySinh}
                      </span>
                    </td>
                    <td className="py-3 px-3.5 font-mono text-[12.5px] text-[#334155]">
                      {c.cccd}
                    </td>
                    <td className="py-3 px-3.5">
                      <div className="font-bold text-[#0d1b4e]">{c.tenChuongTrinh}</div>
                      <span className="text-[11px] text-[#64748b] font-mono">
                        Mã: {c.maChuongTrinh}
                      </span>
                    </td>
                    <td className="py-3 px-3.5 text-center">
                      <span className="px-2 py-0.5 bg-[#f1f5f9] rounded text-[11px] font-bold text-[#0d1b4e] block">
                        {c.maPhuongThuc}
                      </span>
                      <span className="text-[11px] text-[#64748b] font-mono font-semibold">
                        {c.maToHop}
                      </span>
                    </td>
                    <td className="py-3 px-3.5 text-center">
                      <span className="font-display font-black text-[15px] text-[#dc2626]">
                        {c.diemXetTuyen.toFixed(2)}
                      </span>
                    </td>
                    <td className="py-3 px-3.5 text-center font-display font-bold text-[#0d1b4e]">
                      {c.diemChuanNganh.toFixed(2)}
                    </td>
                    <td className="py-3 px-3.5 text-center">
                      {c.trangThai === "TRUNG_TUYEN_SO_BO" ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#dcfce7] text-[#15803d] border border-[#16a34a] rounded-lg text-[11px] font-bold">
                          <span className="material-symbols-outlined text-[14px]">check</span>
                          Đạt sơ tuyển
                        </span>
                      ) : c.trangThai === "CHO_XAC_NHAN" ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#fef3c7] text-[#b45309] border border-[#f59e0b] rounded-lg text-[11px] font-bold">
                          <span className="material-symbols-outlined text-[14px]">schedule</span>
                          Chờ đối soát
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#fee2e2] text-[#b91c1c] border border-[#ef4444] rounded-lg text-[11px] font-bold">
                          <span className="material-symbols-outlined text-[14px]">close</span>
                          Chưa đạt
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3.5 text-right font-mono text-[11.5px] text-[#64748b] hidden sm:table-cell">
                      {c.ngayDuyet}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer ký tên khi in ấn PDF */}
        <div className="hidden print:grid grid-cols-2 gap-8 p-8 pt-12 text-center text-[13px]">
          <div>
            <p className="font-bold uppercase">NGƯỜI LẬP BIỂU</p>
            <p className="text-[12px] italic">(Ký, ghi rõ họ tên)</p>
          </div>
          <div>
            <p className="font-bold uppercase">CHỦ TỊCH HỘI ĐỒNG TUYỂN SINH</p>
            <p className="text-[12px] italic">(Ký tên và đóng dấu)</p>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { DisclaimerBanner } from "@/components/ui/DisclaimerBanner";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { getAllNganhHoc } from "@/actions/nganh_hoc.action";

type NganhHocList = Awaited<ReturnType<typeof getAllNganhHoc>>["data"];
export type MajorFromApi = NonNullable<NganhHocList>[0];

export default function MajorDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const majorId = resolvedParams.id;

  const [major, setMajor] = useState<MajorFromApi | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDetail() {
      try {
        setLoading(true);
        const res = await fetch(`/api/nganh-hoc/${majorId}`);
        const json = await res.json();
        if (json.success && json.data) {
          setMajor(json.data);
        }
      } catch (err) {
        console.error("Lỗi tải thông tin ngành:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchDetail();
  }, [majorId]);

  if (loading) {
    return (
      <div className="bg-white p-12 border-[3px] border-[#111827] rounded-[16px] flex justify-center items-center my-8">
        <LoadingSpinner />
      </div>
    );
  }

  if (!major) {
    return (
      <div className="bg-white p-8 border-[3px] border-[#111827] rounded-[16px] text-center space-y-4">
        <h2 className="font-display font-bold text-[20px] text-[#ba1a1a]">
          Không tìm thấy thông tin mã ngành: {majorId}
        </h2>
        <Link
          href="/tra-cuu-nganh-hoc"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#0284c7] text-white font-bold text-[13px] border-[2px] border-[#111827] rounded-[6px]"
        >
          Quay lại danh mục ngành
        </Link>
      </div>
    );
  }

  const firstProgram = major.chuong_trinh?.[0];
  const historyList = firstProgram?.lich_su_diem_chuan || [];
  const latestQuota = historyList[historyList.length - 1]?.chi_tieu || 120;

  return (
    <div className="flex flex-col w-full space-y-6 pb-12">
      {/* Back button */}
      <div>
        <Link
          href="/tra-cuu-nganh-hoc"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white text-[#111827] font-bold text-[13px] border-[2px] border-[#111827] shadow-[2px_2px_0px_#111827] rounded-[6px] hover:bg-[#ffdea8] transition-all"
        >
          <span className="material-symbols-outlined text-[16px]">arrow_back</span>
          Quay lại Danh mục Ngành
        </Link>
      </div>

      {/* Major Title Card */}
      <div className="bg-[#fffdf7] p-6 lg:p-8 border-[3px] border-[#111827] shadow-[5px_5px_0px_#111827] rounded-[16px] relative">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className="bg-[#000525] text-white px-3 py-1 font-stamp text-[12px] font-bold rounded border border-[#111827]">
            MÃ NGÀNH: {major.ma_nganh}
          </span>
          <span className="bg-[#ffdea8] text-[#7c5800] px-3 py-1 font-stamp text-[12px] font-bold rounded border border-[#111827]">
            {major.khoi_kien_thuc || "TRƯỜNG ĐẠI HỌC GIAO THÔNG VẬN TẢI"}
          </span>
          <span className="bg-[#86efac] text-[#111827] px-3 py-1 font-stamp text-[12px] font-bold rounded border border-[#111827]">
            HỆ CHÍNH QUY (4 NĂM)
          </span>
        </div>

        <h1 className="font-display font-extrabold text-[28px] lg:text-[38px] text-[#111827] uppercase leading-tight">
          NGÀNH {major.ten_nganh.toUpperCase()} UTC
        </h1>

        <p className="text-[15px] text-[#4b5563] font-medium mt-2 max-w-3xl leading-relaxed">
          Đào tạo cử nhân & kỹ sư trình độ cao theo khung chương trình niên giám chính thức của Trường Đại học Giao thông Vận tải.
        </p>
      </div>

      <DisclaimerBanner />

      {/* Detailed Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column - Programs Info */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white p-6 border-[3px] border-[#111827] shadow-[5px_5px_0px_#111827] rounded-[14px]">
            <h3 className="font-display font-bold text-[20px] text-[#111827] mb-3 flex items-center gap-2 border-b-[2px] border-dashed border-[#c6c5d0] pb-2">
              <span className="material-symbols-outlined text-[#0284c7]">menu_book</span>
              Chương Trình Đào Tạo Trong Ngành ({major.chuong_trinh.length})
            </h3>
            <div className="space-y-3">
              {major.chuong_trinh.map((prog) => (
                <div
                  key={prog.ma_chuong_trinh}
                  className="p-4 bg-[#faf3e6] border-[2px] border-[#111827] rounded-[10px] space-y-1"
                >
                  <span className="font-stamp text-[11px] font-bold text-[#0d1b4e] block">
                    MÃ CTDT: {prog.ma_chuong_trinh}
                  </span>
                  <h4 className="font-display font-bold text-[16px] text-[#111827]">
                    {prog.ten_chuong_trinh}
                  </h4>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Admission Stats Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-[#fffdf7] p-6 border-[3px] border-[#111827] shadow-[5px_5px_0px_#111827] rounded-[14px]">
            <h3 className="font-display font-bold text-[18px] text-[#111827] uppercase mb-4 border-b-[2px] border-dashed border-[#c6c5d0] pb-2">
              THÔNG SỐ XÉT TUYỂN CHÍNH THỨC
            </h3>

            <div className="space-y-4">
              <div>
                <span className="text-[12px] font-bold text-[#6b7280] uppercase block">
                  Chỉ tiêu K66:
                </span>
                <span className="font-display font-black text-[28px] text-[#0284c7]">
                  {latestQuota} Chỉ Tiêu
                </span>
              </div>

              <div>
                <span className="text-[12px] font-bold text-[#6b7280] uppercase block mb-2">
                  Lịch sử điểm chuẩn các năm:
                </span>
                <div className="bg-[#faf3e6] p-3 border-[2px] border-[#111827] rounded-[8px] space-y-2 text-[13px]">
                  {historyList.map((h) => (
                    <div key={h.nam} className="flex justify-between font-bold">
                      <span>Năm {h.nam}:</span>
                      <span className="text-[#0d1b4e]">
                        {h.diem_trung_tuyen?.[0]?.diem
                          ? `${h.diem_trung_tuyen[0].diem.toFixed(2)} điểm`
                          : "Tham khảo"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <Link
                href="/tinh-diem-quy-doi"
                className="w-full py-2.5 bg-[#fdb712] hover:bg-[#e2a20a] text-[#000525] font-extrabold text-[14px] border-[2.5px] border-[#111827] shadow-[3px_3px_0px_#111827] rounded-[8px] transition-all text-center block uppercase tracking-wider"
              >
                Tính Điểm Đậu Vào Ngành
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

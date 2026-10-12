import { Suspense } from "react";
import { prismaPublic } from "@/libs/prisma";
import KetQuaTuVanClient from "./KetQuaTuVanClient";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

export const metadata = {
  title: "Kết Quả Tư Vấn Hướng Nghiệp MBTI & Ngành Học UTC | Tuyển Sinh 2026",
  description:
    "Báo cáo phân tích tính cách MBTI, môi trường học tập lý tưởng và danh sách ngành học phù hợp nhất tại Trường Đại học Giao thông Vận tải (UTC).",
};

export const revalidate = 60; // 1 minute ISR

export default async function KetQuaTuVanPage() {
  let dbMajors: any[] = [];

  try {
    const rawMajors = await prismaPublic.nganhHoc.findMany({
      select: {
        ma_nganh: true,
        ten_nganh: true,
        khoi_kien_thuc: true,
        khoi_nganh: {
          select: {
            ten_khoi_nganh: true,
          },
        },
        chuong_trinh: {
          take: 1,
          select: {
            ma_chuong_trinh: true,
            ten_chuong_trinh: true,
            lich_su_diem_chuan: {
              take: 1,
              orderBy: { nam: "desc" },
              select: {
                nam: true,
                chi_tieu: true,
                diem_trung_tuyen: {
                  take: 1,
                  select: {
                    diem: true,
                    ma_phuong_thuc: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { ma_nganh: "asc" },
    });

    dbMajors = JSON.parse(JSON.stringify(rawMajors));
  } catch (error) {
    console.error("Lỗi lấy danh sách ngành học cho kết quả tư vấn MBTI:", error);
  }

  return (
    <Suspense
      fallback={
        <div className="min-h-[400px] flex items-center justify-center">
          <LoadingSpinner />
        </div>
      }
    >
      <KetQuaTuVanClient dbMajors={dbMajors} />
    </Suspense>
  );
}

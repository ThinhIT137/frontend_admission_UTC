import { prismaPublic } from "@/libs/prisma";
import TinhDiemQuyDoiClient, { ProgramScoreItem, ToHopItem } from "./TinhDiemQuyDoiClient";

export const metadata = {
  title: "Tính Điểm Quy Đổi & So Sánh Cơ Hội Xét Tuyển UTC 2026",
  description:
    "Công cụ quy đổi điểm thi THPT, chứng chỉ IELTS/SAT, ĐGNL HSA, ĐGTD TSA sang thang điểm chuẩn tuyển sinh Trường Đại học Giao thông Vận tải (UTC) và đối soát cơ hội trúng tuyển.",
};

export const revalidate = 60; // 1 minute ISR

export default async function ScoreCalculatorPage() {
  let programs: ProgramScoreItem[] = [];
  let toHops: ToHopItem[] = [];

  try {
    // 1. Lấy danh sách chương trình đào tạo kèm ngành, tổ hợp và lịch sử điểm chuẩn
    const rawPrograms = await prismaPublic.chuongTrinhDaoTao.findMany({
      select: {
        ma_chuong_trinh: true,
        ten_chuong_trinh: true,
        ma_nganh: true,
        nganh: {
          select: {
            ma_nganh: true,
            ten_nganh: true,
            khoi_kien_thuc: true,
            khoi_nganh: {
              select: {
                ma_khoi_nganh: true,
                ten_khoi_nganh: true,
              },
            },
          },
        },
        ctdt_to_hop: {
          select: {
            ma_to_hop: true,
            to_hop: {
              select: {
                ma_to_hop: true,
                mon_1: { select: { ten_mon: true } },
                mon_2: { select: { ten_mon: true } },
                mon_3: { select: { ten_mon: true } },
              },
            },
          },
        },
        lich_su_diem_chuan: {
          orderBy: { nam: "desc" },
          select: {
            nam: true,
            chi_tieu: true,
            diem_trung_tuyen: {
              select: {
                diem: true,
                ma_phuong_thuc: true,
                phuong_thuc: {
                  select: {
                    ma_phuong_thuc: true,
                    ten_phuong_thuc: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { ma_chuong_trinh: "asc" },
    });

    // Chuyển đổi dữ liệu tương thích JSON (xử lý kiểu Decimal nếu có)
    programs = JSON.parse(JSON.stringify(rawPrograms));
  } catch (error) {
    console.error("Lỗi truy vấn dữ liệu chương trình đào tạo cho công cụ quy đổi điểm:", error);
  }

  try {
    // 2. Lấy danh sách tổ hợp môn xét tuyển
    const rawToHops = await prismaPublic.toHopXetTuyen.findMany({
      select: {
        ma_to_hop: true,
        ma_mon_1: true,
        ma_mon_2: true,
        ma_mon_3: true,
        mon_1: { select: { ten_mon: true } },
        mon_2: { select: { ten_mon: true } },
        mon_3: { select: { ten_mon: true } },
      },
      orderBy: { ma_to_hop: "asc" },
    });

    toHops = JSON.parse(JSON.stringify(rawToHops));
  } catch (error) {
    console.error("Lỗi truy vấn danh sách tổ hợp xét tuyển:", error);
  }

  return (
    <TinhDiemQuyDoiClient
      initialPrograms={programs}
      initialToHops={toHops}
    />
  );
}

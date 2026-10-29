import { prismaPublic } from "@/libs/prisma";
import NopHoSoClient, { MethodOption, ProgramOption } from "./NopHoSoClient";

export const metadata = {
  title: "Nộp Hồ Sơ Xét Tuyển Trực Tuyến K66 | Tuyển Sinh UTC 2026",
  description:
    "Cổng nộp hồ sơ xét tuyển trực tuyến chính thức Trường Đại học Giao thông Vận tải (Cơ sở Hà Nội - Mã GHA). Chọn phương thức, tải lên checklist giấy tờ và nhận mã hồ sơ đối soát.",
};

export const revalidate = 60; // 1 minute ISR

export default async function NopHoSoPage() {
  let methods: MethodOption[] = [];
  let programs: ProgramOption[] = [];

  try {
    // 1. Lấy danh sách phương thức xét tuyển thực tế từ DB
    const dbMethods = await prismaPublic.phuongThucXetTuyen.findMany({
      // Không cho tự nộp điểm thi THPT; dữ liệu này cần nguồn chính thức.
      where: { ma_phuong_thuc: { not: "PT1" } },
      select: {
        ma_phuong_thuc: true,
        ten_phuong_thuc: true,
      },
      orderBy: { ma_phuong_thuc: "asc" },
    });
    methods = dbMethods;
  } catch (e) {
    console.error("Lỗi lấy phương thức tuyển sinh:", e);
  }

  try {
    // 2. Lấy danh sách chương trình đào tạo kèm tổ hợp từ DB
    const dbPrograms = await prismaPublic.chuongTrinhDaoTao.findMany({
      select: {
        ma_chuong_trinh: true,
        ten_chuong_trinh: true,
        ma_nganh: true,
        nganh: {
          select: {
            ten_nganh: true,
          },
        },
        ctdt_to_hop: {
          where: { nam: new Date().getFullYear() },
          select: {
            ma_to_hop: true,
          },
        },
      },
      orderBy: { ma_chuong_trinh: "asc" },
    });

    programs = dbPrograms.map((p) => {
      const combos = Array.from(new Set(p.ctdt_to_hop.map((c) => c.ma_to_hop)));
      return {
        ma_chuong_trinh: p.ma_chuong_trinh,
        ten_chuong_trinh: p.ten_chuong_trinh,
        ma_nganh: p.ma_nganh,
        ten_nganh: p.nganh?.ten_nganh,
        to_hop: combos,
      };
    });
  } catch (e) {
    console.error("Lỗi lấy chương trình đào tạo:", e);
  }

  const subjects = await prismaPublic.danhMucMonHoc.findMany({ select: { ma_mon: true, ten_mon: true } });
  return <NopHoSoClient methods={methods} programs={programs} subjects={subjects} />;
}

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
      select: {
        ma_phuong_thuc: true,
        ten_phuong_thuc: true,
      },
      orderBy: { ma_phuong_thuc: "asc" },
    });
    methods = dbMethods;
  } catch (e) {
    console.error("Lỗi lấy phương thức tuyển sinh:", e);
    // Fallback nếu DB rỗng
    methods = [
      { ma_phuong_thuc: "PT1", ten_phuong_thuc: "Xét tuyển theo kết quả thi tốt nghiệp THPT năm 2026" },
      { ma_phuong_thuc: "PT2", ten_phuong_thuc: "Xét tuyển dựa trên kết quả học bạ THPT" },
      { ma_phuong_thuc: "PT3", ten_phuong_thuc: "Xét tuyển theo bài thi ĐGNL ĐHQG Hà Nội (HSA)" },
      { ma_phuong_thuc: "PT4", ten_phuong_thuc: "Xét tuyển theo bài thi ĐGTD ĐH Bách Khoa (TSA)" },
      { ma_phuong_thuc: "PT5", ten_phuong_thuc: "Xét tuyển kết hợp Chứng chỉ Quốc tế & THPT" },
    ];
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
        to_hop: combos.length > 0 ? combos : ["A00", "A01", "D01", "D07"],
      };
    });
  } catch (e) {
    console.error("Lỗi lấy chương trình đào tạo:", e);
  }

  return <NopHoSoClient methods={methods} programs={programs} />;
}

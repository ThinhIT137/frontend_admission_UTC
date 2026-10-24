"use server";
import { prismaPublic } from "@/libs/prisma";
// Một truy vấn công khai, giới hạn cả đầu vào lẫn đầu ra; không gọi N lần theo ngành.
export async function recommendedPrograms(codes: string[]) {
  if (!Array.isArray(codes) || codes.length > 20 || codes.some(code => typeof code !== "string" || code.length > 64 || !code.trim())) return [];
  const unique = [...new Set(codes)];
  if (!unique.length) return [];
  const year = new Date().getFullYear();
  return prismaPublic.chuongTrinhDaoTao.findMany({
    where: { OR: [{ ma_chuong_trinh: { in: unique } }, { ma_nganh: { in: unique } }] }, take: 40, orderBy: { ma_chuong_trinh: "asc" },
    select: { ma_chuong_trinh: true, ma_nganh: true, ten_chuong_trinh: true, de_cuong: true,
      nganh: { select: { ten_nganh: true, khoi_kien_thuc: true } },
      ctdt_to_hop: { where: { nam: year }, select: { ma_to_hop: true } },
      du_doan_diem_chuan: { where: { nam_du_doan: year }, orderBy: [{ ngay_tinh_toan: "desc" }, { ma_du_doan_dc: "asc" }], select: { ma_du_doan_dc: true, nam_du_doan: true, diem_du_doan: true, ngay_tinh_toan: true } },
      lich_su_diem_chuan: { where: { nam: year }, orderBy: { nam: "desc" },
        select: { nam: true, chi_tieu: true, diem_trung_tuyen: { where: { ma_phuong_thuc: "PT1" }, select: { diem: true, ma_phuong_thuc: true, phuong_thuc: { select: { ten_phuong_thuc: true } } } } } },
    },
  });
}

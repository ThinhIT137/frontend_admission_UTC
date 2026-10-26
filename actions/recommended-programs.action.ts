"use server";
import { prismaPublic } from "@/libs/prisma";
import { programNameKey } from "@/libs/program-name";
import { PROGRAM_HISTORY_CODES } from "@/app/(main)/tinh-diem-quy-doi/program-history";
// Một truy vấn công khai, giới hạn cả đầu vào lẫn đầu ra; không gọi N lần theo ngành.
export async function recommendedPrograms(codes: string[]) {
  if (!Array.isArray(codes) || codes.length > 20 || codes.some(code => typeof code !== "string" || code.length > 64 || !code.trim())) return [];
  const unique = [...new Set(codes)];
  if (!unique.length) return [];
  const year = Number(new Intl.DateTimeFormat("en", { year: "numeric", timeZone: "Asia/Ho_Chi_Minh" }).format(new Date()));
  const catalog = await prismaPublic.chuongTrinhDaoTao.findMany({ select: { ma_chuong_trinh: true, ma_nganh: true, ten_chuong_trinh: true } });
  // Mã AI có thể thuộc năm cũ: nối sang tên/mã hiện tại trước khi lấy điểm.
  const matchingCodes = new Map(unique.map(code => {
    const names = new Set(catalog.filter(program => program.ma_chuong_trinh === code || program.ma_nganh === code).map(program => programNameKey(program.ten_chuong_trinh)));
    return [code, new Set(catalog.filter(program => program.ma_chuong_trinh === code || program.ma_nganh === code
      || PROGRAM_HISTORY_CODES[program.ma_chuong_trinh] === code
      || names.has(programNameKey(program.ten_chuong_trinh))).map(program => program.ma_chuong_trinh))] as const;
  }));
  const currentCodes = [...new Set([...matchingCodes.values()].flatMap(codes => [...codes]))];
  const programs = await prismaPublic.chuongTrinhDaoTao.findMany({
    where: { ma_chuong_trinh: { in: currentCodes }, lich_su_diem_chuan: { some: { nam: year } } }, take: 40, orderBy: { ma_chuong_trinh: "asc" },
    select: { ma_chuong_trinh: true, ma_nganh: true, ten_chuong_trinh: true, de_cuong: true,
      nganh: { select: { ten_nganh: true, khoi_kien_thuc: true } },
      ctdt_to_hop: { where: { nam: year }, select: { ma_to_hop: true } },
      du_doan_diem_chuan: { where: { nam_du_doan: year }, orderBy: [{ ngay_tinh_toan: "desc" }, { ma_du_doan_dc: "asc" }], select: { ma_du_doan_dc: true, nam_du_doan: true, diem_du_doan: true, ngay_tinh_toan: true } },
      lich_su_diem_chuan: { where: { nam: year }, orderBy: { nam: "desc" },
        select: { nam: true, chi_tieu: true, diem_trung_tuyen: { where: { ma_phuong_thuc: "PT1" }, select: { diem: true, ma_phuong_thuc: true, phuong_thuc: { select: { ten_phuong_thuc: true } } } } } },
    },
  });
  // Trả mã gợi ý nguồn riêng để client ghép đúng thẻ sau khi đổi mã tuyển sinh.
  return programs.map(program => ({ ...program, recommendation_codes: unique.filter(code => matchingCodes.get(code)?.has(program.ma_chuong_trinh)) }));
}

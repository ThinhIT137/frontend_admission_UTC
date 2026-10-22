"use server";
import { prismaPublic } from "@/libs/prisma";

export async function comparePrograms(ids: string[]) {
  if (!Array.isArray(ids) || ids.length < 2 || ids.length > 3 || ids.some(id => typeof id !== "string" || !id.trim() || id.length > 100)) throw Error("Chọn 2–3 chương trình khác nhau");
  if (new Set(ids).size !== ids.length) throw Error("Chương trình so sánh không được trùng");
  const programs = await prismaPublic.chuongTrinhDaoTao.findMany({ where: { ma_chuong_trinh: { in: ids } }, select: {
    ma_chuong_trinh: true, ten_chuong_trinh: true, mo_ta_ngan: true,
    nganh: { select: { ten_nganh: true } },
    ctdt_to_hop: { select: { nam: true, ma_to_hop: true } },
    lich_su_diem_chuan: { orderBy: { nam: "asc" }, select: { nam: true, chi_tieu: true,
      diem_trung_tuyen: { select: { ma_phuong_thuc: true, diem: true, phuong_thuc: { select: { ten_phuong_thuc: true } } } } } },
  } });
  // Không trả bảng thiếu cột nếu chương trình vừa bị xóa; giữ đúng thứ tự thí sinh chọn.
  if (programs.length !== ids.length) throw Error("Chương trình không còn tồn tại");
  const positions = new Map(ids.map((id, index) => [id, index]));
  return programs.sort((left, right) => positions.get(left.ma_chuong_trinh)! - positions.get(right.ma_chuong_trinh)!);
}

import prisma from "@/libs/prisma";
import { adminService } from "./user.service";

export async function replaceProgramCombinations(program: string, year: number, combinations: string[]) {
  await adminService.getAdminId();
  if (typeof program !== "string" || !program.trim() || !Number.isInteger(year) || year < 2000 || year > 2100 ||
      !Array.isArray(combinations) || combinations.length > 1000 ||
      combinations.some(code => typeof code !== "string" || !code.trim()) || new Set(combinations).size !== combinations.length)
    throw new Error("Danh sách tổ hợp hoặc năm tuyển sinh không hợp lệ");
  return prisma.$transaction(async tx => {
    await tx.$queryRaw`SELECT ma_chuong_trinh FROM chuong_trinh_dao_tao WHERE ma_chuong_trinh = ${program} FOR UPDATE`;
    if (!await tx.chuongTrinhDaoTao.findUnique({ where: { ma_chuong_trinh: program } })) throw new Error("Chương trình không tồn tại");
    const subjects = await tx.toHopXetTuyen.count({ where: { ma_to_hop: { in: combinations } } });
    if (subjects !== combinations.length) throw new Error("Tổ hợp không tồn tại");
    const removed = await tx.ctdtToHop.findMany({ where: { ma_chuong_trinh: program, nam: year, ma_to_hop: { notIn: combinations } } });
    if (removed.length && await tx.nguyenVongSinhVien.count({ where: { ma_chuong_trinh: program, nam_tuyen_sinh: year,
      ma_to_hop: { in: removed.map(row => row.ma_to_hop) } } }))
      throw new Error("Không thể bỏ tổ hợp đang có hồ sơ xét tuyển");
    await tx.ctdtToHop.deleteMany({ where: { ma_chuong_trinh: program, nam: year, ma_to_hop: { notIn: combinations } } });
    await tx.ctdtToHop.createMany({ data: combinations.map(ma_to_hop => ({ ma_chuong_trinh: program, nam: year, ma_to_hop })), skipDuplicates: true });
  });
}

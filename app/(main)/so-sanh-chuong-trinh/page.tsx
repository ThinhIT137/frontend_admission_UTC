import { prismaPublic } from "@/libs/prisma";
import CompareClient from "./CompareClient";
import { programNameKey } from "@/libs/program-name";
export const dynamic = "force-dynamic";
export default async function Page() {
  const programs = await prismaPublic.chuongTrinhDaoTao.findMany({ select: { ma_chuong_trinh: true, ten_chuong_trinh: true }, orderBy: { ten_chuong_trinh: "asc" } });
  // Một lựa chọn cho mỗi tên CTĐT, không lặp lựa chọn theo mã từng năm.
  const unique = new Map<string, typeof programs[number]>();
  for (const program of programs) {
    const key = programNameKey(program.ten_chuong_trinh);
    if (!unique.has(key)) unique.set(key, program);
  }
  return <CompareClient programs={[...unique.values()]} />;
}

import { prismaPublic } from "@/libs/prisma";
import CompareClient from "./CompareClient";
export const dynamic = "force-dynamic";
export default async function Page() {
  const programs = await prismaPublic.chuongTrinhDaoTao.findMany({ select: { ma_chuong_trinh: true, ten_chuong_trinh: true }, orderBy: { ten_chuong_trinh: "asc" } });
  return <CompareClient programs={programs} />;
}

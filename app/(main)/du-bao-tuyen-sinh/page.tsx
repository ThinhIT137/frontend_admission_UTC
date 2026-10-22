import PredictionClient from "./PredictionClient";
import { prismaPublic } from "@/libs/prisma";
export const dynamic = "force-dynamic";
export default async function Page() {
  const [programs, subjects] = await Promise.all([
    prismaPublic.chuongTrinhDaoTao.findMany({ select: { ma_chuong_trinh: true, ten_chuong_trinh: true } }),
    prismaPublic.danhMucMonHoc.findMany({ select: { ma_mon: true, ten_mon: true } }),
  ]);
  return <PredictionClient programs={programs} subjects={subjects} />;
}

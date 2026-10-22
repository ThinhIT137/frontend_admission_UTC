import { prismaPublic } from "@/libs/prisma";
import LoTrinhTuyenSinhClient from "./LoTrinhTuyenSinhClient";

export const metadata = {
  title: "Lộ trình tuyển sinh | UTC",
  description: "Theo dõi các mốc thời gian tuyển sinh và hướng dẫn được cập nhật trong hệ thống.",
};
export const revalidate = 60;

export default async function LoTrinhPage() {
  let dbMilestones: Awaited<ReturnType<typeof prismaPublic.loTrinhTuyenSinh.findMany>> = [];
  let loadError = false;
  try {
    dbMilestones = await prismaPublic.loTrinhTuyenSinh.findMany({ orderBy: { thoi_gian_bat_dau: "asc" } });
  } catch {
    loadError = true;
    console.error("Không tải được lộ trình tuyển sinh.");
  }
  return <LoTrinhTuyenSinhClient dbMilestones={dbMilestones} referenceTime={new Date().toISOString()} loadError={loadError} />;
}

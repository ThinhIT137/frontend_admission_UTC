import { prismaPublic } from "@/libs/prisma";
import MocThoiGianClient from "./MocThoiGianClient";

export const metadata = {
  title: "Quản Lý Mốc Thời Gian Lộ Trình | UTC Admin",
};

export default async function ManageMilestonesPage() {
  let initialData: any[] = [];
  try {
    initialData = await prismaPublic.loTrinhTuyenSinh.findMany({
      orderBy: {
        thoi_gian_bat_dau: "asc",
      },
    });
  } catch (err) {
    console.error("Lỗi tải danh mục mốc thời gian lộ trình từ database:", err);
  }

  return <MocThoiGianClient initialData={initialData} />;
}

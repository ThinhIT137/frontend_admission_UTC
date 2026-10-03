import { prismaPublic } from "@/libs/prisma";
import PhuongThucClient from "./PhuongThucClient";

export const metadata = {
  title: "Quản Lý Phương Thức Xét Tuyển | UTC Admin",
};

export default async function ManageMethodsPage() {
  let initialData: any[] = [];
  try {
    initialData = await prismaPublic.phuongThucXetTuyen.findMany({
      include: {
        _count: {
          select: {
            diem_trung_tuyen: true,
          },
        },
      },
      orderBy: {
        ma_phuong_thuc: "asc",
      },
    });
  } catch (err) {
    console.error("Lỗi tải danh mục phương thức xét tuyển từ database:", err);
  }

  return <PhuongThucClient initialData={initialData} />;
}

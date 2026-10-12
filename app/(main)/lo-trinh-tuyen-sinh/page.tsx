import { prismaPublic } from "@/libs/prisma";
import LoTrinhTuyenSinhClient from "./LoTrinhTuyenSinhClient";

export const metadata = {
  title: "Lộ Trình Tuyển Sinh & Kế Hoạch Nhập Học | UTC",
  description:
    "Lộ trình tuyển sinh Đại học chính quy UTC: timeline mốc thời gian chi tiết theo 4 giai đoạn, hướng dẫn việc thí sinh cần làm, hạn nộp hồ sơ, điều kiện phương thức xét tuyển và tra cứu trạng thái nhập học.",
};

export const revalidate = 60; // 1 minute ISR

export default async function LoTrinhPage() {
  let dbMilestones: any[] = [];
  let admissionMethods: any[] = [];

  try {
    const [milestonesRes, methodsRes] = await Promise.all([
      prismaPublic.loTrinhTuyenSinh.findMany({
        orderBy: {
          thoi_gian_bat_dau: "asc",
        },
      }),
      prismaPublic.phuongThucXetTuyen.findMany({
        orderBy: {
          ma_phuong_thuc: "asc",
        },
      }),
    ]);

    dbMilestones = milestonesRes || [];
    admissionMethods = methodsRes || [];
  } catch (err) {
    console.error("Lỗi truy vấn lộ trình tuyển sinh từ CSDL:", err);
  }

  return (
    <LoTrinhTuyenSinhClient
      dbMilestones={dbMilestones}
      admissionMethods={admissionMethods}
    />
  );
}

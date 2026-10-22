import { toHopXetTuyenService } from "@/services/to_hop_xet_tuyen.service";
import prisma from "@/libs/prisma";
import ToHopClient from "./ToHopClient";

export const metadata = {
  title: "Quản Lý Tổ Hợp Xét Tuyển | UTC Admin",
};

export default async function ManageCombinationsPage() {
  let initialData: any[] = [];
  let subjects: any[] = [];
  let allPrograms: any[] = [];

  try {
    const [toHops, dmMons, ctdts] = await Promise.all([
      toHopXetTuyenService.getAll(),
      prisma.danhMucMonHoc.findMany({ orderBy: { ten_mon: "asc" } }),
      prisma.chuongTrinhDaoTao.findMany({
        select: { ma_chuong_trinh: true, ten_chuong_trinh: true, ma_nganh: true },
        orderBy: { ten_chuong_trinh: "asc" },
      }),
    ]);
    initialData = toHops;
    subjects = dmMons;
    allPrograms = ctdts;
  } catch (err) {
    console.error("Lỗi nạp dữ liệu tổ hợp xét tuyển từ server:", err);
  }

  return <ToHopClient initialData={initialData} subjects={subjects} allPrograms={allPrograms} />;
}

import ToHopClient from "./ToHopClient";
import prisma from "@/libs/prisma";

export const metadata = {
  title: "Quản Lý Tổ Hợp Xét Tuyển | UTC Admin",
};

export default async function CombinationsPage() {
  const [toHops, danhMucMonHoc, programs] = await Promise.all([
    prisma.toHopXetTuyen.findMany({
      include: {
        mon_1: true,
        mon_2: true,
        mon_3: true,
        _count: {
          select: { ctdt_to_hop: true },
        },
      },
      orderBy: {
        ma_to_hop: "asc",
      },
    }),
    prisma.danhMucMonHoc.findMany({
      orderBy: {
        ten_mon: "asc",
      },
    }),
    prisma.chuongTrinhDaoTao.findMany({
      orderBy: {
        ten_chuong_trinh: "asc",
      },
    }),
  ]);

  return <ToHopClient initialData={toHops} subjects={danhMucMonHoc} allPrograms={programs} />;
}

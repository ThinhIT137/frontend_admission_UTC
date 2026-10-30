import CTDTClient from "./CTDTClient";
import prisma from "@/libs/prisma";

export const metadata = {
  title: "Quản Lý CTĐT | UTC Admin",
};

export default async function ManageProgramPage() {
  const [ctdts, nganhHocs, combinations] = await Promise.all([
    prisma.chuongTrinhDaoTao.findMany({
      include: {
        nganh: {
          include: {
            khoi_nganh: true,
          },
        },
        ctdt_to_hop: {
          include: {
            to_hop: true,
          },
        },
      },
      orderBy: {
        ten_chuong_trinh: "asc",
      },
    }),
    prisma.nganhHoc.findMany({
      orderBy: {
        ten_nganh: "asc",
      },
    }),
    prisma.toHopXetTuyen.findMany({ orderBy: { ma_to_hop: "asc" } }),
  ]);

  return <CTDTClient initialData={ctdts} majors={nganhHocs} combinations={combinations} />;
}

import CTDTClient from "./CTDTClient";
import prisma from "@/libs/prisma";

export const metadata = {
  title: "Quản Lý CTĐT | UTC Admin",
};

export default async function ManageProgramPage() {
  const [ctdts, nganhHocs] = await Promise.all([
    prisma.chuongTrinhDaoTao.findMany({
      include: {
        nganh: true,
      },
      orderBy: {
        create_at: "desc",
      },
    }),
    prisma.nganhHoc.findMany({
      orderBy: {
        ten_nganh: "asc",
      },
    }),
  ]);

  return <CTDTClient initialData={ctdts} majors={nganhHocs} />;
}

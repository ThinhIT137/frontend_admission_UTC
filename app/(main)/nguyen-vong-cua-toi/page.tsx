import MyPreferences from "./MyPreferences";
import { prismaPublic } from "@/libs/prisma";

export default async function Page() {
  const programs = await prismaPublic.chuongTrinhDaoTao.findMany({
    select: { ma_chuong_trinh: true, ten_chuong_trinh: true,
      ctdt_to_hop: { select: { nam: true, ma_to_hop: true } } },
    orderBy: { ten_chuong_trinh: "asc" },
  });
  return <MyPreferences programs={programs} />;
}

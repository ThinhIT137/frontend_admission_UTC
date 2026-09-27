import { NextResponse } from "next/server";
import { prismaPublic } from "@/libs/prisma";

export async function GET() {
  try {
    const totalMajors = await prismaPublic.nganhHoc.count();
    const totalPrograms = await prismaPublic.chuongTrinhDaoTao.count();
    const totalMethods = await prismaPublic.phuongThucXetTuyen.count();
    const totalCombinations = await prismaPublic.toHopXetTuyen.count();
    const totalMilestones = await prismaPublic.loTrinhTuyenSinh.count();
    const totalArticles = await prismaPublic.trangNoiDung.count();
    const totalAiKb = await prismaPublic.triThucAi.count();

    return NextResponse.json({
      success: true,
      data: {
        totalMajors,
        totalPrograms,
        totalMethods,
        totalCombinations,
        totalMilestones,
        totalArticles,
        totalAiKb,
      },
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    return NextResponse.json(
      { success: false, error: "Không thể lấy thông số thống kê" },
      { status: 500 }
    );
  }
}

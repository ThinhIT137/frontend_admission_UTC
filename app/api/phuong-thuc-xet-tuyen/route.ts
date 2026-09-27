import { NextResponse } from "next/server";
import prisma, { prismaPublic } from "@/libs/prisma";

export async function GET() {
  try {
    const phuongThucs = await prismaPublic.phuongThucXetTuyen.findMany({
      include: {
        _count: {
          select: { diem_trung_tuyen: true },
        },
      },
    });

    return NextResponse.json({ success: true, data: phuongThucs });
  } catch (error) {
    console.error("Error fetching PhuongThucXetTuyen:", error);
    return NextResponse.json(
      { success: false, error: "Không thể lấy phương thức xét tuyển" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { ma_phuong_thuc, ten_phuong_thuc } = body;

    const newPT = await prisma.phuongThucXetTuyen.create({
      data: {
        ma_phuong_thuc,
        ten_phuong_thuc,
      },
    });

    return NextResponse.json({ success: true, data: newPT });
  } catch (error) {
    console.error("Error creating PhuongThucXetTuyen:", error);
    return NextResponse.json(
      { success: false, error: "Không thể tạo mới phương thức xét tuyển" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const ma_phuong_thuc = searchParams.get("ma_phuong_thuc");

    if (!ma_phuong_thuc) {
      return NextResponse.json(
        { success: false, error: "Thiếu mã phương thức" },
        { status: 400 }
      );
    }

    await prisma.phuongThucXetTuyen.delete({
      where: { ma_phuong_thuc },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting PhuongThucXetTuyen:", error);
    return NextResponse.json(
      { success: false, error: "Không thể xóa phương thức xét tuyển" },
      { status: 500 }
    );
  }
}

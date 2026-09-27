import { NextResponse } from "next/server";
import prisma, { prismaPublic } from "@/libs/prisma";

export async function GET() {
  try {
    const list = await prismaPublic.loTrinhTuyenSinh.findMany({
      orderBy: { thoi_gian_bat_dau: "asc" },
    });

    return NextResponse.json({ success: true, data: list });
  } catch (error) {
    console.error("Error fetching LoTrinhTuyenSinh:", error);
    return NextResponse.json(
      { success: false, error: "Không thể lấy mốc thời gian lộ trình" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { ten_su_kien, thoi_gian_bat_dau, thoi_gian_ket_thuc, ghi_chu } = body;

    const newItem = await prisma.loTrinhTuyenSinh.create({
      data: {
        ten_su_kien,
        thoi_gian_bat_dau: new Date(thoi_gian_bat_dau),
        thoi_gian_ket_thuc: thoi_gian_ket_thuc ? new Date(thoi_gian_ket_thuc) : null,
        ghi_chu: ghi_chu || null,
        ma_admin_cap_nhat: "00000000-0000-0000-0000-000000000001",
      },
    });

    return NextResponse.json({ success: true, data: newItem });
  } catch (error) {
    console.error("Error creating LoTrinhTuyenSinh:", error);
    return NextResponse.json(
      { success: false, error: "Không thể tạo mốc thời gian" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const ma_su_kien = searchParams.get("ma_su_kien");

    if (!ma_su_kien) {
      return NextResponse.json(
        { success: false, error: "Thiếu mã sự kiện" },
        { status: 400 }
      );
    }

    await prisma.loTrinhTuyenSinh.delete({
      where: { ma_su_kien },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting LoTrinhTuyenSinh:", error);
    return NextResponse.json(
      { success: false, error: "Không thể xóa mốc thời gian" },
      { status: 500 }
    );
  }
}

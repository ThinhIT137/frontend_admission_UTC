import { NextResponse } from "next/server";
import prisma, { prismaPublic } from "@/libs/prisma";

export async function GET() {
  try {
    const list = await prismaPublic.triThucAi.findMany({
      orderBy: { create_at: "desc" },
    });

    return NextResponse.json({ success: true, data: list });
  } catch (error) {
    console.error("Error fetching TriThucAi:", error);
    return NextResponse.json(
      { success: false, error: "Không thể lấy dữ liệu tri thức AI" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { chu_de, cau_hoi_mau, noi_dung } = body;

    const newItem = await prisma.triThucAi.create({
      data: {
        chu_de,
        cau_hoi_mau: cau_hoi_mau || null,
        noi_dung,
        trang_thai: "active",
        ma_admin_phu_trach: "00000000-0000-0000-0000-000000000001",
      },
    });

    return NextResponse.json({ success: true, data: newItem });
  } catch (error) {
    console.error("Error creating TriThucAi:", error);
    return NextResponse.json(
      { success: false, error: "Không thể tạo dữ liệu tri thức AI" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const ma_tri_thuc = searchParams.get("ma_tri_thuc");

    if (!ma_tri_thuc) {
      return NextResponse.json(
        { success: false, error: "Thiếu mã tri thức" },
        { status: 400 }
      );
    }

    await prisma.triThucAi.delete({
      where: { ma_tri_thuc },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting TriThucAi:", error);
    return NextResponse.json(
      { success: false, error: "Không thể xóa tri thức AI" },
      { status: 500 }
    );
  }
}

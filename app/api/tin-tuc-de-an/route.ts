import { NextResponse } from "next/server";
import prisma, { prismaPublic } from "@/libs/prisma";

export async function GET() {
  try {
    const list = await prismaPublic.trangNoiDung.findMany({
      orderBy: { ngay_dang: "desc" },
    });

    return NextResponse.json({ success: true, data: list });
  } catch (error) {
    console.error("Error fetching TrangNoiDung:", error);
    return NextResponse.json(
      { success: false, error: "Không thể lấy danh sách tin tức & đề án" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { tieu_de, noi_dung_html, chuyen_muc, is_published } = body;

    const newItem = await prisma.trangNoiDung.create({
      data: {
        tieu_de,
        noi_dung_html: noi_dung_html || "",
        chuyen_muc: chuyen_muc || "TIN TỨC",
        ngay_dang: is_published ? new Date() : null,
        ma_admin_tac_gia: "00000000-0000-0000-0000-000000000001",
      },
    });

    return NextResponse.json({ success: true, data: newItem });
  } catch (error) {
    console.error("Error creating TrangNoiDung:", error);
    return NextResponse.json(
      { success: false, error: "Không thể đăng bài viết mới" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const ma_bai_viet = searchParams.get("ma_bai_viet");

    if (!ma_bai_viet) {
      return NextResponse.json(
        { success: false, error: "Thiếu mã bài viết" },
        { status: 400 }
      );
    }

    await prisma.trangNoiDung.delete({
      where: { ma_bai_viet },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting TrangNoiDung:", error);
    return NextResponse.json(
      { success: false, error: "Không thể xóa bài viết" },
      { status: 500 }
    );
  }
}

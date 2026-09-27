import { NextResponse } from "next/server";
import prisma, { prismaPublic } from "@/libs/prisma";

export async function GET() {
  try {
    const programs = await prismaPublic.chuongTrinhDaoTao.findMany({
      include: {
        nganh: true,
        lich_su_diem_chuan: {
          orderBy: { nam: "desc" },
          take: 1,
        },
      },
      orderBy: { create_at: "desc" },
    });

    return NextResponse.json({ success: true, data: programs });
  } catch (error) {
    console.error("Error fetching ChuongTrinhDaoTao:", error);
    return NextResponse.json(
      { success: false, error: "Không thể lấy chương trình đào tạo" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { ma_nganh, ten_chuong_trinh, de_cuong, chuan_dau_ra } = body;

    const newProgram = await prisma.chuongTrinhDaoTao.create({
      data: {
        ma_nganh,
        ten_chuong_trinh,
        de_cuong: de_cuong || null,
        chuan_dau_ra: chuan_dau_ra || null,
        ma_admin_quan_ly: "00000000-0000-0000-0000-000000000001",
      },
    });

    return NextResponse.json({ success: true, data: newProgram });
  } catch (error) {
    console.error("Error creating ChuongTrinhDaoTao:", error);
    return NextResponse.json(
      { success: false, error: "Không thể tạo chương trình đào tạo" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const ma_chuong_trinh = searchParams.get("ma_chuong_trinh");

    if (!ma_chuong_trinh) {
      return NextResponse.json(
        { success: false, error: "Thiếu mã chương trình" },
        { status: 400 }
      );
    }

    await prisma.chuongTrinhDaoTao.delete({
      where: { ma_chuong_trinh },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting ChuongTrinhDaoTao:", error);
    return NextResponse.json(
      { success: false, error: "Không thể xóa chương trình đào tạo" },
      { status: 500 }
    );
  }
}

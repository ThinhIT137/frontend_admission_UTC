import { NextResponse } from "next/server";
import prisma, { prismaPublic } from "@/libs/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const faculty = searchParams.get("faculty") || "ALL";

    const majors = await prismaPublic.nganhHoc.findMany({
      where: {
        AND: [
          search
            ? {
                OR: [
                  { ten_nganh: { contains: search, mode: "insensitive" } },
                  { ma_nganh: { contains: search, mode: "insensitive" } },
                ],
              }
            : {},
          faculty !== "ALL"
            ? {
                khoi_kien_thuc: { contains: faculty, mode: "insensitive" },
              }
            : {},
        ],
      },
      include: {
        chuong_trinh: {
          include: {
            ctdt_to_hop: {
              include: {
                to_hop: true,
              },
            },
            lich_su_diem_chuan: {
              orderBy: { nam: "asc" },
              include: {
                diem_trung_tuyen: {
                  include: {
                    phuong_thuc: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        ma_nganh: "asc",
      },
    });

    return NextResponse.json({ success: true, data: majors });
  } catch (error) {
    console.error("Error fetching NganhHoc:", error);
    return NextResponse.json(
      { success: false, error: "Không thể lấy dữ liệu ngành học" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { ma_nganh, ten_nganh, khoi_kien_thuc, ma_admin_quan_ly } = body;

    const newMajor = await prisma.nganhHoc.create({
      data: {
        ma_nganh,
        ten_nganh,
        khoi_kien_thuc: khoi_kien_thuc || null,
        ma_admin_quan_ly: ma_admin_quan_ly || "00000000-0000-0000-0000-000000000001",
      },
    });

    return NextResponse.json({ success: true, data: newMajor });
  } catch (error) {
    console.error("Error creating NganhHoc:", error);
    return NextResponse.json(
      { success: false, error: "Không thể tạo mới ngành học" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { ma_nganh, ma_nganh_moi, ten_nganh, khoi_kien_thuc } = body;

    const updated = await prisma.nganhHoc.update({
      where: { ma_nganh },
      data: {
        ma_nganh: ma_nganh_moi || ma_nganh,
        ten_nganh,
        khoi_kien_thuc,
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("Error updating NganhHoc:", error);
    return NextResponse.json(
      { success: false, error: "Không thể cập nhật ngành học" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const ma_nganh = searchParams.get("ma_nganh");

    if (!ma_nganh) {
      return NextResponse.json(
        { success: false, error: "Thiếu tham số ma_nganh" },
        { status: 400 }
      );
    }

    await prisma.nganhHoc.delete({
      where: { ma_nganh },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting NganhHoc:", error);
    return NextResponse.json(
      { success: false, error: "Không thể xóa ngành học" },
      { status: 500 }
    );
  }
}

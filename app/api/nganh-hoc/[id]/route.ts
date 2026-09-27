import { NextResponse } from "next/server";
import { prismaPublic } from "@/libs/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const major = await prismaPublic.nganhHoc.findFirst({
      where: {
        OR: [
          { ma_nganh: id },
          { ma_nganh: { contains: id, mode: "insensitive" } },
          { ten_nganh: { contains: id, mode: "insensitive" } },
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
    });

    if (!major) {
      return NextResponse.json(
        { success: false, error: "Không tìm thấy thông tin ngành học" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: major });
  } catch (error) {
    console.error("Error fetching major detail:", error);
    return NextResponse.json(
      { success: false, error: "Không thể lấy thông tin ngành học" },
      { status: 500 }
    );
  }
}

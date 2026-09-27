import { NextResponse } from "next/server";
import prisma, { prismaPublic } from "@/libs/prisma";

export async function GET() {
  try {
    const toHops = await prismaPublic.toHopXetTuyen.findMany({
      include: {
        mon_1: true,
        mon_2: true,
        mon_3: true,
        ctdt_to_hop: true,
      },
    });

    return NextResponse.json({ success: true, data: toHops });
  } catch (error) {
    console.error("Error fetching ToHopXetTuyen:", error);
    return NextResponse.json(
      { success: false, error: "Không thể lấy danh mục tổ hợp môn" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { ma_to_hop, ma_mon_1, ma_mon_2, ma_mon_3 } = body;

    const newToHop = await prisma.toHopXetTuyen.create({
      data: {
        ma_to_hop,
        ma_mon_1,
        ma_mon_2,
        ma_mon_3,
      },
    });

    return NextResponse.json({ success: true, data: newToHop });
  } catch (error) {
    console.error("Error creating ToHopXetTuyen:", error);
    return NextResponse.json(
      { success: false, error: "Không thể tạo tổ hợp môn" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const ma_to_hop = searchParams.get("ma_to_hop");

    if (!ma_to_hop) {
      return NextResponse.json(
        { success: false, error: "Thiếu mã tổ hợp" },
        { status: 400 }
      );
    }

    await prisma.toHopXetTuyen.delete({
      where: { ma_to_hop },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting ToHopXetTuyen:", error);
    return NextResponse.json(
      { success: false, error: "Không thể xóa tổ hợp môn" },
      { status: 500 }
    );
  }
}

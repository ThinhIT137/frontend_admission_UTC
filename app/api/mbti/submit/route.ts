import { NextRequest, NextResponse } from "next/server";
import { prismaPublic } from "@/libs/prisma";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { studentName, mbtiType, answers, scores } = body;

    if (!mbtiType) {
      return NextResponse.json(
        { success: false, error: "Thiếu nhóm tính cách MBTI" },
        { status: 400 }
      );
    }

    const sessionId = "mbti_" + crypto.randomBytes(6).toString("hex");
    const resultId = crypto.randomUUID();

    const goiYNgayPayload = JSON.stringify({
      student_name: studentName || "Thí sinh 2k8",
      session_id: sessionId,
      mbti_type: mbtiType,
      scores: scores || {},
      answers: answers || {},
      created_at: new Date().toISOString(),
    });

    // Lưu vào bảng ket_qua_trac_nghiem
    await prismaPublic.$executeRaw`
      INSERT INTO ket_qua_trac_nghiem (
        ma_ket_qua,
        session_id,
        nhom_tinh_cach,
        goi_y_nganh,
        thoi_gian_thuc_hien,
        create_at
      ) VALUES (
        ${resultId},
        ${sessionId},
        ${mbtiType},
        ${goiYNgayPayload},
        NOW(),
        NOW()
      )
    `;

    return NextResponse.json({
      success: true,
      resultId,
      sessionId,
      mbtiType,
    });
  } catch (error: any) {
    console.error("Lỗi lưu kết quả trắc nghiệm MBTI vào DB:", error);
    // Vẫn trả về response an toàn để không chặn luồng xem kết quả của người dùng
    return NextResponse.json(
      { success: false, error: error.message || "Lỗi lưu DB" },
      { status: 500 }
    );
  }
}

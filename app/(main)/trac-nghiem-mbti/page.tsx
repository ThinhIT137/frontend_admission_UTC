import { prismaPublic } from "@/libs/prisma";
import MBTITestClient from "./MBTITestClient";
import { MBTI_QUESTIONS, MbtiQuestion } from "./mbtiData";

export const metadata = {
  title: "Trắc Nghiệm Tính Cách MBTI & Tư Vấn Chọn Ngành | Tuyển Sinh UTC 2026",
  description:
    "Bài trắc nghiệm tâm lý học MBTI chuyên sâu 20 câu hỏi lấy trực tiếp từ cơ sở dữ liệu Supabase dành cho học sinh chọn ngành Kỹ thuật, Công nghệ, Kinh tế tại Đại học Giao thông Vận tải.",
};

export const revalidate = 60; // 1 minute ISR

export default async function MBTITestPage() {
  let questions: MbtiQuestion[] = MBTI_QUESTIONS;

  try {
    // 1. Truy vấn trực tiếp từ bảng cau_hoi_mbti trên CSDL Supabase
    const dbRows: any[] = await prismaPublic.$queryRaw`
      SELECT id, noi_dung, chieu_do, chieu_tich_cuc, linh_vuc_ngu_canh, trang_thai
      FROM cau_hoi_mbti
      WHERE trang_thai = 'active' OR trang_thai IS NULL
      ORDER BY id ASC
    `;

    if (dbRows && dbRows.length > 0) {
      questions = dbRows.map((row) => {
        const dim = (row.chieu_do || "EI").toUpperCase() as "EI" | "SN" | "TF" | "JP";
        const positiveTarget = (row.chieu_tich_cuc || "").toUpperCase();

        // Xác định hướng tính điểm:
        // direction = 1 nếu đồng ý ủng hộ chiều chữ cái thứ nhất (E, S, T, J)
        // direction = -1 nếu đồng ý ủng hộ chiều chữ cái thứ hai (I, N, F, P)
        let direction: 1 | -1 = 1;
        if (positiveTarget === "I" || positiveTarget === "N" || positiveTarget === "F" || positiveTarget === "P") {
          direction = -1;
        }

        return {
          id: Number(row.id),
          text: row.noi_dung,
          dimension: dim,
          direction,
        };
      });
    }
  } catch (error) {
    console.error("Lỗi truy vấn bảng cau_hoi_mbti từ Supabase:", error);
  }

  return <MBTITestClient initialQuestions={questions} />;
}

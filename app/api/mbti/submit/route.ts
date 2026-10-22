import { enforceSameOrigin, readBoundedJson, privateJson, apiFailure, publicApiLimiter } from "@/libs/api-security";
import { backendRequest } from "@/libs/api-services/backend.server";
import { NextRequest } from "next/server";
/** Nhận bài MBTI từ trình duyệt, kiểm tra thang 1–5 rồi chuyển sang backend AI.
 * Next.js chỉ chuyển yêu cầu và mã kết quả đã lưu, không tự chấm MBTI trong route này. */
export async function POST(request: NextRequest) {
    try {
        // Chặn yêu cầu khác nguồn, giới hạn lượt gọi và kích thước JSON trước khi xử lý.
        enforceSameOrigin(request);
        publicApiLimiter.check("public-mbti", 60);
        const body = (await readBoundedJson(request, 32_768))!;
        if (
            !body.answers ||
            typeof body.answers !== "object" ||
            Object.values(body.answers).some(
                (v) =>
                    typeof v !== "number" ||
                    !Number.isInteger(v) ||
                    v < 1 ||
                    v > 5,
            )
        )
            return privateJson(
                {
                    success: false,
                    error: "Câu trả lời phải dùng thang điểm 1–5",
                },
                { status: 400 },
            );
        const response = await backendRequest<{
            data: { result_id: string; session_id: string; mbti_type: string };
        }>("ai", "/api/mbti/submit", {
            method: "POST",
            body: { studentName: body.studentName, answers: body.answers },
        });
        // Có mã kết quả mới cho phép giao diện chuyển sang trang đọc kết quả đã lưu.
        if (!response.data.result_id)
            return privateJson(
                { success: false, error: "Backend chưa lưu được kết quả" },
                { status: 502 },
            );
        return privateJson({
            success: true,
            resultId: response.data.result_id,
            sessionId: response.data.session_id,
            mbtiType: response.data.mbti_type,
        });
    } catch (e) {
        return apiFailure(e);
    }
}

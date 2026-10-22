/**
 * aiService.ts
 * Adapter kết nối tới Microservice AI, ML & MBTI (backend_ai_ml).
 * Hỗ trợ các endpoint:
 * - /api/chat: Trò chuyện và tư vấn tuyển sinh AI
 * - /api/mbti/questions: Lấy bộ câu hỏi định hướng MBTI
 * - /api/mbti/submit: Chấm điểm và gợi ý ngành học từ MBTI
 * - /api/predict/admission-chance: Đánh giá xác suất trúng tuyển
 */

// Đây là adapter trong Next.js gọi HTTP sang backend AI, không phải mã mô hình AI.
// Các màn hình mới cũng có thể dùng browser-api/route trung gian; không mặc định mọi màn hình gọi adapter này.
export interface ChatRequestPayload {
  session_id?: string;
  message: string;
}

export interface ChatResponseData {
  reply: string;
  session_id: string;
  suggested_questions?: string[];
  recommended_majors?: string[];
}

export interface MBTIQuestionItem {
  id: number;
  question: string;
  dimension: "EI" | "SN" | "TF" | "JP";
  option_a: { text: string; trait: string };
  option_b: { text: string; trait: string };
}

export interface MBTISubmitPayload {
  session_id?: string;
  cccd?: string;
  ho_ten?: string;
  studentName?: string;
  answers: Record<string, number>; // Likert scores 1–5 from the actual questionnaire
}

export interface MBTIResultData {
  mbti_type: string;
  title: string;
  description: string;
  work_environment: string;
  scores: {
    E: number;
    I: number;
    S: number;
    N: number;
    T: number;
    F: number;
    J: number;
    P: number;
  };
  recommended_majors: Array<{
    ma_chuong_trinh: string;
    ten_chuong_trinh: string;
    match_score: number;
    reason: string;
  }>;
}

const AI_API_BASE = process.env.NEXT_PUBLIC_API_AI_ML || "http://localhost:8000";

export const aiService = {
  /**
   * Gửi tin nhắn tới chatbot AI
   */
  async askChat(payload: ChatRequestPayload): Promise<{ success: boolean; data?: ChatResponseData }> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000); // 4s timeout for LLM

      const res = await fetch(`${AI_API_BASE}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const json = await res.json();
        return { success: true, data: json.data || json };
      }
    } catch {
      // Backend offline -> Fallback to client logic
    }
    return { success: false };
  },

  /**
   * Lấy danh sách câu hỏi MBTI từ backend AI/ML
   */
  async getMBTIQuestions(): Promise<{ success: boolean; data?: MBTIQuestionItem[] }> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);

      const res = await fetch(`${AI_API_BASE}/api/mbti/questions`, {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const json = await res.json();
        return { success: true, data: json.data || json };
      }
    } catch {
      // Backend offline
    }
    return { success: false };
  },

  /**
   * Nộp bài làm MBTI để backend AI tính toán và gợi ý ngành học
   */
  async submitMBTI(payload: MBTISubmitPayload): Promise<{ success: boolean; data?: MBTIResultData }> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);

      const res = await fetch(`${AI_API_BASE}/api/mbti/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const json = await res.json();
        return { success: true, data: json.data || json };
      }
    } catch {
      // Backend offline
    }
    return { success: false };
  },

  /**
   * Đánh giá cơ hội trúng tuyển dựa trên điểm số (Prediction Model)
   */
  // Kiểm tra điểm trước khi gửi, rồi đổi tên trường kết quả AI về dạng mà bên gọi adapter mong đợi.
  async evaluateChance(params: {
    academic_scores: Record<string, number>;
    target_major_code?: string;
    admission_method?: string;
    priority_region?: string;
    priority_group?: string;
  }): Promise<{ success: boolean; data?: { chance_percentage: number; evaluation: string } }> {
    const scores = Object.values(params.academic_scores);
    if (!scores.length || scores.some(score => !Number.isFinite(score) || score < 0 || score > 10)) return { success: false };
    try {
      const res = await fetch(`${AI_API_BASE}/api/predict/admission-chance`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
        signal: AbortSignal.timeout(10000),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success === false) return { success: false };
        const data = json.data || json;
        return { success: true, data: { chance_percentage: data.xac_suat_trung_tuyen, evaluation: data.nhan_xet_chuyen_gia } };
      }
    } catch { /* Service unavailable. */ }
    return { success: false };
  },
};

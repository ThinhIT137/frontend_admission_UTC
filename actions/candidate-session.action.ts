"use server";

import { CandidateAuthError, currentCandidate, limitCandidateAuth, loginCandidate, logoutCandidate, registerCandidate } from "@/services/candidate-auth.service";

// Server Action chỉ trả danh tính an toàn; cặp JWT được giữ trong cookie HttpOnly ở server.
export async function candidateSessionAction(action: "login" | "register" | "me" | "logout", input: Record<string, unknown> = {}) {
  try {
    if (action === "logout") { await logoutCandidate(); return { success: true as const, user: null }; }
    if (action === "me") return { success: true as const, user: await currentCandidate() };
    limitCandidateAuth();
    if (action !== "login" && action !== "register") throw new CandidateAuthError(400);
    return { success: true as const, user: await (action === "login" ? loginCandidate(input) : registerCandidate(input)) };
  } catch (error) {
    const status = error instanceof CandidateAuthError ? error.status : typeof error === "object" && error && "status" in error ? error.status : 500;
    const customMessage = error instanceof CandidateAuthError && error.message && error.message !== "Không thể xác thực tài khoản thí sinh"
      ? error.message
      : undefined;
    const message = customMessage || (
      status === 401 ? "CCCD hoặc mật khẩu không đúng. Vui lòng kiểm tra tài khoản thí sinh." :
      status === 409 ? "Thông tin tài khoản đã tồn tại. Với hồ sơ CCCD cũ, hãy dùng chức năng kích hoạt." :
      status === 400 ? "Vui lòng kiểm tra CCCD 12 số và thông tin bắt buộc." :
      status === 429 ? "Quá nhiều yêu cầu. Vui lòng thử lại sau." :
      "Thao tác thất bại. Vui lòng thử lại."
    );
    const field = error instanceof CandidateAuthError ? error.field : undefined;
    return { success: false as const, message, field };
  }
}

import { enforceSameOrigin, readBoundedJson, privateJson, apiFailure } from "@/libs/api-security";
import { backendRequest } from "@/libs/api-services/backend.server";
import { currentCandidate, loginCandidate, registerCandidate, logoutCandidate, setCandidateCookies, limitCandidateAuth } from "@/services/candidate-auth.service";
import { NextRequest } from "next/server";

/** REST giữ tương thích cho các bên gọi cũ; đăng nhập/đăng ký dùng cùng nghiệp vụ với Server Action. */
export async function POST(request: NextRequest) {
  try {
    enforceSameOrigin(request);
    const { action, ...input } = (await readBoundedJson(request, 16_384))!;
    if (!["login", "register", "activation/request", "activation/confirm"].includes(typeof action === "string" ? action : ""))
      return privateJson({ message: "Thao tác không hợp lệ" }, { status: 400 });
    limitCandidateAuth();
    if (action === "login" || action === "register") {
      const user = await (action === "login" ? loginCandidate(input) : registerCandidate(input));
      return privateJson({ success: true, user });
    }
    // OTP vẫn do backend điểm gửi và xác minh; không thay đổi quy trình nhận tài khoản CCCD cũ.
    if (action === "activation/request") {
      await backendRequest("score", "/auth/candidate/activation/request", { method: "POST", body: input });
      return privateJson({ success: true });
    }
    const tokens = await backendRequest<{ access_token: string; refresh_token: string }>("score", "/auth/candidate/activation/confirm", { method: "POST", body: input });
    await setCandidateCookies(tokens);
    return privateJson({ success: true, user: await currentCandidate() });
  } catch (error) { return apiFailure(error); }
}
export async function GET(request: NextRequest) {
  try { enforceSameOrigin(request); return privateJson(await currentCandidate()); }
  catch (error) { return apiFailure(error, 401); }
}
export async function DELETE(request: NextRequest) {
  try { enforceSameOrigin(request); await logoutCandidate(); return privateJson({ success: true }); }
  catch (error) { return apiFailure(error); }
}

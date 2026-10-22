import { enforceSameOrigin, readBoundedJson, privateJson, apiFailure } from "@/libs/api-security";
import { backendRequest } from "@/libs/api-services/backend.server";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";

/** Đăng nhập/đăng ký/kích hoạt CCCD cũ qua backend điểm; token chỉ lưu trong cookie HttpOnly. */
export async function POST(request: NextRequest) {
    try {
        enforceSameOrigin(request);
        const { action, ...input } = (await readBoundedJson(request, 16_384))!;
        if (
            ![
                "login",
                "register",
                "activation/request",
                "activation/confirm",
            ].includes(typeof action === "string" ? action : "")
        )
            return privateJson(
                { message: "Thao tác không hợp lệ" },
                { status: 400 },
            );
        // Bước xin OTP chưa tạo phiên; chỉ sau đăng nhập/đăng ký/xác nhận mới nhận cặp token.
        if (action === "activation/request") {
            await backendRequest(
                "score",
                "/auth/candidate/activation/request",
                { method: "POST", body: input },
            );
            return privateJson({ success: true });
        }
        const tokens = await backendRequest<{
            access_token: string;
            refresh_token: string;
        }>("score", `/auth/candidate/${action}`, {
            method: "POST",
            body: input,
        });
        const jar = await cookies();
        const options = {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax" as const,
            path: "/",
        };
        // Cookie access sống 15 phút, refresh sống 7 ngày; JavaScript trên trình duyệt không đọc được.
        jar.set("candidateToken", tokens.access_token, {
            ...options,
            maxAge: 900,
        });
        jar.set("candidateRefresh", tokens.refresh_token, {
            ...options,
            maxAge: 604800,
        });
        return privateJson({ success: true });
    } catch (err) {
        return apiFailure(err);
    }
}
/** Đọc thông tin thí sinh từ phiên hiện tại; backendRequest có thể làm mới access token. */
export async function GET(request: NextRequest) {
    try {
        enforceSameOrigin(request);
        return privateJson(
            await backendRequest("score", "/auth/candidate/me", {
                auth: "candidate",
            }),
            { headers: { "Cache-Control": "no-store" } },
        );
    } catch (err) {
        return apiFailure(err, 401);
    }
}
/** Đăng xuất bằng cách xóa hai cookie phiên tại Next.js; không thu hồi JWT đã phát ở backend. */
export async function DELETE(request: NextRequest) {
    try {
        enforceSameOrigin(request);
        const jar = await cookies();
        jar.delete("candidateToken");
        jar.delete("candidateRefresh");
        return privateJson({ success: true });
    } catch (error) { return apiFailure(error); }
}

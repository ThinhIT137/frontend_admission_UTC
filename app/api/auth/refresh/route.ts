import { NextRequest, NextResponse } from "next/server";
import { adminService } from "@/services/user.service";

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const redirectUrl = searchParams.get("redirect") || "/admin";

    try {
        await adminService.refreshAccessToken();
        return NextResponse.redirect(new URL(redirectUrl, request.url));
    } catch (error) {
        // Nếu refresh thất bại (không có refreshToken hoặc token hết hạn/lỗi)
        // Redirect về trang đăng nhập
        return NextResponse.redirect(new URL("/admin/login", request.url));
    }
}

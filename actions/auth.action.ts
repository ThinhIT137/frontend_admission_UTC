"use server";

import { LoginPayload } from "@/libs/auth";
import { adminService } from "@/services/user.service";

/*=====================================================================
    login
=====================================================================*/
// Server action nhận email/mật khẩu admin; service kiểm tra tài khoản và ghi cookie phiên.
export const login = async ({ email, password }: LoginPayload) => {
    await adminService.login({ email, password });
};

/*=====================================================================
    logout
=====================================================================*/
// Xóa cookie phiên admin ở phía server, để giao diện không cần tự thao tác token.
export const logout = async () => {
    await adminService.logOut();
};

/*=====================================================================
    refresh access token
=====================================================================*/
// Đổi refresh token hợp lệ thành cặp token mới qua service xác thực của Next.js.
export const refresh = async () => {
    await adminService.refreshAccessToken();
};

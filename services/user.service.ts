import { Prisma, PrismaClient } from "@/app/generated/prisma/client";
import prisma from "@/libs/prisma";
import { ACCESS_TOKEN_MAX_AGE, REFRESH_TOKEN_MAX_AGE } from "@/libs/token";
import { LoginPayload } from "@/libs/user";
import { verifyPassword } from "@/libs/utils/password";
import { cookieService } from "./cookie.service";
import { tokenService } from "./token.service";

export const adminService = {
    /* =====================================================================
     Kiểm tra admin
    =====================================================================*/
    isValidAdmin: async (
        ma_admin: string,
        client: Prisma.TransactionClient | PrismaClient = prisma,
    ) => {
        try {
            const admin = await client.admin.findFirstOrThrow({
                where: {
                    ma_admin: ma_admin,
                },
            });
            if (!admin) return false;

            return true;
        } catch {
            console.log("Lỗi kiểm tra tài khoản admin");
            return false;
        }
    },
    /* =====================================================================
     Đăng nhập
    =====================================================================*/
    login: async ({ email, password }: LoginPayload) => {
        const user = await prisma.admin.findUnique({
            where: { email: email },
        });

        if (!user || !(await verifyPassword(password, user.mat_khau)))
            throw new Error("Email hoặc mật khẩu không chính xác!");

        const [accessToken, refreshToken] = await tokenService.generateToken(
            user.ma_admin,
        );

        await cookieService.setToken(
            ["accessToken", accessToken, ACCESS_TOKEN_MAX_AGE],
            ["refreshToken", refreshToken, REFRESH_TOKEN_MAX_AGE],
        );
    },

    /* =====================================================================
     Đăng xuất
    =====================================================================*/
    logOut: async () => {
        await cookieService.deleteCookie("accessToken");
        await cookieService.deleteCookie("refreshToken");
    },
    /* =====================================================================
     Refresh Access Token
    =====================================================================*/
    refreshAccessToken: async () => {
        const refresh = await cookieService.getCookie("refreshToken");

        if (!refresh) {
            throw new Error("Refresh token không tồn tại");
        }

        const payload = await tokenService.verifyRefreshToken(refresh);

        if (!payload) {
            await cookieService.deleteCookie("refreshToken");
            await cookieService.deleteCookie("accessToken");
            throw new Error("Refresh token không hợp lệ");
        }

        const isStillValid = await adminService.isValidAdmin(payload.userId);
        if (!isStillValid) {
            await cookieService.deleteCookie("refreshToken");
            await cookieService.deleteCookie("accessToken");
            throw new Error("Tài khoản đã bị vô hiệu hóa");
        }

        const [accessToken, refreshToken] = await tokenService.generateToken(payload.userId);

        await cookieService.deleteCookie("accessToken");
        await cookieService.deleteCookie("refreshToken");

        await cookieService.setToken(
            ["accessToken", accessToken, ACCESS_TOKEN_MAX_AGE],
            ["refreshToken", refreshToken, REFRESH_TOKEN_MAX_AGE],
        );
    },
    /* =====================================================================
     getUser
    =====================================================================*/
    getCurrentUser: async () => {
        const token = await cookieService.getCookie("accessToken");
        if (!token) {
            return null;
        }
        const payload = await tokenService.verifyAccessToken(token);
        if (!payload) {
            await cookieService.deleteCookie("accessToken");
            return null;
        }
        const user = await prisma.admin.findUnique({
            where: {
                ma_admin: payload.userId,
            },
            select: {
                ho_ten: true,
                email: true,
                vai_tro: true,
                create_at: true,
            },
        });

        return user;
    },
    /*
        get admin_id
    */
    getAdminId: async () => {
        const accesstoken = await cookieService.getCookie("accessToken");
        if (!accesstoken) {
            throw new Error("Bạn không có quyền truy cập");
        }
        const payload = await tokenService.verifyAccessToken(accesstoken);
        if (!payload) {
            throw new Error("Token không hợp lệ");
        }
        return payload.userId;
    }
};

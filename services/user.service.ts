import { Prisma, PrismaClient } from "@/app/generated/prisma/client";
import { VaiTroAdmin } from "@/constants/role";
import { CreateAdminRequest, UpdateAdminRequest } from "@/libs/admin_account/adminAccountProps";
import { LoginPayload } from "@/libs/auth";
import prisma from "@/libs/prisma";
import { ACCESS_TOKEN_MAX_AGE, REFRESH_TOKEN_MAX_AGE } from "@/libs/token";
import { verifyPassword, hashPassword } from "@/libs/utils/password";
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
                ma_admin: true,
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
    },

    /*====================================================================
        Check Super Admin
    ====================================================================*/
    isSuperAdmin: async (ma_admin: string) => {
        const admin = await prisma.admin.findUnique({
            where: { ma_admin },
            include: { vai_tro: true },
        });
        return admin?.vai_tro?.ten_vai_tro === VaiTroAdmin.super_admin;
    },

    /*====================================================================
        Get Danh sách Admin
    ====================================================================*/
    get: async (search?: string, role?: VaiTroAdmin, page: number = 1, limit: number = 10) => {
        const where: Prisma.AdminWhereInput = {};
        
        if (search) {
            where.OR = [
                { ho_ten: { contains: search, mode: "insensitive" } },
                { email: { contains: search, mode: "insensitive" } },
            ];
        }
        
        if (role) {
            where.vai_tro = { ten_vai_tro: role };
        }

        const total = await prisma.admin.count({ where });
        const skip = (page - 1) * limit;

        const data = await prisma.admin.findMany({
            where,
            select: {
                ma_admin: true,
                ho_ten: true,
                email: true,
                vai_tro: true,
                create_at: true,
            },
            orderBy: { create_at: "desc" },
            skip,
            take: limit,
        });

        return {
            data,
            total,
            page,
            totalPages: Math.ceil(total / limit),
        };
    },

    /*====================================================================
        Create Admin
    ====================================================================*/
    create: async (data: CreateAdminRequest, ma_admin_thuc_hien: string) => {
        if (!(await adminService.isSuperAdmin(ma_admin_thuc_hien))) {
            throw new Error("Chỉ Super Admin mới có quyền tạo tài khoản");
        }

        const existing = await prisma.admin.findUnique({
            where: { email: data.email },
        });
        if (existing) throw new Error("Email đã tồn tại trong hệ thống");

        const hashed = await hashPassword(data.mat_khau);

        await prisma.admin.create({
            data: {
                ...data,
                mat_khau: hashed as string,
            },
        });
    },

    /*====================================================================
        Update Admin
    ====================================================================*/
    update: async (
        ma_admin: string,
        data: UpdateAdminRequest,
        ma_admin_thuc_hien: string,
    ) => {
        const isSelf = ma_admin === ma_admin_thuc_hien;
        if (!isSelf && !(await adminService.isSuperAdmin(ma_admin_thuc_hien))) {
            throw new Error("Chỉ Super Admin mới có quyền cập nhật tài khoản người khác");
        }

        const updateData: any = { ...data };
        if (data.mat_khau) {
            updateData.mat_khau = (await hashPassword(data.mat_khau)) as string;
        } else {
            delete updateData.mat_khau; // Không update mật khẩu nếu không truyền
        }

        if (data.email) {
            const existing = await prisma.admin.findUnique({
                where: { email: data.email },
            });
            if (existing && existing.ma_admin !== ma_admin) {
                throw new Error("Email đã tồn tại trong hệ thống");
            }
        }

        await prisma.admin.update({
            where: { ma_admin },
            data: updateData,
        });
    },

    /*====================================================================
        Delete Admin
    ====================================================================*/
    delete: async (ma_admin: string, ma_admin_thuc_hien: string) => {
        if (!(await adminService.isSuperAdmin(ma_admin_thuc_hien))) {
            throw new Error("Chỉ Super Admin mới có quyền xóa tài khoản");
        }
        if (ma_admin === ma_admin_thuc_hien) {
            throw new Error("Không thể tự xóa chính mình");
        }

        await prisma.admin.delete({
            where: { ma_admin },
        });
    },
};

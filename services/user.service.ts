import { Prisma, PrismaClient } from "@/app/generated/prisma/client";
import { VaiTroAdmin } from "@/constants/role";
import { CreateAdminRequest, UpdateAdminRequest } from "@/libs/admin_account/adminAccountProps";
import { LoginPayload } from "@/libs/auth";
import prisma from "@/libs/prisma";
import { readAuthWithReconnect } from "@/libs/auth-read";
import { ACCESS_TOKEN_MAX_AGE, REFRESH_TOKEN_MAX_AGE } from "@/libs/token";
import { verifyPassword, hashPassword } from "@/libs/utils/password";
import { cookieService } from "./cookie.service";
import { tokenService } from "./token.service";

/** Quản lý tài khoản admin bằng Prisma và JWT của Next.js; tách biệt tài khoản thí sinh ở backend điểm. */
export const adminService = {
    /* =====================================================================
     Kiểm tra admin
    =====================================================================*/
    isValidAdmin: async (
        ma_admin: string,
        client: Prisma.TransactionClient | PrismaClient = prisma,
    ) => {
        const read = () => client.admin.findUnique({ where: { ma_admin } });
        // Không thử lại trong transaction đã bị lỗi; outage phải truyền lên,
        // không được coi như tài khoản bị vô hiệu rồi xóa phiên đang hợp lệ.
        const admin = await (client === prisma ? readAuthWithReconnect(read) : read());
        return admin !== null;
    },
    /* =====================================================================
     Đăng nhập
    =====================================================================*/
    login: async ({ email, password }: LoginPayload) => {
        const user = await readAuthWithReconnect(() => prisma.admin.findUnique({
            where: { email: email },
        }));

        if (!user || !(await verifyPassword(password, user.mat_khau)))
            throw new Error("Email hoặc mật khẩu không chính xác!");

        // Chỉ phát token sau khi kiểm tra mật khẩu băm; không lưu mật khẩu vào token.
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

        // Chữ ký hợp lệ chưa đủ: tài khoản admin vẫn phải còn tồn tại trong database.
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
    // Trả thông tin an toàn để hiển thị/kiểm quyền, không chọn trường mật khẩu trong truy vấn.
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
        const user = await readAuthWithReconnect(() => prisma.admin.findUnique({
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
        }));

        return user;
    },
    /*
        get admin_id
    */
    // Dành cho thao tác quản trị cần danh tính: thử refresh nếu cần, rồi kiểm tra vai trò hiện tại.
    getAdminId: async () => {
        let accesstoken = await cookieService.getCookie("accessToken");
        let payload = accesstoken ? await tokenService.verifyAccessToken(accesstoken) : null;
        if (!payload && await cookieService.getCookie("refreshToken")) {
            await adminService.refreshAccessToken();
            accesstoken = await cookieService.getCookie("accessToken");
            payload = accesstoken ? await tokenService.verifyAccessToken(accesstoken) : null;
        }
        if (!accesstoken) {
            throw new Error("Bạn không có quyền truy cập");
        }
        if (!payload) {
            throw new Error("Token không hợp lệ");
        }
        if (typeof payload.userId !== "string" || !payload.userId) throw new Error("Token không có danh tính quản trị");
        const userId = payload.userId;
        const actor = await readAuthWithReconnect(() => prisma.admin.findUnique({ where: { ma_admin: userId }, include: { vai_tro: true } }));
        if (!actor || !["super_admin", "chuyen_vien"].includes(actor.vai_tro.ten_vai_tro)) throw new Error("Tài khoản không có quyền quản trị");
        return payload.userId;
    },

    /*====================================================================
        Check Super Admin
    ====================================================================*/
    isSuperAdmin: async (ma_admin: string) => {
        const admin = await readAuthWithReconnect(() => prisma.admin.findUnique({
            where: { ma_admin },
            include: { vai_tro: true },
        }));
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
    // Được sửa thông tin chính mình; đổi vai trò hoặc sửa người khác phải qua quyền Super Admin.
    update: async (
        ma_admin: string,
        data: UpdateAdminRequest,
        ma_admin_thuc_hien: string,
    ) => {
        const isSelf = ma_admin === ma_admin_thuc_hien;
        if (!isSelf || data.ma_vai_tro !== undefined) {
            if (!(await adminService.isSuperAdmin(ma_admin_thuc_hien))) {
                throw new Error(
                    isSelf
                        ? "Chỉ Super Admin mới có quyền thay đổi vai trò"
                        : "Chỉ Super Admin mới có quyền cập nhật tài khoản người khác",
                );
            }
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
    // Chỉ Super Admin được xóa tài khoản; chặn tự xóa để tránh mất phiên quản trị của chính mình.
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

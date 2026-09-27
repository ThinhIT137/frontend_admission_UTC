import { VaiTroAdmin } from "@/app/generated/prisma/enums";
import { CreateAdminRequest, UpdateAdminRequest } from "@/libs/admin_account/adminAccountProps";
import { prismaPublic } from "@/libs/prisma";
import { hashPassword } from "@/libs/utils/password";

export const adminAccountService = {
    /*====================================================================
        Check Super Admin
    ====================================================================*/
    isSuperAdmin: async (ma_admin: string) => {
        const admin = await prismaPublic.admin.findUnique({
            where: { ma_admin },
        });
        return admin?.vai_tro === VaiTroAdmin.super_admin;
    },

    /*====================================================================
        Get Danh sách Admin
    ====================================================================*/
    get: async () => {
        return await prismaPublic.admin.findMany({
            select: {
                ma_admin: true,
                ho_ten: true,
                email: true,
                vai_tro: true,
                create_at: true,
            },
            orderBy: { create_at: "desc" },
        });
    },

    /*====================================================================
        Create Admin
    ====================================================================*/
    create: async (data: CreateAdminRequest, ma_admin_thuc_hien: string) => {
        if (!(await adminAccountService.isSuperAdmin(ma_admin_thuc_hien))) {
            throw new Error("Chỉ Super Admin mới có quyền tạo tài khoản");
        }

        const existing = await prismaPublic.admin.findUnique({
            where: { email: data.email },
        });
        if (existing) throw new Error("Email đã tồn tại trong hệ thống");

        const hashed = await hashPassword(data.mat_khau);

        await prismaPublic.admin.create({
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
        if (!(await adminAccountService.isSuperAdmin(ma_admin_thuc_hien))) {
            throw new Error("Chỉ Super Admin mới có quyền cập nhật tài khoản");
        }

        const updateData: any = { ...data };
        if (data.mat_khau) {
            updateData.mat_khau = (await hashPassword(data.mat_khau)) as string;
        } else {
            delete updateData.mat_khau; // Không update mật khẩu nếu không truyền
        }

        if (data.email) {
            const existing = await prismaPublic.admin.findUnique({
                where: { email: data.email },
            });
            if (existing && existing.ma_admin !== ma_admin) {
                throw new Error("Email đã tồn tại trong hệ thống");
            }
        }

        await prismaPublic.admin.update({
            where: { ma_admin },
            data: updateData,
        });
    },

    /*====================================================================
        Delete Admin
    ====================================================================*/
    delete: async (ma_admin: string, ma_admin_thuc_hien: string) => {
        if (!(await adminAccountService.isSuperAdmin(ma_admin_thuc_hien))) {
            throw new Error("Chỉ Super Admin mới có quyền xóa tài khoản");
        }
        if (ma_admin === ma_admin_thuc_hien) {
            throw new Error("Không thể tự xóa chính mình");
        }

        await prismaPublic.admin.delete({
            where: { ma_admin },
        });
    },
};

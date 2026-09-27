"use server";

import { VaiTroAdmin } from "@/app/generated/prisma/enums";
import { adminAccountService } from "@/services/admin_account.service";
import { adminService } from "@/services/user.service";
import { revalidatePath } from "next/cache";

const ADMIN_PATH = "/admin/accounts";

/*====================================================================
    Tạo tài khoản Admin
=====================================================================*/
export const createAdminAction = async (
    ho_ten: string,
    email: string,
    mat_khau: string,
    vai_tro: VaiTroAdmin,
) => {
    const ma_admin_thuc_hien = await adminService.getAdminId();
    try {
        await adminAccountService.create(
            { ho_ten, email, mat_khau, vai_tro },
            ma_admin_thuc_hien,
        );

        revalidatePath(ADMIN_PATH);
    } catch (err: any) {
        throw new Error(err.message || "Tạo tài khoản thất bại");
    }
};

/*====================================================================
    Cập nhật tài khoản Admin
=====================================================================*/
export const updateAdminAction = async (
    ma_admin: string,
    ho_ten?: string,
    email?: string,
    mat_khau?: string,
    vai_tro?: VaiTroAdmin,
) => {
    const ma_admin_thuc_hien = await adminService.getAdminId();

    try {
        await adminAccountService.update(
            ma_admin,
            { ho_ten, email, mat_khau, vai_tro },
            ma_admin_thuc_hien,
        );

        revalidatePath(ADMIN_PATH);
    } catch (err: any) {
        throw new Error(err.message || "Cập nhật tài khoản thất bại");
    }
};

/*====================================================================
    Xóa tài khoản Admin
=====================================================================*/
export const deleteAdminAction = async (ma_admin: string) => {
    const ma_admin_thuc_hien = await adminService.getAdminId();

    try {
        await adminAccountService.delete(ma_admin, ma_admin_thuc_hien);

        revalidatePath(ADMIN_PATH);
    } catch (err: any) {
        throw new Error(err.message || "Xóa tài khoản thất bại");
    }
};

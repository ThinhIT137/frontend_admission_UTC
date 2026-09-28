"use server";

import { VaiTroAdmin } from "@/constants/role";
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
    ma_vai_tro: string,
) => {
    const ma_admin_thuc_hien = await adminService.getAdminId();
    try {
        await adminService.create(
            { ho_ten, email, mat_khau, ma_vai_tro },
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
    ma_vai_tro?: string,
) => {
    const ma_admin_thuc_hien = await adminService.getAdminId();

    try {
        await adminService.update(
            ma_admin,
            { ho_ten, email, mat_khau, ma_vai_tro },
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
        await adminService.delete(ma_admin, ma_admin_thuc_hien);

        revalidatePath(ADMIN_PATH);
    } catch (err: any) {
        throw new Error(err.message || "Xóa tài khoản thất bại");
    }
};

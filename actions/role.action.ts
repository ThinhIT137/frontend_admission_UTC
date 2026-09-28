"use server";

import { roleService } from "@/services/role.service";
import { adminService } from "@/services/user.service";
import { revalidatePath } from "next/cache";

export const createRoleAction = async (ten_vai_tro: string, mo_ta?: string) => {
    const ma_admin_thuc_hien = await adminService.getAdminId();
    try {
        await roleService.create({ ten_vai_tro, mo_ta }, ma_admin_thuc_hien);
        revalidatePath("/admin/roles");
    } catch (error: any) {
        throw new Error(error.message || "Lỗi tạo vai trò");
    }
};

export const updateRoleAction = async (ma_vai_tro: string, ten_vai_tro?: string, mo_ta?: string) => {
    const ma_admin_thuc_hien = await adminService.getAdminId();
    try {
        await roleService.update(ma_vai_tro, { ten_vai_tro, mo_ta }, ma_admin_thuc_hien);
        revalidatePath("/admin/roles");
    } catch (error: any) {
        throw new Error(error.message || "Lỗi cập nhật vai trò");
    }
};

export const deleteRoleAction = async (ma_vai_tro: string) => {
    const ma_admin_thuc_hien = await adminService.getAdminId();
    try {
        await roleService.delete(ma_vai_tro, ma_admin_thuc_hien);
        revalidatePath("/admin/roles");
    } catch (error: any) {
        throw new Error(error.message || "Lỗi xóa vai trò");
    }
};

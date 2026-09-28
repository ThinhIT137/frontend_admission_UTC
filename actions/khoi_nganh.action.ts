"use server";

import { revalidatePath } from "next/cache";
import { khoiNganhService } from "@/services/khoi_nganh.service";
import { adminService } from "@/services/user.service";

export const getAllKhoiNganh = async () => {
    return await khoiNganhService.getAll();
};

export const createKhoiNganh = async (ma_khoi_nganh: string, ten_khoi_nganh: string) => {
    const ma_admin = await adminService.getAdminId();
    try {
        await khoiNganhService.create(ma_khoi_nganh, ten_khoi_nganh, ma_admin);
        revalidatePath("/admin/quan-ly-khoi-nganh");
        revalidatePath("/admin/quan-ly-nganh-hoc"); // Nganh hoc uses khoi nganh
        return { success: true };
    } catch (error: any) {
        return { error: error.message || "Failed to create Khối Ngành" };
    }
};

export const updateKhoiNganh = async (
    ma_khoi_nganh_cu: string,
    ma_khoi_nganh_moi: string,
    ten_khoi_nganh: string
) => {
    const ma_admin = await adminService.getAdminId();
    try {
        await khoiNganhService.update(ma_khoi_nganh_cu, ma_khoi_nganh_moi, ten_khoi_nganh, ma_admin);
        revalidatePath("/admin/quan-ly-khoi-nganh");
        revalidatePath("/admin/quan-ly-nganh-hoc");
        return { success: true };
    } catch (error: any) {
        return { error: error.message || "Failed to update Khối Ngành" };
    }
};

export const deleteKhoiNganh = async (ma_khoi_nganh: string) => {
    const ma_admin = await adminService.getAdminId();
    try {
        await khoiNganhService.delete(ma_khoi_nganh, ma_admin);
        revalidatePath("/admin/quan-ly-khoi-nganh");
        revalidatePath("/admin/quan-ly-nganh-hoc");
        return { success: true };
    } catch (error: any) {
        return { error: error.message || "Failed to delete Khối Ngành" };
    }
};

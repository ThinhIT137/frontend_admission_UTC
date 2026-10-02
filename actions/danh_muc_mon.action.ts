"use server";

import { danhMucMonService } from "@/services/danh_muc_mon.service";
import { revalidatePath } from "next/cache";

export const getDanhMucMonAction = async () => {
    try {
        return await danhMucMonService.getAll();
    } catch (error: any) {
        throw new Error(error.message || "Lỗi lấy danh sách môn học");
    }
};

export const createDanhMucMonAction = async (ma_mon: string, ten_mon: string) => {
    try {
        await danhMucMonService.create(ma_mon, ten_mon);
        revalidatePath("/admin/mon-xet-tuyen");
    } catch (error: any) {
        if (error.code === 'P2002') throw new Error("Mã môn học đã tồn tại!");
        throw new Error(error.message || "Thêm môn học thất bại");
    }
};

export const updateDanhMucMonAction = async (ma_mon: string, ten_mon: string) => {
    try {
        await danhMucMonService.update(ma_mon, ten_mon);
        revalidatePath("/admin/mon-xet-tuyen");
    } catch (error: any) {
        throw new Error(error.message || "Cập nhật môn học thất bại");
    }
};

export const deleteDanhMucMonAction = async (ma_mon: string) => {
    try {
        await danhMucMonService.delete(ma_mon);
        revalidatePath("/admin/mon-xet-tuyen");
    } catch (error: any) {
        if (error.code === 'P2003') throw new Error("Không thể xóa môn học này vì đã có dữ liệu liên quan!");
        throw new Error(error.message || "Xóa môn học thất bại");
    }
};

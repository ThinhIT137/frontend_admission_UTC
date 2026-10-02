"use server";

import { toHopXetTuyenService } from "@/services/to_hop_xet_tuyen.service";
import { revalidatePath } from "next/cache";

export const getAllToHopAction = async () => {
    try {
        const toHops = await toHopXetTuyenService.getAll();
        return toHops;
    } catch (error) {
        console.error("Lỗi getAllToHopAction:", error);
        throw error;
    }
};

export const createToHopAction = async (ma_to_hop: string, ma_mon_1: string, ma_mon_2: string, ma_mon_3: string) => {
    try {
        await toHopXetTuyenService.create(ma_to_hop, ma_mon_1, ma_mon_2, ma_mon_3);
        revalidatePath("/admin/to-hop-mon");
    } catch (error: any) {
        throw new Error(error.message || "Tạo tổ hợp thất bại");
    }
};

export const updateToHopAction = async (ma_to_hop: string, ma_mon_1: string, ma_mon_2: string, ma_mon_3: string) => {
    try {
        await toHopXetTuyenService.update(ma_to_hop, ma_mon_1, ma_mon_2, ma_mon_3);
        revalidatePath("/admin/to-hop-mon");
    } catch (error: any) {
        throw new Error(error.message || "Cập nhật tổ hợp thất bại");
    }
};

export const deleteToHopAction = async (ma_to_hop: string) => {
    try {
        await toHopXetTuyenService.delete(ma_to_hop);
        revalidatePath("/admin/to-hop-mon");
    } catch (error: any) {
        throw new Error(error.message || "Xóa tổ hợp thất bại");
    }
};

export const getProgramsByToHopAction = async (ma_to_hop: string) => {
    try {
        const data = await toHopXetTuyenService.getProgramsByToHop(ma_to_hop);
        return data;
    } catch (error: any) {
        throw new Error(error.message || "Lấy danh sách ngành thất bại");
    }
};

export const addProgramToToHopAction = async (ma_to_hop: string, ma_chuong_trinhs: string[], nam: number) => {
    try {
        await toHopXetTuyenService.addProgramToToHop(ma_to_hop, ma_chuong_trinhs, nam);
        revalidatePath("/admin/to-hop-mon");
    } catch (error: any) {
        throw new Error(error.message || "Thêm ngành thất bại");
    }
};

export const removeProgramFromToHopAction = async (ma_ctdt_to_hop: string) => {
    try {
        await toHopXetTuyenService.removeProgramFromToHop(ma_ctdt_to_hop);
        revalidatePath("/admin/to-hop-mon");
    } catch (error: any) {
        throw new Error(error.message || "Xóa ngành thất bại");
    }
};

"use server";

import { toHopXetTuyenService } from "@/services/to_hop_xet_tuyen.service";

export const getAllToHopAction = async () => {
    try {
        const toHops = await toHopXetTuyenService.getAll();
        return toHops;
    } catch (error) {
        console.error("Lỗi getAllToHopAction:", error);
        throw error;
    }
};

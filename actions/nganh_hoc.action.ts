"use server";

import { nganhHocService } from "@/services/nganh_hoc.service";
import { adminService } from "@/services/user.service";
import { revalidatePath } from "next/cache";

const NGANH_HOC_PATH = "/admin/nganh-hoc"

/*====================================================================
    Tạo ngành học
=====================================================================*/
export const createNganhHoc = async (
    ma_nganh: string,
    ten_nganh: string,
    khoi_kien_thuc: string,
) => {
    const ma_admin = await adminService.getAdminId()

    try {
        await nganhHocService.create({
            ma_nganh,
            ten_nganh,
            khoi_kien_thuc,
            ma_admin_quan_ly: ma_admin,
        });

        revalidatePath(NGANH_HOC_PATH)
    } catch (err) {
        throw new Error("Tạo ngành thất bại");
    }
}

/*====================================================================
    Cập nhật ngành học
=====================================================================*/
export const updateNganhHoc = async (
    ma_nganh: string,
    ma_nganh_moi?: string,
    ten_nganh?: string,
    khoi_kien_thuc?: string,
) => {
    const ma_admin = await adminService.getAdminId()

    try {
        await nganhHocService.update(ma_nganh, {
            ma_nganh_moi,
            ten_nganh,
            khoi_kien_thuc,
            ma_admin_quan_ly: ma_admin,
        });

        revalidatePath(NGANH_HOC_PATH)

    } catch (err) {
        throw new Error("Cập nhật ngành thất bại");
    }
}

/*====================================================================
    Xóa ngành học
=====================================================================*/
export const deleteNganhHoc = async (ma_nganh: string) => {
    const ma_admin = await adminService.getAdminId()

    try {
        await nganhHocService.delete(ma_nganh, ma_admin);

        revalidatePath(NGANH_HOC_PATH)
    } catch (err) {
        throw new Error("Xóa ngành thất bại");
    }
}

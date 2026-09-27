"use server";

import { adminService } from "@/services/user.service";
import { chuongTrinhDaoTaoService } from "@/services/chuong_trinh_dao_tao.service";
import { revalidatePath } from "next/cache";

const CTDT_PATH = "/admin/chuong-trinh-dao-tao";

/*====================================================================
    Tạo Chương trình đào tạo
=====================================================================*/
export const createCTDTAction = async (
    ma_nganh: string,
    ten_chuong_trinh: string,
    de_cuong?: string | null,
    chuan_dau_ra?: string | null,
) => {
    const ma_admin_quan_ly = await adminService.getAdminId();

    try {
        await chuongTrinhDaoTaoService.create({
            ma_nganh,
            ten_chuong_trinh,
            de_cuong,
            chuan_dau_ra,
            ma_admin_quan_ly,
        });

        revalidatePath(CTDT_PATH);
    } catch (err: any) {
        throw new Error(err.message || "Tạo chương trình đào tạo thất bại");
    }
};

/*====================================================================
    Cập nhật Chương trình đào tạo
=====================================================================*/
export const updateCTDTAction = async (
    ma_chuong_trinh: string,
    ma_nganh?: string,
    ten_chuong_trinh?: string,
    de_cuong?: string | null,
    chuan_dau_ra?: string | null,
) => {
    const ma_admin_quan_ly = await adminService.getAdminId();

    try {
        await chuongTrinhDaoTaoService.update(
            ma_chuong_trinh,
            { ma_nganh, ten_chuong_trinh, de_cuong, chuan_dau_ra, ma_admin_quan_ly },
        );

        revalidatePath(CTDT_PATH);
    } catch (err: any) {
        throw new Error(err.message || "Cập nhật chương trình đào tạo thất bại");
    }
};

/*====================================================================
    Xóa Chương trình đào tạo
=====================================================================*/
export const deleteCTDTAction = async (ma_chuong_trinh: string) => {
    const ma_admin = await adminService.getAdminId();

    try {
        await chuongTrinhDaoTaoService.delete(ma_chuong_trinh, ma_admin);

        revalidatePath(CTDT_PATH);
    } catch (err: any) {
        throw new Error(err.message || "Xóa chương trình đào tạo thất bại");
    }
};

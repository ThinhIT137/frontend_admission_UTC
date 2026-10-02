"use server";

import { paginationRequest } from "@/libs/pagination";
import { chuongTrinhDaoTaoService } from "@/services/chuong_trinh_dao_tao.service";
import { adminService } from "@/services/user.service";
import { revalidatePath } from "next/cache";

import { LoaiChuanDauRa } from "@/app/generated/prisma/client";

const CTDT_PATH = "/admin/quan-ly-ctdt";

/*====================================================================
    get — Truy vấn ngành học (5 bộ lọc)
    term → Fuzzy Search 
    faculty → Khoa/Viện 
    toHop → Tổ hợp
    diemChuan → Mức điểm  
    year → Năm tuyển sinh
====================================================================*/
export const getFilterCTDTAction = async ({
    page,
    pageSize,
    term,
    toHop,
    diemChuan,
    faculty,
    year,
}: paginationRequest & {
    term: string;
    toHop: string;
    diemChuan: number;
    faculty: string;
    year: number;
}) => {
    try {
        return await chuongTrinhDaoTaoService.getFilter({
            page,
            pageSize,
            term,
            toHop,
            diemChuan,
            faculty,
            year,
        });
    } catch (err: any) {
        throw new Error(err.message || "Lấy chương trình đào tạo thất bại");
    }
};
/*====================================================================
    Tạo Chương trình đào tạo
=====================================================================*/
export const createCTDTAction = async (
    ma_chuong_trinh: string,
    ma_nganh: string,
    ten_chuong_trinh: string,
    de_cuong?: string | null,
    chuan_dau_ra?: LoaiChuanDauRa[],
    mo_ta_ngan?: string | null,
) => {
    const ma_admin_quan_ly = await adminService.getAdminId();

    try {
        const newProgram = await chuongTrinhDaoTaoService.create({
            ma_chuong_trinh,
            ma_nganh,
            ten_chuong_trinh,
            de_cuong,
            chuan_dau_ra,
            mo_ta_ngan,
            ma_admin_quan_ly,
        });

        revalidatePath("/admin/quan-ly-nganh-hoc");
        revalidatePath(CTDT_PATH);
        return newProgram;
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
    chuan_dau_ra?: LoaiChuanDauRa[],
    mo_ta_ngan?: string | null,
) => {
    const ma_admin_quan_ly = await adminService.getAdminId();

    try {
        await chuongTrinhDaoTaoService.update(ma_chuong_trinh, {
            ma_nganh,
            ten_chuong_trinh,
            de_cuong,
            chuan_dau_ra,
            mo_ta_ngan,
            ma_admin_quan_ly,
        });

        revalidatePath(CTDT_PATH);
    } catch (err: any) {
        throw new Error(
            err.message || "Cập nhật chương trình đào tạo thất bại",
        );
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

/*====================================================================
    Đổi ngành cho nhiều CTĐT cùng lúc
=====================================================================*/
export const reassignProgramsToMajorAction = async (ma_chuong_trinhs: string[], ma_nganh: string) => {
    const ma_admin_quan_ly = await adminService.getAdminId();

    try {
        await Promise.all(
            ma_chuong_trinhs.map(ma_chuong_trinh => 
                chuongTrinhDaoTaoService.update(ma_chuong_trinh, {
                    ma_nganh,
                    ma_admin_quan_ly,
                })
            )
        );
        revalidatePath("/admin/quan-ly-nganh-hoc");
        revalidatePath(CTDT_PATH);
    } catch (err: any) {
        throw new Error(err.message || "Đổi ngành thất bại");
    }
};

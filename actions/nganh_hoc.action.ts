"use server";

import { nganhHocService } from "@/services/nganh_hoc.service";
import { adminService } from "@/services/user.service";
import { revalidatePath } from "next/cache";

const NGANH_HOC_PATH = "/admin/quan-ly-nganh-hoc"

/*====================================================================
    Lấy danh sách ngành học (có hỗ trợ 5 bộ lọc + phân trang)
    term → Fuzzy Search | faculty → Khoa/Viện | toHop → Tổ hợp
    diemChuan → Mức điểm | year → Năm tuyển sinh
=====================================================================*/
export const getAllNganhHoc = async ({
    page = 1,
    pageSize = 9,
    term = "",
    toHop = "",
    diemChuan = 0,
    faculty = "",
    year = 2026,
}: {
    page?: number;
    pageSize?: number;
    term?: string;
    toHop?: string;
    diemChuan?: number;
    faculty?: string;
    year?: number;
} = {}) => {
    try {
        const data = await nganhHocService.get({
            page,
            pageSize,
            term,
            toHop,
            diemChuan,
            faculty,
            year,
        });
        
        return {
            data: data || [],
            totalItems: data?.length || 0,
            totalPages: 1
        };
    } catch (err) {
        console.error("Lấy danh sách ngành thất bại:", err);
        return {
            data: [],
            totalItems: 0,
            totalPages: 1
        };
    }
}

/*====================================================================
    Tạo ngành học
=====================================================================*/
export const createNganhHoc = async (
    ma_nganh: string,
    ten_nganh: string,
    ma_khoi_nganh: string,
    khoi_kien_thuc: string,
) => {
    const ma_admin = await adminService.getAdminId()

    try {
        await nganhHocService.create({
            ma_nganh,
            ten_nganh,
            ma_khoi_nganh,
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
    ma_khoi_nganh?: string,
    khoi_kien_thuc?: string,
) => {
    const ma_admin = await adminService.getAdminId()

    try {
        await nganhHocService.update(ma_nganh, {
            ma_nganh_moi,
            ten_nganh,
            ma_khoi_nganh,
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

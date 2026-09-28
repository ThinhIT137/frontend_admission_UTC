import {
    createNganhHoc,
    deleteNganhHoc,
    updateNganhHoc,
} from "@/actions/nganh_hoc.action";
import { nganhHocService } from "@/services/nganh_hoc.service";
import { paginationRequest } from "../pagination";

export const nganh_hoc = {
    /*====================================================================
        getTotal
    =====================================================================*/
    getTotal: async () => {
        try {
            return await nganhHocService.getTotal();
        } catch (err) {
            console.log(err);
            return 0;
        }
    },

    /*====================================================================
        get — Truy vấn ngành học (5 bộ lọc + phân trang)
        term → Fuzzy Search | faculty → Khoa/Viện | toHop → Tổ hợp
        diemChuan → Mức điểm | year → Năm tuyển sinh
    =====================================================================*/
    get: async ({
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
            return await nganhHocService.get({
                page,
                pageSize,
                term,
                toHop,
                diemChuan,
                faculty,
                year,
            });
        } catch (err) {
            console.error("Lấy danh sách ngành thất bại:", err);
            return [];
        }
    },

    /*====================================================================
        Tạo ngành mới
    =====================================================================*/
    create: async (
        ma_nganh: string,
        ten_nganh: string,
        ma_khoi_nganh: string,
        khoi_kien_thuc: string,
    ) => {
        return await createNganhHoc(ma_nganh, ten_nganh, ma_khoi_nganh, khoi_kien_thuc);
    },
    /*====================================================================
        Cập nhật ngành
    =====================================================================*/
    update: async (
        ma_nganh: string,
        ma_nganh_moi?: string,
        ten_nganh?: string,
        ma_khoi_nganh?: string,
        khoi_kien_thuc?: string,
    ) => {
        return await updateNganhHoc(
            ma_nganh,
            ma_nganh_moi,
            ten_nganh,
            ma_khoi_nganh,
            khoi_kien_thuc,
        );
    },
    /*====================================================================
        Xóa ngành
    =====================================================================*/
    remove: async (ma_nganh: string) => {
        return await deleteNganhHoc(ma_nganh);
    },
};

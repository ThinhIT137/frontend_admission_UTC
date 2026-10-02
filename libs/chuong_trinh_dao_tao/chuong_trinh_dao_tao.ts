import {
    createCTDTAction,
    updateCTDTAction,
    deleteCTDTAction,
    getFilterCTDTAction,
} from "@/actions/chuong_trinh_dao_tao.action";
import { chuongTrinhDaoTaoService } from "@/services/chuong_trinh_dao_tao.service";
import { paginationRequest } from "../pagination";
import { LoaiChuanDauRa } from "@/app/generated/prisma/client";

export const chuong_trinh_dao_tao = {
    /*====================================================================
        getTotal
    =====================================================================*/
    getTotal: async () => {
        try {
            return await chuongTrinhDaoTaoService.getTotal();
        } catch (err) {
            console.log(err);
            return 0;
        }
    },

    /*====================================================================
        get phân trang
    =====================================================================*/
    get: async ({ page, pageSize }: paginationRequest) => {
        try {
            return await chuongTrinhDaoTaoService.get({ page, pageSize });
        } catch (err) {
            console.log(err);
            return [];
        }
    },
    /*====================================================================
        get — Truy vấn ngành học (5 bộ lọc)
        term → Fuzzy Search 
        faculty → Khoa/Viện 
        toHop → Tổ hợp
        diemChuan → Mức điểm  
        year → Năm tuyển sinh
    ====================================================================*/
    getFilter: async ({
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
        return await getFilterCTDTAction({
            page,
            pageSize,
            term,
            toHop,
            diemChuan,
            faculty,
            year,
        });
    },

    /*====================================================================
        getByNganh (Lấy danh sách theo Ngành)
    =====================================================================*/
    getByNganh: async (ma_nganh: string) => {
        try {
            return await chuongTrinhDaoTaoService.getByNganh(ma_nganh);
        } catch (err) {
            console.log(err);
            return [];
        }
    },

    /*====================================================================
        create
    =====================================================================*/
    create: async (
        ma_chuong_trinh: string,
        ma_nganh: string,
        ten_chuong_trinh: string,
        de_cuong?: string | null,
        chuan_dau_ra?: LoaiChuanDauRa[],
        mo_ta_ngan?: string | null,
    ) => {
        return await createCTDTAction(
            ma_chuong_trinh,
            ma_nganh,
            ten_chuong_trinh,
            de_cuong,
            chuan_dau_ra,
            mo_ta_ngan,
        );
    },

    /*====================================================================
        update
    =====================================================================*/
    update: async (
        ma_chuong_trinh: string,
        ma_nganh?: string,
        ten_chuong_trinh?: string,
        de_cuong?: string | null,
        chuan_dau_ra?: LoaiChuanDauRa[],
        mo_ta_ngan?: string | null,
    ) => {
        return await updateCTDTAction(
            ma_chuong_trinh,
            ma_nganh,
            ten_chuong_trinh,
            de_cuong,
            chuan_dau_ra,
            mo_ta_ngan,
        );
    },

    /*====================================================================
        delete
    =====================================================================*/
    remove: async (ma_chuong_trinh: string) => {
        return await deleteCTDTAction(ma_chuong_trinh);
    },
};

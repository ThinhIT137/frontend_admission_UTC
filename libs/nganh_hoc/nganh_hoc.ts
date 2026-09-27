import { createNganhHoc, deleteNganhHoc, updateNganhHoc } from "@/actions/nganh_hoc.action";
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
        get ngành phân trang
    =====================================================================*/
    get: async ({ page, pageSize }: paginationRequest) => {
        try {
            return await nganhHocService.get({ page, pageSize });
        } catch (err) {
            console.log(err);
            return [];
        }
    },

    /*====================================================================
        Tạo ngành mới
    =====================================================================*/
    create: async (ma_nganh: string, ten_nganh: string, khoi_kien_thuc: string) => {
        return await createNganhHoc(ma_nganh, ten_nganh, khoi_kien_thuc);
    },
    /*====================================================================
        Cập nhật ngành
    =====================================================================*/
    update: async (ma_nganh: string, ma_nganh_moi?: string, ten_nganh?: string, khoi_kien_thuc?: string) => {
        return await updateNganhHoc(ma_nganh, ma_nganh_moi, ten_nganh, khoi_kien_thuc);
    },
    /*====================================================================
        Xóa ngành
    =====================================================================*/
    remove: async (ma_nganh: string) => {
        return await deleteNganhHoc(ma_nganh);
    },
};

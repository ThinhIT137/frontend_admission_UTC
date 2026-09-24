import { nganhHocService } from "@/services/nganh_hoc";
import { paginationRequest } from "../pagination";
import { useLoading } from "@/contexts/loadingContext";
import { nganhHocCreate, nganhHocUpdate } from "./nganhHocProps";

const [setLoading] = useLoading();

export const nganh_hoc = {
    // get ngành phân trang
    get: ({ page, pageSize }: paginationRequest) => {
        try {
            setLoading(true);
            return nganhHocService.get({ page, pageSize });
        } catch (err) {
            console.log(err);
        } finally {
            setLoading(false);
        }
    },

    // Tạo ngành mới
    create: ({
        ma_nganh,
        ten_nganh,
        khoi_kien_thuc,
        ma_admin_quan_ly,
    }: nganhHocCreate) => {
        try {
            setLoading(true);
            nganhHocService.create({
                ma_nganh,
                ten_nganh,
                khoi_kien_thuc,
                ma_admin_quan_ly,
            });
        } catch (err) {
            console.log(err);
        } finally {
            setLoading(false);
        }
    },

    // update ngành
    update: (
        ma_nganh: string,
        {
            ma_nganh_moi,
            ten_nganh,
            khoi_kien_thuc,
            ma_admin_quan_ly,
        }: nganhHocUpdate,
    ) => {
        try {
            setLoading(true);
            nganhHocService.update(ma_nganh, {
                ma_nganh_moi,
                ten_nganh,
                khoi_kien_thuc,
                ma_admin_quan_ly,
            });
        } catch (err) {
            console.log(err);
        } finally {
            setLoading(false);
        }
    },

    // delete ngành học
    delete: (ma_nganh: string, ma_admin: string) => {
        try {
            setLoading(true);
            nganhHocService.delete(ma_nganh, ma_admin);
        } catch (err) {
            console.log(err);
        } finally {
            setLoading(false);
        }
    },
};

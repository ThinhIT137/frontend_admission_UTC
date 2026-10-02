import { LoaiChuanDauRa } from "@/app/generated/prisma/client";

export interface ChuongTrinhDaoTaoProps {
    ma_chuong_trinh: string;
    ma_nganh: string;
    ten_chuong_trinh: string;
    de_cuong: string | null;
    chuan_dau_ra: LoaiChuanDauRa[];
    mo_ta_ngan: string | null;
    ma_admin_quan_ly: string;
    create_at: Date;
}

export interface ChuongTrinhDaoTaoCreate {
    ma_chuong_trinh: string;
    ma_nganh: string;
    ten_chuong_trinh: string;
    de_cuong?: string | null;
    chuan_dau_ra?: LoaiChuanDauRa[];
    mo_ta_ngan?: string | null;
    ma_admin_quan_ly: string;
}

export interface ChuongTrinhDaoTaoUpdate {
    ma_nganh?: string;
    ten_chuong_trinh?: string;
    de_cuong?: string | null;
    chuan_dau_ra?: LoaiChuanDauRa[];
    mo_ta_ngan?: string | null;
    ma_admin_quan_ly: string;
}

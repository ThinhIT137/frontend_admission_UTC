export type nganhHocProps = {
    ma_nganh: string;
    ten_nganh: string;
    ma_khoi_nganh: string | null;
    khoi_kien_thuc: string | null;
    ma_admin_quan_ly: string;
    create_at: Date;
};

export type nganhHocCreate = {
    ma_nganh: string;
    ten_nganh: string;
    ma_khoi_nganh: string | null;
    khoi_kien_thuc: string | null;
    ma_admin_quan_ly: string;
};

export type nganhHocUpdate = {
    ma_nganh_moi?: string;
    ten_nganh?: string;
    ma_khoi_nganh?: string | null;
    khoi_kien_thuc?: string | null;
    ma_admin_quan_ly: string;
};

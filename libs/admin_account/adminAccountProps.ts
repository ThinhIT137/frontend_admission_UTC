import { VaiTroAdmin } from "@/constants/role";

export interface CreateAdminRequest {
    ho_ten: string;
    email: string;
    mat_khau: string;
    ma_vai_tro: string;
}

export interface UpdateAdminRequest {
    ho_ten?: string;
    email?: string;
    mat_khau?: string;
    ma_vai_tro?: string;
}

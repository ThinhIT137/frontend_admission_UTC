import { VaiTroAdmin } from "@/app/generated/prisma/enums";

export interface CreateAdminRequest {
    ho_ten: string;
    email: string;
    mat_khau: string;
    vai_tro: VaiTroAdmin;
}

export interface UpdateAdminRequest {
    ho_ten?: string;
    email?: string;
    mat_khau?: string;
    vai_tro?: VaiTroAdmin;
}

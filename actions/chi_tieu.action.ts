"use server";

import { revalidatePath } from "next/cache";
import {
  getChiTieuList,
  createChiTieu,
  updateChiTieu,
  deleteChiTieu,
} from "@/services/chi_tieu.service";

export async function getChiTieuAction(year?: number) {
  try {
    return await getChiTieuList(year);
  } catch (error: any) {
    throw new Error(error.message || "Lỗi lấy danh sách chỉ tiêu");
  }
}

export async function createChiTieuAction(data: {
  ma_chuong_trinh: string;
  nam: number;
  chi_tieu: number;
  phuong_thuc_ids: string[];
}) {
  try {
    const result = await createChiTieu(data);
    revalidatePath("/admin/chi-tieu-diem-chuan");
    return result;
  } catch (error: any) {
    throw new Error(error.message || "Lỗi tạo chỉ tiêu");
  }
}

export async function updateChiTieuAction(
  ma_ls_dc: string,
  data: {
    chi_tieu?: number;
    trung_tuyen?: number;
    diem_trung_tuyen?: {
      ma_diem_tt: string;
      diem: number;
      nguyen_vong_toi_da?: number | null;
      diem_uu_tien_toi_thieu?: number | null;
    }[];
  }
) {
  try {
    const result = await updateChiTieu(ma_ls_dc, data);
    revalidatePath("/admin/chi-tieu-diem-chuan");
    return result;
  } catch (error: any) {
    throw new Error(error.message || "Lỗi cập nhật chỉ tiêu & điểm chuẩn");
  }
}

export async function deleteChiTieuAction(ma_ls_dc: string) {
  try {
    await deleteChiTieu(ma_ls_dc);
    revalidatePath("/admin/chi-tieu-diem-chuan");
    return true;
  } catch (error: any) {
    throw new Error(error.message || "Lỗi xóa chỉ tiêu");
  }
}

"use server";

import {
  getLoTrinhTuyenSinhList,
  createLoTrinhTuyenSinh,
  updateLoTrinhTuyenSinh,
  deleteLoTrinhTuyenSinh,
} from "@/services/lo_trinh_tuyen_sinh.service";
import { revalidatePath } from "next/cache";

export async function getLoTrinhTuyenSinhAction() {
  try {
    return await getLoTrinhTuyenSinhList();
  } catch (error: any) {
    throw new Error(error.message || "Failed to fetch milestones");
  }
}

export async function createLoTrinhTuyenSinhAction(data: {
  ten_su_kien: string;
  thoi_gian_bat_dau: Date;
  thoi_gian_ket_thuc?: Date;
  ghi_chu?: string;
}) {
  try {
    const result = await createLoTrinhTuyenSinh(data);
    revalidatePath("/admin/moc-thoi-gian");
    return result;
  } catch (error: any) {
    throw new Error(error.message || "Failed to create milestone");
  }
}

export async function updateLoTrinhTuyenSinhAction(
  ma_su_kien: string,
  data: {
    ten_su_kien?: string;
    thoi_gian_bat_dau?: Date;
    thoi_gian_ket_thuc?: Date;
    ghi_chu?: string;
  }
) {
  try {
    const result = await updateLoTrinhTuyenSinh(ma_su_kien, data);
    revalidatePath("/admin/moc-thoi-gian");
    return result;
  } catch (error: any) {
    throw new Error(error.message || "Failed to update milestone");
  }
}

export async function deleteLoTrinhTuyenSinhAction(ma_su_kien: string) {
  try {
    await deleteLoTrinhTuyenSinh(ma_su_kien);
    revalidatePath("/admin/moc-thoi-gian");
    return true;
  } catch (error: any) {
    throw new Error(error.message || "Failed to delete milestone");
  }
}

"use server";

import {
  getPhuongThucXetTuyenList,
  createPhuongThucXetTuyen,
  updatePhuongThucXetTuyen,
  deletePhuongThucXetTuyen,
} from "@/services/phuong_thuc_xet_tuyen.service";
import { revalidatePath } from "next/cache";

export async function getPhuongThucXetTuyenAction() {
  try {
    return await getPhuongThucXetTuyenList();
  } catch (error: any) {
    throw new Error(error.message || "Failed to fetch methods");
  }
}

export async function createPhuongThucXetTuyenAction(data: { ma_phuong_thuc: string; ten_phuong_thuc: string }) {
  try {
    const result = await createPhuongThucXetTuyen(data);
    revalidatePath("/admin/phuong-thuc-xet-tuyen");
    return result;
  } catch (error: any) {
    throw new Error(error.message || "Failed to create method");
  }
}

export async function updatePhuongThucXetTuyenAction(ma_phuong_thuc: string, data: { ten_phuong_thuc?: string }) {
  try {
    const result = await updatePhuongThucXetTuyen(ma_phuong_thuc, data);
    revalidatePath("/admin/phuong-thuc-xet-tuyen");
    return result;
  } catch (error: any) {
    throw new Error(error.message || "Failed to update method");
  }
}

export async function deletePhuongThucXetTuyenAction(ma_phuong_thuc: string) {
  try {
    await deletePhuongThucXetTuyen(ma_phuong_thuc);
    revalidatePath("/admin/phuong-thuc-xet-tuyen");
    return true;
  } catch (error: any) {
    throw new Error(error.message || "Failed to delete method");
  }
}

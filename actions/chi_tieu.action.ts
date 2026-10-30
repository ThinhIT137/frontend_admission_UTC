"use server";
import { revalidatePath } from "next/cache";
import prisma from "@/libs/prisma";
import { adminService } from "@/services/user.service";
import { listAdminCutoffs, createAdminCutoff, updateAdminCutoff, deleteAdminCutoff, lockAdminScoreYear, type QuotaPatch } from "@/services/admin-cutoff.service";

export async function getChiTieuAction(year?: number) { return listAdminCutoffs(year); }
export async function getScoreYearLockAction(year: number) {
  await adminService.getAdminId();
  if (!Number.isInteger(year) || year < 2000 || year > 2100) throw new Error("Năm tuyển sinh không hợp lệ");
  return { nam: year, locked: !!await prisma.admissionYearLock.findUnique({ where: { nam: year } }) };
}
export async function lockScoreYearAction(year: number, confirmation: number) {
  await lockAdminScoreYear(year, confirmation); revalidatePath("/admin/chi-tieu-diem-chuan");
}
export async function createChiTieuAction(data: { ma_chuong_trinh: string; nam: number; chi_tieu: number; phuong_thuc_ids: string[] }) {
  const result = await createAdminCutoff(data); revalidatePath("/admin/chi-tieu-diem-chuan"); return result;
}
export async function updateChiTieuAction(key: string, data: QuotaPatch) {
  await updateAdminCutoff(key, data); revalidatePath("/admin/chi-tieu-diem-chuan"); return true;
}
export async function deleteChiTieuAction(key: string) {
  await deleteAdminCutoff(key); revalidatePath("/admin/chi-tieu-diem-chuan"); return true;
}

"use server";
import { backendRequest } from "@/libs/api-services/backend.server";
export async function submitApplication(input: {
  cccd: string; ma_chuong_trinh: string; ma_phuong_thuc: string; ma_to_hop?: string; nam_tuyen_sinh: number; nguyen_vong: number;
  profile?: { ho_ten: string; so_dien_thoai: string; khu_vuc: string; doi_tuong_uu_tien: string; email?: string };
  bang_diem: Array<{ loai_diem: string; nam_hoc: number; hoc_ky?: number; diem_mon: Array<{ ma_mon: string; diem_so: number }> }>;
  chung_chi: Array<{ loai_chung_chi: string; diem_hoac_hang: string; file_dinh_kem: string; ngay_cap?: string | null; ngay_het_han?: string | null }>;
  giai_thuong?: Array<{giai_thuong:string;loai_giai_thuong:string;mon_hoc:string;file_dinh_kem?:string}>;
}) {
  try {
    const me = await backendRequest<{ cccd: string }>("score", "/auth/candidate/me", { auth: "candidate" });
    if (me.cccd !== input.cccd.trim()) throw Error("CCCD trên hồ sơ phải trùng tài khoản đang đăng nhập");
    if ([...input.chung_chi, ...(input.giai_thuong || [])].some(c => !c.file_dinh_kem || !c.file_dinh_kem.startsWith(`${me.cccd}/`) || !/^\d{12}\/[\da-f-]{36}\.(pdf|jpg|png)$/.test(c.file_dinh_kem))) throw Error("Minh chứng không thuộc tài khoản này");
    if (input.profile) await backendRequest("score", "/auth/candidate/me", { method: "PATCH", auth: "candidate", body: input.profile });
    const { cccd, profile, ...payload } = input;
    const row = await backendRequest<{ ma_ho_so: string }>("score", "/ho-so", { method: "POST", body: payload, auth: "candidate" });
    return { success: true, maHoSo: row.ma_ho_so };
  } catch (err) { console.error("[Nộp hồ sơ thất bại]", err); return { success: false, error: "Không thể nộp hồ sơ. Vui lòng kiểm tra dữ liệu hoặc thử lại." }; }
}

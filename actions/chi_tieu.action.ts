"use server";

import { revalidatePath } from "next/cache";
import { backendRequest } from "@/libs/api-services/backend.server";

type CutoffScore = {
  ma_diem_tt: string;
  ma_phuong_thuc: string;
  diem: number;
  dieu_kien_mon?: Record<string, number> | null;
  nguyen_vong_toi_da?: number | null;
  diem_uu_tien_toi_thieu?: number | null;
};
type Cutoff = {
  ma_ls_dc: string;
  ma_chuong_trinh: string;
  nam: number;
  chi_tieu: number;
  trung_tuyen?: number | null;
  diem_trung_tuyen: CutoffScore[];
};
type UpdateInput = {
  chi_tieu?: number;
  trung_tuyen?: number;
  diem_trung_tuyen?: {
    ma_diem_tt: string;
    diem: number;
    dieu_kien_mon?: Record<string, number> | null;
    nguyen_vong_toi_da?: number | null;
    diem_uu_tien_toi_thieu?: number | null;
  }[];
};

// Server action nối giao diện với backend điểm; backend kiểm tra quyền và dữ liệu.
// backendRequest gắn JWT admin và làm mới token khi cần.
function failed(operation: string, error: unknown): never {
  console.error(`[chi-tieu] ${operation}`, error);
  throw new Error("Thao tác thất bại. Vui lòng thử lại.");
}

export async function getChiTieuAction(year?: number) {
  try {
    return await backendRequest<Cutoff[]>("score", `/diem-chuan${year === undefined ? "" : `?nam=${encodeURIComponent(year)}`}`, { auth: "admin" });
  } catch (error) { return failed("list", error); }
}

export async function createChiTieuAction(data: {
  ma_chuong_trinh: string; nam: number; chi_tieu: number; phuong_thuc_ids: string[];
}) {
  try {
    const result = await backendRequest<Cutoff>("score", "/diem-chuan", {
      auth: "admin", method: "POST",
      body: {
        ma_chuong_trinh: data.ma_chuong_trinh, nam: data.nam, chi_tieu: data.chi_tieu,
        diem_trung_tuyen: data.phuong_thuc_ids.map(ma_phuong_thuc => ({ ma_phuong_thuc, diem: 0 })),
      },
    });
    revalidatePath("/admin/chi-tieu-diem-chuan");
    return result;
  } catch (error) { return failed("create", error); }
}

export async function updateChiTieuAction(key: string, data: UpdateInput) {
  try {
    const path = `/diem-chuan/${encodeURIComponent(key)}`;
    // Form gửi phần thay đổi nhưng PUT cần toàn bộ bản ghi. Giữ lại các
    // phương thức và điều kiện mà người dùng không chỉnh sửa.
    const current = await backendRequest<Cutoff>("score", path, { auth: "admin" });
    const patches = new Map<string, NonNullable<UpdateInput["diem_trung_tuyen"]>[number]>();
    for (const patch of data.diem_trung_tuyen ?? []) {
      if (patches.has(patch.ma_diem_tt) || !current.diem_trung_tuyen.some(row => row.ma_diem_tt === patch.ma_diem_tt))
        throw new Error("Điểm chuẩn đã thay đổi. Vui lòng tải lại trang.");
      patches.set(patch.ma_diem_tt, patch);
    }
    const scores = current.diem_trung_tuyen.map(row => {
      const patch = patches.get(row.ma_diem_tt);
      return {
        ma_phuong_thuc: row.ma_phuong_thuc,
        diem: patch?.diem ?? row.diem,
        dieu_kien_mon: patch?.dieu_kien_mon === undefined ? row.dieu_kien_mon : patch.dieu_kien_mon,
        nguyen_vong_toi_da: patch?.nguyen_vong_toi_da === undefined ? row.nguyen_vong_toi_da : patch.nguyen_vong_toi_da,
        diem_uu_tien_toi_thieu: patch?.diem_uu_tien_toi_thieu === undefined ? row.diem_uu_tien_toi_thieu : patch.diem_uu_tien_toi_thieu,
      };
    });
    await backendRequest<Cutoff>("score", path, {
      auth: "admin", method: "PUT",
      body: {
        ma_chuong_trinh: current.ma_chuong_trinh, nam: current.nam,
        chi_tieu: data.chi_tieu ?? current.chi_tieu,
        trung_tuyen: data.trung_tuyen ?? current.trung_tuyen,
        diem_trung_tuyen: scores,
      },
    });
    revalidatePath("/admin/chi-tieu-diem-chuan");
    return true;
  } catch (error) { return failed("update", error); }
}

export async function deleteChiTieuAction(key: string) {
  try {
    await backendRequest("score", `/diem-chuan/${encodeURIComponent(key)}`, { auth: "admin", method: "DELETE" });
    revalidatePath("/admin/chi-tieu-diem-chuan");
    return true;
  } catch (error) { return failed("delete", error); }
}

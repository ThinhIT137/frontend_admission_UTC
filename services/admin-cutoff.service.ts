import prisma from "@/libs/prisma";
import { Prisma } from "@/app/generated/prisma/client";
import { adminService } from "./user.service";
import { validateMethodConfig } from "@/libs/admission-catalog";

export class CutoffError extends Error {
  constructor(message: string, public status = 400) { super(message); }
}
export type ScorePatch = { ma_diem_tt?: string; ma_phuong_thuc?: string; diem: number | null;
  nguyen_vong_toi_da?: number | null; diem_uu_tien_toi_thieu?: number | null; dieu_kien_mon?: Prisma.InputJsonValue | null };
export type QuotaPatch = { chi_tieu?: number; trung_tuyen?: number; diem_trung_tuyen?: ScorePatch[]; phuong_thuc_ids?: string[] };
async function actor() {
  try { return await adminService.getAdminId(); } catch { throw new CutoffError("Cần đăng nhập tài khoản quản trị", 403); }
}
const include = { chuong_trinh: { select: { ma_chuong_trinh: true, ten_chuong_trinh: true, ma_nganh: true } },
  diem_trung_tuyen: { include: { phuong_thuc: true } }, phuong_thuc_ap_dung: { include: { phuong_thuc: true } } } as const;
const integer = (value: unknown, low: number, high = Number.MAX_SAFE_INTEGER) => typeof value === "number" && Number.isInteger(value) && value >= low && value <= high;
const yearValid = (year: unknown) => { if (!integer(year, 2000, 2100)) throw new CutoffError("Năm tuyển sinh không hợp lệ"); };
const stable = (value: unknown): string => value && typeof value === "object" && !Array.isArray(value)
  ? JSON.stringify(Object.keys(value).sort().map(key => [key, stable((value as Record<string, unknown>)[key])])) : JSON.stringify(value);
async function yearLock(tx: Prisma.TransactionClient, year: number) {
  await tx.$executeRaw`SELECT pg_advisory_xact_lock(${71030000 + year})`;
  return tx.admissionYearLock.findUnique({ where: { nam: year } });
}
async function checkRange(tx: Prisma.TransactionClient, code: string, score: number) {
  await tx.$queryRaw`SELECT ma_phuong_thuc FROM phuong_thuc_xet_tuyen WHERE ma_phuong_thuc = ${code} FOR UPDATE`;
  const method = await tx.phuongThucXetTuyen.findUnique({ where: { ma_phuong_thuc: code } });
  let config;
  try { config = validateMethodConfig(method); } catch { throw new CutoffError("Cần cấu hình nhóm/thang điểm của phương thức trước khi nhập điểm"); }
  if (!Number.isFinite(score) || score < config.diem_toi_thieu || score > config.diem_toi_da)
    throw new CutoffError(`Điểm phải trong khoảng ${config.diem_toi_thieu}–${config.diem_toi_da}`);
}

export async function listAdminCutoffs(year?: number) {
  await actor(); if (year !== undefined) yearValid(year);
  return prisma.lichSuDiemChuan.findMany({ where: year === undefined ? {} : { nam: year }, include, orderBy: { nam: "desc" } });
}
export async function getAdminCutoff(key: string) {
  await actor();
  const row = await prisma.lichSuDiemChuan.findUnique({ where: { ma_ls_dc: key }, include });
  if (!row) throw new CutoffError("Không tìm thấy chỉ tiêu", 404);
  return row;
}

export async function createAdminCutoff(data: { ma_chuong_trinh: string; nam: number; chi_tieu: number; phuong_thuc_ids: string[]; diem_trung_tuyen?: ScorePatch[] }) {
  const admin = await actor(); yearValid(data.nam);
  if (!integer(data.chi_tieu, 1) || typeof data.ma_chuong_trinh !== "string" || !data.ma_chuong_trinh.trim() ||
      !Array.isArray(data.phuong_thuc_ids) || !data.phuong_thuc_ids.length || data.phuong_thuc_ids.length > 1000 ||
      data.phuong_thuc_ids.some(code => typeof code !== "string" || !code.trim()) || new Set(data.phuong_thuc_ids).size !== data.phuong_thuc_ids.length)
    throw new CutoffError("Thông tin chỉ tiêu/phương thức không hợp lệ");
  return prisma.$transaction(async tx => {
    if (await yearLock(tx, data.nam)) throw new CutoffError("Điểm năm tuyển sinh này đã khóa", 409);
    if (await tx.lichSuDiemChuan.findUnique({ where: { ma_chuong_trinh_nam: { ma_chuong_trinh: data.ma_chuong_trinh, nam: data.nam } } }))
      throw new CutoffError("Chương trình đã có chỉ tiêu trong năm này", 409);
    if (await tx.phuongThucXetTuyen.count({ where: { ma_phuong_thuc: { in: data.phuong_thuc_ids } } }) !== data.phuong_thuc_ids.length)
      throw new CutoffError("Phương thức không tồn tại");
    const entered = data.diem_trung_tuyen ?? [];
    if (!Array.isArray(entered) || entered.length > 1000) throw new CutoffError("Danh sách điểm không hợp lệ");
    const seen = new Set<string>();
    for (const item of [...entered].sort((a,b) => (a.ma_phuong_thuc || "").localeCompare(b.ma_phuong_thuc || ""))) {
      const code = item.ma_phuong_thuc;
      if (!code || item.ma_diem_tt || !data.phuong_thuc_ids.includes(code) || seen.has(code)) throw new CutoffError("Phương thức điểm không hợp lệ");
      seen.add(code);
      if (item.diem !== null) { if (typeof item.diem !== "number") throw new CutoffError("Điểm không hợp lệ"); await checkRange(tx, code, item.diem); }
      if (item.nguyen_vong_toi_da != null && !integer(item.nguyen_vong_toi_da, 1) || item.diem_uu_tien_toi_thieu != null &&
          (typeof item.diem_uu_tien_toi_thieu !== "number" || !Number.isFinite(item.diem_uu_tien_toi_thieu) || item.diem_uu_tien_toi_thieu < 0)) throw new CutoffError("Điều kiện không hợp lệ");
    }
    // A selected method is not a score. UI creates no score placeholders.
    return tx.lichSuDiemChuan.create({ data: { ma_chuong_trinh: data.ma_chuong_trinh, nam: data.nam,
      chi_tieu: data.chi_tieu, ma_admin_cap_nhat: admin,
      diem_trung_tuyen: { create: entered.filter(item => item.diem !== null).map(item => ({ ma_phuong_thuc: item.ma_phuong_thuc!, diem: item.diem!,
        nguyen_vong_toi_da: item.nguyen_vong_toi_da, diem_uu_tien_toi_thieu: item.diem_uu_tien_toi_thieu,
        dieu_kien_mon: item.dieu_kien_mon == null ? Prisma.DbNull : item.dieu_kien_mon })) },
      phuong_thuc_ap_dung: { create: data.phuong_thuc_ids.map(ma_phuong_thuc => ({ ma_phuong_thuc })) } }, include });
  });
}

export async function updateAdminCutoff(key: string, patch: QuotaPatch) {
  const admin = await actor();
  if (patch.diem_trung_tuyen !== undefined && (!Array.isArray(patch.diem_trung_tuyen) || patch.diem_trung_tuyen.length > 1000)) throw new CutoffError("Danh sách điểm không hợp lệ");
  if (patch.chi_tieu !== undefined && !integer(patch.chi_tieu, 1) || patch.trung_tuyen !== undefined && !integer(patch.trung_tuyen, 0))
    throw new CutoffError("Chỉ tiêu/số trúng tuyển không hợp lệ");
  const initial = await getAdminCutoff(key);
  return prisma.$transaction(async tx => {
    const locked = await yearLock(tx, initial.nam);
    await tx.$queryRaw`SELECT ma_ls_dc FROM lich_su_diem_chuan WHERE ma_ls_dc = ${key} FOR UPDATE`;
    const current = await tx.lichSuDiemChuan.findUnique({ where: { ma_ls_dc: key }, include });
    if (!current || current.nam !== initial.nam) throw new CutoffError("Chỉ tiêu đã thay đổi. Hãy tải lại", 409);
    const selected = new Set([...current.phuong_thuc_ap_dung.map(row => row.ma_phuong_thuc), ...current.diem_trung_tuyen.map(row => row.ma_phuong_thuc)]);
    if (patch.phuong_thuc_ids !== undefined) {
      const ids = patch.phuong_thuc_ids;
      if (!Array.isArray(ids) || ids.length > 1000 || ids.some(code => typeof code !== "string" || !code.trim()) || new Set(ids).size !== ids.length || [...selected].some(code => !ids.includes(code)))
        throw new CutoffError("Danh sách phương thức không hợp lệ; không tự bỏ phương thức đã có");
      if (locked && ids.some(code => !selected.has(code))) throw new CutoffError("Điểm năm tuyển sinh này đã khóa", 409);
      if (await tx.phuongThucXetTuyen.count({ where: { ma_phuong_thuc: { in: ids } } }) !== ids.length) throw new CutoffError("Phương thức không tồn tại");
      ids.forEach(code => selected.add(code));
    }
    const seen = new Set<string>();
    const changes = (patch.diem_trung_tuyen ?? []).map(item => {
      const old = item.ma_diem_tt ? current.diem_trung_tuyen.find(row => row.ma_diem_tt === item.ma_diem_tt) : current.diem_trung_tuyen.find(row => row.ma_phuong_thuc === item.ma_phuong_thuc);
      const code = item.ma_phuong_thuc ?? old?.ma_phuong_thuc;
      if (!code || !selected.has(code) || seen.has(code) || item.ma_diem_tt && (!old || old.ma_phuong_thuc !== code))
        throw new CutoffError("Phương thức/điểm đã thay đổi. Hãy tải lại", 409);
      seen.add(code);
      if (item.diem !== null && (typeof item.diem !== "number" || !Number.isFinite(item.diem))) throw new CutoffError("Điểm phải là số hữu hạn");
      const value = { diem: item.diem, nguyen_vong_toi_da: item.nguyen_vong_toi_da === undefined ? old?.nguyen_vong_toi_da ?? null : item.nguyen_vong_toi_da,
        diem_uu_tien_toi_thieu: item.diem_uu_tien_toi_thieu === undefined ? old?.diem_uu_tien_toi_thieu ?? null : item.diem_uu_tien_toi_thieu,
        dieu_kien_mon: item.dieu_kien_mon === undefined ? old?.dieu_kien_mon ?? null : item.dieu_kien_mon };
      if (value.nguyen_vong_toi_da !== null && !integer(value.nguyen_vong_toi_da, 1) || value.diem_uu_tien_toi_thieu !== null &&
          (!Number.isFinite(value.diem_uu_tien_toi_thieu) || value.diem_uu_tien_toi_thieu < 0)) throw new CutoffError("Điều kiện xét tuyển không hợp lệ");
      const prior = old ? { diem: old.diem, nguyen_vong_toi_da: old.nguyen_vong_toi_da, diem_uu_tien_toi_thieu: old.diem_uu_tien_toi_thieu, dieu_kien_mon: old.dieu_kien_mon } : null;
      const changed = old ? stable(value) !== stable(prior) : item.diem !== null;
      if (locked && changed) throw new CutoffError("Điểm năm tuyển sinh này đã khóa", 409);
      return { code, old, value, changed };
    });
    // Lock methods in a fixed order, matching backend configuration updates.
    for (const item of [...changes].sort((a,b) => a.code.localeCompare(b.code))) {
      if (!item.changed || item.value.diem === null) continue;
      await checkRange(tx, item.code, item.value.diem);
    }
    for (const item of changes) {
      if (!item.changed) continue;
      if (item.value.diem === null) { if (item.old) await tx.diemTrungTuyen.delete({ where: { ma_diem_tt: item.old.ma_diem_tt } }); continue; }
      const value = { ...item.value, diem: item.value.diem, dieu_kien_mon: item.value.dieu_kien_mon == null ? Prisma.DbNull : item.value.dieu_kien_mon as Prisma.InputJsonValue };
      if (item.old) await tx.diemTrungTuyen.update({ where: { ma_diem_tt: item.old.ma_diem_tt }, data: value });
      else await tx.diemTrungTuyen.create({ data: { ...value, ma_ls_dc: key, ma_phuong_thuc: item.code } });
    }
    if (patch.phuong_thuc_ids?.length) await tx.cutoffMethod.createMany({ data: patch.phuong_thuc_ids.map(ma_phuong_thuc => ({ ma_ls_dc: key, ma_phuong_thuc })), skipDuplicates: true });
    return tx.lichSuDiemChuan.update({ where: { ma_ls_dc: key }, data: { chi_tieu: patch.chi_tieu,
      trung_tuyen: patch.trung_tuyen, ma_admin_cap_nhat: admin }, include });
  });
}

export async function deleteAdminCutoff(key: string) {
  await actor(); const row = await getAdminCutoff(key);
  return prisma.$transaction(async tx => {
    if (await yearLock(tx, row.nam)) throw new CutoffError("Điểm năm tuyển sinh này đã khóa", 409);
    await tx.lichSuDiemChuan.delete({ where: { ma_ls_dc: key } });
  });
}

export async function lockAdminScoreYear(year: number, confirmation: number) {
  const admin = await actor(); yearValid(year);
  if (confirmation !== year) throw new CutoffError("Nhập đúng năm để xác nhận khóa");
  return prisma.$transaction(async tx => {
    await yearLock(tx, year);
    await tx.admissionYearLock.upsert({ where: { nam: year }, create: { nam: year, ma_admin: admin }, update: {} });
    return { nam: year, locked: true };
  });
}

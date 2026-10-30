export const METHOD_GROUPS = {
  THPT: "Điểm thi THPT", HOC_BA: "Học bạ THPT", HSA: "ĐGNL (HSA)",
  TSA: "ĐGTD (TSA)", KET_HOP: "Xét tuyển kết hợp", TUYEN_THANG: "Tuyển thẳng", KHAC: "Khác",
} as const;
export type MethodGroup = keyof typeof METHOD_GROUPS;
export type MethodConfig = { nhom_xet_tuyen: MethodGroup; diem_toi_thieu: number; diem_toi_da: number };
export function validateMethodConfig(value: unknown): MethodConfig {
  const v = value as MethodConfig;
  if (!v || !Object.hasOwn(METHOD_GROUPS, v.nhom_xet_tuyen)) throw new Error("Vui lòng chọn nhóm xét tuyển");
  if (typeof v.diem_toi_thieu !== "number" || typeof v.diem_toi_da !== "number" ||
      !Number.isFinite(v.diem_toi_thieu) || !Number.isFinite(v.diem_toi_da) ||
      v.diem_toi_thieu < 0 || v.diem_toi_da <= v.diem_toi_thieu)
    throw new Error("Thang điểm phải có giới hạn hữu hạn, từ 0 và điểm tối đa lớn hơn điểm tối thiểu");
  return { nhom_xet_tuyen: v.nhom_xet_tuyen, diem_toi_thieu: v.diem_toi_thieu, diem_toi_da: v.diem_toi_da };
}
export const combinationKey = (subjects: string[]) => [...subjects].map(s => s.trim()).sort().join("\u0000");

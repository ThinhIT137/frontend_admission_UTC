import type { AcademicDraft } from "./AcademicEvidenceFields";

export function academicPayload(input: AcademicDraft) {
  const keys = new Set<string>();
  const bang_diem = input.bang_diem.map(t => {
    if (!Number.isInteger(t.nam_hoc) || t.nam_hoc < 1900 || t.nam_hoc > 2100) throw Error("Năm học không hợp lệ");
    const key = `${t.loai_diem}:${t.nam_hoc}:${t.hoc_ky}`;
    const prefix = `${t.loai_diem}:${t.nam_hoc}:`;
    if ([...keys].some(k => k.startsWith(prefix) && (t.hoc_ky === 0 || k.endsWith(":0")))) throw Error("Chọn cả năm hoặc từng học kỳ cho cùng lớp/năm, không nhập đồng thời");
    if (keys.has(key)) throw Error("Bảng điểm trùng lớp, năm và học kỳ"); keys.add(key);
    const seen = new Set<string>();
    const diem_mon = t.diem_mon.filter(g => g.ma_mon || g.diem_so !== "").map(g => {
      const score = Number(g.diem_so);
      if (!g.ma_mon || g.diem_so === "" || !Number.isFinite(score) || score < 0 || score > 10 || seen.has(g.ma_mon)) throw Error("Điểm môn thiếu, trùng hoặc ngoài khoảng 0–10");
      seen.add(g.ma_mon); return {ma_mon:g.ma_mon,diem_so:score};
    });
    if (!diem_mon.length) throw Error("Nhập ít nhất một môn hoặc bỏ bảng điểm không sử dụng");
    return {...t,diem_mon};
  });
  const chung_chi = input.chung_chi.map(c => {
    if (!c.loai_chung_chi.trim() || !c.diem_hoac_hang.trim() || !c.ngay_cap || !c.file_dinh_kem) throw Error("Nhập đủ loại, điểm, ngày cấp và minh chứng chứng chỉ");
    if (c.ngay_het_han && c.ngay_het_han < c.ngay_cap) throw Error("Ngày hết hạn phải sau ngày cấp");
    return {...c,ngay_cap:`${c.ngay_cap}T00:00:00`,ngay_het_han:c.ngay_het_han?`${c.ngay_het_han}T00:00:00`:null};
  });
  const giai_thuong = input.giai_thuong.map(a => { if (!a.file_dinh_kem) throw Error("Chọn minh chứng giải thưởng"); return a; });
  if (!bang_diem.length && !chung_chi.length && !giai_thuong.length) throw Error("Cần bảng điểm, chứng chỉ hoặc giải thưởng");
  return {bang_diem,chung_chi,giai_thuong};
}

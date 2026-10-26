"use client";
import { useState } from "react";
import styles from "@/components/admission/candidate.module.css";

export type TranscriptDraft = { loai_diem: string; nam_hoc: number; hoc_ky: number; diem_mon: Array<{ ma_mon: string; diem_so: string }> };
export type CertificateDraft = { loai_chung_chi: string; diem_hoac_hang: string; ngay_cap: string; ngay_het_han: string; file_dinh_kem: string };
export type AwardDraft = { giai_thuong: string; loai_giai_thuong: string; mon_hoc: string; file_dinh_kem: string };
export type AcademicDraft = { bang_diem: TranscriptDraft[]; chung_chi: CertificateDraft[]; giai_thuong: AwardDraft[] };
export const emptyTranscript = (year: number): TranscriptDraft => ({ loai_diem: "lop_12", nam_hoc: year, hoc_ky: 0, diem_mon: Array.from({ length: 3 }, () => ({ ma_mon: "", diem_so: "" })) });
const ranks = { giai_nhat: "Giải nhất", giai_nhi: "Giải nhì", giai_ba: "Giải ba", khuyen_khich: "Khuyến khích" };
const levels = { toan_quoc: "Toàn quốc", tinh: "Tỉnh", mien_bac: "Miền Bắc", mien_nam: "Miền Nam" };
const awardSubjects = { toan: "Toán", van: "Văn", anh: "Tiếng Anh", vat_ly: "Vật lý", hoa_hoc: "Hóa học", sinh_hoc: "Sinh học", dia_ly: "Địa lý", lich_su: "Lịch sử", gdcd: "GDCD", tin_hoc: "Tin học" };

export default function AcademicEvidenceFields({ value, onChange, subjects, files, year }: {
  value: AcademicDraft; onChange: (value: AcademicDraft) => void; year: number;
  subjects: Array<{ ma_mon: string; ten_mon: string }>; files: Array<{ storageKey: string; fileName: string }>;
}) {
  const [sequence, setSequence] = useState(0);
  const inputClass = styles.control;
  function transcripts(index: number, patch: Partial<TranscriptDraft>) { onChange({ ...value, bang_diem: value.bang_diem.map((t, i) => i === index ? { ...t, ...patch } : t) }); }
  function fileSelect(label: string, selected: string, change: (key: string) => void) {
    return <label>{label}<select aria-label={label} className={inputClass} value={selected} onChange={e => change(e.target.value)}><option value="">Chọn minh chứng đã tải</option>{files.map(f => <option key={f.storageKey} value={f.storageKey}>{f.fileName}</option>)}</select></label>;
  }
  return <section className={`${styles.panel} ${styles.academic} space-y-5`}>
    <h2 className="font-bold">Học bạ nhiều năm / học kỳ, chứng chỉ và giải thưởng</h2>
    <p className={styles.muted}>Nhập những bảng điểm có trong hồ sơ; năm học là năm kết thúc. Với chứng chỉ và giải thưởng, chọn file đã lưu hoặc gắn file mới ở bước minh chứng tiếp theo.</p>
    {value.bang_diem.map((t, i) => <fieldset key={i} className="border rounded p-3 space-y-2"><legend>Bảng điểm {i + 1}</legend>
      <label>Lớp <select aria-label={`Lớp bảng điểm ${i + 1}`} className={inputClass} value={t.loai_diem} onChange={e => transcripts(i, { loai_diem: e.target.value })}>{[10,11,12].map(n => <option key={n} value={`lop_${n}`}>Lớp {n}</option>)}</select></label>
      <label>Năm kết thúc <input aria-label={`Năm học bảng điểm ${i + 1}`} className={inputClass} type="number" min={1900} max={2100} value={t.nam_hoc} onChange={e => transcripts(i, { nam_hoc: Number(e.target.value) })} /></label>
      <label>Học kỳ <select aria-label={`Học kỳ bảng điểm ${i + 1}`} className={inputClass} value={t.hoc_ky} onChange={e => transcripts(i, { hoc_ky: Number(e.target.value) })}><option value={0}>Cả năm</option><option value={1}>Học kỳ 1</option><option value={2}>Học kỳ 2</option></select></label>
      {t.diem_mon.map((g, j) => <div key={j} className="flex flex-wrap gap-2"><select aria-label={i === 0 ? `Môn ${j+1}` : `Bảng ${i+1} môn ${j+1}`} className={inputClass} value={g.ma_mon} onChange={e => transcripts(i, { diem_mon: t.diem_mon.map((v,k) => k===j ? {...v,ma_mon:e.target.value} : v) })}><option value="">Chọn môn</option>{subjects.map(s => <option key={s.ma_mon} value={s.ma_mon}>{s.ten_mon}</option>)}</select>
        <input aria-label={i === 0 ? `Điểm môn ${j+1}` : `Điểm bảng ${i+1} môn ${j+1}`} className={inputClass} placeholder="Điểm 0–10" type="number" min={0} max={10} step={0.01} value={g.diem_so} onChange={e => transcripts(i, { diem_mon: t.diem_mon.map((v,k) => k===j ? {...v,diem_so:e.target.value} : v) })} />
        <button type="button" onClick={() => transcripts(i, { diem_mon: t.diem_mon.filter((_,k) => k!==j) })}>Bỏ môn</button></div>)}
      <button type="button" className={`${styles.secondary} mr-3`} onClick={() => transcripts(i, { diem_mon: [...t.diem_mon,{ma_mon:"",diem_so:""}] })}>Thêm môn</button>
      <button type="button" className={styles.secondary} onClick={() => onChange({...value,bang_diem:value.bang_diem.filter((_,k)=>k!==i)})}>Bỏ bảng điểm</button>
    </fieldset>)}
    <button type="button" className={styles.secondary} onClick={() => onChange({...value,bang_diem:[...value.bang_diem,emptyTranscript(year)]})}>Thêm bảng điểm năm/kỳ</button>
    <h3 className="font-bold">Chứng chỉ</h3>
    {value.chung_chi.map((c,i) => { const patch = (p: Partial<CertificateDraft>) => onChange({...value,chung_chi:value.chung_chi.map((v,k)=>k===i?{...v,...p}:v)}); return <fieldset key={i} className="border p-3 flex flex-wrap gap-3"><legend>Chứng chỉ {i+1}</legend>
      <label>Loại chứng chỉ<input aria-label={`Loại chứng chỉ ${i+1}`} className={inputClass} placeholder="IELTS / TOEFL / SAT / HSA / TSA..." value={c.loai_chung_chi} onChange={e=>patch({loai_chung_chi:e.target.value})} /></label>
      <label>Điểm hoặc hạng<input aria-label={`Điểm chứng chỉ ${i+1}`} className={inputClass} placeholder="Điểm hoặc hạng thực tế" value={c.diem_hoac_hang} onChange={e=>patch({diem_hoac_hang:e.target.value})} /></label>
      <label>Ngày cấp <input aria-label={`Ngày cấp chứng chỉ ${i+1}`} className={inputClass} type="date" value={c.ngay_cap} onChange={e=>patch({ngay_cap:e.target.value})} /></label>
      <label>Ngày hết hạn (nếu có) <input aria-label={`Ngày hết hạn chứng chỉ ${i+1}`} className={inputClass} type="date" value={c.ngay_het_han} onChange={e=>patch({ngay_het_han:e.target.value})} /></label>
      {fileSelect(`Minh chứng chứng chỉ ${i+1}`,c.file_dinh_kem,key=>patch({file_dinh_kem:key}))}
      <button type="button" onClick={()=>onChange({...value,chung_chi:value.chung_chi.filter((_,k)=>k!==i)})}>Bỏ chứng chỉ</button>
    </fieldset>; })}
    <button type="button" className={styles.secondary} onClick={()=>onChange({...value,chung_chi:[...value.chung_chi,{loai_chung_chi:"",diem_hoac_hang:"",ngay_cap:"",ngay_het_han:"",file_dinh_kem:""}]})}>Thêm chứng chỉ</button>
    <h3 className="font-bold">Giải thưởng</h3>
    {value.giai_thuong.map((a,i)=>{ const patch=(p:Partial<AwardDraft>)=>onChange({...value,giai_thuong:value.giai_thuong.map((v,k)=>k===i?{...v,...p}:v)}); return <fieldset key={`${sequence}-${i}`} className="border p-3 flex flex-wrap gap-3"><legend>Giải thưởng {i+1}</legend>
      <select aria-label={`Hạng giải ${i+1}`} className={inputClass} value={a.giai_thuong} onChange={e=>patch({giai_thuong:e.target.value})}>{Object.entries(ranks).map(([k,v])=><option key={k} value={k}>{v}</option>)}</select>
      <select aria-label={`Cấp giải ${i+1}`} className={inputClass} value={a.loai_giai_thuong} onChange={e=>patch({loai_giai_thuong:e.target.value})}>{Object.entries(levels).map(([k,v])=><option key={k} value={k}>{v}</option>)}</select>
      <select aria-label={`Môn đạt giải ${i+1}`} className={inputClass} value={a.mon_hoc} onChange={e=>patch({mon_hoc:e.target.value})}>{Object.entries(awardSubjects).map(([k,v])=><option key={k} value={k}>{v}</option>)}</select>
      {fileSelect(`Minh chứng giải thưởng ${i+1}`,a.file_dinh_kem,key=>patch({file_dinh_kem:key}))}
      <button type="button" onClick={()=>{setSequence(sequence+1);onChange({...value,giai_thuong:value.giai_thuong.filter((_,k)=>k!==i)});}}>Bỏ giải thưởng</button>
    </fieldset>; })}
    <button type="button" className={styles.secondary} onClick={()=>onChange({...value,giai_thuong:[...value.giai_thuong,{giai_thuong:"giai_nhat",loai_giai_thuong:"tinh",mon_hoc:"toan",file_dinh_kem:""}]})}>Thêm giải thưởng</button>
  </section>;
}

/** Gắn tệp ở đúng bước minh chứng; dùng cùng giá trị metadata đã nhập ở bước 2. */
export function AcademicFileBindings({ value, onChange, files }: {
  value: AcademicDraft; onChange: (value: AcademicDraft) => void;
  files: Array<{ storageKey: string; fileName: string }>;
}) {
  if (!value.chung_chi.length && !value.giai_thuong.length) return null;
  const options = <><option value="">Chọn tệp minh chứng</option>{files.map(f=><option key={f.storageKey} value={f.storageKey}>{f.fileName}</option>)}</>;
  return <section className={`${styles.panel} space-y-4`}>
    <h2>Minh chứng cho chứng chỉ và giải thưởng</h2>
    <p className={styles.muted}>Gắn các tệp vừa chọn với thông tin đã nhập ở bước trước.</p>
    <div className={styles.fields}>
      {value.chung_chi.map((c,i)=><label key={`certificate-${i}`} className={styles.field}>Chứng chỉ {i+1}{c.loai_chung_chi ? ` · ${c.loai_chung_chi}` : ""}<select className={styles.control} aria-label={`Liên kết minh chứng chứng chỉ ${i+1}`} value={c.file_dinh_kem} onChange={e=>onChange({...value,chung_chi:value.chung_chi.map((item,k)=>k===i?{...item,file_dinh_kem:e.target.value}:item)})}>{options}</select></label>)}
      {value.giai_thuong.map((a,i)=><label key={`award-${i}`} className={styles.field}>Giải thưởng {i+1}<select className={styles.control} aria-label={`Liên kết minh chứng giải thưởng ${i+1}`} value={a.file_dinh_kem} onChange={e=>onChange({...value,giai_thuong:value.giai_thuong.map((item,k)=>k===i?{...item,file_dinh_kem:e.target.value}:item)})}>{options}</select></label>)}
    </div>
  </section>;
}

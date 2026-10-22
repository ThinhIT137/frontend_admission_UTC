"use client";
import { publicError } from "@/libs/client-error";
import { useEffect, useState } from "react";
import { api } from "@/libs/api-services/browser-api";
type Benchmark = { ma_chuong_trinh: string; ten_chuong_trinh: string; diem_du_doan_2026: number; score_range_min: number; score_range_max: number; trend: string };
type Chance = { ten_chuong_trinh: string; tong_diem_xet_tuyen: number; to_hop_toi_uu: string; xac_suat_trung_tuyen: number; nhan_xet_chuyen_gia: string };
export default function PredictionClient({ programs, subjects }: { programs: Array<{ ma_chuong_trinh: string; ten_chuong_trinh: string }>; subjects: Array<{ ma_mon: string; ten_mon: string }> }) {
  const [benchmarks, setBenchmarks] = useState<Benchmark[]>([]);
  const [scores, setScores] = useState<Record<string, string>>({});
  const [program, setProgram] = useState(programs[0]?.ma_chuong_trinh || "");
  const [region, setRegion] = useState("KV3");
  const [result, setResult] = useState<Chance | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => { api<{ data: Benchmark[] }>("ai", "/api/predict/all-benchmarks").then(r => setBenchmarks(r.data)).catch(e => setError(publicError(e.message))); }, []);
  return <div className="space-y-5"><h1 className="text-2xl font-bold">Dự báo tuyển sinh</h1><p>Dự báo tham khảo từ backend AI. Kết quả không thay thế thông báo tuyển sinh chính thức. API hiện cung cấp bộ dự báo năm 2026.</p>
    {error && <p role="alert" className="text-red-700">{error}</p>}
    <form className="border rounded bg-white p-5 space-y-3" onSubmit={async e => { e.preventDefault(); setError(""); setResult(null); setBusy(true); try {
      const academic_scores = Object.fromEntries(Object.entries(scores).filter(([,v]) => v !== "").map(([k,v]) => [k, Number(v)]));
      if (Object.keys(academic_scores).length < 3 || Object.values(academic_scores).some(v => !Number.isFinite(v) || v < 0 || v > 10)) throw Error("Nhập ít nhất 3 điểm môn hợp lệ trong khoảng 0–10");
      setResult((await api<{ data: Chance }>("ai", "/api/predict/admission-chance", { academic_scores, target_major_code: program, admission_method: "PT1", priority_region: region })).data);
    } catch (err) { setError(publicError((err as Error).message)); } finally { setBusy(false); } }}>
      <h2 className="font-bold">Đánh giá theo điểm THPT</h2><select aria-label="Chương trình dự đoán" className="border rounded p-2 max-w-full" value={program} onChange={e => setProgram(e.target.value)}>{programs.map(p => <option key={p.ma_chuong_trinh} value={p.ma_chuong_trinh}>{p.ten_chuong_trinh}</option>)}</select>
      <select aria-label="Khu vực ưu tiên" className="border p-2 ml-3" value={region} onChange={e => setRegion(e.target.value)}>{["KV1", "KV2_NT", "KV2", "KV3"].map(r => <option key={r}>{r}</option>)}</select>
      <div className="grid sm:grid-cols-3 gap-3">{subjects.map(s => <label key={s.ma_mon}>{s.ten_mon}<input className="border p-2 rounded w-full" aria-label={`Điểm ${s.ten_mon}`} type="number" min={0} max={10} step={0.01} value={scores[s.ma_mon] || ""} onChange={e => setScores({ ...scores, [s.ma_mon]: e.target.value })} /></label>)}</div>
      <button disabled={busy} className="bg-blue-950 text-white rounded p-3">{busy ? "Đang dự đoán…" : "Xem dự đoán"}</button>
    </form>
    {result && <section className="border rounded bg-white p-5"><h2 className="font-bold">{result.ten_chuong_trinh}</h2><p>Tổ hợp: {result.to_hop_toi_uu} · Tổng điểm: {result.tong_diem_xet_tuyen}</p><p>Ước tính từ mô hình: {result.xac_suat_trung_tuyen}%</p><p>{result.nhan_xet_chuyen_gia}</p><p className="text-sm text-gray-600">Chỉ số do mô hình trả về, chưa phải xác suất đã được kiểm chứng trên dữ liệu hồ sơ thực tế.</p></section>}
    <div className="overflow-x-auto"><table className="w-full border bg-white text-sm"><caption className="text-left font-bold p-3">Điểm chuẩn dự báo 2026</caption><thead><tr><th className="p-3">Chương trình</th><th>Điểm dự báo</th><th>Khoảng do mô hình cung cấp</th></tr></thead><tbody>{benchmarks.map(b => <tr key={b.ma_chuong_trinh} className="border-t"><td className="p-3">{b.ten_chuong_trinh}</td><td>{b.diem_du_doan_2026}</td><td>{b.score_range_min}–{b.score_range_max}</td></tr>)}</tbody></table></div>
  </div>;
}

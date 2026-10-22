"use client";
import { publicError } from "@/libs/client-error";
import { useState } from "react";
import CandidateSession from "./CandidateSession";
import { api } from "@/libs/api-services/browser-api";
export default function BackendConversion() {
  const [method, setMethod] = useState("hoc_ba");
  const [score, setScore] = useState("");
  const [result, setResult] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  return <section className="border rounded-xl bg-white p-5 space-y-3"><h2 className="font-bold">Quy đổi theo bảng của backend điểm — năm 2026</h2><CandidateSession />
    <form className="flex flex-wrap gap-3" onSubmit={async e => { e.preventDefault(); setBusy(true); setError(""); setResult(null); try { const r = await api<{ diem_thpt: number }>("score", "/diem/quy-doi", { phuong_thuc: method, diem: Number(score), nam_tuyen_sinh: 2026 }); setResult(r.diem_thpt); } catch (err) { setError(publicError((err as Error).message)); } finally { setBusy(false); } }}>
      <select aria-label="Phương thức quy đổi backend" className="border rounded p-2" value={method} onChange={e => setMethod(e.target.value)}><option value="hoc_ba">Học bạ</option><option value="hsa">HSA</option><option value="tsa">TSA</option></select>
      <input aria-label="Điểm gốc quy đổi" className="border rounded p-2" type="number" min={0} step={0.01} value={score} onChange={e => setScore(e.target.value)} required />
      <button disabled={busy} className="bg-blue-950 text-white rounded p-2">{busy ? "Đang quy đổi…" : "Quy đổi qua backend"}</button>
    </form>{error && <p role="alert" className="text-red-700">{error}</p>}{result !== null && <p>Điểm tương đương THPT: <strong>{result.toFixed(2)}</strong></p>}
  </section>;
}

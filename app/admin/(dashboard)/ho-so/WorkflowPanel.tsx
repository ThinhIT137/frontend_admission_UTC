"use client";

import { useState } from "react";
import { toast } from "sonner";
import { api } from "@/libs/api-services/browser-api";
import { publicError } from "@/libs/client-error";

type Preview = { valid: number; errors: Array<{ line: number }>; duplicate: boolean; digest: string; committed: boolean };
type Delivery = { ma_ho_so: string; status: string; attempts: number };

/** Chỉ gửi lệnh tới backend điểm. Không tính kết quả hoặc gửi email tại Next.js. */
export default function WorkflowPanel({ year, onChanged }: { year: number; onChanged: () => Promise<void> }) {
  const [program, setProgram] = useState("");
  const [source, setSource] = useState("");
  const [csv, setCsv] = useState("");
  const [preview, setPreview] = useState<{ result: Preview; year: number; source: string; csv: string } | null>(null);
  const [deliveries, setDeliveries] = useState<{ year: number; rows: Delivery[] } | null>(null);
  const [busy, setBusy] = useState(false);
  const ready = preview && preview.year === year && preview.source === source && preview.csv === csv;

  async function run(task: () => Promise<void>) {
    setBusy(true);
    try { await task(); }
    catch (error) { console.error("[workflow]", error); toast.error(publicError(error)); }
    finally { setBusy(false); }
  }
  async function importScores(commit: boolean) {
    if (commit && (!ready || preview.result.errors.length || !preview.result.valid ||
      !window.confirm(`Ghi điểm THPT cho ${preview.result.valid} thí sinh năm ${year}?`))) return;
    const result = await api<Preview>("score", "/xet-tuyen/nhap-diem-thpt", { year, source, csv_text: csv, commit });
    setPreview({ result, year, source, csv });
    if (commit) toast.success(result.duplicate ? "Dữ liệu này đã được nhập trước đó" : "Đã lưu điểm THPT");
  }
  return <details className="rounded border bg-white p-4 space-y-4">
    <summary className="font-bold cursor-pointer">Công bố, nhập điểm và trạng thái thông báo</summary>
    <section className="space-y-2 mt-4">
      <h2 className="font-bold">Công bố kết quả chính thức</h2>
      <p>Chỉ công bố chương trình đã chọn, trong mốc thời gian được cấu hình. Đây là thao tác công khai kết quả.</p>
      <label>Mã chương trình <input className="border p-2" value={program} onChange={event => setProgram(event.target.value)} /></label>
      <button disabled={busy || !program.trim()} onClick={() => void run(async () => {
        if (!window.confirm(`Công bố kết quả chương trình ${program.trim()}, năm ${year} cho thí sinh xem?`)) return;
        await api("score", "/ho-so/cong-bo-ket-qua", { nam_tuyen_sinh: year, ma_chuong_trinh: program.trim() });
        toast.success("Đã công bố kết quả"); await onChanged();
      })}>Công bố chương trình</button>
    </section>
    <section className="space-y-2">
      <h2 className="font-bold">Nhập điểm THPT từ CSV đã đối soát</h2>
      <p>Tiêu đề CSV: cccd và các mã môn trong danh mục. Giữ nguyên số 0 đầu CCCD. Tối đa 80 KB mỗi lần; không phải kết nối tự động Bộ GD&amp;ĐT.</p>
      <label>Căn cứ dữ liệu <input className="border p-2" value={source} maxLength={2000} onChange={event => { setSource(event.target.value); setPreview(null); }} /></label>
      <label className="block">Nội dung CSV <textarea className="block border p-2 w-full" rows={5} value={csv} onChange={event => { setCsv(event.target.value); setPreview(null); }} /></label>
      <button disabled={busy || source.trim().length < 5 || !csv || new TextEncoder().encode(csv).length > 80_000} onClick={() => void run(() => importScores(false))}>Kiểm tra trước khi nhập</button>
      {ready && <p role="status">Hợp lệ: {preview.result.valid}; lỗi: {preview.result.errors.length}; đã nhập trước: {preview.result.duplicate ? "Có" : "Không"}. {preview.result.errors.length > 0 && `Kiểm tra các dòng: ${preview.result.errors.map(row => row.line).join(", ")}`}</p>}
      <button disabled={busy || !ready || !!preview.result.errors.length || !preview.result.valid || preview.result.committed} onClick={() => void run(() => importScores(true))}>Xác nhận lưu điểm</button>
    </section>
    <section className="space-y-2">
      <h2 className="font-bold">Thông báo kết quả</h2>
      <button disabled={busy} onClick={() => void run(async () => setDeliveries({ year, rows: await api<Delivery[]>("score", `/xet-tuyen/thong-bao/${year}`) }))}>Xem trạng thái thông báo</button>
      <p>Chỉ xem trạng thái xử lý; trạng thái đã gửi không xác nhận thí sinh đã đọc email.</p>
      {deliveries?.year === year && <ul>{deliveries.rows.map(row => <li key={row.ma_ho_so}>{row.ma_ho_so}: {({ pending: "Đang chờ", sending: "Đang gửi", sent: "Đã gửi", failed: "Gửi thất bại", missing_email: "Thiếu email" } as Record<string, string>)[row.status] || "Chưa xác định"} · Số lần thử: {row.attempts}</li>)}{!deliveries.rows.length && <li>Chưa có thông báo.</li>}</ul>}
    </section>
  </details>;
}

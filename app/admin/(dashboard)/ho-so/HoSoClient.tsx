"use client";
import { useEffect, useRef, useState } from "react";
import { api } from "@/libs/api-services/browser-api";
import { toast } from "@/libs/admin-toast";
import { useAdminTask } from "@/hooks/useAdminTask";
import { EvidencePreview } from "@/components/admin/EvidencePreview";
import WorkflowPanel from "./WorkflowPanel";

const statusLabels: Record<string, string> = { cho: "Chờ kiểm tra", hop_le: "Hợp lệ", tu_choi: "Từ chối", dang_xu_ly: "Đang xét tuyển", do: "Đỗ", truot: "Trượt" };

type Row = { ma_ho_so: string; cccd: string; ma_chuong_trinh: string; ma_phuong_thuc: string; trang_thai: string; ket_qua?: string; create_at: string; diem_trace?: Record<string, unknown> | null; tong_diem_xet_tuyen?: number | null };
type Detail = Row & { tong_diem_xet_tuyen?: number; bang_diem: Array<{ loai_diem: string; nam_hoc: number; hoc_ky?: number; chi_tiet: Array<{ ma_mon: string; diem_so: number }> }>; chung_chi: Array<{ ma_chung_chi: string; loai_chung_chi: string; diem_hoac_hang?: string; ngay_cap?: string; ngay_het_han?: string; file_dinh_kem?: string }>; giai_thuong?: Array<{ma_giai_thuong:string;giai_thuong:string;loai_giai_thuong:string;mon_hoc:string;file_dinh_kem?:string}> };
export default function HoSoClient() {
  const { pending: mutationPending, run: runMutation } = useAdminTask();
  const requestId = useRef(0);
  const [snapshot, setSnapshot] = useState<{ query: string; rows: Row[] } | null>(null);
  const [year, setYear] = useState(new Date().getFullYear());
  const [status, setStatus] = useState("");
  const [detail, setDetail] = useState<Detail | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const query = `${year}:${status}`;
  const rowsAreCurrent = snapshot?.query === query;
  const rows = rowsAreCurrent ? snapshot.rows : [];
  function changeFilters(nextYear: number, nextStatus: string) {
    if (nextYear === year && nextStatus === status) return;
    // Invalidate before the effect starts the next request, including pending detail reads.
    ++requestId.current;
    setSnapshot(null); setDetail(null); setError("");
    setYear(nextYear); setStatus(nextStatus);
  }
  async function load() {
    const request = ++requestId.current;
    setBusy(true); setError("");
    try {
      const data = await api<Row[]>("score", `/ho-so?nam_tuyen_sinh=${year}${status ? `&trang_thai=${status}` : ""}`);
      if (request === requestId.current) setSnapshot({ query, rows: data });
      return true;
    } catch {
      if (request === requestId.current) setError("Chưa tải được danh sách hồ sơ. Vui lòng tải lại.");
      return false;
    } finally { if (request === requestId.current) setBusy(false); }
  }
  useEffect(() => { void load(); }, [year, status]);
  async function review(row: Row, approve: boolean) {
    if (!rowsAreCurrent || busy) return;
    let reason: string | undefined = undefined;
    if (approve) {
      const confirmApprove = window.confirm(
        `Xác nhận duyệt hợp lệ hồ sơ ${row.ma_ho_so} (CCCD: ${row.cccd})?\n\nHệ thống sẽ cập nhật trạng thái hồ sơ và gửi email thông báo kết quả duyệt tới thí sinh.`
      );
      if (!confirmApprove) return;
    } else {
      const inputReason = window.prompt(
        `Lý do từ chối hồ sơ ${row.ma_ho_so} (lý do này sẽ được gửi trong email thông báo tới thí sinh):`
      );
      if (!inputReason?.trim()) return;
      reason = inputReason.trim();
    }
    setBusy(true); setError("");
    try {
      await api(
        "score",
        `/ho-so/${encodeURIComponent(row.ma_ho_so)}/${approve ? "duyet" : "tu-choi"}`,
        approve ? {} : { ly_do: reason },
        "PATCH"
      );
      setDetail(null);
      if (await load()) {
        toast.success(
          approve
            ? `Đã duyệt hồ sơ ${row.ma_ho_so}! Email thông báo đã được gửi tới thí sinh.`
            : `Đã từ chối hồ sơ ${row.ma_ho_so}! Email thông báo kèm lý do đã được gửi tới thí sinh.`
        );
      } else {
        toast.warning("Đã cập nhật hồ sơ, nhưng chưa tải lại được danh sách.");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Không thể xử lý hồ sơ");
    } finally {
      setBusy(false);
    }
  }
  async function progress(row: Row, action: "start" | "score" | "do" | "truot") {
    if (!rowsAreCurrent || busy) return;
    try {
      setBusy(true);
      const key = encodeURIComponent(row.ma_ho_so);
      if (action === "start") await api("score", `/xet-tuyen/${key}/bat-dau-xu-ly`, {}, "PATCH");
      else {
        if (action === "do" && !row.diem_trace) {
          toast.error("Hồ sơ chưa có điểm đối soát. Vui lòng bấm 'Chốt điểm đối soát' trước khi chốt đỗ.");
          return;
        }
        const source = window.prompt("Nhập căn cứ được duyệt (ít nhất 5 ký tự):");
        if (!source || source.trim().length < 5) return;
        if (action === "score") {
          const input = window.prompt("Điểm đã đối soát, gồm ưu tiên (thang 30):");
          if (input === null || input.trim() === "") return;
          const score = Number(input);
          if (!Number.isFinite(score) || score < 0 || score > 30) { toast.error("Điểm phải trong khoảng 0–30"); return; }
          await api("score", `/xet-tuyen/${key}/chot-diem`, { kind: "manual", manual_score: score, source });
        } else {
          if (!window.confirm(`Chốt ${action === "do" ? "đỗ" : "trượt"} cho ${row.ma_ho_so}?`)) return;
          await api("score", "/xet-tuyen/chot-ket-qua", {
            source,
            rows: [{
              ma_ho_so: row.ma_ho_so,
              result: action === "do" ? "trung_tuyen" : "khong_trung_tuyen",
              exception_reason: source,
            }],
          });
        }
      }
      const resultMessage = { start: "Đã bắt đầu xét tuyển", score: "Đã lưu điểm đối soát", do: "Đã chốt đỗ", truot: "Đã chốt trượt" }[action];
      setDetail(null); if (await load()) toast.success(resultMessage); else toast.warning("Đã cập nhật hồ sơ, nhưng chưa tải lại được danh sách.");
    } catch (error) { toast.error(error instanceof Error ? error.message : "Thao tác thất bại. Vui lòng thử lại."); } finally { setBusy(false); }
  }
  return <div className="space-y-5"><h1 className="text-2xl font-bold">Quản lý hồ sơ</h1>
    <WorkflowPanel year={year} onChanged={async () => { if (!await load()) throw new Error("refresh"); }} />
    <div className="flex flex-wrap items-end gap-3 rounded-2xl border border-slate-200 bg-white p-4"><label>Năm <input aria-label="Năm hồ sơ" type="number" min={2000} max={2100} value={year} onChange={e => changeFilters(Number(e.target.value), status)} disabled={mutationPending} className="border border-slate-200 rounded-xl p-2.5 w-24" /></label>
      <select aria-label="Trạng thái hồ sơ" disabled={mutationPending} className="border border-slate-200 rounded-xl p-2.5" value={status} onChange={e => changeFilters(year, e.target.value)}><option value="">Tất cả</option>{Object.entries(statusLabels).map(([key,label]) => <option key={key} value={key}>{label}</option>)}</select>
      <button disabled={busy || mutationPending} onClick={() => void load()} className="rounded-xl bg-[#192b59] px-4 py-2.5 text-sm font-semibold text-white">Tải lại</button></div>
    {error && <p role="alert" className="text-red-700">{error}</p>}{busy && <p role="status">Đang xử lý…</p>}
    <div className="overflow-x-auto bg-white rounded-2xl border border-slate-200"><table className="w-full text-sm"><thead><tr>{["Mã hồ sơ", "CCCD", "Chương trình", "Phương thức", "Trạng thái", "Thao tác"].map(x => <th key={x} className="p-3 text-left">{x}</th>)}</tr></thead><tbody>
      {rows.map(row => <tr key={row.ma_ho_so} className="border-t"><td className="p-3">{row.ma_ho_so}</td><td>{row.cccd}</td><td>{row.ma_chuong_trinh}</td><td>{row.ma_phuong_thuc}</td><td>{statusLabels[row.trang_thai] || row.trang_thai}{row.diem_trace ? ` (${(row.diem_trace as any).total ?? (row.diem_trace as any).base ?? "Đã có điểm"})` : (row.trang_thai === "dang_xu_ly" ? " (Chưa chốt điểm)" : "")}</td><td className="space-x-3">
        <button disabled={busy || mutationPending} className="px-2.5 py-1 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-800 font-semibold rounded-lg text-xs border border-slate-200 transition-colors cursor-pointer" onClick={async () => { const request = requestId.current; try { const data = await api<Detail>("score", `/ho-so/${encodeURIComponent(row.ma_ho_so)}`); if (request === requestId.current) setDetail(data); } catch (e) { if (request === requestId.current) setError((e as Error).message || "Không thể tải chi tiết"); } }}>Chi tiết</button>
        <button disabled={busy || mutationPending || row.trang_thai !== "cho"} className="text-green-800 disabled:opacity-40" onClick={() => void runMutation(() => review(row, true))}>Duyệt hợp lệ</button>
        <button disabled={busy || mutationPending || row.trang_thai !== "cho"} className="text-red-700 disabled:opacity-40" onClick={() => void runMutation(() => review(row, false))}>Từ chối</button>
        {row.trang_thai === "hop_le" && <button disabled={busy || mutationPending} onClick={() => void runMutation(() => progress(row,"start"))}>Bắt đầu xét tuyển</button>}
        {row.trang_thai === "dang_xu_ly" && <><button disabled={busy || mutationPending} onClick={() => void runMutation(() => progress(row,"score"))}>Chốt điểm đối soát</button><button disabled={busy || mutationPending} onClick={() => void runMutation(() => progress(row,"do"))}>Chốt đỗ</button><button disabled={busy || mutationPending} onClick={() => void runMutation(() => progress(row,"truot"))}>Chốt trượt</button></>}
        </td></tr>)}
      {!busy && !rows.length && <tr><td colSpan={6} className="p-5 text-center">Không có hồ sơ phù hợp.</td></tr>}
    </tbody></table></div>
    {rowsAreCurrent && detail && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150" onClick={(e) => { if (e.target === e.currentTarget) setDetail(null); }}>
        <section className="border-2 border-slate-900 rounded-2xl bg-white p-6 space-y-4 max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-2xl relative">
          <div className="flex items-center justify-between border-b pb-3">
            <h2 className="font-bold text-lg text-slate-900">Chi tiết hồ sơ: {detail.ma_ho_so}</h2>
            <button className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-sm transition-colors cursor-pointer" onClick={() => setDetail(null)}>✕ Đóng</button>
          </div>
          <div className="rounded-xl border border-blue-100 bg-blue-50/70 p-3 text-xs text-blue-900 flex items-center justify-between">
            <span>📧 <strong>Thông báo email:</strong> Khi duyệt, từ chối hoặc chốt kết quả, hệ thống tự động gửi thông báo tới hòm thư của thí sinh (CCCD: <strong>{detail.cccd}</strong>).</span>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm bg-slate-50 p-3 rounded-xl border border-slate-200">
            <div><span className="text-slate-500">Số CCCD:</span> <strong>{detail.cccd}</strong></div>
            <div><span className="text-slate-500">Mã chương trình:</span> <strong>{detail.ma_chuong_trinh}</strong></div>
            <div><span className="text-slate-500">Mã phương thức:</span> <strong>{detail.ma_phuong_thuc}</strong></div>
            <div><span className="text-slate-500">Tổng điểm xét tuyển:</span> <strong>{detail.tong_diem_xet_tuyen ?? "Chưa tính"}</strong></div>
            {detail.ket_qua && <div className="col-span-2"><span className="text-slate-500">Ghi chú kết quả:</span> <strong>{detail.ket_qua}</strong></div>}
          </div>
          {detail.bang_diem?.map((b, i) => <div key={i} className="text-sm border-t pt-2"><strong className="text-slate-800">{b.loai_diem} · {b.nam_hoc} · {b.hoc_ky ? `Học kỳ ${b.hoc_ky}` : "Cả năm"}</strong><ul className="list-disc pl-5 mt-1">{b.chi_tiet.map(d => <li key={d.ma_mon}>{d.ma_mon}: <strong>{d.diem_so}</strong></li>)}</ul></div>)}
          <h3 className="font-bold text-sm border-t pt-2">Chứng chỉ và tài liệu</h3>{detail.chung_chi?.map(d => <div key={d.ma_chung_chi} className="text-sm">{d.loai_chung_chi} · {d.diem_hoac_hang} {d.ngay_cap && <> · Cấp: {d.ngay_cap.slice(0,10)}</>} {d.ngay_het_han && <> · Hết hạn: {d.ngay_het_han.slice(0,10)}</>} {d.file_dinh_kem && <EvidencePreview fileKey={d.file_dinh_kem} title={d.loai_chung_chi} />}</div>)}
          <h3 className="font-bold text-sm border-t pt-2">Giải thưởng</h3>{detail.giai_thuong?.map(d=><div key={d.ma_giai_thuong} className="text-sm">{d.giai_thuong} · {d.loai_giai_thuong} · {d.mon_hoc} {d.file_dinh_kem && <EvidencePreview fileKey={d.file_dinh_kem} title={`${d.giai_thuong} · ${d.mon_hoc}`} />}</div>)}
          <p className="text-xs text-gray-500 border-t pt-2">Hồ sơ hợp lệ không đồng nghĩa đã trúng tuyển. Kết quả đỗ/trượt chính thức chỉ hiển thị cho thí sinh sau khi Hội đồng công bố.</p>
        </section>
      </div>
    )}
  </div>;
}

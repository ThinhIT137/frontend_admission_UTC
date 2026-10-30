"use client";
import { publicError } from "@/libs/client-error";
import { useEffect, useRef, useState } from "react";
import { api } from "@/libs/api-services/browser-api";
import { toast } from "@/libs/admin-toast";
import { useAdminTask } from "@/hooks/useAdminTask";
import { EvidencePreview } from "@/components/admin/EvidencePreview";
import WorkflowPanel from "./WorkflowPanel";

const statusLabels: Record<string, string> = { cho: "Chờ kiểm tra", hop_le: "Hợp lệ", tu_choi: "Từ chối", dang_xu_ly: "Đang xét tuyển", do: "Đỗ", truot: "Trượt" };

type Row = { ma_ho_so: string; cccd: string; ma_chuong_trinh: string; ma_phuong_thuc: string; trang_thai: string; ket_qua?: string; create_at: string };
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
    const reason = approve ? undefined : window.prompt("Lý do từ chối hồ sơ:");
    if (!approve && !reason?.trim()) return;
    setBusy(true); setError("");
    try { await api("score", `/ho-so/${encodeURIComponent(row.ma_ho_so)}/${approve ? "duyet" : "tu-choi"}`, approve ? {} : { ly_do: reason }, "PATCH"); setDetail(null); if (await load()) toast.success("Đã cập nhật hồ sơ"); else toast.warning("Đã cập nhật hồ sơ, nhưng chưa tải lại được danh sách."); }
    catch (e) { setError(publicError(e instanceof Error ? e.message : "Không thể xử lý hồ sơ")); } finally { setBusy(false); }
  }
  async function progress(row: Row, action: "start" | "score" | "do" | "truot") {
    if (!rowsAreCurrent || busy) return;
    try {
      setBusy(true);
      const key = encodeURIComponent(row.ma_ho_so);
      if (action === "start") await api("score", `/xet-tuyen/${key}/bat-dau-xu-ly`, {}, "PATCH");
      else {
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
          await api("score", "/xet-tuyen/chot-ket-qua", { source, rows: [{ ma_ho_so: row.ma_ho_so, result: action === "do" ? "trung_tuyen" : "khong_trung_tuyen" }] });
        }
      }
      const resultMessage = { start: "Đã bắt đầu xét tuyển", score: "Đã lưu điểm đối soát", do: "Đã chốt đỗ", truot: "Đã chốt trượt" }[action];
      setDetail(null); if (await load()) toast.success(resultMessage); else toast.warning("Đã cập nhật hồ sơ, nhưng chưa tải lại được danh sách.");
    } catch (error) { toast.error(publicError(error)); } finally { setBusy(false); }
  }
  return <div className="space-y-5"><h1 className="text-2xl font-bold">Quản lý hồ sơ</h1>
    <WorkflowPanel year={year} onChanged={async () => { if (!await load()) throw new Error("refresh"); }} />
    <div className="flex flex-wrap items-end gap-3 rounded-2xl border border-slate-200 bg-white p-4"><label>Năm <input aria-label="Năm hồ sơ" type="number" min={2000} max={2100} value={year} onChange={e => changeFilters(Number(e.target.value), status)} disabled={mutationPending} className="border border-slate-200 rounded-xl p-2.5 w-24" /></label>
      <select aria-label="Trạng thái hồ sơ" disabled={mutationPending} className="border border-slate-200 rounded-xl p-2.5" value={status} onChange={e => changeFilters(year, e.target.value)}><option value="">Tất cả</option>{Object.entries(statusLabels).map(([key,label]) => <option key={key} value={key}>{label}</option>)}</select>
      <button disabled={busy || mutationPending} onClick={() => void load()} className="rounded-xl bg-[#192b59] px-4 py-2.5 text-sm font-semibold text-white">Tải lại</button></div>
    {error && <p role="alert" className="text-red-700">{error}</p>}{busy && <p role="status">Đang xử lý…</p>}
    <div className="overflow-x-auto bg-white rounded-2xl border border-slate-200"><table className="w-full text-sm"><thead><tr>{["Mã hồ sơ", "CCCD", "Chương trình", "Phương thức", "Trạng thái", "Thao tác"].map(x => <th key={x} className="p-3 text-left">{x}</th>)}</tr></thead><tbody>
      {rows.map(row => <tr key={row.ma_ho_so} className="border-t"><td className="p-3">{row.ma_ho_so}</td><td>{row.cccd}</td><td>{row.ma_chuong_trinh}</td><td>{row.ma_phuong_thuc}</td><td>{statusLabels[row.trang_thai] || row.trang_thai}</td><td className="space-x-3">
        <button disabled={busy || mutationPending} className="underline" onClick={async () => { const request = requestId.current; try { const data = await api<Detail>("score", `/ho-so/${encodeURIComponent(row.ma_ho_so)}`); if (request === requestId.current) setDetail(data); } catch (e) { if (request === requestId.current) setError(publicError((e as Error).message)); } }}>Chi tiết</button>
        <button disabled={busy || mutationPending || row.trang_thai !== "cho"} className="text-green-800 disabled:opacity-40" onClick={() => void runMutation(() => review(row, true))}>Duyệt hợp lệ</button>
        <button disabled={busy || mutationPending || row.trang_thai !== "cho"} className="text-red-700 disabled:opacity-40" onClick={() => void runMutation(() => review(row, false))}>Từ chối</button>
        {row.trang_thai === "hop_le" && <button disabled={busy || mutationPending} onClick={() => void runMutation(() => progress(row,"start"))}>Bắt đầu xét tuyển</button>}
        {row.trang_thai === "dang_xu_ly" && <><button disabled={busy || mutationPending} onClick={() => void runMutation(() => progress(row,"score"))}>Chốt điểm đối soát</button><button disabled={busy || mutationPending} onClick={() => void runMutation(() => progress(row,"do"))}>Chốt đỗ</button><button disabled={busy || mutationPending} onClick={() => void runMutation(() => progress(row,"truot"))}>Chốt trượt</button></>}
        </td></tr>)}
      {!busy && !rows.length && <tr><td colSpan={6} className="p-5 text-center">Không có hồ sơ phù hợp.</td></tr>}
    </tbody></table></div>
    {rowsAreCurrent && detail && <section className="border border-slate-200 rounded-2xl bg-white p-5 space-y-3"><button className="float-right underline" onClick={() => setDetail(null)}>Đóng</button><h2 className="font-bold">{detail.ma_ho_so}</h2><p>Tổng điểm: {detail.tong_diem_xet_tuyen ?? "Chưa tính"}</p><p>{detail.ket_qua}</p>
      {detail.bang_diem?.map((b, i) => <div key={i}>{b.loai_diem} · {b.nam_hoc} · {b.hoc_ky ? `Học kỳ ${b.hoc_ky}` : "Cả năm"}<ul>{b.chi_tiet.map(d => <li key={d.ma_mon}>{d.ma_mon}: {d.diem_so}</li>)}</ul></div>)}
      <h3 className="font-bold">Chứng chỉ và tài liệu</h3>{detail.chung_chi?.map(d => <div key={d.ma_chung_chi}>{d.loai_chung_chi} · {d.diem_hoac_hang} {d.ngay_cap && <> · Cấp: {d.ngay_cap.slice(0,10)}</>} {d.ngay_het_han && <> · Hết hạn: {d.ngay_het_han.slice(0,10)}</>} {d.file_dinh_kem && <EvidencePreview fileKey={d.file_dinh_kem} title={d.loai_chung_chi} />}</div>)}
      <h3 className="font-bold">Giải thưởng</h3>{detail.giai_thuong?.map(d=><div key={d.ma_giai_thuong}>{d.giai_thuong} · {d.loai_giai_thuong} · {d.mon_hoc} {d.file_dinh_kem && <EvidencePreview fileKey={d.file_dinh_kem} title={`${d.giai_thuong} · ${d.mon_hoc}`} />}</div>)}
      <p className="text-sm text-gray-600">Hồ sơ hợp lệ không đồng nghĩa đã trúng tuyển. Kết quả chính thức cần căn cứ xét tuyển và công bố.</p>
    </section>}
  </div>;
}

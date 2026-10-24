"use client";
import ProgramPicker from "./ProgramPicker";
import { publicError } from "@/libs/client-error";
import { useEffect, useRef, useState } from "react";
import PageMotion from "@/components/ui/PageMotion";
import { useLoading } from "@/contexts/loadingContext";
import { comparePrograms } from "@/actions/compare.action";
type Result = Awaited<ReturnType<typeof comparePrograms>>;
export default function CompareClient({ programs }: { programs: Array<{ ma_chuong_trinh: string; ten_chuong_trinh: string }> }) {
  const { beginLoading } = useLoading();
  const pendingRelease = useRef<(() => void) | null>(null);
  useEffect(() => () => pendingRelease.current?.(), []);
  const [ids, setIds] = useState<string[]>(["", "", ""]);
  const [rows, setRows] = useState<Result>([]);
  const [method, setMethod] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const changeProgram = (index: number, value: string) => {
    setIds(current => current.map((id, position) => position === index ? value : id));
    // Không giữ bảng cũ bên dưới lựa chọn mới: dễ khiến thí sinh đọc nhầm kết quả.
    setRows([]);
    setMethod("");
    setError("");
  };
  const handleCompare = async () => {
    const selected = ids.filter(Boolean);
    setError("");
    if (!ids[0] || !ids[1]) {
      setError("Vui lòng chọn chương trình 1 và chương trình 2. Chương trình 3 là tùy chọn.");
      return;
    }
    if (new Set(selected).size !== selected.length) {
      setError("Vui lòng chọn các chương trình khác nhau để so sánh.");
      return;
    }
    setBusy(true);
    const release = beginLoading();
    pendingRelease.current = release;
    setRows([]);
    setMethod("");
    try {
      setRows(await comparePrograms(selected));
    } catch (error) {
      // Chỉ thông báo lỗi kỹ thuật chung; không đưa lỗi database lên giao diện.
      setError(publicError(error, "Chưa tải được dữ liệu so sánh. Vui lòng thử lại."));
    } finally {
      release(); pendingRelease.current = null;
      setBusy(false);
    }
  };
  const methods = [...new Map(rows.flatMap(r => r.lich_su_diem_chuan.flatMap(h => h.diem_trung_tuyen.map(d => [d.ma_phuong_thuc, d.phuong_thuc.ten_phuong_thuc] as const)))).entries()];
  const years = [...new Set(rows.flatMap(r => r.lich_su_diem_chuan.map(h => h.nam)))].sort((a, b) => b - a);
  const selectedMethod = method || methods[0]?.[0];
  const methodName = methods.find(([id]) => id === selectedMethod)?.[1];
  const validScore = (value: number | null | undefined): value is number => typeof value === "number" && Number.isFinite(value) && value > 0;
  const formatNumber = (value: number) => new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 2 }).format(value);
  // Các thẻ dùng chung năm và trục điểm; năm thiếu điểm vẫn giữ đúng vị trí.
  const chartYears = [...years].reverse();
  const highestScore = Math.max(1, ...rows.flatMap(r => r.lich_su_diem_chuan.flatMap(h => h.diem_trung_tuyen.filter(d => d.ma_phuong_thuc === selectedMethod && validScore(d.diem)).map(d => d.diem!))));
  // Chừa khoảng trống cho nhãn, làm tròn bước trục theo dữ liệu thực (kể cả ĐGNL).
  const rawStep = highestScore * 1.15 / 4;
  const magnitude = 10 ** Math.floor(Math.log10(rawStep));
  const tickStep = ([1, 2, 2.5, 5, 10].find(step => step * magnitude >= rawStep) ?? 10) * magnitude;
  const chartMax = tickStep * 4;
  const chartTicks = [4, 3, 2, 1, 0].map(step => step * tickStep);
  return <PageMotion className="min-w-0 max-w-full space-y-6 text-[#102449]">
    <section className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 sm:p-6">
    <div className="rounded-xl bg-gradient-to-br from-[#14244e] to-[#284b9c] p-6 text-white sm:p-8"><p className="mb-3 text-xs font-bold uppercase tracking-widest text-amber-300">Đặt các lựa chọn cạnh nhau</p><h1 className="text-3xl font-bold">So sánh chương trình đào tạo</h1>
    <p className="mt-3 max-w-2xl text-sm leading-7 text-blue-100">Chọn hai chương trình để hiểu rõ điểm khác biệt; thêm lựa chọn thứ ba nếu bạn vẫn còn phân vân.</p></div>
    <div className="mt-5">
    {programs.length < 2 && <p role="status">Chưa có đủ hai chương trình để so sánh.</p>}
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{ids.map((id, i) => <ProgramPicker key={i} programs={programs} value={id} index={i} selected={ids} disabled={busy || programs.length < 2} onChange={value => changeProgram(i, value)} />)}</div>
    <button disabled={busy || programs.length < 2} className="mt-5 rounded-lg bg-blue-950 px-6 py-3 font-semibold text-white disabled:opacity-50" onClick={handleCompare}>{busy ? "Đang tải…" : "So sánh"}</button>
    {error && <p role="alert" className="mt-3 text-sm text-red-700">{error}</p>}
    </div></section>
    {!!rows.length && <section className="min-w-0 overflow-hidden rounded-2xl border border-slate-300 bg-white">
      <div className="space-y-3 border-b border-slate-200 p-4 sm:p-6">
        <h2 className="text-xl font-bold">Bảng đối chiếu chương trình</h2>
        {methods.length > 0 ? <label className="flex flex-wrap items-center gap-3 text-sm font-semibold">Phương thức xét tuyển <select aria-label="Phương thức so sánh" className="min-w-0 max-w-full rounded-lg border border-slate-300 bg-white p-2 font-normal" value={selectedMethod} onChange={e => setMethod(e.target.value)}>{methods.map(([id, name]) => <option key={id} value={id}>{name}</option>)}</select></label> : <p className="text-sm text-slate-500">Chưa có dữ liệu điểm chuẩn theo phương thức cho các chương trình đã chọn.</p>}
        <p className="text-sm leading-6 text-slate-600">Điểm chuẩn được đối chiếu theo cùng phương thức. Chỉ tiêu là tổng của chương trình trong năm, không phải chỉ tiêu riêng từng phương thức. Điểm lịch sử chỉ để tham khảo.</p>
        <p id="compare-scroll-hint" className="text-xs text-slate-500">Trên màn hình nhỏ, vuốt ngang bảng để xem đầy đủ các chương trình.</p>
      </div>
      <div role="region" aria-label="Bảng so sánh chương trình" aria-describedby="compare-scroll-hint" tabIndex={0} className="max-w-full overflow-x-auto focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-800">
        <table className="w-full table-fixed border-collapse text-sm" style={{ minWidth: rows.length === 3 ? 900 : 680 }}>
          <caption className="sr-only">So sánh ngành, điểm chuẩn, chỉ tiêu và tổ hợp xét tuyển theo năm{methodName ? ` — ${methodName}` : ""}</caption>
          <colgroup><col style={{ width: 150 }} />{rows.map(r => <col key={r.ma_chuong_trinh} style={{ width: `calc((100% - 150px) / ${rows.length})` }} />)}</colgroup>
          <thead><tr className="bg-[#14244e] text-white">
            <th scope="col" className="border-b border-r border-slate-300 p-4 text-left align-top">Tiêu chí</th>
            {rows.map((r, index) => <th id={`compare-program-${index}`} scope="col" key={r.ma_chuong_trinh} className="border-b border-r border-slate-300 p-4 text-left align-top last:border-r-0">
              <span className="mb-2 inline-block rounded bg-white px-2 py-1 text-xs font-bold tracking-wide text-blue-950">{r.ma_chuong_trinh}</span>
              <span className="block break-words text-base leading-6">{r.ten_chuong_trinh}</span>
            </th>)}
          </tr></thead>
          <tbody><tr>
            <th scope="row" className="border-b border-r border-slate-200 bg-slate-50 p-4 text-left font-medium align-top">Ngành</th>
            {rows.map((r, index) => <td headers={`compare-program-${index}`} key={r.ma_chuong_trinh} className="border-b border-r border-slate-200 p-4 align-top leading-6 last:border-r-0">{r.nganh.ten_nganh}</td>)}
          </tr></tbody>
          {/* Mỗi năm có một nhóm hàng; tách rõ từng đại lượng thay cho chuỗi số có dấu /. */}
          {years.map(year => <tbody key={year}>
            <tr><th id={`compare-year-${year}`} scope="rowgroup" colSpan={rows.length + 1} className="border-b border-slate-200 bg-[#eaf3e9] px-4 py-3 text-left font-bold">Năm {year}</th></tr>
            {(["Điểm chuẩn", "Chỉ tiêu", "Tổ hợp xét tuyển"] as const).map((label, metric) => <tr key={label}>
              <th id={`compare-metric-${year}-${metric}`} scope="row" className="border-b border-r border-slate-200 bg-slate-50 p-4 text-left align-top font-medium">{label}</th>
              {rows.map((r, index) => {
                const history = r.lich_su_diem_chuan.find(h => h.nam === year);
                const score = history?.diem_trung_tuyen.find(d => d.ma_phuong_thuc === selectedMethod)?.diem;
                const combinations = [...new Set(r.ctdt_to_hop.filter(t => t.nam === year).map(t => t.ma_to_hop))];
                return <td key={r.ma_chuong_trinh} headers={`compare-program-${index} compare-year-${year} compare-metric-${year}-${metric}`} className="border-b border-r border-slate-200 p-4 align-top last:border-r-0">
                  {metric === 0 ? validScore(score) ? <span className="text-lg font-bold tabular-nums text-blue-950">{formatNumber(score)}</span> : <span className="text-slate-500">Chưa có điểm</span>
                    : metric === 1 ? history?.chi_tieu != null && Number.isFinite(history.chi_tieu) && history.chi_tieu >= 0 ? <span className="tabular-nums">{formatNumber(history.chi_tieu)}</span> : <span className="text-slate-500">Chưa có dữ liệu</span>
                    : combinations.length ? <div className="flex flex-wrap gap-2">{combinations.map(code => <span key={code} className="rounded border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-semibold">{code}</span>)}</div> : <span className="text-slate-500">Chưa có dữ liệu</span>}
                </td>;
              })}
            </tr>)}
          </tbody>)}
        </table>
      </div>
      <details className="border-t border-slate-200 p-4 sm:p-6">
        <summary className="cursor-pointer font-semibold">Xem biến động điểm chuẩn</summary>
        <p className="mt-3 text-sm text-slate-500">{methodName || "Chưa có phương thức"} · Các biểu đồ dùng chung thang điểm để dễ đối chiếu.</p>
        <div className="mt-4 grid gap-4 lg:grid-cols-2">{rows.map(r => {
          const points = chartYears.map(year => {
            const score = r.lich_su_diem_chuan.find(h => h.nam === year)?.diem_trung_tuyen.find(d => d.ma_phuong_thuc === selectedMethod)?.diem;
            return { year, score: validScore(score) ? score : null };
          });
          return <section key={r.ma_chuong_trinh} className="flex min-w-0 flex-col rounded-lg border border-slate-200 p-4"><h3 className="min-h-12 break-words text-sm font-semibold leading-6">{r.ma_chuong_trinh} · {r.ten_chuong_trinh}</h3>
            {points.some(p => p.score !== null) ? <>
              <ul className="sr-only" aria-label={`Điểm chuẩn ${r.ma_chuong_trinh}`}>{points.map(p => <li key={p.year}>{p.year}: {p.score === null ? "Chưa có điểm" : formatNumber(p.score)}</li>)}</ul>
              <p id={`chart-hint-${r.ma_chuong_trinh}`} className="mt-2 text-xs text-slate-500">Trục ngang: năm · Trục dọc: điểm. Dấu —: chưa có điểm. Vuốt ngang nếu bảng dài.</p>
              <div role="region" aria-label={`Biểu đồ cột ${r.ma_chuong_trinh}`} aria-describedby={`chart-hint-${r.ma_chuong_trinh}`} tabIndex={0} className="mt-auto max-w-full overflow-x-auto pb-2 pt-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-800">
                <div aria-hidden="true" style={{ minWidth: Math.max(260, chartYears.length * 60 + 44) }}>
                  <div className="flex gap-2 pt-3">
                    <div className="relative h-56 w-10 shrink-0 text-right text-xs tabular-nums text-slate-500">{chartTicks.map(tick => <span key={tick} className="absolute right-0 -translate-y-1/2" style={{ top: `${(1 - tick / chartMax) * 100}%` }}>{formatNumber(tick)}</span>)}</div>
                    <div className="relative h-56 min-w-0 flex-1 border-b border-l border-slate-300">
                      {chartTicks.filter(tick => tick > 0).map(tick => <div key={tick} className="absolute inset-x-0 border-t border-dashed border-slate-200" style={{ top: `${(1 - tick / chartMax) * 100}%` }} />)}
                      <div className="absolute inset-0 grid" style={{ gridTemplateColumns: `repeat(${points.length}, minmax(0, 1fr))` }}>{points.map(p => <div key={p.year} className="relative flex h-full items-end justify-center px-2">
                        {p.score === null ? <span className="mb-2 text-sm text-slate-400">—</span> : <div className="relative w-full max-w-12 rounded-t bg-[#537ba6]" style={{ height: `${p.score / chartMax * 100}%` }}><span className="absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs font-semibold tabular-nums text-[#102449]">{formatNumber(p.score)}</span></div>}
                      </div>)}</div>
                    </div>
                  </div>
                  <div className="ml-12 mt-2 grid text-center text-xs tabular-nums text-slate-600" style={{ gridTemplateColumns: `repeat(${points.length}, minmax(0, 1fr))` }}>{points.map(p => <span key={p.year}>{p.year}</span>)}</div>
                </div>
              </div>
            </> : <p className="mt-3 text-sm text-slate-500">Chưa có dữ liệu cho phương thức này.</p>}
          </section>;
        })}</div>
      </details>
    </section>}
  </PageMotion>;
}

"use client";
import { publicError } from "@/libs/client-error";
import { useState } from "react";
import { comparePrograms } from "@/actions/compare.action";
type Result = Awaited<ReturnType<typeof comparePrograms>>;
export default function CompareClient({ programs }: { programs: Array<{ ma_chuong_trinh: string; ten_chuong_trinh: string }> }) {
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
    setRows([]);
    setMethod("");
    try {
      setRows(await comparePrograms(selected));
    } catch (error) {
      // Chỉ thông báo lỗi kỹ thuật chung; không đưa lỗi database lên giao diện.
      setError(publicError(error, "Chưa tải được dữ liệu so sánh. Vui lòng thử lại."));
    } finally {
      setBusy(false);
    }
  };
  const methods = [...new Map(rows.flatMap(r => r.lich_su_diem_chuan.flatMap(h => h.diem_trung_tuyen.map(d => [d.ma_phuong_thuc, d.phuong_thuc.ten_phuong_thuc] as const)))).entries()];
  const years = [...new Set(rows.flatMap(r => r.lich_su_diem_chuan.map(h => h.nam)))].sort();
  const selectedMethod = method || methods[0]?.[0];
  return <div className="space-y-5"><h1 className="text-2xl font-bold">So sánh chương trình đào tạo</h1><p>So sánh điểm chuẩn cùng phương thức qua các năm. Điểm lịch sử không bảo đảm kết quả tuyển sinh tương lai.</p>
    <p>Chọn hai chương trình khác nhau; có thể thêm chương trình thứ ba. Mỗi lựa chọn hiển thị mã chương trình và tên chương trình.</p>
    {programs.length < 2 && <p role="status">Chưa có đủ hai chương trình để so sánh.</p>}
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{ids.map((id, i) => <label key={i} className="min-w-0 space-y-2">
      <span className="block font-semibold">Chương trình {i + 1}{i === 2 ? " (tùy chọn)" : " (bắt buộc)"}</span>
      <select aria-label={`Chương trình ${i + 1}`} value={id} disabled={busy || programs.length < 2} className="w-full min-w-0 border rounded p-2" onChange={e => changeProgram(i, e.target.value)}>
        <option value="">{i === 2 ? "Không chọn chương trình thứ ba" : `Chọn chương trình ${i + 1}`}</option>
        {programs.map(p => <option key={p.ma_chuong_trinh} value={p.ma_chuong_trinh} disabled={ids.some((selected, index) => index !== i && selected === p.ma_chuong_trinh)}>{p.ma_chuong_trinh} · {p.ten_chuong_trinh}</option>)}
      </select>
      {/* Select có thể cắt tên dài; dòng bên dưới luôn hiển thị đầy đủ lựa chọn. */}
      {id && <span className="block break-words text-sm">{id} · {programs.find(p => p.ma_chuong_trinh === id)?.ten_chuong_trinh}</span>}
    </label>)}</div>
    <button disabled={busy || programs.length < 2} className="bg-blue-950 text-white rounded p-2 disabled:opacity-50" onClick={handleCompare}>{busy ? "Đang tải…" : "So sánh"}</button>
    {error && <p role="alert" className="text-red-700">{error}</p>}
    {!!rows.length && <>{methods.length > 0 ? <label>Phương thức <select aria-label="Phương thức so sánh" className="border rounded p-2" value={selectedMethod} onChange={e => setMethod(e.target.value)}>{methods.map(([id, name]) => <option key={id} value={id}>{name}</option>)}</select></label> : <p>Chưa có dữ liệu điểm chuẩn theo phương thức cho các chương trình đã chọn.</p>}
      <div className="overflow-x-auto"><table className="w-full border bg-white"><thead><tr><th className="p-3 text-left">Thông tin</th>{rows.map(r => <th key={r.ma_chuong_trinh} className="p-3">{r.ma_chuong_trinh} · {r.ten_chuong_trinh}</th>)}</tr></thead><tbody>
        <tr className="border-t"><td className="p-3">Ngành</td>{rows.map(r => <td key={r.ma_chuong_trinh} className="p-3">{r.nganh.ten_nganh}</td>)}</tr>
        {years.map(year => <tr key={year} className="border-t"><td className="p-3">{year}: Điểm chuẩn / Chỉ tiêu / Tổ hợp</td>{rows.map(r => { const h = r.lich_su_diem_chuan.find(h => h.nam === year); const score = h?.diem_trung_tuyen.find(d => d.ma_phuong_thuc === selectedMethod)?.diem; return <td key={r.ma_chuong_trinh} className="p-3">{score != null && score > 0 ? score : "Chưa có điểm"} / {h?.chi_tieu ?? "—"} / {r.ctdt_to_hop.filter(t => t.nam === year).map(t => t.ma_to_hop).join(", ") || "—"}</td>; })}</tr>)}
      </tbody></table></div>
      <h2 className="font-bold">Biến động điểm chuẩn{selectedMethod ? ` — ${methods.find(m => m[0] === selectedMethod)?.[1]}` : ""}</h2>
      {rows.map(r => { const points = r.lich_su_diem_chuan.map(h => ({ year: h.nam, score: h.diem_trung_tuyen.find(d => d.ma_phuong_thuc === selectedMethod)?.diem })).filter(p => p.score != null && p.score > 0) as Array<{ year: number; score: number }>; const max = Math.max(...points.map(p => p.score), 1); return <section key={r.ma_chuong_trinh} className="border rounded p-4 bg-white"><h3>{r.ten_chuong_trinh}</h3>{points.length ? points.map(p => <div key={p.year} className="flex items-center gap-3 my-2"><span>{p.year}</span><div className="flex-1 bg-gray-100"><div className="h-4 bg-blue-800" style={{ width: `${p.score / max * 100}%` }} /></div><span>{p.score}</span></div>) : <p>Chưa có dữ liệu cho phương thức này.</p>}</section>; })}
    </>}
  </div>;
}

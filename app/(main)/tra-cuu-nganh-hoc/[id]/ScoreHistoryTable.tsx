"use client";

import { useState } from "react";

export interface ScoreHistoryItem {
  nam: number;
  chi_tieu: number;
  diem: number | null;
  ma_phuong_thuc: string;
  ten_phuong_thuc: string;
  ma_chuong_trinh: string;
  ten_chuong_trinh: string;
  nguyen_vong_toi_da?: number | null;
  diem_uu_tien_toi_thieu?: number | null;
  dieu_kien_mon?: unknown;
}

function conditions(row: ScoreHistoryItem): string[] {
  const parts: string[] = [];
  if (typeof row.nguyen_vong_toi_da === "number" && Number.isInteger(row.nguyen_vong_toi_da) && row.nguyen_vong_toi_da >= 1)
    parts.push(`TTNV ≤ ${row.nguyen_vong_toi_da}`);
  if (typeof row.diem_uu_tien_toi_thieu === "number" && Number.isFinite(row.diem_uu_tien_toi_thieu) && row.diem_uu_tien_toi_thieu >= 0)
    parts.push(`Điểm ưu tiên tối thiểu: ${row.diem_uu_tien_toi_thieu}`);
  // Chỉ hiểu cấu trúc { mã môn: điểm tối thiểu }; không tự suy diễn JSON lạ.
  if (row.dieu_kien_mon && typeof row.dieu_kien_mon === "object" && !Array.isArray(row.dieu_kien_mon)) {
    for (const [subject, minimum] of Object.entries(row.dieu_kien_mon)) {
      if (subject.trim() && typeof minimum === "number" && Number.isFinite(minimum) && minimum >= 0 && minimum <= 10)
        parts.push(`${subject} ≥ ${minimum}`);
    }
  }
  return parts;
}

export default function ScoreHistoryTable({ scoreHistory }: { scoreHistory: ScoreHistoryItem[] }) {
  const years = [...new Set(scoreHistory.map(row => row.nam))].sort((a, b) => b - a);
  const [year, setYear] = useState(String(years[0] ?? "ALL"));
  const [program, setProgram] = useState("ALL");
  const [method, setMethod] = useState("ALL");
  const programs = [...new Map(scoreHistory.map(row => [row.ma_chuong_trinh, row.ten_chuong_trinh])).entries()];
  const methods = [...new Map(scoreHistory.filter(row => row.ma_phuong_thuc !== "N/A").map(row => [row.ma_phuong_thuc, row.ten_phuong_thuc])).entries()]
    .sort(([a], [b]) => a.localeCompare(b, "vi", { numeric: true }));
  const visible = scoreHistory.filter(row => (year === "ALL" || String(row.nam) === year)
    && (program === "ALL" || row.ma_chuong_trinh === program)
    && (method === "ALL" || row.ma_phuong_thuc === method));
  const input = "mt-1 w-full min-w-0 rounded-lg border border-slate-400 bg-white p-2 font-normal";
  const cell = "border border-[#263445] px-3 py-3";

  return <section id="diem-chuan" aria-labelledby="score-history-heading" className="min-w-0 max-w-full rounded-2xl border-[3px] border-[#111827] bg-[#fffdf7] p-5 shadow-[4px_4px_0px_#111827] sm:p-6">
    <h2 id="score-history-heading" className="text-xl font-black">Chỉ tiêu và lịch sử điểm chuẩn</h2>
    <p className="mt-2 text-sm text-slate-600">Điểm lịch sử chỉ để tham khảo. Chỉ tiêu là tổng của chương trình theo năm, không cộng lặp theo từng phương thức.</p>
    <div className="my-4 grid min-w-0 gap-3 sm:grid-cols-3">
      <label className="min-w-0 font-bold">Năm điểm chuẩn<select className={input} value={year} onChange={e => setYear(e.target.value)}><option value="ALL">Tất cả năm</option>{years.map(value => <option key={value}>{value}</option>)}</select></label>
      <label className="min-w-0 font-bold">Chương trình điểm chuẩn<select className={input} value={program} onChange={e => setProgram(e.target.value)}><option value="ALL">Tất cả chương trình</option>{programs.map(([code, name]) => <option key={code} value={code}>{code} · {name}</option>)}</select></label>
      <label className="min-w-0 font-bold">Phương thức điểm chuẩn<select className={input} value={method} onChange={e => setMethod(e.target.value)}><option value="ALL">Tất cả phương thức</option>{methods.map(([code, name]) => <option key={code} value={code}>{code} · {name}</option>)}</select></label>
    </div>
    {!visible.length ? <p>{scoreHistory.length ? "Không có dữ liệu phù hợp với bộ lọc." : "Chưa công bố chỉ tiêu hoặc điểm chuẩn."}</p> : <div className="min-w-0 space-y-6">
      {years.filter(value => visible.some(row => row.nam === value)).map(value => {
        const rows = visible.filter(row => row.nam === value);
        const columns = methods.filter(([code]) => rows.some(row => row.ma_phuong_thuc === code));
        // Gom các phương thức thành cột, mỗi chương trình/năm chỉ có một dòng chỉ tiêu.
        const grouped = [...new Map(rows.map(row => [row.ma_chuong_trinh, row])).values()];
        const prefix = `cutoff-${value}`;
        return <div key={value} className="min-w-0">
          <h3 className="mb-3 text-lg font-black">Điểm trúng tuyển năm {value}</h3>
          <p className="mb-2 text-sm text-slate-600 md:hidden">Vuốt ngang bảng để xem điểm chuẩn và tiêu chí phụ →</p>
          <div role="region" aria-label={`Bảng điểm trúng tuyển năm ${value}, cuộn ngang để xem đầy đủ`} tabIndex={0} className="max-w-full overflow-x-auto rounded-sm focus-visible:outline-2 focus-visible:outline-blue-700">
            <table className="w-full min-w-[880px] border-collapse text-sm">
              <caption className="sr-only">Chỉ tiêu và điểm trúng tuyển theo chương trình, phương thức năm {value}</caption>
              <thead className="bg-[#a9cbea] text-center font-black uppercase text-[#101827]">
                <tr>
                  <th id={`${prefix}-order`} rowSpan={2} scope="col" className={cell}>TT</th>
                  <th id={`${prefix}-code`} rowSpan={2} scope="col" className={cell}>Mã xét tuyển</th>
                  <th id={`${prefix}-program`} rowSpan={2} scope="col" className={`${cell} min-w-[250px]`}>Ngành / chương trình xét tuyển</th>
                  <th id={`${prefix}-quota`} rowSpan={2} scope="col" className={cell}>Chỉ tiêu</th>
                  <th id={`${prefix}-scores`} colSpan={Math.max(columns.length, 1)} scope="colgroup" className={cell}>Điểm trúng tuyển theo từng phương thức</th>
                  <th id={`${prefix}-criteria`} rowSpan={2} scope="col" className={`${cell} min-w-[200px]`}>Tiêu chí phụ</th>
                </tr>
                <tr>{columns.length ? columns.map(([code]) => <th key={code} id={`${prefix}-method-${code}`} scope="col" className={`${cell} min-w-[85px]`}>{code}</th>) : <th id={`${prefix}-unpublished`} scope="col" className={cell}>Chưa công bố</th>}</tr>
              </thead>
              <tbody>{grouped.map((entry, index) => {
                const programRows = rows.filter(row => row.ma_chuong_trinh === entry.ma_chuong_trinh);
                const rowId = `${prefix}-row-${index}`;
                const criteria = programRows.map(row => ({ code: row.ma_phuong_thuc, parts: conditions(row) })).filter(item => item.parts.length);
                return <tr key={entry.ma_chuong_trinh} className={index % 2 ? "bg-[#c6edce]" : "bg-white"}>
                  <td headers={`${rowId} ${prefix}-order`} className={`${cell} text-center`}>{index + 1}</td>
                  <td headers={`${rowId} ${prefix}-code`} className={`${cell} text-center font-bold`}>{entry.ma_chuong_trinh}</td>
                  <th id={rowId} scope="row" headers={`${prefix}-program`} className={`${cell} text-left font-semibold`}>{entry.ten_chuong_trinh}</th>
                  <td headers={`${rowId} ${prefix}-quota`} className={`${cell} text-center tabular-nums`}>{entry.chi_tieu ?? "Chưa công bố"}</td>
                  {columns.length ? columns.map(([code]) => {
                    const score = programRows.find(row => row.ma_phuong_thuc === code)?.diem;
                    return <td key={code} headers={`${rowId} ${prefix}-scores ${prefix}-method-${code}`} className={`${cell} text-center font-bold tabular-nums`}>{typeof score === "number" && Number.isFinite(score) && score > 0 ? score.toFixed(2) : "—"}</td>;
                  }) : <td headers={`${rowId} ${prefix}-scores ${prefix}-unpublished`} className={`${cell} text-center`}>—</td>}
                  <td headers={`${rowId} ${prefix}-criteria`} className={cell}>{criteria.length ? <ul className="space-y-2">{criteria.map(item => <li key={item.code}><strong>{item.code}:</strong> {item.parts.join("; ")}</li>)}</ul> : "Chưa công bố"}</td>
                </tr>;
              })}</tbody>
            </table>
          </div>
          {columns.length > 0 && <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm">{columns.map(([code, name]) => <li key={code}><strong>{code}:</strong> {name}</li>)}</ul>}
        </div>;
      })}
      <p className="text-sm text-slate-600">“—”: chưa có điểm chuẩn hợp lệ được công bố trong dữ liệu. TTNV: thứ tự nguyện vọng. Các phương thức có thể dùng thang điểm khác nhau; không so sánh trực tiếp giữa các thang điểm.</p>
    </div>}
  </section>;
}

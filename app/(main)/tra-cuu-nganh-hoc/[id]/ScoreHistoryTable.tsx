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
    parts.push(`Điểm UT tối thiểu: ${row.diem_uu_tien_toi_thieu}`);
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
  const inputStyle = "mt-1.5 w-full min-w-0 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 transition-colors focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600";
  const cell = "border-b border-slate-200/70 px-3 py-3 text-sm";

  return (
    <section id="diem-chuan" aria-labelledby="score-history-heading" className="min-w-0 max-w-full rounded-xl border border-slate-200/90 bg-white p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 pb-4">
        <div>
          <h2 id="score-history-heading" className="text-xl font-bold text-[#14244e]">Chỉ tiêu và lịch sử điểm chuẩn</h2>
          <p className="mt-1 text-xs text-slate-500">Dữ liệu đối soát chính thức từ hội đồng tuyển sinh. Chỉ tiêu phân bổ theo chương trình đào tạo theo từng năm.</p>
        </div>
        <span className="self-start sm:self-auto inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-blue-50 text-blue-700">
          UTC GHA
        </span>
      </div>

      <div className="my-5 grid min-w-0 gap-3 sm:grid-cols-3">
        <label className="min-w-0 text-xs font-semibold text-slate-700">
          Năm xét tuyển
          <select className={inputStyle} value={year} onChange={e => setYear(e.target.value)}>
            <option value="ALL">Tất cả năm</option>
            {years.map(value => <option key={value} value={value}>{value}</option>)}
          </select>
        </label>
        <label className="min-w-0 text-xs font-semibold text-slate-700">
          Chương trình đào tạo
          <select className={inputStyle} value={program} onChange={e => setProgram(e.target.value)}>
            <option value="ALL">Tất cả chương trình</option>
            {programs.map(([code, name]) => <option key={code} value={code}>{code} · {name}</option>)}
          </select>
        </label>
        <label className="min-w-0 text-xs font-semibold text-slate-700">
          Phương thức xét tuyển
          <select className={inputStyle} value={method} onChange={e => setMethod(e.target.value)}>
            <option value="ALL">Tất cả phương thức</option>
            {methods.map(([code, name]) => <option key={code} value={code}>{code} · {name}</option>)}
          </select>
        </label>
      </div>

      {!visible.length ? (
        <p className="text-sm text-slate-500 py-4 text-center">
          {scoreHistory.length ? "Không có dữ liệu phù hợp với bộ lọc hiện tại." : "Chưa có dữ liệu chỉ tiêu hoặc điểm chuẩn được công bố."}
        </p>
      ) : (
        <div className="min-w-0 space-y-6">
          {years.filter(value => visible.some(row => row.nam === value)).map(value => {
            const rows = visible.filter(row => row.nam === value);
            const columns = methods.filter(([code]) => rows.some(row => row.ma_phuong_thuc === code));
            // Gom các phương thức thành cột, mỗi chương trình/năm chỉ có một dòng chỉ tiêu.
            const grouped = [...new Map(rows.map(row => [row.ma_chuong_trinh, row])).values()];
            const prefix = `cutoff-${value}`;
            return (
              <div key={value} className="min-w-0">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-base font-bold text-[#14244e]">Năm tuyển sinh {value}</h3>
                  <span className="text-xs text-slate-500">{grouped.length} chương trình</span>
                </div>
                <div role="region" aria-label={`Bảng điểm trúng tuyển năm ${value}`} tabIndex={0} className="max-w-full overflow-x-auto rounded-lg border border-slate-200/80">
                  <table className="w-full min-w-[760px] border-collapse text-left text-sm">
                    <caption className="sr-only">Chỉ tiêu và điểm trúng tuyển theo chương trình, phương thức năm {value}</caption>
                    <thead className="bg-slate-50 text-slate-700 text-xs uppercase font-semibold">
                      <tr>
                        <th id={`${prefix}-order`} rowSpan={2} scope="col" className={`${cell} w-12 text-center`}>STT</th>
                        <th id={`${prefix}-code`} rowSpan={2} scope="col" className={`${cell} w-24 text-center`}>Mã CTĐT</th>
                        <th id={`${prefix}-program`} rowSpan={2} scope="col" className={`${cell} min-w-[220px]`}>Chương trình đào tạo</th>
                        <th id={`${prefix}-quota`} rowSpan={2} scope="col" className={`${cell} w-24 text-center`}>Chỉ tiêu</th>
                        <th id={`${prefix}-scores`} colSpan={Math.max(columns.length, 1)} scope="colgroup" className={`${cell} text-center`}>Điểm trúng tuyển các phương thức</th>
                        <th id={`${prefix}-criteria`} rowSpan={2} scope="col" className={`${cell} min-w-[180px]`}>Tiêu chí phụ</th>
                      </tr>
                      <tr className="bg-slate-100/70 text-slate-600 text-xs">
                        {columns.length ? columns.map(([code]) => (
                          <th key={code} id={`${prefix}-method-${code}`} scope="col" className={`${cell} text-center min-w-[80px]`}>{code}</th>
                        )) : (
                          <th id={`${prefix}-unpublished`} scope="col" className={`${cell} text-center text-slate-400 font-normal`}>Chưa công bố</th>
                        )}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {grouped.map((entry, index) => {
                        const programRows = rows.filter(row => row.ma_chuong_trinh === entry.ma_chuong_trinh);
                        const rowId = `${prefix}-row-${index}`;
                        const criteria = programRows.map(row => ({ code: row.ma_phuong_thuc, parts: conditions(row) })).filter(item => item.parts.length);
                        return (
                          <tr key={entry.ma_chuong_trinh} className="hover:bg-blue-50/30 transition-colors">
                            <td headers={`${rowId} ${prefix}-order`} className={`${cell} text-center text-slate-500 tabular-nums`}>{index + 1}</td>
                            <td headers={`${rowId} ${prefix}-code`} className={`${cell} text-center font-mono font-semibold text-[#14244e]`}>{entry.ma_chuong_trinh}</td>
                            <th id={rowId} scope="row" headers={`${prefix}-program`} className={`${cell} font-medium text-slate-900`}>{entry.ten_chuong_trinh}</th>
                            <td headers={`${rowId} ${prefix}-quota`} className={`${cell} text-center tabular-nums text-slate-700`}>{entry.chi_tieu ?? "Chưa công bố"}</td>
                            {columns.length ? columns.map(([code]) => {
                              const score = programRows.find(row => row.ma_phuong_thuc === code)?.diem;
                              const hasScore = typeof score === "number" && Number.isFinite(score) && score > 0;
                              return (
                                <td key={code} headers={`${rowId} ${prefix}-scores ${prefix}-method-${code}`} className={`${cell} text-center tabular-nums`}>
                                  {hasScore ? (
                                    <span className="font-bold text-[#dc2626]">{score.toFixed(2)}</span>
                                  ) : (
                                    <span className="text-slate-400 text-xs">—</span>
                                  )}
                                </td>
                              );
                            }) : (
                              <td headers={`${rowId} ${prefix}-scores ${prefix}-unpublished`} className={`${cell} text-center text-slate-400 text-xs`}>—</td>
                            )}
                            <td headers={`${rowId} ${prefix}-criteria`} className={`${cell} text-xs text-slate-600`}>
                              {criteria.length ? (
                                <ul className="space-y-1">
                                  {criteria.map(item => (
                                    <li key={item.code}><strong className="font-semibold text-slate-700">{item.code}:</strong> {item.parts.join("; ")}</li>
                                  ))}
                                </ul>
                              ) : (
                                <span className="text-slate-400">Không</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                {columns.length > 0 && (
                  <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-xs text-slate-600">
                    {columns.map(([code, name]) => (
                      <li key={code}>
                        <span className="font-semibold text-slate-800">{code}</span>: {name}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

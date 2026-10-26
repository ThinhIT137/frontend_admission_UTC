import { CircleCheck, CircleHelp, CircleX, TriangleAlert } from "lucide-react";
import type { ComparisonRow } from "./comparison";

/** Mức tham khảo từ chênh lệch điểm, không biến thành phần trăm xác suất AI. */
export default function AdmissionLikelihood({
    row,
    hasConvertedScore,
}: {
    row: ComparisonRow;
    hasConvertedScore: boolean;
}) {
    const blocked = row.chance === "ineligible";
    const level = blocked
        ? 0
        : row.pointBand === "high"
          ? 3
          : row.pointBand === "medium"
            ? 2
            : row.pointBand === "low"
              ? 1
              : 0;
    const label = blocked
        ? "Không đủ điều kiện"
        : level === 3
          ? "Cao"
          : level === 2
            ? "Trung bình"
            : level === 1
              ? "Thấp"
              : "Chưa đánh giá";
    const colour = blocked
        ? "text-red-700"
        : level === 3
          ? "text-emerald-700"
          : level === 2
            ? "text-amber-700"
            : level === 1
              ? "text-rose-700"
              : "text-slate-500";
    const fill =
        level === 3
            ? "bg-emerald-500"
            : level === 2
              ? "bg-amber-400"
              : "bg-rose-400";
    const Icon = blocked
        ? CircleX
        : level === 3
          ? CircleCheck
          : level
            ? TriangleAlert
            : CircleHelp;
    return (
        <div className="mx-auto w-full max-w-48 space-y-2.5 py-1 text-center">
            <div className={`flex items-center justify-center gap-2 ${colour}`}>
                <Icon size={17} aria-hidden="true" className="shrink-0" />
                <strong className="text-sm font-semibold leading-6">
                    {label}
                </strong>
            </div>
            {level > 0 && (
                <>
                    <div className="flex gap-1" aria-hidden="true">
                        {[1, 2, 3].map((segment) => (
                            <span
                                key={segment}
                                className={`h-1.5 flex-1 rounded-full ${segment <= level ? fill : "bg-slate-100"}`}
                            />
                        ))}
                    </div>
                </>
            )}
            <details className="text-xs leading-5 text-slate-600">
                <summary className="cursor-pointer font-medium text-blue-800">
                    Lý do
                </summary>
                <div className="mt-2 space-y-2 break-words text-left">
                    {level > 0 && <p>Theo chênh lệch điểm tham khảo.</p>}
                    {!blocked && row.chance === "unknown" && (
                        <p>{level ? "Cần kiểm tra thêm điều kiện." : hasConvertedScore
                            ? `Thiếu điểm tham chiếu ${row.benchmarkYear}.`
                            : "Chưa có điểm quy đổi."}</p>
                    )}
                    <p>{row.reason}</p>
                </div>
            </details>
        </div>
    );
}

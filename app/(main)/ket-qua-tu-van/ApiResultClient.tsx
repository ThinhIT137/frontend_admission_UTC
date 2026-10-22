"use client";
import { publicError } from "@/libs/client-error";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { api } from "@/libs/api-services/browser-api";
type Result = { result_id: string; student_name?: string; mbti_type: string; type_name: string; personality_summary: string;
  strengths: string[]; weaknesses: string[]; suitable_environment: string; work_style: string;
  recommended_majors: Array<{ major_code: string; major_name: string; match_score: number; reason: string }>;
  dimension_scores: Record<string, number> };
export default function ApiResultClient() {
  const id = useSearchParams().get("id");
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true; setResult(null); setError("");
    if (id) api<{ data: Result }>("ai", `/api/mbti/result/${encodeURIComponent(id)}`).then(r => { if (active) setResult(r.data); }).catch(e => { if (active) setError(publicError(e.message)); });
    return () => { active = false; };
  }, [id]);
  return <div className="space-y-5"><h1 className="text-2xl font-bold">Kết quả tư vấn MBTI</h1>
    {!id && <p>Chưa có mã kết quả. <Link className="underline" href="/trac-nghiem-mbti">Làm trắc nghiệm</Link></p>}
    {error && <p role="alert" className="text-red-700">{error}</p>}{id && !result && !error && <p>Đang tải kết quả…</p>}
    {result && <><section className="bg-white border rounded-xl p-5 space-y-3"><p>{result.student_name}</p><h2 className="text-xl font-bold">{result.mbti_type} · {result.type_name}</h2><p>{result.personality_summary}</p><p>{result.work_style}</p><p>{result.suitable_environment}</p>
      <h3 className="font-bold">Điểm mạnh</h3><ul>{result.strengths.map(x => <li key={x}>• {x}</li>)}</ul><h3 className="font-bold">Điểm cần rèn luyện</h3><ul>{result.weaknesses?.map(x => <li key={x}>• {x}</li>)}</ul>
      {Object.entries(result.dimension_scores).map(([label, score]) => <div key={label} className="flex items-center gap-3"><span className="w-32">{label}</span><progress className="flex-1" max={100} value={score} aria-label={label} /><span>{score.toFixed(0)}%</span></div>)}
    </section><h2 className="font-bold">Ngành gợi ý</h2><div className="grid md:grid-cols-2 gap-4">{result.recommended_majors.map(m => <article key={m.major_code} className="border bg-white rounded p-4"><h3 className="font-bold">{m.major_name} · {m.match_score}% tương thích</h3><p>{m.reason}</p><Link className="underline" href={`/tra-cuu-nganh-hoc?term=${encodeURIComponent(m.major_name)}`}>Tra cứu chương trình</Link></article>)}</div><p className="text-sm text-gray-600">Kết quả hướng nghiệp dùng để tham khảo; mức tương thích không phải xác suất trúng tuyển.</p></>}
  </div>;
}

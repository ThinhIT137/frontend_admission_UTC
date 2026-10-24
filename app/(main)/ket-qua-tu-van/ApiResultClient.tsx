"use client";
import { publicError } from "@/libs/client-error";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { api } from "@/libs/api-services/browser-api";
import { recommendedPrograms } from "@/actions/recommended-programs.action";
import MajorCard from "@/components/tra-cuu-nganh-hoc/MajorCard";
import PageMotion from "@/components/ui/PageMotion";
import { useLoading } from "@/contexts/loadingContext";
// Khóa dữ liệu của API giữ nguyên; chỉ Việt hóa nhãn trình bày.
const dimensionLabels: Record<string, string> = {
  extraversion: "Hướng ngoại", introversion: "Hướng nội", sensing: "Giác quan", intuition: "Trực giác",
  thinking: "Lý trí", feeling: "Cảm xúc", judging: "Nguyên tắc", perceiving: "Linh hoạt",
};
const personalityNames: Record<string, string> = {
  ISTJ: "Người trách nhiệm", ISFJ: "Người bảo vệ và tận tâm", INFJ: "Người cố vấn", INTJ: "Người hoạch định",
  ISTP: "Người thực hành", ISFP: "Người nghệ sĩ", INFP: "Người lý tưởng", INTP: "Người tư duy",
  ESTP: "Người năng động", ESFP: "Người nhiệt huyết", ENFP: "Người truyền cảm hứng", ENTP: "Người sáng tạo",
  ESTJ: "Người tổ chức", ESFJ: "Người quan tâm", ENFJ: "Người dẫn dắt", ENTJ: "Người quyết đoán",
};
type Result = { result_id: string; student_name?: string; mbti_type: string; type_name: string; personality_summary: string;
  strengths: string[]; weaknesses: string[]; suitable_environment: string; work_style: string;
  recommended_majors: Array<{ major_code: string; major_name: string; match_score: number; reason: string }>;
  dimension_scores: Record<string, number> };
export default function ApiResultClient() {
  const { beginLoading } = useLoading();
  const [programs, setPrograms] = useState<Awaited<ReturnType<typeof recommendedPrograms>>>([]);
  const [catalogError, setCatalogError] = useState("");
  const id = useSearchParams().get("id");
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true; setResult(null); setError(""); setPrograms([]); setCatalogError("");
    if (!id) return;
    const release = beginLoading();
    api<{ data: Result }>("ai", `/api/mbti/result/${encodeURIComponent(id)}`).then(async r => {
      if (!active) return; setResult(r.data);
      try { const catalog = await recommendedPrograms(r.data.recommended_majors.map(value => value.major_code).slice(0, 20)); if (active) setPrograms(catalog); }
      catch { if (active) setCatalogError("Chưa tải được điểm chuẩn và chỉ tiêu. Bạn vẫn có thể tra cứu từng ngành bên dưới."); }
    }).catch(e => { if (active) setError(publicError(e.message)); }).finally(release);
    return () => { active = false; release(); };
  }, [id, beginLoading]);
  return <PageMotion className="space-y-5 text-[#14244e]"><h1 className="text-2xl font-bold">Kết quả tư vấn MBTI</h1>
    {!id && <p>Chưa có mã kết quả. <Link className="underline" href="/trac-nghiem-mbti">Làm trắc nghiệm</Link></p>}
    {error && <p role="alert" className="text-red-700">{error}</p>}{id && !result && !error && <p>Đang tải kết quả…</p>}
    {result && <><section className="bg-white border rounded-xl p-5 space-y-3"><p>{result.student_name}</p><h2 className="text-xl font-bold">{result.mbti_type} · {personalityNames[result.mbti_type.toUpperCase()] ?? "Nhóm tính cách"}</h2><p>{result.personality_summary}</p><p>{result.work_style}</p><p>{result.suitable_environment}</p>
      <h3 className="font-bold">Điểm mạnh</h3><ul>{result.strengths.map(x => <li key={x}>• {x}</li>)}</ul><h3 className="font-bold">Điểm cần rèn luyện</h3><ul>{result.weaknesses?.map(x => <li key={x}>• {x}</li>)}</ul>
      {Object.entries(result.dimension_scores).map(([key, value]) => {
        const label = dimensionLabels[key.toLowerCase()];
        if (!label || !Number.isFinite(value)) return null;
        const score = Math.max(0, Math.min(100, value));
        return <div key={key} className="flex items-center gap-3"><span className="w-24 shrink-0 sm:w-32">{label}</span><progress className="min-w-0 flex-1" max={100} value={score} aria-label={label} /><span>{score.toFixed(0)}%</span></div>;
      })}
    </section><h2 className="text-xl font-bold">Ngành gợi ý</h2><p className="text-sm leading-7 text-slate-500">Điểm chuẩn hoặc dự đoán cùng năm, chỉ tiêu năm {new Date().getFullYear()} theo dữ liệu đã công bố.</p>{catalogError && <p role="status" className="text-sm text-amber-800">{catalogError}</p>}<div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{result.recommended_majors.map(m => {
      const matches = programs.filter(program => program.ma_chuong_trinh === m.major_code || program.ma_nganh === m.major_code);
      return matches.length ? matches.map((program, index) => <article key={`${m.major_code}-${program.ma_chuong_trinh}`} className="flex min-w-0 flex-col gap-3"><div className="rounded-xl border border-blue-100 bg-blue-50 p-4"><p className="font-semibold text-blue-900">{Number.isFinite(m.match_score) ? `${Math.max(0, Math.min(100, m.match_score))}% tương thích` : "Ngành phù hợp để khám phá"}</p><p className="mt-2 text-sm leading-7 text-slate-600">{m.reason}</p></div><MajorCard major={program} idx={index} selectedYear={new Date().getFullYear()} /></article>) : <article key={m.major_code} className="rounded-2xl border border-slate-200 bg-white p-5"><h3 className="font-bold">{m.major_name}</h3><p className="mt-2 text-sm leading-7">{m.reason}</p><p className="my-3 text-sm text-slate-500">Chưa có thông tin điểm chuẩn và chỉ tiêu khớp mã ngành.</p><Link className="font-semibold text-blue-700 underline" href={`/tra-cuu-nganh-hoc?term=${encodeURIComponent(m.major_name)}`}>Tra cứu chương trình</Link></article>;
    })}</div><p className="text-sm text-gray-600">Kết quả hướng nghiệp dùng để tham khảo; mức tương thích không phải xác suất trúng tuyển.</p></>}
  </PageMotion>;
}

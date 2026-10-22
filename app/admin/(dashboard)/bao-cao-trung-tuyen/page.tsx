import BaoCaoClient from "./BaoCaoClient";
import { backendReport } from "@/services/backend-report.service";
export const dynamic = "force-dynamic";
export default async function Page({ searchParams }: { searchParams?: Promise<{ year?: string }> }) {
  const year = Number((await searchParams)?.year || new Date().getFullYear());
  if (!Number.isInteger(year) || year < 2000 || year > 2100) return <p>Năm không hợp lệ</p>;
  try { return <><form><label>Năm tuyển sinh <input className="border p-2" name="year" type="number" defaultValue={year} min={2000} max={2100}/></label><button className="p-2 underline">Xem báo cáo</button></form><BaoCaoClient admissionYear={year} reportDate={new Date().toLocaleDateString("vi-VN")} {...await backendReport(year)} /></>; }
  catch (e) { return <div><h1>Báo cáo tuyển sinh</h1><p role="alert">{e instanceof Error ? e.message : "Không tải được báo cáo"}</p></div>; }
}

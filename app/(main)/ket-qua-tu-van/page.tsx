import { Suspense } from "react";
import ApiResultClient from "./ApiResultClient";
export default function Page() { return <Suspense fallback={<p>Đang tải kết quả…</p>}><ApiResultClient /></Suspense>; }

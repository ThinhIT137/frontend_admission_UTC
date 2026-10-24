import { Suspense } from "react";
import ApiResultClient from "./ApiResultClient";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
export default function Page() { return <Suspense fallback={<LoadingSpinner label="Đang tải kết quả tư vấn…" />}><ApiResultClient /></Suspense>; }

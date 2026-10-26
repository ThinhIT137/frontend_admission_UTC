import { api } from "@/libs/api-services/browser-api";
import type { AiBenchmark } from "./comparison";

let cached: { until: number; data: AiBenchmark[] } | undefined;
let pending: Promise<AiBenchmark[]> | undefined;

/** Một batch công khai, dùng chung cả StrictMode/remount; không gọi theo từng thẻ. */
export function loadAiBenchmarks(): Promise<AiBenchmark[]> {
    if (cached && cached.until > Date.now())
        return Promise.resolve(cached.data);
    if (pending) return pending;
    pending = api<{ data: AiBenchmark[] }>("ai", "/api/predict/all-benchmarks")
        .then((result) => {
            if (!Array.isArray(result?.data))
                throw new Error("Invalid prediction response");
            cached = { data: result.data, until: Date.now() + 5 * 60_000 };
            return result.data;
        })
        .finally(() => {
            pending = undefined;
        });
    return pending;
}

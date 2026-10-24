/** Hàm gọi từ trình duyệt: gửi JSON tới API trung gian của Next.js, không gọi thẳng microservice.
 * Cookie cùng website được gửi kèm; lỗi trả thông báo chung để giao diện dùng toast. */
export class BrowserApiError extends Error {
    constructor(public readonly status: number) {
        super("Thao tác thất bại. Vui lòng thử lại.");
        this.name = "BrowserApiError";
    }
}
export async function api<T>(
    service: "ai" | "score",
    path: string,
    body?: unknown,
    method = body === undefined ? "GET" : "POST",
): Promise<T> {
    const response = await fetch(`/api/backend/${service}${path}`, {
        method,
        credentials: "same-origin",
        cache: "no-store",
        headers: { "Content-Type": "application/json" },
        body: body === undefined ? undefined : JSON.stringify(body),
    });
    const data = await response.json().catch(() => null);
    if (!response.ok || data?.success === false) {
        console.error("[API thất bại]", { service, status: response.status });
        throw new BrowserApiError(response.status);
    }
    return data as T;
}

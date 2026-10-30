import { refreshCandidateSession } from "@/services/candidate-auth.service";
import { tokenService } from "@/services/token.service";
import { adminService } from "@/services/user.service";
import { cookies } from "next/headers";
import "server-only";

/** Cầu nối chỉ chạy ở server Next.js: chọn backend điểm/AI, gắn xác thực và đọc JSON.
 * Trình duyệt không cần biết khóa nội bộ AI hoặc đọc token trong cookie HttpOnly. */
export class BackendError extends Error {
    constructor(
        message: string,
        public status = 502,
        public code?: "ENDPOINT_NOT_FOUND",
    ) {
        super(message);
    }
}

/** Ghép địa chỉ đã cấu hình với đường dẫn API tương đối; chặn đường dẫn có thể thoát sang nơi khác. */
export function backendUrl(service: "ai" | "score", path: string): string {
    const configured =
        service === "ai"
            ? process.env.API_AI_ML
            : process.env.API_APPLICATION_SCORE;
    const production = process.env.NODE_ENV === "production";
    if (!configured && production)
        throw new BackendError("Chưa cấu hình kết nối dịch vụ", 503);
    let base: URL;
    try {
        base = new URL(
            configured ||
                (service === "ai"
                    ? "http://127.0.0.1:8000"
                    : "http://127.0.0.1:8001"),
        );
    } catch {
        throw new BackendError("Cấu hình kết nối không hợp lệ", 503);
    }
    const loopback = ["127.0.0.1", "localhost", "[::1]"].includes(
        base.hostname,
    );
    if (
        !["http:", "https:"].includes(base.protocol) ||
        base.username ||
        base.password ||
        base.search ||
        base.hash ||
        (production &&
            base.protocol !== "https:" &&
            !(loopback && process.env.ALLOW_LOOPBACK_BACKEND_HTTP === "true"))
    )
        throw new BackendError("Kết nối dịch vụ cần cấu hình an toàn", 503);
    if (
        !path.startsWith("/") ||
        path.startsWith("//") ||
        /[\\#\u0000-\u0020\u007f]/.test(path)
    )
        throw new BackendError("Đường dẫn dịch vụ không hợp lệ", 400);
    // Giải mã từng đoạn để phát hiện cả dấu chấm hoặc dấu phân cách bị mã hóa nhiều lần.
    const pathname = path.split("?")[0];
    for (const part of pathname.split("/")) {
        let decoded = part;
        try {
            for (let i = 0; i < 4; i++) {
                const next = decodeURIComponent(decoded);
                if (next === decoded) break;
                decoded = next;
            }
        } catch {
            throw new BackendError("Đường dẫn dịch vụ không hợp lệ", 400);
        }
        if (
            decoded === "." ||
            decoded === ".." ||
            /[\\/\u0000-\u0020\u007f%]/.test(decoded)
        )
            throw new BackendError("Đường dẫn dịch vụ không hợp lệ", 400);
    }
    return base.href.replace(/\/$/, "") + path;
}

/** Nhận tên dịch vụ, đường dẫn và dữ liệu gửi; trả JSON kiểu T hoặc ném BackendError.
 * auth quyết định dùng phiên admin, thí sinh, phiên sẵn có hay API công khai. */
export async function backendRequest<T>(
    service: "ai" | "score",
    path: string,
    options: {
        method?: string;
        body?: unknown;
        auth?: "admin" | "candidate" | "session" | "public";
    } = {},
): Promise<T> {
    const url = backendUrl(service, path);
    const jar = await cookies();
    const auth = options.auth || "public";
    // Với thao tác cho cả hai nhóm, ưu tiên phiên thí sinh nếu cookie của thí sinh đang có.
    if (auth === "session")
        return backendRequest<T>(service, path, {
            ...options,
            auth:
                jar.get("candidateToken") || jar.get("candidateRefresh")
                    ? "candidate"
                    : "admin",
        });
    let token: string | undefined;
    let candidateRefreshed = false;
    if (auth === "admin") {
        const current = jar.get("accessToken")?.value;
        if (
            (!current || !(await tokenService.verifyAccessToken(current))) &&
            jar.get("refreshToken")
        ) {
            try {
                await adminService.refreshAccessToken();
            } catch {
                throw new BackendError(
                    "Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.",
                    401,
                );
            }
        }
        const user = await adminService.getCurrentUser();
        if (
            !user ||
            !["super_admin", "chuyen_vien"].includes(user.vai_tro.ten_vai_tro)
        )
            throw new BackendError("Bạn cần đăng nhập quản trị", 401);
        token = jar.get("accessToken")?.value;
    } else if (auth === "candidate") {
        token = jar.get("candidateToken")?.value;
        if (!token && jar.get("candidateRefresh")) {
            token = await refreshCandidateSession();
            candidateRefreshed = true;
        }
    }
    if (auth !== "public" && !token)
        throw new BackendError(
            "Chưa có phiên đăng nhập thí sinh. Cần kết nối hệ thống cấp JWT thí sinh.",
            401,
        );
    const headers: Record<string, string> = {
        "Content-Type": "application/json",
    };
    // Token dùng để backend kiểm tra danh tính; khóa nội bộ AI chỉ được gắn tại server này.
    if (token) headers.Authorization = `Bearer ${token}`;
    if (service === "ai" && process.env.AI_INTERNAL_API_KEY)
        headers.Authorization = `Bearer ${process.env.AI_INTERNAL_API_KEY}`;
    if (
        service === "ai" &&
        auth === "admin" &&
        !process.env.AI_INTERNAL_API_KEY
    )
        throw new BackendError(
            "Chưa cấu hình AI_INTERNAL_API_KEY ở server Next.js",
            503,
        );
    let response: Response;
    // Chat có thêm thời gian truy xuất dữ liệu và chờ LLM (backend chờ tới 60s).
    // Không tự retry POST: tránh tạo hai lượt hội thoại cho một lần bấm.
    const timeoutMs = service === "ai" ? (pathnameForTimeout(path) === "/api/chat" ? 90000 : 45000) : 15000;
    const signal = AbortSignal.timeout(timeoutMs);
    try {
        response = await fetch(url, {
            redirect: "error",
            method: options.method || "GET",
            headers,
            body:
                options.body === undefined
                    ? undefined
                    : JSON.stringify(options.body),
            cache: "no-store",
            signal,
        });
    } catch {
        if (signal.aborted) {
            console.error("[Backend timeout]", { service, timeoutMs });
            throw new BackendError("Dịch vụ phản hồi quá thời gian chờ. Vui lòng thử lại sau.", 504);
        }
        throw new BackendError(
            `Không kết nối được backend ${service === "ai" ? "AI" : "hồ sơ/điểm"}. Vui lòng thử lại.`,
        );
    }
    // Nếu backend điểm từ chối token admin, làm mới và gửi lại đúng một lần ở nhánh này.
    if (
        response.status === 401 &&
        service === "score" &&
        auth === "admin" &&
        jar.get("refreshToken")
    ) {
        try {
            await adminService.refreshAccessToken();
            headers.Authorization = `Bearer ${(await cookies()).get("accessToken")?.value}`;
            response = await fetch(url, {
                redirect: "error",
                method: options.method || "GET",
                headers,
                body:
                    options.body === undefined
                        ? undefined
                        : JSON.stringify(options.body),
                cache: "no-store",
                signal: AbortSignal.timeout(15000),
            });
        } catch {
            throw new BackendError("Không thể làm mới phiên đăng nhập", 401);
        }
    }
    // Next.js xác minh và làm mới token thí sinh rồi thử lại API điểm đúng một lần.
    if (
        response.status === 401 &&
        service === "score" &&
        auth === "candidate" &&
        !candidateRefreshed &&
        jar.get("candidateRefresh")
    ) {
        headers.Authorization = `Bearer ${await refreshCandidateSession()}`;
        response = await fetch(url, {
            redirect: "error",
            method: options.method || "GET",
            headers,
            body:
                options.body === undefined
                    ? undefined
                    : JSON.stringify(options.body),
            cache: "no-store",
            signal: AbortSignal.timeout(15000),
        });
    }
    // HTTP 204 không có JSON; lỗi HTTP hoặc success=false đều phải trở thành lỗi cho bên gọi.
    const json =
        response.status === 204
            ? null
            : await response.json().catch(() => null);
    if (!response.ok || json?.success === false) {
        throw new BackendError(
            response.status === 401
                ? "Phiên đăng nhập hết hạn"
                : "Dịch vụ chưa xử lý được yêu cầu",
            response.ok ? 502 : response.status,
            response.status === 404 && json?.detail === "Not Found" ? "ENDPOINT_NOT_FOUND" : undefined,
        );
    }
    return json as T;
}

function pathnameForTimeout(path: string) {
    return path.split("?")[0];
}

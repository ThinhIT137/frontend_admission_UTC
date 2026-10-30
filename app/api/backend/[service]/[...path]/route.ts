import { enforceSameOrigin, readBoundedJson, privateJson, apiFailure, publicApiLimiter } from "@/libs/api-security";
import { backendRequest } from "@/libs/api-services/backend.server";
import { adminService } from "@/services/user.service";
import { NextRequest } from "next/server";
import { retryWithdrawnEvidence, withdrawWithEvidence } from "@/libs/withdrawal-storage.server";
import { cutoffApi } from "@/libs/cutoff-api.server";

// Chừa ngân sách lớn hơn thời gian chờ 90s của chat; giới hạn host vẫn được áp dụng.
export const maxDuration = 120;

// Explicit endpoint allowlist; never proxy arbitrary hosts or attach privileged credentials to unknown paths.
/** Bảng quyền theo đúng cặp đường dẫn/phương thức; ngoài danh sách trả null để từ chối. */
function policy(
    service: string,
    path: string,
    method: string,
): "admin" | "candidate" | "session" | "public" | null {
    if (service === "score" && ["GET", "POST"].includes(method) && /^\/diem-chuan\/nam\/\d{4}\/khoa$/.test(path)) return "admin";
    if (service === "score" && path === "/ho-so/cua-toi/don-minh-chung" && method === "POST") return "candidate";
    if (service === "ai") {
        if (
            method === "GET" &&
            /^\/api\/(mbti\/(questions|result\/[^/]+)|predict\/(all-benchmarks|benchmark\/[^/]+))$/.test(
                path,
            )
        )
            return "public";
        if (
            method === "POST" &&
            /^\/api\/(chat|mbti\/submit|predict\/(admission-chance|recommend-majors))$/.test(
                path,
            )
        )
            return "public";
        if (
            /^\/api\/chat\/(knowledge(\/[^/]+)?|sync-knowledge)$/.test(path) &&
            ["GET", "POST", "PUT", "DELETE"].includes(method)
        )
            return "admin";
    }
    if (service === "score") {
        if (method === "POST" && path === "/ho-so/tra-cuu-cong-khai") return "public";
        if (method === "POST" && path === "/diem/tinh-diem-doi-soat") return "public";
        if (method === "POST" && path === "/xet-tuyen/nhap-diem-thpt") return "admin";
        if (method === "GET" && /^\/xet-tuyen\/thong-bao\/\d{4}$/.test(path)) return "admin";
        if (["GET", "POST"].includes(method) && path === "/diem-chuan")
            return "admin";
        if (
            ["PUT", "DELETE"].includes(method) &&
            /^\/diem-chuan\/[^/]+$/.test(path)
        )
            return "admin";
        if (
            method === "POST" &&
            /^\/diem-chuan\/[^/]+\/diem-trung-tuyen$/.test(path)
        )
            return "admin";
        if (method === "GET" && path === "/ho-so/cua-toi") return "candidate";
        if (method === "PUT" && path === "/ho-so/cua-toi/thu-tu") return "candidate";
        if (method === "PUT" && /^\/ho-so\/cua-toi\/[^/]+\/nganh$/.test(path)) return "candidate";
        if (method === "DELETE" && /^\/ho-so\/cua-toi\/[^/]+$/.test(path))
            return "candidate";
        if (
            method === "PATCH" &&
            /^\/xet-tuyen\/[^/]+\/bat-dau-xu-ly$/.test(path)
        )
            return "admin";
        if (
            method === "POST" &&
            (/^\/xet-tuyen\/[^/]+\/chot-diem$/.test(path) ||
                path === "/xet-tuyen/chot-ket-qua" ||
                path === "/ho-so/cong-bo-ket-qua")
        )
            return "admin";
        if (
            method === "GET" &&
            ["/ho-so/tra-cuu", "/ho-so/ket-qua/tra-cuu"].includes(path)
        )
            return "candidate";
        if (method === "POST" && path === "/ho-so") return "candidate";
        if (method === "GET" && /^\/ho-so\/cua-toi\/[^/]+$/.test(path))
            return "candidate";
        if (method === "POST" && path === "/diem/quy-doi") return "session";
        if (
            method === "GET" &&
            (/^\/ho-so(\/[^/]+)?$/.test(path) ||
                /^\/thong-ke\/(tong-quan|nganh-hoc|xet-tuyen)$/.test(path) ||
                path === "/bao-cao/trung-tuyen")
        )
            return "admin";
        if (
            method === "PATCH" &&
            /^\/ho-so\/[^/]+\/(duyet|tu-choi)$/.test(path)
        )
            return "admin";
    }
    return null;
}

/** API trung gian dùng chung cho GET/POST/PUT/PATCH/DELETE từ trình duyệt.
 * Quyền được chọn tại server; dữ liệu được chuyển tiếp qua backendRequest thay vì tin quyền do client gửi. */
async function handle(
    request: NextRequest,
    context: { params: Promise<{ service: string; path: string[] }> },
) {
    try {
        enforceSameOrigin(request);
        const { service, path: segments } = await context.params;
        const path = "/" + segments.map(encodeURIComponent).join("/");
        const auth = policy(service, path, request.method);
        if (!auth)
            return privateJson(
                { success: false, message: "Endpoint không được hỗ trợ" },
                { status: 404 },
            );
        if (service === "ai" && auth === "public") publicApiLimiter.check("public-ai", 120);
        if (service === "score" && path === "/diem/tinh-diem-doi-soat") publicApiLimiter.check("public-score-calculator", 60);
        if (service === "score" && path === "/ho-so/tra-cuu-cong-khai") publicApiLimiter.check("public-dossier-lookup", 30);
        if (
            service === "score" &&
            auth === "public" &&
            path !== "/diem/tinh-diem-doi-soat" &&
            path !== "/ho-so/tra-cuu-cong-khai" &&
            !request.nextUrl.searchParams.get("ma_ho_so") &&
            !request.nextUrl.searchParams.get("cccd")
        ) {
            return privateJson(
                { message: "Cần mã hồ sơ hoặc CCCD để tra cứu" },
                { status: 400 },
            );
        }
        // Cho phép thân yêu cầu rỗng khi phù hợp (ví dụ DELETE), nhưng vẫn giới hạn JSON đầu vào.
        const body = request.method === "GET" ? undefined : await readBoundedJson(request, path === "/ho-so/tra-cuu-cong-khai" ? 1024 : path === "/diem/tinh-diem-doi-soat" ? 4096 : 100_000, true);
        if (service === "score") {
            const response = await cutoffApi(request, path, body);
            if (response) return response;
        }
        if (service === "score" && path === "/ho-so/cua-toi/don-minh-chung" && request.method === "POST") {
            await retryWithdrawnEvidence();
            return privateJson({ success: true });
        }
        if (service === "score" && request.method === "DELETE" && /^\/ho-so\/cua-toi\/[^/]+$/.test(path))
            return privateJson(await withdrawWithEvidence(path));
        if (
            service === "ai" &&
            /^\/api\/predict\/(admission-chance|recommend-majors)$/.test(path)
        ) {
            // Chặn điểm ngoài 0–10 ở cửa vào Next.js trước khi gọi dịch vụ dự báo AI.
            const scores = body?.academic_scores;
            if (
                !scores ||
                typeof scores !== "object" ||
                !Object.keys(scores).length ||
                Object.values(scores).some(
                    (v) =>
                        typeof v !== "number" ||
                        !Number.isFinite(v) ||
                        v < 0 ||
                        v > 10,
                )
            ) {
                return privateJson(
                    { message: "Điểm môn phải trong khoảng 0–10" },
                    { status: 400 },
                );
            }
        }
        if (
            service === "ai" &&
            path === "/api/chat/knowledge" &&
            request.method === "POST"
        ) {
            const admin = await adminService.getCurrentUser();
            if (!admin)
                return privateJson(
                    { message: "Chưa đăng nhập quản trị" },
                    { status: 401 },
                );
            if (!body) return privateJson({ success: false }, { status: 400 });
            // Tác giả tri thức lấy từ phiên đăng nhập thật, không lấy mã admin tùy ý từ trình duyệt.
            body.ma_admin_phu_trach = admin.ma_admin;
        }
        const data = await backendRequest(
            service as "ai" | "score",
            path + request.nextUrl.search,
            { method: request.method, body, auth },
        );
        return privateJson(data, {
            headers: { "Cache-Control": "no-store" },
        });
    } catch (err) {
        return apiFailure(err);
    }
}
export const GET = handle;
export const POST = handle;
export const PUT = handle;
export const PATCH = handle;
export const DELETE = handle;

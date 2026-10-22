// Read-only live smoke checks. No test users, dossiers or decisions are created.
const fs = require("node:fs");
const path = require("node:path");
const { Client } = require("pg");
const { SignJWT } = require("jose");
const dotenv = require("dotenv");
const root = path.resolve(__dirname, "..");
const env = dotenv.parse(fs.readFileSync(path.join(root, ".env")));
if (process.argv.includes("--configure-local-url")) {
    const file = path.join(root, ".env");
    let content = fs.readFileSync(file, "utf8");
    const setting = "API_APPLICATION_SCORE=http://127.0.0.1:8100";
    content = /^API_APPLICATION_SCORE\s*=/m.test(content)
        ? content.replace(/^API_APPLICATION_SCORE\s*=.*$/m, setting)
        : content.replace(/\s*$/, "\n") + setting + "\n";
    fs.writeFileSync(file, content);
    env.API_APPLICATION_SCORE = "http://127.0.0.1:8100";
    console.log(
        "Đã trỏ URL server Next.js tới backend điểm local cổng 8100. Không thay đổi cấu hình AI.",
    );
}
(async () => {
    const db = new Client({
        connectionString: env.DIRECT_URL,
        connectionTimeoutMillis: 15000,
    });
    await db.connect();
    try {
        const row = (
            await db.query(
                "SELECT a.ma_admin FROM public.admin a JOIN public.vai_tro v ON a.ma_vai_tro=v.ma_vai_tro WHERE v.ten_vai_tro IN ('super_admin','chuyen_vien') ORDER BY a.ma_admin LIMIT 1",
            )
        ).rows[0];
        if (!row) throw Error("Không có admin hiện hữu để kiểm tra read-only");
        const token = await new SignJWT({ userId: row.ma_admin })
            .setProtectedHeader({ alg: "HS256" })
            .setSubject(row.ma_admin)
            .setIssuedAt()
            .setExpirationTime("2m")
            .sign(new TextEncoder().encode(env.JWT_ACCESSTOKEN));
        const results = [];
        for (const endpoint of [
            "/health",
            "/ho-so",
            "/xet-tuyen/xem-truoc/2026",
            "/thong-ke/tong-quan?nam_tuyen_sinh=2026",
            "/bao-cao/trung-tuyen?nam_tuyen_sinh=2026",
        ]) {
            const response = await fetch("http://127.0.0.1:8100" + endpoint, {
                headers: { Authorization: `Bearer ${token}` },
                signal: AbortSignal.timeout(20000),
            });
            results.push({ endpoint, status: response.status });
            console.log(endpoint, response.status);
            if (!response.ok)
                throw Error(`API ${endpoint} trả HTTP ${response.status}`);
        }
        const unauthorized = await fetch("http://127.0.0.1:8100/ho-so");
        if (unauthorized.status !== 401)
            throw Error("API admin chưa chặn truy cập không token");
        results.push({
            endpoint: "/ho-so (không token)",
            status: unauthorized.status,
        });
        const configured = (
            env.API_APPLICATION_SCORE ||
            env.NEXT_PUBLIC_API_APPLICATION_SCORE ||
            ""
        ).replace(/\/$/, "");
        console.log(
            "URL frontend trỏ backend đang chạy:",
            ["http://127.0.0.1:8100", "http://localhost:8100"].includes(
                configured,
            ),
        );
        fs.writeFileSync(
            path.resolve(
                root,
                "../docs/supabase-audit/migration-20261020-api-check.json",
            ),
            JSON.stringify(
                { at: new Date().toISOString(), read_only: true, results },
                null,
                2,
            ),
        );
    } finally {
        await db.end();
    }
})().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
});

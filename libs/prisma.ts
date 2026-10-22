import { PrismaClient } from "@/app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

type Connection = { client: PrismaClient; pool: Pool };
const shared = globalThis as typeof globalThis & {
    admissionConnections?: Partial<Record<"admin" | "public", Connection>>;
};
function databaseUrl(name: "DATABASE_URL" | "DATABASE_URL_PUBLIC"): string {
    const value = process.env[name];
    if (!value) throw new Error(`Thiếu cấu hình ${name}`);
    try {
        const url = new URL(value);
        if (!["postgres:", "postgresql:"].includes(url.protocol) || !url.hostname) throw new Error();
        // Giữ query hiện có; không nối thêm dấu ? làm hỏng connection string.
        if (name === "DATABASE_URL_PUBLIC" && !url.searchParams.has("pgbouncer")) url.searchParams.set("pgbouncer", "true");
        return url.toString();
    } catch { throw new Error(`Cấu hình ${name} không hợp lệ`); }
}
function connection(role: "admin" | "public"): Connection {
    const cache = shared.admissionConnections ??= {};
    const existing = cache[role];
    if (existing) return existing;
    // Cache cả pool lẫn client trước khi cấp phát, trong production và HMR.
    const pool = new Pool({
        connectionString: databaseUrl(role === "admin" ? "DATABASE_URL" : "DATABASE_URL_PUBLIC"),
        ssl: { rejectUnauthorized: false },
        connectionTimeoutMillis: 10_000,
        idleTimeoutMillis: 30_000,
    });
    pool.on("error", () => {
        // pg loại kết nối idle đã hỏng; không log URL/mật khẩu hoặc ném lỗi ngoài request.
        console.error(`[database:${role}] Kết nối nhàn rỗi bị ngắt; pool sẽ tạo kết nối mới khi cần.`);
    });
    const client = new PrismaClient({ adapter: new PrismaPg(pool) });
    return cache[role] = { client, pool };
}
const prisma = connection("admin").client;
const prismaPublic = connection("public").client;
export default prisma;
export { prismaPublic };

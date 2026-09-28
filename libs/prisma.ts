// lib/prisma.ts
import { PrismaClient } from "@/app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

// --- Client admin (full quyền) - dùng cho seed, migrate, sau này là trang admin ---
const poolAdmin = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});
const adapter = new PrismaPg(poolAdmin);

const globalForPrisma = global as unknown as { prisma2: PrismaClient };
const prisma = globalForPrisma.prisma2 || new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma2 = prisma;

// --- Client public (chỉ SELECT) - dùng cho toàn bộ phần web công khai ---
const publicUrl = process.env.DATABASE_URL_PUBLIC?.includes("pgbouncer=true")
    ? process.env.DATABASE_URL_PUBLIC
    : `${process.env.DATABASE_URL_PUBLIC}?pgbouncer=true`;

const poolPublic = new Pool({
    connectionString: publicUrl,
    ssl: { rejectUnauthorized: false }
});
const adapterPublic = new PrismaPg(poolPublic);

const globalForPrismaPublic = global as unknown as {
    prismaPublic2: PrismaClient;
};

const prismaPublic =
    globalForPrismaPublic.prismaPublic2 ||
    new PrismaClient({ adapter: adapterPublic });

if (process.env.NODE_ENV !== "production") {
    globalForPrismaPublic.prismaPublic2 = prismaPublic;
}

export default prisma; // giữ default export cho prisma (admin) - không phá code cũ đang import
export { prismaPublic }; // named export riêng cho bản public


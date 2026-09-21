// lib/prisma.ts
import { PrismaClient } from "@/app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

// --- Client admin (full quyền) - dùng cho seed, migrate, sau này là trang admin ---
const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL,
});

const globalForPrisma = global as unknown as { prisma2: PrismaClient };

const prisma = globalForPrisma.prisma2 || new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma2 = prisma;

// --- Client public (chỉ SELECT) - dùng cho toàn bộ phần web công khai ---
const adapterPublic = new PrismaPg({
    connectionString: process.env.DATABASE_URL_PUBLIC,
});

const globalForPrismaPublic = global as unknown as {
    prismaPublic2: PrismaClient;
};

const prismaPublic =
    globalForPrismaPublic.prismaPublic2 ||
    new PrismaClient({ adapter: adapterPublic }); // sửa đúng key "adapter"

if (process.env.NODE_ENV !== "production") {
    globalForPrismaPublic.prismaPublic2 = prismaPublic;
}

export default prisma; // giữ default export cho prisma (admin) - không phá code cũ đang import
export { prismaPublic }; // named export riêng cho bản public

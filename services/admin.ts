import { Prisma, PrismaClient } from "@/app/generated/prisma/client";
import prisma from "@/libs/prisma";

export const adminService = {
    isValidAdmin: async (
        ma_admin: string,
        client: Prisma.TransactionClient | PrismaClient = prisma,
    ) => {
        try {
            const admin = await client.admin.findFirstOrThrow({
                where: {
                    ma_admin: ma_admin,
                },
            });
            if (!admin) return false;

            return true;
        } catch {
            return false;
        }
    },
};

import prisma, { prismaPublic } from "@/libs/prisma";

export const danhMucMonService = {
    getAll: async () => {
        return await prismaPublic.danhMucMonHoc.findMany({
            orderBy: {
                ma_mon: "asc",
            },
        });
    },

    create: async (ma_mon: string, ten_mon: string) => {
        return await prisma.danhMucMonHoc.create({
            data: {
                ma_mon,
                ten_mon
            }
        });
    },

    update: async (ma_mon: string, ten_mon: string) => {
        return await prisma.danhMucMonHoc.update({
            where: { ma_mon },
            data: {
                ten_mon
            }
        });
    },

    delete: async (ma_mon: string) => {
        return await prisma.danhMucMonHoc.delete({
            where: { ma_mon }
        });
    }
};

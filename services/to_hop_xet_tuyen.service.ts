import prisma, { prismaPublic } from "@/libs/prisma";

export const toHopXetTuyenService = {
    getAll: async () => {
        return await prismaPublic.toHopXetTuyen.findMany({
            include: {
                mon_1: true,
                mon_2: true,
                mon_3: true,
                _count: {
                    select: { ctdt_to_hop: true }
                }
            },
            orderBy: {
                ma_to_hop: "asc",
            },
        });
    },

    create: async (ma_to_hop: string, ma_mon_1: string, ma_mon_2: string, ma_mon_3: string) => {
        return await prisma.toHopXetTuyen.create({
            data: {
                ma_to_hop,
                ma_mon_1,
                ma_mon_2,
                ma_mon_3
            }
        });
    },

    update: async (ma_to_hop: string, ma_mon_1: string, ma_mon_2: string, ma_mon_3: string) => {
        return await prisma.toHopXetTuyen.update({
            where: { ma_to_hop },
            data: {
                ma_mon_1,
                ma_mon_2,
                ma_mon_3
            }
        });
    },

    delete: async (ma_to_hop: string) => {
        return await prisma.toHopXetTuyen.delete({
            where: { ma_to_hop }
        });
    },

    getProgramsByToHop: async (ma_to_hop: string) => {
        return await prismaPublic.ctdtToHop.findMany({
            where: { ma_to_hop },
            include: {
                chuong_trinh: true
            },
            orderBy: {
                nam: "desc"
            }
        });
    },

    addProgramToToHop: async (ma_to_hop: string, ma_chuong_trinhs: string[], nam: number) => {
        return await prisma.ctdtToHop.createMany({
            data: ma_chuong_trinhs.map(ma => ({
                ma_to_hop,
                ma_chuong_trinh: ma,
                nam
            })),
            skipDuplicates: true // In case they are already added
        });
    },

    removeProgramFromToHop: async (ma_ctdt_to_hop: string) => {
        return await prisma.ctdtToHop.delete({
            where: { ma_ctdt_to_hop }
        });
    }
};

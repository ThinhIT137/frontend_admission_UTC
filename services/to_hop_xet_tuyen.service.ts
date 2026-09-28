import { prismaPublic } from "@/libs/prisma";

export const toHopXetTuyenService = {
    getAll: async () => {
        return await prismaPublic.toHopXetTuyen.findMany({
            include: {
                mon_1: true,
                mon_2: true,
                mon_3: true,
            },
            orderBy: {
                ma_to_hop: "asc",
            },
        });
    },
};

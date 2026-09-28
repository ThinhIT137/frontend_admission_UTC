import { adminService } from "./user.service";
import prisma, { prismaPublic } from "@/libs/prisma";

export const khoiNganhService = {
    getAll: async () => {
        return await prismaPublic.khoiNganh.findMany({
            include: {
                _count: {
                    select: { nganh_hoc: true },
                },
            },
            orderBy: {
                ma_khoi_nganh: "asc",
            },
        });
    },

    create: async (ma_khoi_nganh: string, ten_khoi_nganh: string, ma_admin: string) => {
        return await prisma.$transaction(async (tx) => {
            if (!(await adminService.isValidAdmin(ma_admin, tx))) {
                throw new Error("Admin không tồn tại");
            }
            return await tx.khoiNganh.create({
                data: {
                    ma_khoi_nganh,
                    ten_khoi_nganh,
                },
            });
        });
    },

    update: async (ma_khoi_nganh_cu: string, ma_khoi_nganh_moi: string, ten_khoi_nganh: string, ma_admin: string) => {
        return await prisma.$transaction(async (tx) => {
            if (!(await adminService.isValidAdmin(ma_admin, tx))) {
                throw new Error("Admin không tồn tại");
            }
            return await tx.khoiNganh.update({
                where: { ma_khoi_nganh: ma_khoi_nganh_cu },
                data: {
                    ma_khoi_nganh: ma_khoi_nganh_moi,
                    ten_khoi_nganh,
                },
            });
        });
    },

    delete: async (ma_khoi_nganh: string, ma_admin: string) => {
        return await prisma.$transaction(async (tx) => {
            if (!(await adminService.isValidAdmin(ma_admin, tx))) {
                throw new Error("Admin không tồn tại");
            }
            return await tx.khoiNganh.delete({
                where: { ma_khoi_nganh },
            });
        });
    },
};

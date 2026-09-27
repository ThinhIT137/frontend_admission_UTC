import {
    ChuongTrinhDaoTaoCreate,
    ChuongTrinhDaoTaoProps,
    ChuongTrinhDaoTaoUpdate,
} from "@/libs/chuong_trinh_dao_tao/chuongTrinhDaoTaoProps";
import { paginationRequest } from "@/libs/pagination";
import prisma, { prismaPublic } from "@/libs/prisma";
import { adminService } from "./user.service";

export const chuongTrinhDaoTaoService = {
    /*====================================================================
        getTotal
    ====================================================================*/
    getTotal: async () => {
        return await prismaPublic.chuongTrinhDaoTao.count();
    },

    /*====================================================================
        get phân trang
    ====================================================================*/
    get: async ({
        page,
        pageSize,
    }: paginationRequest): Promise<ChuongTrinhDaoTaoProps[]> => {
        const data = await prismaPublic.chuongTrinhDaoTao.findMany({
            skip: (page - 1) * pageSize,
            take: pageSize,
            orderBy: { create_at: "desc" },
        });

        return data;
    },

    /*====================================================================
        getByNganh
    ====================================================================*/
    getByNganh: async (ma_nganh: string): Promise<ChuongTrinhDaoTaoProps[]> => {
        return await prismaPublic.chuongTrinhDaoTao.findMany({
            where: { ma_nganh },
            orderBy: { create_at: "desc" },
        });
    },

    /*====================================================================
        create
    ====================================================================*/
    create: async ({
        ma_nganh,
        ten_chuong_trinh,
        de_cuong,
        chuan_dau_ra,
        ma_admin_quan_ly,
    }: ChuongTrinhDaoTaoCreate) => {
        await prisma.$transaction(async (tx) => {
            if (!(await adminService.isValidAdmin(ma_admin_quan_ly, tx))) {
                throw new Error("admin không tồn tại");
            }

            const nganh = await tx.nganhHoc.findUnique({
                where: { ma_nganh },
            });
            if (!nganh) {
                throw new Error("Ngành học không tồn tại");
            }

            await tx.chuongTrinhDaoTao.create({
                data: {
                    ma_nganh,
                    ten_chuong_trinh,
                    de_cuong,
                    chuan_dau_ra,
                    ma_admin_quan_ly,
                },
            });
        });
    },

    /*====================================================================
        update
    ====================================================================*/
    update: async (
        ma_chuong_trinh: string,
        {
            ma_nganh,
            ten_chuong_trinh,
            de_cuong,
            chuan_dau_ra,
            ma_admin_quan_ly,
        }: ChuongTrinhDaoTaoUpdate,
    ): Promise<ChuongTrinhDaoTaoProps> => {
        return await prisma.$transaction(async (tx) => {
            if (!(await adminService.isValidAdmin(ma_admin_quan_ly, tx))) {
                throw new Error("admin không tồn tại");
            }

            if (ma_nganh) {
                const nganh = await tx.nganhHoc.findUnique({
                    where: { ma_nganh },
                });
                if (!nganh) {
                    throw new Error("Ngành học không tồn tại");
                }
            }

            return await tx.chuongTrinhDaoTao.update({
                where: { ma_chuong_trinh },
                data: {
                    ma_nganh,
                    ten_chuong_trinh,
                    de_cuong,
                    chuan_dau_ra,
                    ma_admin_quan_ly,
                },
            });
        });
    },

    /*====================================================================
        delete
    ====================================================================*/
    delete: async (ma_chuong_trinh: string, ma_admin: string) => {
        await prisma.$transaction(async (tx) => {
            if (!(await adminService.isValidAdmin(ma_admin, tx))) {
                throw new Error("admin không tồn tại");
            }

            await tx.chuongTrinhDaoTao.delete({
                where: { ma_chuong_trinh },
            });
        });
    },
};

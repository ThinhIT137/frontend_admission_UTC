import {
    nganhHocCreate,
    nganhHocProps,
    nganhHocUpdate,
} from "@/libs/nganh_hoc/nganhHocProps";
import { paginationRequest } from "@/libs/pagination";
import prisma, { prismaPublic } from "@/libs/prisma";
import { adminService } from "./user.service";

export const nganhHocService = {
    /*====================================================================
        getTotal
    ====================================================================*/
    getTotal: async () => {
        return await prismaPublic.nganhHoc.count();
    },
    /*====================================================================
        get
    ====================================================================*/
    get: async ({
        page,
        pageSize,
    }: paginationRequest): Promise<nganhHocProps[]> => {
        const data = await prismaPublic.nganhHoc.findMany({
            skip: (page - 1) * pageSize,
            take: pageSize,
        });

        if (!data || data.length === 0) {
            throw new Error("Dữ liệu ngành học không tồn tại");
        }

        return data;
    },
    /*====================================================================
        create
    ====================================================================*/
    create: async ({
        ma_nganh,
        ten_nganh,
        khoi_kien_thuc,
        ma_admin_quan_ly,
    }: nganhHocCreate) => {
        await prisma.$transaction(async (tx) => {
            if (!(await adminService.isValidAdmin(ma_admin_quan_ly, tx))) {
                throw new Error("admin không tồn tại");
            }

            await tx.nganhHoc.create({
                data: {
                    ma_nganh,
                    ten_nganh,
                    khoi_kien_thuc,
                    ma_admin_quan_ly,
                },
            });
        });
    },
    /*====================================================================
        update
    ====================================================================*/
    update: async (
        ma_nganh: string,
        {
            ma_nganh_moi,
            ten_nganh,
            khoi_kien_thuc,
            ma_admin_quan_ly,
        }: nganhHocUpdate,
    ): Promise<nganhHocProps> => {
        return await prisma.$transaction(async (tx) => {
            if (!(await adminService.isValidAdmin(ma_admin_quan_ly, tx))) {
                throw new Error("admin không tồn tại");
            }

            return await tx.nganhHoc.update({
                where: { ma_nganh },
                data: {
                    ma_nganh: ma_nganh_moi,
                    ten_nganh,
                    khoi_kien_thuc,
                    ma_admin_quan_ly,
                },
            });
        });
    },
    /*====================================================================
        delete
    ====================================================================*/
    delete: async (ma_nganh: string, ma_admin: string) => {
        await prisma.$transaction(async (tx) => {
            if (!(await adminService.isValidAdmin(ma_admin, tx))) {
                throw new Error("admin không tồn tại");
            }

            await tx.nganhHoc.delete({
                where: { ma_nganh: ma_nganh },
            });
        });
    },
};

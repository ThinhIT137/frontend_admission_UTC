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
        get — Truy vấn ngành học (5 bộ lọc)
        term → Fuzzy Search 
        faculty → Khoa/Viện 
        toHop → Tổ hợp
        diemChuan → Mức điểm  
        year → Năm tuyển sinh
    ====================================================================*/
    get: async ({
        page,
        pageSize,
        term,
        toHop,
        diemChuan,
        faculty,
        year,
    }: paginationRequest & {
        term: string;
        toHop: string;
        diemChuan: number;
        faculty: string;
        year: number;
    }) => {
        const data = await prismaPublic.nganhHoc.findMany({
            include: {
                chuong_trinh: {
                    include: {
                        lich_su_diem_chuan: {
                            include: {
                                diem_trung_tuyen: {
                                    include: {
                                        phuong_thuc: true,
                                    },
                                },
                            },
                        },
                    },
                },
                khoi_nganh: true,
            },
        });

        if (faculty) {
            return data.filter((item) => item.ma_khoi_nganh === faculty);
        }

        return data;
    },
    /*====================================================================
        create
    ====================================================================*/
        create: async ({
        ma_nganh,
        ten_nganh,
        ma_khoi_nganh,
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
                    ma_khoi_nganh,
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
            ma_khoi_nganh,
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
                    ma_khoi_nganh,
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

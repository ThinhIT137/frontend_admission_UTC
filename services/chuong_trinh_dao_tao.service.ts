import {
    ChuongTrinhDaoTaoCreate,
    ChuongTrinhDaoTaoProps,
    ChuongTrinhDaoTaoUpdate,
} from "@/libs/chuong_trinh_dao_tao/chuongTrinhDaoTaoProps";
import { paginationRequest } from "@/libs/pagination";
import prisma, { prismaPublic } from "@/libs/prisma";
import { adminService } from "./user.service";

const normalize = (s: string) =>
    s
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/đ/g, "d")
        .replace(/Đ/g, "D")
        .toLowerCase()
        .trim();

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
        get — Truy vấn ngành học (5 bộ lọc)
        term → Fuzzy Search 
        faculty → Khoa/Viện 
        toHop → Tổ hợp
        diemChuan → Mức điểm  
        year → Năm tuyển sinh
    ====================================================================*/
    getFilter: async ({
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
        const data = await prismaPublic.chuongTrinhDaoTao.findMany({
            where: {
                ...(faculty && { nganh: { ma_khoi_nganh: faculty } }),
                ...(toHop && {
                    ctdt_to_hop: { some: { ma_to_hop: toHop } },
                }),
                lich_su_diem_chuan: { some: { nam: year } },
            },
            include: {
                nganh: { include: { khoi_nganh: true } },
                ctdt_to_hop: true,
                lich_su_diem_chuan: {
                    include: {
                        diem_trung_tuyen: { include: { phuong_thuc: true } },
                    },
                },
            },
            orderBy: { ma_chuong_trinh: "asc" },
        });

        // 2. diemChuan lọc ở JS: lấy chương trình có điểm chuẩn <= điểm của thí sinh
        let rows = data;
        // if (diemChuan != null && phuongThuc) {
        //     rows = rows.filter((r) =>
        //         r.lich_su_diem_chuan[0].diem_trung_tuyen.some(
        //             (d) =>
        //                 d.ma_phuong_thuc === phuongThuc && d.diem <= diemChuan,
        //         ),
        //     );
        // }

        // 3. term: tìm không dấu, mọi từ đều phải xuất hiện, xếp theo độ khớp
        if (term?.trim()) {
            const tokens = normalize(term).split(/\s+/);
            rows = rows
                .map((r) => {
                    const name = normalize(
                        `${r.ten_chuong_trinh} ${r.nganh.ten_nganh}`,
                    );
                    const code = r.ma_chuong_trinh.toLowerCase();
                    const hit = tokens.every(
                        (t) => name.includes(t) || code.includes(t),
                    );
                    const score = hit
                        ? (name.startsWith(tokens[0]) ? 2 : 1) +
                        (name.includes(normalize(term)) ? 1 : 0)
                        : 0;
                    return { r, score };
                })
                .filter((x) => x.score > 0)
                .sort((a, b) => b.score - a.score)
                .map((x) => x.r);
        }

        // 4. phân trang + pivot điểm theo phương thức
        const total = rows.length;
        const pageRows = rows.slice((page - 1) * pageSize, page * pageSize);

        return { data: pageRows, total, page, pageSize };
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
        ma_chuong_trinh,
        ma_nganh,
        ten_chuong_trinh,
        de_cuong,
        chuan_dau_ra,
        mo_ta_ngan,
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

            return await tx.chuongTrinhDaoTao.create({
                data: {
                    ma_chuong_trinh,
                    ma_nganh,
                    ten_chuong_trinh,
                    de_cuong,
                    chuan_dau_ra: chuan_dau_ra || [],
                    mo_ta_ngan,
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
            mo_ta_ngan,
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

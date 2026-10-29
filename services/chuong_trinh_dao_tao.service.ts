import {
    ChuongTrinhDaoTaoCreate,
    ChuongTrinhDaoTaoProps,
    ChuongTrinhDaoTaoUpdate,
} from "@/libs/chuong_trinh_dao_tao/chuongTrinhDaoTaoProps";
import { paginationRequest } from "@/libs/pagination";
import prisma, { prismaPublic } from "@/libs/prisma";
import { adminService } from "./user.service";
import type { Prisma } from "@/app/generated/prisma/client";

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
        phuongThuc = "PT1",
        faculty,
        year,
        sort = "score-desc",
    }: paginationRequest & {
        term: string;
        toHop: string;
        diemChuan: number;
        phuongThuc?: string;
        faculty: string;
        year: number;
        sort?: string;
    }) => {
        const sortOption = ["default", "score-desc", "score-asc", "quota-desc", "name-asc", "name-desc"].includes(sort) ? sort : "score-desc";
        if (diemChuan > 0 && !Number.isFinite(diemChuan)) throw new Error("Điểm không hợp lệ");
        // Lọc điểm tại DB, chỉ đối chiếu đúng năm và phương thức.
        const where = {
            ...(faculty && { nganh: { ma_khoi_nganh: faculty } }),
            ...(toHop && { ctdt_to_hop: { some: { ma_to_hop: toHop, nam: year } } }),
            ...(diemChuan > 0 ? { lich_su_diem_chuan: { some: {
                nam: year,
                ...(diemChuan > 0 && { diem_trung_tuyen: { some: {
                    ma_phuong_thuc: phuongThuc, diem: { gt: 0, lte: diemChuan },
                } } }),
            } } } : { OR: [
                { lich_su_diem_chuan: { some: { nam: year } } },
                { du_doan_diem_chuan: { some: { nam_du_doan: year } } },
            ] }),
        };
        // Chỉ lấy dữ liệu công khai dùng trên thẻ ngành, bỏ trường quản trị và khung môn.
        const select = {
            ma_chuong_trinh: true, ma_nganh: true, ten_chuong_trinh: true, de_cuong: true,
            nganh: { select: { ten_nganh: true, khoi_kien_thuc: true } },
            ctdt_to_hop: { where: { nam: year }, select: { ma_to_hop: true } },
            lich_su_diem_chuan: {
                where: { nam: year },
                orderBy: { nam: "desc" as const },
                select: { nam: true, chi_tieu: true, diem_trung_tuyen: {
                    where: { ma_phuong_thuc: phuongThuc }, select: { diem: true, ma_phuong_thuc: true, phuong_thuc: { select: { ten_phuong_thuc: true } } },
                } },
            },
            du_doan_diem_chuan: { where: { nam_du_doan: year },
                orderBy: [{ ngay_tinh_toan: "desc" }, { ma_du_doan_dc: "asc" }],
                select: { ma_du_doan_dc: true, nam_du_doan: true, diem_du_doan: true, ngay_tinh_toan: true } },
        } satisfies Prisma.ChuongTrinhDaoTaoSelect;
        // Không tìm chữ: phân trang ngay trong DB. Có tìm chữ: giữ tìm không dấu
        // và xếp độ khớp bằng JS để bảo toàn kết quả tìm kiếm hiện có.
        if (!term?.trim() && sortOption === "default") {
            const [data, total] = await Promise.all([
                prismaPublic.chuongTrinhDaoTao.findMany({ where, select,
                    orderBy: { ma_chuong_trinh: "asc" }, skip: (page - 1) * pageSize, take: pageSize }),
                prismaPublic.chuongTrinhDaoTao.count({ where }),
            ]);
            return { data, total, page, pageSize };
        }
        const data = await prismaPublic.chuongTrinhDaoTao.findMany({
            where, select, orderBy: { ma_chuong_trinh: "asc" },
        });

        let rows = data;
        // 3. term: tìm không dấu, mọi từ đều phải xuất hiện, xếp theo độ khớp
        if (term?.trim()) {
            const tokens = normalize(term).split(/\s+/);
            rows = rows
                .map((r) => {
                    const name = normalize(
                        `${r.ten_chuong_trinh} ${r.nganh.ten_nganh}`,
                    );
                    const code = normalize(`${r.ma_chuong_trinh} ${r.ma_nganh}`);
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

        // Sắp xếp toàn bộ kết quả trước khi phân trang, không chỉ 9 thẻ đang hiển thị.
        const codeCollator = new Intl.Collator("vi", { numeric: true });
        const nameCollator = new Intl.Collator("vi");
        const compareNullable = (a: number | null, b: number | null, descending: boolean) => {
            if (a === null) return b === null ? 0 : 1;
            if (b === null) return -1;
            return descending ? b - a : a - b;
        };
        const officialScore = (row: typeof data[number]) => {
            const score = row.lich_su_diem_chuan.find(history => history.nam === year)?.diem_trung_tuyen
                .find(item => item.ma_phuong_thuc === phuongThuc && Number.isFinite(item.diem) && item.diem > 0)?.diem;
            return score ?? null;
        };
        const quota = (row: typeof data[number]) => {
            const value = row.lich_su_diem_chuan.find(history => history.nam === year)?.chi_tieu;
            return value != null && Number.isFinite(value) && value >= 0 ? value : null;
        };
        rows.sort((a, b) => {
            let result = 0;
            if (sortOption === "score-desc" || sortOption === "score-asc") {
                result = compareNullable(officialScore(a), officialScore(b), sortOption === "score-desc");
            } else if (sortOption === "quota-desc") {
                result = compareNullable(quota(a), quota(b), true);
            } else if (sortOption === "name-asc" || sortOption === "name-desc") {
                result = nameCollator.compare(a.ten_chuong_trinh, b.ten_chuong_trinh) * (sortOption === "name-desc" ? -1 : 1);
            }
            return result || codeCollator.compare(a.ma_chuong_trinh, b.ma_chuong_trinh);
        });

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
                    mo_ta_ngan,
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

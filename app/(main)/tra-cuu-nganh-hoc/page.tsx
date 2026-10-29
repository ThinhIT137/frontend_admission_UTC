import MajorLookupClient from "./MajorLookupClient";
import { chuongTrinhDaoTaoService } from "@/services/chuong_trinh_dao_tao.service";
import { khoiNganhService } from "@/services/khoi_nganh.service";
import { toHopXetTuyenService } from "@/services/to_hop_xet_tuyen.service";
import { prismaPublic } from "@/libs/prisma";
export type { MajorFromApi } from "./MajorLookupClient";

type Search = Record<string, string | string[] | undefined>;
const single = (value: string | string[] | undefined) => typeof value === "string" ? value : value?.[0] ?? "";
export const metadata = { title: "Tra cứu chương trình đào tạo" };

export default async function MajorLookupPage({ searchParams }: { searchParams: Promise<Search> }) {
    const params = await searchParams;
    const requestedYear = Number(single(params.year));
    const year = Number.isInteger(requestedYear) && requestedYear >= 2000 && requestedYear <= new Date().getFullYear() + 5 ? requestedYear : new Date().getFullYear();
    const requestedMethod = single(params.phuongThuc) || single(params.method);
    const filters = {
        page: 1, pageSize: 9, term: single(params.term),
        sort: ["default", "score-desc", "score-asc", "quota-desc", "name-asc", "name-desc"].includes(single(params.sort)) ? single(params.sort) : "score-desc",
        faculty: single(params.faculty) || single(params.khoi) || single(params.khoi_nganh),
        toHop: "", diemChuan: 0, year, phuongThuc: /^PT[1-5]$/.test(requestedMethod) ? requestedMethod : "PT1",
    };
    // Ba truy vấn độc lập chạy song song trên server; HTML đã có các thẻ ngành.
    const [programs, faculties, combinations, years, methods] = await Promise.allSettled([
        chuongTrinhDaoTaoService.getFilter(filters), khoiNganhService.getAll(), toHopXetTuyenService.getAll(),
        prismaPublic.lichSuDiemChuan.findMany({ distinct: ["nam"], select: { nam: true }, orderBy: { nam: "desc" } }),
        prismaPublic.phuongThucXetTuyen.findMany({ select: { ma_phuong_thuc: true, ten_phuong_thuc: true }, orderBy: { ma_phuong_thuc: "asc" } }),
    ]);
    for (const result of [programs, faculties, combinations]) {
        if (result.status === "rejected") console.error("Không tải được dữ liệu tra cứu:", result.reason);
    }
    return <MajorLookupClient key={JSON.stringify(filters)} initialFilters={filters}
        initialResult={programs.status === "fulfilled" ? programs.value : null}
        faculties={faculties.status === "fulfilled" ? faculties.value : []}
        combinations={combinations.status === "fulfilled" ? combinations.value : []}
        availableYears={years.status === "fulfilled" ? years.value.map(item => item.nam) : []}
        methods={methods.status === "fulfilled" ? methods.value : []}
        initialError={[programs, faculties, combinations].some(result => result.status === "rejected")
            ? "Không thể tải đầy đủ dữ liệu tra cứu. Vui lòng tải lại trang." : ""} />;
}

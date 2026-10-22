import type { CandidateRecord } from "@/app/admin/(dashboard)/bao-cao-trung-tuyen/BaoCaoClient";
import { backendRequest } from "@/libs/api-services/backend.server";
import "server-only";

// Dòng báo cáo gốc của backend điểm; dữ liệu này sẽ được chuyển sang kiểu CandidateRecord.
type ReportRow = {
    ma_ho_so: string;
    cccd: string;
    ho_ten: string;
    so_dien_thoai?: string;
    khu_vuc?: string;
    doi_tuong_uu_tien?: string;
    ma_chuong_trinh: string;
    ten_chuong_trinh: string;
    ma_phuong_thuc: string;
    ten_phuong_thuc: string;
    ma_to_hop?: string;
    tong_diem_xet_tuyen: number | null;
    diem_chuan: number | null;
    trang_thai: string;
    ket_qua: string;
    ngay_nop: string;
};
type Report = {
    du_lieu: ReportRow[];
    phan_trang: { total_pages: number; total: number };
};
/** Lấy đủ các trang báo cáo theo năm để màn hình và chức năng xuất dùng cùng một tập dữ liệu. */
export async function backendReport(year: number) {
    const first = await backendRequest<Report>(
        "score",
        `/bao-cao/trung-tuyen?nam_tuyen_sinh=${year}&page_size=100`,
        { auth: "admin" },
    );
    // Giới hạn khối lượng xuất để tránh gom một báo cáo quá lớn vào bộ nhớ server.
    if (first.phan_trang.total > 10000)
        throw Error(
            "Báo cáo vượt 10.000 dòng; cần giới hạn bộ lọc trước khi xuất",
        );
    const rows = [...first.du_lieu];
    // API có phân trang: chỉ lấy trang đầu sẽ làm thiếu thí sinh trong file xuất.
    for (let page = 2; page <= first.phan_trang.total_pages; page++) {
        rows.push(
            ...(
                await backendRequest<Report>(
                    "score",
                    `/bao-cao/trung-tuyen?nam_tuyen_sinh=${year}&page_size=100&page=${page}`,
                    { auth: "admin" },
                )
            ).du_lieu,
        );
    }
    // Ánh xạ tên trường và nhãn mà giao diện đang dùng; không suy ra kết quả bằng dự báo AI.
    const candidates: CandidateRecord[] = rows.map((r, i) => ({
        stt: i + 1,
        maHoSo: r.ma_ho_so,
        cccd: r.cccd,
        hoTen: r.ho_ten,
        ngaySinh: "Chưa có dữ liệu",
        gioiTinh: "Chưa có dữ liệu",
        soDienThoai: r.so_dien_thoai || "",
        khuVuc: r.khu_vuc || "",
        doiTuongUuTien: r.doi_tuong_uu_tien || "",
        maChuongTrinh: r.ma_chuong_trinh,
        tenChuongTrinh: r.ten_chuong_trinh,
        maPhuongThuc: r.ma_phuong_thuc,
        tenPhuongThuc: r.ten_phuong_thuc,
        maToHop: r.ma_to_hop || "",
        diemXetTuyen: r.tong_diem_xet_tuyen,
        diemChuanNganh: r.diem_chuan,
        trangThai:
            r.trang_thai === "trung_tuyen"
                ? "TRUNG_TUYEN_SO_BO"
                : r.trang_thai === "khong_trung_tuyen"
                  ? "CHUA_DAT"
                  : "CHO_XAC_NHAN",
        ngayNop: new Date(r.ngay_nop).toLocaleDateString("vi-VN", {
            timeZone: "Asia/Ho_Chi_Minh",
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        }),
    }));
    return {
        candidates,
        programs: [
            ...new Map(
                candidates.map((r) => [
                    r.maChuongTrinh,
                    {
                        maChuongTrinh: r.maChuongTrinh,
                        tenChuongTrinh: r.tenChuongTrinh,
                    },
                ]),
            ).values(),
        ],
        methods: [
            ...new Map(
                candidates.map((r) => [
                    r.maPhuongThuc,
                    {
                        maPhuongThuc: r.maPhuongThuc,
                        tenPhuongThuc: r.tenPhuongThuc,
                    },
                ]),
            ).values(),
        ],
    };
}

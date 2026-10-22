import { backendRequest } from "@/libs/api-services/backend.server";
import "server-only";
// Các kiểu bên dưới mô tả JSON do backend điểm trả về, không phải model Prisma.
type Overall = {
    tong_ho_so: number;
    hop_le: number;
    cho_xu_ly: number;
    tu_choi: number;
    tong_chi_tieu: number;
    tong_nganh: number;
    xu_huong_theo_ngay: Array<{ ngay: string; so_luong: number }>;
};
type Major = {
    ma_nganh: string;
    ten_nganh: string;
    chi_tieu: number;
    tong_ho_so: number;
    hop_le: number;
    ty_le_canh_tranh: number;
    ty_le_lap_day: number;
};
type Methods = {
    theo_phuong_thuc: Array<{
        ma_phuong_thuc: string;
        ten_phuong_thuc: string;
        tong_ho_so: number;
        ty_trong: number;
    }>;
    theo_to_hop: Array<{
        ma_to_hop: string;
        tong_ho_so: number;
        ty_trong: number;
    }>;
};
/** Lấy thống kê của một năm bằng phiên admin, rồi đổi tên trường cho biểu đồ giao diện. */
export async function backendStats(year: number) {
    const query = `?nam_tuyen_sinh=${year}`;
    // Ba báo cáo độc lập nên có thể lấy đồng thời; một yêu cầu lỗi thì cả hàm báo lỗi.
    const [o, majors, methods] = await Promise.all([
        backendRequest<Overall>("score", "/thong-ke/tong-quan" + query, {
            auth: "admin",
        }),
        backendRequest<Major[]>("score", "/thong-ke/nganh-hoc" + query, {
            auth: "admin",
        }),
        backendRequest<Methods>("score", "/thong-ke/xet-tuyen" + query, {
            auth: "admin",
        }),
    ]);
    // Chỉ đổi cấu trúc dữ liệu, không tự tính lại số hồ sơ hoặc tỷ lệ tuyển sinh ở Next.js.
    return {
        overall: {
            totalApplications: o.tong_ho_so,
            validCount: o.hop_le,
            pendingCount: o.cho_xu_ly,
            rejectedCount: o.tu_choi,
            totalQuota: o.tong_chi_tieu,
            totalMajors: o.tong_nganh,
        },
        majors: majors.map((m) => ({
            maNganh: m.ma_nganh,
            tenNganh: m.ten_nganh,
            tenKhoiNganh: "",
            chiTieu: m.chi_tieu,
            soHoSo: m.tong_ho_so,
            soHopLe: m.hop_le,
            tiLeChoi: m.ty_le_canh_tranh,
            tiLeLapDay: m.ty_le_lap_day,
        })),
        methods: methods.theo_phuong_thuc.map((m) => ({
            maPhuongThuc: m.ma_phuong_thuc,
            tenPhuongThuc: m.ten_phuong_thuc,
            soHoSo: m.tong_ho_so,
            tiLePhanTram: m.ty_trong,
        })),
        combinations: methods.theo_to_hop.map((m) => ({
            maToHop: m.ma_to_hop,
            soHoSo: m.tong_ho_so,
            tiLePhanTram: m.ty_trong,
        })),
        dailyTrends: o.xu_huong_theo_ngay.map((d) => ({
            ngay: d.ngay,
            soLuong: d.so_luong,
        })),
    };
}

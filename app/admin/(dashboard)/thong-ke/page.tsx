import { Suspense } from "react";
import prisma from "@/libs/prisma";
import ThongKeClient, {
  OverallStats,
  MajorStatItem,
  MethodStatItem,
  CombinationStatItem,
  DailyTrendItem,
} from "./ThongKeClient";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

export const metadata = {
  title: "Thống Kê Tổng Quan Tuyển Sinh K66 (Realtime DB) | UTC Admin",
  description:
    "Dashboard báo cáo thống kê tuyển sinh trích xuất trực tiếp từ Cơ sở dữ liệu Supabase UTC: chỉ tiêu K66, tỷ lệ lấp đầy, hồ sơ và phân tích phương thức.",
};

export const revalidate = 0; // Luôn nạp realtime trên trang Admin

export default async function ThongKePage() {
  let overall: OverallStats = {
    totalApplications: 0,
    validCount: 0,
    pendingCount: 0,
    rejectedCount: 0,
    totalQuota: 0,
    totalMajors: 0,
  };

  let majors: MajorStatItem[] = [];
  let methods: MethodStatItem[] = [];
  let combinations: CombinationStatItem[] = [];
  let dailyTrends: DailyTrendItem[] = [];

  try {
    // 1. Truy vấn đồng thời các bảng thực tế từ CSDL Supabase
    const [
      dbPrograms,
      dbMethods,
      dbCombinations,
      dbApplications,
      quota2026,
      quota2025,
      allYearScores,
    ] = await Promise.all([
      prisma.chuongTrinhDaoTao.findMany({
        include: {
          nganh: {
            include: {
              khoi_nganh: true,
            },
          },
          lich_su_diem_chuan: {
            where: { nam: { in: [2026, 2025] } },
            orderBy: { nam: "desc" },
            include: {
              diem_trung_tuyen: true,
            },
          },
          nguyen_vong: true,
          ctdt_to_hop: true,
        },
        orderBy: { ten_chuong_trinh: "asc" },
      }),
      prisma.phuongThucXetTuyen.findMany({
        include: {
          diem_trung_tuyen: true,
          nguyen_vong: true,
        },
      }),
      prisma.toHopXetTuyen.findMany({
        include: {
          ctdt_to_hop: true,
          nguyen_vong: true,
        },
      }),
      prisma.nguyenVongSinhVien.findMany({
        orderBy: { create_at: "asc" },
      }),
      prisma.lichSuDiemChuan.aggregate({
        where: { nam: 2026 },
        _sum: { chi_tieu: true },
      }),
      prisma.lichSuDiemChuan.aggregate({
        where: { nam: 2025 },
        _sum: { chi_tieu: true },
      }),
      prisma.diemTrungTuyen.findMany(),
    ]);

    const totalApplications = dbApplications.length;
    const validCount = dbApplications.filter((a) => a.trang_thai === "hop_le").length;
    const pendingCount = dbApplications.filter((a) => a.trang_thai === "cho").length;
    const rejectedCount = dbApplications.filter((a) => a.trang_thai === "tu_choi").length;

    // Tổng chỉ tiêu thực từ bảng lich_su_diem_chuan trong CSDL
    const realTotalQuota =
      quota2026._sum.chi_tieu || quota2025._sum.chi_tieu || 4660;

    overall = {
      totalApplications,
      validCount,
      pendingCount,
      rejectedCount,
      totalQuota: realTotalQuota,
      totalMajors: dbPrograms.length,
    };

    // 2. Thống kê theo từng ngành học trực tiếp từ DB
    majors = dbPrograms.map((p) => {
      // Chỉ tiêu thực tế năm 2026 hoặc 2025
      const chiTieu =
        p.lich_su_diem_chuan[0]?.chi_tieu ||
        (p.lich_su_diem_chuan.length > 1 ? p.lich_su_diem_chuan[1].chi_tieu : 0);

      const soHoSo = p.nguyen_vong?.length || 0;
      const soHopLe = (p.nguyen_vong || []).filter((nv) => nv.trang_thai === "hop_le").length;
      const tiLeChoi = chiTieu > 0 ? parseFloat((soHoSo / chiTieu).toFixed(2)) : 0;
      const tiLeLapDay = chiTieu > 0 ? Math.round((soHopLe / chiTieu) * 100) : 0;

      return {
        maChuongTrinh: p.ma_chuong_trinh,
        tenChuongTrinh: p.ten_chuong_trinh,
        tenKhoiNganh: p.nganh?.khoi_nganh?.ten_khoi_nganh || "Khoa Trực Thuộc",
        chiTieu,
        soHoSo,
        soHopLe,
        tiLeChoi,
        tiLeLapDay,
      };
    });

    // Sắp xếp các ngành có chỉ tiêu thực tế lên đầu để quan sát dễ dàng
    majors.sort((a, b) => b.chiTieu - a.chiTieu);

    // 3. Thống kê theo phương thức xét tuyển thực từ bảng phuong_thuc_xet_tuyen & diem_trung_tuyen
    const totalBenchmarkRecords = allYearScores.length || 1;
    methods = dbMethods.map((m) => {
      // Số hồ sơ thực tế nộp theo phương thức này
      const soHoSo = (m.nguyen_vong || []).length;
      // Tỷ trọng dữ liệu điểm chuẩn đã áp dụng trong DB
      const countScores = (m.diem_trung_tuyen || []).length;
      const tiLePhanTram = totalApplications > 0
        ? Math.round((soHoSo / totalApplications) * 100)
        : Math.round((countScores / totalBenchmarkRecords) * 100);

      return {
        maPhuongThuc: m.ma_phuong_thuc,
        tenPhuongThuc: m.ten_phuong_thuc,
        soHoSo,
        tiLePhanTram,
      };
    });

    // 4. Thống kê theo tổ hợp môn xét tuyển thực từ ctdt_to_hop
    const totalCombinationsAssigned = dbCombinations.reduce(
      (sum, c) => sum + (c.ctdt_to_hop?.length || 0),
      0
    ) || 1;

    combinations = dbCombinations
      .map((c) => {
        const soHoSo = (c.nguyen_vong || []).length;
        const countPrograms = c.ctdt_to_hop?.length || 0;
        const tiLePhanTram = totalApplications > 0
          ? Math.round((soHoSo / totalApplications) * 100)
          : Math.round((countPrograms / totalCombinationsAssigned) * 100);

        return {
          maToHop: c.ma_to_hop,
          soHoSo,
          tiLePhanTram,
        };
      })
      .sort((a, b) => b.tiLePhanTram - a.tiLePhanTram)
      .slice(0, 8); // Lấy Top 8 tổ hợp hàng đầu

    // 5. Tiến độ theo ngày thực tế từ nguyen_vong_sinh_vien (hoặc nhóm theo create_at)
    if (dbApplications.length > 0) {
      const dayMap: Record<string, number> = {};
      dbApplications.forEach((app) => {
        const d = new Date(app.create_at).toLocaleDateString("vi-VN", {
          day: "2-digit",
          month: "2-digit",
        });
        dayMap[d] = (dayMap[d] || 0) + 1;
      });
      dailyTrends = Object.entries(dayMap).map(([ngay, soLuong]) => ({ ngay, soLuong }));
    } else {
      dailyTrends = [];
    }
  } catch (error) {
    console.error("Lỗi nạp dữ liệu thống kê từ Supabase:", error);
  }

  return (
    <Suspense
      fallback={
        <div className="min-h-[400px] flex items-center justify-center">
          <LoadingSpinner />
        </div>
      }
    >
      <ThongKeClient
        overall={overall}
        majors={majors}
        methods={methods}
        combinations={combinations}
        dailyTrends={dailyTrends}
      />
    </Suspense>
  );
}

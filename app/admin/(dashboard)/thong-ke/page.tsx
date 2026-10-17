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
  title: "Thống Kê Tổng Quan Tuyển Sinh | UTC Admin",
  description:
    "Dashboard thống kê hồ sơ, ngành học, phương thức và tổ hợp xét tuyển từ dữ liệu tuyển sinh UTC.",
};

export const revalidate = 0; // Luôn nạp realtime trên trang Admin

const admissionTimeZone = "Asia/Ho_Chi_Minh";
const dayFormatter = new Intl.DateTimeFormat("en-US", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  timeZone: admissionTimeZone,
});

function getDayParts(value: Date) {
  const parts = Object.fromEntries(
    dayFormatter
      .formatToParts(value)
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, part.value]),
  );
  return {
    key: `${parts.year}-${parts.month}-${parts.day}`,
    label: `${parts.day}/${parts.month}`,
  };
}

export default async function ThongKePage() {
  const admissionYear = Number(
    new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      timeZone: admissionTimeZone,
    }).format(new Date()),
  );
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
  let errorMessage: string | undefined;

  try {
    const [dbPrograms, dbMethods, dbCombinations, dbApplications] =
      await Promise.all([
      prisma.chuongTrinhDaoTao.findMany({
        include: {
          nganh: {
            include: {
              khoi_nganh: true,
            },
          },
          lich_su_diem_chuan: {
            where: { nam: admissionYear },
            select: { chi_tieu: true },
          },
          nguyen_vong: {
            where: { nam_tuyen_sinh: admissionYear },
            select: { trang_thai: true },
          },
        },
        orderBy: { ten_chuong_trinh: "asc" },
      }),
      prisma.phuongThucXetTuyen.findMany({
        include: {
          nguyen_vong: {
            where: { nam_tuyen_sinh: admissionYear },
            select: { ma_ho_so: true },
          },
        },
      }),
      prisma.toHopXetTuyen.findMany({
        include: {
          nguyen_vong: {
            where: { nam_tuyen_sinh: admissionYear },
            select: { ma_ho_so: true },
          },
        },
      }),
      prisma.nguyenVongSinhVien.findMany({
        where: { nam_tuyen_sinh: admissionYear },
        select: { trang_thai: true, create_at: true },
        orderBy: { create_at: "asc" },
      }),
    ]);

    const totalApplications = dbApplications.length;
    const validCount = dbApplications.filter((a) => a.trang_thai === "hop_le").length;
    const pendingCount = dbApplications.filter((a) => a.trang_thai === "cho").length;
    const rejectedCount = dbApplications.filter((a) => a.trang_thai === "tu_choi").length;

    const majorMap = new Map<
      string,
      Omit<MajorStatItem, "tiLeChoi" | "tiLeLapDay">
    >();
    for (const program of dbPrograms) {
      const majorCode = program.nganh.ma_nganh;
      const current = majorMap.get(majorCode) ?? {
        maNganh: majorCode,
        tenNganh: program.nganh.ten_nganh,
        tenKhoiNganh:
          program.nganh.khoi_nganh?.ten_khoi_nganh || "Khoa Trực Thuộc",
        chiTieu: 0,
        soHoSo: 0,
        soHopLe: 0,
      };
      current.chiTieu += program.lich_su_diem_chuan[0]?.chi_tieu ?? 0;
      current.soHoSo += program.nguyen_vong.length;
      current.soHopLe += program.nguyen_vong.filter(
        (application) => application.trang_thai === "hop_le",
      ).length;
      majorMap.set(majorCode, current);
    }

    majors = Array.from(majorMap.values())
      .map((major) => ({
        ...major,
        tiLeChoi:
          major.chiTieu > 0
            ? Number((major.soHoSo / major.chiTieu).toFixed(2))
            : 0,
        tiLeLapDay:
          major.chiTieu > 0
            ? Math.round((major.soHopLe / major.chiTieu) * 100)
            : 0,
      }))
      .sort((a, b) => b.soHoSo - a.soHoSo || a.maNganh.localeCompare(b.maNganh));

    const totalQuota = majors.reduce((sum, major) => sum + major.chiTieu, 0);
    overall = {
      totalApplications,
      validCount,
      pendingCount,
      rejectedCount,
      totalQuota,
      totalMajors: majors.length,
    };

    methods = dbMethods.map((m) => {
      const soHoSo = m.nguyen_vong.length;
      const tiLePhanTram =
        totalApplications > 0
          ? Number(((soHoSo / totalApplications) * 100).toFixed(2))
          : 0;

      return {
        maPhuongThuc: m.ma_phuong_thuc,
        tenPhuongThuc: m.ten_phuong_thuc,
        soHoSo,
        tiLePhanTram,
      };
    });

    combinations = dbCombinations
      .map((c) => {
        const soHoSo = c.nguyen_vong.length;
        const tiLePhanTram =
          totalApplications > 0
            ? Number(((soHoSo / totalApplications) * 100).toFixed(2))
            : 0;

        return {
          maToHop: c.ma_to_hop,
          soHoSo,
          tiLePhanTram,
        };
      })
      .filter((combination) => combination.soHoSo > 0)
      .sort((a, b) => b.tiLePhanTram - a.tiLePhanTram)
      .slice(0, 8);

    const dayMap = new Map<string, { label: string; count: number }>();
    for (const application of dbApplications) {
      const { key, label } = getDayParts(application.create_at);
      const current = dayMap.get(key);
      dayMap.set(key, { label, count: (current?.count ?? 0) + 1 });
    }
    dailyTrends = Array.from(dayMap.entries())
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([, value]) => ({ ngay: value.label, soLuong: value.count }));
  } catch (error) {
    console.error("Lỗi nạp dữ liệu thống kê từ Supabase:", error);
    errorMessage = "Không thể tải dữ liệu thống kê. Vui lòng thử lại sau.";
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
        admissionYear={admissionYear}
        overall={overall}
        majors={majors}
        methods={methods}
        combinations={combinations}
        dailyTrends={dailyTrends}
        errorMessage={errorMessage}
      />
    </Suspense>
  );
}

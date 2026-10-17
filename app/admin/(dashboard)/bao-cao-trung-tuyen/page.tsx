import { Suspense } from "react";
import prisma from "@/libs/prisma";
import BaoCaoClient, {
  CandidateRecord,
  ProgramFilterOption,
} from "./BaoCaoClient";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

export const metadata = {
  title: "Báo Cáo Kết Quả Xét Tuyển & Trúng Tuyển | UTC Admin",
  description:
    "Báo cáo kết quả xét tuyển UTC, hỗ trợ bộ lọc, xuất CSV cho Excel và in PDF.",
};

export const revalidate = 0; // Realtime DB

function isPublishedResult(value: string | null) {
  return (value ?? "").toLocaleLowerCase("vi-VN").includes("đã công bố");
}

export default async function BaoCaoTrungTuyenPage() {
  const admissionYear = Number(
    new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      timeZone: "Asia/Ho_Chi_Minh",
    }).format(new Date()),
  );
  const reportDate = new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "Asia/Ho_Chi_Minh",
  }).format(new Date());
  let candidates: CandidateRecord[] = [];
  let programs: ProgramFilterOption[] = [];
  let methods: Array<{ maPhuongThuc: string; tenPhuongThuc: string }> = [];
  let errorMessage: string | undefined;

  try {
    const [dbPrograms, dbMethods, dbApplications, dbCutoffHistories] = await Promise.all([
      prisma.chuongTrinhDaoTao.findMany({
        orderBy: { ten_chuong_trinh: "asc" },
      }),
      prisma.phuongThucXetTuyen.findMany(),
      prisma.nguyenVongSinhVien.findMany({
        where: { nam_tuyen_sinh: admissionYear },
        include: {
          thi_sinh: true,
          chuong_trinh: true,
          phuong_thuc: true,
          to_hop: true,
        },
        orderBy: [{ tong_diem_xet_tuyen: "desc" }, { create_at: "asc" }],
      }),
      prisma.lichSuDiemChuan.findMany({
        where: { nam: admissionYear },
        include: {
          diem_trung_tuyen: true,
        },
      }),
    ]);

    programs = dbPrograms.map((p) => ({
      maChuongTrinh: p.ma_chuong_trinh,
      tenChuongTrinh: p.ten_chuong_trinh,
    }));

    methods = dbMethods.map((m) => ({
      maPhuongThuc: m.ma_phuong_thuc,
      tenPhuongThuc: m.ten_phuong_thuc,
    }));

    const benchmarkMap = new Map<string, number>();
    for (const history of dbCutoffHistories) {
      for (const benchmark of history.diem_trung_tuyen) {
        benchmarkMap.set(
          `${history.ma_chuong_trinh}_${benchmark.ma_phuong_thuc}`,
          benchmark.diem,
        );
      }
    }

    candidates = dbApplications.map((app, idx) => {
      let status: "TRUNG_TUYEN_SO_BO" | "CHO_XAC_NHAN" | "CHUA_DAT" = "CHO_XAC_NHAN";
      if (isPublishedResult(app.ket_qua)) {
        status =
          app.trang_thai === "hop_le" ? "TRUNG_TUYEN_SO_BO" : "CHUA_DAT";
      }

      return {
        stt: idx + 1,
        maHoSo: app.ma_ho_so,
        cccd: app.cccd,
        hoTen: app.thi_sinh?.ho_ten || "Thí sinh tự do",
        ngaySinh: "Chưa cập nhật",
        gioiTinh: "Chưa cập nhật",
        soDienThoai: app.thi_sinh?.so_dien_thoai || "Chưa cập nhật",
        khuVuc: app.thi_sinh?.khu_vuc || "Chưa cập nhật",
        doiTuongUuTien: app.thi_sinh?.doi_tuong_uu_tien || "Không",
        maChuongTrinh: app.ma_chuong_trinh,
        tenChuongTrinh: app.chuong_trinh?.ten_chuong_trinh || app.ma_chuong_trinh,
        maPhuongThuc: app.ma_phuong_thuc,
        tenPhuongThuc: app.phuong_thuc?.ten_phuong_thuc || app.ma_phuong_thuc,
        maToHop: app.ma_to_hop || "Không áp dụng",
        diemXetTuyen: app.tong_diem_xet_tuyen,
        diemChuanNganh:
          benchmarkMap.get(`${app.ma_chuong_trinh}_${app.ma_phuong_thuc}`) ??
          null,
        trangThai: status,
        ngayNop: new Intl.DateTimeFormat("vi-VN", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          timeZone: "Asia/Ho_Chi_Minh",
        }).format(app.create_at),
      };
    });
  } catch (error) {
    console.error("Lỗi nạp báo cáo trúng tuyển từ Supabase:", error);
    errorMessage = "Không thể tải báo cáo trúng tuyển. Vui lòng thử lại sau.";
  }

  return (
    <Suspense
      fallback={
        <div className="min-h-[400px] flex items-center justify-center">
          <LoadingSpinner />
        </div>
      }
    >
      <BaoCaoClient
        admissionYear={admissionYear}
        reportDate={reportDate}
        candidates={candidates}
        programs={programs}
        methods={methods}
        errorMessage={errorMessage}
      />
    </Suspense>
  );
}

import { Suspense } from "react";
import prisma from "@/libs/prisma";
import BaoCaoClient, {
  CandidateRecord,
  ProgramFilterOption,
} from "./BaoCaoClient";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

export const metadata = {
  title: "Báo Cáo Kết Quả Xét Tuyển & Trúng Tuyển (Realtime DB) | UTC Admin",
  description:
    "Danh sách thí sinh đủ điều kiện trúng tuyển sớm trích xuất trực tiếp từ Cơ sở dữ liệu Supabase UTC, xuất file báo cáo Excel và in biên bản xét tuyển K66.",
};

export const revalidate = 0; // Realtime DB

export default async function BaoCaoTrungTuyenPage() {
  let candidates: CandidateRecord[] = [];
  let programs: ProgramFilterOption[] = [];
  let methods: Array<{ maPhuongThuc: string; tenPhuongThuc: string }> = [];

  try {
    const [dbPrograms, dbMethods, dbApplications, dbBenchmarks] = await Promise.all([
      prisma.chuongTrinhDaoTao.findMany({
        orderBy: { ten_chuong_trinh: "asc" },
      }),
      prisma.phuongThucXetTuyen.findMany(),
      prisma.nguyenVongSinhVien.findMany({
        include: {
          thi_sinh: true,
          chuong_trinh: true,
          phuong_thuc: true,
          to_hop: true,
        },
        orderBy: { tong_diem_xet_tuyen: "desc" },
      }),
      prisma.diemTrungTuyen.findMany({
        include: {
          lich_su: true,
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

    // Tạo map điểm chuẩn theo chương trình và phương thức từ DB
    const benchmarkMap = new Map<string, number>();
    dbBenchmarks.forEach((b) => {
      const progCode = b.lich_su?.ma_chuong_trinh;
      const methodCode = b.ma_phuong_thuc;
      if (progCode && methodCode) {
        benchmarkMap.set(`${progCode}_${methodCode}`, b.diem);
      }
    });

    // 100% trích xuất từ bảng nguyen_vong_sinh_vien trong DB Supabase
    candidates = dbApplications.map((app, idx) => {
      const benchmarkScore =
        benchmarkMap.get(`${app.ma_chuong_trinh}_${app.ma_phuong_thuc}`) || 24.0;
      const score = app.tong_diem_xet_tuyen || 0;

      let status: "TRUNG_TUYEN_SO_BO" | "CHO_XAC_NHAN" | "CHUA_DAT" = "CHO_XAC_NHAN";
      if (app.trang_thai === "hop_le") {
        status = score >= benchmarkScore ? "TRUNG_TUYEN_SO_BO" : "CHUA_DAT";
      } else if (app.trang_thai === "tu_choi") {
        status = "CHUA_DAT";
      }

      return {
        stt: idx + 1,
        maHoSo: app.ma_ho_so,
        cccd: app.cccd,
        hoTen: app.thi_sinh?.ho_ten || "Thí sinh tự do",
        ngaySinh: "Chưa cập nhật",
        gioiTinh: "Chưa rõ",
        soDienThoai: app.thi_sinh?.so_dien_thoai || "Chưa có",
        khuVuc: app.thi_sinh?.khu_vuc || "KV3",
        doiTuongUuTien: app.thi_sinh?.doi_tuong_uu_tien || "Không",
        maChuongTrinh: app.ma_chuong_trinh,
        tenChuongTrinh: app.chuong_trinh?.ten_chuong_trinh || app.ma_chuong_trinh,
        maPhuongThuc: app.ma_phuong_thuc,
        tenPhuongThuc: app.phuong_thuc?.ten_phuong_thuc || app.ma_phuong_thuc,
        maToHop: app.ma_to_hop || "Không",
        diemXetTuyen: score,
        diemChuanNganh: benchmarkScore,
        trangThai: status,
        ngayDuyet: app.create_at.toLocaleDateString("vi-VN"),
      };
    });
  } catch (error) {
    console.error("Lỗi nạp báo cáo trúng tuyển từ Supabase:", error);
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
        candidates={candidates}
        programs={programs}
        methods={methods}
      />
    </Suspense>
  );
}

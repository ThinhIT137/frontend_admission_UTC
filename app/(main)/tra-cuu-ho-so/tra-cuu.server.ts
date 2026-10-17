"use server";

import { prismaPublic } from "@/libs/prisma";

export interface GiayToMinhChung {
  id: string;
  tenGiayTo: string;
  maLoai: string;
  tenTep: string;
  dungLuong?: string;
  ngayUpload: string;
  trangThai: "HOP_LE" | "CHO_DUYET" | "CAN_BO_SUNG";
  ghiChu?: string;
}

export interface TimelineEvent {
  step: number;
  tieuDe: string;
  thoiGian: string;
  boPhanXuLy: string;
  noiDung: string;
  trangThai: "COMPLETED" | "CURRENT" | "PENDING";
}

export interface HoSoTuyenSinhResult {
  maHoSo: string;
  cccd: string;
  hoTen: string;
  ngaySinh: string;
  gioiTinh: string;
  soDienThoai: string;
  email: string;
  truongThpt: string;
  tinhThanh: string;
  khuVuc: string;
  diemKhuVuc: number;
  doiTuongUuTien: string;
  diemDoiTuong: number;

  soThuTuNv: number;
  maChuongTrinh: string;
  tenChuongTrinh: string;
  maNganhBoGddt: string;
  khoaQuanLy: string;
  maPhuongThuc: string;
  tenPhuongThuc: string;
  maToHop: string;
  tenToHop: string;

  diemChiTiet: Array<{
    mon: string;
    diem: number | string;
  }>;
  tongDiemHocTap: number;
  tongDiemUuTien: number;
  tongDiemXetTuyen: number;
  diemChuanNamTruoc?: number;

  trangThai: "DAT_SO_TUYEN" | "CHO_DOI_SOAT" | "CAN_BO_SUNG" | "CHUA_DAT";
  ngayNop: string;
  ngayCapNhatCuoi: string;
  ghiChuHoiDong: string;
  huongDanTiepTheo: string;
  hanChotBoSung?: string;

  danhSachMinhChung: GiayToMinhChung[];
  lichSuXuLy: TimelineEvent[];
}

export async function traCuuHoSoDbAction(
  query: string
): Promise<{ success: boolean; data: HoSoTuyenSinhResult[]; error?: string }> {
  try {
    const q = (query || "").trim();
    if (!q) {
      return { success: true, data: [] };
    }

    const applications = await prismaPublic.nguyenVongSinhVien.findMany({
      where: {
        OR: [
          { ma_ho_so: { contains: q, mode: "insensitive" } },
          { cccd: { contains: q, mode: "insensitive" } },
          { thi_sinh: { so_dien_thoai: { contains: q, mode: "insensitive" } } },
        ],
      },
      include: {
        thi_sinh: {
          include: {
            chung_chi: true,
          },
        },
        chuong_trinh: {
          include: {
            nganh: true,
          },
        },
        phuong_thuc: true,
        to_hop: true,
      },
      orderBy: {
        create_at: "desc",
      },
    });

    if (!applications || applications.length === 0) {
      return { success: true, data: [] };
    }

    const mappedData: HoSoTuyenSinhResult[] = applications.map((app) => {
      const ts = app.thi_sinh;
      const ct = app.chuong_trinh;
      const pt = app.phuong_thuc;
      const th = app.to_hop;

      // Quy đổi trạng thái DB sang trạng thái giao diện tuyển sinh
      let uiStatus: "DAT_SO_TUYEN" | "CHO_DOI_SOAT" | "CAN_BO_SUNG" | "CHUA_DAT" =
        "CHO_DOI_SOAT";
      if (app.trang_thai === "hop_le") {
        uiStatus = "DAT_SO_TUYEN";
      } else if (app.trang_thai === "tu_choi") {
        uiStatus = "CAN_BO_SUNG";
      }

      // Format ngày tạo
      const createdDate = app.create_at
        ? new Date(app.create_at).toLocaleDateString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          })
        : "Chưa xác định";

      // Danh sách minh chứng từ bảng chung_chi
      const danhSachMinhChung: GiayToMinhChung[] = (ts?.chung_chi || []).map(
        (doc, idx) => ({
          id: doc.ma_chung_chi || `doc-${idx}`,
          tenGiayTo: doc.loai_chung_chi || "Minh chứng số hóa",
          maLoai: doc.loai_chung_chi?.toUpperCase().includes("IELTS")
            ? "IELTS"
            : doc.loai_chung_chi?.toUpperCase().includes("TSA") ||
              doc.loai_chung_chi?.toUpperCase().includes("HSA")
            ? "TSA"
            : doc.loai_chung_chi?.toUpperCase().includes("HỌC BẠ") ||
              doc.loai_chung_chi?.toUpperCase().includes("HOC BA")
            ? "HOC_BA"
            : "CCCD",
          tenTep: doc.file_dinh_kem || "tep_dinh_kem.pdf",
          dungLuong: "Bản số hóa",
          ngayUpload: doc.create_at
            ? new Date(doc.create_at).toLocaleDateString("vi-VN", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              })
            : createdDate,
          trangThai:
            doc.trang_thai_duyet === "hop_le"
              ? "HOP_LE"
              : doc.trang_thai_duyet === "tu_choi"
              ? "CAN_BO_SUNG"
              : "CHO_DUYET",
          ghiChu: doc.diem_hoac_hang || undefined,
        })
      );

      // Điểm chi tiết
      const tongDiem = app.tong_diem_xet_tuyen || 0;
      const diemUuTien =
        app.diem_uu_tien_ap_dung || ts?.diem_uu_tien_he_thong || 0;
      const diemHocTap = Math.max(0, Number((tongDiem - diemUuTien).toFixed(2)));

      const diemChiTiet = [
        {
          mon: `Điểm xét tuyển tổ hợp ${app.ma_to_hop || "A00"} (chưa gồm ưu tiên)`,
          diem: diemHocTap > 0 ? diemHocTap : "Đang tính",
        },
        {
          mon: `Điểm ưu tiên khu vực & đối tượng (${ts?.khu_vuc || "KV3"})`,
          diem: `+${diemUuTien}`,
        },
      ];

      // Timeline lịch sử xử lý dựa trên trạng thái thực tế
      const lichSuXuLy: TimelineEvent[] = [
        {
          step: 1,
          tieuDe: "Hồ sơ đăng ký nộp trực tuyến thành công",
          thoiGian: createdDate,
          boPhanXuLy: "Hệ thống Tuyển sinh UTC",
          noiDung: "Thí sinh gửi thành công thông tin đăng ký và các tệp scan minh chứng.",
          trangThai: "COMPLETED",
        },
        {
          step: 2,
          tieuDe: "Kiểm tra tính hợp lệ & Đối soát minh chứng",
          thoiGian:
            uiStatus === "DAT_SO_TUYEN"
              ? "Đã hoàn thành"
              : uiStatus === "CAN_BO_SUNG"
              ? "Cần khắc phục"
              : "Đang tiến hành",
          boPhanXuLy: "Ban Thư ký Tuyển sinh UTC",
          noiDung:
            uiStatus === "DAT_SO_TUYEN"
              ? "Cán bộ đã thẩm định toàn bộ tệp scan học bạ / chứng chỉ hợp lệ."
              : uiStatus === "CAN_BO_SUNG"
              ? app.ket_qua || "Hồ sơ có minh chứng cần nộp bổ sung để hoàn tất xét duyệt."
              : "Đang tiến hành đối soát thông tin với cơ sở dữ liệu Bộ GD&ĐT.",
          trangThai:
            uiStatus === "CHO_DOI_SOAT"
              ? "CURRENT"
              : "COMPLETED",
        },
        {
          step: 3,
          tieuDe: "Hội đồng Tuyển sinh phê duyệt kết quả sơ tuyển",
          thoiGian:
            uiStatus === "DAT_SO_TUYEN" ? "Đã công bố" : "Dự kiến tháng 06/2026",
          boPhanXuLy: "Hội đồng Tuyển sinh UTC",
          noiDung:
            uiStatus === "DAT_SO_TUYEN"
              ? "Thí sinh ĐẠT ĐIỀU KIỆN TRÚNG TUYỂN SỚM (cần đăng ký NV trên Cổng Bộ GD&ĐT)."
              : "Tổng hợp danh sách xét tuyển theo phương thức đã chọn.",
          trangThai:
            uiStatus === "DAT_SO_TUYEN"
              ? "COMPLETED"
              : uiStatus === "CAN_BO_SUNG"
              ? "PENDING"
              : "PENDING",
        },
      ];

      return {
        maHoSo: app.ma_ho_so,
        cccd: app.cccd,
        hoTen: ts?.ho_ten || "Thí sinh UTC",
        ngaySinh: "Theo CCCD",
        gioiTinh: "Theo hồ sơ",
        soDienThoai: ts?.so_dien_thoai || "",
        email: "thisinh@utc.edu.vn",
        truongThpt: "Trường THPT Thí sinh",
        tinhThanh: "Toàn quốc",
        khuVuc: ts?.khu_vuc || "KV3",
        diemKhuVuc: diemUuTien,
        doiTuongUuTien: ts?.doi_tuong_uu_tien || "Không",
        diemDoiTuong: 0,

        soThuTuNv: app.nguyen_vong || 1,
        maChuongTrinh: app.ma_chuong_trinh,
        tenChuongTrinh: ct?.ten_chuong_trinh || app.ma_chuong_trinh,
        maNganhBoGddt: ct?.ma_nganh || app.ma_chuong_trinh,
        khoaQuanLy: ct?.nganh?.ten_nganh || "Trường Đại học Giao thông Vận tải",
        maPhuongThuc: app.ma_phuong_thuc,
        tenPhuongThuc: pt?.ten_phuong_thuc || app.ma_phuong_thuc,
        maToHop: app.ma_to_hop || "A00",
        tenToHop: th?.ma_to_hop ? `Tổ hợp ${th.ma_to_hop}` : "Xét hồ sơ kết hợp",

        diemChiTiet,
        tongDiemHocTap: diemHocTap,
        tongDiemUuTien: diemUuTien,
        tongDiemXetTuyen: tongDiem,
        diemChuanNamTruoc: 24.5,

        trangThai: uiStatus,
        ngayNop: createdDate,
        ngayCapNhatCuoi: createdDate,
        ghiChuHoiDong:
          app.ket_qua ||
          (uiStatus === "DAT_SO_TUYEN"
            ? "Hồ sơ đủ điều kiện trúng tuyển sớm có điều kiện."
            : "Hồ sơ đang trong quy trình thẩm định minh chứng của Hội đồng tuyển sinh."),
        huongDanTiepTheo:
          uiStatus === "DAT_SO_TUYEN"
            ? "Thí sinh đăng ký ngành này trên Cổng tuyển sinh của Bộ GD&ĐT (từ ngày 10/07 đến 25/07/2026) để được công nhận trúng tuyển chính thức."
            : uiStatus === "CAN_BO_SUNG"
            ? "Thí sinh vui lòng kiểm tra mục Giấy tờ minh chứng và tải lên lại bản scan có công chứng hợp lệ."
            : "Vui lòng giữ lại biên nhận và thường xuyên kiểm tra tiến độ xử lý hồ sơ trên cổng này.",

        danhSachMinhChung,
        lichSuXuLy,
      };
    });

    return {
      success: true,
      data: mappedData,
    };
  } catch (error: any) {
    console.error("Lỗi traCuuHoSoDbAction:", error);
    return {
      success: false,
      data: [],
      error: error?.message || "Lỗi truy vấn CSDL Tuyển sinh UTC.",
    };
  }
}

"use server";

import prisma from "@/libs/prisma";

export interface SubmitHoSoPayload {
  hoTen: string;
  cccd: string;
  soDienThoai: string;
  email?: string;
  khuVuc?: string;
  doiTuongUuTien?: string;
  maPhuongThuc: string;
  maChuongTrinh: string;
  maToHop?: string;
  tongDiemXetTuyen?: number | null;
  giayToDinhKem?: Array<{
    loaiGiayTo: string;
    fileName: string;
    fileSize?: string;
  }>;
}

export interface SubmitHoSoResult {
  success: boolean;
  maHoSo?: string;
  cccd?: string;
  hoTen?: string;
  error?: string;
}

export async function submitHoSoAction(
  payload: SubmitHoSoPayload
): Promise<SubmitHoSoResult> {
  try {
    const rawCccd = payload.cccd?.trim();
    const rawHoTen = payload.hoTen?.trim().toUpperCase();
    const rawPhone = payload.soDienThoai?.trim();

    if (!rawCccd || !rawHoTen || !rawPhone) {
      return {
        success: false,
        error: "Vui lòng điền đầy đủ Họ tên, Số CCCD và Số điện thoại liên hệ!",
      };
    }

    if (!payload.maChuongTrinh || !payload.maPhuongThuc) {
      return {
        success: false,
        error: "Vui lòng chọn Nguyện vọng Chương trình đào tạo và Phương thức xét tuyển!",
      };
    }

    // 1. Cập nhật hoặc tạo mới Thí sinh trong bảng thi_sinh
    await prisma.thiSinh.upsert({
      where: { cccd: rawCccd },
      update: {
        ho_ten: rawHoTen,
        so_dien_thoai: rawPhone,
        khu_vuc: payload.khuVuc || "KV3",
        doi_tuong_uu_tien: payload.doiTuongUuTien || "NONE",
      },
      create: {
        cccd: rawCccd,
        ho_ten: rawHoTen,
        so_dien_thoai: rawPhone,
        khu_vuc: payload.khuVuc || "KV3",
        doi_tuong_uu_tien: payload.doiTuongUuTien || "NONE",
        diem_uu_tien_he_thong:
          payload.khuVuc === "KV1"
            ? 0.75
            : payload.khuVuc === "KV2_NT"
            ? 0.5
            : payload.khuVuc === "KV2"
            ? 0.25
            : 0.0,
      },
    });

    // 2. Tạo Mã hồ sơ chuẩn UTC: UTC26-XXXXXX
    const randomSuffix = Math.random().toString(36).substring(2, 8).toUpperCase();
    const generatedMaHoSo = `UTC26-${randomSuffix}`;

    // 3. Tạo bản ghi Nguyện vọng trong bảng nguyen_vong_sinh_vien
    await prisma.nguyenVongSinhVien.create({
      data: {
        ma_ho_so: generatedMaHoSo,
        cccd: rawCccd,
        ma_chuong_trinh: payload.maChuongTrinh,
        ma_phuong_thuc: payload.maPhuongThuc,
        ma_to_hop: payload.maToHop || null,
        trang_thai: "cho",
        ket_qua: "Đã tiếp nhận hồ sơ trực tuyến, đang chờ Hội đồng Tuyển sinh UTC đối soát minh chứng.",
        tong_diem_xet_tuyen: payload.tongDiemXetTuyen || null,
        diem_uu_tien_ap_dung:
          payload.khuVuc === "KV1"
            ? 0.75
            : payload.khuVuc === "KV2_NT"
            ? 0.5
            : payload.khuVuc === "KV2"
            ? 0.25
            : 0.0,
        nguon_du_lieu: "tu_nop",
        nguyen_vong: 1,
        nam_tuyen_sinh: 2026,
      },
    });

    // 4. Nếu có danh sách minh chứng file đã tải lên, lưu vào bảng chung_chi
    if (payload.giayToDinhKem && payload.giayToDinhKem.length > 0) {
      for (const [idx, item] of payload.giayToDinhKem.entries()) {
        const docId = `MC-${rawCccd}-${Date.now().toString(36)}-${idx}`;
        await prisma.chungChi.create({
          data: {
            ma_chung_chi: docId,
            cccd: rawCccd,
            loai_chung_chi: item.loaiGiayTo,
            diem_hoac_hang: "Bản số hóa trực tuyến",
            file_dinh_kem: item.fileName,
            trang_thai_duyet: "cho",
          },
        }).catch((err) => {
          console.warn("Lưu chứng chỉ minh chứng thất bại:", err);
        });
      }
    }

    return {
      success: true,
      maHoSo: generatedMaHoSo,
      cccd: rawCccd,
      hoTen: rawHoTen,
    };
  } catch (error: any) {
    console.error("Lỗi submitHoSoAction:", error);
    return {
      success: false,
      error: error?.message || "Có lỗi xảy ra khi nộp hồ sơ vào CSDL Tuyển sinh.",
    };
  }
}

import prisma from "@/libs/prisma";
import { adminService } from "./user.service";

export const getChiTieuList = async (year?: number) => {
  try {
    const whereClause = year ? { nam: year } : {};
    return await prisma.lichSuDiemChuan.findMany({
      where: whereClause,
      include: {
        chuong_trinh: {
          select: { ten_chuong_trinh: true, ma_nganh: true },
        },
        diem_trung_tuyen: {
          include: {
            phuong_thuc: { select: { ten_phuong_thuc: true } },
          }
        },
      },
      orderBy: [
        { nam: "desc" },
        { chuong_trinh: { ten_chuong_trinh: "asc" } }
      ]
    });
  } catch (error) {
    console.error("Error getChiTieuList:", error);
    throw error;
  }
};

export const createChiTieu = async (data: {
  ma_chuong_trinh: string;
  nam: number;
  chi_tieu: number;
  phuong_thuc_ids: string[]; // List of ma_phuong_thuc to initialize DiemTrungTuyen
}) => {
  try {
    const ma_admin_cap_nhat = await adminService.getAdminId();

    // Check if already exists for this year
    const existing = await prisma.lichSuDiemChuan.findUnique({
      where: {
        ma_chuong_trinh_nam: {
          ma_chuong_trinh: data.ma_chuong_trinh,
          nam: data.nam,
        }
      }
    });

    if (existing) {
      throw new Error(`Chương trình này đã có chỉ tiêu trong năm ${data.nam}`);
    }

    // Create LichSuDiemChuan and initialize DiemTrungTuyen
    return await prisma.lichSuDiemChuan.create({
      data: {
        ma_chuong_trinh: data.ma_chuong_trinh,
        nam: data.nam,
        chi_tieu: data.chi_tieu,
        ma_admin_cap_nhat,
        diem_trung_tuyen: {
          create: data.phuong_thuc_ids.map((pt_id) => ({
            ma_phuong_thuc: pt_id,
            diem: 0, // Default to 0
          }))
        }
      }
    });
  } catch (error) {
    console.error("Error createChiTieu:", error);
    throw error;
  }
};

export const updateChiTieu = async (
  ma_ls_dc: string,
  data: {
    chi_tieu?: number;
    trung_tuyen?: number;
    diem_trung_tuyen?: { ma_diem_tt: string; diem: number; nguyen_vong_toi_da?: number | null; diem_uu_tien_toi_thieu?: number | null; dieu_kien_mon?: any }[];
  }
) => {
  try {
    const ma_admin_cap_nhat = await adminService.getAdminId();
    
    // Update LichSuDiemChuan
    await prisma.lichSuDiemChuan.update({
      where: { ma_ls_dc },
      data: {
        chi_tieu: data.chi_tieu,
        trung_tuyen: data.trung_tuyen,
        ma_admin_cap_nhat,
      }
    });

    // Update related DiemTrungTuyen records if provided
    if (data.diem_trung_tuyen && data.diem_trung_tuyen.length > 0) {
      for (const d of data.diem_trung_tuyen) {
        await prisma.diemTrungTuyen.update({
          where: { ma_diem_tt: d.ma_diem_tt },
          data: {
            diem: d.diem,
            nguyen_vong_toi_da: d.nguyen_vong_toi_da,
            diem_uu_tien_toi_thieu: d.diem_uu_tien_toi_thieu,
            // dieu_kien_mon: d.dieu_kien_mon,
          }
        });
      }
    }
    return true;
  } catch (error) {
    console.error("Error updateChiTieu:", error);
    throw error;
  }
};

export const deleteChiTieu = async (ma_ls_dc: string) => {
  try {
    return await prisma.lichSuDiemChuan.delete({
      where: { ma_ls_dc },
    });
  } catch (error) {
    console.error("Error deleteChiTieu:", error);
    throw error;
  }
};

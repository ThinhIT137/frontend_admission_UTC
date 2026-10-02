import prisma from "@/libs/prisma";
import { adminService } from "./user.service";

export const getLoTrinhTuyenSinhList = async () => {
  try {
    const list = await prisma.loTrinhTuyenSinh.findMany({
      orderBy: { thoi_gian_bat_dau: "asc" },
      include: { admin: { select: { ho_ten: true } } },
    });
    return list;
  } catch (error) {
    console.error("Error getLoTrinhTuyenSinhList:", error);
    throw error;
  }
};

export const createLoTrinhTuyenSinh = async (data: {
  ten_su_kien: string;
  thoi_gian_bat_dau: Date;
  thoi_gian_ket_thuc?: Date;
  ghi_chu?: string;
}) => {
  try {
    const ma_admin_cap_nhat = await adminService.getAdminId();
    return await prisma.loTrinhTuyenSinh.create({
      data: {
        ...data,
        ma_admin_cap_nhat,
      }
    });
  } catch (error) {
    console.error("Error createLoTrinhTuyenSinh:", error);
    throw error;
  }
};

export const updateLoTrinhTuyenSinh = async (
  ma_su_kien: string,
  data: {
    ten_su_kien?: string;
    thoi_gian_bat_dau?: Date;
    thoi_gian_ket_thuc?: Date;
    ghi_chu?: string;
  }
) => {
  try {
    const ma_admin_cap_nhat = await adminService.getAdminId();
    return await prisma.loTrinhTuyenSinh.update({
      where: { ma_su_kien },
      data: {
        ...data,
        ma_admin_cap_nhat,
      },
    });
  } catch (error) {
    console.error("Error updateLoTrinhTuyenSinh:", error);
    throw error;
  }
};

export const deleteLoTrinhTuyenSinh = async (ma_su_kien: string) => {
  try {
    return await prisma.loTrinhTuyenSinh.delete({
      where: { ma_su_kien },
    });
  } catch (error) {
    console.error("Error deleteLoTrinhTuyenSinh:", error);
    throw error;
  }
};

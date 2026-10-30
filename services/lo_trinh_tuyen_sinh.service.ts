import prisma from "@/libs/prisma";
import { adminService } from "./user.service";
import { validateMilestoneDates } from "@/libs/milestone-dates";

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
  thoi_gian_ket_thuc?: Date | null;
  ghi_chu?: string;
}) => {
  try {
    const ma_admin_cap_nhat = await adminService.getAdminId();
    if (typeof data.ten_su_kien !== "string" || !data.ten_su_kien.trim()) {
      throw new Error("Tên sự kiện không được để trống");
    }
    validateMilestoneDates(data.thoi_gian_bat_dau, data.thoi_gian_ket_thuc);
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
    thoi_gian_ket_thuc?: Date | null;
    ghi_chu?: string;
  }
) => {
  try {
    const ma_admin_cap_nhat = await adminService.getAdminId();
    if (data.ten_su_kien !== undefined &&
        (typeof data.ten_su_kien !== "string" || !data.ten_su_kien.trim())) {
      throw new Error("Tên sự kiện không được để trống");
    }
    return await prisma.$transaction(async tx => {
      await tx.$queryRaw`SELECT ma_su_kien FROM lo_trinh_tuyen_sinh WHERE ma_su_kien = ${ma_su_kien} FOR UPDATE`;
      const current = await tx.loTrinhTuyenSinh.findUnique({ where: { ma_su_kien } });
      if (!current) throw new Error("Sự kiện không tồn tại");
      validateMilestoneDates(data.thoi_gian_bat_dau ?? current.thoi_gian_bat_dau,
        data.thoi_gian_ket_thuc === undefined ? current.thoi_gian_ket_thuc : data.thoi_gian_ket_thuc);
      return tx.loTrinhTuyenSinh.update({ where: { ma_su_kien }, data: { ...data, ma_admin_cap_nhat } });
    });
  } catch (error) {
    console.error("Error updateLoTrinhTuyenSinh:", error);
    throw error;
  }
};

export const deleteLoTrinhTuyenSinh = async (ma_su_kien: string) => {
  try {
    await adminService.getAdminId();
    return await prisma.loTrinhTuyenSinh.delete({
      where: { ma_su_kien },
    });
  } catch (error) {
    console.error("Error deleteLoTrinhTuyenSinh:", error);
    throw error;
  }
};

import prisma from "@/libs/prisma";
import { adminService } from "./user.service";
import { validateMethodConfig, type MethodConfig } from "@/libs/admission-catalog";

export const getPhuongThucXetTuyenList = async () => {
  try {
    const list = await prisma.phuongThucXetTuyen.findMany({
      orderBy: { ma_phuong_thuc: "asc" },
    });
    return list;
  } catch (error) {
    console.error("Error getPhuongThucXetTuyenList:", error);
    throw error;
  }
};

export const createPhuongThucXetTuyen = async (data: { ma_phuong_thuc: string; ten_phuong_thuc: string } & MethodConfig) => {
  try {
    await adminService.getAdminId();
    const config = validateMethodConfig(data);
    if (typeof data.ma_phuong_thuc !== "string" || !data.ma_phuong_thuc.trim() ||
        typeof data.ten_phuong_thuc !== "string" || !data.ten_phuong_thuc.trim()) {
      throw new Error("Vui lòng nhập mã và tên phương thức");
    }
    const existing = await prisma.phuongThucXetTuyen.findUnique({
      where: { ma_phuong_thuc: data.ma_phuong_thuc },
    });
    if (existing) throw new Error("Mã phương thức đã tồn tại!");

    return await prisma.phuongThucXetTuyen.create({
      data: {
        ma_phuong_thuc: data.ma_phuong_thuc,
        ten_phuong_thuc: data.ten_phuong_thuc,
        ...config,
      }
    });
  } catch (error) {
    console.error("Error createPhuongThucXetTuyen:", error);
    throw error;
  }
};

export const updatePhuongThucXetTuyen = async (ma_phuong_thuc: string, data: { ten_phuong_thuc: string } & MethodConfig) => {
  try {
    await adminService.getAdminId();
    const config = validateMethodConfig(data);
    if (data.ten_phuong_thuc !== undefined &&
        (typeof data.ten_phuong_thuc !== "string" || !data.ten_phuong_thuc.trim())) {
      throw new Error("Tên phương thức không được để trống");
    }
    return await prisma.$transaction(async tx => {
      await tx.$queryRaw`SELECT ma_phuong_thuc FROM phuong_thuc_xet_tuyen WHERE ma_phuong_thuc = ${ma_phuong_thuc} FOR UPDATE`;
      if (await tx.diemTrungTuyen.count({ where: { ma_phuong_thuc, OR: [
        { diem: { lt: config.diem_toi_thieu } }, { diem: { gt: config.diem_toi_da } },
      ] } })) throw new Error("Thang điểm mới không chứa các điểm chuẩn đã lưu");
      return tx.phuongThucXetTuyen.update({ where: { ma_phuong_thuc }, data: { ten_phuong_thuc: data.ten_phuong_thuc.trim(), ...config } });
    });
  } catch (error) {
    console.error("Error updatePhuongThucXetTuyen:", error);
    throw error;
  }
};

export const deletePhuongThucXetTuyen = async (ma_phuong_thuc: string) => {
  try {
    await adminService.getAdminId();
    return await prisma.phuongThucXetTuyen.delete({
      where: { ma_phuong_thuc },
    });
  } catch (error) {
    console.error("Error deletePhuongThucXetTuyen:", error);
    throw error;
  }
};

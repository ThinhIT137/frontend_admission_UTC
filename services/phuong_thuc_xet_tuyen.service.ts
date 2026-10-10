import prisma from "@/libs/prisma";
import { adminService } from "./user.service";

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

export const createPhuongThucXetTuyen = async (data: { ma_phuong_thuc: string; ten_phuong_thuc: string }) => {
  try {
    await adminService.getAdminId();
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
      }
    });
  } catch (error) {
    console.error("Error createPhuongThucXetTuyen:", error);
    throw error;
  }
};

export const updatePhuongThucXetTuyen = async (ma_phuong_thuc: string, data: { ten_phuong_thuc?: string }) => {
  try {
    await adminService.getAdminId();
    if (data.ten_phuong_thuc !== undefined &&
        (typeof data.ten_phuong_thuc !== "string" || !data.ten_phuong_thuc.trim())) {
      throw new Error("Tên phương thức không được để trống");
    }
    return await prisma.phuongThucXetTuyen.update({
      where: { ma_phuong_thuc },
      data,
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

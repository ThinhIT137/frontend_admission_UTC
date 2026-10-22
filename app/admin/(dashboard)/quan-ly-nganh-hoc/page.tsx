import { Suspense } from "react";
import { nganhHocService } from "@/services/nganh_hoc.service";
import NganhHocClient from "./NganhHocClient";
import prisma from "@/libs/prisma";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

export const metadata = {
  title: "Quản Lý Danh Mục Ngành Học | UTC Admin",
};

export default async function ManageMajorsPage() {
  // Lấy dữ liệu ngành học từ server
  const allMajors = await nganhHocService.get({
    page: 1,
    pageSize: 1000,
    term: "",
    toHop: "",
    diemChuan: 0,
    faculty: "",
    year: 0
  });

  const allFaculties = await prisma.khoiNganh.findMany({
    orderBy: { ten_khoi_nganh: 'asc' }
  });

  return (
    <Suspense fallback={<LoadingSpinner label="Đang tải danh mục ngành học..." />}>
      <NganhHocClient initialData={allMajors} faculties={allFaculties} />
    </Suspense>
  );
}

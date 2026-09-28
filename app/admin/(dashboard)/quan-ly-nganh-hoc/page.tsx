import { nganhHocService } from "@/services/nganh_hoc.service";
import NganhHocClient from "./NganhHocClient";
import prisma from "@/libs/prisma";

export const metadata = {
  title: "Quản Lý Danh Mục Ngành Học | UTC Admin",
};

export default async function ManageMajorsPage() {
  // Lấy dữ liệu ngành học từ server thay vì client fetch
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

  // Truyền dữ liệu xuống Client Component để hiển thị và xử lý fuzzy search
  return <NganhHocClient initialData={allMajors} faculties={allFaculties} />;
}

import { khoiNganhService } from "@/services/khoi_nganh.service";
import KhoiNganhClient from "./KhoiNganhClient";

export const metadata = {
  title: "Quản Lý Danh Mục Khoa/Viện | UTC Admin",
};

export default async function ManageFacultiesPage() {
  const allFaculties = await khoiNganhService.getAll();
  return <KhoiNganhClient initialData={allFaculties} />;
}

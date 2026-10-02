import { danhMucMonService } from "@/services/danh_muc_mon.service";
import MonXetTuyenClient from "./MonXetTuyenClient";

export const metadata = {
  title: "Quản Lý Môn Xét Tuyển | UTC Admin",
};

export default async function MonXetTuyenPage() {
  const initialData = await danhMucMonService.getAll();

  return <MonXetTuyenClient initialData={initialData} />;
}

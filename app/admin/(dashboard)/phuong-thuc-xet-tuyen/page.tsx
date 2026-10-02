import { getPhuongThucXetTuyenAction } from "@/actions/phuong_thuc_xet_tuyen.action";
import PhuongThucClient from "./PhuongThucClient";

export const metadata = {
  title: "Quản Lý Phương Thức Xét Tuyển",
  description: "Cấu hình danh mục các phương thức tuyển sinh",
};

export default async function AdmissionMethodsPage() {
  const data = await getPhuongThucXetTuyenAction();

  return (
    <div className="p-6">
      <PhuongThucClient initialData={data} />
    </div>
  );
}

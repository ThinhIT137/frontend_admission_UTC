import { getLoTrinhTuyenSinhAction } from "@/actions/lo_trinh_tuyen_sinh.action";
import MocThoiGianClient from "./MocThoiGianClient";

export const metadata = {
  title: "Quản Lý Lộ Trình Tuyển Sinh",
  description: "Cấu hình danh mục các mốc thời gian xét tuyển",
};

export default async function MilestoneAdminPage() {
  const data = await getLoTrinhTuyenSinhAction();

  return (
    <div className="p-6">
      <MocThoiGianClient initialData={data} />
    </div>
  );
}

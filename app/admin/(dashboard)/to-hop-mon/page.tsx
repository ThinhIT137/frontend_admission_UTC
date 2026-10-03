import { toHopXetTuyenService } from "@/services/to_hop_xet_tuyen.service";
import ToHopClient from "./ToHopClient";

export const metadata = {
  title: "Quản Lý Tổ Hợp Xét Tuyển | UTC Admin",
};

export default async function ManageCombinationsPage() {
  let initialData: any[] = [];
  try {
    initialData = await toHopXetTuyenService.getAll();
  } catch (err) {
    console.error("Lỗi nạp dữ liệu tổ hợp xét tuyển từ server:", err);
  }

  return <ToHopClient initialData={initialData} />;
}

import { Suspense } from "react";
import TraCuuHoSoClient from "./TraCuuHoSoClient";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

export const metadata = {
  title: "Tra Cứu Hồ Sơ Tuyển Sinh & Trạng Thái Xét Tuyển | Tuyển Sinh UTC 2026",
  description:
    "Cổng tra cứu trạng thái hồ sơ tuyển sinh, tình trạng duyệt giấy tờ minh chứng và lịch sử cập nhật xét tuyển Trường Đại học Giao thông Vận tải (Cơ sở Hà Nội).",
};

export default function TraCuuHoSoPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[400px] flex items-center justify-center">
          <LoadingSpinner />
        </div>
      }
    >
      <TraCuuHoSoClient />
    </Suspense>
  );
}

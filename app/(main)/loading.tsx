import LoadingSpinner from "@/components/ui/LoadingSpinner";
export default function Loading() {
  // Suspense phản ánh thời gian tải thực của Server Component, không đặt timer giả.
  return <div className="flex min-h-64 items-center justify-center"><LoadingSpinner label="Đang tải thông tin tuyển sinh…" /></div>;
}

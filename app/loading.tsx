import LoadingSpinner from "@/components/ui/LoadingSpinner";

export default function RootLoading() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center p-6">
      <LoadingSpinner
        label="Đang tải dữ liệu Tuyển sinh UTC..."
        sublabel="Hệ thống thông tin tuyển sinh Đại học Giao thông Vận tải"
        size="lg"
      />
    </div>
  );
}

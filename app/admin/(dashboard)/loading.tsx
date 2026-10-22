import LoadingSpinner from "@/components/ui/LoadingSpinner";

export default function AdminLoading() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6">
      <LoadingSpinner
        label="Đang nạp bảng điều khiển Quản trị..."
        sublabel="UTC Admission Admin Portal"
        size="md"
      />
    </div>
  );
}

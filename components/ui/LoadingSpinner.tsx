"use client";

interface LoadingSpinnerProps {
  label?: string;
  sublabel?: string;
  size?: "sm" | "md" | "lg";
  fullScreen?: boolean;
}

export const LoadingSpinner = ({
  label = "Đang tải dữ liệu tuyển sinh...",
  sublabel = "Trường Đại học Giao thông Vận tải (UTC)",
  size = "md",
  fullScreen = false,
}: LoadingSpinnerProps) => {
  const content = (
    <div className="flex flex-col items-center justify-center gap-4 p-6 bg-[#fff9ee] border-2 border-[#0d1b4e] shadow-[6px_6px_0px_#0d1b4e] rounded-2xl max-w-sm text-center animate-in fade-in zoom-in-95 duration-200">
      {/* UTC Animated Dual Rings */}
      <div className="relative flex items-center justify-center">
        {/* Outer Ring */}
        <div
          className={`border-4 border-[#0d1b4e]/15 border-t-[#0d1b4e] rounded-full animate-spin ${
            size === "sm" ? "w-8 h-8" : size === "lg" ? "w-16 h-16" : "w-12 h-12"
          }`}
          style={{ animationDuration: "1.1s" }}
        />
        {/* Inner Gold Ring */}
        <div
          className={`absolute border-4 border-transparent border-b-[#fdb712] border-r-[#fdb712] rounded-full animate-spin ${
            size === "sm" ? "w-5 h-5" : size === "lg" ? "w-10 h-10" : "w-7 h-7"
          }`}
          style={{ animationDirection: "reverse", animationDuration: "0.8s" }}
        />
        {/* Center Logo Dot */}
        <div className="absolute w-2.5 h-2.5 bg-[#0d1b4e] rounded-full shadow-sm animate-ping" />
      </div>

      <div className="space-y-1">
        <h4 className="font-display font-black text-[15px] text-[#0d1b4e] tracking-wide">
          {label}
        </h4>
        {sublabel && (
          <p className="text-[12px] font-semibold text-[#767680]">{sublabel}</p>
        )}
      </div>

      {/* Modern pulse indicator bar */}
      <div className="w-32 h-1.5 bg-[#0d1b4e]/10 rounded-full overflow-hidden">
        <div className="w-full h-full bg-gradient-to-r from-[#0d1b4e] via-[#fdb712] to-[#0d1b4e] rounded-full animate-pulse" />
      </div>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-[999] flex items-center justify-center bg-[#1e1b14]/40 backdrop-blur-md">
        {content}
      </div>
    );
  }

  return <div className="flex items-center justify-center py-12 w-full">{content}</div>;
};

export default LoadingSpinner;

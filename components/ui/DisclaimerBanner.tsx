"use client";

interface DisclaimerBannerProps {
  text?: string;
  className?: string;
}

export function DisclaimerBanner({
  text = "Mọi thông tin trên hệ thống chỉ mang tính chất tham khảo, không thay thế thông báo tuyển sinh chính thức của nhà trường.",
  className = "",
}: DisclaimerBannerProps) {
  return (
    <section
      className={`relative bg-[#fdb712] text-[#1e1b14] p-3.5 border-[3px] border-[#111827] shadow-[5px_5px_0px_#111827] rounded-[10px] my-4 ${className}`}
      style={{ borderRadius: "20px 4px 18px 4px / 4px 18px 4px 20px" }}
    >
      <div className="flex items-center gap-3 px-2">
        <span className="material-symbols-outlined text-[#ba1a1a] text-[28px] shrink-0 font-bold">
          warning
        </span>
        <p className="font-bold text-[14px] md:text-[15px] text-[#111827] leading-snug">
          <span className="bg-[#111827] text-[#fff] px-2 py-0.5 mr-2 text-[12px] uppercase font-black rounded-[4px]">
            LƯU Ý:
          </span>
          {text}
        </p>
      </div>
    </section>
  );
}

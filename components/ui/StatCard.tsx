"use client";

export interface StatCardProps {
  value: string;
  title: string;
  subtitle: string;
  bg?: string;
  textColor?: string;
}

export function StatCard({
  value,
  title,
  subtitle,
  bg = "bg-[#fff9ee]",
  textColor = "text-[#000525]",
}: StatCardProps) {
  return (
    <div
      className={`${bg} p-5 border-[3px] border-[#000525] shadow-[4px_4px_0px_#000525] rounded-[12px] flex items-center gap-4`}
    >
      <div
        className={`w-14 h-14 bg-[#fdb712] ${textColor} border-[2px] border-[#000525] shadow-[2px_2px_0px_#000525] shrink-0 flex items-center justify-center font-display font-extrabold text-[22px] rounded-[8px]`}
      >
        {value}
      </div>
      <div>
        <h4 className="font-display font-bold text-[16px] text-[#000525] leading-tight">
          {title}
        </h4>
        <p className="text-[12px] text-[#45464f] mt-0.5">{subtitle}</p>
      </div>
    </div>
  );
}

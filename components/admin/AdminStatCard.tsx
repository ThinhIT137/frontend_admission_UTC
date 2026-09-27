"use client";

export interface AdminStatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: string;
  progressPercent?: number;
  badgeText?: string;
  badgeBg?: string;
  badgeColor?: string;
  accentBg?: string;
}

export function AdminStatCard({
  title,
  value,
  subtitle,
  icon,
  progressPercent = 75,
  badgeText,
  badgeBg = "bg-[#ffdea8]",
  badgeColor = "text-[#7c5800]",
  accentBg = "bg-[#0d1b4e]",
}: AdminStatCardProps) {
  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-[#e9e2d5] hover:shadow-md transition-shadow flex flex-col justify-between">
      <div className="flex items-center justify-between">
        <span className="font-stamp text-[11px] text-[#45464f] uppercase tracking-wider">
          {title}
        </span>
        <span className="w-8 h-8 rounded-lg bg-[#faf3e6] flex items-center justify-center text-[#0d1b4e]">
          <span className="material-symbols-outlined text-[18px]">{icon}</span>
        </span>
      </div>

      <div className="my-2">
        <div className="font-display font-bold text-[28px] text-[#0d1b4e] leading-tight">
          {value}
        </div>
        {subtitle && (
          <div className="flex items-center gap-1 mt-1">
            {badgeText && (
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded font-bold font-stamp ${badgeBg} ${badgeColor}`}
              >
                {badgeText}
              </span>
            )}
            <span className="text-[12px] text-[#767680] truncate">{subtitle}</span>
          </div>
        )}
      </div>

      <div className="h-1.5 w-full bg-[#f4ede0] rounded-full overflow-hidden mt-1">
        <div
          className={`h-full ${accentBg} rounded-full transition-all duration-500`}
          style={{ width: `${progressPercent}%` }}
        ></div>
      </div>
    </div>
  );
}

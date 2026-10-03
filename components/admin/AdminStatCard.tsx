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
  progressPercent = 100,
  badgeText,
  badgeBg = "bg-[#ffdea8]",
  badgeColor = "text-[#7c5800]",
  accentBg = "bg-[#0d1b4e]",
}: AdminStatCardProps) {
  return (
    <div className="bg-white p-4 rounded-2xl shadow-xs border border-[#e9e2d5] hover:shadow-md hover:border-[#0d1b4e]/30 transition-all flex flex-col justify-between group">
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <span className="font-stamp text-[11px] font-bold text-[#45464f] uppercase tracking-wider truncate">
          {title}
        </span>
        <div className="w-8 h-8 rounded-xl bg-[#faf3e6] group-hover:bg-[#0d1b4e] group-hover:text-[#fdb712] flex items-center justify-center text-[#0d1b4e] transition-colors shrink-0">
          <span className="material-symbols-outlined text-[18px]">{icon}</span>
        </div>
      </div>

      {/* Main Number Value */}
      <div className="my-2.5">
        <div className="font-display font-black text-[30px] text-[#0d1b4e] leading-none tracking-tight">
          {value}
        </div>
        {subtitle && (
          <p className="text-[12px] font-medium text-[#767680] mt-1 truncate">
            {subtitle}
          </p>
        )}
      </div>

      {/* Progress / Accent Bar */}
      <div className="h-1.5 w-full bg-[#f4ede0] rounded-full overflow-hidden mt-1">
        <div
          className={`h-full ${accentBg} rounded-full transition-all duration-500`}
          style={{ width: `${Math.min(100, Math.max(15, progressPercent))}%` }}
        />
      </div>
    </div>
  );
}

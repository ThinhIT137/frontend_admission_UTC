"use client";
import { AdminIcon } from "./AdminIcon";

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
  accentBg = "bg-[#192b59]",
}: AdminStatCardProps) {
  return (
    <div className="bg-white p-4 rounded-2xl shadow-xs border border-[#e2e8f0] hover:shadow-md hover:border-[#192b59]/30 transition-all flex flex-col justify-between group">
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <span className="font-stamp text-[11.5px] font-bold text-[#475569] uppercase tracking-wider leading-tight">
          {title}
        </span>
        <div className="w-8 h-8 rounded-xl bg-[#f8fafc] group-hover:bg-[#192b59] group-hover:text-[#fdb712] flex items-center justify-center text-[#192b59] transition-colors shrink-0">
          <AdminIcon name={icon} />
        </div>
      </div>

      {/* Main Number Value */}
      <div className="my-2">
        <div className="font-display font-black text-[28px] sm:text-[30px] text-[#192b59] leading-none tracking-tight">
          {value}
        </div>
        {subtitle && (
          <p className="text-[12px] font-medium text-[#64748b] mt-1.5 leading-snug">
            {subtitle}
          </p>
        )}
      </div>

      {/* Progress / Accent Bar */}
      <div className="h-1.5 w-full bg-[#f1f5f9] rounded-full overflow-hidden mt-1">
        <div
          className={`h-full ${accentBg} rounded-full transition-all duration-500`}
          style={{ width: `${Math.min(100, Math.max(15, progressPercent))}%` }}
        />
      </div>
    </div>
  );
}

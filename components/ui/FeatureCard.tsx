"use client";

import Link from "next/link";

export interface FeatureCardProps {
  title: string;
  description: string;
  badge: string;
  badgeBg?: string;
  icon: string;
  iconBg: string;
  iconColor: string;
  btnText: string;
  btnBg?: string;
  btnColor?: string;
  href: string;
  rotateClass?: string;
  tapeBg?: string;
}

export function FeatureCard({
  title,
  description,
  badge,
  badgeBg = "bg-[#fef08a]",
  icon,
  iconBg,
  iconColor,
  btnText,
  btnBg = "bg-[#0284c7]",
  btnColor = "text-white",
  href,
  rotateClass = "-rotate-1",
  tapeBg = "bg-[#fef08a]",
}: FeatureCardProps) {
  return (
    <div
      className={`group relative bg-white p-5 border-[3px] border-[#111827] shadow-[5px_5px_0px_#111827] rounded-[14px] flex flex-col justify-between ${rotateClass} hover:rotate-0 hover:-translate-y-1 transition-all`}
    >
      {/* Tape Sticker Top */}
      <div
        className={`absolute -top-3 left-1/2 -translate-x-1/2 w-20 h-5 ${tapeBg} border-[2px] border-[#111827] shadow-[1px_1px_0px_#111827] pointer-events-none z-10`}
      ></div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <div
            className={`w-11 h-11 ${iconBg} border-[2.5px] border-[#111827] ${iconColor} shadow-[2px_2px_0px_#111827] flex items-center justify-center rounded-[8px]`}
          >
            <span className="material-symbols-outlined text-[26px]">{icon}</span>
          </div>
          <span
            className={`font-bold text-[11px] ${badgeBg} border-[1.5px] border-[#111827] text-[#111827] px-2 py-0.5 shadow-[1px_1px_0px_#111827] rounded-[4px]`}
          >
            {badge}
          </span>
        </div>

        <h3 className="font-bold text-[18px] text-[#111827] mb-1 font-display">{title}</h3>
        <p className="text-[13px] text-[#4b5563] mb-5 leading-snug">{description}</p>
      </div>

      <Link
        href={href}
        className={`w-full text-center py-2 px-3 ${btnBg} ${btnColor} font-bold text-[15px] border-[2.5px] border-[#111827] shadow-[3px_3px_0px_#111827] hover:opacity-90 active:translate-x-0.5 active:translate-y-0.5 rounded-[8px] transition-all block`}
      >
        {btnText}
      </Link>
    </div>
  );
}

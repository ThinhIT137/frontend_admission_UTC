"use client";
import { motion, useReducedMotion } from "motion/react";
interface LoadingSpinnerProps {
    label?: string;
    sublabel?: string;
    size?: "sm" | "md" | "lg";
    fullScreen?: boolean;
}
export function LoadingSpinner({
    label = "Đang tải dữ liệu…",
    sublabel = "Cổng tuyển sinh UTC",
    size = "md",
    fullScreen = false,
}: LoadingSpinnerProps) {
    const reduced = useReducedMotion();
    const content = (
        <div
            role="status"
            aria-live="polite"
            className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white px-5 py-4 text-[#14244e] shadow-lg"
        >
            <div
                className={`relative shrink-0 ${size === "sm" ? "h-10 w-10" : size === "lg" ? "h-16 w-16" : "h-12 w-12"}`}
            >
                <motion.div
                    aria-hidden="true"
                    className="absolute inset-0 rounded-full border-2 border-blue-100 border-t-orange-500"
                    animate={{ rotate: reduced ? 0 : 360 }}
                    transition={{
                        duration: 1.2,
                        repeat: reduced ? 0 : Infinity,
                        ease: "linear",
                    }}
                />
                <img
                    src="/utc_logo.svg"
                    alt=""
                    className="absolute inset-2 h-[calc(100%-1rem)] w-[calc(100%-1rem)] object-contain"
                />
            </div>
            <div>
                <p className="text-sm font-semibold">{label}</p>
                {sublabel && (
                    <p className="mt-1 text-xs text-slate-500">{sublabel}</p>
                )}
            </div>
        </div>
    );
    return fullScreen ? (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-50/90 p-5">
            {content}
        </div>
    ) : (
        content
    );
}
export default LoadingSpinner;

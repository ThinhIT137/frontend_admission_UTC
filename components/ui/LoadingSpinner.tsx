"use client";

import { Loader2 } from "lucide-react";

export const LoadingSpinner = () => {
    return (
        <div className="flex justify-center items-center absolute w-full h-full inset-0 bg-black/40 backdrop-blur-sm z-[50]">
            <div className="flex items-center gap-3 px-6 py-4 bg-[#f4ede0] border-[3px] border-[#111827] shadow-[6px_6px_0px_#111827] rounded-[12px]">
                <div className="relative flex justify-center items-center w-6 h-6">
                    <div className="absolute w-full h-full border-[4px] border-black/10 rounded-full"></div>
                    <div className="absolute w-full h-full border-[4px] border-[#0284c7] rounded-full border-t-transparent animate-spin"></div>
                </div>
                <span className="font-display font-extrabold text-[15px] text-[#111827]">
                    Đang tải dữ liệu...
                </span>
            </div>
        </div>
    );
};

export default LoadingSpinner;

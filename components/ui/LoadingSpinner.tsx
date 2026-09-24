"use client";

import { Loader2 } from "lucide-react";

const LoadingSpinner = () => {
    return (
        <div className="flex justify-center items-center fixed w-screen h-screen shadow-3xl inset-0 bg-black/20 z-100">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
    );
};

export default LoadingSpinner;

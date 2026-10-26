"use client";
import { useEffect, useState } from "react";

export default function ChatTyping() {
    const [dots, setDots] = useState(1);
    useEffect(() => {
        const timer = window.setInterval(
            () => setDots((value) => (value % 3) + 1),
            450,
        );
        return () => window.clearInterval(timer);
    }, []);
    return (
        <p
            role="status"
            aria-label="Đang trả lời"
            className="text-xs leading-6 text-slate-500"
        >
            <span aria-hidden="true">
                Đang trả lời
                <span className="inline-block w-5 text-left">
                    {".".repeat(dots)}
                </span>
            </span>
        </p>
    );
}

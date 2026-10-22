"use client";

import { useEffect } from "react";

export default function ErrorPage({
    error,
    retry,
}: {
    error: Error & { digest?: string };
    retry: () => void;
}) {
    useEffect(() => {
        console.error("[Lỗi tải trang]", error);
    }, [error]);
    return (
        <section className="p-8 text-center space-y-4">
            <p>Không thể tải trang. Vui lòng thử lại.</p>
            <button
                onClick={retry}
                className="rounded bg-blue-950 px-4 py-2 text-white"
            >
                Thử lại
            </button>
        </section>
    );
}

"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

export function EvidencePreview({ fileKey, title }: { fileKey: string; title: string }) {
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);
  useEffect(() => { setFailed(false); setLoaded(false); }, [fileKey]);
  const match = /^\d{12}\/[\da-f-]{36}\.(pdf|jpg|png)$/.exec(fileKey);
  if (!match) return <p className="mt-2 text-sm text-slate-500">Chưa có tệp minh chứng hợp lệ để xem. Cần bổ sung lại tệp cho hồ sơ này.</p>;
  const preview = `/api/evidence?key=${encodeURIComponent(fileKey)}&mode=inline`;
  const download = `/api/evidence?key=${encodeURIComponent(fileKey)}&mode=download`;
  return <div className="mt-3 space-y-2">
    {match[1] !== "pdf" && <div className="relative h-64 w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-50 sm:h-80">
      {!failed && <Image src={preview} alt={`Minh chứng: ${title}`} fill unoptimized
        sizes="(max-width: 768px) 100vw, 640px" className="object-contain p-2"
        onLoad={() => setLoaded(true)} onError={() => setFailed(true)} />}
      {!loaded && !failed && <p role="status" className="absolute inset-0 flex items-center justify-center text-sm text-slate-500">Đang tải ảnh minh chứng…</p>}
      {failed && <p role="alert" className="flex h-full items-center justify-center px-5 text-center text-sm text-slate-600">Không tải được ảnh minh chứng. Tệp có thể chưa được lưu; hãy thử mở tệp hoặc yêu cầu bổ sung.</p>}
    </div>}
    {match[1] === "pdf" && <p className="text-sm text-slate-600">Tài liệu PDF — mở trực tiếp trong trình duyệt để xem.</p>}
    <div className="flex flex-wrap gap-4 text-sm">
      <a className="font-semibold text-[#192b59] underline" href={preview} target="_blank" rel="noopener noreferrer">{match[1] === "pdf" ? "Mở PDF" : "Mở ảnh đầy đủ"}</a>
      <a className="text-slate-600 underline" href={download} target="_blank" rel="noopener noreferrer">Tải tệp</a>
    </div>
  </div>;
}

"use client";

import Link from "next/link";

export function Footer() {
  return (
    <footer className="w-full bg-[#eee7db] border-t-[3px] border-[#000525] py-4 px-6 mt-auto">
      <div className="flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="font-stamp text-[11px] font-bold text-[#000525] uppercase bg-[#fdb712] px-2 py-0.5 border border-[#000525]">
            UTC FIELD
          </span>
          <span className="text-[13px] text-[#45464f]">
            © 2026 Trường Đại học Giao thông Vận tải. Số 3 phố Cầu Giấy, Q. Đống Đa, Hà Nội.
          </span>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/thong-tin-tuyen-sinh"
            className="font-stamp text-[12px] font-bold text-[#000525] hover:underline uppercase"
          >
            Cẩm nang Thí sinh
          </Link>
          <a
            href="#"
            className="font-stamp text-[12px] font-bold text-[#000525] hover:underline uppercase"
          >
            Ký túc xá
          </a>
          <a
            href="#"
            className="font-stamp text-[12px] font-bold text-[#000525] hover:underline uppercase"
          >
            Học bổng UTC
          </a>
        </div>
      </div>
    </footer>
  );
}

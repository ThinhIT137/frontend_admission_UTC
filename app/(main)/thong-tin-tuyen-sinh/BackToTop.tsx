"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUp } from "lucide-react";

export default function BackToTop() {
  const anchor = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    // Quan sát mốc đầu trang để hoạt động cả khi layout cuộn trong main.
    const observer = new IntersectionObserver(([entry]) => {
      setVisible(!entry.isIntersecting && entry.boundingClientRect.top < 0);
    });
    if (anchor.current) observer.observe(anchor.current);
    return () => observer.disconnect();
  }, []);
  return <>
    <div ref={anchor} aria-hidden="true" className="h-px scroll-mt-24" />
    {/* Link Zalo lấy trực tiếp từ cụm social-link trên trang chủ utc.edu.vn. */}
    <a href="https://zalo.me/3272298449596695943" target="_blank" rel="noopener noreferrer"
      aria-label="Zalo UTC Hà Nội — mở tab mới" title="Zalo UTC Hà Nội · GHA"
      className="fixed bottom-56 right-5 z-40 flex h-11 w-11 items-center justify-center rounded-full border border-blue-500 bg-[#0068ff] text-white shadow-lg transition-colors hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-600 sm:right-7">
      <span className="text-[11px] font-extrabold tracking-tight" aria-hidden="true">Zalo</span>
    </a>
    {/* Fanpage GHA được công bố tại tuyensinh.utc.edu.vn/?q=lien-he. */}
    <a href="https://www.facebook.com/dhgtvtcaugiay/" target="_blank" rel="noopener noreferrer"
      aria-label="Facebook chính thức UTC Hà Nội — mở tab mới" title="Facebook UTC Hà Nội · GHA"
      className="fixed bottom-40 right-5 z-40 flex h-11 w-11 items-center justify-center rounded-full border border-blue-500 bg-[#1877f2] text-white shadow-lg transition-colors hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-600 sm:right-7">
      <svg width="21" height="21" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M13.5 22v-9h3l.5-3.5h-3.5V7.25c0-1 .3-1.75 1.8-1.75H17V2.35A22 22 0 0 0 14.5 2C12 2 10 3.6 10 6.65V9.5H7V13h3v9h3.5Z" /></svg>
    </a>
    {visible && <button type="button" aria-label="Lên đầu trang" title="Lên đầu trang"
      onClick={() => anchor.current?.scrollIntoView({ block: "start", behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" })}
      className="fixed bottom-24 right-5 z-40 flex h-11 w-11 items-center justify-center rounded-full border border-blue-800 bg-blue-950 text-white shadow-lg transition-colors hover:bg-blue-800 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-600 sm:right-7">
      <ArrowUp size={21} aria-hidden="true" />
    </button>}
  </>;
}

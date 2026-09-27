"use client";

export function Header() {
  return (
    <header className="fixed top-0 left-72 right-0 h-16 bg-[#fff9ee] border-b-[3px] border-[#000525] z-40 px-6 flex items-center justify-between shadow-[0_3px_0px_#000525]">
      {/* Portal Tag & Hotline */}
      <div className="flex items-center gap-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#fdb712] border-[2px] border-[#000525] shadow-[2px_2px_0px_#000525]">
          <span className="w-2.5 h-2.5 rounded-full bg-[#ba1a1a] animate-pulse"></span>
          <span className="font-stamp text-[12px] font-bold text-[#000525] uppercase">
            CỔNG TUYỂN SINH CHÍNH THỨC
          </span>
        </div>
        <div className="hidden xl:flex items-center gap-2 px-3 py-1 bg-[#f4ede0] border-[2px] border-[#000525]">
          <span className="material-symbols-outlined text-[#000525] text-[18px]">call</span>
          <span className="font-stamp text-[11px] text-[#000525] font-bold">
            HOTLINE 24/7: (024) 3766 3311
          </span>
        </div>
      </div>

      {/* Right User Status Badge */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 pl-2 border-l-[2px] border-[#c6c5d0]">
          <div className="text-right hidden md:block">
            <span className="block font-stamp text-[13px] font-bold text-[#000525] leading-tight">
              Thí sinh 2k8
            </span>
            <span className="block font-stamp text-[10px] font-bold text-[#7c5800] uppercase">
              XÉT TUYỂN SỚM
            </span>
          </div>
          <div className="w-9 h-9 rounded-full border-[2px] border-[#000525] bg-[#fdb712] flex items-center justify-center shadow-[2px_2px_0px_#000525] overflow-hidden">
            <span className="material-symbols-outlined text-[#000525]">face</span>
          </div>
        </div>
      </div>
    </header>
  );
}

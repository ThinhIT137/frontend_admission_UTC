"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { LoadingProvider } from "@/contexts/loadingContext";
import { useAdminDialog } from "@/hooks/useAdminDialog";
import { AdminSidebar } from "./AdminSidebar";
import { AdminHeader } from "./AdminHeader";
import "./admin.css";

interface AdminShellProps { role?: string; userName?: string; email?: string; children: React.ReactNode; }

export function AdminShell({ role, userName, email, children }: AdminShellProps) {
  const [desktopOpen, setDesktopOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const pathname = usePathname();
  const drawerRef = useAdminDialog(mobileOpen, () => setMobileOpen(false));
  useEffect(() => { setMobileOpen(false); }, [pathname]);
  useEffect(() => {
    const media = window.matchMedia("(min-width: 768px)");
    const update = () => { setIsMobile(!media.matches); if (media.matches) setMobileOpen(false); };
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  const toggle = () => {
    if (window.matchMedia("(min-width: 768px)").matches) setDesktopOpen(value => !value);
    else setMobileOpen(value => !value);
  };
  return <LoadingProvider>
    <div className="admin-ui min-h-screen bg-[#f6f8fc] font-body-md text-slate-800 antialiased print:bg-white">
      <a href="#admin-content" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-xl focus:bg-white focus:p-3">Đi đến nội dung</a>
      {mobileOpen && <button type="button" aria-label="Đóng menu quản trị" onClick={() => setMobileOpen(false)} className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-sm md:hidden print:hidden" />}
      <div ref={drawerRef} inert={!mobileOpen && (isMobile || !desktopOpen)} role={mobileOpen ? "dialog" : undefined} aria-modal={mobileOpen || undefined} aria-label="Điều hướng quản trị" tabIndex={-1}
        className={`fixed inset-y-0 left-0 z-50 w-72 transition-transform duration-200 motion-reduce:transition-none print:hidden ${mobileOpen ? "translate-x-0" : "-translate-x-full"} ${desktopOpen ? "md:translate-x-0" : "md:-translate-x-full"}`}>
        <AdminSidebar role={role} onToggle={toggle} />
      </div>
      <div inert={mobileOpen} className={`flex min-h-screen min-w-0 flex-col print:pl-0 ${desktopOpen ? "md:pl-72" : ""}`}>
        <div className={`fixed inset-x-0 top-0 z-30 h-16 print:hidden ${desktopOpen ? "md:left-72" : ""}`}>
          <AdminHeader userName={userName} email={email} onToggleSidebar={toggle} />
        </div>
        <main id="admin-content" className="min-w-0 flex-1 px-4 pb-10 pt-20 sm:px-6 lg:px-8 print:m-0 print:min-h-0 print:bg-white print:p-0">{children}</main>
      </div>
    </div>
  </LoadingProvider>;
}

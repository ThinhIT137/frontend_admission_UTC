"use client";

import { useState } from "react";
import { AdminSidebar } from "./AdminSidebar";
import { AdminHeader } from "./AdminHeader";

interface AdminShellProps {
  role?: string;
  userName?: string;
  email?: string;
  children: React.ReactNode;
}

export function AdminShell({ role, userName, email, children }: AdminShellProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  return (
    <div className="bg-[#fff9ee] font-body-md text-[#1e1b14] antialiased min-h-screen relative overflow-x-hidden print:bg-white print:min-h-0 print:overflow-visible">
      {/* Fixed Admin Sidebar with slide transition - hoàn toàn ẩn khi in */}
      <div
        className={`fixed left-0 top-0 h-full z-50 transition-all duration-300 ease-in-out print:hidden ${
          isSidebarOpen ? "w-72 translate-x-0" : "w-72 -translate-x-full"
        }`}
      >
        <AdminSidebar role={role} isOpen={isSidebarOpen} onToggle={toggleSidebar} />
      </div>

      {/* Main Admin Area */}
      <div
        className={`flex flex-col min-h-screen transition-all duration-300 ease-in-out print:pl-0 print:m-0 print:w-full print:min-h-0 ${
          isSidebarOpen ? "pl-72" : "pl-0"
        }`}
      >
        {/* Fixed Admin Header - hoàn toàn ẩn khi in */}
        <div
          className={`fixed top-0 right-0 h-16 z-40 transition-all duration-300 ease-in-out print:hidden ${
            isSidebarOpen ? "left-72" : "left-0"
          }`}
        >
          <AdminHeader
            userName={userName}
            email={email}
            isSidebarOpen={isSidebarOpen}
            onToggleSidebar={toggleSidebar}
          />
        </div>

        {/* Page Content */}
        <main className="w-full pt-16 px-8 min-h-screen bg-[#fff9ee] flex-1 pb-12 print:pt-0 print:px-0 print:pb-0 print:bg-white print:min-h-0 print:m-0">
          {children}
        </main>
      </div>
    </div>
  );
}

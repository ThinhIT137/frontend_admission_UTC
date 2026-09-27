"use client";

import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-[#fff9ee] font-body-md text-[#1e1b14] antialiased min-h-screen relative">
      {/* Fixed Admin Sidebar */}
      <AdminSidebar />

      {/* Main Admin Area */}
      <div className="pl-72 flex flex-col min-h-screen">
        {/* Fixed Admin Header */}
        <AdminHeader />

        {/* Page Content */}
        <main className="w-full pt-16 px-8 min-h-screen bg-[#fff9ee] flex-1 pb-12">
          {children}
        </main>
      </div>
    </div>
  );
}

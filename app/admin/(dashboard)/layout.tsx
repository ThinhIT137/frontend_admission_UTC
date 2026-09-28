import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { adminService } from "@/services/user.service";
import { redirect } from "next/navigation";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await adminService.getCurrentUser();
  
  if (!user) {
    redirect("/admin/login");
  }

  return (
    <div className="bg-[#fff9ee] font-body-md text-[#1e1b14] antialiased min-h-screen relative">
      {/* Fixed Admin Sidebar */}
      <AdminSidebar role={user.vai_tro?.ten_vai_tro as any} />

      {/* Main Admin Area */}
      <div className="pl-72 flex flex-col min-h-screen">
        {/* Fixed Admin Header */}
        <AdminHeader userName={user.ho_ten} email={user.email} />

        {/* Page Content */}
        <main className="w-full pt-16 px-8 min-h-screen bg-[#fff9ee] flex-1 pb-12">
          {children}
        </main>
      </div>
    </div>
  );
}


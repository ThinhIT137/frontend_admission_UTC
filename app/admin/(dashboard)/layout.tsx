import { AdminShell } from "@/components/admin/AdminShell";
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
    <AdminShell
      role={user.vai_tro?.ten_vai_tro as any}
      roleMoTa={user.vai_tro?.mo_ta}
      userName={user.ho_ten}
      email={user.email}
    >
      {children}
    </AdminShell>
  );
}

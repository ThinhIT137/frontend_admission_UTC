import { adminService } from "@/services/user.service";
import { roleService } from "@/services/role.service";
import { redirect } from "next/navigation";
import { RoleList } from "./RoleList";

export const metadata = {
  title: "Quản Lý Vai Trò | UTC Admin",
};

interface RolesPageProps {
  searchParams: Promise<{
    search?: string;
    page?: string;
  }>;
}

export default async function RolesPage({ searchParams }: RolesPageProps) {
  const currentUser = await adminService.getCurrentUser();
  
  if (!currentUser) {
    redirect("/admin/login");
  }

  if (currentUser.vai_tro?.ten_vai_tro !== "super_admin") {
    redirect("/admin");
  }

  const resolvedParams = await searchParams;
  const { search, page } = resolvedParams;
  const currentPage = page ? parseInt(page) : 1;
  
  const result = await roleService.get(search, currentPage, 10);

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-[#0d1b4e]">
            Quản Lý Vai Trò
          </h1>
          <p className="text-sm text-[#767680] mt-1">
            Thêm, sửa, xóa các vai trò quản trị trong hệ thống
          </p>
        </div>
      </div>

      <RoleList 
        initialData={result.data as any} 
        totalPages={result.totalPages}
        currentPage={result.page}
      />
    </div>
  );
}

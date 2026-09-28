import { adminService } from "@/services/user.service";
import { VaiTroAdmin } from "@/constants/role";
import { redirect } from "next/navigation";
import { AccountList } from "./AccountList";
import prisma from "@/libs/prisma";

export const metadata = {
  title: "Quản Lý Tài Khoản | UTC Admin",
};

interface AccountsPageProps {
  searchParams: Promise<{
    search?: string;
    role?: string;
    page?: string;
  }>;
}

export default async function AccountsPage({ searchParams }: AccountsPageProps) {
  // 1. Kiểm tra quyền Super Admin
  const currentUser = await adminService.getCurrentUser();
  
  if (!currentUser) {
    redirect("/admin/login");
  }

  if (currentUser.vai_tro?.ten_vai_tro !== VaiTroAdmin.super_admin) {
    redirect("/admin"); // Chỉ super_admin mới được vào trang này
  }

  // 2. Lấy dữ liệu với search và filter
  const resolvedParams = await searchParams;
  const { search, role, page } = resolvedParams;
  const currentPage = page ? parseInt(page) : 1;
  
  const result = await adminService.get(search, role as VaiTroAdmin, currentPage, 10);
  const roles = await prisma.vaiTro.findMany({});

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-[#0d1b4e]">
            Quản Lý Tài Khoản
          </h1>
          <p className="text-sm text-[#767680] mt-1">
            Thêm, sửa, xóa và phân quyền tài khoản quản trị
          </p>
        </div>
      </div>

      <AccountList 
        initialData={result.data as any} 
        currentUserId={currentUser.ma_admin} 
        totalPages={result.totalPages}
        currentPage={result.page}
        roles={roles}
      />
    </div>
  );
}

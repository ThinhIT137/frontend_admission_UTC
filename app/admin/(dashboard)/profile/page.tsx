import { adminService } from "@/services/user.service";
import { redirect } from "next/navigation";
import { ProfileForm } from "./ProfileForm";

export const metadata = {
  title: "Hồ Sơ Của Tôi | UTC Admin",
};

export default async function ProfilePage() {
  const user = await adminService.getCurrentUser();
  
  if (!user) {
    redirect("/admin/login");
  }

  return (
    <div className="max-w-3xl mx-auto py-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold font-display text-[#0d1b4e]">
          Hồ Sơ Của Tôi
        </h1>
        <p className="text-sm text-[#767680] mt-1">
          Quản lý thông tin cá nhân và bảo mật tài khoản
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-[#e9e2d5] overflow-hidden">
        <ProfileForm 
          ma_admin={user.ma_admin}
          initialName={user.ho_ten} 
          initialEmail={user.email} 
          vai_tro={user.vai_tro?.ten_vai_tro as any}
        />
      </div>
    </div>
  );
}

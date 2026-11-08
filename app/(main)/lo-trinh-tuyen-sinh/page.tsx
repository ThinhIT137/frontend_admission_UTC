import { prismaPublic } from "@/libs/prisma";
import { adminService } from "@/services/user.service";
import LoTrinhTuyenSinhClient from "./LoTrinhTuyenSinhClient";
import type { CmsArticleItem } from "@/components/cms";

export const metadata = {
  title: "Lộ trình tuyển sinh | UTC",
  description: "Theo dõi các mốc thời gian tuyển sinh và hướng dẫn được cập nhật trong hệ thống.",
};
export const revalidate = 60;

export default async function LoTrinhPage() {
  let dbMilestones: Awaited<ReturnType<typeof prismaPublic.loTrinhTuyenSinh.findMany>> = [];
  let cmsArticles: CmsArticleItem[] = [];
  let loadError = false;

  // Kiểm tra quyền quản trị CMS (super_admin hoặc chuyen_vien)
  const currentUser = await adminService.getCurrentUser().catch(() => null);
  const canEditCms =
    !!currentUser &&
    ["super_admin", "chuyen_vien"].includes(currentUser.vai_tro?.ten_vai_tro);

  try {
    const [milestonesResult, cmsArticlesResult] = await Promise.allSettled([
      prismaPublic.loTrinhTuyenSinh.findMany({ orderBy: { thoi_gian_bat_dau: "asc" } }),
      prismaPublic.trangNoiDung.findMany({
        where: { ngay_dang: { not: null } },
        select: {
          ma_bai_viet: true,
          tieu_de: true,
          noi_dung_html: true,
          chuyen_muc: true,
        },
        orderBy: { ngay_dang: "desc" },
      }),
    ]);

    if (milestonesResult.status === "fulfilled") {
      dbMilestones = milestonesResult.value;
    } else {
      loadError = true;
      console.error("Không tải được lộ trình tuyển sinh.");
    }

    if (cmsArticlesResult.status === "fulfilled") {
      cmsArticles = cmsArticlesResult.value.map((a) => ({
        id: a.ma_bai_viet,
        title: a.tieu_de,
        content: a.noi_dung_html,
        category: (["ĐỀ ÁN", "QUY CHẾ", "TIN TỨC", "HƯỚNG DẪN"].includes(a.chuyen_muc)
          ? a.chuyen_muc
          : "HƯỚNG DẪN") as any,
      }));
    }
  } catch (err) {
    loadError = true;
    console.error("Lỗi nạp dữ liệu lộ trình hoặc CMS:", err);
  }

  return (
    <LoTrinhTuyenSinhClient
      dbMilestones={dbMilestones}
      referenceTime={new Date().toISOString()}
      loadError={loadError}
      cmsArticles={cmsArticles}
      canEditCms={canEditCms}
    />
  );
}

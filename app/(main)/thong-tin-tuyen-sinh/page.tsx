import { prismaPublic } from "@/libs/prisma";
import { adminService } from "@/services/user.service";
import ThongTinTuyenSinhClient from "./ThongTinTuyenSinhClient";
import type { CmsArticleItem } from "@/components/cms";

export const metadata = {
  title: "Thông tin tuyển sinh | UTC",
  description: "Thông tin phương thức, tin tức, đề án, hướng dẫn và lịch sử tuyển sinh đã công bố trong hệ thống.",
};
export const revalidate = 60;

export default async function AdmissionInfoPage() {
  const now = new Date();

  // Kiểm tra quyền quản trị để hiển thị công cụ CMS (Chỉ super_admin hoặc chuyen_vien mới có quyền)
  const currentUser = await adminService.getCurrentUser().catch(() => null);
  const canEditCms =
    !!currentUser &&
    ["super_admin", "chuyen_vien"].includes(currentUser.vai_tro?.ten_vai_tro);

  // Mỗi nguồn tải độc lập. Lịch sử tuyển sinh quyết định chương trình nào có dữ liệu
  // trong từng năm; nạp đồng thời các bài viết CMS đã xuất bản để hiển thị động.
  const [scores, milestones, cmsArticlesResult] = await Promise.allSettled([
    prismaPublic.lichSuDiemChuan.findMany({
      include: {
        chuong_trinh: {
          include: {
            nganh: true,
            ctdt_to_hop: { select: { nam: true, ma_to_hop: true } },
          },
        },
        diem_trung_tuyen: { include: { phuong_thuc: true } },
      },
      orderBy: [{ nam: "desc" }, { chuong_trinh: { ten_chuong_trinh: "asc" } }],
    }),
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

  const results = [scores, milestones];
  const labels = ["điểm chuẩn", "lộ trình"];
  const loadFailures = results.flatMap((result, i) => (result.status === "rejected" ? [labels[i]] : []));
  if (loadFailures.length) console.error("Chưa tải được một số mục thông tin tuyển sinh:", loadFailures.join(", "));

  const cmsArticles: CmsArticleItem[] =
    cmsArticlesResult.status === "fulfilled"
      ? cmsArticlesResult.value.map((a) => ({
          id: a.ma_bai_viet,
          title: a.tieu_de,
          content: a.noi_dung_html,
          category: (["ĐỀ ÁN", "QUY CHẾ", "TIN TỨC", "HƯỚNG DẪN"].includes(a.chuyen_muc)
            ? a.chuyen_muc
            : "QUY CHẾ") as any,
        }))
      : [];

  return (
    <ThongTinTuyenSinhClient
      admissionHistory={
        scores.status === "fulfilled"
          ? scores.value.map((s) => ({
              id: s.ma_ls_dc,
              year: s.nam,
              majorCode: s.chuong_trinh.nganh.ma_nganh,
              majorName: s.chuong_trinh.nganh.ten_nganh,
              programCode: s.ma_chuong_trinh,
              programName: s.chuong_trinh.ten_chuong_trinh,
              quota: s.chi_tieu,
              combinations: (s.chuong_trinh.ctdt_to_hop ?? [])
                .filter((t) => t.nam === s.nam)
                .map((t) => t.ma_to_hop),
              scores: s.diem_trung_tuyen.map((d) => ({
                methodCode: d.ma_phuong_thuc,
                methodName: d.phuong_thuc.ten_phuong_thuc,
                score: d.diem,
                maxPreference: d.nguyen_vong_toi_da,
                minPriorityScore: d.diem_uu_tien_toi_thieu,
                subjectConditions: d.dieu_kien_mon,
              })),
            }))
          : []
      }
      milestones={
        milestones.status === "fulfilled"
          ? milestones.value.map((m) => ({
              id: m.ma_su_kien,
              title: m.ten_su_kien,
              startDate: m.thoi_gian_bat_dau.toISOString(),
              endDate: m.thoi_gian_ket_thuc?.toISOString() ?? null,
              note: m.ghi_chu,
            }))
          : []
      }
      cmsArticles={cmsArticles}
      canEditCms={canEditCms}
      referenceTime={now.toISOString()}
      loadFailures={loadFailures}
    />
  );
}

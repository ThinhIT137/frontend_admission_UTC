import prisma from "@/libs/prisma";
import TinTucDeAnClient, { ArticleData } from "./TinTucDeAnClient";

export const metadata = {
  title: "Quản Lý Tin Tức & Đề Án | UTC Admin",
};

export const revalidate = 0;

export default async function ArticlesAdminPage() {
  let initialArticles: ArticleData[] = [];

  try {
    const dbArticles = await prisma.trangNoiDung.findMany({
      orderBy: {
        ngay_dang: "desc",
      },
    });

    if (dbArticles.length > 0) {
      initialArticles = dbArticles.map((item) => ({
        id: item.ma_bai_viet,
        title: item.tieu_de,
        category: (["ĐỀ ÁN", "QUY CHẾ", "TIN TỨC", "HƯỚNG DẪN"].includes(item.chuyen_muc)
          ? item.chuyen_muc
          : "ĐỀ ÁN") as any,
        summary: item.noi_dung_html ? item.noi_dung_html.slice(0, 150) + "..." : "Thông tin tuyển sinh UTC",
        content: item.noi_dung_html || "",
        fileName: "De_an_tuyen_sinh_UTC.pdf",
        fileUrl: "/documents/De_an_tuyen_sinh_UTC.pdf",
        fileSize: "2.4 MB",
        publishedDate: item.ngay_dang ? item.ngay_dang.toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
        status: item.ngay_dang ? "PUBLISHED" : "DRAFT",
      }));
    }
  } catch (err) {
    console.error("Lỗi nạp danh sách bài viết/đề án từ DB:", err);
  }

  return <TinTucDeAnClient initialData={initialArticles} />;
}

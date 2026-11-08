import { prismaPublic } from "@/libs/prisma";
import { adminService } from "@/services/user.service";
import TinhDiemQuyDoiClient, { ProgramScoreItem, ToHopItem } from "./TinhDiemQuyDoiClient";
import type { CmsArticleItem } from "@/components/cms";

export const metadata = {
  title: "Tính Điểm Quy Đổi & So Sánh Cơ Hội Xét Tuyển UTC 2026",
  description:
    "Công cụ quy đổi điểm thi THPT, chứng chỉ IELTS/SAT, ĐGNL HSA, ĐGTD TSA sang thang điểm chuẩn tuyển sinh Trường Đại học Giao thông Vận tải (UTC) và đối soát cơ hội trúng tuyển.",
};

export const revalidate = 60; // 1 minute ISR

export default async function ScoreCalculatorPage() {
  let programs: ProgramScoreItem[] = [];
  let toHops: ToHopItem[] = [];
  let cmsArticles: CmsArticleItem[] = [];

  // Kiểm tra quyền quản trị CMS (super_admin hoặc chuyen_vien)
  const currentUser = await adminService.getCurrentUser().catch(() => null);
  const canEditCms =
    !!currentUser &&
    ["super_admin", "chuyen_vien"].includes(currentUser.vai_tro?.ten_vai_tro);

  try {
    // Tải các bài viết CMS để hiển thị disclaimer hoặc hướng dẫn động
    const dbArticles = await prismaPublic.trangNoiDung.findMany({
      where: { ngay_dang: { not: null } },
      select: {
        ma_bai_viet: true,
        tieu_de: true,
        noi_dung_html: true,
        chuyen_muc: true,
      },
      orderBy: { ngay_dang: "desc" },
    });

    cmsArticles = dbArticles.map((a) => ({
      id: a.ma_bai_viet,
      title: a.tieu_de,
      content: a.noi_dung_html,
      category: (["ĐỀ ÁN", "QUY CHẾ", "TIN TỨC", "HƯỚNG DẪN"].includes(a.chuyen_muc)
        ? a.chuyen_muc
        : "QUY CHẾ") as any,
    }));
  } catch (error) {
    console.error("Lỗi truy vấn bài viết CMS cho trang tính điểm quy đổi:", error);
  }

  try {
    // Lịch sử theo năm là nguồn gốc; chương trình chỉ cung cấp thông tin mô tả.
    // Giữ các năm cũ để tra cột Y-1, không biến chúng thành đề án của năm chọn.
    const annualRecords = await prismaPublic.lichSuDiemChuan.findMany({
      select: {
        ma_chuong_trinh: true,
        nam: true,
        chi_tieu: true,
        diem_trung_tuyen: {
          select: {
            diem: true,
            ma_phuong_thuc: true,
            dieu_kien_mon: true,
            diem_uu_tien_toi_thieu: true,
            nguyen_vong_toi_da: true,
            phuong_thuc: { select: { ma_phuong_thuc: true, ten_phuong_thuc: true } },
          },
        },
        chuong_trinh: { select: {
          ma_chuong_trinh: true,
          ten_chuong_trinh: true,
          ma_nganh: true,
          nganh: {
            select: {
              ma_nganh: true,
              ten_nganh: true,
              khoi_kien_thuc: true,
              khoi_nganh: {
                select: {
                  ma_khoi_nganh: true,
                  ten_khoi_nganh: true,
                },
              },
            },
          },
          ctdt_to_hop: {
            select: {
              nam: true,
              ma_to_hop: true,
              to_hop: {
                select: {
                  ma_to_hop: true,
                  mon_1: { select: { ten_mon: true } },
                  mon_2: { select: { ten_mon: true } },
                  mon_3: { select: { ten_mon: true } },
                },
              },
            },
          },
        } },
      },
      orderBy: [{ nam: "desc" }, { ma_chuong_trinh: "asc" }],
    });

    const byCode = new Map<string, ProgramScoreItem>();
    for (const { chuong_trinh, ma_chuong_trinh, ...history } of annualRecords) {
      let program = byCode.get(ma_chuong_trinh);
      if (!program) {
        program = { ...chuong_trinh, lich_su_diem_chuan: [] };
        byCode.set(ma_chuong_trinh, program);
      }
      program.lich_su_diem_chuan!.push(history);
    }
    programs = JSON.parse(JSON.stringify([...byCode.values()]));
  } catch (error) {
    console.error("Lỗi truy vấn dữ liệu chương trình đào tạo cho công cụ quy đổi điểm:", error);
  }

  try {
    // 2. Lấy danh sách tổ hợp môn xét tuyển
    const rawToHops = await prismaPublic.toHopXetTuyen.findMany({
      select: {
        ma_to_hop: true,
        ma_mon_1: true,
        ma_mon_2: true,
        ma_mon_3: true,
        mon_1: { select: { ten_mon: true } },
        mon_2: { select: { ten_mon: true } },
        mon_3: { select: { ten_mon: true } },
      },
      orderBy: { ma_to_hop: "asc" },
    });

    toHops = JSON.parse(JSON.stringify(rawToHops));
  } catch (error) {
    console.error("Lỗi truy vấn danh sách tổ hợp xét tuyển:", error);
  }

  return (
    <TinhDiemQuyDoiClient
      initialPrograms={programs}
      initialToHops={toHops}
      referenceYear={Number(new Intl.DateTimeFormat("en", { year: "numeric", timeZone: "Asia/Ho_Chi_Minh" }).format(new Date()))}
      cmsArticles={cmsArticles}
      canEditCms={canEditCms}
    />
  );
}

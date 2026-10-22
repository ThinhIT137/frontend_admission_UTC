import { prismaPublic } from "@/libs/prisma";
import ThongTinTuyenSinhClient from "./ThongTinTuyenSinhClient";

export const metadata = {
  title: "Thông tin tuyển sinh | UTC",
  description: "Thông tin phương thức, tin tức, đề án, hướng dẫn và lịch sử tuyển sinh đã công bố trong hệ thống.",
};
export const revalidate = 60;

export default async function AdmissionInfoPage() {
  const now = new Date();
  // Independent sections remain usable when one data source is unavailable.
  const [methods, faculties, majors, programs, faqs, scores, articles, milestones] = await Promise.allSettled([
    prismaPublic.phuongThucXetTuyen.findMany({ orderBy: { ma_phuong_thuc: "asc" } }),
    prismaPublic.khoiNganh.findMany({ include: { _count: { select: { nganh_hoc: true } } }, orderBy: { ten_khoi_nganh: "asc" } }),
    prismaPublic.nganhHoc.count(),
    prismaPublic.chuongTrinhDaoTao.count(),
    prismaPublic.triThucAi.findMany({ where: { trang_thai: "active", cau_hoi_mau: { not: null } }, orderBy: { create_at: "desc" } }),
    prismaPublic.lichSuDiemChuan.findMany({
      include: { chuong_trinh: { include: { nganh: true } }, diem_trung_tuyen: { include: { phuong_thuc: true } } },
      orderBy: [{ nam: "desc" }, { chuong_trinh: { ten_chuong_trinh: "asc" } }],
    }),
    prismaPublic.trangNoiDung.findMany({
      where: { ngay_dang: { not: null, lte: now }, chuyen_muc: { in: ["ĐỀ ÁN", "QUY CHẾ", "TIN TỨC", "HƯỚNG DẪN"] } },
      select: { ma_bai_viet: true, tieu_de: true, noi_dung_html: true, chuyen_muc: true, ngay_dang: true },
      orderBy: { ngay_dang: "desc" },
    }),
    prismaPublic.loTrinhTuyenSinh.findMany({ orderBy: { thoi_gian_bat_dau: "asc" } }),
  ]);
  const results = [methods, faculties, majors, programs, faqs, scores, articles, milestones];
  const labels = ["phương thức", "khối ngành", "số ngành", "số chương trình", "hỏi đáp", "điểm chuẩn", "tin tức và đề án", "lộ trình"];
  const loadFailures = results.flatMap((result, i) => result.status === "rejected" ? [labels[i]] : []);
  if (loadFailures.length) console.error("Chưa tải được một số mục thông tin tuyển sinh:", loadFailures.join(", "));
  return <ThongTinTuyenSinhClient
    methods={methods.status === "fulfilled" ? methods.value.map(m => ({ code: m.ma_phuong_thuc, name: m.ten_phuong_thuc })) : []}
    faculties={faculties.status === "fulfilled" ? faculties.value.map(f => ({ code: f.ma_khoi_nganh, name: f.ten_khoi_nganh, majorCount: f._count.nganh_hoc })) : []}
    totalMajors={majors.status === "fulfilled" ? majors.value : null}
    totalPrograms={programs.status === "fulfilled" ? programs.value : null}
    faqs={faqs.status === "fulfilled" ? faqs.value.filter(f => {
      const text = `${f.chu_de ?? ""} ${f.cau_hoi_mau ?? ""}`.toLowerCase();
      return !!f.cau_hoi_mau?.trim() && !!f.noi_dung?.trim() && !/chunk|bloom|test|niên giám|chuẩn đầu ra|cđr/.test(text);
    }).map(f => ({ id: f.ma_tri_thuc, topic: f.chu_de || "Hỏi đáp tuyển sinh", question: f.cau_hoi_mau!, answer: f.noi_dung })) : []}
    admissionHistory={scores.status === "fulfilled" ? scores.value.map(s => ({
      id: s.ma_ls_dc, year: s.nam, majorCode: s.chuong_trinh.nganh.ma_nganh, majorName: s.chuong_trinh.nganh.ten_nganh,
      programCode: s.ma_chuong_trinh, programName: s.chuong_trinh.ten_chuong_trinh, quota: s.chi_tieu,
      scores: s.diem_trung_tuyen.map(d => ({ methodCode: d.ma_phuong_thuc, methodName: d.phuong_thuc.ten_phuong_thuc, score: d.diem })),
    })) : []}
    articles={articles.status === "fulfilled" ? articles.value.map(a => ({ id: a.ma_bai_viet, title: a.tieu_de, category: a.chuyen_muc, content: a.noi_dung_html, publishedAt: a.ngay_dang!.toISOString() })) : []}
    milestones={milestones.status === "fulfilled" ? milestones.value.map(m => ({ id: m.ma_su_kien, title: m.ten_su_kien, startDate: m.thoi_gian_bat_dau.toISOString(), endDate: m.thoi_gian_ket_thuc?.toISOString() ?? null, note: m.ghi_chu })) : []}
    referenceTime={now.toISOString()}
    loadFailures={loadFailures}
  />;
}

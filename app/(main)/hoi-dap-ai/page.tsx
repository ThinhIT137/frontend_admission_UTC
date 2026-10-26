import { prismaPublic } from "@/libs/prisma";
import ChatbotClient, { type ChatbotKnowledgeBase } from "./ChatbotClient";

export const metadata = { title: "Hỏi đáp tuyển sinh UTC Hà Nội", description: "Tư vấn AI và tra cứu dữ liệu tuyển sinh UTC GHA." };
export const revalidate = 60;

export default async function AIChatPage() {
  const year = Number(new Intl.DateTimeFormat("en", { year: "numeric", timeZone: "Asia/Ho_Chi_Minh" }).format(new Date()));
  const [programs, faqs, methods, milestones] = await Promise.allSettled([
    prismaPublic.chuongTrinhDaoTao.findMany({
      where: { lich_su_diem_chuan: { some: { nam: year } } },
      include: { nganh: { include: { khoi_nganh: true } },
        ctdt_to_hop: { where: { nam: year } },
        lich_su_diem_chuan: { where: { nam: { in: [year, year - 1] } }, orderBy: { nam: "desc" },
          include: { diem_trung_tuyen: { include: { phuong_thuc: true } } } },
      }, orderBy: { ten_chuong_trinh: "asc" },
    }),
    prismaPublic.triThucAi.findMany({ where: { trang_thai: "active" }, orderBy: { create_at: "desc" } }),
    prismaPublic.phuongThucXetTuyen.findMany({ orderBy: { ma_phuong_thuc: "asc" } }),
    prismaPublic.loTrinhTuyenSinh.findMany({ orderBy: { thoi_gian_bat_dau: "asc" } }),
  ]);
  const rows = programs.status === "fulfilled" ? programs.value : [];
  const knowledgeBase: ChatbotKnowledgeBase = {
    referenceYear: year,
    dataUnavailable: programs.status === "rejected",
    programs: rows.map(program => ({
      maChuongTrinh: program.ma_chuong_trinh, tenChuongTrinh: program.ten_chuong_trinh,
      maNganh: program.ma_nganh, tenNganh: program.nganh.ten_nganh,
      khoiNganh: program.nganh.khoi_nganh?.ten_khoi_nganh, moTaNgan: program.mo_ta_ngan,
      toHopMon: [...new Set(program.ctdt_to_hop.map(item => item.ma_to_hop))],
      chiTieuNamDangXet: program.lich_su_diem_chuan.find(item => item.nam === year)?.chi_tieu ?? null,
      diemChuanGanNhat: program.lich_su_diem_chuan.flatMap(history => history.diem_trung_tuyen
        .filter(score => Number.isFinite(score.diem) && score.diem > 0)
        .map(score => ({ nam: history.nam, phuongThuc: score.phuong_thuc.ten_phuong_thuc, diem: score.diem }))),
    })),
    faqs: faqs.status === "fulfilled" ? faqs.value.map(item => ({ maTriThuc: item.ma_tri_thuc, chuDe: item.chu_de, cauHoiMau: item.cau_hoi_mau, noiDung: item.noi_dung })) : [],
    methods: methods.status === "fulfilled" ? methods.value.map(item => ({ maPhuongThuc: item.ma_phuong_thuc, tenPhuongThuc: item.ten_phuong_thuc })) : [],
    milestones: milestones.status === "fulfilled" ? milestones.value.map(item => ({ tenSuKien: item.ten_su_kien, thoiGianBatDau: item.thoi_gian_bat_dau.toISOString(), thoiGianKetThuc: item.thoi_gian_ket_thuc?.toISOString() ?? null, ghiChu: item.ghi_chu })) : [],
    totalMajors: new Set(rows.map(item => item.ma_nganh)).size,
    totalQuota: rows.reduce((sum, item) => sum + (item.lich_su_diem_chuan.find(history => history.nam === year)?.chi_tieu ?? 0), 0),
  };
  return <ChatbotClient knowledgeBase={knowledgeBase} />;
}

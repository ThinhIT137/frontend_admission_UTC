import { Suspense } from "react";
import { prismaPublic } from "@/libs/prisma";
import ChatbotClient, {
  ChatbotKnowledgeBase,
  ProgramKnowledge,
  FaqKnowledge,
  MethodKnowledge,
  MilestoneKnowledge,
} from "./ChatbotClient";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

export const metadata = {
  title: "Hỏi Đáp AI Tuyển Sinh UTC 24/7 | Trường Đại học Giao thông Vận tải",
  description:
    "Trợ lý tư vấn AI tuyển sinh K66 kết nối trực tiếp cơ sở dữ liệu Đại học Giao thông Vận tải: điểm chuẩn các năm, chỉ tiêu, ngành đào tạo, quy đổi IELTS và phương thức xét tuyển.",
};

export const revalidate = 60; // Cache 60s for high performance & instant response

export default async function AIChatPage() {
  let knowledgeBase: ChatbotKnowledgeBase = {
    programs: [],
    faqs: [],
    methods: [],
    milestones: [],
    totalMajors: 0,
    totalQuota: 6000,
  };

  try {
    const [
      dbPrograms,
      dbFaqs,
      dbMethods,
      dbMilestones,
      countMajors,
      quota2026,
      quota2025,
    ] = await Promise.all([
      prismaPublic.chuongTrinhDaoTao.findMany({
        include: {
          nganh: {
            include: {
              khoi_nganh: true,
            },
          },
          ctdt_to_hop: {
            include: {
              to_hop: true,
            },
          },
          lich_su_diem_chuan: {
            include: {
              diem_trung_tuyen: {
                include: {
                  phuong_thuc: true,
                },
              },
            },
            orderBy: { nam: "desc" },
            take: 3,
          },
        },
        orderBy: { luot_xem: "desc" },
      }),
      prismaPublic.triThucAi.findMany({
        where: { trang_thai: "active" },
        orderBy: { create_at: "desc" },
      }),
      prismaPublic.phuongThucXetTuyen.findMany({
        orderBy: { ma_phuong_thuc: "asc" },
      }),
      prismaPublic.loTrinhTuyenSinh.findMany({
        orderBy: { thoi_gian_bat_dau: "asc" },
      }),
      prismaPublic.nganhHoc.count(),
      prismaPublic.lichSuDiemChuan.aggregate({
        where: { nam: 2026 },
        _sum: { chi_tieu: true },
      }),
      prismaPublic.lichSuDiemChuan.aggregate({
        where: { nam: 2025 },
        _sum: { chi_tieu: true },
      }),
    ]);

    // Format danh mục chương trình đào tạo & Điểm chuẩn từ DB
    const formattedPrograms: ProgramKnowledge[] = dbPrograms.map((p: any) => {
      const toHopMonList: string[] = Array.from(
        new Set((p.ctdt_to_hop || []).map((ct: any) => String(ct.ma_to_hop)))
      );

      const diemChuanList: ProgramKnowledge["diemChuanGanNhat"] = [];
      (p.lich_su_diem_chuan || []).forEach((ls: any) => {
        (ls.diem_trung_tuyen || []).forEach((dt: any) => {
          diemChuanList.push({
            nam: ls.nam,
            phuongThuc: dt.phuong_thuc?.ten_phuong_thuc || dt.ma_phuong_thuc,
            diem: dt.diem,
          });
        });
      });

      return {
        maChuongTrinh: p.ma_chuong_trinh,
        tenChuongTrinh: p.ten_chuong_trinh,
        maNganh: p.ma_nganh,
        tenNganh: p.nganh?.ten_nganh,
        khoiNganh: p.nganh?.khoi_nganh?.ten_khoi_nganh || "Trường ĐH Giao thông Vận tải",
        moTaNgan: p.mo_ta_ngan,
        toHopMon: toHopMonList,
        chiTieu2026: p.lich_su_diem_chuan?.[0]?.chi_tieu || null,
        diemChuanGanNhat: diemChuanList,
      };
    });

    // Format FAQ Tri thức AI
    const formattedFaqs: FaqKnowledge[] = dbFaqs.map((f) => ({
      maTriThuc: f.ma_tri_thuc,
      chuDe: f.chu_de,
      cauHoiMau: f.cau_hoi_mau,
      noiDung: f.noi_dung,
    }));

    // Format Phương thức tuyển sinh
    const formattedMethods: MethodKnowledge[] = dbMethods.map((m) => ({
      maPhuongThuc: m.ma_phuong_thuc,
      tenPhuongThuc: m.ten_phuong_thuc,
    }));

    // Format Lộ trình sự kiện
    const formattedMilestones: MilestoneKnowledge[] = dbMilestones.map((ms) => ({
      tenSuKien: ms.ten_su_kien,
      thoiGianBatDau: ms.thoi_gian_bat_dau.toISOString(),
      thoiGianKetThuc: ms.thoi_gian_ket_thuc?.toISOString() || null,
      ghiChu: ms.ghi_chu,
    }));

    const calculatedQuota =
      quota2026._sum.chi_tieu || quota2025._sum.chi_tieu || 6000;

    knowledgeBase = {
      programs: formattedPrograms,
      faqs: formattedFaqs,
      methods: formattedMethods,
      milestones: formattedMilestones,
      totalMajors: countMajors || formattedPrograms.length,
      totalQuota: calculatedQuota,
    };
  } catch (error) {
    console.error("Lỗi truy vấn tri thức CSDL cho Chatbot AI:", error);
    // Fallback tri thức cơ bản nếu CSDL tạm thời gián đoạn
    knowledgeBase = {
      programs: [
        {
          maChuongTrinh: "7480201",
          tenChuongTrinh: "Công nghệ thông tin",
          maNganh: "7480201",
          khoiNganh: "Khoa Công nghệ Thông tin",
          toHopMon: ["A00", "A01", "D01", "D07"],
          chiTieu2026: 360,
          diemChuanGanNhat: [
            { nam: 2025, phuongThuc: "Thi THPT", diem: 25.85 },
            { nam: 2024, phuongThuc: "Thi THPT", diem: 26.15 },
          ],
        },
        {
          maChuongTrinh: "7520216",
          tenChuongTrinh: "Kỹ thuật Robot và Trí tuệ nhân tạo",
          maNganh: "7520216",
          khoiNganh: "Khoa Điện - Điện tử",
          toHopMon: ["A00", "A01", "D07"],
          chiTieu2026: 120,
          diemChuanGanNhat: [
            { nam: 2025, phuongThuc: "Thi THPT", diem: 26.0 },
          ],
        },
        {
          maChuongTrinh: "7510605",
          tenChuongTrinh: "Logistics và Quản lý chuỗi cung ứng",
          maNganh: "7510605",
          khoiNganh: "Khoa Vận tải - Kinh tế",
          toHopMon: ["A00", "A01", "D01", "D07"],
          chiTieu2026: 250,
          diemChuanGanNhat: [
            { nam: 2025, phuongThuc: "Thi THPT", diem: 26.1 },
          ],
        },
      ],
      faqs: [
        {
          maTriThuc: "fb-1",
          chuDe: "Quy đổi IELTS",
          cauHoiMau: "Quy đổi chứng chỉ IELTS sang điểm môn Tiếng Anh?",
          noiDung:
            "IELTS 5.0 quy đổi thành 8.0 điểm, IELTS 5.5 = 8.5 điểm, IELTS 6.0 = 9.0 điểm, IELTS 6.5 trở lên = 10.0 điểm tuyệt đối.",
        },
      ],
      methods: [
        { maPhuongThuc: "PT1", tenPhuongThuc: "Xét tuyển theo kết quả thi tốt nghiệp THPT năm 2026" },
        { maPhuongThuc: "PT2", tenPhuongThuc: "Xét tuyển kết hợp Chứng chỉ Tiếng Anh quốc tế & Học bạ" },
        { maPhuongThuc: "PT3", tenPhuongThuc: "Xét tuyển theo kết quả học bạ THPT (5 học kỳ)" },
        { maPhuongThuc: "PT4", tenPhuongThuc: "Xét tuyển theo kết quả Đánh giá tư duy (TSA - ĐHBK Hà Nội)" },
      ],
      milestones: [],
      totalMajors: 35,
      totalQuota: 6000,
    };
  }

  return (
    <Suspense
      fallback={
        <div className="min-h-[450px] flex items-center justify-center">
          <LoadingSpinner />
        </div>
      }
    >
      <ChatbotClient knowledgeBase={knowledgeBase} />
    </Suspense>
  );
}

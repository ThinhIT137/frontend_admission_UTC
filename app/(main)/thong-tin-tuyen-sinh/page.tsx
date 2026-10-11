import { Suspense } from "react";
import { prismaPublic } from "@/libs/prisma";
import ThongTinTuyenSinhClient, {
  MilestoneItem,
  MethodItem,
  FacultySummary,
  FaqItem,
} from "./ThongTinTuyenSinhClient";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

export const metadata = {
  title: "Thông Tin & Quy Chế Tuyển Sinh | Trường Đại học Giao thông Vận tải (Hà Nội)",
  description:
    "Tổng hợp đề án, phương thức xét tuyển, chỉ tiêu đào tạo và mốc thời gian tuyển sinh Đại học chính quy Trường ĐH Giao thông Vận tải Cơ sở Hà Nội (GHA) năm 2026.",
};

export const revalidate = 60; // Cache 60s for high performance

export default async function AdmissionInfoPage() {
  let milestones: MilestoneItem[] = [];
  let methods: MethodItem[] = [];
  let faculties: FacultySummary[] = [];
  let totalMajors = 0;
  let totalPrograms = 0;
  let totalQuota = 0;
  let faqs: FaqItem[] = [];

  try {
    // Only aggregate quota for the current admission year (2026 or 2025), not sum all historical years
    const [
      dbMilestones,
      dbMethods,
      dbFaculties,
      countMajors,
      countPrograms,
      dbFaqs,
      quota2026,
      quota2025,
    ] = await Promise.all([
      prismaPublic.loTrinhTuyenSinh.findMany({
        orderBy: { thoi_gian_bat_dau: "asc" },
      }),
      prismaPublic.phuongThucXetTuyen.findMany({
        orderBy: { ma_phuong_thuc: "asc" },
      }),
      prismaPublic.khoiNganh.findMany({
        include: {
          _count: {
            select: { nganh_hoc: true },
          },
        },
        orderBy: { ten_khoi_nganh: "asc" },
      }),
      prismaPublic.nganhHoc.count(),
      prismaPublic.chuongTrinhDaoTao.count(),
      prismaPublic.triThucAi.findMany({
        where: { trang_thai: "active" },
        orderBy: { create_at: "desc" },
        take: 8,
      }),
      prismaPublic.lichSuDiemChuan.aggregate({
        where: { nam: 2026 },
        _sum: { chi_tieu: true },
      }),
      prismaPublic.lichSuDiemChuan.aggregate({
        where: { nam: 2025 },
        _sum: { chi_tieu: true },
      }),
    ]);

    totalMajors = countMajors;
    totalPrograms = countPrograms;
    // Real quota for current admission season at Hanoi campus
    totalQuota = quota2026._sum.chi_tieu || quota2025._sum.chi_tieu || 6000;

    // Process Milestones
    const now = new Date();
    milestones = dbMilestones.map((m) => {
      const start = new Date(m.thoi_gian_bat_dau);
      const end = m.thoi_gian_ket_thuc ? new Date(m.thoi_gian_ket_thuc) : null;

      let status: "PAST" | "ACTIVE" | "UPCOMING" = "UPCOMING";
      let statusText = "SẮP DIỄN RA";

      if (end ? now > end : now.getTime() > start.getTime() + 7 * 86400000) {
        status = "PAST";
        statusText = "ĐÃ KẾT THÚC";
      } else if (now >= start && (!end || now <= end)) {
        status = "ACTIVE";
        statusText = "ĐANG DIỄN RA";
      }

      const formatDate = (d: Date) => {
        return d.toLocaleDateString("vi-VN", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        });
      };

      return {
        id: m.ma_su_kien,
        title: m.ten_su_kien,
        startDate: formatDate(start),
        endDate: end ? formatDate(end) : null,
        note: m.ghi_chu,
        status,
        statusText,
      };
    });

    // Process Methods
    methods = dbMethods.map((pt) => {
      let desc = "Xét tuyển Đại học chính quy Cơ sở Hà Nội.";
      const lower = pt.ten_phuong_thuc.toLowerCase() + " " + pt.ma_phuong_thuc.toLowerCase();
      if (lower.includes("thpt") || lower.includes("100")) {
        desc = "Xét tuyển dựa trên tổng điểm thi tốt nghiệp THPT năm 2026 của tổ hợp 3 môn xét tuyển.";
      } else if (lower.includes("học bạ") || lower.includes("200")) {
        desc = "Xét tuyển dựa trên kết quả học bạ THPT (tổng điểm trung bình các học kỳ theo tổ hợp môn).";
      } else if (lower.includes("đgnl") || lower.includes("402")) {
        desc = "Xét tuyển theo kết quả kỳ thi Đánh giá năng lực của ĐHQG Hà Nội (HSA) hoặc ĐGTD ĐH Bách Khoa.";
      } else if (lower.includes("kết hợp") || lower.includes("ielts")) {
        desc = "Xét tuyển kết hợp chứng chỉ Tiếng Anh quốc tế (IELTS từ 5.0 trở lên) với điểm thi tốt nghiệp THPT.";
      } else if (lower.includes("thẳng") || lower.includes("301")) {
        desc = "Xét tuyển thẳng theo quy chế hiện hành của Bộ GD&ĐT dành cho học sinh đạt giải quốc gia/quốc tế.";
      }

      return {
        code: pt.ma_phuong_thuc,
        name: pt.ten_phuong_thuc,
        description: desc,
      };
    });

    // Process Faculties
    faculties = dbFaculties.map((f) => ({
      code: f.ma_khoi_nganh,
      name: f.ten_khoi_nganh,
      majorCount: f._count.nganh_hoc,
    }));

    // Process FAQs
    faqs = dbFaqs.map((f) => ({
      id: f.ma_tri_thuc,
      topic: f.chu_de || "Tư vấn chung",
      question: f.cau_hoi_mau || "Câu hỏi thường gặp",
      answer: f.noi_dung,
    }));
  } catch (error) {
    console.error("Lỗi tải thông tin tuyển sinh từ database:", error);
  }

  // Graceful Fallback if DB tables are currently empty
  if (milestones.length === 0) {
    milestones = [
      {
        id: "ms1",
        title: "Đăng Ký Hồ Sơ Xét Tuyển Sớm & Chứng Chỉ Quốc Tế",
        startDate: "01/03/2026",
        endDate: "30/05/2026",
        note: "Nộp hồ sơ xét học bạ, chứng chỉ IELTS và điểm thi ĐGNL ĐHQG Hà Nội trên cổng trực tuyến UTC Hà Nội.",
        status: "ACTIVE",
        statusText: "ĐANG MỞ HỒ SƠ",
      },
      {
        id: "ms2",
        title: "Kỳ Thi Tốt Nghiệp THPT Quốc Gia Năm 2026",
        startDate: "26/06/2026",
        endDate: "29/06/2026",
        note: "Thí sinh tham dự kỳ thi tốt nghiệp THPT tại các điểm thi trên cả nước.",
        status: "UPCOMING",
        statusText: "SẮP DIỄN RA",
      },
      {
        id: "ms3",
        title: "Đăng Ký & Điều Chỉnh Nguyện Vọng Trên Cổng Thông Tin Bộ GD&ĐT",
        startDate: "10/07/2026",
        endDate: "30/07/2026",
        note: "Thực hiện đăng ký tất cả nguyện vọng xét tuyển vào mã trường GHA theo thứ tự ưu tiên trên hệ thống chung.",
        status: "UPCOMING",
        statusText: "SẮP DIỄN RA",
      },
      {
        id: "ms4",
        title: "Công Bố Điểm Chuẩn & Xác Nhận Nhập Học Tân Sinh Viên K66",
        startDate: "20/08/2026",
        endDate: "31/08/2026",
        note: "Tra cứu kết quả trúng tuyển chính thức và làm thủ tục nhập học trực tiếp hoặc trực tuyến tại UTC Hà Nội.",
        status: "UPCOMING",
        statusText: "CHUẨN BỊ K66",
      },
    ];
  }

  if (methods.length === 0) {
    methods = [
      {
        code: "PT100",
        name: "Xét tuyển theo kết quả thi tốt nghiệp THPT năm 2026",
        description: "Sử dụng kết quả tổ hợp 3 môn thi tốt nghiệp THPT Quốc gia năm 2026 theo mã tổ hợp ngành đăng ký.",
      },
      {
        code: "PT200",
        name: "Xét tuyển kết hợp Chứng chỉ Quốc tế & Điểm THPT",
        description: "Xét kết hợp chứng chỉ IELTS từ 5.0 trở lên hoặc SAT với tổng điểm 2 môn trong tổ hợp xét tuyển.",
      },
      {
        code: "PT402",
        name: "Xét tuyển theo kết quả Thi ĐGNL ĐHQG Hà Nội & ĐGTD Bách Khoa",
        description: "Sử dụng điểm bài thi ĐGNL của ĐHQG Hà Nội (HSA) hoặc Đánh giá tư duy ĐHBK Hà Nội (TSA).",
      },
      {
        code: "PT301",
        name: "Xét tuyển thẳng theo quy chế của Bộ GD&ĐT",
        description: "Dành cho thí sinh đạt giải học sinh giỏi quốc gia, cuộc thi KHKT cấp quốc gia và quốc tế.",
      },
    ];
  }

  if (faqs.length === 0) {
    faqs = [
      {
        id: "faq1",
        topic: "Địa Điểm Đào Tạo",
        question: "Trường Đại học Giao thông Vận tải Cơ sở Hà Nội ở đâu?",
        answer: "Cơ sở chính tọa lạc tại Số 3 phố Cầu Giấy, Phường Láng Thượng, Quận Đống Đa, Hà Nội (Mã trường: GHA). Toàn bộ sinh viên trúng tuyển cơ sở Hà Nội được học tập tại hệ thống giảng đường A, B và các phòng thí nghiệm trọng điểm tại Cầu Giấy.",
      },
      {
        id: "faq2",
        topic: "Quy Đổi IELTS",
        question: "Thí sinh sử dụng chứng chỉ IELTS để xét tuyển cần đáp ứng điều kiện gì?",
        answer: "Chứng chỉ IELTS phải đạt từ 5.0 trở lên, còn hiệu lực tính đến ngày nộp hồ sơ. Điểm IELTS được quy đổi tương đương: 5.0 = 8.5 điểm; 5.5 = 9.0 điểm; 6.0 = 9.5 điểm; 6.5 trở lên = 10.0 điểm môn Tiếng Anh trong tổ hợp xét tuyển.",
      },
      {
        id: "faq3",
        topic: "Học Bổng",
        question: "Chính sách học bổng dành cho Tân sinh viên K66 như thế nào?",
        answer: "Nhà trường dành hàng trăm suất học bổng Khuyến khích học tập, Học bổng Tài năng (100% học phí) cho các thí sinh có điểm xét tuyển đầu vào cao nhất ngành, cùng nhiều gói học bổng doanh nghiệp tài trợ từ các tập đoàn công nghệ và giao thông hàng đầu.",
      },
      {
        id: "faq4",
        topic: "Ký Túc Xá",
        question: "Sinh viên năm thứ nhất có được ưu tiên đăng ký Ký túc xá không?",
        answer: "Trường có khu Ký túc xá khang trang ngay trong khuôn viên trường tại Hà Nội. Tân sinh viên thuộc đối tượng ưu tiên, hộ nghèo hoặc ở các tỉnh xa sẽ được ưu tiên bố trí chỗ ở ngay trong tuần lễ làm thủ tục nhập học.",
      },
    ];
  }

  return (
    <Suspense fallback={<LoadingSpinner label="Đang tải thông tin tuyển sinh UTC..." />}>
      <ThongTinTuyenSinhClient
        initialMilestones={milestones}
        initialMethods={methods}
        faculties={faculties}
        totalMajors={totalMajors}
        totalPrograms={totalPrograms}
        totalQuota={totalQuota}
        initialFaqs={faqs}
      />
    </Suspense>
  );
}

import { Suspense } from "react";
import { prismaPublic } from "@/libs/prisma";
import ThongTinTuyenSinhClient, {
  MilestoneItem,
  MethodItem,
  FacultySummary,
  FaqItem,
  AdmissionScoreHistory,
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
  let admissionHistory: AdmissionScoreHistory[] = [];

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
      dbScores,
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
      prismaPublic.lichSuDiemChuan.findMany({
        include: {
          chuong_trinh: {
            include: {
              nganh: true,
            },
          },
          diem_trung_tuyen: {
            include: {
              phuong_thuc: true,
            },
          },
        },
        orderBy: [
          { nam: "desc" },
          { chuong_trinh: { ten_chuong_trinh: "asc" } },
        ],
        take: 120,
      }),
    ]);

    totalMajors = countMajors;
    totalPrograms = countPrograms;
    // Real quota for current admission season at Hanoi campus
    totalQuota = quota2026._sum.chi_tieu || quota2025._sum.chi_tieu || 6000;

    // Process Admission Benchmark Scores History
    admissionHistory = dbScores.map((item) => {
      const scores = (item.diem_trung_tuyen || []).map((d) => ({
        methodCode: d.ma_phuong_thuc,
        methodName: d.phuong_thuc?.ten_phuong_thuc || d.ma_phuong_thuc,
        score: d.diem,
      }));

      return {
        id: item.ma_ls_dc,
        year: item.nam,
        majorCode: item.chuong_trinh?.nganh?.ma_nganh || item.chuong_trinh?.ma_nganh || item.ma_chuong_trinh,
        majorName: item.chuong_trinh?.nganh?.ten_nganh || item.chuong_trinh?.ten_chuong_trinh,
        programName: item.chuong_trinh?.ten_chuong_trinh,
        quota: item.chi_tieu,
        scores,
      };
    });

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

    // Process FAQs - only include genuine admission FAQs, filtering out internal RAG chunks and test rows
    const validDbFaqs = dbFaqs
      .filter((f) => {
        const q = (f.cau_hoi_mau || "").toLowerCase();
        const topic = (f.chu_de || "").toLowerCase();
        const content = (f.noi_dung || "").toLowerCase();
        const isInternalChunk =
          topic.includes("niên giám") ||
          topic.includes("chuẩn đầu ra") ||
          q.includes("cđr") ||
          q.includes("bloom") ||
          q.includes("chunk") ||
          q.includes("test") ||
          content.includes("bảng cđr") ||
          content.includes("### bối cảnh");
        return !isInternalChunk && f.cau_hoi_mau && f.noi_dung;
      })
      .map((f) => ({
        id: f.ma_tri_thuc,
        topic: f.chu_de || "Tư Vấn Tuyển Sinh",
        question: f.cau_hoi_mau!,
        answer: f.noi_dung,
      }));

    faqs = validDbFaqs;
  } catch (error) {
    console.error("Lỗi tải thông tin tuyển sinh từ database:", error);
  }

  // Curated high-value FAQs for UTC Hanoi K66 Admission
  const highValueFaqs: FaqItem[] = [
    {
      id: "faq_xettuyen_som",
      topic: "Xét Tuyển Sớm & Cổng Bộ",
      question: "Đã đủ điều kiện trúng tuyển sớm (Học bạ, ĐGNL, IELTS) có bắt buộc phải đăng ký trên Cổng tuyển sinh của Bộ GD&ĐT không?",
      answer: "BẮT BUỘC 100%. Theo Quy chế tuyển sinh chung, thí sinh dù đã nhận thông báo đủ điều kiện trúng tuyển sớm tại Trường ĐH Giao thông Vận tải (Cơ sở Hà Nội - Mã GHA) vẫn bắt buộc phải đăng ký nguyện vọng ngành đó trên Cổng dịch vụ công xét tuyển của Bộ GD&ĐT (thisinh.thitotnghiepthpt.edu.vn) theo đúng thời gian quy định. Để chắc chắn trúng tuyển chính thức vào ngành mong muốn, bạn hãy đặt ngành đó ở vị trí Nguyện vọng 1.",
    },
    {
      id: "faq_chung_chi_ielts",
      topic: "Chứng Chỉ Tiếng Anh",
      question: "Quy định sử dụng chứng chỉ IELTS / TOEFL / SAT trong mùa tuyển sinh 2026 tại UTC Hà Nội như thế nào?",
      answer: "Theo Đề án tuyển sinh 2026, chứng chỉ IELTS (từ 5.0 trở lên) hoặc TOEFL iBT tương đương được sử dụng để xét kết hợp / cộng điểm ưu tiên theo quy định từng ngành. Thí sinh cần có chứng chỉ còn thời hạn 2 năm tính đến ngày nộp hồ sơ. Đặc biệt, sau khi trúng tuyển và nhập học, sinh viên sở hữu chứng chỉ quốc tế hợp lệ sẽ được xét miễn học và chuyển đổi điểm tối đa (lên đến 10.0) cho các học phần Tiếng Anh trong chương trình đào tạo.",
    },
    {
      id: "faq_nhieu_phuong_thuc",
      topic: "Đăng Ký Nguyện Vọng",
      question: "Thí sinh có thể đồng thời nộp hồ sơ bằng nhiều phương thức xét tuyển vào cùng một ngành không?",
      answer: "Hoàn toàn được. Nhà trường thực hiện xét tuyển độc lập theo từng phương thức (Xét kết quả thi tốt nghiệp THPT, Xét học bạ THPT, Xét kết quả bài thi ĐGNL ĐHQG Hà Nội hoặc ĐGTD Bách Khoa). Mỗi phương thức có chỉ tiêu và điểm chuẩn riêng, giúp thí sinh gia tăng tối đa cơ hội trúng tuyển vào ngành học mơ ước mà không bị giới hạn.",
    },
    {
      id: "faq_hoc_phi",
      topic: "Học Phí & Lộ Trình",
      question: "Mức học phí áp dụng cho sinh viên khóa K66 (Cơ sở Hà Nội) dự kiến là bao nhiêu?",
      answer: "Mức học phí hệ đại trà tại Cơ sở Hà Nội dự kiến: Khối Kỹ thuật & Công nghệ khoảng 420.000 - 460.000 đ/tín chỉ (~15 - 18 triệu đ/năm học); Khối Kinh tế & Vận tải khoảng 380.000 - 410.000 đ/tín chỉ (~13 - 15 triệu đ/năm học) theo quy định của Nhà nước đối với trường đại học công lập tự chủ. Các chương trình tiên tiến, chất lượng cao giảng dạy bằng tiếng Anh có định mức kinh tế kỹ thuật riêng được công khai chi tiết trong Đề án tuyển sinh.",
    },
    {
      id: "faq_ky_tuc_xa",
      topic: "Ký Túc Xá & Đời Sống",
      question: "Tân sinh viên K66 có được đăng ký ở Ký túc xá không? Vị trí và điều kiện nội trú ra sao?",
      answer: "Ký túc xá UTC nằm ngay trong khuôn viên trường tại Số 3 phố Cầu Giấy (Hà Nội), kết nối trực tiếp với giảng đường, thư viện và trạm tàu điện ngầm Nhổn - Ga Hà Nội. Nhà trường ưu tiên bố trí chỗ ở nội trú cho tân sinh viên thuộc diện chính sách, hộ nghèo/cận nghèo, học sinh vùng sâu vùng xa và các bạn ở tỉnh xa nộp đơn đăng ký sớm ngay trong tuần lễ làm thủ tục nhập học.",
    },
    {
      id: "faq_hoc_bong_viec_lam",
      topic: "Học Bổng & Việc Làm",
      question: "Chính sách học bổng đầu vào và cơ hội việc làm sau khi tốt nghiệp tại UTC như thế nào?",
      answer: "Hằng năm, UTC trao tặng học bổng Khuyến khích học tập, học bổng Thủ khoa/Á khoa (miễn 100% học phí) và hàng trăm suất học bổng tài trợ từ các tập đoàn lớn (Samsung, FPT, Viettel, các tổng công ty hạ tầng và logistics). Trường có mạng lưới hợp tác với hơn 300 doanh nghiệp, tỷ lệ sinh viên tốt nghiệp có việc làm đúng chuyên ngành trong vòng 12 tháng luôn đạt trên 95%.",
    },
  ];

  // Fallback if DB milestones or methods are empty
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
    faqs = highValueFaqs;
  } else {
    // If DB had a few non-internal FAQs, prepend highValueFaqs to ensure rich and high-value FAQs
    faqs = [...highValueFaqs, ...faqs.filter(f => !highValueFaqs.some(h => h.id === f.id))];
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
        admissionHistory={admissionHistory}
      />
    </Suspense>
  );
}

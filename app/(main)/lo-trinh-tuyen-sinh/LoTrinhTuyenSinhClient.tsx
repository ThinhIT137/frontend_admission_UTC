"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { DisclaimerBanner } from "@/components/ui/DisclaimerBanner";

export interface MilestoneItem {
  id: string;
  stageId: "giai-doan-1" | "giai-doan-2" | "giai-doan-3" | "giai-doan-4";
  stageName: string;
  stageBadgeColor: string;
  title: string;
  startDate: string; // YYYY-MM-DD or readable
  endDate: string;
  status: "PAST" | "ACTIVE" | "UPCOMING" | "CLOSED";
  summary: string;
  candidateTasks: string[]; // Việc thí sinh cần làm
  requiredDocs?: string[]; // Hồ sơ / giấy tờ cần lưu ý
  applicableMethods: string[]; // Áp dụng cho các phương thức: "ALL" | "PT1" | "PT2" | "PT3" | "PT4" | "PT5"
  actionLink?: {
    label: string;
    href: string;
    isExternal?: boolean;
    icon?: string;
  };
  importantNote?: string;
}

// 4 Giai đoạn chuẩn theo quy chế tuyển sinh
export const ADMISSION_STAGES = [
  {
    id: "all",
    label: "Tất Cả Giai Đoạn",
    icon: "calendar_month",
    description: "Toàn bộ lộ trình mùa tuyển sinh K66",
  },
  {
    id: "giai-doan-1",
    label: "1. Trước Xét Tuyển & Hồ Sơ Sớm",
    icon: "assignment",
    description: "Đề án, học bạ, thi ĐGNL/ĐGTD, nộp hồ sơ chứng chỉ & tài khoản",
  },
  {
    id: "giai-doan-2",
    label: "2. Thi Tốt Nghiệp & Nộp Nguyện Vọng",
    icon: "edit_calendar",
    description: "Thi THPT, đăng ký và điều chỉnh nguyện vọng trên cổng Bộ GD&ĐT",
  },
  {
    id: "giai-doan-3",
    label: "3. Lọc Ảo & Công Bố Điểm Chuẩn",
    icon: "leaderboard",
    description: "Công bố điểm sàn, chạy hệ thống lọc ảo và công bố danh sách trúng tuyển",
  },
  {
    id: "giai-doan-4",
    label: "4. Xác Nhận & Làm Thủ Tục Nhập Học",
    icon: "school",
    description: "Xác nhận nhập học trực tuyến, nộp hồ sơ gốc và đón Tân sinh viên",
  },
];

// Danh sách các mốc chi tiết chuẩn hóa theo kế hoạch Bộ GD&ĐT và Đề án UTC
const DEFAULT_DETAILED_MILESTONES: MilestoneItem[] = [
  // GIAI ĐOẠN 1: Trước xét tuyển & Xét tuyển sớm
  {
    id: "ms-1",
    stageId: "giai-doan-1",
    stageName: "Giai Đoạn 1: Trước Xét Tuyển",
    stageBadgeColor: "bg-[#e0f2fe] text-[#0369a1] border-[#0284c7]",
    title: "Công Bố Đề Án Tuyển Sinh & Quy Chế K66 Chính Thức",
    startDate: "2026-02-15",
    endDate: "2026-03-01",
    status: "PAST",
    summary:
      "UTC công bố chỉ tiêu, tổ hợp môn, điều kiện xét tuyển và chính sách tuyển sinh ĐHCQ K66 trên các kênh truyền thông chính thức.",
    candidateTasks: [
      "Đọc kỹ đề án tuyển sinh K66 của UTC để nắm rõ mã trường (GHA), mã ngành và tổ hợp xét tuyển.",
      "Kiểm tra điều kiện đặc thù của UTC: điểm thi tốt nghiệp môn Toán phải đạt từ 5.0 trở lên (ngành Toán ứng dụng từ 6.0).",
      "Lưu lại các mốc thời gian quan trọng vào lịch cá nhân để không bị bỏ lỡ.",
    ],
    requiredDocs: [
      "Bảng mã trường GHA và mã ngành đăng ký xét tuyển",
      "Quy chế tuyển sinh hiện hành của Bộ GD&ĐT và UTC",
    ],
    applicableMethods: ["ALL"],
    actionLink: {
      label: "Xem Chi Tiết Quy Chế UTC",
      href: "/thong-tin-tuyen-sinh",
      icon: "menu_book",
    },
    importantNote:
      "Năm 2026, UTC không xét học bạ độc lập; học bạ chỉ được sử dụng trong phương thức xét tuyển kết hợp và bắt buộc kèm điểm thi THPT.",
  },
  {
    id: "ms-2",
    stageId: "giai-doan-1",
    stageName: "Giai Đoạn 1: Trước Xét Tuyển",
    stageBadgeColor: "bg-[#e0f2fe] text-[#0369a1] border-[#0284c7]",
    title: "Mở Đăng Ký Cấp Tài Khoản Thí Sinh Tự Do (Trên Cổng Bộ GD&ĐT)",
    startDate: "2026-05-01",
    endDate: "2026-05-20",
    status: "PAST",
    summary:
      "Dành cho thí sinh đã tốt nghiệp THPT từ các năm trước (thí sinh tự do) chưa có tài khoản xét tuyển trên Hệ thống chung.",
    candidateTasks: [
      "Thí sinh tự do đến các điểm tiếp nhận (thường là trường THPT hoặc Phòng GD&ĐT nơi cư trú) để đăng ký thông tin.",
      "Nhận tài khoản và mật khẩu đăng nhập cổng https://thisinh.thitotnghiepthpt.edu.vn.",
      "Đăng nhập đổi mã PIN, kiểm tra chính xác thông tin cá nhân và khu vực ưu tiên.",
    ],
    requiredDocs: [
      "Căn cước công dân (bản sao kèm bản gốc đối chiếu)",
      "Bằng tốt nghiệp THPT hoặc giấy chứng nhận tốt nghiệp tương đương",
    ],
    applicableMethods: ["PT1", "PT2", "PT3", "PT4", "PT5"],
    actionLink: {
      label: "Cổng Bộ GD&ĐT",
      href: "https://thisinh.thitotnghiepthpt.edu.vn",
      isExternal: true,
      icon: "open_in_new",
    },
  },
  {
    id: "ms-3",
    stageId: "giai-doan-1",
    stageName: "Giai Đoạn 1: Trước Xét Tuyển",
    stageBadgeColor: "bg-[#e0f2fe] text-[#0369a1] border-[#0284c7]",
    title: "Tiếp Nhận Hồ Sơ Xét Tuyển Sớm: Chứng Chỉ Quốc Tế & Kết Quả ĐGNL / ĐGTD",
    startDate: "2026-04-15",
    endDate: "2026-06-15",
    status: "ACTIVE",
    summary:
      "Thu nhận hồ sơ đăng ký xét tuyển theo phương thức kết hợp chứng chỉ ngoại ngữ quốc tế (IELTS, TOEFL, SAT...) và kết quả thi ĐGNL ĐHQGHN, ĐGTD ĐHBK Hà Nội.",
    candidateTasks: [
      "Chuẩn bị bản photo công chứng chứng chỉ ngoại ngữ quốc tế còn hạn sử dụng (IELTS >= 5.0, TOEFL iBT >= 42, SAT >= 1000).",
      "Khai báo thông tin điểm thi ĐGNL (ĐHQGHN) hoặc ĐGTD (ĐHBK Hà Nội) lên cổng tiếp nhận xét tuyển của trường.",
      "Theo dõi email và tin nhắn thông báo xác nhận đã nhận đủ hồ sơ hợp lệ từ Ban Tuyển sinh UTC.",
    ],
    requiredDocs: [
      "Bản sao công chứng CCCD và học bạ THPT (5 học kỳ: Lớp 10, Lớp 11 và Học kỳ 1 Lớp 12)",
      "Bản sao chứng chỉ ngoại ngữ quốc tế hoặc phiếu điểm thi ĐGNL/ĐGTD",
      "Đơn đăng ký xét tuyển theo mẫu của Trường Đại học GTVT",
    ],
    applicableMethods: ["PT3", "PT4", "PT5"],
    actionLink: {
      label: "Tra Cứu Bảng Điểm Quy Đổi Chứng Chỉ",
      href: "/thong-tin-tuyen-sinh#phuong-thuc",
      icon: "calculate",
    },
    importantNote:
      "Tất cả thí sinh đủ điều kiện trúng tuyển sớm vẫn BẮT BUỘC phải đăng ký nguyện vọng đó lên Cổng chung của Bộ GD&ĐT trong tháng 7.",
  },
  {
    id: "ms-4",
    stageId: "giai-doan-1",
    stageName: "Giai Đoạn 1: Trước Xét Tuyển",
    stageBadgeColor: "bg-[#e0f2fe] text-[#0369a1] border-[#0284c7]",
    title: "Hạn Chót Nộp Hồ Sơ Xét Tuyển Thẳng & Ưu Tiên Xét Tuyển (Theo Quy Chế Bộ)",
    startDate: "2026-06-01",
    endDate: "2026-06-20",
    status: "UPCOMING",
    summary:
      "Nộp hồ sơ xét tuyển thẳng dành cho học sinh đoạt giải Học sinh Giỏi Quốc gia, Cuộc thi KHKT cấp Quốc gia hoặc các diện chính sách ưu tiên.",
    candidateTasks: [
      "Nộp hồ sơ trực tiếp tại Phòng 105 - Nhà A1, Trường Đại học GTVT (Số 3 Cầu Giấy, Hà Nội) hoặc gửi chuyển phát nhanh bảo đảm.",
      "Kiểm tra danh sách thí sinh nộp hồ sơ được trường cập nhật định kỳ trên website.",
      "Nhận văn bản thông báo kết quả sơ duyệt tuyển thẳng trước ngày 05/07/2026.",
    ],
    requiredDocs: [
      "Phiếu đăng ký xét tuyển thẳng theo mẫu của Bộ GD&ĐT",
      "Bản sao chứng thực Giấy chứng nhận đoạt giải (HSG Quốc gia, KHKT)",
      "Bản sao công chứng học bạ 3 năm THPT",
    ],
    applicableMethods: ["PT1"],
    actionLink: {
      label: "Tải Biểu Mẫu Hồ Sơ Quy Định",
      href: "/thong-tin-tuyen-sinh#ho-so",
      icon: "download",
    },
  },

  // GIAI ĐOẠN 2: Nộp hồ sơ & Thi tốt nghiệp THPT
  {
    id: "ms-5",
    stageId: "giai-doan-2",
    stageName: "Giai Đoạn 2: Thi & Đăng Ký Nguyện Vọng",
    stageBadgeColor: "bg-[#fef3c7] text-[#92400e] border-[#f59e0b]",
    title: "Kỳ Thi Tốt Nghiệp THPT Năm 2026 Toàn Quốc",
    startDate: "2026-06-26",
    endDate: "2026-06-29",
    status: "UPCOMING",
    summary:
      "Thí sinh dự thi các môn thi bắt buộc và bài thi tổ hợp theo lịch thi do Bộ GD&ĐT ban hành trên cả nước.",
    candidateTasks: [
      "Có mặt đúng giờ tại điểm thi THPT, mang theo CCCD và Giấy báo dự thi.",
      "Lưu ý quy chế thi: tuyệt đối không mang thiết bị di động, smartwatch vào phòng thi.",
      "Sau khi thi xong, giữ gìn cẩn thận phiếu thu bài thi và tài khoản tra cứu điểm thi cá nhân.",
    ],
    requiredDocs: [
      "Căn cước công dân gốc",
      "Thẻ dự thi / Giấy báo thi tốt nghiệp THPT 2026",
    ],
    applicableMethods: ["ALL"],
    importantNote:
      "Điểm thi môn Toán kỳ thi tốt nghiệp THPT là điều kiện bắt buộc trong hầu hết các phương thức xét tuyển vào UTC.",
  },
  {
    id: "ms-6",
    stageId: "giai-doan-2",
    stageName: "Giai Đoạn 2: Thi & Đăng Ký Nguyện Vọng",
    stageBadgeColor: "bg-[#fef3c7] text-[#92400e] border-[#f59e0b]",
    title: "Đăng Ký & Điều Chỉnh Nguyện Vọng Trên Hệ Thống Của Bộ GD&ĐT",
    startDate: "2026-07-02",
    endDate: "2026-07-14",
    status: "UPCOMING",
    summary:
      "Toàn bộ thí sinh đăng ký, chỉnh sửa không giới hạn số lần nguyện vọng xét tuyển đại học trên Hệ thống chung.",
    candidateTasks: [
      "Đăng nhập cổng http://thisinh.thitotnghiepthpt.edu.vn bằng tài khoản cá nhân.",
      "Nhập mã cơ sở đào tạo của UTC: GHA (Trường ĐH Giao thông Vận tải).",
      "Chọn ngành và tổ hợp mong muốn. Đặt ngành bạn yêu thích nhất ở Nguyện vọng 1 (ưu tiên cao nhất).",
      "Xác nhận bằng mã OTP được gửi về số điện thoại đăng ký và in biên bản xác nhận.",
    ],
    requiredDocs: [
      "Mã trường UTC: GHA",
      "Mã các ngành đào tạo UTC cần đăng ký (tra cứu tại trang Tra Cứu Ngành Học)",
      "Điện thoại nhận mã OTP xác thực tài khoản",
    ],
    applicableMethods: ["ALL"],
    actionLink: {
      label: "Tra Cứu Mã Ngành & Tổ Hợp UTC",
      href: "/tra-cuu-nganh-hoc",
      icon: "search",
    },
    importantNote:
      "Hệ thống sẽ đóng vào 17h00 ngày 14/07/2026. Sau thời hạn này, thí sinh không thể thay đổi thứ tự hay bổ sung bất kỳ nguyện vọng nào.",
  },
  {
    id: "ms-7",
    stageId: "giai-doan-2",
    stageName: "Giai Đoạn 2: Thi & Đăng Ký Nguyện Vọng",
    stageBadgeColor: "bg-[#fef3c7] text-[#92400e] border-[#f59e0b]",
    title: "Nộp Lệ Phí Xét Tuyển Đại Học Trực Tuyến",
    startDate: "2026-07-15",
    endDate: "2026-07-21",
    status: "UPCOMING",
    summary:
      "Thực hiện nộp lệ phí xét tuyển cho các nguyện vọng đã đăng ký theo hướng dẫn và tài khoản phân luồng của Bộ GD&ĐT.",
    candidateTasks: [
      "Đăng nhập lại Cổng thi sinh của Bộ GD&ĐT.",
      "Chọn chức năng thanh toán trực tuyến (qua tài khoản ngân hàng, ví điện tử VNPay, Momo, Viettel Money...).",
      "Kiểm tra trạng thái thanh toán chuyển sang ĐÃ NỘP TIỀN cho tất cả nguyện vọng đã chọn.",
    ],
    applicableMethods: ["ALL"],
    actionLink: {
      label: "Hướng Dẫn Nộp Lệ Phí Trực Tuyến",
      href: "https://thisinh.thitotnghiepthpt.edu.vn",
      isExternal: true,
      icon: "payments",
    },
  },

  // GIAI ĐOẠN 3: Lọc ảo & Công bố điểm chuẩn
  {
    id: "ms-8",
    stageId: "giai-doan-3",
    stageName: "Giai Đoạn 3: Lọc Ảo & Điểm Chuẩn",
    stageBadgeColor: "bg-[#fce7f3] text-[#be185d] border-[#ec4899]",
    title: "Công Bố Ngưỡng Đảm Bảo Chất Lượng Đầu Vào (Điểm Sàn UTC)",
    startDate: "2026-07-22",
    endDate: "2026-07-25",
    status: "UPCOMING",
    summary:
      "Hội đồng Tuyển sinh UTC công bố mức điểm nhận hồ sơ xét tuyển tối thiểu cho từng nhóm ngành và ngành đào tạo.",
    candidateTasks: [
      "Xem thông báo điểm sàn được niêm yết trên website trường và fanpage Tuyển sinh UTC.",
      "Đối chiếu điểm thi tổ hợp thực tế của bản thân với ngưỡng điểm sàn của ngành mong muốn.",
      "Nếu điểm chưa đạt ngưỡng sàn, nhanh chóng cân nhắc điều chỉnh nhóm ngành phù hợp trong các đợt tiếp theo nếu được phép.",
    ],
    applicableMethods: ["ALL"],
    actionLink: {
      label: "Xem Điểm Chuẩn Các Năm Trước",
      href: "/thong-tin-tuyen-sinh#chi-tieu-diem-chuan",
      icon: "trending_up",
    },
  },
  {
    id: "ms-9",
    stageId: "giai-doan-3",
    stageName: "Giai Đoạn 3: Lọc Ảo & Điểm Chuẩn",
    stageBadgeColor: "bg-[#fce7f3] text-[#be185d] border-[#ec4899]",
    title: "Chạy Quy Trình Lọc Ảo Xét Tuyển Toàn Quốc & Điểm Chuẩn Chính Thức K66",
    startDate: "2026-08-05",
    endDate: "2026-08-13",
    status: "UPCOMING",
    summary:
      "Bộ GD&ĐT cùng các nhóm trường miền Bắc thực hiện quy trình lọc ảo. UTC công bố danh sách trúng tuyển đợt 1 trước 17h00 ngày 13/08.",
    candidateTasks: [
      "Truy cập cổng tuyển sinh UTC để tra cứu danh sách trúng tuyển bằng số CCCD hoặc số báo danh.",
      "Xem thông báo điểm chuẩn trúng tuyển theo từng phương thức và mã ngành.",
      "Kiểm tra thông báo trúng tuyển gửi qua SMS/Email chính thức của Trường Đại học GTVT.",
    ],
    applicableMethods: ["ALL"],
    actionLink: {
      label: "Cổng Tra Cứu Trúng Tuyển UTC",
      href: "https://tuyensinh.utc.edu.vn",
      isExternal: true,
      icon: "how_to_reg",
    },
  },

  // GIAI ĐOẠN 4: Xác nhận & Nhập học
  {
    id: "ms-10",
    stageId: "giai-doan-4",
    stageName: "Giai Đoạn 4: Xác Nhận & Nhập Học",
    stageBadgeColor: "bg-[#dcfce7] text-[#15803d] border-[#22c55e]",
    title: "Xác Nhận Nhập Học Trực Tuyến Đợt 1 Trên Cổng Bộ GD&ĐT",
    startDate: "2026-08-14",
    endDate: "2026-08-21",
    status: "UPCOMING",
    summary:
      "Bắt buộc đối với toàn bộ thí sinh trúng tuyển đợt 1 muốn theo học tại UTC. Quá thời hạn trên, thí sinh coi như từ chối nhập học.",
    candidateTasks: [
      "Đăng nhập hệ thống http://thisinh.thitotnghiepthpt.edu.vn.",
      "Tìm thông tin trường trúng tuyển: GHA - Trường Đại học Giao thông Vận tải.",
      "Nhấn nút 'Xác nhận nhập học' và chụp ảnh màn hình xác nhận hoàn thành thành công.",
    ],
    requiredDocs: [
      "Tài khoản đăng nhập cổng Bộ GD&ĐT",
      "Ảnh chụp màn hình biên nhận đã xác nhận nhập học",
    ],
    applicableMethods: ["ALL"],
    actionLink: {
      label: "Xác Nhận Trên Cổng Bộ",
      href: "https://thisinh.thitotnghiepthpt.edu.vn",
      isExternal: true,
      icon: "check_circle",
    },
    importantNote:
      "Hạn chót là 17h00 ngày 21/08/2026. Thí sinh không xác nhận trên cổng Bộ sẽ bị hủy kết quả trúng tuyển theo quy chế.",
  },
  {
    id: "ms-11",
    stageId: "giai-doan-4",
    stageName: "Giai Đoạn 4: Xác Nhận & Nhập Học",
    stageBadgeColor: "bg-[#dcfce7] text-[#15803d] border-[#22c55e]",
    title: "Làm Thủ Tục Nhập Học Trực Tiếp & Khai Giảng Tân Sinh Viên K66 UTC",
    startDate: "2026-08-22",
    endDate: "2026-08-31",
    status: "UPCOMING",
    summary:
      "Nộp hồ sơ gốc nhập học, hoàn thiện học phí kỳ 1, nhận lớp, thẻ sinh viên, áo đồng phục và tham gia tuần lễ sinh hoạt công dân đầu khóa.",
    candidateTasks: [
      "Khai báo thông tin lý lịch sinh viên trên cổng thông tin nội bộ UTC (theo mã sinh viên được cấp).",
      "Chuẩn bị đầy đủ túi hồ sơ nhập học bản gốc và các bản sao công chứng.",
      "Đến trực tiếp Hội trường A1, Số 3 Cầu Giấy để nộp hồ sơ theo khung giờ của từng khoa/viện.",
      "Đăng ký ký túc xá (nếu có nhu cầu) và nhận thẻ sinh viên tích hợp thẻ ngân hàng.",
    ],
    requiredDocs: [
      "Giấy báo trúng tuyển bản gốc (hoặc bản in từ hệ thống tuyển sinh UTC)",
      "Giấy chứng nhận kết quả thi tốt nghiệp THPT 2026 (bản chính có mã vạch)",
      "Học bạ THPT (bản chính kèm 01 bản công chứng)",
      "Bản sao Giấy khai sinh và 02 bản photo CCCD gắn chip",
      "Hồ sơ chuyển sinh hoạt Đảng / Đoàn (nếu là Đảng viên, Đoàn viên)",
      "Giấy xác nhận đăng ký nghĩa vụ quân sự (đối với nam sinh viên)",
    ],
    applicableMethods: ["ALL"],
    actionLink: {
      label: "Xem Hướng Dẫn Hồ Sơ Nhập Học Chi Tiết",
      href: "/thong-tin-tuyen-sinh#ho-so",
      icon: "assignment_turned_in",
    },
    importantNote:
      "Địa điểm nhập học: Số 3 Phố Cầu Giấy, Phường Láng Thượng, Quận Đống Đa, TP. Hà Nội. Hotline hỗ trợ tân sinh viên: 024.3766.3311.",
  },
];

interface Props {
  dbMilestones: any[];
  admissionMethods: any[];
}

export default function LoTrinhTuyenSinhClient({
  dbMilestones,
  admissionMethods,
}: Props) {
  const [selectedStage, setSelectedStage] = useState<string>("all");
  const [selectedMethod, setSelectedMethod] = useState<string>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [expandedId, setExpandedId] = useState<string | null>("ms-3"); // default expand active one

  // Kết hợp mốc từ database thực tế (nếu có) và danh sách chuẩn hóa sâu
  const allMilestones = useMemo<MilestoneItem[]>(() => {
    if (!dbMilestones || dbMilestones.length === 0) {
      return DEFAULT_DETAILED_MILESTONES;
    }

    // Nếu database có bản ghi kiểm tra / admin thêm mới
    const dbMapped: MilestoneItem[] = dbMilestones.map((dbM, idx) => {
      const start = dbM.thoi_gian_bat_dau
        ? new Date(dbM.thoi_gian_bat_dau).toISOString().split("T")[0]
        : "2026-06-01";
      const end = dbM.thoi_gian_ket_thuc
        ? new Date(dbM.thoi_gian_ket_thuc).toISOString().split("T")[0]
        : start;

      const now = new Date().getTime();
      const startTime = new Date(dbM.thoi_gian_bat_dau).getTime();
      const endTime = dbM.thoi_gian_ket_thuc
        ? new Date(dbM.thoi_gian_ket_thuc).getTime()
        : Infinity;

      let status: "PAST" | "ACTIVE" | "UPCOMING" | "CLOSED" = "UPCOMING";
      if (now > endTime) status = "PAST";
      else if (now >= startTime && now <= endTime) status = "ACTIVE";

      return {
        id: `db-${dbM.ma_su_kien || idx}`,
        stageId: "giai-doan-2",
        stageName: "Giai Đoạn 2: Kế Hoạch Tuyển Sinh",
        stageBadgeColor: "bg-[#fef3c7] text-[#92400e] border-[#f59e0b]",
        title: dbM.ten_su_kien,
        startDate: start,
        endDate: end,
        status,
        summary: dbM.ghi_chu || "Mốc sự kiện được cập nhật từ CSDL quản trị UTC.",
        candidateTasks: [
          dbM.ghi_chu || "Theo dõi các cập nhật mới nhất từ Hội đồng Tuyển sinh.",
          "Thực hiện theo đúng thời hạn quy định ghi nhận trên hệ thống.",
        ],
        applicableMethods: ["ALL"],
      };
    });

    // Merge: ưu tiên giữ các mốc chuẩn chuyên sâu và bổ sung các sự kiện admin tạo
    return [...DEFAULT_DETAILED_MILESTONES, ...dbMapped];
  }, [dbMilestones]);

  // Bộ lọc
  const filteredMilestones = useMemo(() => {
    return allMilestones.filter((m) => {
      // Lọc giai đoạn
      if (selectedStage !== "all" && m.stageId !== selectedStage) {
        return false;
      }

      // Lọc phương thức
      if (
        selectedMethod !== "ALL" &&
        !m.applicableMethods.includes("ALL") &&
        !m.applicableMethods.includes(selectedMethod)
      ) {
        return false;
      }

      // Lọc trạng thái
      if (selectedStatus !== "ALL" && m.status !== selectedStatus) {
        return false;
      }

      // Tìm kiếm từ khóa
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchTitle = m.title.toLowerCase().includes(q);
        const matchSummary = m.summary.toLowerCase().includes(q);
        const matchTasks = m.candidateTasks.some((t) =>
          t.toLowerCase().includes(q)
        );
        if (!matchTitle && !matchSummary && !matchTasks) return false;
      }

      return true;
    });
  }, [allMilestones, selectedStage, selectedMethod, selectedStatus, searchQuery]);

  // Thống kê nhanh
  const stats = useMemo(() => {
    const total = allMilestones.length;
    const active = allMilestones.filter((m) => m.status === "ACTIVE").length;
    const upcoming = allMilestones.filter((m) => m.status === "UPCOMING").length;
    const past = allMilestones.filter((m) => m.status === "PAST" || m.status === "CLOSED").length;
    return { total, active, upcoming, past };
  }, [allMilestones]);

  // Định dạng ngày hiển thị dd/mm/yyyy
  const formatDateDisplay = (dateStr: string) => {
    if (!dateStr) return "";
    const parts = dateStr.split("-");
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateStr;
  };

  const getStatusBadge = (status: MilestoneItem["status"]) => {
    switch (status) {
      case "ACTIVE":
        return {
          label: "ĐANG DIỄN RA",
          badgeClass: "bg-[#86efac] text-[#14532d] border-[#16a34a] animate-pulse",
          icon: "radio_button_checked",
        };
      case "UPCOMING":
        return {
          label: "SẮP TỚI",
          badgeClass: "bg-[#dbeafe] text-[#1e40af] border-[#3b82f6]",
          icon: "schedule",
        };
      case "PAST":
        return {
          label: "ĐÃ KẾT THÚC",
          badgeClass: "bg-[#f3f4f6] text-[#4b5563] border-[#9ca3af]",
          icon: "check_circle",
        };
      case "CLOSED":
        return {
          label: "ĐÃ ĐÓNG CỔNG",
          badgeClass: "bg-[#fee2e2] text-[#991b1b] border-[#ef4444]",
          icon: "lock",
        };
    }
  };

  return (
    <div className="flex flex-col w-full space-y-7 pb-16">
      {/* 1. Header Hero Banner */}
      <div className="bg-[#fffdf7] p-6 lg:p-8 border-[3px] border-[#111827] shadow-[6px_6px_0px_#111827] rounded-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-36 h-36 bg-[#fdb712]/15 rounded-full blur-2xl pointer-events-none" />
        
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className="px-3 py-1 bg-[#0d1b4e] text-[#fdb712] border-[2px] border-[#111827] rounded-md font-stamp text-[11px] font-black tracking-wider uppercase shadow-[2px_2px_0px_#111827]">
            LỘ TRÌNH CHÍNH THỨC K66
          </span>
          <span className="px-3 py-1 bg-[#e0f2fe] text-[#0369a1] border-[1.5px] border-[#111827] rounded-md font-bold text-[11px] uppercase">
            MÃ TRƯỜNG: GHA
          </span>
          <span className="px-3 py-1 bg-[#fef3c7] text-[#92400e] border-[1.5px] border-[#111827] rounded-md font-bold text-[11px] uppercase">
            ÁP DỤNG MÙA TUYỂN SINH 2026
          </span>
        </div>

        <h1 className="font-display font-black text-[26px] sm:text-[32px] lg:text-[38px] text-[#0d1b4e] uppercase tracking-tight leading-none mb-3">
          LỘ TRÌNH & MỐC THỜI GIAN TUYỂN SINH UTC
        </h1>

        <p className="text-[14px] sm:text-[15px] text-[#4b5563] font-medium max-w-4xl leading-relaxed">
          Hệ thống hóa toàn bộ tiến trình tuyển sinh Đại học chính quy UTC theo 4 giai đoạn chuẩn: từ chuẩn bị hồ sơ xét tuyển sớm, thi THPT, đăng ký nguyện vọng trên cổng Bộ GD&ĐT đến công bố điểm chuẩn và thủ tục nhập học Tân sinh viên.
        </p>

        {/* Quick Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-6 pt-6 border-t-[2px] border-dashed border-[#111827]">
          <div className="bg-[#faf3e6] p-3 rounded-xl border-[2px] border-[#111827] shadow-xs text-center">
            <span className="text-[11px] font-bold text-[#767680] uppercase block">Tổng Mốc Lộ Trình</span>
            <span className="font-display font-black text-[24px] text-[#0d1b4e]">{stats.total}</span>
          </div>
          <div className="bg-[#dcfce7] p-3 rounded-xl border-[2px] border-[#111827] shadow-xs text-center">
            <span className="text-[11px] font-bold text-[#15803d] uppercase block">Đang Diễn Ra</span>
            <span className="font-display font-black text-[24px] text-[#15803d]">{stats.active}</span>
          </div>
          <div className="bg-[#dbeafe] p-3 rounded-xl border-[2px] border-[#111827] shadow-xs text-center">
            <span className="text-[11px] font-bold text-[#1e40af] uppercase block">Sắp Tới (Chờ Mở)</span>
            <span className="font-display font-black text-[24px] text-[#1e40af]">{stats.upcoming}</span>
          </div>
          <div className="bg-[#f3f4f6] p-3 rounded-xl border-[2px] border-[#111827] shadow-xs text-center">
            <span className="text-[11px] font-bold text-[#6b7280] uppercase block">Đã Hoàn Thành</span>
            <span className="font-display font-black text-[24px] text-[#4b5563]">{stats.past}</span>
          </div>
        </div>
      </div>

      {/* 2. Disclaimer Banner pháp lý */}
      <DisclaimerBanner />

      {/* 3. Stage Stepper Bar - Trực quan 4 giai đoạn */}
      <div className="bg-[#fffdf7] p-5 sm:p-6 border-[3px] border-[#111827] shadow-[5px_5px_0px_#111827] rounded-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b-[2px] border-[#111827] pb-3">
          <div>
            <h3 className="font-display font-black text-[18px] text-[#0d1b4e] uppercase flex items-center gap-2">
              <span className="material-symbols-outlined text-[#0284c7]">alt_route</span>
              4 Giai Đoạn Tuyển Sinh Trọng Điểm
            </h3>
            <p className="text-[12.5px] text-[#6b7280] font-medium">
              Nhấp vào giai đoạn để lọc nhanh các việc cần làm tương ứng
            </p>
          </div>
          <span className="text-[12px] font-mono font-bold text-[#0d1b4e] bg-[#fdb712]/30 px-3 py-1 rounded-lg border border-[#111827]">
            Tháng 02/2026 → Tháng 08/2026
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 pt-2">
          {ADMISSION_STAGES.filter((s) => s.id !== "all").map((stg, idx) => {
            const isSelected = selectedStage === stg.id;
            return (
              <button
                key={stg.id}
                onClick={() =>
                  setSelectedStage(isSelected ? "all" : stg.id)
                }
                className={`p-4 rounded-xl border-[2.5px] text-left transition-all cursor-pointer relative flex flex-col justify-between ${
                  isSelected
                    ? "bg-[#0d1b4e] text-white border-[#111827] shadow-[4px_4px_0px_#111827] -translate-y-0.5"
                    : "bg-white text-[#111827] border-[#111827] hover:bg-[#faf3e6] shadow-[2px_2px_0px_#111827]"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`w-7 h-7 rounded-lg border-[1.5px] border-[#111827] flex items-center justify-center font-black text-[12px] ${
                      isSelected
                        ? "bg-[#fdb712] text-[#0d1b4e]"
                        : "bg-[#faf3e6] text-[#0d1b4e]"
                    }`}
                  >
                    0{idx + 1}
                  </span>
                  <span
                    className={`material-symbols-outlined text-[20px] ${
                      isSelected ? "text-[#fdb712]" : "text-[#0284c7]"
                    }`}
                  >
                    {stg.icon}
                  </span>
                </div>
                <div>
                  <h4
                    className={`font-display font-black text-[13.5px] uppercase line-clamp-1 ${
                      isSelected ? "text-[#fdb712]" : "text-[#0d1b4e]"
                    }`}
                  >
                    {stg.label.split(". ")[1] || stg.label}
                  </h4>
                  <p
                    className={`text-[11px] line-clamp-2 mt-1 leading-snug ${
                      isSelected ? "text-[#cbd5e1]" : "text-[#6b7280]"
                    }`}
                  >
                    {stg.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Controls & Filter Bar: Tìm kiếm, lọc theo phương thức, trạng thái */}
      <div className="bg-[#fffdf7] p-5 border-[3px] border-[#111827] shadow-[5px_5px_0px_#111827] rounded-2xl space-y-4">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          {/* Ô tìm kiếm nhanh */}
          <div className="relative flex-1">
            <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9ca3af] text-[20px]">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm mốc thời gian, việc cần làm, hồ sơ (vd: IELTS, học bạ, nguyện vọng, nhập học)..."
              className="w-full pl-10 pr-10 py-2.5 bg-white border-[2px] border-[#111827] rounded-xl text-[13px] font-bold text-[#111827] placeholder:text-[#9ca3af] outline-none focus:border-[#0284c7] transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9ca3af] hover:text-[#111827]"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            )}
          </div>

          {/* Lọc Phương Thức Xét Tuyển */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[12px] font-black text-[#0d1b4e] uppercase flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px]">filter_alt</span>
              Phương thức:
            </span>
            <select
              value={selectedMethod}
              onChange={(e) => setSelectedMethod(e.target.value)}
              className="px-3 py-2 bg-white border-[2px] border-[#111827] rounded-xl text-[12.5px] font-bold text-[#0d1b4e] outline-none cursor-pointer focus:border-[#0284c7]"
            >
              <option value="ALL">Tất cả phương thức</option>
              {admissionMethods && admissionMethods.length > 0 ? (
                admissionMethods.map((m) => (
                  <option key={m.ma_phuong_thuc} value={m.ma_phuong_thuc}>
                    {m.ma_phuong_thuc} - {m.ten_phuong_thuc}
                  </option>
                ))
              ) : (
                <>
                  <option value="PT1">PT1 - Điểm thi THPT & Tuyển thẳng</option>
                  <option value="PT2">PT2 - Xét kết hợp Học bạ + Thi THPT</option>
                  <option value="PT3">PT3 - Điểm ĐGNL ĐHQGHN</option>
                  <option value="PT4">PT4 - Điểm ĐGTD ĐHBK Hà Nội</option>
                  <option value="PT5">PT5 - Kết hợp Chứng chỉ quốc tế (IELTS/SAT)</option>
                </>
              )}
            </select>

            {/* Lọc Trạng Thái */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 bg-white border-[2px] border-[#111827] rounded-xl text-[12.5px] font-bold text-[#0d1b4e] outline-none cursor-pointer focus:border-[#0284c7]"
            >
              <option value="ALL">Tất cả trạng thái</option>
              <option value="ACTIVE">Đang diễn ra</option>
              <option value="UPCOMING">Sắp tới (Chờ mở)</option>
              <option value="PAST">Đã kết thúc</option>
            </select>
          </div>
        </div>

        {/* Chip Active Filter summary */}
        {(selectedStage !== "all" ||
          selectedMethod !== "ALL" ||
          selectedStatus !== "ALL" ||
          searchQuery) && (
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#e5e7eb] text-[12px]">
            <span className="text-[#6b7280] font-medium">Đang lọc theo:</span>
            {selectedStage !== "all" && (
              <span className="px-2.5 py-0.5 bg-[#e0f2fe] text-[#0369a1] font-bold border border-[#0284c7] rounded-md flex items-center gap-1">
                Giai đoạn: {selectedStage}
                <button onClick={() => setSelectedStage("all")}>×</button>
              </span>
            )}
            {selectedMethod !== "ALL" && (
              <span className="px-2.5 py-0.5 bg-[#fef3c7] text-[#92400e] font-bold border border-[#f59e0b] rounded-md flex items-center gap-1">
                Phương thức: {selectedMethod}
                <button onClick={() => setSelectedMethod("ALL")}>×</button>
              </span>
            )}
            {selectedStatus !== "ALL" && (
              <span className="px-2.5 py-0.5 bg-[#dcfce7] text-[#15803d] font-bold border border-[#16a34a] rounded-md flex items-center gap-1">
                Trạng thái: {selectedStatus}
                <button onClick={() => setSelectedStatus("ALL")}>×</button>
              </span>
            )}
            {searchQuery && (
              <span className="px-2.5 py-0.5 bg-[#f3f4f6] text-[#374151] font-bold border border-[#9ca3af] rounded-md flex items-center gap-1">
                Từ khóa: &quot;{searchQuery}&quot;
                <button onClick={() => setSearchQuery("")}>×</button>
              </span>
            )}
            <button
              onClick={() => {
                setSelectedStage("all");
                setSelectedMethod("ALL");
                setSelectedStatus("ALL");
                setSearchQuery("");
              }}
              className="text-[#dc2626] hover:underline font-bold text-[11px] ml-auto"
            >
              Đặt lại toàn bộ bộ lọc
            </button>
          </div>
        )}
      </div>

      {/* 5. Main Roadmap Timeline Card List */}
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <h3 className="font-display font-black text-[20px] sm:text-[22px] text-[#0d1b4e] uppercase flex items-center gap-2">
            <span className="material-symbols-outlined text-[#0284c7]">format_list_bulleted</span>
            Danh Sách Mốc Thời Gian & Hướng Dẫn Thí Sinh ({filteredMilestones.length})
          </h3>
          <span className="text-[12px] font-bold text-[#6b7280]">
            Bấm vào từng mốc để xem chi tiết & giấy tờ cần nộp
          </span>
        </div>

        {filteredMilestones.length === 0 ? (
          <div className="bg-[#fffdf7] p-12 border-[3px] border-[#111827] shadow-[5px_5px_0px_#111827] rounded-2xl text-center space-y-3">
            <span className="material-symbols-outlined text-[48px] text-[#9ca3af]">
              event_busy
            </span>
            <h4 className="font-display font-black text-[18px] text-[#0d1b4e]">
              Không tìm thấy mốc thời gian phù hợp
            </h4>
            <p className="text-[13px] text-[#6b7280] max-w-md mx-auto">
              Không có sự kiện nào khớp với tiêu chí tìm kiếm hoặc bộ lọc hiện tại của bạn. Vui lòng thử lại với từ khóa khác.
            </p>
            <button
              onClick={() => {
                setSelectedStage("all");
                setSelectedMethod("ALL");
                setSelectedStatus("ALL");
                setSearchQuery("");
              }}
              className="px-4 py-2 bg-[#fdb712] hover:bg-[#e2a20a] text-[#0d1b4e] font-black text-[13px] border-[2px] border-[#111827] rounded-xl shadow-[2px_2px_0px_#111827] cursor-pointer"
            >
              Xóa bộ lọc để xem tất cả
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredMilestones.map((ms, index) => {
              const isExpanded = expandedId === ms.id;
              const badge = getStatusBadge(ms.status);

              return (
                <div
                  key={ms.id}
                  className={`bg-[#fffdf7] border-[3px] border-[#111827] shadow-[5px_5px_0px_#111827] rounded-2xl transition-all overflow-hidden ${
                    ms.status === "ACTIVE"
                      ? "ring-2 ring-[#16a34a]/30"
                      : ""
                  }`}
                >
                  {/* Card Header clickable */}
                  <div
                    onClick={() =>
                      setExpandedId(isExpanded ? null : ms.id)
                    }
                    className="p-5 sm:p-6 cursor-pointer hover:bg-[#faf3e6]/60 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="flex-1 space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        {/* Phase Tag */}
                        <span
                          className={`font-stamp text-[10.5px] font-black uppercase px-2.5 py-0.5 border-[1.5px] rounded ${ms.stageBadgeColor}`}
                        >
                          {ms.stageName}
                        </span>

                        {/* Date Range Badge */}
                        <span className="font-mono text-[12px] font-bold text-[#0d1b4e] bg-[#faf3e6] px-2.5 py-0.5 border border-[#111827] rounded flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px] text-[#0284c7]">
                            calendar_today
                          </span>
                          {formatDateDisplay(ms.startDate)}{" "}
                          {ms.endDate && ms.endDate !== ms.startDate
                            ? `→ ${formatDateDisplay(ms.endDate)}`
                            : ""}
                        </span>

                        {/* Method tags */}
                        {ms.applicableMethods.includes("ALL") ? (
                          <span className="text-[10px] font-bold text-[#4b5563] bg-[#f3f4f6] px-2 py-0.5 rounded border border-[#d1d5db]">
                            Tất cả phương thức
                          </span>
                        ) : (
                          ms.applicableMethods.map((m) => (
                            <span
                              key={m}
                              className="text-[10px] font-black text-[#1e40af] bg-[#dbeafe] px-2 py-0.5 rounded border border-[#93c5fd]"
                            >
                              {m}
                            </span>
                          ))
                        )}
                      </div>

                      <h4 className="font-display font-black text-[17px] sm:text-[19px] text-[#0d1b4e] flex items-center gap-2">
                        <span className="text-[#0284c7]">#{index + 1}.</span> {ms.title}
                      </h4>

                      <p className="text-[13px] text-[#4b5563] leading-relaxed line-clamp-2">
                        {ms.summary}
                      </p>
                    </div>

                    {/* Right side: Status badge + Toggle expand button */}
                    <div className="flex items-center justify-between md:justify-end gap-3 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-[#e5e7eb]">
                      <span
                        className={`px-3 py-1 font-stamp text-[11px] font-black border-[2px] border-[#111827] shadow-[2px_2px_0px_#111827] rounded-lg uppercase flex items-center gap-1 ${badge.badgeClass}`}
                      >
                        <span className="material-symbols-outlined text-[13px]">
                          {badge.icon}
                        </span>
                        {badge.label}
                      </span>

                      <button
                        className="w-8 h-8 rounded-lg bg-white border border-[#111827] flex items-center justify-center text-[#0d1b4e] hover:bg-[#faf3e6] shadow-xs"
                        aria-label={isExpanded ? "Thu gọn" : "Mở rộng"}
                      >
                        <span
                          className={`material-symbols-outlined text-[20px] transition-transform ${
                            isExpanded ? "rotate-180" : ""
                          }`}
                        >
                          expand_more
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Card Details (Collapsible) */}
                  {isExpanded && (
                    <div className="px-5 sm:px-6 pb-6 pt-2 border-t-[2px] border-dashed border-[#111827] bg-[#faf3e6]/40 space-y-4 animate-in fade-in duration-200">
                      {/* Section: Việc thí sinh cần làm */}
                      <div className="bg-white p-4.5 rounded-xl border-[2px] border-[#111827] shadow-xs space-y-2.5">
                        <h5 className="font-display font-black text-[13.5px] text-[#0d1b4e] uppercase flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-[#16a34a] text-[18px]">
                            task_alt
                          </span>
                          Việc Thí Sinh Cần Làm Trong Mốc Này:
                        </h5>
                        <ul className="space-y-2 text-[12.5px] text-[#374151]">
                          {ms.candidateTasks.map((task, tIdx) => (
                            <li key={tIdx} className="flex items-start gap-2.5">
                              <span className="w-5 h-5 rounded-full bg-[#dcfce7] text-[#15803d] border border-[#16a34a] font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                                {tIdx + 1}
                              </span>
                              <span className="leading-snug">{task}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Section: Hồ sơ / Giấy tờ cần chuẩn bị (nếu có) */}
                      {ms.requiredDocs && ms.requiredDocs.length > 0 && (
                        <div className="bg-[#f0f9ff] p-4.5 rounded-xl border-[2px] border-[#0284c7] shadow-xs space-y-2">
                          <h5 className="font-display font-black text-[13px] text-[#0369a1] uppercase flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-[17px]">
                              inventory_2
                            </span>
                            Checklist Giấy Tờ & Hồ Sơ Yêu Cầu:
                          </h5>
                          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[12px] text-[#0c4a6e]">
                            {ms.requiredDocs.map((doc, dIdx) => (
                              <li key={dIdx} className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-[15px] text-[#0284c7] shrink-0">
                                  check_box
                                </span>
                                <span>{doc}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Important note if any */}
                      {ms.importantNote && (
                        <div className="bg-[#fffbeb] p-3.5 rounded-xl border-[1.5px] border-[#f59e0b] text-[12px] text-[#92400e] flex items-start gap-2 font-medium">
                          <span className="material-symbols-outlined text-[#d97706] text-[18px] shrink-0">
                            warning
                          </span>
                          <span>
                            <strong>Lưu ý quan trọng:</strong> {ms.importantNote}
                          </span>
                        </div>
                      )}

                      {/* Action Link button */}
                      {ms.actionLink && (
                        <div className="pt-1 flex flex-wrap items-center justify-between gap-3">
                          <div className="text-[11.5px] text-[#6b7280] italic">
                            * Vui lòng truy cập đường dẫn chính thức để thực hiện thao tác.
                          </div>
                          {ms.actionLink.isExternal ? (
                            <a
                              href={ms.actionLink.href}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#0d1b4e] hover:bg-[#1e293b] text-[#fdb712] font-black text-[12px] border-[2px] border-[#111827] rounded-xl shadow-[2px_2px_0px_#111827] transition-all"
                            >
                              <span className="material-symbols-outlined text-[16px]">
                                {ms.actionLink.icon || "open_in_new"}
                              </span>
                              {ms.actionLink.label}
                            </a>
                          ) : (
                            <Link
                              href={ms.actionLink.href}
                              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#fdb712] hover:bg-[#e2a20a] text-[#0d1b4e] font-black text-[12px] border-[2px] border-[#111827] rounded-xl shadow-[2px_2px_0px_#111827] transition-all"
                            >
                              <span className="material-symbols-outlined text-[16px]">
                                {ms.actionLink.icon || "arrow_forward"}
                              </span>
                              {ms.actionLink.label}
                            </Link>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 6. Hỗ trợ khẩn cấp & Kênh liên hệ khi gặp sự cố về mốc thời gian */}
      <div className="bg-[#0d1b4e] p-6 lg:p-8 border-[3px] border-[#111827] shadow-[6px_6px_0px_#111827] rounded-2xl text-white space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-[#334155] pb-4">
          <div>
            <span className="text-[11px] font-stamp font-bold text-[#fdb712] uppercase tracking-wider block mb-1">
              HỖ TRỢ THÍ SINH & PHỤ HUYNH
            </span>
            <h4 className="font-display font-black text-[20px] sm:text-[22px] text-white">
              Cần Giải Đáp Khẩn Cấp Về Hạn Nộp Hồ Sơ Hoặc Quy Chế?
            </h4>
          </div>
          <a
            href="tel:02437663311"
            className="px-4 py-2.5 bg-[#fdb712] hover:bg-[#e2a20a] text-[#0d1b4e] font-black text-[13px] border-[2px] border-[#111827] rounded-xl shadow-[3px_3px_0px_#111827] inline-flex items-center gap-2 shrink-0 transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">call</span>
            Hotline: 024.3766.3311
          </a>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-[12.5px] text-[#cbd5e1] pt-1">
          <div className="flex items-start gap-2">
            <span className="material-symbols-outlined text-[#fdb712] text-[18px] shrink-0 mt-0.5">
              location_on
            </span>
            <span>
              <strong>Tiếp nhận trực tiếp:</strong> Phòng 105 Nhà A1, Trường Đại học GTVT, Số 3 Cầu Giấy, Láng Thượng, Đống Đa, Hà Nội.
            </span>
          </div>
          <div className="flex items-start gap-2">
            <span className="material-symbols-outlined text-[#fdb712] text-[18px] shrink-0 mt-0.5">
              mail
            </span>
            <span>
              <strong>Email giải đáp:</strong> tuyensinh@utc.edu.vn (hỗ trợ xác minh hồ sơ và tài khoản).
            </span>
          </div>
          <div className="flex items-start gap-2">
            <span className="material-symbols-outlined text-[#fdb712] text-[18px] shrink-0 mt-0.5">
              language
            </span>
            <span>
              <strong>Cổng tuyển sinh trực tuyến:</strong> tuyensinh.utc.edu.vn (cập nhật thông báo chính thức 24/7).
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

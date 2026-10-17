"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { DisclaimerBanner } from "@/components/ui/DisclaimerBanner";
import { traCuuHoSoDbAction } from "./tra-cuu.server";

export interface GiayToMinhChung {
  id: string;
  tenGiayTo: string;
  maLoai: string;
  tenTep: string;
  dungLuong?: string;
  ngayUpload: string;
  trangThai: "HOP_LE" | "CHO_DUYET" | "CAN_BO_SUNG";
  ghiChu?: string;
}

export interface TimelineEvent {
  step: number;
  tieuDe: string;
  thoiGian: string;
  boPhanXuLy: string;
  noiDung: string;
  trangThai: "COMPLETED" | "CURRENT" | "PENDING";
}

export interface HoSoTuyenSinh {
  source?: "db" | "local" | "mock";
  maHoSo: string;
  cccd: string;
  hoTen: string;
  ngaySinh: string;
  gioiTinh: string;
  soDienThoai: string;
  email: string;
  truongThpt: string;
  tinhThanh: string;
  khuVuc: string;
  diemKhuVuc: number;
  doiTuongUuTien: string;
  diemDoiTuong: number;
  
  // Nguyện vọng
  soThuTuNv: number;
  maChuongTrinh: string;
  tenChuongTrinh: string;
  maNganhBoGddt: string;
  khoaQuanLy: string;
  maPhuongThuc: string;
  tenPhuongThuc: string;
  maToHop: string;
  tenToHop: string;
  
  // Điểm số chi tiết
  diemChiTiet: Array<{
    mon: string;
    diem: number | string;
  }>;
  tongDiemHocTap: number;
  tongDiemUuTien: number;
  tongDiemXetTuyen: number;
  diemChuanNamTruoc?: number;
  
  // Trạng thái chung
  trangThai: "DAT_SO_TUYEN" | "CHO_DOI_SOAT" | "CAN_BO_SUNG" | "CHUA_DAT";
  ngayNop: string;
  ngayCapNhatCuoi: string;
  ghiChuHoiDong: string;
  huongDanTiepTheo: string;
  hanChotBoSung?: string;
  
  // Minh chứng & Timeline
  danhSachMinhChung: GiayToMinhChung[];
  lichSuXuLy: TimelineEvent[];
}

// CSDL mẫu đại diện cho 3 trường hợp điển hình tuyển sinh K66
const MOCK_HO_SO_DATABASE: HoSoTuyenSinh[] = [
  {
    maHoSo: "UTC26-HN0088",
    cccd: "001206012345",
    hoTen: "NGUYỄN HOÀNG LONG",
    ngaySinh: "15/08/2008",
    gioiTinh: "Nam",
    soDienThoai: "0912 345 678",
    email: "long.nguyenh2008@gmail.com",
    truongThpt: "THPT Chuyên Hà Nội - Amsterdam",
    tinhThanh: "Hà Nội",
    khuVuc: "KV3",
    diemKhuVuc: 0.0,
    doiTuongUuTien: "Không",
    diemDoiTuong: 0.0,

    soThuTuNv: 1,
    maChuongTrinh: "7520216",
    tenChuongTrinh: "Kỹ thuật Robot và Trí tuệ nhân tạo (Chương trình Tiên tiến)",
    maNganhBoGddt: "7520216_TT",
    khoaQuanLy: "Khoa Điện - Điện tử",
    maPhuongThuc: "PT2",
    tenPhuongThuc: "Xét tuyển kết hợp Chứng chỉ Quốc tế & Học bạ THPT",
    maToHop: "A01",
    tenToHop: "Toán, Vật lý, Tiếng Anh",

    diemChiTiet: [
      { mon: "Điểm TB Toán (3 năm THPT)", diem: 9.4 },
      { mon: "Điểm TB Vật lý (3 năm THPT)", diem: 9.1 },
      { mon: "Chứng chỉ IELTS Academic 7.5 (Quy đổi)", diem: 10.0 },
    ],
    tongDiemHocTap: 28.5,
    tongDiemUuTien: 0.0,
    tongDiemXetTuyen: 28.5,
    diemChuanNamTruoc: 26.8,

    trangThai: "DAT_SO_TUYEN",
    ngayNop: "20/05/2026 - 09:15",
    ngayCapNhatCuoi: "05/06/2026 - 16:30",
    ghiChuHoiDong:
      "Hồ sơ đầy đủ, minh chứng chứng chỉ IELTS 7.5 đã được Trung tâm Khảo thí IDP xác thực hợp lệ. Thí sinh ĐỦ ĐIỀU KIỆN TRÚNG TUYỂN SỚM theo phương thức xét tuyển kết hợp.",
    huongDanTiepTheo:
      "Thí sinh cần đăng ký nguyện vọng này là Nguyện vọng 1 trên Cổng thông tin tuyển sinh chung của Bộ GD&ĐT (từ ngày 10/07 đến 25/07/2026) để được công nhận trúng tuyển chính thức. Giữ gìn bản gốc học bạ để nộp khi làm thủ tục nhập học trực tiếp tại Trường.",
    
    danhSachMinhChung: [
      {
        id: "mc-1",
        tenGiayTo: "Học bạ THPT (Bản sao công chứng 6 học kỳ)",
        maLoai: "HOC_BA",
        tenTep: "HocBa_NguyenHoangLong_Ams.pdf",
        dungLuong: "4.2 MB",
        ngayUpload: "20/05/2026",
        trangThai: "HOP_LE",
        ghiChu: "Đầy đủ chữ ký BGH và dấu giáp lai từng trang.",
      },
      {
        id: "mc-2",
        tenGiayTo: "Chứng chỉ Tiếng Anh IELTS Academic 7.5 (IDP)",
        maLoai: "IELTS",
        tenTep: "IELTS_7.5_TRF_NguyenHoangLong.pdf",
        dungLuong: "1.8 MB",
        ngayUpload: "20/05/2026",
        trangThai: "HOP_LE",
        ghiChu: "Đã đối soát TRF Number hợp lệ trên hệ thống IDP.",
      },
      {
        id: "mc-3",
        tenGiayTo: "Căn cước công dân gắn chip (2 mặt)",
        maLoai: "CCCD",
        tenTep: "CCCD_001206012345.pdf",
        dungLuong: "1.1 MB",
        ngayUpload: "20/05/2026",
        trangThai: "HOP_LE",
      },
    ],

    lichSuXuLy: [
      {
        step: 1,
        tieuDe: "Hồ sơ đăng ký nộp trực tuyến thành công",
        thoiGian: "09:15 - 20/05/2026",
        boPhanXuLy: "Hệ thống Cổng Tuyển sinh UTC",
        noiDung: "Thí sinh gửi thành công thông tin cá nhân và 3 tệp minh chứng số hóa.",
        trangThai: "COMPLETED",
      },
      {
        step: 2,
        tieuDe: "Cán bộ tiếp nhận & Kiểm tra tính pháp lý minh chứng",
        thoiGian: "14:20 - 22/05/2026",
        boPhanXuLy: "Ban Thư ký Tuyển sinh UTC (Cơ sở Hà Nội)",
        noiDung: "Đã kiểm tra đối chiếu học bạ THPT và gửi yêu cầu xác thực IELTS sang tổ chức khảo thí.",
        trangThai: "COMPLETED",
      },
      {
        step: 3,
        tieuDe: "Hội đồng Tuyển sinh xét duyệt sơ tuyển",
        thoiGian: "16:30 - 05/06/2026",
        boPhanXuLy: "Hội đồng Tuyển sinh Đại học UTC",
        noiDung: "Điểm quy đổi đạt 28.50 điểm (vượt ngưỡng điểm chuẩn điều kiện). Phê duyệt diện: ĐỦ ĐIỀU KIỆN TRÚNG TUYỂN SỚM.",
        trangThai: "COMPLETED",
      },
      {
        step: 4,
        tieuDe: "Xác nhận nhập học & Nhận Giấy báo trúng tuyển",
        thoiGian: "Dự kiến 20/08/2026",
        boPhanXuLy: "Phòng Công tác Chính trị & Sinh viên",
        noiDung: "Thực hiện theo lịch công bố nhập học chính thức của Trường ĐH Giao thông Vận tải.",
        trangThai: "CURRENT",
      },
    ],
  },
  {
    maHoSo: "UTC26-HN0124",
    cccd: "001204008899",
    hoTen: "TRẦN PHƯƠNG ANH",
    ngaySinh: "24/11/2008",
    gioiTinh: "Nữ",
    soDienThoai: "0988 776 655",
    email: "phuonganh.tran2008@gmail.com",
    truongThpt: "THPT Kim Liên",
    tinhThanh: "Hà Nội",
    khuVuc: "KV3",
    diemKhuVuc: 0.0,
    doiTuongUuTien: "Không",
    diemDoiTuong: 0.0,

    soThuTuNv: 1,
    maChuongTrinh: "7480201",
    tenChuongTrinh: "Công nghệ thông tin (Chương trình Chuẩn)",
    maNganhBoGddt: "7480201",
    khoaQuanLy: "Khoa Công nghệ Thông tin",
    maPhuongThuc: "PT4",
    tenPhuongThuc: "Xét tuyển theo kết quả Đánh giá Tư duy (ĐHBK Hà Nội - TSA)",
    maToHop: "K00",
    tenToHop: "Bài thi Đánh giá tư duy TSA",

    diemChiTiet: [
      { mon: "Điểm phần Tư duy Toán học", diem: 26.5 },
      { mon: "Điểm phần Tư duy Đọc hiểu", diem: 18.2 },
      { mon: "Điểm phần Tư duy Khoa học / Giải quyết vấn đề", diem: 24.8 },
    ],
    tongDiemHocTap: 69.5,
    tongDiemUuTien: 0.0,
    tongDiemXetTuyen: 69.5,
    diemChuanNamTruoc: 65.0,

    trangThai: "CHO_DOI_SOAT",
    ngayNop: "02/06/2026 - 14:05",
    ngayCapNhatCuoi: "04/06/2026 - 10:15",
    ghiChuHoiDong:
      "Hệ thống đã tiếp nhận dữ liệu điểm TSA. Đang chờ đồng bộ dữ liệu điểm số chính thức từ Cổng Khảo thí ĐHBK Hà Nội để xác nhận điểm sàn.",
    huongDanTiepTheo:
      "Hồ sơ đang ở trạng thái xử lý bình thường. Thí sinh không cần nộp thêm giấy tờ, vui lòng theo dõi lại trạng thái trên trang này sau 48 giờ.",

    danhSachMinhChung: [
      {
        id: "mc-1",
        tenGiayTo: "Phiếu điểm Đánh giá tư duy TSA đợt 2 (ĐHBK)",
        maLoai: "TSA",
        tenTep: "PhieuDiem_TSA_Dot2_PhuongAnh.pdf",
        dungLuong: "1.4 MB",
        ngayUpload: "02/06/2026",
        trangThai: "CHO_DUYET",
        ghiChu: "Đang chờ API đồng bộ dữ liệu đợt thi.",
      },
      {
        id: "mc-2",
        tenGiayTo: "Học bạ THPT (5 học kỳ)",
        maLoai: "HOC_BA",
        tenTep: "HocBa_TranPhuongAnh.pdf",
        dungLuong: "3.9 MB",
        ngayUpload: "02/06/2026",
        trangThai: "HOP_LE",
      },
      {
        id: "mc-3",
        tenGiayTo: "Căn cước công dân gắn chip",
        maLoai: "CCCD",
        tenTep: "CCCD_001204008899.pdf",
        dungLuong: "0.9 MB",
        ngayUpload: "02/06/2026",
        trangThai: "HOP_LE",
      },
    ],

    lichSuXuLy: [
      {
        step: 1,
        tieuDe: "Hồ sơ đăng ký nộp trực tuyến thành công",
        thoiGian: "14:05 - 02/06/2026",
        boPhanXuLy: "Hệ thống Cổng Tuyển sinh UTC",
        noiDung: "Thí sinh đăng ký xét tuyển nguyện vọng 1 ngành Công nghệ thông tin theo kết quả TSA.",
        trangThai: "COMPLETED",
      },
      {
        step: 2,
        tieuDe: "Đối soát và Thẩm định chứng chỉ / Điểm thi năng lực",
        thoiGian: "10:15 - 04/06/2026",
        boPhanXuLy: "Ban Thư ký Tuyển sinh UTC",
        noiDung: "Cán bộ đang đối soát số báo danh và chứng chỉ TSA với dữ liệu Trung tâm Khảo thí.",
        trangThai: "CURRENT",
      },
      {
        step: 3,
        tieuDe: "Xét duyệt và Công bố kết quả sơ tuyển",
        thoiGian: "Dự kiến 25/06/2026",
        boPhanXuLy: "Hội đồng Tuyển sinh Đại học UTC",
        noiDung: "Tổng hợp danh sách đạt ngưỡng điểm chuẩn điều kiện.",
        trangThai: "PENDING",
      },
    ],
  },
  {
    maHoSo: "UTC26-HN0312",
    cccd: "001205007788",
    hoTen: "LÊ MINH ĐỨC",
    ngaySinh: "08/03/2008",
    gioiTinh: "Nam",
    soDienThoai: "0977 123 999",
    email: "duc.leminh08@gmail.com",
    truongThpt: "THPT Ngô Quyền",
    tinhThanh: "Hải Phòng",
    khuVuc: "KV2",
    diemKhuVuc: 0.25,
    doiTuongUuTien: "Không",
    diemDoiTuong: 0.0,

    soThuTuNv: 1,
    maChuongTrinh: "7510205",
    tenChuongTrinh: "Kỹ thuật Ô tô (Chương trình Chuẩn)",
    maNganhBoGddt: "7510205",
    khoaQuanLy: "Khoa Cơ khí",
    maPhuongThuc: "PT1",
    tenPhuongThuc: "Xét tuyển Học bạ THPT (5 học kỳ)",
    maToHop: "A00",
    tenToHop: "Toán, Vật lý, Hóa học",

    diemChiTiet: [
      { mon: "Điểm TB Toán (5 kỳ THPT)", diem: 8.8 },
      { mon: "Điểm TB Vật lý (5 kỳ THPT)", diem: 8.4 },
      { mon: "Điểm TB Hóa học (5 kỳ THPT)", diem: 8.2 },
    ],
    tongDiemHocTap: 25.4,
    tongDiemUuTien: 0.25,
    tongDiemXetTuyen: 25.65,
    diemChuanNamTruoc: 25.5,

    trangThai: "CAN_BO_SUNG",
    ngayNop: "28/05/2026 - 11:20",
    ngayCapNhatCuoi: "03/06/2026 - 09:30",
    ghiChuHoiDong:
      "YÊU CẦU BỔ SUNG MINH CHỨNG: Tệp scan Học bạ THPT tải lên bị mờ trang 3 và thiếu chữ ký xác nhận của Ban Giám hiệu cùng dấu tròn đỏ của trường THPT. Vui lòng chụp lại bản gốc sắc nét và cập nhật trước thời hạn quy định.",
    huongDanTiepTheo:
      "Thí sinh cần chuẩn bị lại bản scan học bạ rõ nét (có dấu giáp lai và dấu đỏ trang điểm số) rồi liên hệ nộp bổ sung qua email tuyensinh@utc.edu.vn hoặc nộp trực tiếp tại Phòng 101 Nhà A1 - Trường ĐH Giao thông Vận tải.",
    hanChotBoSung: "17h00 ngày 20/06/2026",

    danhSachMinhChung: [
      {
        id: "mc-1",
        tenGiayTo: "Học bạ THPT (Bản chụp 5 học kỳ)",
        maLoai: "HOC_BA",
        tenTep: "HocBa_LeMinhDuc_LoiMoDau.pdf",
        dungLuong: "2.1 MB",
        ngayUpload: "28/05/2026",
        trangThai: "CAN_BO_SUNG",
        ghiChu: "Thiếu mộc đỏ BGH trang 3, ảnh chụp bị mờ phần điểm Hóa.",
      },
      {
        id: "mc-2",
        tenGiayTo: "Căn cước công dân gắn chip",
        maLoai: "CCCD",
        tenTep: "CCCD_001205007788.pdf",
        dungLuong: "1.2 MB",
        ngayUpload: "28/05/2026",
        trangThai: "HOP_LE",
      },
    ],

    lichSuXuLy: [
      {
        step: 1,
        tieuDe: "Hồ sơ đăng ký nộp trực tuyến",
        thoiGian: "11:20 - 28/05/2026",
        boPhanXuLy: "Hệ thống Cổng Tuyển sinh UTC",
        noiDung: "Thí sinh đăng ký nguyện vọng ngành Kỹ thuật Ô tô theo điểm học bạ.",
        trangThai: "COMPLETED",
      },
      {
        step: 2,
        tieuDe: "Thẩm định hồ sơ & Phát hiện minh chứng chưa đạt",
        thoiGian: "09:30 - 03/06/2026",
        boPhanXuLy: "Ban Thư ký Tuyển sinh UTC",
        noiDung: "Học bạ thiếu dấu đỏ giáp lai trường THPT. Cán bộ đã kích hoạt trạng thái: CẦN BỔ SUNG MINH CHỨNG.",
        trangThai: "CURRENT",
      },
      {
        step: 3,
        tieuDe: "Tiếp nhận minh chứng bổ sung & Xét duyệt lại",
        thoiGian: "Hạn chót: 17h00 ngày 20/06/2026",
        boPhanXuLy: "Ban Thư ký Tuyển sinh UTC",
        noiDung: "Chờ thí sinh gửi lại bản số hóa học bạ hợp lệ.",
        trangThai: "PENDING",
      },
      {
        step: 4,
        tieuDe: "Xét duyệt và Công bố kết quả sơ tuyển",
        thoiGian: "Dự kiến 30/06/2026",
        boPhanXuLy: "Hội đồng Tuyển sinh Đại học UTC",
        noiDung: "Đánh giá đạt ngưỡng điểm chuẩn khi đã hoàn thiện minh chứng.",
        trangThai: "PENDING",
      },
    ],
  },
];

export default function TraCuuHoSoClient() {
  const searchParams = useSearchParams();
  const initialQ = searchParams.get("q") || searchParams.get("cccd") || "";

  const [queryInput, setQueryInput] = useState(initialQ);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [results, setResults] = useState<HoSoTuyenSinh[]>([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [activeTabByMaHoSo, setActiveTabByMaHoSo] = useState<Record<string, "chi_tiet" | "minh_chung" | "lich_su">>({});

  // Lấy lịch sử tìm kiếm gần đây từ localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const savedRecent = localStorage.getItem("UTC_RECENT_SEARCHES");
        if (savedRecent) {
          setRecentSearches(JSON.parse(savedRecent));
        }
      } catch (e) {
        // ignore
      }
    }
  }, []);

  const saveRecentQuery = (q: string) => {
    if (typeof window !== "undefined") {
      try {
        const updated = Array.from(new Set([q, ...recentSearches])).slice(0, 5);
        setRecentSearches(updated);
        localStorage.setItem("UTC_RECENT_SEARCHES", JSON.stringify(updated));
      } catch (e) {
        // ignore
      }
    }
  };

  const executeSearch = async (rawVal: string) => {
    const q = rawVal.trim().toUpperCase();
    if (!q) {
      setErrorMessage("Vui lòng nhập Mã hồ sơ (VD: UTC26-HN0088) hoặc Số CCCD/Định danh (12 chữ số)!");
      return;
    }

    setErrorMessage("");
    setIsLoading(true);
    setHasSearched(true);
    saveRecentQuery(q);

    try {
      // 1. Tra cứu trực tiếp từ Supabase Database qua Server Action
      const dbRes = await traCuuHoSoDbAction(q);
      const dbMatches: HoSoTuyenSinh[] =
        dbRes.success && dbRes.data
          ? (dbRes.data.map((item) => ({ ...item, source: "db" as const })) as any)
          : [];

      // 2. Tìm trong localStorage nếu người dùng từng nộp hồ sơ ở trang /nop-ho-so trên trình duyệt này
      let localMatches: HoSoTuyenSinh[] = [];
      if (typeof window !== "undefined") {
        try {
          const localListStr = localStorage.getItem("UTC_SUBMITTED_APPLICATIONS");
          if (localListStr) {
            const localList = JSON.parse(localListStr);
            if (Array.isArray(localList)) {
              const matchedRaw = localList.filter((item: any) => {
                const itemMa = (item.maHoSo || "").toUpperCase();
                const itemCccd = item.cccd || "";
                return itemMa.includes(q) || itemCccd.includes(q);
              });

              // Chuyển đổi sang format HoSoTuyenSinh
              localMatches = matchedRaw.map(
                (item: any): HoSoTuyenSinh => ({
                  source: "local",
                  maHoSo: item.maHoSo || "UTC26-CUSTOM",
                  cccd: item.cccd || "001206xxxxxx",
                  hoTen: item.hoTen || "Thí sinh tự do",
                  ngaySinh: "01/01/2008",
                  gioiTinh: "Chưa cập nhật",
                  soDienThoai: item.soDienThoai || "",
                  email: "thisinh@utc.edu.vn",
                  truongThpt: "Trường THPT Thí sinh",
                  tinhThanh: "Toàn quốc",
                  khuVuc: item.khuVuc || "KV3",
                  diemKhuVuc: 0.0,
                  doiTuongUuTien: item.doiTuongUuTien || "Không",
                  diemDoiTuong: 0.0,
                  soThuTuNv: 1,
                  maChuongTrinh: item.maChuongTrinh || "K66",
                  tenChuongTrinh: item.tenChuongTrinh || "Chương trình Đào tạo UTC",
                  maNganhBoGddt: item.maChuongTrinh || "GHA",
                  khoaQuanLy: "Hội đồng Tuyển sinh UTC",
                  maPhuongThuc: item.maPhuongThuc || "PT",
                  tenPhuongThuc: item.tenPhuongThuc || "Xét tuyển Trực tuyến K66",
                  maToHop: item.maToHop || "A00",
                  tenToHop: `Tổ hợp ${item.maToHop || "A00"}`,
                  diemChiTiet: [
                    { mon: "Điểm xét tuyển hồ sơ", diem: "Đang tính toán" },
                  ],
                  tongDiemHocTap: 0,
                  tongDiemUuTien: 0,
                  tongDiemXetTuyen: 0,
                  trangThai:
                    item.trangThai === "hop_le"
                      ? "DAT_SO_TUYEN"
                      : item.trangThai === "tu_choi"
                      ? "CAN_BO_SUNG"
                      : "CHO_DOI_SOAT",
                  ngayNop: item.ngayNop || "Hôm nay",
                  ngayCapNhatCuoi: item.ngayNop || "Hôm nay",
                  ghiChuHoiDong:
                    "Hồ sơ được gửi trực tuyến qua Cổng Thí sinh. Đang chờ Ban Tuyển sinh tiếp nhận và đối soát minh chứng.",
                  huongDanTiepTheo:
                    "Vui lòng giữ lại biên nhận và kiểm tra lại trạng thái sau 2-3 ngày làm việc.",
                  danhSachMinhChung: (item.giayToDinhKem || []).map(
                    (doc: any, dIdx: number) => ({
                      id: `loc-mc-${dIdx}`,
                      tenGiayTo: doc.loai_chung_chi || "Minh chứng đính kèm",
                      maLoai: "FILE",
                      tenTep: doc.file_dinh_kem || "tep_dinh_kem.pdf",
                      dungLuong: "1.5 MB",
                      ngayUpload: item.ngayNop || "Hôm nay",
                      trangThai: "CHO_DUYET",
                    })
                  ),
                  lichSuXuLy: (item.historyTimeline || []).map((tl: any) => ({
                    step: tl.step,
                    tieuDe: tl.title,
                    thoiGian: tl.time,
                    boPhanXuLy: "Ban Thư ký Tuyển sinh UTC",
                    noiDung: tl.description,
                    trangThai: tl.status,
                  })),
                })
              );
            }
          }
        } catch (e) {
          // ignore
        }
      }

      // 3. Tìm trong DB Mock nếu cả DB và localStorage đều chưa có
      const mockMatches: HoSoTuyenSinh[] =
        dbMatches.length === 0 && localMatches.length === 0
          ? MOCK_HO_SO_DATABASE.filter((item) => {
              const matchMa = item.maHoSo.toUpperCase().includes(q);
              const matchCccd = item.cccd.includes(q);
              const matchPhone = item.soDienThoai
                .replace(/\s+/g, "")
                .includes(q.replace(/\s+/g, ""));
              return matchMa || matchCccd || matchPhone;
            }).map((item) => ({ ...item, source: "mock" as const }))
          : [];

      // Kết hợp kết quả: Ưu tiên dữ liệu thực tế từ Supabase DB
      const combined = [...dbMatches, ...localMatches, ...mockMatches];

      // Loại bỏ trùng mã hồ sơ nếu có
      const uniqueMap = new Map<string, HoSoTuyenSinh>();
      combined.forEach((item) => {
        if (!uniqueMap.has(item.maHoSo)) {
          uniqueMap.set(item.maHoSo, item);
        }
      });

      const finalResults = Array.from(uniqueMap.values());

      if (finalResults.length > 0) {
        setResults(finalResults);
      } else {
        setResults([]);
        setErrorMessage(
          `Không tìm thấy hồ sơ nào khớp với từ khóa "${rawVal}". Vui lòng kiểm tra lại chính xác 12 chữ số CCCD hoặc Mã hồ sơ (VD: UTC26-HN0088).`
        );
      }
    } catch (e: any) {
      setErrorMessage("Lỗi kết nối cơ sở dữ liệu tuyển sinh. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (initialQ) {
      setQueryInput(initialQ);
      executeSearch(initialQ);
    }
  }, [initialQ]);

  const handleQuickDemoClick = (demoCode: string) => {
    setQueryInput(demoCode);
    executeSearch(demoCode);
  };

  const getStatusBadge = (status: HoSoTuyenSinh["trangThai"]) => {
    switch (status) {
      case "DAT_SO_TUYEN":
        return (
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#dcfce7] text-[#15803d] border-[2px] border-[#16a34a] rounded-xl font-display font-black text-[13px] shadow-[2px_2px_0px_#16a34a]">
            <span className="material-symbols-outlined text-[18px]">verified</span>
            <span>ĐỦ ĐIỀU KIỆN TRÚNG TUYỂN SỚM</span>
          </div>
        );
      case "CHO_DOI_SOAT":
        return (
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#fef3c7] text-[#92400e] border-[2px] border-[#f59e0b] rounded-xl font-display font-black text-[13px] shadow-[2px_2px_0px_#f59e0b]">
            <span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b] animate-ping" />
            <span>ĐANG TIẾP NHẬN & ĐỐI SOÁT HỒ SƠ</span>
          </div>
        );
      case "CAN_BO_SUNG":
        return (
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#fee2e2] text-[#b91c1c] border-[2px] border-[#ef4444] rounded-xl font-display font-black text-[13px] shadow-[2px_2px_0px_#ef4444] animate-pulse">
            <span className="material-symbols-outlined text-[18px]">warning</span>
            <span>CẦN BỔ SUNG / ĐIỀU CHỈNH MINH CHỨNG</span>
          </div>
        );
      case "CHUA_DAT":
      default:
        return (
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#f1f5f9] text-[#475569] border-[2px] border-[#64748b] rounded-xl font-display font-black text-[13px] shadow-[2px_2px_0px_#64748b]">
            <span className="material-symbols-outlined text-[18px]">info</span>
            <span>CHƯA ĐẠT NGƯỠNG ĐIỀU KIỆN</span>
          </div>
        );
    }
  };

  const getDocStatusBadge = (st: GiayToMinhChung["trangThai"]) => {
    switch (st) {
      case "HOP_LE":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#dcfce7] text-[#15803d] border border-[#16a34a] rounded text-[11px] font-bold">
            <span className="material-symbols-outlined text-[13px]">check_circle</span>
            Đã duyệt hợp lệ
          </span>
        );
      case "CAN_BO_SUNG":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#fee2e2] text-[#b91c1c] border border-[#ef4444] rounded text-[11px] font-bold">
            <span className="material-symbols-outlined text-[13px]">error</span>
            Cần tải lại
          </span>
        );
      case "CHO_DUYET":
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#fef3c7] text-[#92400e] border border-[#f59e0b] rounded text-[11px] font-bold">
            <span className="material-symbols-outlined text-[13px]">schedule</span>
            Chờ thẩm định
          </span>
        );
    }
  };

  const getActiveTab = (maHoSo: string) => {
    return activeTabByMaHoSo[maHoSo] || "chi_tiet";
  };

  const setActiveTab = (maHoSo: string, tab: "chi_tiet" | "minh_chung" | "lich_su") => {
    setActiveTabByMaHoSo((prev) => ({ ...prev, [maHoSo]: tab }));
  };

  return (
    <div className="flex flex-col w-full space-y-7 pb-20">
      {/* 1. Header Banner Neo-Brutalism */}
      <div className="bg-[#fffdf7] p-6 lg:p-8 border-[3px] border-[#111827] shadow-[6px_6px_0px_#111827] rounded-2xl relative overflow-hidden print:hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#fdb712]/15 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className="px-3 py-1 bg-[#0d1b4e] text-white font-stamp text-[12px] font-black border-[2px] border-[#111827] rounded-lg shadow-[2px_2px_0px_#111827]">
            CỔNG THÔNG TIN THÍ SINH
          </span>
          <span className="px-3 py-1 bg-[#fdb712] text-[#0d1b4e] font-stamp text-[12px] font-black border-[2px] border-[#111827] rounded-lg shadow-[2px_2px_0px_#111827]">
            TRA CỨU HỒ SƠ TUYỂN SINH K66
          </span>
          <span className="px-3 py-1 bg-[#e0f2fe] text-[#0369a1] font-bold text-[12px] border-[1.5px] border-[#111827] rounded-lg">
            Đại học Giao thông Vận tải (GHA)
          </span>
        </div>

        <h1 className="font-display font-black text-[26px] sm:text-[34px] text-[#0d1b4e] uppercase leading-tight tracking-tight">
          Tra Cứu Trạng Thái & Lịch Sử Xử Lý Hồ Sơ Xét Tuyển
        </h1>

        <p className="text-[14px] text-[#4b5563] mt-2 max-w-4xl leading-relaxed">
          Tra cứu tiến độ đối soát học bạ, chứng chỉ năng lực (IELTS / TSA / ĐGNL), tình trạng thẩm định giấy tờ minh chứng và lịch sử cập nhật theo thời gian thực của Hội đồng Tuyển sinh Trường Đại học Giao thông Vận tải.
        </p>
      </div>

      <div className="print:hidden">
        <DisclaimerBanner />
      </div>

      {/* 2. Hộp Tìm Kiếm & Quick Demo Buttons */}
      <div className="bg-white p-6 lg:p-7 border-[3px] border-[#111827] shadow-[6px_6px_0px_#111827] rounded-2xl space-y-4 print:hidden">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            executeSearch(queryInput);
          }}
          className="flex flex-col sm:flex-row items-center gap-3"
        >
          <div className="relative flex-1 w-full">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#64748b] text-[22px]">
              badge
            </span>
            <input
              type="text"
              placeholder="Nhập Mã hồ sơ (VD: UTC26-HN0088) hoặc Số CCCD (12 số)..."
              value={queryInput}
              onChange={(e) => setQueryInput(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-[#fffdf7] border-[2px] border-[#111827] rounded-xl font-bold text-[14px] sm:text-[15px] text-[#0d1b4e] outline-none placeholder:text-[#9ca3af] focus:ring-2 focus:ring-[#fdb712] uppercase tracking-wide"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full sm:w-auto px-8 py-3.5 bg-[#0284c7] hover:bg-[#0369a1] text-white font-display font-black text-[14px] uppercase tracking-wider rounded-xl border-[2px] border-[#111827] shadow-[3px_3px_0px_#111827] active:translate-x-[1px] active:translate-y-[1px] transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer"
          >
            {isLoading ? (
              <>
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Đang Tra Cứu...</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[20px]">search</span>
                <span>Tra Cứu Hồ Sơ</span>
              </>
            )}
          </button>
        </form>

        {/* Nút bấm trải nghiệm nhanh các mẫu hồ sơ */}
        <div className="pt-2 border-t border-dashed border-[#e2e8f0] flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[12px] font-bold text-[#64748b] flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px] text-[#f59e0b]">lightbulb</span>
              Bấm để xem mẫu hồ sơ thực tế:
            </span>
            <button
              type="button"
              onClick={() => handleQuickDemoClick("UTC26-HN0088")}
              className="px-2.5 py-1 bg-[#dcfce7] hover:bg-[#bbf7d0] text-[#15803d] border-[1.5px] border-[#16a34a] rounded-lg text-[11.5px] font-bold transition-all shadow-[1.5px_1.5px_0px_#16a34a] cursor-pointer"
            >
              ✓ Mẫu 1: Đủ ĐK trúng tuyển sớm (Robot & AI)
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemoClick("UTC26-HN0124")}
              className="px-2.5 py-1 bg-[#fef3c7] hover:bg-[#fde68a] text-[#92400e] border-[1.5px] border-[#f59e0b] rounded-lg text-[11.5px] font-bold transition-all shadow-[1.5px_1.5px_0px_#f59e0b] cursor-pointer"
            >
              ⏳ Mẫu 2: Đang đối soát TSA (CNTT)
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemoClick("UTC26-HN0312")}
              className="px-2.5 py-1 bg-[#fee2e2] hover:bg-[#fecaca] text-[#b91c1c] border-[1.5px] border-[#ef4444] rounded-lg text-[11.5px] font-bold transition-all shadow-[1.5px_1.5px_0px_#ef4444] cursor-pointer"
            >
              ⚠️ Mẫu 3: Cần bổ sung minh chứng (Kỹ thuật Ô tô)
            </button>
          </div>

          {recentSearches.length > 0 && (
            <div className="text-[11.5px] text-[#64748b] flex items-center gap-1.5 flex-wrap">
              <span className="font-bold">Đã tra gần đây:</span>
              {recentSearches.map((rec, rIdx) => (
                <button
                  key={rIdx}
                  type="button"
                  onClick={() => handleQuickDemoClick(rec)}
                  className="underline hover:text-[#0284c7] font-mono font-bold"
                >
                  {rec}
                </button>
              ))}
            </div>
          )}
        </div>

        {errorMessage && (
          <div className="mt-3 p-3.5 bg-[#fee2e2] border-[2px] border-[#ef4444] rounded-xl text-[#b91c1c] font-bold text-[13px] flex items-start gap-2.5">
            <span className="material-symbols-outlined text-[20px] shrink-0 mt-0.5">error</span>
            <div className="space-y-1">
              <p>{errorMessage}</p>
              <p className="text-[12px] font-normal text-[#991b1b]">
                Gợi ý: Thử bấm một trong ba nút mẫu hồ sơ phía trên để xem giao diện chi tiết.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 3. Hiển thị Kết Quả Chi Tiết Hồ Sơ */}
      {hasSearched && !isLoading && results.length > 0 && (
        <div className="space-y-8">
          {/* Header In Ấn Trang Trọng (Chỉ xuất hiện khi In) */}
          <div className="hidden print:block mb-6 border-b-2 border-black pb-4 text-center">
            <div className="flex justify-between items-start text-[12px] leading-snug">
              <div className="text-center font-bold">
                <p>BỘ GIÁO DỤC VÀ ĐÀO TẠO</p>
                <p className="font-extrabold text-[13px]">TRƯỜNG ĐẠI HỌC GIAO THÔNG VẬN TẢI</p>
                <p className="text-[11px] font-normal">HỘI ĐỒNG TUYỂN SINH ĐẠI HỌC CHÍNH QUY K66</p>
              </div>
              <div className="text-center font-bold">
                <p>CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</p>
                <p className="underline decoration-1 underline-offset-4">Độc lập - Tự do - Hạnh phúc</p>
                <p className="text-[11px] font-normal italic mt-1">
                  Hà Nội, ngày {new Date().getDate()} tháng {new Date().getMonth() + 1} năm {new Date().getFullYear()}
                </p>
              </div>
            </div>
            <h2 className="text-[18px] font-black uppercase mt-5 tracking-wide">
              PHIẾU TRA CỨU TIẾN TRÌNH & KẾT QUẢ XÉT TUYỂN TRỰC TUYẾN K66
            </h2>
          </div>

          <div className="flex items-center justify-between print:hidden">
            <h3 className="font-display font-black text-[20px] text-[#0d1b4e] uppercase flex items-center gap-2">
              <span className="material-symbols-outlined text-[#16a34a] text-[24px]">verified_user</span>
              <span>Hồ Sơ Xét Tuyển Khớp Với Dữ Liệu ({results.length} hồ sơ):</span>
            </h3>

            <button
              onClick={() => window.print()}
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 bg-white border-[2px] border-[#111827] rounded-lg text-[12px] font-bold text-[#0d1b4e] hover:bg-[#fffdf7] shadow-[2px_2px_0px_#111827] cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">print</span>
              <span>In Phiếu Tra Cứu</span>
            </button>
          </div>

          {results.map((rec) => {
            const currentTab = getActiveTab(rec.maHoSo);

            return (
              <div
                key={rec.maHoSo}
                className="bg-white border-[3px] border-[#111827] shadow-[8px_8px_0px_#111827] rounded-2xl overflow-hidden space-y-0 print:border-none print:shadow-none print:rounded-none"
              >
                {/* Header Profile Bar */}
                <div className="p-6 lg:p-7 bg-[#fffdf7] border-b-[3px] border-[#111827] print:border-b-2 print:border-black print:p-0 print:bg-white">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-3 py-1 bg-[#0d1b4e] text-white font-mono font-black text-[12px] rounded-lg border border-[#111827]">
                          MÃ HỒ SƠ: {rec.maHoSo}
                        </span>
                        {rec.source === "db" ? (
                          <span className="px-2.5 py-1 bg-[#dbeafe] text-[#1e40af] text-[11px] font-bold rounded-lg border border-[#93c5fd] flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-[#2563eb]" />
                            CSDL Supabase UTC
                          </span>
                        ) : rec.source === "local" ? (
                          <span className="px-2.5 py-1 bg-[#fef3c7] text-[#92400e] text-[11px] font-bold rounded-lg border border-[#f59e0b] flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-[#f59e0b]" />
                            Hồ sơ vừa nộp
                          </span>
                        ) : null}
                        <span className="px-2.5 py-1 bg-[#fdb712] text-[#0d1b4e] font-stamp text-[11px] font-black rounded-lg border border-[#111827]">
                          NGÀY NỘP: {rec.ngayNop}
                        </span>
                        <span className="px-2.5 py-1 bg-[#f1f5f9] text-[#475569] text-[11px] font-bold rounded-lg border border-[#cbd5e1]">
                          CẬP NHẬT: {rec.ngayCapNhatCuoi}
                        </span>
                      </div>

                      <h2 className="font-display font-black text-[24px] sm:text-[30px] text-[#0d1b4e] tracking-tight">
                        {rec.hoTen}
                      </h2>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] text-[#64748b]">
                        <span>
                          Số CCCD: <strong className="text-[#0d1b4e] font-mono">{rec.cccd}</strong>
                        </span>
                        <span>•</span>
                        <span>
                          SĐT: <strong className="text-[#0d1b4e] font-mono">{rec.soDienThoai}</strong>
                        </span>
                        <span>•</span>
                        <span>
                          Email: <strong className="text-[#0d1b4e]">{rec.email}</strong>
                        </span>
                        <span>•</span>
                        <span>
                          Trường: <strong className="text-[#0d1b4e]">{rec.truongThpt} ({rec.tinhThanh})</strong>
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col sm:items-end gap-2 shrink-0">
                      {getStatusBadge(rec.trangThai)}
                      <span className="text-[11.5px] text-[#64748b]">
                        Khu vực: <strong>{rec.khuVuc} (+{rec.diemKhuVuc}đ)</strong> | Đối tượng: <strong>{rec.doiTuongUuTien} (+{rec.diemDoiTuong}đ)</strong>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Hộp Thông Báo & Hướng Dẫn Tùy Theo Trạng Thái */}
                <div className="p-6 bg-white border-b-[2px] border-[#e2e8f0]">
                  <div
                    className={`p-4 sm:p-5 rounded-xl border-[2px] ${
                      rec.trangThai === "DAT_SO_TUYEN"
                        ? "bg-[#f0fdf4] border-[#16a34a] text-[#14532d]"
                        : rec.trangThai === "CAN_BO_SUNG"
                        ? "bg-[#fff1f2] border-[#e11d48] text-[#881337]"
                        : "bg-[#fffbeb] border-[#f59e0b] text-[#78350f]"
                    } space-y-2`}
                  >
                    <div className="flex items-start gap-2.5">
                      <span className="material-symbols-outlined text-[24px] shrink-0 mt-0.5">
                        {rec.trangThai === "DAT_SO_TUYEN"
                          ? "task_alt"
                          : rec.trangThai === "CAN_BO_SUNG"
                          ? "assignment_late"
                          : "pending_actions"}
                      </span>
                      <div className="space-y-1">
                        <h4 className="font-display font-black text-[15px] uppercase tracking-wide">
                          Thông Báo Từ Ban Tuyển Sinh Đại Học UTC:
                        </h4>
                        <p className="text-[13.5px] font-medium leading-relaxed">
                          {rec.ghiChuHoiDong}
                        </p>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-current/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[12.5px]">
                      <div>
                        <strong>Hướng dẫn bước tiếp theo:</strong> {rec.huongDanTiepTheo}
                      </div>
                      {rec.hanChotBoSung && (
                        <div className="font-bold text-[#b91c1c] bg-white px-2.5 py-1 rounded border border-[#ef4444] shrink-0">
                          Hạn chót bổ sung: {rec.hanChotBoSung}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Tab Điều Hướng Chi Tiết */}
                <div className="bg-[#f8fafc] px-6 pt-3 border-b-[2px] border-[#111827] flex gap-2 overflow-x-auto print:hidden">
                  <button
                    type="button"
                    onClick={() => setActiveTab(rec.maHoSo, "chi_tiet")}
                    className={`px-4 py-2.5 font-display font-bold text-[13px] uppercase rounded-t-xl border-t-[2px] border-x-[2px] transition-all cursor-pointer flex items-center gap-1.5 ${
                      currentTab === "chi_tiet"
                        ? "bg-white text-[#0d1b4e] border-[#111827] font-black -mb-[2px] pb-3"
                        : "bg-transparent text-[#64748b] border-transparent hover:text-[#0d1b4e]"
                    }`}
                  >
                    <span className="material-symbols-outlined text-[17px]">school</span>
                    <span>1. Chi Tiết Điểm & Nguyện Vọng</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab(rec.maHoSo, "minh_chung")}
                    className={`px-4 py-2.5 font-display font-bold text-[13px] uppercase rounded-t-xl border-t-[2px] border-x-[2px] transition-all cursor-pointer flex items-center gap-1.5 ${
                      currentTab === "minh_chung"
                        ? "bg-white text-[#0d1b4e] border-[#111827] font-black -mb-[2px] pb-3"
                        : "bg-transparent text-[#64748b] border-transparent hover:text-[#0d1b4e]"
                    }`}
                  >
                    <span className="material-symbols-outlined text-[17px]">folder_check</span>
                    <span>2. Thẩm Định Minh Chứng ({rec.danhSachMinhChung.length})</span>
                    {rec.danhSachMinhChung.some((d) => d.trangThai === "CAN_BO_SUNG") && (
                      <span className="w-2 h-2 rounded-full bg-[#ef4444]" />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab(rec.maHoSo, "lich_su")}
                    className={`px-4 py-2.5 font-display font-bold text-[13px] uppercase rounded-t-xl border-t-[2px] border-x-[2px] transition-all cursor-pointer flex items-center gap-1.5 ${
                      currentTab === "lich_su"
                        ? "bg-white text-[#0d1b4e] border-[#111827] font-black -mb-[2px] pb-3"
                        : "bg-transparent text-[#64748b] border-transparent hover:text-[#0d1b4e]"
                    }`}
                  >
                    <span className="material-symbols-outlined text-[17px]">history</span>
                    <span>3. Lịch Sử Cập Nhật & Tiến Độ</span>
                  </button>
                </div>

                {/* Nội Dung Từng Tab */}
                <div className="p-6 lg:p-8 bg-white">
                  {/* TAB 1: CHI TIẾT ĐIỂM & NGUYỆN VỌNG */}
                  {currentTab === "chi_tiet" && (
                    <div className="space-y-6">
                      {/* Thẻ Ngành & Phương Thức */}
                      <div className="p-5 bg-[#fffdf7] border-[2px] border-[#111827] rounded-xl grid grid-cols-1 md:grid-cols-3 gap-5 text-[13px]">
                        <div className="md:col-span-2 space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 bg-[#0d1b4e] text-white font-bold text-[11px] rounded">
                              NGUYỆN VỌNG {rec.soThuTuNv}
                            </span>
                            <span className="text-[12px] font-bold text-[#64748b]">
                              Mã Bộ: {rec.maNganhBoGddt}
                            </span>
                          </div>
                          <h3 className="font-display font-black text-[18px] sm:text-[20px] text-[#0d1b4e]">
                            {rec.tenChuongTrinh}
                          </h3>
                          <p className="text-[12.5px] text-[#475569]">
                            Đơn vị đào tạo: <strong>{rec.khoaQuanLy}</strong> | Mã CTĐT:{" "}
                            <strong className="font-mono text-[#0284c7]">{rec.maChuongTrinh}</strong>
                          </p>
                        </div>

                        <div className="space-y-1 bg-white p-3.5 border border-[#e2e8f0] rounded-lg">
                          <span className="text-[11px] font-bold text-[#64748b] block uppercase">
                            Phương thức & Tổ hợp:
                          </span>
                          <p className="font-bold text-[#0d1b4e] text-[13.5px]">
                            {rec.tenPhuongThuc} ({rec.maPhuongThuc})
                          </p>
                          <p className="text-[12px] text-[#0284c7] font-semibold">
                            Tổ hợp: {rec.maToHop} - {rec.tenToHop}
                          </p>
                        </div>
                      </div>

                      {/* Bảng Điểm Thành Phần & Tổng Điểm */}
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Chi tiết từng môn */}
                        <div className="lg:col-span-2 space-y-3">
                          <h4 className="font-display font-bold text-[14px] text-[#0d1b4e] uppercase flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-[18px] text-[#0284c7]">analytics</span>
                            Chi tiết điểm thành phần đã quy đổi:
                          </h4>

                          <div className="border-[2px] border-[#111827] rounded-xl overflow-hidden shadow-[3px_3px_0px_#111827]">
                            <table className="w-full text-left text-[13px]">
                              <thead className="bg-[#0d1b4e] text-white font-display font-bold text-[12px] uppercase">
                                <tr>
                                  <th className="py-2.5 px-4">Môn / Tiêu chí xét tuyển</th>
                                  <th className="py-2.5 px-4 text-right">Điểm ghi nhận</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-[#e2e8f0] bg-white">
                                {rec.diemChiTiet.map((m, mIdx) => (
                                  <tr key={mIdx} className="hover:bg-[#fffdf7]">
                                    <td className="py-2.5 px-4 font-medium text-[#1e293b]">
                                      {m.mon}
                                    </td>
                                    <td className="py-2.5 px-4 text-right font-display font-black text-[#0d1b4e] text-[15px]">
                                      {m.diem}
                                    </td>
                                  </tr>
                                ))}
                                <tr className="bg-[#f8fafc] font-bold">
                                  <td className="py-2 px-4 text-[#475569]">
                                    Điểm ưu tiên quy định (Khu vực + Đối tượng)
                                  </td>
                                  <td className="py-2 px-4 text-right text-[#16a34a] font-mono">
                                    +{rec.tongDiemUuTien}
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        </div>

                        {/* Tổng Điểm & So Sánh Ngưỡng */}
                        <div className="bg-[#fffdf7] border-[2px] border-[#111827] rounded-xl p-5 shadow-[4px_4px_0px_#111827] flex flex-col justify-between space-y-4">
                          <div className="space-y-2">
                            <span className="text-[12px] font-bold text-[#64748b] uppercase block">
                              Tổng Điểm Xét Tuyển Chính Thức
                            </span>
                            <div className="font-display font-black text-[36px] text-[#dc2626] leading-none">
                              {rec.tongDiemXetTuyen > 0 ? `${rec.tongDiemXetTuyen} đ` : "Đang tính"}
                            </div>
                            <p className="text-[11.5px] text-[#64748b]">
                              (Đã cộng điểm ưu tiên theo quy chế tuyển sinh hiện hành)
                            </p>
                          </div>

                          {rec.diemChuanNamTruoc && (
                            <div className="p-3 bg-white border border-[#cbd5e1] rounded-lg text-[12px] space-y-1">
                              <div className="flex items-center justify-between text-[#475569]">
                                <span>Điểm chuẩn K65 năm trước:</span>
                                <strong className="font-display text-[#0d1b4e] text-[14px]">
                                  {rec.diemChuanNamTruoc} đ
                                </strong>
                              </div>
                              <div className="flex items-center justify-between text-[#16a34a] font-bold">
                                <span>Chênh lệch điểm số:</span>
                                <span>
                                  {rec.tongDiemXetTuyen >= rec.diemChuanNamTruoc ? "+" : ""}
                                  {(rec.tongDiemXetTuyen - rec.diemChuanNamTruoc).toFixed(2)} đ
                                </span>
                              </div>
                            </div>
                          )}

                          <Link
                            href={`/tra-cuu-nganh-hoc/${rec.maChuongTrinh}`}
                            className="w-full py-2.5 bg-[#fdb712] hover:bg-[#e0a20f] text-[#0d1b4e] font-display font-black text-[12.5px] uppercase tracking-wide rounded-lg border-[1.5px] border-[#111827] text-center shadow-[2px_2px_0px_#111827] flex items-center justify-center gap-1.5 transition-all"
                          >
                            <span>Xem Khung Đào Tạo Ngành Này</span>
                            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                          </Link>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 2: THẨM ĐỊNH MINH CHỨNG */}
                  {currentTab === "minh_chung" && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-display font-bold text-[14px] text-[#0d1b4e] uppercase flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-[18px] text-[#0284c7]">inventory_2</span>
                          Danh sách tài liệu & Giấy tờ số hóa đã nộp:
                        </h4>
                        <span className="text-[12px] text-[#64748b]">
                          Tổng số: <strong>{rec.danhSachMinhChung.length} tệp</strong>
                        </span>
                      </div>

                      <div className="border-[2px] border-[#111827] rounded-xl overflow-hidden shadow-[4px_4px_0px_#111827]">
                        <table className="w-full text-left text-[13px]">
                          <thead className="bg-[#0d1b4e] text-white font-display font-bold text-[12px] uppercase">
                            <tr>
                              <th className="py-3 px-4">Tên Giấy Tờ / Minh Chứng</th>
                              <th className="py-3 px-4 hidden sm:table-cell">Tệp Đính Kèm</th>
                              <th className="py-3 px-4 text-center">Trạng Thái Thẩm Định</th>
                              <th className="py-3 px-4 text-right">Ghi Chú Ban Tuyển Sinh</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#e2e8f0] bg-white">
                            {rec.danhSachMinhChung.map((doc) => (
                              <tr key={doc.id} className="hover:bg-[#fffdf7]">
                                <td className="py-3 px-4">
                                  <div className="font-bold text-[#0d1b4e]">{doc.tenGiayTo}</div>
                                  <div className="text-[11px] text-[#64748b] sm:hidden mt-0.5">
                                    {doc.tenTep} {doc.dungLuong ? `(${doc.dungLuong})` : ""}
                                  </div>
                                </td>

                                <td className="py-3 px-4 hidden sm:table-cell">
                                  <div className="flex items-center gap-1.5 text-[#0284c7] font-mono text-[12px]">
                                    <span className="material-symbols-outlined text-[16px]">attach_file</span>
                                    <span>{doc.tenTep}</span>
                                  </div>
                                  {doc.dungLuong && (
                                    <span className="text-[11px] text-[#94a3b8] block">
                                      {doc.dungLuong} • Tải lên: {doc.ngayUpload}
                                    </span>
                                  )}
                                </td>

                                <td className="py-3 px-4 text-center whitespace-nowrap">
                                  {getDocStatusBadge(doc.trangThai)}
                                </td>

                                <td className="py-3 px-4 text-right text-[12px] text-[#475569]">
                                  {doc.ghiChu || "Hợp lệ theo quy định."}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Hướng dẫn khi có giấy tờ cần bổ sung */}
                      {rec.danhSachMinhChung.some((d) => d.trangThai === "CAN_BO_SUNG") && (
                        <div className="p-4 bg-[#fee2e2] border-[1.5px] border-[#ef4444] rounded-xl text-[13px] text-[#991b1b] flex items-start gap-3">
                          <span className="material-symbols-outlined text-[22px] text-[#dc2626] shrink-0 mt-0.5">
                            error
                          </span>
                          <div className="space-y-1">
                            <h5 className="font-display font-bold uppercase">
                              Lưu ý quan trọng về giấy tờ chưa đạt:
                            </h5>
                            <p>
                              Hồ sơ của bạn có tài liệu cần tải lại hoặc nộp bổ sung bản scan rõ nét có dấu mộc của cơ quan có thẩm quyền. Vui lòng hoàn thành trước hạn chót để không ảnh hưởng đến quyền lợi xét tuyển.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* TAB 3: LỊCH SỬ CẬP NHẬT & TIẾN ĐỘ */}
                  {currentTab === "lich_su" && (
                    <div className="space-y-6">
                      <h4 className="font-display font-bold text-[14px] text-[#0d1b4e] uppercase flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[18px] text-[#0284c7]">timeline</span>
                        Tiến độ thẩm định hồ sơ theo thời gian:
                      </h4>

                      <div className="relative pl-6 sm:pl-8 before:absolute before:left-3 before:top-3 before:bottom-3 before:w-[3px] before:bg-[#cbd5e1] space-y-6">
                        {rec.lichSuXuLy.map((ev) => {
                          let dotBg = "bg-[#94a3b8]";
                          let cardBorder = "border-[#cbd5e1]";
                          let cardBg = "bg-[#f8fafc]";

                          if (ev.trangThai === "COMPLETED") {
                            dotBg = "bg-[#16a34a]";
                            cardBorder = "border-[#16a34a]";
                            cardBg = "bg-[#f0fdf4]";
                          } else if (ev.trangThai === "CURRENT") {
                            dotBg = "bg-[#f59e0b]";
                            cardBorder = "border-[#f59e0b]";
                            cardBg = "bg-[#fffbeb]";
                          }

                          return (
                            <div key={ev.step} className="relative group">
                              {/* Dot */}
                              <div
                                className={`absolute -left-6 sm:-left-8 top-1.5 w-5 h-5 rounded-full border-[3px] border-white shadow-md ${dotBg}`}
                              />

                              {/* Box nội dung */}
                              <div className={`p-5 rounded-xl border-[2px] ${cardBorder} ${cardBg} shadow-[2px_2px_0px_#111827] space-y-2`}>
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                                  <div className="flex items-center gap-2">
                                    <span className="px-2 py-0.5 bg-[#0d1b4e] text-white font-bold text-[10px] rounded">
                                      BƯỚC {ev.step}
                                    </span>
                                    <h5 className="font-display font-bold text-[15px] text-[#0d1b4e]">
                                      {ev.tieuDe}
                                    </h5>
                                  </div>
                                  <span className="text-[11.5px] font-bold text-[#64748b]">
                                    {ev.thoiGian}
                                  </span>
                                </div>

                                <div className="text-[12px] font-semibold text-[#0284c7]">
                                  Đơn vị xử lý: {ev.boPhanXuLy}
                                </div>

                                <p className="text-[13px] text-[#334155] leading-relaxed">
                                  {ev.noiDung}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Phần Chữ Ký Chuẩn Văn Bản (Chỉ xuất hiện khi In A4) */}
                <div className="hidden print:grid grid-cols-2 mt-8 text-center text-[12px] pt-4">
                  <div>
                    <p className="font-bold uppercase">THÍ SINH XÁC NHẬN</p>
                    <p className="italic text-[11px]">(Ký và ghi rõ họ tên)</p>
                    <div className="h-16" />
                    <p className="font-bold">{rec.hoTen}</p>
                  </div>
                  <div>
                    <p className="font-bold uppercase">TM. HỘI ĐỒNG TUYỂN SINH UTC</p>
                    <p className="font-bold">TRƯỞNG BAN THƯ KÝ</p>
                    <p className="italic text-[11px]">(Đã xác thực chữ ký số trên hệ thống)</p>
                    <div className="h-16 flex items-center justify-center">
                      <span className="text-[11px] font-mono border border-green-600 text-green-700 px-2 py-1 rounded font-bold">
                        [ĐÃ KÝ SỐ ĐIỆN TỬ]
                      </span>
                    </div>
                    <p className="font-bold">HỘI ĐỒNG TUYỂN SINH K66</p>
                  </div>
                </div>

                {/* Footer Thẻ Hồ Sơ: Hỗ Trợ & Hotline */}
                <div className="p-4 sm:p-5 bg-[#fffdf7] border-t-[2px] border-[#111827] flex flex-col sm:flex-row items-center justify-between gap-3 text-[12.5px] text-[#64748b] print:hidden">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px] text-[#f59e0b]">help</span>
                    <span>Thắc mắc về tiến độ? Liên hệ Ban Thư ký Tuyển sinh ĐH Giao thông Vận tải</span>
                  </div>

                  <div className="flex items-center gap-4 font-bold text-[#0d1b4e]">
                    <a
                      href="tel:02437663311"
                      className="flex items-center gap-1 hover:text-[#0284c7] transition-colors"
                    >
                      <span className="material-symbols-outlined text-[16px] text-[#ea580c]">call</span>
                      <span>(024) 3766 3311</span>
                    </a>
                    <span>•</span>
                    <a
                      href="mailto:tuyensinh@utc.edu.vn"
                      className="flex items-center gap-1 hover:text-[#0284c7] transition-colors"
                    >
                      <span className="material-symbols-outlined text-[16px] text-[#0284c7]">mail</span>
                      <span>tuyensinh@utc.edu.vn</span>
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 4. Trạng Thái Chưa Tìm Kiếm: Giới Thiệu Quy Trình & Hướng Dẫn */}
      {!hasSearched && (
        <div className="space-y-6">
          <div className="bg-[#fffdf7] p-8 border-[3px] border-[#111827] shadow-[6px_6px_0px_#111827] rounded-2xl text-center space-y-4">
            <div className="w-16 h-16 bg-[#0284c7]/10 text-[#0284c7] rounded-2xl border-[2px] border-[#111827] shadow-[3px_3px_0px_#111827] flex items-center justify-center mx-auto">
              <span className="material-symbols-outlined text-[36px]">manage_search</span>
            </div>

            <h3 className="font-display font-black text-[22px] text-[#0d1b4e] uppercase">
              Tra Cứu Nhanh Tiến Độ & Kết Quả Hồ Sơ K66
            </h3>

            <p className="text-[14px] text-[#4b5563] max-w-2xl mx-auto leading-relaxed">
              Nhập <strong>Số Căn cước công dân (12 chữ số)</strong> hoặc <strong>Mã hồ sơ xét tuyển</strong> vào ô tìm kiếm ở trên để xem trạng thái đối soát giấy tờ minh chứng, điểm quy đổi và kết quả công nhận trúng tuyển.
            </p>

            {/* Hướng Dẫn Thao Tác 3 Bước */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 max-w-4xl mx-auto text-left">
              <div className="p-4 bg-white border-[2px] border-[#111827] rounded-xl shadow-[3px_3px_0px_#111827] space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#0d1b4e] text-white text-[12px] font-black flex items-center justify-center font-display">
                    1
                  </span>
                  <span className="font-display font-bold text-[14px] text-[#0d1b4e]">
                    Nhập CCCD / Mã hồ sơ
                  </span>
                </div>
                <p className="text-[12px] text-[#64748b]">
                  Dùng số định danh cá nhân ghi trên thẻ căn cước gắn chip của thí sinh.
                </p>
              </div>

              <div className="p-4 bg-white border-[2px] border-[#111827] rounded-xl shadow-[3px_3px_0px_#111827] space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#0d1b4e] text-white text-[12px] font-black flex items-center justify-center font-display">
                    2
                  </span>
                  <span className="font-display font-bold text-[14px] text-[#0d1b4e]">
                    Kiểm tra Thẩm định
                  </span>
                </div>
                <p className="text-[12px] text-[#64748b]">
                  Xem trạng thái từng file minh chứng (học bạ, IELTS, TSA) đã đạt hay cần bổ sung.
                </p>
              </div>

              <div className="p-4 bg-white border-[2px] border-[#111827] rounded-xl shadow-[3px_3px_0px_#111827] space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#0d1b4e] text-white text-[12px] font-black flex items-center justify-center font-display">
                    3
                  </span>
                  <span className="font-display font-bold text-[14px] text-[#0d1b4e]">
                    Nhận Hướng dẫn Bộ
                  </span>
                </div>
                <p className="text-[12px] text-[#64748b]">
                  Đọc kỹ dặn dò về việc đăng ký nguyện vọng lên cổng Bộ GD&ĐT và thủ tục nhập học.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { DisclaimerBanner } from "@/components/ui/DisclaimerBanner";

interface CourseFromDbItem {
  ma_ctdt_hoc_phan: string;
  ma_chuong_trinh: string;
  ma_hoc_phan: string;
  nam_ap_dung: number;
  hoc_ky: number;
  loai: string;
  khoi_kien_thuc?: string | null;
  hoc_phan?: {
    ma_hoc_phan: string;
    ten_hoc_phan: string;
    so_tin_chi: number;
    so_tiet_ly_thuyet?: number | null;
    so_tiet_thuc_hanh?: number | null;
    mo_ta?: string | null;
  } | null;
}

interface ProgramItem {
  ma_chuong_trinh: string;
  ten_chuong_trinh: string;
  mo_ta_ngan?: string | null;
  de_cuong?: string | null;
  chuan_dau_ra?: string[] | null;
  luot_xem?: number;
  lich_su_diem_chuan?: any[];
  ctdt_to_hop?: any[];
  hoc_phan?: CourseFromDbItem[];
}

interface CombinationItem {
  ma_to_hop: string;
  ten_mon_1?: string;
  ten_mon_2?: string;
  ten_mon_3?: string;
}

interface ScoreHistoryItem {
  nam: number;
  chi_tieu: number;
  diem: number | null;
  ma_phuong_thuc: string;
  ten_phuong_thuc: string;
  ma_chuong_trinh: string;
  ten_chuong_trinh: string;
}

interface Props {
  major: {
    ma_nganh: string;
    ten_nganh: string;
    khoi_kien_thuc?: string | null;
    khoi_nganh?: {
      ma_khoi_nganh: string;
      ten_khoi_nganh: string;
    } | null;
  };
  programs: ProgramItem[];
  combinations: CombinationItem[];
  scoreHistory: ScoreHistoryItem[];
}

// Cấu trúc học phần trong khung chương trình đào tạo
interface CourseItem {
  stt: number;
  ma_hp: string;
  ten_hoc_phan: string;
  tin_chi: number;
  hoc_ky: number;
  bat_buoc: "Có" | "Không";
  khoi_kien_thuc: string;
}

// Dữ liệu học phần chuẩn khung đào tạo UTC cho các nhóm ngành (Hệ Kỹ sư: 9 kỳ, ~60 học phần, ~180 tín chỉ; Hệ Cử nhân: 8 kỳ, ~50 học phần, ~140-145 tín chỉ)
function getCurriculumCourses(majorName: string): CourseItem[] {
  const lower = majorName.toLowerCase();

  // 1. Nhóm Ngôn ngữ Anh (Khung 48 học phần, ~138 tín chỉ chuẩn cử nhân UTC)
  if (lower.includes("ngôn ngữ") || lower.includes("tiếng anh")) {
    return [
      // Kỳ 1
      { stt: 1, ma_hp: "KHMI1101", ten_hoc_phan: "Kinh tế vi mô 1", tin_chi: 3, hoc_ky: 1, bat_buoc: "Có", khoi_kien_thuc: "Học phần của trường" },
      { stt: 2, ma_hp: "TOCB1110", ten_hoc_phan: "Toán cho các nhà kinh tế", tin_chi: 3, hoc_ky: 1, bat_buoc: "Có", khoi_kien_thuc: "Học phần của trường" },
      { stt: 3, ma_hp: "NNA1101", ten_hoc_phan: "Ngữ âm - Âm vị học tiếng Anh", tin_chi: 3, hoc_ky: 1, bat_buoc: "Có", khoi_kien_thuc: "Cơ sở khối ngành" },
      { stt: 4, ma_hp: "NNA1102", ten_hoc_phan: "Tiếng Anh đại cương 1 (Nghe - Nói)", tin_chi: 3, hoc_ky: 1, bat_buoc: "Có", khoi_kien_thuc: "Cơ sở khối ngành" },
      { stt: 5, ma_hp: "NNA1103", ten_hoc_phan: "Tiếng Anh đại cương 1 (Đọc - Viết)", tin_chi: 3, hoc_ky: 1, bat_buoc: "Có", khoi_kien_thuc: "Cơ sở khối ngành" },
      { stt: 6, ma_hp: "GDTC1101", ten_hoc_phan: "Giáo dục thể chất 1", tin_chi: 1, hoc_ky: 1, bat_buoc: "Có", khoi_kien_thuc: "Học phần chung" },
      { stt: 7, ma_hp: "GDQP1101", ten_hoc_phan: "Giáo dục quốc phòng & An ninh 1", tin_chi: 2, hoc_ky: 1, bat_buoc: "Có", khoi_kien_thuc: "Học phần chung" },
      // Kỳ 2
      { stt: 8, ma_hp: "LLNL1105", ten_hoc_phan: "Triết học Mác - Lênin", tin_chi: 3, hoc_ky: 2, bat_buoc: "Có", khoi_kien_thuc: "Học phần chung" },
      { stt: 9, ma_hp: "LUCS1129", ten_hoc_phan: "Pháp luật đại cương", tin_chi: 3, hoc_ky: 2, bat_buoc: "Có", khoi_kien_thuc: "Học phần chung" },
      { stt: 10, ma_hp: "KHMA1101", ten_hoc_phan: "Kinh tế vĩ mô 1", tin_chi: 3, hoc_ky: 2, bat_buoc: "Có", khoi_kien_thuc: "Học phần của trường" },
      { stt: 11, ma_hp: "NNA1104", ten_hoc_phan: "Ngữ pháp tiếng Anh nâng cao", tin_chi: 3, hoc_ky: 2, bat_buoc: "Có", khoi_kien_thuc: "Cơ sở ngành" },
      { stt: 12, ma_hp: "NNA1105", ten_hoc_phan: "Tiếng Anh đại cương 2 (Nghe - Nói)", tin_chi: 3, hoc_ky: 2, bat_buoc: "Có", khoi_kien_thuc: "Cơ sở khối ngành" },
      { stt: 13, ma_hp: "NNA1106", ten_hoc_phan: "Tiếng Anh đại cương 2 (Đọc - Viết)", tin_chi: 3, hoc_ky: 2, bat_buoc: "Có", khoi_kien_thuc: "Cơ sở khối ngành" },
      { stt: 14, ma_hp: "GDQP1102", ten_hoc_phan: "Giáo dục quốc phòng & An ninh 2", tin_chi: 2, hoc_ky: 2, bat_buoc: "Có", khoi_kien_thuc: "Học phần chung" },
      // Kỳ 3
      { stt: 15, ma_hp: "LLNL1106", ten_hoc_phan: "Kinh tế chính trị Mác - Lênin", tin_chi: 2, hoc_ky: 3, bat_buoc: "Có", khoi_kien_thuc: "Học phần chung" },
      { stt: 16, ma_hp: "NNA1201", ten_hoc_phan: "Hình thái học & Cú pháp học tiếng Anh", tin_chi: 3, hoc_ky: 3, bat_buoc: "Có", khoi_kien_thuc: "Cơ sở ngành" },
      { stt: 17, ma_hp: "NNA1202", ten_hoc_phan: "Kỹ năng Thuyết trình & Giao tiếp học thuật", tin_chi: 3, hoc_ky: 3, bat_buoc: "Có", khoi_kien_thuc: "Cơ sở ngành" },
      { stt: 18, ma_hp: "NNA1203", ten_hoc_phan: "Đất nước học Anh - Mỹ", tin_chi: 3, hoc_ky: 3, bat_buoc: "Có", khoi_kien_thuc: "Cơ sở ngành" },
      { stt: 19, ma_hp: "NNA1204", ten_hoc_phan: "Tiếng Anh chuyên sâu 1 (Nghe - Nói)", tin_chi: 3, hoc_ky: 3, bat_buoc: "Có", khoi_kien_thuc: "Cơ sở ngành" },
      { stt: 20, ma_hp: "NNA1205", ten_hoc_phan: "Tiếng Anh chuyên sâu 1 (Đọc - Viết luận)", tin_chi: 3, hoc_ky: 3, bat_buoc: "Có", khoi_kien_thuc: "Cơ sở ngành" },
      // Kỳ 4
      { stt: 21, ma_hp: "LLNL1107", ten_hoc_phan: "Chủ nghĩa xã hội khoa học", tin_chi: 2, hoc_ky: 4, bat_buoc: "Có", khoi_kien_thuc: "Học phần chung" },
      { stt: 22, ma_hp: "TOKT1138", ten_hoc_phan: "Khoa học dữ liệu trong kinh tế và kinh doanh", tin_chi: 3, hoc_ky: 4, bat_buoc: "Có", khoi_kien_thuc: "Học phần của trường" },
      { stt: 23, ma_hp: "NNA1206", ten_hoc_phan: "Ngữ nghĩa học & Ngữ dụng học tiếng Anh", tin_chi: 3, hoc_ky: 4, bat_buoc: "Có", khoi_kien_thuc: "Cơ sở ngành" },
      { stt: 24, ma_hp: "NNA1207", ten_hoc_phan: "Giao tiếp liên văn hóa", tin_chi: 3, hoc_ky: 4, bat_buoc: "Có", khoi_kien_thuc: "Cơ sở ngành" },
      { stt: 25, ma_hp: "NNA1208", ten_hoc_phan: "Lý thuyết Dịch thuật cơ bản", tin_chi: 3, hoc_ky: 4, bat_buoc: "Có", khoi_kien_thuc: "Cơ sở ngành" },
      { stt: 26, ma_hp: "NNA1209", ten_hoc_phan: "Ngoại ngữ 2 - Phần 1 (Tiếng Trung/Nhật/Pháp)", tin_chi: 3, hoc_ky: 4, bat_buoc: "Có", khoi_kien_thuc: "Cơ sở ngành" },
      // Kỳ 5
      { stt: 27, ma_hp: "LLTT1101", ten_hoc_phan: "Tư tưởng Hồ Chí Minh", tin_chi: 2, hoc_ky: 5, bat_buoc: "Có", khoi_kien_thuc: "Học phần chung" },
      { stt: 28, ma_hp: "NNA1301", ten_hoc_phan: "Tiếng Anh Thương mại & Giao dịch quốc tế", tin_chi: 3, hoc_ky: 5, bat_buoc: "Có", khoi_kien_thuc: "Chuyên ngành" },
      { stt: 29, ma_hp: "NNA1302", ten_hoc_phan: "Kỹ năng Dịch Viết thương mại (Anh - Việt)", tin_chi: 3, hoc_ky: 5, bat_buoc: "Có", khoi_kien_thuc: "Chuyên ngành" },
      { stt: 30, ma_hp: "NNA1303", ten_hoc_phan: "Kỹ năng Dịch Nói - Phiên dịch cơ sở", tin_chi: 3, hoc_ky: 5, bat_buoc: "Có", khoi_kien_thuc: "Chuyên ngành" },
      { stt: 31, ma_hp: "NNA1304", ten_hoc_phan: "Văn học Anh - Mỹ chọn lọc", tin_chi: 3, hoc_ky: 5, bat_buoc: "Có", khoi_kien_thuc: "Chuyên ngành" },
      { stt: 32, ma_hp: "NNA1305", ten_hoc_phan: "Ngoại ngữ 2 - Phần 2", tin_chi: 3, hoc_ky: 5, bat_buoc: "Có", khoi_kien_thuc: "Cơ sở ngành" },
      // Kỳ 6
      { stt: 33, ma_hp: "LLDL1102", ten_hoc_phan: "Lịch sử Đảng Cộng sản Việt Nam", tin_chi: 2, hoc_ky: 6, bat_buoc: "Có", khoi_kien_thuc: "Học phần chung" },
      { stt: 34, ma_hp: "NNA1306", ten_hoc_phan: "Tiếng Anh Chuyên ngành GTVT & Logistics", tin_chi: 3, hoc_ky: 6, bat_buoc: "Có", khoi_kien_thuc: "Chuyên ngành UTC" },
      { stt: 35, ma_hp: "NNA1307", ten_hoc_phan: "Dịch thuật Văn bản Kinh tế & Pháp luật", tin_chi: 3, hoc_ky: 6, bat_buoc: "Có", khoi_kien_thuc: "Chuyên ngành" },
      { stt: 36, ma_hp: "NNA1308", ten_hoc_phan: "Phiên dịch Nâng cao & Cabin", tin_chi: 3, hoc_ky: 6, bat_buoc: "Có", khoi_kien_thuc: "Chuyên ngành" },
      { stt: 37, ma_hp: "NNA1309", ten_hoc_phan: "Phương pháp Nghiên cứu khoa học Ngôn ngữ", tin_chi: 3, hoc_ky: 6, bat_buoc: "Có", khoi_kien_thuc: "Chuyên ngành" },
      { stt: 38, ma_hp: "NNA1310", ten_hoc_phan: "Ngoại ngữ 2 - Phần 3", tin_chi: 3, hoc_ky: 6, bat_buoc: "Có", khoi_kien_thuc: "Cơ sở ngành" },
      // Kỳ 7
      { stt: 39, ma_hp: "NNA1311", ten_hoc_phan: "Tiếng Anh Tài chính - Ngân hàng", tin_chi: 3, hoc_ky: 7, bat_buoc: "Có", khoi_kien_thuc: "Chuyên ngành" },
      { stt: 40, ma_hp: "NNA1312", ten_hoc_phan: "Soạn thảo Hợp đồng & Thư tín Thương mại quốc tế", tin_chi: 3, hoc_ky: 7, bat_buoc: "Có", khoi_kien_thuc: "Chuyên ngành" },
      { stt: 41, ma_hp: "NNA1313", ten_hoc_phan: "Dịch thuật Đa phương tiện & Bản địa hóa phần mềm", tin_chi: 3, hoc_ky: 7, bat_buoc: "Có", khoi_kien_thuc: "Chuyên ngành" },
      { stt: 42, ma_hp: "NNA1314", ten_hoc_phan: "Thực tập Nhận thức nghề nghiệp tại Doanh nghiệp", tin_chi: 2, hoc_ky: 7, bat_buoc: "Có", khoi_kien_thuc: "Thực hành" },
      { stt: 43, ma_hp: "NNA1315", ten_hoc_phan: "Kỹ năng Đàm phán Thương mại quốc tế", tin_chi: 3, hoc_ky: 7, bat_buoc: "Có", khoi_kien_thuc: "Chuyên ngành" },
      { stt: 44, ma_hp: "NNA1316", ten_hoc_phan: "Quản trị Dự án Dịch thuật", tin_chi: 2, hoc_ky: 7, bat_buoc: "Có", khoi_kien_thuc: "Chuyên ngành" },
      // Kỳ 8
      { stt: 45, ma_hp: "NNA1401", ten_hoc_phan: "Đạo đức nghề nghiệp & Văn hóa doanh nghiệp", tin_chi: 2, hoc_ky: 8, bat_buoc: "Có", khoi_kien_thuc: "Bổ trợ" },
      { stt: 46, ma_hp: "NNA1402", ten_hoc_phan: "Thực tập Tốt nghiệp chuyên sâu", tin_chi: 4, hoc_ky: 8, bat_buoc: "Có", khoi_kien_thuc: "Tốt nghiệp" },
      { stt: 47, ma_hp: "NNA1403", ten_hoc_phan: "Khóa luận Tốt nghiệp Cử nhân Ngôn ngữ Anh", tin_chi: 6, hoc_ky: 8, bat_buoc: "Có", khoi_kien_thuc: "Tốt nghiệp" },
      { stt: 48, ma_hp: "NNA1404", ten_hoc_phan: "Chuyên đề Ngôn ngữ học Ứng dụng", tin_chi: 3, hoc_ky: 8, bat_buoc: "Không", khoi_kien_thuc: "Tự chọn" },
      { stt: 49, ma_hp: "NNA1405", ten_hoc_phan: "Biên tập & Xuất bản tài liệu Tiếng Anh", tin_chi: 3, hoc_ky: 8, bat_buoc: "Không", khoi_kien_thuc: "Tự chọn" },
      { stt: 50, ma_hp: "NNA1406", ten_hoc_phan: "Hội thảo Chuyên môn Tốt nghiệp", tin_chi: 2, hoc_ky: 8, bat_buoc: "Có", khoi_kien_thuc: "Tốt nghiệp" },
    ];
  }

  // 2. Nhóm CNTT / Kỹ thuật phần mềm / KHMT (Hệ Kỹ sư 9 kỳ, 58 học phần, 178 tín chỉ chuẩn Kỹ sư UTC)
  if (lower.includes("thông tin") || lower.includes("máy tính") || lower.includes("cntt")) {
    return [
      // Kỳ 1 (18 tín chỉ)
      { stt: 1, ma_hp: "LLNL1105", ten_hoc_phan: "Triết học Mác - Lênin", tin_chi: 3, hoc_ky: 1, bat_buoc: "Có", khoi_kien_thuc: "Học phần chung" },
      { stt: 2, ma_hp: "TOCB1101", ten_hoc_phan: "Giải tích 1", tin_chi: 3, hoc_ky: 1, bat_buoc: "Có", khoi_kien_thuc: "Đại cương" },
      { stt: 3, ma_hp: "TOCB1102", ten_hoc_phan: "Đại số tuyến tính", tin_chi: 3, hoc_ky: 1, bat_buoc: "Có", khoi_kien_thuc: "Đại cương" },
      { stt: 4, ma_hp: "VLCB1101", ten_hoc_phan: "Vật lý đại cương 1", tin_chi: 3, hoc_ky: 1, bat_buoc: "Có", khoi_kien_thuc: "Đại cương" },
      { stt: 5, ma_hp: "IT1101", ten_hoc_phan: "Nhập môn Lập trình C/C++", tin_chi: 3, hoc_ky: 1, bat_buoc: "Có", khoi_kien_thuc: "Cơ sở ngành" },
      { stt: 6, ma_hp: "GDTC1101", ten_hoc_phan: "Giáo dục thể chất 1", tin_chi: 1, hoc_ky: 1, bat_buoc: "Có", khoi_kien_thuc: "Học phần chung" },
      { stt: 7, ma_hp: "GDQP1101", ten_hoc_phan: "Giáo dục quốc phòng & An ninh 1: Đường lối quốc phòng", tin_chi: 2, hoc_ky: 1, bat_buoc: "Có", khoi_kien_thuc: "Học phần chung" },

      // Kỳ 2 (20 tín chỉ)
      { stt: 8, ma_hp: "LUCS1129", ten_hoc_phan: "Pháp luật đại cương", tin_chi: 3, hoc_ky: 2, bat_buoc: "Có", khoi_kien_thuc: "Học phần chung" },
      { stt: 9, ma_hp: "TOCB1103", ten_hoc_phan: "Giải tích 2", tin_chi: 3, hoc_ky: 2, bat_buoc: "Có", khoi_kien_thuc: "Đại cương" },
      { stt: 10, ma_hp: "VLCB1102", ten_hoc_phan: "Vật lý đại cương 2 & Thí nghiệm", tin_chi: 3, hoc_ky: 2, bat_buoc: "Có", khoi_kien_thuc: "Đại cương" },
      { stt: 11, ma_hp: "IT1102", ten_hoc_phan: "Kỹ thuật lập trình nâng cao", tin_chi: 3, hoc_ky: 2, bat_buoc: "Có", khoi_kien_thuc: "Cơ sở ngành" },
      { stt: 12, ma_hp: "IT1103", ten_hoc_phan: "Toán rời rạc & Lý thuyết đồ thị", tin_chi: 3, hoc_ky: 2, bat_buoc: "Có", khoi_kien_thuc: "Cơ sở ngành" },
      { stt: 13, ma_hp: "NNA1101", ten_hoc_phan: "Tiếng Anh chuyên ngành CNTT 1", tin_chi: 3, hoc_ky: 2, bat_buoc: "Có", khoi_kien_thuc: "Bổ trợ" },
      { stt: 14, ma_hp: "GDQP1102", ten_hoc_phan: "Giáo dục quốc phòng & An ninh 2: Công tác quốc phòng", tin_chi: 2, hoc_ky: 2, bat_buoc: "Có", khoi_kien_thuc: "Học phần chung" },

      // Kỳ 3 (21 tín chỉ)
      { stt: 15, ma_hp: "LLNL1106", ten_hoc_phan: "Kinh tế chính trị Mác - Lênin", tin_chi: 2, hoc_ky: 3, bat_buoc: "Có", khoi_kien_thuc: "Học phần chung" },
      { stt: 16, ma_hp: "TOCB1104", ten_hoc_phan: "Xác suất thống kê & Ứng dụng", tin_chi: 3, hoc_ky: 3, bat_buoc: "Có", khoi_kien_thuc: "Đại cương" },
      { stt: 17, ma_hp: "IT1201", ten_hoc_phan: "Cấu trúc dữ liệu & Giải thuật", tin_chi: 4, hoc_ky: 3, bat_buoc: "Có", khoi_kien_thuc: "Cơ sở ngành" },
      { stt: 18, ma_hp: "IT1202", ten_hoc_phan: "Lập trình Hướng đối tượng (Java / C#)", tin_chi: 4, hoc_ky: 3, bat_buoc: "Có", khoi_kien_thuc: "Cơ sở ngành" },
      { stt: 19, ma_hp: "IT1203", ten_hoc_phan: "Kiến trúc máy tính & Hợp ngữ", tin_chi: 3, hoc_ky: 3, bat_buoc: "Có", khoi_kien_thuc: "Cơ sở ngành" },
      { stt: 20, ma_hp: "GDTC1102", ten_hoc_phan: "Giáo dục thể chất 2", tin_chi: 2, hoc_ky: 3, bat_buoc: "Có", khoi_kien_thuc: "Học phần chung" },
      { stt: 21, ma_hp: "GDQP1103", ten_hoc_phan: "Giáo dục quốc phòng & An ninh 3: Quân sự chung", tin_chi: 2, hoc_ky: 3, bat_buoc: "Có", khoi_kien_thuc: "Học phần chung" },
      { stt: 22, ma_hp: "NNA1201", ten_hoc_phan: "Tiếng Anh chuyên ngành CNTT 2", tin_chi: 1, hoc_ky: 3, bat_buoc: "Có", khoi_kien_thuc: "Bổ trợ" },

      // Kỳ 4 (20 tín chỉ)
      { stt: 23, ma_hp: "LLNL1107", ten_hoc_phan: "Chủ nghĩa xã hội khoa học", tin_chi: 2, hoc_ky: 4, bat_buoc: "Có", khoi_kien_thuc: "Học phần chung" },
      { stt: 24, ma_hp: "IT1204", ten_hoc_phan: "Cơ sở dữ liệu quan hệ (RDBMS SQL)", tin_chi: 3, hoc_ky: 4, bat_buoc: "Có", khoi_kien_thuc: "Cơ sở ngành" },
      { stt: 25, ma_hp: "IT1205", ten_hoc_phan: "Hệ điều hành máy tính (OS Linux/Windows)", tin_chi: 3, hoc_ky: 4, bat_buoc: "Có", khoi_kien_thuc: "Cơ sở ngành" },
      { stt: 26, ma_hp: "IT1206", ten_hoc_phan: "Mạng máy tính & Truyền thông dữ liệu", tin_chi: 3, hoc_ky: 4, bat_buoc: "Có", khoi_kien_thuc: "Cơ sở ngành" },
      { stt: 27, ma_hp: "IT1207", ten_hoc_phan: "Lập trình Web Frontend (HTML5/CSS3/React)", tin_chi: 3, hoc_ky: 4, bat_buoc: "Có", khoi_kien_thuc: "Cơ sở ngành" },
      { stt: 28, ma_hp: "IT1208", ten_hoc_phan: "Kỹ thuật công nghệ phần mềm", tin_chi: 3, hoc_ky: 4, bat_buoc: "Có", khoi_kien_thuc: "Cơ sở ngành" },
      { stt: 29, ma_hp: "IT1209", ten_hoc_phan: "Đồ án Cơ sở dữ liệu & Ứng dụng phần mềm", tin_chi: 2, hoc_ky: 4, bat_buoc: "Có", khoi_kien_thuc: "Thực hành" },
      { stt: 30, ma_hp: "GDQP1104", ten_hoc_phan: "Giáo dục quốc phòng & An ninh 4: Kỹ thuật chiến đấu", tin_chi: 1, hoc_ky: 4, bat_buoc: "Có", khoi_kien_thuc: "Học phần chung" },

      // Kỳ 5 (21 tín chỉ)
      { stt: 31, ma_hp: "LLTT1101", ten_hoc_phan: "Tư tưởng Hồ Chí Minh", tin_chi: 2, hoc_ky: 5, bat_buoc: "Có", khoi_kien_thuc: "Học phần chung" },
      { stt: 32, ma_hp: "IT1301", ten_hoc_phan: "Lập trình Web nâng cao & Fullstack (Node.js/Next.js)", tin_chi: 4, hoc_ky: 5, bat_buoc: "Có", khoi_kien_thuc: "Chuyên ngành" },
      { stt: 33, ma_hp: "IT1302", ten_hoc_phan: "Lập trình ứng dụng Di động (Mobile App iOS/Android)", tin_chi: 3, hoc_ky: 5, bat_buoc: "Có", khoi_kien_thuc: "Chuyên ngành" },
      { stt: 34, ma_hp: "IT1303", ten_hoc_phan: "Trí tuệ nhân tạo (AI) cơ sở", tin_chi: 3, hoc_ky: 5, bat_buoc: "Có", khoi_kien_thuc: "Chuyên ngành" },
      { stt: 35, ma_hp: "IT1304", ten_hoc_phan: "An toàn thông tin & Mật mã học", tin_chi: 3, hoc_ky: 5, bat_buoc: "Có", khoi_kien_thuc: "Chuyên ngành" },
      { stt: 36, ma_hp: "IT1305", ten_hoc_phan: "Kiến trúc hệ thống & Thiết kế phần mềm (Design Patterns)", tin_chi: 3, hoc_ky: 5, bat_buoc: "Có", khoi_kien_thuc: "Chuyên ngành" },
      { stt: 37, ma_hp: "IT1306", ten_hoc_phan: "Đồ án Cơ sở ngành Công nghệ phần mềm", tin_chi: 3, hoc_ky: 5, bat_buoc: "Có", khoi_kien_thuc: "Thực hành" },

      // Kỳ 6 (20 tín chỉ)
      { stt: 38, ma_hp: "LLDL1102", ten_hoc_phan: "Lịch sử Đảng Cộng sản Việt Nam", tin_chi: 2, hoc_ky: 6, bat_buoc: "Có", khoi_kien_thuc: "Học phần chung" },
      { stt: 39, ma_hp: "IT1307", ten_hoc_phan: "Học máy (Machine Learning) & Xử lý dữ liệu lớn", tin_chi: 3, hoc_ky: 6, bat_buoc: "Có", khoi_kien_thuc: "Chuyên ngành" },
      { stt: 40, ma_hp: "IT1308", ten_hoc_phan: "Điện toán đám mây & Công nghệ DevOps (AWS, Docker, K8s)", tin_chi: 3, hoc_ky: 6, bat_buoc: "Có", khoi_kien_thuc: "Chuyên ngành" },
      { stt: 41, ma_hp: "IT1309", ten_hoc_phan: "Hệ quản trị CSDL phân tán & NoSQL (MongoDB, Redis)", tin_chi: 3, hoc_ky: 6, bat_buoc: "Có", khoi_kien_thuc: "Chuyên ngành" },
      { stt: 42, ma_hp: "IT1310", ten_hoc_phan: "Hệ thống thông tin giao thông thông minh (ITS UTC)", tin_chi: 3, hoc_ky: 6, bat_buoc: "Có", khoi_kien_thuc: "Chuyên ngành UTC" },
      { stt: 43, ma_hp: "IT1311", ten_hoc_phan: "Kiểm thử phần mềm & Đảm bảo chất lượng (QA/QC)", tin_chi: 3, hoc_ky: 6, bat_buoc: "Có", khoi_kien_thuc: "Chuyên ngành" },
      { stt: 44, ma_hp: "IT1312", ten_hoc_phan: "Thực tập Doanh nghiệp cơ sở (Doanh nghiệp CNTT)", tin_chi: 3, hoc_ky: 6, bat_buoc: "Có", khoi_kien_thuc: "Thực hành" },

      // Kỳ 7 (20 tín chỉ)
      { stt: 45, ma_hp: "IT1313", ten_hoc_phan: "Internet of Things (IoT) & Hệ thống nhúng", tin_chi: 3, hoc_ky: 7, bat_buoc: "Có", khoi_kien_thuc: "Chuyên ngành" },
      { stt: 46, ma_hp: "IT1314", ten_hoc_phan: "Thị giác máy tính & Xử lý ảnh", tin_chi: 3, hoc_ky: 7, bat_buoc: "Có", khoi_kien_thuc: "Chuyên ngành" },
      { stt: 47, ma_hp: "IT1315", ten_hoc_phan: "Quản trị dự án CNTT theo mô hình Agile/Scrum", tin_chi: 3, hoc_ky: 7, bat_buoc: "Có", khoi_kien_thuc: "Chuyên ngành" },
      { stt: 48, ma_hp: "IT1316", ten_hoc_phan: "Xử lý ngôn ngữ tự nhiên (NLP) & GenAI", tin_chi: 3, hoc_ky: 7, bat_buoc: "Có", khoi_kien_thuc: "Chuyên ngành" },
      { stt: 49, ma_hp: "IT1317", ten_hoc_phan: "An ninh mạng & Điều tra số (Digital Forensics)", tin_chi: 3, hoc_ky: 7, bat_buoc: "Có", khoi_kien_thuc: "Chuyên ngành" },
      { stt: 50, ma_hp: "IT1318", ten_hoc_phan: "Đồ án Chuyên ngành Công nghệ phần mềm", tin_chi: 3, hoc_ky: 7, bat_buoc: "Có", khoi_kien_thuc: "Thực hành" },
      { stt: 51, ma_hp: "IT1319", ten_hoc_phan: "Thực tập Kỹ sư tại Doanh nghiệp CNTT đối tác UTC", tin_chi: 2, hoc_ky: 7, bat_buoc: "Có", khoi_kien_thuc: "Thực hành" },

      // Kỳ 8 (20 tín chỉ)
      { stt: 52, ma_hp: "IT1401", ten_hoc_phan: "Kiến trúc Microservices & Hệ thống chịu tải lớn", tin_chi: 3, hoc_ky: 8, bat_buoc: "Có", khoi_kien_thuc: "Chuyên ngành" },
      { stt: 53, ma_hp: "IT1402", ten_hoc_phan: "Công nghệ Blockchain & Hợp đồng thông minh", tin_chi: 3, hoc_ky: 8, bat_buoc: "Có", khoi_kien_thuc: "Chuyên ngành" },
      { stt: 54, ma_hp: "IT1403", ten_hoc_phan: "Phân tích nghiệp vụ phần mềm (Business Analysis)", tin_chi: 3, hoc_ky: 8, bat_buoc: "Có", khoi_kien_thuc: "Chuyên ngành" },
      { stt: 55, ma_hp: "IT1404", ten_hoc_phan: "Khởi nghiệp công nghệ & Sở hữu trí tuệ", tin_chi: 2, hoc_ky: 8, bat_buoc: "Có", khoi_kien_thuc: "Bổ trợ" },
      { stt: 56, ma_hp: "IT1405", ten_hoc_phan: "Thực tập Tốt nghiệp Kỹ sư CNTT (8 tuần)", tin_chi: 4, hoc_ky: 8, bat_buoc: "Có", khoi_kien_thuc: "Tốt nghiệp" },
      { stt: 57, ma_hp: "IT1406", ten_hoc_phan: "Chuyên đề Ứng dụng AI trong Giao thông vận tải", tin_chi: 3, hoc_ky: 8, bat_buoc: "Có", khoi_kien_thuc: "Chuyên ngành UTC" },
      { stt: 58, ma_hp: "IT1407", ten_hoc_phan: "Tối ưu hóa hiệu năng & Giám sát hệ thống phân tán", tin_chi: 2, hoc_ky: 8, bat_buoc: "Không", khoi_kien_thuc: "Tự chọn" },

      // Kỳ 9 (18 tín chỉ) - Học kỳ tốt nghiệp Kỹ sư Chuyên sâu bậc 7
      { stt: 59, ma_hp: "IT1408", ten_hoc_phan: "Chuyên đề Công nghệ mới & Điện toán lượng tử", tin_chi: 2, hoc_ky: 9, bat_buoc: "Có", khoi_kien_thuc: "Chuyên ngành" },
      { stt: 60, ma_hp: "IT1409", ten_hoc_phan: "Đồ án Tốt nghiệp Kỹ sư Công nghệ thông tin", tin_chi: 12, hoc_ky: 9, bat_buoc: "Có", khoi_kien_thuc: "Tốt nghiệp" },
      { stt: 61, ma_hp: "IT1410", ten_hoc_phan: "Bảo vệ Đồ án trước Hội đồng chấm Kỹ sư Quốc gia", tin_chi: 2, hoc_ky: 9, bat_buoc: "Có", khoi_kien_thuc: "Tốt nghiệp" },
      { stt: 62, ma_hp: "IT1411", ten_hoc_phan: "Hội thảo Khoa học & Định hướng nghề nghiệp Kỹ sư", tin_chi: 2, hoc_ky: 9, bat_buoc: "Có", khoi_kien_thuc: "Tốt nghiệp" },
    ];
  }

  // 3. Nhóm Kinh tế / QTKD / Tài chính / Logistics (Khung 50 học phần, ~146 tín chỉ chuẩn Cử nhân UTC)
  if (lower.includes("kinh tế") || lower.includes("quản trị") || lower.includes("logistics") || lower.includes("tài chính") || lower.includes("kế toán")) {
    return [
      // Kỳ 1 (18 tín chỉ)
      { stt: 1, ma_hp: "LLNL1105", ten_hoc_phan: "Triết học Mác - Lênin", tin_chi: 3, hoc_ky: 1, bat_buoc: "Có", khoi_kien_thuc: "Học phần chung" },
      { stt: 2, ma_hp: "LUCS1129", ten_hoc_phan: "Pháp luật đại cương", tin_chi: 3, hoc_ky: 1, bat_buoc: "Có", khoi_kien_thuc: "Học phần chung" },
      { stt: 3, ma_hp: "KHMI1101", ten_hoc_phan: "Kinh tế vi mô 1", tin_chi: 3, hoc_ky: 1, bat_buoc: "Có", khoi_kien_thuc: "Cơ sở khối ngành" },
      { stt: 4, ma_hp: "TOCB1110", ten_hoc_phan: "Toán cho các nhà kinh tế", tin_chi: 3, hoc_ky: 1, bat_buoc: "Có", khoi_kien_thuc: "Cơ sở khối ngành" },
      { stt: 5, ma_hp: "QTKD1101", ten_hoc_phan: "Nhập môn Quản trị kinh doanh & Logistics", tin_chi: 3, hoc_ky: 1, bat_buoc: "Có", khoi_kien_thuc: "Cơ sở ngành" },
      { stt: 6, ma_hp: "GDTC1101", ten_hoc_phan: "Giáo dục thể chất 1", tin_chi: 1, hoc_ky: 1, bat_buoc: "Có", khoi_kien_thuc: "Học phần chung" },
      { stt: 7, ma_hp: "GDQP1101", ten_hoc_phan: "Giáo dục quốc phòng & An ninh 1", tin_chi: 2, hoc_ky: 1, bat_buoc: "Có", khoi_kien_thuc: "Học phần chung" },

      // Kỳ 2 (20 tín chỉ)
      { stt: 8, ma_hp: "LLNL1106", ten_hoc_phan: "Kinh tế chính trị Mác - Lênin", tin_chi: 2, hoc_ky: 2, bat_buoc: "Có", khoi_kien_thuc: "Học phần chung" },
      { stt: 9, ma_hp: "KHMA1101", ten_hoc_phan: "Kinh tế vĩ mô 1", tin_chi: 3, hoc_ky: 2, bat_buoc: "Có", khoi_kien_thuc: "Cơ sở khối ngành" },
      { stt: 10, ma_hp: "TOCB1111", ten_hoc_phan: "Lý thuyết Xác suất & Thống kê kinh tế", tin_chi: 3, hoc_ky: 2, bat_buoc: "Có", khoi_kien_thuc: "Cơ sở khối ngành" },
      { stt: 11, ma_hp: "KTTC1101", ten_hoc_phan: "Nguyên lý Kế toán", tin_chi: 3, hoc_ky: 2, bat_buoc: "Có", khoi_kien_thuc: "Cơ sở ngành" },
      { stt: 12, ma_hp: "NNA1101", ten_hoc_phan: "Tiếng Anh chuyên ngành Kinh tế 1", tin_chi: 3, hoc_ky: 2, bat_buoc: "Có", khoi_kien_thuc: "Bổ trợ" },
      { stt: 13, ma_hp: "LOG1101", ten_hoc_phan: "Tổng quan về Giao thông vận tải & Logistics", tin_chi: 3, hoc_ky: 2, bat_buoc: "Có", khoi_kien_thuc: "Cơ sở ngành" },
      { stt: 14, ma_hp: "GDQP1102", ten_hoc_phan: "Giáo dục quốc phòng & An ninh 2", tin_chi: 3, hoc_ky: 2, bat_buoc: "Có", khoi_kien_thuc: "Học phần chung" },

      // Kỳ 3 (20 tín chỉ)
      { stt: 15, ma_hp: "LLNL1107", ten_hoc_phan: "Chủ nghĩa xã hội khoa học", tin_chi: 2, hoc_ky: 3, bat_buoc: "Có", khoi_kien_thuc: "Học phần chung" },
      { stt: 16, ma_hp: "KHMI1202", ten_hoc_phan: "Kinh tế vi mô 2", tin_chi: 3, hoc_ky: 3, bat_buoc: "Có", khoi_kien_thuc: "Cơ sở ngành" },
      { stt: 17, ma_hp: "KHMA1202", ten_hoc_phan: "Kinh tế vĩ mô 2", tin_chi: 3, hoc_ky: 3, bat_buoc: "Có", khoi_kien_thuc: "Cơ sở ngành" },
      { stt: 18, ma_hp: "TCTC1201", ten_hoc_phan: "Tài chính - Tiền tệ & Ngân hàng", tin_chi: 3, hoc_ky: 3, bat_buoc: "Có", khoi_kien_thuc: "Cơ sở ngành" },
      { stt: 19, ma_hp: "MKT1201", ten_hoc_phan: "Nguyên lý Marketing căn bản", tin_chi: 3, hoc_ky: 3, bat_buoc: "Có", khoi_kien_thuc: "Cơ sở ngành" },
      { stt: 20, ma_hp: "LOG1201", ten_hoc_phan: "Quản trị Vận tải đa phương thức", tin_chi: 3, hoc_ky: 3, bat_buoc: "Có", khoi_kien_thuc: "Cơ sở ngành" },
      { stt: 21, ma_hp: "GDTC1102", ten_hoc_phan: "Giáo dục thể chất 2", tin_chi: 3, hoc_ky: 3, bat_buoc: "Có", khoi_kien_thuc: "Học phần chung" },

      // Kỳ 4 (20 tín chỉ)
      { stt: 22, ma_hp: "LLTT1101", ten_hoc_phan: "Tư tưởng Hồ Chí Minh", tin_chi: 2, hoc_ky: 4, bat_buoc: "Có", khoi_kien_thuc: "Học phần chung" },
      { stt: 23, ma_hp: "TOKT1138", ten_hoc_phan: "Khoa học dữ liệu trong kinh tế & kinh doanh", tin_chi: 3, hoc_ky: 4, bat_buoc: "Có", khoi_kien_thuc: "Học phần của trường" },
      { stt: 24, ma_hp: "TCTC1202", ten_hoc_phan: "Tài chính doanh nghiệp", tin_chi: 3, hoc_ky: 4, bat_buoc: "Có", khoi_kien_thuc: "Cơ sở ngành" },
      { stt: 25, ma_hp: "QTKD1202", ten_hoc_phan: "Quản trị Nguồn nhân lực", tin_chi: 3, hoc_ky: 4, bat_buoc: "Có", khoi_kien_thuc: "Cơ sở ngành" },
      { stt: 26, ma_hp: "LOG1202", ten_hoc_phan: "Quản trị Kho bãi & Trung tâm phân phối", tin_chi: 3, hoc_ky: 4, bat_buoc: "Có", khoi_kien_thuc: "Chuyên ngành" },
      { stt: 27, ma_hp: "NNA1202", ten_hoc_phan: "Tiếng Anh chuyên ngành Kinh tế 2", tin_chi: 3, hoc_ky: 4, bat_buoc: "Có", khoi_kien_thuc: "Bổ trợ" },
      { stt: 28, ma_hp: "GDQP1103", ten_hoc_phan: "Giáo dục quốc phòng & An ninh 3", tin_chi: 3, hoc_ky: 4, bat_buoc: "Có", khoi_kien_thuc: "Học phần chung" },

      // Kỳ 5 (19 tín chỉ)
      { stt: 29, ma_hp: "LLDL1102", ten_hoc_phan: "Lịch sử Đảng Cộng sản Việt Nam", tin_chi: 2, hoc_ky: 5, bat_buoc: "Có", khoi_kien_thuc: "Học phần chung" },
      { stt: 30, ma_hp: "LOG1301", ten_hoc_phan: "Quản trị Chuỗi cung ứng toàn cầu (SCM)", tin_chi: 3, hoc_ky: 5, bat_buoc: "Có", khoi_kien_thuc: "Chuyên ngành" },
      { stt: 31, ma_hp: "LOG1302", ten_hoc_phan: "Giao nhận & Bảo hiểm vận tải quốc tế", tin_chi: 3, hoc_ky: 5, bat_buoc: "Có", khoi_kien_thuc: "Chuyên ngành" },
      { stt: 32, ma_hp: "QTKD1301", ten_hoc_phan: "Quản trị Chiến lược & Lợi thế cạnh tranh", tin_chi: 3, hoc_ky: 5, bat_buoc: "Có", khoi_kien_thuc: "Chuyên ngành" },
      { stt: 33, ma_hp: "KTTC1301", ten_hoc_phan: "Kinh tế lượng ứng dụng với SPSS / R", tin_chi: 3, hoc_ky: 5, bat_buoc: "Có", khoi_kien_thuc: "Chuyên ngành" },
      { stt: 34, ma_hp: "LOG1303", ten_hoc_phan: "Thương mại điện tử & Logistics chặng cuối", tin_chi: 3, hoc_ky: 5, bat_buoc: "Có", khoi_kien_thuc: "Chuyên ngành" },
      { stt: 35, ma_hp: "LOG1304", ten_hoc_phan: "Đồ án Môn học Thiết kế Chuỗi cung ứng", tin_chi: 2, hoc_ky: 5, bat_buoc: "Có", khoi_kien_thuc: "Thực hành" },

      // Kỳ 6 (18 tín chỉ)
      { stt: 36, ma_hp: "KTTC1302", ten_hoc_phan: "Thẩm định Dự án đầu tư cơ sở hạ tầng GTVT", tin_chi: 3, hoc_ky: 6, bat_buoc: "Có", khoi_kien_thuc: "Chuyên ngành UTC" },
      { stt: 37, ma_hp: "LOG1305", ten_hoc_phan: "Hệ thống thông tin Logistics (WMS / TMS / ERP)", tin_chi: 3, hoc_ky: 6, bat_buoc: "Có", khoi_kien_thuc: "Chuyên ngành" },
      { stt: 38, ma_hp: "LOG1306", ten_hoc_phan: "Nghiệp vụ Thủ tục Hải quan & Ngoại thương", tin_chi: 3, hoc_ky: 6, bat_buoc: "Có", khoi_kien_thuc: "Chuyên ngành" },
      { stt: 39, ma_hp: "QTKD1302", ten_hoc_phan: "Quản trị Chất lượng & Chuẩn Lean Six Sigma", tin_chi: 3, hoc_ky: 6, bat_buoc: "Có", khoi_kien_thuc: "Chuyên ngành" },
      { stt: 40, ma_hp: "MKT1302", ten_hoc_phan: "Hành vi Khách hàng & Digital Marketing", tin_chi: 3, hoc_ky: 6, bat_buoc: "Có", khoi_kien_thuc: "Chuyên ngành" },
      { stt: 41, ma_hp: "LOG1307", ten_hoc_phan: "Thực tập Doanh nghiệp tại Cảng biển/Kho vận", tin_chi: 3, hoc_ky: 6, bat_buoc: "Có", khoi_kien_thuc: "Thực hành" },

      // Kỳ 7 (18 tín chỉ)
      { stt: 42, ma_hp: "KTTC1304", ten_hoc_phan: "Quản trị Rủi ro Tài chính & Chuỗi cung ứng", tin_chi: 3, hoc_ky: 7, bat_buoc: "Có", khoi_kien_thuc: "Chuyên ngành" },
      { stt: 43, ma_hp: "LOG1308", ten_hoc_phan: "Khai thác Cảng biển & Cảng hàng không", tin_chi: 3, hoc_ky: 7, bat_buoc: "Có", khoi_kien_thuc: "Chuyên ngành" },
      { stt: 44, ma_hp: "QTKD1303", ten_hoc_phan: "Khởi nghiệp & Quản trị Doanh nghiệp đổi mới", tin_chi: 3, hoc_ky: 7, bat_buoc: "Có", khoi_kien_thuc: "Chuyên ngành" },
      { stt: 45, ma_hp: "LOG1309", ten_hoc_phan: "Logistics xanh & Phát triển bền vững", tin_chi: 3, hoc_ky: 7, bat_buoc: "Có", khoi_kien_thuc: "Chuyên ngành" },
      { stt: 46, ma_hp: "LOG1310", ten_hoc_phan: "Thanh toán quốc tế & Tín dụng ngoại thương", tin_chi: 3, hoc_ky: 7, bat_buoc: "Có", khoi_kien_thuc: "Chuyên ngành" },
      { stt: 47, ma_hp: "LOG1311", ten_hoc_phan: "Chuyên đề Logistics hàng không & đa phương thức", tin_chi: 3, hoc_ky: 7, bat_buoc: "Không", khoi_kien_thuc: "Tự chọn" },

      // Kỳ 8 (15 tín chỉ)
      { stt: 48, ma_hp: "QTKD1401", ten_hoc_phan: "Đạo đức kinh doanh & Trách nhiệm xã hội", tin_chi: 2, hoc_ky: 8, bat_buoc: "Có", khoi_kien_thuc: "Bổ trợ" },
      { stt: 49, ma_hp: "KTTN1401", ten_hoc_phan: "Thực tập Tốt nghiệp cuối khóa (Doanh nghiệp)", tin_chi: 4, hoc_ky: 8, bat_buoc: "Có", khoi_kien_thuc: "Tốt nghiệp" },
      { stt: 50, ma_hp: "KTTN1402", ten_hoc_phan: "Khóa luận Tốt nghiệp Cử nhân Kinh tế", tin_chi: 7, hoc_ky: 8, bat_buoc: "Có", khoi_kien_thuc: "Tốt nghiệp" },
      { stt: 51, ma_hp: "KTTN1403", ten_hoc_phan: "Hội thảo Tốt nghiệp & Định hướng nghề nghiệp", tin_chi: 2, hoc_ky: 8, bat_buoc: "Có", khoi_kien_thuc: "Tốt nghiệp" },
    ];
  }

  // 4. Nhóm Kỹ thuật Cầu đường / Xây dựng / Giao thông / Cơ khí / Ô tô (Hệ Kỹ sư 9 kỳ, 63 học phần, 180 tín chỉ chuẩn kỹ sư UTC bậc 7)
  return [
    // Kỳ 1 (18 tín chỉ)
    { stt: 1, ma_hp: "LLNL1105", ten_hoc_phan: "Triết học Mác - Lênin", tin_chi: 3, hoc_ky: 1, bat_buoc: "Có", khoi_kien_thuc: "Học phần chung" },
    { stt: 2, ma_hp: "TOCB1101", ten_hoc_phan: "Giải tích 1", tin_chi: 3, hoc_ky: 1, bat_buoc: "Có", khoi_kien_thuc: "Đại cương" },
    { stt: 3, ma_hp: "TOCB1102", ten_hoc_phan: "Đại số tuyến tính", tin_chi: 3, hoc_ky: 1, bat_buoc: "Có", khoi_kien_thuc: "Đại cương" },
    { stt: 4, ma_hp: "VLCB1101", ten_hoc_phan: "Vật lý đại cương 1", tin_chi: 3, hoc_ky: 1, bat_buoc: "Có", khoi_kien_thuc: "Đại cương" },
    { stt: 5, ma_hp: "KTXD1101", ten_hoc_phan: "Hình họa - Vẽ kỹ thuật & CAD cơ bản", tin_chi: 3, hoc_ky: 1, bat_buoc: "Có", khoi_kien_thuc: "Cơ sở khối ngành" },
    { stt: 6, ma_hp: "GDTC1101", ten_hoc_phan: "Giáo dục thể chất 1", tin_chi: 1, hoc_ky: 1, bat_buoc: "Có", khoi_kien_thuc: "Học phần chung" },
    { stt: 7, ma_hp: "GDQP1101", ten_hoc_phan: "Giáo dục quốc phòng & An ninh 1: Đường lối quốc phòng", tin_chi: 2, hoc_ky: 1, bat_buoc: "Có", khoi_kien_thuc: "Học phần chung" },

    // Kỳ 2 (20 tín chỉ)
    { stt: 8, ma_hp: "LUCS1129", ten_hoc_phan: "Pháp luật đại cương", tin_chi: 3, hoc_ky: 2, bat_buoc: "Có", khoi_kien_thuc: "Học phần chung" },
    { stt: 9, ma_hp: "TOCB1103", ten_hoc_phan: "Giải tích 2", tin_chi: 3, hoc_ky: 2, bat_buoc: "Có", khoi_kien_thuc: "Đại cương" },
    { stt: 10, ma_hp: "VLCB1102", ten_hoc_phan: "Vật lý đại cương 2 & Thí nghiệm", tin_chi: 3, hoc_ky: 2, bat_buoc: "Có", khoi_kien_thuc: "Đại cương" },
    { stt: 11, ma_hp: "KTXD1102", ten_hoc_phan: "Cơ học lý thuyết 1 (Tĩnh học & Động học)", tin_chi: 3, hoc_ky: 2, bat_buoc: "Có", khoi_kien_thuc: "Cơ sở ngành" },
    { stt: 12, ma_hp: "KTXD1103", ten_hoc_phan: "Hóa học đại cương & Vật liệu xây dựng", tin_chi: 3, hoc_ky: 2, bat_buoc: "Có", khoi_kien_thuc: "Cơ sở ngành" },
    { stt: 13, ma_hp: "NNA1101", ten_hoc_phan: "Tiếng Anh kỹ thuật 1", tin_chi: 3, hoc_ky: 2, bat_buoc: "Có", khoi_kien_thuc: "Bổ trợ" },
    { stt: 14, ma_hp: "GDQP1102", ten_hoc_phan: "Giáo dục quốc phòng & An ninh 2: Công tác quốc phòng", tin_chi: 2, hoc_ky: 2, bat_buoc: "Có", khoi_kien_thuc: "Học phần chung" },

    // Kỳ 3 (21 tín chỉ)
    { stt: 15, ma_hp: "LLNL1106", ten_hoc_phan: "Kinh tế chính trị Mác - Lênin", tin_chi: 2, hoc_ky: 3, bat_buoc: "Có", khoi_kien_thuc: "Học phần chung" },
    { stt: 16, ma_hp: "TOCB1104", ten_hoc_phan: "Xác suất thống kê & Phương pháp tính (Matlab)", tin_chi: 3, hoc_ky: 3, bat_buoc: "Có", khoi_kien_thuc: "Đại cương" },
    { stt: 17, ma_hp: "KTXD1201", ten_hoc_phan: "Sức bền vật liệu 1", tin_chi: 3, hoc_ky: 3, bat_buoc: "Có", khoi_kien_thuc: "Cơ sở ngành" },
    { stt: 18, ma_hp: "KTXD1202", ten_hoc_phan: "Cơ học lý thuyết 2 (Động lực học hệ chất điểm)", tin_chi: 3, hoc_ky: 3, bat_buoc: "Có", khoi_kien_thuc: "Cơ sở ngành" },
    { stt: 19, ma_hp: "KTXD1203", ten_hoc_phan: "Trắc địa công trình", tin_chi: 3, hoc_ky: 3, bat_buoc: "Có", khoi_kien_thuc: "Cơ sở ngành" },
    { stt: 20, ma_hp: "KTXD1204", ten_hoc_phan: "Thực tập Trắc địa ngoài hiện trường", tin_chi: 2, hoc_ky: 3, bat_buoc: "Có", khoi_kien_thuc: "Thực hành" },
    { stt: 21, ma_hp: "IT1105", ten_hoc_phan: "Tin học đại cương & Lập trình kỹ thuật", tin_chi: 3, hoc_ky: 3, bat_buoc: "Có", khoi_kien_thuc: "Cơ sở ngành" },
    { stt: 22, ma_hp: "GDTC1102", ten_hoc_phan: "Giáo dục thể chất 2", tin_chi: 2, hoc_ky: 3, bat_buoc: "Có", khoi_kien_thuc: "Học phần chung" },

    // Kỳ 4 (20 tín chỉ)
    { stt: 23, ma_hp: "LLNL1107", ten_hoc_phan: "Chủ nghĩa xã hội khoa học", tin_chi: 2, hoc_ky: 4, bat_buoc: "Có", khoi_kien_thuc: "Học phần chung" },
    { stt: 24, ma_hp: "KTXD1205", ten_hoc_phan: "Sức bền vật liệu 2 & Thí nghiệm sức bền", tin_chi: 3, hoc_ky: 4, bat_buoc: "Có", khoi_kien_thuc: "Cơ sở ngành" },
    { stt: 25, ma_hp: "KTXD1206", ten_hoc_phan: "Cơ học kết cấu 1 (Hệ tĩnh định)", tin_chi: 3, hoc_ky: 4, bat_buoc: "Có", khoi_kien_thuc: "Cơ sở ngành" },
    { stt: 26, ma_hp: "KTXD1207", ten_hoc_phan: "Thủy lực & Khí động lực học công trình", tin_chi: 3, hoc_ky: 4, bat_buoc: "Có", khoi_kien_thuc: "Cơ sở ngành" },
    { stt: 27, ma_hp: "KTXD1208", ten_hoc_phan: "Cơ học đất & Địa kỹ thuật", tin_chi: 3, hoc_ky: 4, bat_buoc: "Có", khoi_kien_thuc: "Cơ sở ngành" },
    { stt: 28, ma_hp: "KTXD1209", ten_hoc_phan: "Kết cấu Bê tông cốt thép 1", tin_chi: 3, hoc_ky: 4, bat_buoc: "Có", khoi_kien_thuc: "Cơ sở ngành" },
    { stt: 29, ma_hp: "NNA1201", ten_hoc_phan: "Tiếng Anh kỹ thuật chuyên ngành 1", tin_chi: 2, hoc_ky: 4, bat_buoc: "Có", khoi_kien_thuc: "Bổ trợ" },
    { stt: 30, ma_hp: "GDQP1103", ten_hoc_phan: "Giáo dục quốc phòng & An ninh 3: Quân sự chung", tin_chi: 1, hoc_ky: 4, bat_buoc: "Có", khoi_kien_thuc: "Học phần chung" },

    // Kỳ 5 (21 tín chỉ)
    { stt: 31, ma_hp: "LLTT1101", ten_hoc_phan: "Tư tưởng Hồ Chí Minh", tin_chi: 2, hoc_ky: 5, bat_buoc: "Có", khoi_kien_thuc: "Học phần chung" },
    { stt: 32, ma_hp: "KTXD1301", ten_hoc_phan: "Cơ học kết cấu 2 (Hệ siêu tĩnh & Động lực học)", tin_chi: 3, hoc_ky: 5, bat_buoc: "Có", khoi_kien_thuc: "Cơ sở ngành" },
    { stt: 33, ma_hp: "KTXD1302", ten_hoc_phan: "Kết cấu Bê tông cốt thép 2 (Cấu kiện dự ứng lực)", tin_chi: 3, hoc_ky: 5, bat_buoc: "Có", khoi_kien_thuc: "Chuyên ngành" },
    { stt: 34, ma_hp: "KTXD1303", ten_hoc_phan: "Kết cấu Thép cơ bản", tin_chi: 3, hoc_ky: 5, bat_buoc: "Có", khoi_kien_thuc: "Chuyên ngành" },
    { stt: 35, ma_hp: "KTXD1304", ten_hoc_phan: "Thiết kế Tuyến & Nền mặt đường ô tô", tin_chi: 3, hoc_ky: 5, bat_buoc: "Có", khoi_kien_thuc: "Chuyên ngành" },
    { stt: 36, ma_hp: "KTXD1305", ten_hoc_phan: "Nền móng công trình giao thông", tin_chi: 3, hoc_ky: 5, bat_buoc: "Có", khoi_kien_thuc: "Chuyên ngành" },
    { stt: 37, ma_hp: "KTXD1306", ten_hoc_phan: "Đồ án Kết cấu Bê tông cốt thép", tin_chi: 2, hoc_ky: 5, bat_buoc: "Có", khoi_kien_thuc: "Thực hành" },
    { stt: 38, ma_hp: "KTXD1307", ten_hoc_phan: "Thực tập Kỹ thuật công nhân tại xưởng", tin_chi: 2, hoc_ky: 5, bat_buoc: "Có", khoi_kien_thuc: "Thực hành" },

    // Kỳ 6 (20 tín chỉ)
    { stt: 39, ma_hp: "LLDL1102", ten_hoc_phan: "Lịch sử Đảng Cộng sản Việt Nam", tin_chi: 2, hoc_ky: 6, bat_buoc: "Có", khoi_kien_thuc: "Học phần chung" },
    { stt: 40, ma_hp: "KTXD1308", ten_hoc_phan: "Thiết kế Cầu Bê tông cốt thép nhịp lớn", tin_chi: 4, hoc_ky: 6, bat_buoc: "Có", khoi_kien_thuc: "Chuyên ngành" },
    { stt: 41, ma_hp: "KTXD1309", ten_hoc_phan: "Thiết kế Đường cao tốc & Nút giao thông", tin_chi: 3, hoc_ky: 6, bat_buoc: "Có", khoi_kien_thuc: "Chuyên ngành" },
    { stt: 42, ma_hp: "KTXD1310", ten_hoc_phan: "Mô hình hóa thông tin công trình (BIM & Civil 3D)", tin_chi: 3, hoc_ky: 6, bat_buoc: "Có", khoi_kien_thuc: "Chuyên ngành" },
    { stt: 43, ma_hp: "KTXD1311", ten_hoc_phan: "Công nghệ Thi công Cầu & Hầm giao thông", tin_chi: 3, hoc_ky: 6, bat_buoc: "Có", khoi_kien_thuc: "Chuyên ngành" },
    { stt: 44, ma_hp: "KTXD1312", ten_hoc_phan: "Đồ án Thiết kế Đường ô tô", tin_chi: 2, hoc_ky: 6, bat_buoc: "Có", khoi_kien_thuc: "Thực hành" },
    { stt: 45, ma_hp: "KTXD1313", ten_hoc_phan: "Đồ án Thiết kế Kết cấu Cầu", tin_chi: 2, hoc_ky: 6, bat_buoc: "Có", khoi_kien_thuc: "Thực hành" },
    { stt: 46, ma_hp: "GDQP1104", ten_hoc_phan: "Giáo dục quốc phòng & An ninh 4: Kỹ thuật chiến đấu", tin_chi: 1, hoc_ky: 6, bat_buoc: "Có", khoi_kien_thuc: "Học phần chung" },

    // Kỳ 7 (20 tín chỉ)
    { stt: 47, ma_hp: "KTXD1314", ten_hoc_phan: "Thiết kế Cầu Thép - Liên hợp & Cầu dây văng", tin_chi: 4, hoc_ky: 7, bat_buoc: "Có", khoi_kien_thuc: "Chuyên ngành" },
    { stt: 48, ma_hp: "KTXD1315", ten_hoc_phan: "Kỹ thuật Hầm & Công trình ngầm đô thị", tin_chi: 3, hoc_ky: 7, bat_buoc: "Có", khoi_kien_thuc: "Chuyên ngành" },
    { stt: 49, ma_hp: "KTXD1316", ten_hoc_phan: "Kỹ thuật Đường sắt đô thị (Metro) & Tốc độ cao", tin_chi: 3, hoc_ky: 7, bat_buoc: "Có", khoi_kien_thuc: "Chuyên ngành UTC" },
    { stt: 50, ma_hp: "KTXD1317", ten_hoc_phan: "Phần mềm phân tích kết cấu (Midas Civil / SAP2000)", tin_chi: 3, hoc_ky: 7, bat_buoc: "Có", khoi_kien_thuc: "Chuyên ngành" },
    { stt: 51, ma_hp: "KTXD1318", ten_hoc_phan: "Quản lý Dự án & Đấu thầu công trình GTVT", tin_chi: 3, hoc_ky: 7, bat_buoc: "Có", khoi_kien_thuc: "Chuyên ngành" },
    { stt: 52, ma_hp: "KTXD1319", ten_hoc_phan: "Đồ án Công nghệ Thi công Cầu - Đường", tin_chi: 2, hoc_ky: 7, bat_buoc: "Có", khoi_kien_thuc: "Thực hành" },
    { stt: 53, ma_hp: "KTXD1320", ten_hoc_phan: "Thực tập Kỹ sư Hiện trường tại Ban QLDA/Nhà thầu", tin_chi: 2, hoc_ky: 7, bat_buoc: "Có", khoi_kien_thuc: "Thực hành" },

    // Kỳ 8 (20 tín chỉ)
    { stt: 54, ma_hp: "KTXD1401", ten_hoc_phan: "Kiểm định, Thử nghiệm & Quan trắc công trình", tin_chi: 3, hoc_ky: 8, bat_buoc: "Có", khoi_kien_thuc: "Chuyên ngành" },
    { stt: 55, ma_hp: "KTXD1402", ten_hoc_phan: "Bảo trì, Sửa chữa & Gia cố công trình hạ tầng", tin_chi: 3, hoc_ky: 8, bat_buoc: "Có", khoi_kien_thuc: "Chuyên ngành" },
    { stt: 56, ma_hp: "KTXD1403", ten_hoc_phan: "Kinh tế Xây dựng & Dự toán định mức công trình", tin_chi: 3, hoc_ky: 8, bat_buoc: "Có", khoi_kien_thuc: "Bổ trợ" },
    { stt: 57, ma_hp: "KTXD1404", ten_hoc_phan: "Hạ tầng Giao thông thông minh (ITS) & Đô thị số", tin_chi: 3, hoc_ky: 8, bat_buoc: "Có", khoi_kien_thuc: "Chuyên ngành" },
    { stt: 58, ma_hp: "KTXD1405", ten_hoc_phan: "An toàn lao động & Môi trường trong xây dựng", tin_chi: 2, hoc_ky: 8, bat_buoc: "Có", khoi_kien_thuc: "Chuyên ngành" },
    { stt: 59, ma_hp: "KTXD1406", ten_hoc_phan: "Thực tập Tốt nghiệp Kỹ sư tại Tổng công ty/Ban QLDA", tin_chi: 4, hoc_ky: 8, bat_buoc: "Có", khoi_kien_thuc: "Tốt nghiệp" },
    { stt: 60, ma_hp: "KTXD1407", ten_hoc_phan: "Vật liệu mới & Bê tông tính năng siêu cao UHPC", tin_chi: 2, hoc_ky: 8, bat_buoc: "Không", khoi_kien_thuc: "Tự chọn" },

    // Kỳ 9 (18 tín chỉ) - Học kỳ tốt nghiệp Kỹ sư bậc 7 chuyên sâu
    { stt: 61, ma_hp: "KTXD1408", ten_hoc_phan: "Khởi nghiệp & Đổi mới sáng tạo trong xây dựng", tin_chi: 2, hoc_ky: 9, bat_buoc: "Có", khoi_kien_thuc: "Bổ trợ" },
    { stt: 62, ma_hp: "KTXD1409", ten_hoc_phan: "Chuyên đề Quy hoạch Hạ tầng giao thông hiện đại", tin_chi: 2, hoc_ky: 9, bat_buoc: "Có", khoi_kien_thuc: "Chuyên ngành" },
    { stt: 63, ma_hp: "KTXD1410", ten_hoc_phan: "Đồ án Tốt nghiệp Kỹ sư Xây dựng Giao thông", tin_chi: 12, hoc_ky: 9, bat_buoc: "Có", khoi_kien_thuc: "Tốt nghiệp" },
    { stt: 64, ma_hp: "KTXD1411", ten_hoc_phan: "Bảo vệ Đồ án trước Hội đồng chấm Kỹ sư Quốc gia", tin_chi: 2, hoc_ky: 9, bat_buoc: "Có", khoi_kien_thuc: "Tốt nghiệp" },
  ];
}

// Hàm suy luận mô tả học gì - ra trường làm gì dựa theo nhóm ngành thực tế
function getMajorCareerProfile(majorName: string, facultyName?: string) {
  const lower = majorName.toLowerCase();

  if (lower.includes("thông tin") || lower.includes("máy tính") || lower.includes("cntt")) {
    return {
      degree: "Kỹ sư Công nghệ thông tin / Khoa học máy tính",
      duration: "4.5 năm (~178 tín chỉ) - Hệ Kỹ sư Chính quy (Bậc 7)",
      studyWhat: [
        "Lập trình hướng đối tượng, cấu trúc dữ liệu & giải thuật, kiến trúc máy tính và hệ điều hành.",
        "Phát triển ứng dụng Web, Di động, Hệ thống phần mềm doanh nghiệp và Điện toán đám mây.",
        "Trí tuệ nhân tạo (AI), Học máy (Machine Learning) và Khoa học dữ liệu ứng dụng trong logistics & giao thông.",
        "An toàn thông tin, bảo mật mạng và cơ sở dữ liệu phân tán quy mô lớn.",
      ],
      careerJobs: [
        "Kỹ sư phát triển phần mềm (Frontend, Backend, Fullstack, Mobile App) tại các tập đoàn công nghệ (FPT, Viettel, VNPT, VNG...) và công ty đa quốc gia.",
        "Kỹ sư dữ liệu & Trí tuệ nhân tạo (Data Engineer, AI/ML Specialist) xây dựng hệ thống điều hành thông minh.",
        "Chuyên viên an toàn mạng, quản trị hệ thống và kiểm thử bảo mật phần mềm (QA/QC, Security Engineer).",
        "Kỹ sư giải pháp CNTT ứng dụng trong hệ thống Giao thông thông minh (ITS), đường sắt đô thị và cảng biển logistics.",
      ],
    };
  }

  if (lower.includes("kinh tế") || lower.includes("quản trị") || lower.includes("tài chính") || lower.includes("kế toán")) {
    return {
      degree: "Cử nhân Kinh tế / Quản trị kinh doanh / Tài chính - Ngân hàng",
      duration: "4.0 năm (~146 tín chỉ) - Hệ Cử nhân Chính quy",
      studyWhat: [
        "Kinh tế vi mô, vĩ mô, nguyên lý quản trị kinh doanh, marketing hiện đại và quản trị nguồn nhân lực.",
        "Kinh tế và quản lý đầu tư công trình hạ tầng, thẩm định dự án giao thông vận tải.",
        "Tài chính doanh nghiệp, tiền tệ ngân hàng, chứng khoán, kế toán tài chính và kiểm toán.",
        "Ứng dụng phân tích dữ liệu kinh doanh và chuyển đổi số trong vận hành doanh nghiệp.",
      ],
      careerJobs: [
        "Chuyên viên thẩm định dự án, kế hoạch đầu tư tại các cơ quan nhà nước, tập đoàn xây dựng và ban quản lý dự án.",
        "Chuyên viên tài chính, tín dụng, thanh toán quốc tế tại các ngân hàng thương mại và quỹ đầu tư tài chính.",
        "Nhà quản lý kinh doanh, chuyên viên marketing và phát triển đối tác tại các doanh nghiệp trong và ngoài nước.",
        "Kế toán trưởng, kiểm toán viên, chuyên viên tư vấn tài chính và thuế.",
      ],
    };
  }

  if (lower.includes("logistics") || lower.includes("chuỗi cung ứng")) {
    return {
      degree: "Kỹ sư / Cử nhân Logistics và Quản lý chuỗi cung ứng",
      duration: "4.0 - 4.5 năm (~146 - 178 tín chỉ) - Chuẩn Quốc tế FIATA",
      studyWhat: [
        "Quản trị vận tải đa phương thức (đường sắt, đường bộ, hàng hải, hàng không).",
        "Thiết kế mạng lưới chuỗi cung ứng toàn cầu, tối ưu hóa kho bãi và quản lý tồn kho tự động.",
        "Giao nhận vận tải quốc tế, bảo hiểm hàng hải, thương mại điện tử và pháp luật ngoại thương.",
        "Hệ thống thông tin logistics (WMS, TMS, ERP SAP/Oracle) và phân tích dữ liệu luồng hàng.",
      ],
      careerJobs: [
        "Chuyên viên quản trị chuỗi cung ứng tại các tập đoàn sản xuất đa quốc gia (Samsung, LG, Honda, Toyota...).",
        "Chuyên viên điều độ vận tải cảng biển, cảng cạn ICD, trung tâm phân phối và cảng hàng không quốc tế.",
        "Quản lý kho hàng thông minh, chuyên viên thu mua (Procurement) và hoạch định nguồn cung.",
        "Chuyên viên hải quan, xuất nhập khẩu và chứng từ giao nhận tại các công ty logistics toàn cầu (DHL, Maersk, Kuehne+Nagel...).",
      ],
    };
  }

  if (lower.includes("xây dựng") || lower.includes("cầu đường") || lower.includes("hạ tầng") || lower.includes("công trình")) {
    return {
      degree: "Kỹ sư Kỹ thuật Xây dựng / Công trình Giao thông",
      duration: "4.5 năm (~180 tín chỉ) - Kỹ sư chuyên sâu theo chuẩn Bậc 7 UTC",
      studyWhat: [
        "Cơ học kết cấu, sức bền vật liệu, cơ học đất và nền móng công trình hiện đại.",
        "Thiết kế, thi công đường cao tốc, cầu vượt nhịp lớn, hầm giao thông và đường sắt đô thị (Metro).",
        "Ứng dụng mô hình thông tin công trình (BIM), phần mềm kết cấu (Midas, Plaxis, SAP2000).",
        "Quản lý dự án, giám sát an toàn chất lượng và nghiệm thu công trình hạ tầng kỹ thuật đô thị.",
      ],
      careerJobs: [
        "Kỹ sư tư vấn thiết kế kết cấu cầu đường, công trình ngầm tại các viện nghiên cứu và tổng công ty tư vấn thiết kế.",
        "Kỹ sư chỉ huy trưởng công trường, quản lý thi công tại các tập đoàn xây dựng lớn (Đèo Cả, Vinaconex, Cienco, Trung Nam...).",
        "Cán bộ quản lý kỹ thuật tại các Ban Quản lý dự án của Bộ GTVT, Sở GTVT và chủ đầu tư hạ tầng cao tốc/metro.",
        "Kỹ sư giám sát chất lượng, thẩm tra dự toán và bảo trì công trình giao thông trọng điểm.",
      ],
    };
  }

  if (lower.includes("ô tô") || lower.includes("cơ điện") || lower.includes("cơ khí")) {
    return {
      degree: "Kỹ sư Kỹ thuật Ô tô / Cơ điện tử / Kỹ thuật Cơ khí",
      duration: "4.5 năm (~180 tín chỉ) - Hệ Kỹ sư Chính quy (Bậc 7)",
      studyWhat: [
        "Nguyên lý máy, chi tiết máy, công nghệ gia công CNC và sản xuất cơ khí chính xác.",
        "Hệ thống động cơ, khung gầm, điện - điện tử ô tô hiện đại và hệ thống điều khiển tự động.",
        "Công nghệ xe điện thông minh (EV), pin nhiên liệu và hệ thống hỗ trợ lái tự hành (ADAS).",
        "Thiết kế mô phỏng trên phần mềm 3D CAD/CAM/CAE (CATIA, SolidWorks, Ansys).",
      ],
      careerJobs: [
        "Kỹ sư R&D thiết kế, phát triển sản phẩm ô tô và xe điện tại các hãng sản xuất (VinFast, Hyundai, Thaco, Toyota...).",
        "Kỹ sư chẩn đoán, vận hành, kiểm định chất lượng và dịch vụ sau bán hàng tại hệ thống đại lý ô tô toàn quốc.",
        "Kỹ sư lập trình PLC, robot công nghiệp và tự động hóa dây chuyền lắp ráp thông minh.",
        "Kỹ sư quản lý thiết bị cơ giới đường sắt, hàng hải và phương tiện giao thông thông minh.",
      ],
    };
  }

  // Mặc định chuẩn UTC
  return {
    degree: "Kỹ sư / Cử nhân Đại học Chính quy UTC",
    duration: "4.0 - 4.5 năm (~140 - 180 tín chỉ) theo chuẩn Bậc 7 UTC",
    studyWhat: [
      "Khối kiến thức đại cương: Toán cao cấp, Vật lý đại cương, Ngoại ngữ và Pháp luật đại cương.",
      "Kiến thức cơ sở ngành và chuyên ngành định hướng chuyên sâu thực tiễn nghề nghiệp.",
      "Thực tập tại doanh nghiệp, viện nghiên cứu và các dự án liên kết của UTC.",
      "Kỹ năng mềm: làm việc nhóm, thuyết trình, tư duy phản biện và quản lý dự án.",
    ],
    careerJobs: [
      "Chuyên viên kỹ thuật, tư vấn hoặc quản lý tại các doanh nghiệp chuyên ngành trong và ngoài nước.",
      "Cán bộ nghiên cứu, quản lý nhà nước tại các sở ban ngành liên quan.",
      "Khởi nghiệp, thành lập doanh nghiệp hoặc tiếp tục học tập bậc Thạc sĩ, Tiến sĩ trong và ngoài nước.",
    ],
  };
}

export default function ChiTietNganhClient({
  major,
  programs,
  combinations,
  scoreHistory,
}: Props) {
  const profile = getMajorCareerProfile(major.ten_nganh, major.khoi_nganh?.ten_khoi_nganh);

  // Modal Khung chương trình đào tạo
  const [isCurriculumModalOpen, setIsCurriculumModalOpen] = useState(false);
  const [selectedProgramForModal, setSelectedProgramForModal] = useState<ProgramItem | null>(programs[0] || null);
  const [filterSemester, setFilterSemester] = useState<number | "all">("all");
  const [searchCourse, setSearchCourse] = useState("");
  const [filterKnowledge, setFilterKnowledge] = useState<string>("all");

  // 1. Kiểm tra và ưu tiên nạp học phần từ CSDL Database của CTĐT đang chọn
  const rawDbCourses = selectedProgramForModal?.hoc_phan || [];
  const hasDbCourses = rawDbCourses.length > 0;

  const courses: CourseItem[] = useMemo(() => {
    if (hasDbCourses) {
      return rawDbCourses
        .filter((item) => item.hoc_phan != null)
        .map((item, idx) => ({
          stt: idx + 1,
          ma_hp: item.hoc_phan?.ma_hoc_phan || item.ma_hoc_phan,
          ten_hoc_phan: item.hoc_phan?.ten_hoc_phan || "Học phần chuyên môn",
          tin_chi: item.hoc_phan?.so_tin_chi || 3,
          hoc_ky: item.hoc_ky,
          bat_buoc: (item.loai === "bat_buoc" ? "Có" : "Không") as "Có" | "Không",
          khoi_kien_thuc: item.khoi_kien_thuc || "Cơ sở ngành",
        }));
    }
    // Fallback: Nếu CSDL hiện tại chưa có dữ liệu học phần cho CTĐT này thì lấy khung mẫu chuẩn UTC
    return getCurriculumCourses(major.ten_nganh);
  }, [selectedProgramForModal, hasDbCourses, major.ten_nganh]);

  // Lọc điểm chuẩn theo năm được chọn để xem chi tiết
  const availableYears = Array.from(new Set(scoreHistory.map((s) => s.nam))).sort((a, b) => b - a);
  const [selectedYear, setSelectedYear] = useState<number>(availableYears[0] || 2026);

  const filteredScores = scoreHistory.filter((s) => s.nam === selectedYear);

  // Chỉ tiêu mới nhất
  const latestQuota =
    scoreHistory.find((s) => s.nam === 2026)?.chi_tieu ||
    scoreHistory[0]?.chi_tieu ||
    "Theo Đề án";

  // Danh sách các khối kiến thức độc nhất
  const availableKnowledgeBlocks = Array.from(new Set(courses.map((c) => c.khoi_kien_thuc)));

  // Lọc học phần theo học kỳ, khối kiến thức và từ khóa tìm kiếm
  const displayedCourses = courses.filter((c) => {
    const matchSemester = filterSemester === "all" || c.hoc_ky === filterSemester;
    const matchKnowledge = filterKnowledge === "all" || c.khoi_kien_thuc.toLowerCase().includes(filterKnowledge.toLowerCase());
    const matchSearch = !searchCourse.trim() ||
      c.ten_hoc_phan.toLowerCase().includes(searchCourse.toLowerCase()) ||
      c.ma_hp.toLowerCase().includes(searchCourse.toLowerCase());
    return matchSemester && matchKnowledge && matchSearch;
  });

  const totalCredits = courses.reduce((acc, c) => acc + c.tin_chi, 0);
  const displayedCredits = displayedCourses.reduce((acc, c) => acc + c.tin_chi, 0);

  return (
    <div className="space-y-7">
      {/* 1. Header Banner Thông Tin Ngành */}
      <div className="bg-[#fffdf7] p-6 lg:p-8 border-[3px] border-[#111827] shadow-[6px_6px_0px_#111827] rounded-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-44 h-44 bg-[#0284c7]/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className="px-3 py-1 bg-[#0d1b4e] text-white font-stamp text-[12px] font-black border-[2px] border-[#111827] rounded-lg shadow-[2px_2px_0px_#111827]">
            MÃ NGÀNH: {major.ma_nganh}
          </span>
          <span className="px-3 py-1 bg-[#fdb712] text-[#0d1b4e] font-stamp text-[12px] font-black border-[2px] border-[#111827] rounded-lg shadow-[2px_2px_0px_#111827]">
            MÃ TRƯỜNG: GHA
          </span>
          {major.khoi_nganh && (
            <span className="px-3 py-1 bg-[#e0f2fe] text-[#0369a1] font-bold text-[12px] border-[1.5px] border-[#111827] rounded-lg">
              {major.khoi_nganh.ten_khoi_nganh}
            </span>
          )}
          <span className="px-3 py-1 bg-[#dcfce7] text-[#15803d] font-bold text-[12px] border-[1.5px] border-[#111827] rounded-lg">
            {profile.degree.includes("Kỹ sư") ? "HỆ KỸ SƯ CHÍNH QUY" : "HỆ CỬ NHÂN CHÍNH QUY"}
          </span>
        </div>

        <h1 className="font-display font-black text-[26px] sm:text-[34px] lg:text-[40px] text-[#0d1b4e] uppercase tracking-tight leading-tight mb-2">
          NGÀNH {major.ten_nganh} UTC
        </h1>

        <p className="text-[14px] sm:text-[15px] text-[#4b5563] font-medium max-w-4xl leading-relaxed">
          Chương trình đào tạo chính quy được kiểm định chất lượng quốc gia của Trường Đại học Giao thông Vận tải. Trang bị nền tảng chuyên môn vững chắc, công nghệ hiện đại và kỹ năng thực tiễn đáp ứng nhu cầu doanh nghiệp.
        </p>

        {/* Thông số nhanh */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-6 pt-6 border-t-[2px] border-dashed border-[#111827]">
          <div className="bg-[#faf3e6] p-3 rounded-xl border-[2px] border-[#111827] shadow-xs">
            <span className="text-[11px] font-bold text-[#767680] uppercase block">Thời Gian Đào Tạo</span>
            <span className="font-display font-black text-[15px] text-[#0d1b4e]">
              {profile.duration.split(" (")[0]}
            </span>
          </div>
          <div className="bg-[#e0f2fe] p-3 rounded-xl border-[2px] border-[#111827] shadow-xs">
            <span className="text-[11px] font-bold text-[#0369a1] uppercase block">Văn Bằng Tốt Nghiệp</span>
            <span className="font-display font-black text-[15px] text-[#0284c7] truncate block" title={profile.degree}>
              {profile.degree.split(" (")[0]}
            </span>
          </div>
          <div className="bg-[#fef3c7] p-3 rounded-xl border-[2px] border-[#111827] shadow-xs">
            <span className="text-[11px] font-bold text-[#92400e] uppercase block">Chỉ Tiêu Tuyển Sinh K66</span>
            <span className="font-display font-black text-[18px] text-[#d97706]">
              {latestQuota} SV
            </span>
          </div>
          <div className="bg-[#dcfce7] p-3 rounded-xl border-[2px] border-[#111827] shadow-xs">
            <span className="text-[11px] font-bold text-[#15803d] uppercase block">Số CTĐT Trực Thuộc</span>
            <span className="font-display font-black text-[18px] text-[#15803d]">
              {programs.length} Chương Trình
            </span>
          </div>
        </div>
      </div>

      {/* 2. Banner Disclaimer tham khảo */}
      <DisclaimerBanner />

      {/* 3. Khung 2 Cột Nội Dung Chuyên Sâu */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-7">
        {/* Cột Trái (8 cột): Học gì, Ra trường làm gì, Các CTĐT thuộc ngành */}
        <div className="lg:col-span-8 space-y-7">
          {/* Card: Bạn sẽ học gì & Ra trường làm gì */}
          <div className="bg-[#fffdf7] p-6 sm:p-7 border-[3px] border-[#111827] shadow-[5px_5px_0px_#111827] rounded-2xl space-y-6">
            <div className="border-b-[2px] border-[#111827] pb-3">
              <h2 className="font-display font-black text-[20px] sm:text-[22px] text-[#0d1b4e] uppercase flex items-center gap-2">
                <span className="material-symbols-outlined text-[#0284c7] text-[24px]">school</span>
                Mô Tả Chuyên Môn & Định Hướng Nghề Nghiệp
              </h2>
              <p className="text-[12.5px] text-[#6b7280]">
                Khung kiến thức chuẩn và cơ hội việc làm sau khi tốt nghiệp tại UTC
              </p>
            </div>

            {/* Học gì */}
            <div className="space-y-3">
              <h3 className="font-display font-black text-[15px] text-[#0d1b4e] uppercase flex items-center gap-2">
                <span className="material-symbols-outlined text-[#16a34a] text-[18px]">menu_book</span>
                Sinh Viên Sẽ Được Học Gì?
              </h3>
              <div className="grid grid-cols-1 gap-2.5">
                {profile.studyWhat.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-white border-[1.5px] border-[#111827] rounded-xl text-[13px] text-[#374151] flex items-start gap-2.5 shadow-xs"
                  >
                    <span className="w-5 h-5 rounded-full bg-[#dcfce7] text-[#15803d] font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5 border border-[#16a34a]">
                      ✓
                    </span>
                    <span className="leading-relaxed font-medium">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Ra trường làm gì */}
            <div className="space-y-3 pt-2">
              <h3 className="font-display font-black text-[15px] text-[#0d1b4e] uppercase flex items-center gap-2">
                <span className="material-symbols-outlined text-[#0284c7] text-[18px]">work</span>
                Cơ Hội Việc Làm Sau Khi Ra Trường:
              </h3>
              <div className="grid grid-cols-1 gap-2.5">
                {profile.careerJobs.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-[#f0f9ff] border-[1.5px] border-[#0284c7] rounded-xl text-[13px] text-[#0c4a6e] flex items-start gap-2.5 shadow-xs"
                  >
                    <span className="material-symbols-outlined text-[#0284c7] text-[18px] shrink-0 mt-0.5">
                      trending_up
                    </span>
                    <span className="leading-relaxed font-medium">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Card: Các Chương Trình Đào Tạo Thuộc Ngành */}
          <div className="bg-[#fffdf7] p-6 sm:p-7 border-[3px] border-[#111827] shadow-[5px_5px_0px_#111827] rounded-2xl space-y-4">
            <div className="border-b-[2px] border-[#111827] pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="font-display font-black text-[19px] sm:text-[21px] text-[#0d1b4e] uppercase flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#f59e0b] text-[22px]">layers</span>
                  Các Chương Trình Đào Tạo Trong Ngành ({programs.length})
                </h2>
                <p className="text-[12.5px] text-[#6b7280]">
                  Gồm chương trình đại trà, chất lượng cao và các chuyên ngành chuyên sâu
                </p>
              </div>
              <button
                onClick={() => {
                  setSelectedProgramForModal(programs[0] || null);
                  setIsCurriculumModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#0284c7] hover:bg-[#0369a1] text-white font-black text-[12px] border-[2px] border-[#111827] rounded-xl shadow-[2px_2px_0px_#111827] cursor-pointer transition-all self-start sm:self-auto"
              >
                <span className="material-symbols-outlined text-[16px]">menu_book</span>
                Xem Khung Đào Tạo Chi Tiết
              </button>
            </div>

            <div className="space-y-3.5 pt-2">
              {programs.length === 0 ? (
                <p className="text-[13px] text-[#6b7280] italic">
                  Chưa có phân ngành chi tiết. Toàn ngành áp dụng chung theo khung chuẩn UTC.
                </p>
              ) : (
                programs.map((prog, pIdx) => (
                  <div
                    key={prog.ma_chuong_trinh || pIdx}
                    className="p-4 sm:p-5 bg-white border-[2px] border-[#111827] rounded-xl shadow-[2px_2px_0px_#111827] space-y-2.5 hover:bg-[#faf3e6]/50 transition-colors"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-stamp text-[11px] font-black text-[#0d1b4e] bg-[#faf3e6] px-2 py-0.5 rounded border border-[#111827]">
                        MÃ CTDT: {prog.ma_chuong_trinh}
                      </span>
                      {prog.ten_chuong_trinh.toLowerCase().includes("chất lượng cao") ||
                      prog.ten_chuong_trinh.toLowerCase().includes("việt - anh") ? (
                        <span className="text-[10px] font-black text-[#dc2626] bg-[#fee2e2] px-2 py-0.5 rounded border border-[#ef4444] uppercase">
                          Chương Trình Chất Lượng Cao
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-[#15803d] bg-[#dcfce7] px-2 py-0.5 rounded border border-[#22c55e] uppercase">
                          Chương Trình Chuẩn Chính Quy
                        </span>
                      )}
                    </div>

                    <h4 className="font-display font-black text-[16px] sm:text-[17px] text-[#0d1b4e]">
                      {prog.ten_chuong_trinh}
                    </h4>

                    {prog.mo_ta_ngan && (
                      <p className="text-[12.5px] text-[#4b5563] leading-relaxed">
                        {prog.mo_ta_ngan}
                      </p>
                    )}

                    <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-dashed border-[#e5e7eb]">
                      <span className="text-[11.5px] text-[#6b7280] font-medium flex items-center gap-1">
                        <span className="material-symbols-outlined text-[15px] text-[#0284c7]">menu_book</span>
                        Khoảng {courses.length} học phần ({totalCredits} tín chỉ)
                      </span>
                      <button
                        onClick={() => {
                          setSelectedProgramForModal(prog);
                          setIsCurriculumModalOpen(true);
                        }}
                        className="inline-flex items-center gap-1 text-[12px] font-black text-[#0284c7] hover:underline cursor-pointer"
                      >
                        <span>Tra cứu khung học phần</span>
                        <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Cột Phải (4 cột): Tổ hợp xét tuyển, Điểm chuẩn & Chỉ tiêu, Link điều hướng */}
        <div className="lg:col-span-4 space-y-6">
          {/* Box 1: Tổ hợp môn xét tuyển phù hợp */}
          <div className="bg-[#fffdf7] p-5 sm:p-6 border-[3px] border-[#111827] shadow-[5px_5px_0px_#111827] rounded-2xl space-y-4">
            <div className="border-b-[2px] border-[#111827] pb-2.5">
              <h3 className="font-display font-black text-[16px] text-[#0d1b4e] uppercase flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[#0284c7] text-[20px]">checklist</span>
                Tổ Hợp Xét Tuyển Phù Hợp
              </h3>
              <p className="text-[11.5px] text-[#6b7280]">
                Các khối thi xét tuyển vào ngành tại UTC
              </p>
            </div>

            {combinations.length === 0 ? (
              <div className="p-3 bg-[#faf3e6] rounded-xl text-[12px] text-[#4b5563]">
                Áp dụng tổ hợp truyền thống A00 (Toán, Lý, Hóa) và A01 (Toán, Lý, Anh).
              </div>
            ) : (
              <div className="space-y-2">
                {combinations.map((comb) => (
                  <div
                    key={comb.ma_to_hop}
                    className="p-2.5 bg-white border-[2px] border-[#111827] rounded-xl flex items-center justify-between shadow-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-[#0d1b4e] text-[#fdb712] font-stamp text-[12px] font-black rounded border border-[#111827]">
                        {comb.ma_to_hop}
                      </span>
                      <span className="text-[12px] font-bold text-[#1e1b14]">
                        {comb.ten_mon_1 || "Môn 1"} - {comb.ten_mon_2 || "Môn 2"} - {comb.ten_mon_3 || "Môn 3"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="p-3 bg-[#fffbeb] border-[1.5px] border-[#f59e0b] rounded-xl text-[11.5px] text-[#92400e] leading-snug">
              ⚠️ <strong>Lưu ý:</strong> Điểm thi môn Toán kỳ thi tốt nghiệp THPT phải đạt từ <strong>5.0 điểm</strong> trở lên.
            </div>
          </div>

          {/* Box 2: Chỉ tiêu & Điểm chuẩn các năm (kèm bộ chọn năm) */}
          <div className="bg-[#fffdf7] p-5 sm:p-6 border-[3px] border-[#111827] shadow-[5px_5px_0px_#111827] rounded-2xl space-y-4">
            <div className="flex items-center justify-between border-b-[2px] border-[#111827] pb-2.5">
              <h3 className="font-display font-black text-[16px] text-[#0d1b4e] uppercase flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[#dc2626] text-[20px]">leaderboard</span>
                Điểm Chuẩn Các Năm
              </h3>
              {availableYears.length > 1 && (
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  className="px-2 py-1 bg-white border-[1.5px] border-[#111827] rounded-lg text-[11.5px] font-bold text-[#0d1b4e] outline-none cursor-pointer"
                >
                  {availableYears.map((y) => (
                    <option key={y} value={y}>
                      Năm {y}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {filteredScores.length === 0 ? (
              <p className="text-[12px] text-[#6b7280] italic">
                Chưa có dữ liệu điểm chuẩn cho năm {selectedYear}. Vui lòng chọn năm khác để xem tham khảo.
              </p>
            ) : (
              <div className="space-y-2.5">
                {filteredScores.map((sc, sIdx) => (
                  <div
                    key={sIdx}
                    className="p-3 bg-white border-[2px] border-[#111827] rounded-xl space-y-1 shadow-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-[#0284c7] uppercase">
                        {sc.ten_phuong_thuc}
                      </span>
                      <span className="font-display font-black text-[18px] text-[#dc2626]">
                        {sc.diem ? `${sc.diem.toFixed(2)} đ` : "N/A"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-[#6b7280]">
                      <span className="truncate max-w-[170px]" title={sc.ten_chuong_trinh}>
                        {sc.ten_chuong_trinh}
                      </span>
                      <span className="font-bold text-[#111827]">
                        Chỉ tiêu: {sc.chi_tieu} SV
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="pt-1 text-[11px] text-[#767680] italic">
              * Điểm chuẩn trên thang điểm tương ứng (THPT thang 30, ĐGTD thang 100, ĐGNL thang 150).
            </div>
          </div>

          {/* Box 3: Điều hướng hành động liên quan */}
          <div className="bg-[#0d1b4e] p-5 sm:p-6 border-[3px] border-[#111827] shadow-[5px_5px_0px_#111827] rounded-2xl text-white space-y-3.5">
            <h4 className="font-display font-black text-[16px] text-[#fdb712] uppercase flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[20px]">assistant_navigation</span>
              Thao Tác Thí Sinh
            </h4>
            <p className="text-[12px] text-[#cbd5e1] leading-snug">
              Kiểm tra cơ hội đỗ và theo dõi hạn nộp hồ sơ xét tuyển ngành {major.ten_nganh}:
            </p>

            <div className="space-y-2 pt-1">
              <button
                onClick={() => {
                  setSelectedProgramForModal(programs[0] || null);
                  setIsCurriculumModalOpen(true);
                }}
                className="w-full py-2.5 px-4 bg-[#0284c7] hover:bg-[#0369a1] text-white font-black text-[12.5px] border-[2px] border-[#111827] rounded-xl shadow-[2px_2px_0px_#111827] transition-all flex items-center justify-center gap-1.5 uppercase cursor-pointer"
              >
                <span className="material-symbols-outlined text-[17px]">table_view</span>
                Xem Khung Chương Trình Đào Tạo
              </button>

              <Link
                href="/tinh-diem-quy-doi"
                className="w-full py-2.5 px-4 bg-[#fdb712] hover:bg-[#e2a20a] text-[#0d1b4e] font-black text-[12.5px] border-[2px] border-[#111827] rounded-xl shadow-[2px_2px_0px_#111827] transition-all flex items-center justify-center gap-1.5 uppercase"
              >
                <span className="material-symbols-outlined text-[17px]">calculate</span>
                Tính Điểm Quy Đổi Vào Ngành
              </Link>

              <Link
                href="/lo-trinh-tuyen-sinh"
                className="w-full py-2.5 px-4 bg-white hover:bg-[#faf3e6] text-[#0d1b4e] font-black text-[12.5px] border-[2px] border-[#111827] rounded-xl shadow-[2px_2px_0px_#111827] transition-all flex items-center justify-center gap-1.5 uppercase"
              >
                <span className="material-symbols-outlined text-[17px]">event_note</span>
                Xem Lộ Trình & Hạn Nộp Hồ Sơ
              </Link>

              <Link
                href="/hoi-dap-ai"
                className="w-full py-2 px-3 bg-[#1e293b] hover:bg-[#334155] text-[#93c5fd] font-bold text-[12px] border border-[#475569] rounded-xl transition-all flex items-center justify-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px]">smart_toy</span>
                Hỏi Trợ Lý AI Về Ngành Này
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* 4. MODAL KHUNG CHƯƠNG TRÌNH ĐÀO TẠO (Chuẩn theo hình ảnh yêu cầu) */}
      {isCurriculumModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-5xl max-h-[90vh] flex flex-col bg-white border-[3px] border-[#111827] shadow-[8px_8px_0px_#111827] rounded-2xl overflow-hidden">
            {/* Header Modal Xanh Dương Chuẩn Form */}
            <div className="bg-[#1d4ed8] text-white p-4 sm:p-5 flex items-center justify-between border-b-[3px] border-[#111827]">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[24px]">school</span>
                <h3 className="font-display font-black text-[18px] sm:text-[22px] tracking-wide">
                  Khung chương trình đào tạo
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="hidden sm:inline-flex items-center gap-1 px-3 py-1 bg-white/20 rounded-lg text-[12px] font-bold">
                  <span className="material-symbols-outlined text-[16px]">info</span>
                  Chi tiết chương trình
                </span>
                <button
                  onClick={() => setIsCurriculumModalOpen(false)}
                  className="w-8 h-8 rounded-lg bg-white/20 hover:bg-white/30 flex items-center justify-center text-white font-bold transition-colors cursor-pointer"
                  aria-label="Đóng"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>
            </div>

            {/* Sub-header: Pills thông tin ngành / mã tuyển sinh / tổng học phần & chọn CTĐT */}
            <div className="p-4 bg-[#f8fafc] border-b-[2px] border-[#e2e8f0] flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-[#cbd5e1] rounded-full text-[12px] font-bold text-[#1e293b] shadow-xs">
                <span className="material-symbols-outlined text-[15px] text-[#0284c7]">menu_book</span>
                Ngành: <span className="font-black text-[#0d1b4e]">{major.ten_nganh}</span>
              </span>

              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-[#cbd5e1] rounded-full text-[12px] font-bold text-[#1e293b] shadow-xs">
                <span className="font-mono text-[#0284c7]">#</span>
                Mã ngành: <span className="font-mono font-black text-[#0d1b4e]">{major.ma_nganh}</span>
              </span>

              {/* Bộ chọn CTĐT nếu ngành có nhiều chương trình */}
              {programs.length > 1 ? (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-[#cbd5e1] rounded-full text-[12px] font-bold text-[#1e293b] shadow-xs">
                  <span className="material-symbols-outlined text-[15px] text-[#0284c7]">layers</span>
                  <span>CTĐT:</span>
                  <select
                    value={selectedProgramForModal?.ma_chuong_trinh || ""}
                    onChange={(e) => {
                      const found = programs.find((p) => p.ma_chuong_trinh === e.target.value);
                      if (found) setSelectedProgramForModal(found);
                    }}
                    className="font-black text-[#0d1b4e] bg-transparent outline-none cursor-pointer max-w-[200px] truncate"
                  >
                    {programs.map((p) => (
                      <option key={p.ma_chuong_trinh} value={p.ma_chuong_trinh}>
                        {p.ten_chuong_trinh} ({p.ma_chuong_trinh})
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-[#cbd5e1] rounded-full text-[12px] font-bold text-[#1e293b] shadow-xs">
                  <span className="material-symbols-outlined text-[15px] text-[#0284c7]">layers</span>
                  Mã tuyển sinh: <span className="font-mono font-black text-[#0d1b4e]">{selectedProgramForModal?.ma_chuong_trinh || major.ma_nganh}</span>
                </span>
              )}

              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#eff6ff] border border-[#bfdbfe] rounded-full text-[12px] font-bold text-[#1d4ed8] shadow-xs">
                <span className="material-symbols-outlined text-[15px]">format_list_numbered</span>
                Tổng học phần: <span className="font-black">{courses.length}</span> ({totalCredits} tín chỉ)
              </span>

              {/* Badge Nguồn dữ liệu (CSDL thật vs Dự phòng) */}
              {hasDbCourses ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#dcfce7] border border-[#86efac] rounded-full text-[11px] font-black text-[#15803d] shadow-xs ml-auto">
                  <span className="w-2 h-2 rounded-full bg-[#16a34a] animate-pulse" />
                  Dữ liệu từ CSDL ({courses.length} HP)
                </span>
              ) : (
                <span
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#fffbeb] border border-[#fde68a] rounded-full text-[11px] font-bold text-[#b45309] shadow-xs ml-auto"
                  title="CSDL bảng ctdt_hoc_phan hiện tại chưa có dữ liệu cho CTĐT này. Hệ thống hiển thị khung mẫu chuẩn UTC để hỗ trợ tra cứu."
                >
                  <span className="material-symbols-outlined text-[14px] text-[#f59e0b]">database</span>
                  Khung chuẩn UTC
                </span>
              )}
            </div>

            {/* Thanh Tìm kiếm & Lọc học phần linh hoạt */}
            <div className="p-3 bg-white border-b border-[#e2e8f0] flex flex-wrap items-center gap-3">
              {/* Ô tìm kiếm theo tên hoặc mã môn */}
              <div className="relative flex-1 min-w-[240px]">
                <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-[18px] text-[#94a3b8]">
                  search
                </span>
                <input
                  type="text"
                  value={searchCourse}
                  onChange={(e) => setSearchCourse(e.target.value)}
                  placeholder="Tìm học phần hoặc mã HP (vd: Giải tích, Bê tông, IT1101, Đồ án...)"
                  className="w-full pl-8 pr-7 py-1.5 text-[12px] bg-[#f8fafc] border border-[#cbd5e1] rounded-lg focus:outline-none focus:border-[#1d4ed8] text-[#0f172a]"
                />
                {searchCourse && (
                  <button
                    onClick={() => setSearchCourse("")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs w-4 h-4 rounded-full flex items-center justify-center cursor-pointer"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Lọc Khối kiến thức */}
              <div className="flex items-center gap-1.5 text-[12px]">
                <span className="text-[#64748b] font-bold shrink-0">Khối kiến thức:</span>
                <select
                  value={filterKnowledge}
                  onChange={(e) => setFilterKnowledge(e.target.value)}
                  className="px-2.5 py-1.5 bg-[#f8fafc] border border-[#cbd5e1] rounded-lg text-[11.5px] font-bold text-[#0f172a] outline-none cursor-pointer"
                >
                  <option value="all">Tất cả khối ({courses.length})</option>
                  {availableKnowledgeBlocks.map((blk) => (
                    <option key={blk} value={blk}>
                      {blk}
                    </option>
                  ))}
                </select>
              </div>

              {/* Lọc nhanh theo học kỳ */}
              <div className="flex items-center gap-1.5 text-[12px]">
                <span className="text-[#64748b] font-bold shrink-0">Học kỳ:</span>
                <select
                  value={filterSemester}
                  onChange={(e) => setFilterSemester(e.target.value === "all" ? "all" : Number(e.target.value))}
                  className="px-2.5 py-1.5 bg-[#f8fafc] border border-[#cbd5e1] rounded-lg text-[11.5px] font-bold text-[#0f172a] outline-none cursor-pointer"
                >
                  <option value="all">Tất cả kỳ (1 - 9)</option>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((sem) => (
                    <option key={sem} value={sem}>
                      Kỳ {sem}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Table Khung Chương Trình Đào Tạo Chuẩn */}
            <div className="flex-1 overflow-y-auto p-4">
              <div className="border-[2px] border-[#1d4ed8] rounded-xl overflow-hidden shadow-xs">
                <table className="w-full text-left border-collapse text-[12.5px]">
                  <thead>
                    <tr className="bg-[#1d4ed8] text-white font-black text-[12px] uppercase">
                      <th className="py-3 px-3 text-center w-[50px] border-r border-blue-400">STT</th>
                      <th className="py-3 px-3 text-center w-[100px] border-r border-blue-400">Mã HP</th>
                      <th className="py-3 px-4 border-r border-blue-400">Tên học phần</th>
                      <th className="py-3 px-3 text-center w-[80px] border-r border-blue-400">Tín chỉ</th>
                      <th className="py-3 px-3 text-center w-[80px] border-r border-blue-400">Học kỳ</th>
                      <th className="py-3 px-3 text-center w-[85px] border-r border-blue-400">Bắt buộc</th>
                      <th className="py-3 px-4 w-[160px]">Khối kiến thức</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e2e8f0] bg-white font-medium text-[#334155]">
                    {displayedCourses.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-[#64748b] italic">
                          Không tìm thấy học phần phù hợp với bộ lọc hiện tại. Vui lòng thử từ khóa khác!
                        </td>
                      </tr>
                    ) : (
                      displayedCourses.map((c, idx) => (
                        <tr key={c.stt} className="hover:bg-[#f8fafc] transition-colors">
                          <td className="py-2.5 px-3 text-center font-bold text-[#64748b] border-r border-[#e2e8f0]">
                            {idx + 1}
                          </td>
                          <td className="py-2.5 px-3 text-center font-mono font-bold text-[#1d4ed8] border-r border-[#e2e8f0]">
                            {c.ma_hp}
                          </td>
                          <td className="py-2.5 px-4 font-bold text-[#0f172a] border-r border-[#e2e8f0]">
                            {c.ten_hoc_phan}
                          </td>
                          <td className="py-2.5 px-3 text-center font-bold text-[#0f172a] border-r border-[#e2e8f0]">
                            {c.tin_chi}
                          </td>
                          <td className="py-2.5 px-3 text-center font-bold text-[#64748b] border-r border-[#e2e8f0]">
                            {c.hoc_ky}
                          </td>
                          <td className="py-2.5 px-3 text-center border-r border-[#e2e8f0]">
                            <span className="px-2 py-0.5 bg-[#dcfce7] text-[#15803d] font-bold text-[11px] rounded">
                              {c.bat_buoc}
                            </span>
                          </td>
                          <td className="py-2.5 px-4 text-[#475569] text-[12px]">
                            {c.khoi_kien_thuc}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <div className="pt-3 text-[11.5px] text-[#64748b] italic">
                * Khung chương trình đào tạo chính quy được áp dụng cho khóa tuyển sinh K66 theo hệ thống tín chỉ chuẩn của Trường Đại học Giao thông Vận tải (~180 tín chỉ đối với hệ Kỹ sư và ~145 tín chỉ đối với hệ Cử nhân).
              </div>
            </div>

            {/* Footer Modal */}
            <div className="p-4 bg-[#f8fafc] border-t-[2px] border-[#e2e8f0] flex flex-wrap items-center justify-between gap-3">
              <span className="text-[12.5px] text-[#475569]">
                Đang hiển thị: <strong className="text-[#0f172a]">{displayedCourses.length}</strong> / {courses.length} học phần (<strong className="text-[#1d4ed8]">{displayedCredits}</strong> / {totalCredits} tín chỉ)
              </span>
              <button
                onClick={() => setIsCurriculumModalOpen(false)}
                className="px-5 py-2 bg-[#0f172a] hover:bg-[#1e293b] text-white font-bold text-[12.5px] rounded-xl border border-[#0f172a] cursor-pointer transition-colors"
              >
                Đóng cửa sổ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

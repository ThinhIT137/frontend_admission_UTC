import type { PoolClient } from "pg";

// Lịch do chủ dự án cung cấp. Giờ Việt Nam được ghi rõ +07:00.
// ID cố định giúp chạy lại không tạo thêm sáu bản ghi trùng.
export const loTrinh2026 = [
  { id: "utc-2026-ho-so-som", title: "Nộp hồ sơ xét tuyển sớm", start: "2026-05-20T00:00:00+07:00", end: "2026-06-15T17:00:00+07:00", note: "Phương thức 1, 2 và cộng điểm." },
  { id: "utc-2026-thuc-hanh", title: "Thực hành đăng ký nguyện vọng", start: "2026-06-17T00:00:00+07:00", end: "2026-06-21T23:59:59+07:00", note: "Thực hành trên hệ thống đăng ký xét tuyển." },
  { id: "utc-2026-nguyen-vong", title: "Đăng ký, điều chỉnh nguyện vọng", start: "2026-07-02T00:00:00+07:00", end: "2026-07-14T17:00:00+07:00", note: "Đăng ký chính thức trên hệ thống của Bộ GD&ĐT." },
  { id: "utc-2026-le-phi", title: "Nộp lệ phí xét tuyển trực tuyến", start: "2026-07-15T00:00:00+07:00", end: "2026-07-21T17:00:00+07:00", note: "Thanh toán lệ phí xét tuyển trực tuyến." },
  { id: "utc-2026-ket-qua", title: "Tra cứu kết quả xét tuyển", start: "2026-08-11T00:00:00+07:00", end: null, note: "Từ ngày 11/08/2026 tại trang tuyển sinh chính thức của trường." },
  { id: "utc-2026-nhap-hoc", title: "Làm thủ tục nhập học trực tuyến", start: "2026-08-20T07:30:00+07:00", end: "2026-08-21T17:00:00+07:00", note: "Nhập học trực tuyến tập trung — Cơ sở phía Bắc." },
];

/** Dùng cùng connection/transaction của seeds.ts; không tự commit giữa các mốc. */
export async function seedLoTrinhTuyenSinh(client: PoolClient, adminId: string) {
  for (const event of loTrinh2026) {
    await client.query(`INSERT INTO lo_trinh_tuyen_sinh
      (ma_su_kien, ten_su_kien, thoi_gian_bat_dau, thoi_gian_ket_thuc, ghi_chu, ma_admin_cap_nhat)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (ma_su_kien) DO UPDATE SET ten_su_kien = EXCLUDED.ten_su_kien,
      thoi_gian_bat_dau = EXCLUDED.thoi_gian_bat_dau, thoi_gian_ket_thuc = EXCLUDED.thoi_gian_ket_thuc,
      ghi_chu = EXCLUDED.ghi_chu, ma_admin_cap_nhat = EXCLUDED.ma_admin_cap_nhat`,
      [event.id, event.title, new Date(event.start), event.end ? new Date(event.end) : null, event.note, adminId]);
  }
}

# Kiểm tra bổ sung tài khoản, học bạ và minh chứng — 21/10/2026

| Bộ kiểm tra | Đạt | Lỗi | Phạm vi |
|---|---:|---:|---|
| Next.js unit/action/component | 236 | 0 | Có thêm 6 case học bạ/metadata và quyền thay minh chứng. Storage/Prisma của unit được mock. |
| Backend điểm | 262 | 0 | SQLite qua HTTP/JWT/repository; OTP dùng sender kiểm thử; có lưu hai học kỳ và minh chứng giải thưởng. |
| Chrome trên production build | 2 | 0 | Nhập form nhiều kỳ/chứng chỉ/giải thưởng, mở form OTP và chọn kênh. Không gửi OTP hoặc ghi hồ sơ thật. |

- TypeScript: đạt. Production build: đạt.
- Supabase: migration `20261021010000_transcript_semesters_award_evidence` đã áp dụng; Prisma diff không có khác biệt.
- Gmail SMTP: cấu hình trong `.env` backend điểm, tên gửi UTC_EDU_VN; đăng nhập SMTP đạt. **Chưa gửi email/OTP thử tới người nhận thật.**
- Storage cloud: **chưa kiểm chứng**, thiếu `SUPABASE_SERVICE_ROLE_KEY`; chưa xác nhận bucket private/public từ API. Unit xác nhận chặn bucket public, thay file CCCD khác và thay minh chứng đã xử lý.
- SMS: chưa cấu hình gateway thật.
- Không sửa/chạy backend AI.

Log: `artifacts/frontend-20261021.log`, `score-20261021.log`, `build-20261021.log`, `academic-forms-browser.log`; Chrome JSON: `artifacts/academic-forms-results.json`.

Hai case form đã được thêm vào `pnpm test:watch:local` và suite `test:e2e`. `pnpm test:watch` mặc định vẫn giữ phạm vi live score/Supabase trước đó, không tự gửi OTP hay upload cloud để làm xanh test. Không chạy lại toàn bộ bot local/AI trong đợt này; selector upload và fixture Storage local đã được cập nhật theo giao diện mới.

Hướng dẫn cấu hình/sử dụng: [TAI-KHOAN-HOC-BA-MINH-CHUNG.md](../../docs/supabase-audit/TAI-KHOAN-HOC-BA-MINH-CHUNG.md).

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# AI CODING RULES – BẮT BUỘC TUÂN THỦ

## Phạm vi được phép chỉnh sửa
Bạn **CHỈ ĐƯỢC PHÉP** chỉnh sửa code trong thư mục:
- `frontend_admission_UTC/` (chỉ các file giao diện người dùng, components, pages client/UI).
- **TUYỆT ĐỐI KHÔNG** được sửa các file trong các thư mục cấu hình, logic backend, server actions, services:
  - `services/`
  - `actions/`
  - `libs/`
  - `prisma/`
  - và các file cấu hình hệ thống khác.

## Phạm vi CHỈ ĐƯỢC ĐỌC (tuyệt đối không sửa)
Bạn **CHỈ ĐƯỢC ĐỌC**, **KHÔNG ĐƯỢC** sửa, tạo, xóa, rename bất kỳ file nào trong các thư mục sau:
- `backend_thongke/`
- `backend_ai_ml/`
- `backend_application_score/`

## Quy tắc cứng
1. Khi người dùng yêu cầu sửa backend → từ chối và giải thích: "Tôi chỉ được phép chỉnh sửa Frontend."
2. Khi cần hiểu API / logic backend → chỉ được đọc file, không được đề xuất hoặc thực hiện thay đổi.
3. Không được tạo file mới, sửa file, xóa file ngoài phạm vi Frontend cho phép.
4. Không được chạy lệnh terminal có khả năng ghi vào thư mục backend (ví dụ: `echo >`, `rm`, `mv`, `git commit` trong backend…).
5. Nếu không chắc một đường dẫn thuộc Frontend hay Backend → hỏi lại trước khi thao tác.
6. Mọi thay đổi code phải nằm hoàn toàn trong phạm vi UI/Client của `frontend_admission_UTC/`.

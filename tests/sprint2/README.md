# Sprint 2

```powershell
node --test --test-isolation=none tests/sprint2/*.test.cjs
```

Kết quả sau sửa service theo yêu cầu: Sprint 2 có 52/52 pass; chạy chung Sprint 1 + 2 có 174/174 pass, 0 fail, 0 skip. TypeScript pass với `node node_modules/typescript/bin/tsc --noEmit --incremental false`. Tái sử dụng Node test runner, TypeScript loader từ Sprint 1. Không cài dependency. ESLint bổ sung phạm vi CommonJS cho tests/sprint2.

Files:
- `crud.test.cjs`: CRUD tổ hợp, phương thức, mốc thời gian; query và kết quả, cache invalidation, session, lỗi DB, trùng mã, danh sách rỗng/có dữ liệu, validation.
- `quota.test.cjs`: khởi tạo chỉ tiêu theo chương trình/năm, điểm phương thức mặc định 0, trùng chương trình/năm, session, lỗi DB, lọc năm và validation đầu vào.
- `helpers.cjs`: fixture riêng, mock Prisma/session/cache; dùng loader thật của Sprint 1.

Đã sửa 7 case phân quyền: create/update/delete tổ hợp; create/update/delete phương thức; delete mốc thời gian kiểm tra session tại service trước khi ghi DB. Middleware/layout không thay thế kiểm tra trong Server Action. Test gọi trực tiếp action, chưa kiểm chứng HTTP thực tế.

Đã sửa 9 case validation: tổ hợp trùng môn hoặc thiếu môn; phương thức thiếu tên; mốc thời gian thiếu tên; chỉ tiêu âm, 0, số lẻ, không chọn phương thức hoặc thiếu chương trình. Bổ sung 3 test validation khi cập nhật tổ hợp/phương thức/mốc thời gian. Các điều kiện dựa trên validation/required/min trong UI hiện có và kiểu Int của chỉ tiêu. Test kiểm tra ứng dụng từ chối trước khi gọi Prisma. DB mock không áp dụng constraint.

Không mở rộng sang cập nhật điểm chuẩn/trúng tuyển cuối mùa. Không kiểm thử trình duyệt, DB thật, rollback, constraint hay RLS. Chưa có acceptance criteria chi tiết cho giới hạn năm, thứ tự ngày bắt đầu/kết thúc, quyền theo từng vai trò hoặc xử lý xóa dữ liệu đang được tham chiếu; không tự đặt quy tắc cho những trường hợp đó. CRUD lỗi DB dùng lỗi mô phỏng để kiểm tra truyền lỗi và không invalidate cache, không chứng minh constraint DB thật hoạt động.

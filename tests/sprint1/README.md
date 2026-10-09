# Kiểm thử Sprint 1

Chạy từ thư mục gốc dự án (Node 24; dùng dependency TypeScript và React hiện có):

```powershell
node --test --test-isolation=none tests/sprint1/*.test.cjs
```

Không cài dependency mới. Dự án chưa có test runner tự động; bộ test dùng `node:test` có sẵn trong Node.js. Helper chuyển source TS/TSX thật sang JavaScript bằng TypeScript, với cache module riêng và mock các dependency bên ngoài. Test thực thi hàm thật, không chỉ so khớp nội dung source. Kiểm tra kiểu TypeScript chạy riêng.

Kết quả sau khi sửa service: **122 test, 122 pass, 0 fail, 0 skip**. Riêng JWT: **11 pass, 0 fail**. TypeScript pass với `node node_modules/typescript/bin/tsc --noEmit --incremental false`. Môi trường chặn tạo process (`spawn EPERM`); dùng `--test-isolation=none` để chạy cùng process. Mỗi fixture vẫn có cache module và mock riêng.

Phạm vi: đăng nhập/đăng xuất/refresh token; phân quyền tài khoản và vai trò; email trùng; chống tự xóa tài khoản; CRUD ngành học/CTĐT; kiểm tra admin trong transaction; ngành liên quan không tồn tại; lỗi DB; session và cache invalidation trong Server Actions; cấu trúc layout, quyền truy cập trang, menu sidebar theo vai trò và chuyển hướng middleware.

Lỗi đã sửa: gán vai trò yêu cầu Super Admin, kể cả khi sửa chính mình; cập nhật CTĐT lưu `mo_ta_ngan`. Test hồi quy kiểm tra từ chối đổi vai trò qua Server Action mà không ghi DB/invalidate cache; cho phép Super Admin gán vai trò; cập nhật mô tả qua Server Action; mô tả có giá trị, `null`, rỗng hoặc không truyền. Admin thường vẫn được sửa thông tin cá nhân khi không gán vai trò.

Sprint 1 yêu cầu đăng nhập bằng JWT. Source dùng tài khoản admin trong Prisma, bcrypt và JWT access/refresh riêng. Test luồng đăng nhập mock dependency token. `token.test.cjs` chạy service token, cấu hình token và `jose` thật với khóa riêng cho test: chữ ký HS256, `userId/sub/iat/exp`, access token 15 phút, refresh token 7 ngày; từ chối token sai khóa, bị sửa, hết hạn, sai định dạng, rỗng, không ký hoặc dùng lẫn access/refresh. Test tạm đặt biến môi trường khi nạp service và khôi phục ngay sau đó; không đọc khóa bí mật triển khai. Chạy riêng JWT bằng `node --test --test-isolation=none tests/sprint1/token.test.cjs`.

Giới hạn: DB được mock nên chưa xác nhận constraint, RLS, rollback hoặc xác thực trên môi trường triển khai. React render tĩnh kiểm tra cấu trúc/vai trò, chưa kiểm tra tương tác trình duyệt, responsive hoặc hydration. Server Components bất đồng bộ được gọi trực tiếp; luồng HTTP Next.js và redirect được mock. Sprint chưa nêu chi tiết quy tắc validation và ma trận quyền CRUD; cần làm rõ trước khi thêm assertion cho các hành vi đó. Không kiểm thử tính năng tra cứu, xét tuyển hoặc chatbot ngoài Sprint 1.

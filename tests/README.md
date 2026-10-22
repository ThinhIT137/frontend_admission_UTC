# Kiểm thử tuyển sinh Sprint 1–4

Cập nhật 19/10: E2E hiện khởi chạy Next.js, backend điểm và backend AI thật trên DB test cục bộ; LLM/Storage dùng fixture. Chi tiết phiên thí sinh, proxy JWT, các trang mới và kết quả mới nhất: [NEXTJS-INTEGRATION-STATUS.md](../../docs/supabase-audit/NEXTJS-INTEGRATION-STATUS.md).

Chạy từ `D:\Project\project_1\frontend_admission`. Bộ test dùng code frontend mới ở nhánh `work/admission-updates`, backend hồ sơ ở `backend_admission/backend_application_score`, AI ở worktree `backend_admission/backend_ai_ml_latest`. Không chạy repo AI cũ đang có merge conflict.

## Lệnh chạy

```powershell
pnpm test                 # Unit/action/component/DOM Sprint 1–4 của Next.js
pnpm test:contracts       # Adapter Next.js gọi FastAPI TestClient thật qua Python
pnpm test:all             # Cả ba repo, contracts, TypeScript; vẫn chạy tiếp nếu một suite fail
```

`test:all` ghi `tests/artifacts/summary.json`, log từng suite, `score.xml`, `ai.xml` (JUnit). Exit code khác 0 nếu có lỗi; không biến lỗi thành skip/xfail.

Môi trường hiện tại dùng Python trong `.venv` của backend hồ sơ và Python hệ thống + `.test-tools` cho AI. Để tạo môi trường riêng trên máy khác:

```powershell
# Trong từng repo backend:
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt -r requirements-test.txt

# Trở về frontend_admission:
$env:AI_TEST_PYTHON = (Resolve-Path ../backend_admission/backend_ai_ml_latest/.venv/Scripts/python.exe).Path
$env:SCORE_TEST_PYTHON = (Resolve-Path ../backend_admission/backend_application_score/.venv/Scripts/python.exe).Path
# Trỏ tới thư mục rỗng nếu không sử dụng bộ thư viện .test-tools cũ:
$env:AI_TEST_PYTHONPATH = (Get-Location).Path
pnpm test:all
```

Node 24+, pnpm theo `packageManager`, Chrome và Docker Desktop cần cho test browser/database. `pnpm install` cài Playwright/jsdom; cấu hình mặc định dùng Chrome đã cài, không cần tải Chromium riêng.

## Database mẫu và browser

Chỉ dùng database test `admission_test` trên `127.0.0.1:55439`. Script không đọc DATABASE_URL thật để seed. PostgreSQL chứa dữ liệu tổng hợp: 2 admin/role, ngành và chương trình, môn/tổ hợp, phương thức, điểm chuẩn 3 năm, chỉ tiêu, 3 thí sinh/hồ sơ, bảng điểm, chứng chỉ, giải thưởng, lộ trình, bài viết, tri thức chatbot và 20 câu MBTI từ bộ câu hỏi backend.

```powershell
# Chỉ cần tạo container nếu admission-sprint-tests-db chưa tồn tại:
docker run --detach --rm --name admission-sprint-tests-db -e POSTGRES_USER=admission_test -e POSTGRES_PASSWORD=admission_test_local -e POSTGRES_DB=admission_test -p 127.0.0.1:55439:5432 postgres:16-alpine
pnpm test:db:setup         # db push vào DB test + seed, không reset DB thật
pnpm test:db               # Idempotency, FK, unique, rollback trên PostgreSQL thật
pnpm test:e2e              # Build production riêng rồi chạy Chrome
# Hoặc gom cả browser vào runner:
node tests/run-all.cjs --browser
```

Seed chạy lặp lại cập nhật các ID test cố định. Test PostgreSQL kiểm tra lỗi ràng buộc rồi rollback. Database dùng password công khai dành riêng localhost; dữ liệu không phải dữ liệu thí sinh thật. Container `--rm` mất dữ liệu khi dừng; seed có thể tạo lại.

Tài khoản mẫu: `super_admin@example.invalid` và `chuyen_vien@example.invalid`, mật khẩu `SprintTest!2026`. Browser chỉ chạy `127.0.0.1:3300`, build vào `.next-tests`; không dùng cổng dev 3000 hay `.env` của database thật. Login test xác nhận JWT cookie qua Next.js thật. Screenshot/trace khi fail nằm trong `tests/artifacts/browser`, JSON tại `tests/artifacts/browser-results.json`.

Nếu chỉ sửa file test sau khi đã build, có thể đặt `$env:ADMISSION_E2E_SKIP_BUILD='1'` để chạy lại cùng build. Bỏ biến này khi sửa code ứng dụng.

## Ma trận theo yêu cầu

| Sprint | Chức năng | Test chính / giới hạn |
|---|---|---|
| 1 Next.js | Header/footer/sidebar, layout client/admin | `sprint1/layout-access.test.cjs`; Chrome kiểm tra layout thực |
| 1 Next.js | JWT login, tài khoản & phân quyền | `sprint1/auth-accounts.test.cjs`, `token.test.cjs`; Chrome login/sai mật khẩu/super-admin/chuyên viên |
| 1 Next.js | CRUD ngành, chương trình | `sprint1/crud-actions.test.cjs`; Prisma được mock; Chrome xác nhận đọc dữ liệu seed |
| 1 Hồ sơ | CRUD điểm chuẩn, quy đổi, nộp học bạ/chứng chỉ/giải thưởng, tra cứu | Backend `tests/sprint1`, `tests/integration/test_sprint1.py`, `tests/test_sprint1.py`; HTTP/JWT/SQLite, transaction rollback |
| 1 AI | MBTI, quản lý knowledge, chatbot | Backend `test_mbti_scorer.py`, `test_api_endpoints.py`, `test_regressions.py`; DB/LLM được cô lập |
| 1 Database | Thêm dữ liệu mẫu | `fixtures/seed.cjs`, `database/seed.test.cjs`; PostgreSQL thật |
| 2 Next.js | CRUD tổ hợp/phương thức/lộ trình, chỉ tiêu | `sprint2/crud.test.cjs`, `quota.test.cjs`; Chrome đọc dữ liệu quản trị |
| 2 Hồ sơ | Duyệt/từ chối/công bố; THPT, ĐGNL | Backend `tests/sprint2`, `tests/integration/test_sprint2.py`; nguồn Bộ/ĐHQG là mock provider |
| 2 AI | Kết quả nghề nghiệp, khả năng trúng tuyển, dự đoán điểm chuẩn | Backend `test_admission_predictor.py`, `test_benchmark_predictor.py`, `test_edge_cases.py`, `test_sprint3_4_workflows.py` |
| 3 Next.js | Thông tin tuyển sinh, lộ trình, tra cứu ngành/CTĐT | `sprint3/public-pages.test.cjs` và Chrome các trang công khai; chưa E2E mọi tổ hợp lọc |
| 3 Next.js | Quản lý tin tức/quy chế | Test ánh xạ DB; Chrome tạo rồi reload để kiểm tra persistence |
| 3 tích hợp hồ sơ | Nộp/tra cứu, duyệt/từ chối | `sprint3/submission-lookup.test.cjs`; `contracts/microservices.test.cjs`; trang nộp hiện ghi Prisma trực tiếp, chưa là luồng HTTP xuyên cả 3 service |
| 3 tích hợp điểm | Điểm chuẩn/quy đổi | Backend kiểm tra CRUD/công thức; Chrome kiểm tra trang quy đổi hiển thị; chưa xác nhận mọi công thức UI bằng browser |
| 3 tích hợp AI | MBTI, knowledge/chat, tư vấn | `mbti-route.test.cjs`, `mbti-scoring.test.cjs` (16 nhóm), contracts; Chrome kiểm tra tạo knowledge rồi reload |
| 3 Hồ sơ | Tra cứu kết quả và thông báo | Backend `test_sprint3_results.py`, `test_notification.py`; thông báo dùng mock sender, publisher hiện NoOp, chưa gửi email thật |
| 3 AI | Dự đoán điểm chuẩn | Cùng bộ test Sprint 2, thêm kiểm tra danh sách/chi tiết khớp nhau và scenario không sửa baseline; không đếm lặp test |
| 4 | Tổng quan, theo ngành, phương thức/tổ hợp | `sprint4/statistics-report.test.cjs`; backend `test_statistics_reports.py`, `test_sprint4_reports.py`: quyền, năm/ngày, bộ lọc, rỗng, phân trang |
| 4 | Báo cáo trúng tuyển | Kiểm tra phân biệt duyệt hồ sơ với đã công bố, cutoff theo phương thức, null điểm; Chrome tải CSV |
| 4 optional | Excel/PDF | CSV UTF-8 BOM, chống công thức, giữ số 0, quote; nút PDF gọi browser print. Không phải file XLSX hay trình dựng PDF server |
| 4 tích hợp | Hai backend | Contracts gọi app FastAPI thật bằng TestClient; mạng Docker/CORS triển khai và LLM thật chưa kiểm chứng |

Các test fail phản ánh khoảng trống của code hiện tại và được giữ nguyên để sửa tiếp. Xem `SPRINT1-4-REPORT.md` để biết kết quả chạy cuối. Không hiểu số test pass là toàn bộ nghiệp vụ/độ chính xác ML đã được chứng nhận.

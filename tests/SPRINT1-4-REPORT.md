# Kết quả kiểm thử Sprint 1–4 — 18/10/2026

## Cập nhật tích hợp cuối — 19/10/2026

Đã nối Next.js với hai FastAPI thật qua HTTP; chỉ sửa Next.js và backend điểm, giữ nguyên source backend AI. Phân vai: **duyệt hồ sơ dành cho admin**, **so sánh chương trình dành cho thí sinh/công khai**.

Kết quả mới: **Next.js 229 pass; backend điểm 254 pass; backend AI 194 pass/2 fail; contracts 5 pass; PostgreSQL 3 pass; Chrome 24 pass. Tổng 709 pass, 2 fail, 0 skip. TypeScript và production build pass.** Hai lỗi AI vẫn là điểm -1/11; không đổi assertion hoặc sửa code AI.

Chrome đã kiểm chứng upload/nộp/duyệt/tra cứu, refresh access token admin, so sánh công khai, MBTI lấy kết quả đã lưu sau reload, chatbot và dự báo. Test chạy với PostgreSQL riêng, FastAPI thật; LLM và cloud Storage được thay bằng fixture cục bộ. Chưa migrate Supabase thật hoặc cấu hình bucket thật.

Chi tiết chức năng, URL, yêu cầu cấu hình và migration mới: [NEXTJS-INTEGRATION-STATUS.md](../../docs/supabase-audit/NEXTJS-INTEGRATION-STATUS.md). Các mục ngày 18/10 và bản sửa đầu ngày 19/10 bên dưới được giữ làm lịch sử, không phải số liệu mới nhất.

## Cập nhật sửa lỗi — 19/10/2026

Theo yêu cầu giữ nguyên backend AI: đã sửa **6/8 case fail** ở Next.js và adapter tích hợp. Hai case AI-01 (-1 và 11) vẫn fail đúng như trước; không sửa code backend AI và không đổi assertion để chấp nhận điểm sai.

| Bộ test chạy lại | Pass | Fail | Skip |
|---|---:|---:|---:|
| Next.js unit/action/component/DOM, gồm 8 regression mới | 227 | 0 | 0 |
| Backend xử lý hồ sơ & điểm | 251 | 0 | 0 |
| Backend AI/ML/MBTI, giữ nguyên code | 194 | 2 | 0 |
| Hợp đồng Next.js ↔ FastAPI | 5 | 0 | 0 |
| PostgreSQL: seed, FK, unique, rollback | 3 | 0 | 0 |
| Chrome trên production build Next.js | 17 | 0 | 0 |
| **Tổng sau sửa** | **697** | **2** | **0** |

TypeScript và production build: **PASS**. Runner `node tests/run-all.cjs --database` vẫn trả exit code 1 vì hai lỗi backend AI nằm ngoài phạm vi sửa; Chrome được chạy riêng bằng `pnpm test:e2e`.

- **INT-01:** UI gửi nguyên điểm Likert 1–5, bỏ chuyển đổi mất thông tin sang A/B; adapter dùng kiểu số đúng schema backend.
- **INT-02:** adapter nhận điểm từng môn `academic_scores`, chương trình `target_major_code` và các trường ưu tiên đúng schema; ánh xạ kết quả backend sang dữ liệu frontend. Không suy diễn điểm từng môn từ tổng điểm. Test hợp đồng dùng điểm từng môn thật; assertion vẫn yêu cầu API trả 200 và có kết quả.
- **INT-03/04:** adapter không báo thành công khi HTTP lỗi hoặc mất kết nối; nhận bearer token. Server actions mới lấy cookie HttpOnly và kiểm tra admin trước khi gọi service. Hai bên cần cấu hình cùng khóa JWT; chưa kiểm chứng một phiên đăng nhập Next.js qua hai container thật.
- **UI-01/02:** thêm server actions có kiểm tra quyền và validation để lưu/sửa/xóa bài viết, tri thức bằng Prisma; UI chỉ cập nhật sau DB thành công. Loại bỏ bản ghi fallback không tồn tại khỏi hai trang quản trị. Chrome xác nhận tạo mới còn dữ liệu sau reload.
- Tri thức được yêu cầu đồng bộ qua endpoint AI hiện có sau khi lưu/xóa. Nếu AI không hoạt động, dữ liệu vẫn được lưu và UI cảnh báo chưa đồng bộ; không coi test persistence là bằng chứng đã cập nhật RAG thật.
- Tám regression mới kiểm tra quyền, validation, create/update/delete, lỗi DB, lỗi đồng bộ và bearer token/HTTP/network failure. Lần Chrome đầu sau sửa vướng selector trùng tên tab và dòng tri thức; đã thu hẹp selector vào bảng và chạy lại toàn bộ 17 test thành công.

Giới hạn: không thêm chức năng upload PDF hay cột riêng lưu tóm tắt/tên tệp bài viết; schema hiện tại lưu tiêu đề, nội dung, chuyên mục, tác giả và ngày xuất bản. CRUD chạy trên PostgreSQL test riêng; không ghi dữ liệu thử vào Supabase thật. Chưa commit/push.

Log mới: `tests/artifacts/frontend.log`, `score.log`, `ai.log`, `contracts.log`, `typecheck.log`, `database.log`; Chrome: `tests/artifacts/browser-results.json`. Bảng và phần lỗi bên dưới giữ lại làm baseline ngày 18/10 để đối chiếu.

## Kết quả baseline — 18/10/2026

| Bộ test | Pass | Fail | Skip |
|---|---:|---:|---:|
| Next.js unit/action/component/DOM | 219 | 0 | 0 |
| Backend xử lý hồ sơ & điểm | 251 | 0 | 0 |
| Backend AI/ML/MBTI | 194 | 2 | 0 |
| Hợp đồng Next.js ↔ FastAPI | 1 | 4 | 0 |
| PostgreSQL: seed, FK, unique, rollback | 3 | 0 | 0 |
| Chrome trên production build Next.js | 15 | 2 | 0 |
| **Tổng** | **683** | **8** | **0** |

TypeScript `tsc --noEmit --incremental false`: **PASS**. Production build dùng cho Chrome: **PASS**. Không sửa assertion để chấp nhận lỗi nghiệp vụ và không dùng skip/xfail cho 8 case fail.

Code được kiểm tra:

- Frontend: `work/admission-updates`, nền `41a40a4e` từ `origin/fix/frontend-statistics-reports`, cộng thay đổi test và sửa import layout. Đã khôi phục thay đổi schema có sẵn của người dùng sau cập nhật; stash `preserve local schema before sprint1-4 tests` vẫn giữ làm bản lưu.
- Hồ sơ/điểm: `work/backend-latest`, nền `7ed1adf` từ `origin/feature/admission-statistics-reports`.
- AI: `backend_ai_ml_latest`, nhánh `work/backend-latest`, nền `3c48775` từ `origin/main`. Repo `backend_ai_ml` cũ vẫn là bản đang merge dở.

## Các lỗi tái hiện được

| Mã | Case fail | Kết quả thực tế | Vị trí cần xử lý |
|---|---|---|---|
| AI-01 | Điểm môn -1 và 11 (2 case) | API dự đoán trả HTTP 200, chưa từ chối điểm ngoài 0–10 | `backend_ai_ml_latest/src/schemas/prediction_schema.py`, `academic_scores` |
| INT-01 | Gửi MBTI từ adapter frontend | UI gửi A/B; backend nhận thang số 1–5 → HTTP 422 | `libs/api-services/aiService.ts`, `MBTITestClient.tsx`, schema MBTI backend |
| INT-02 | Dự đoán khả năng trúng tuyển từ adapter | Frontend gửi `ma_chuong_trinh`, `ma_to_hop`, `diem_xet_tuyen`; backend cần `academic_scores`, `target_major_code` → HTTP 422 | `libs/api-services/aiService.ts`, schema prediction backend |
| INT-03 | Duyệt hồ sơ | Request không có xác thực → backend 401; adapter vẫn trả `success: true` | `libs/api-services/scoreService.ts`, `duyetHoSo` |
| INT-04 | Từ chối hồ sơ | Request không có xác thực → backend 401; adapter vẫn trả `success: true` | `libs/api-services/scoreService.ts`, `tuChoiHoSo` |
| UI-01 | Tạo tin tức/đề án rồi reload | Bản ghi xuất hiện trước reload nhưng biến mất sau reload; handler chỉ cập nhật React state | `app/admin/(dashboard)/tin-tuc-de-an/TinTucDeAnClient.tsx` |
| UI-02 | Tạo tri thức chatbot rồi reload | Bản ghi xuất hiện trước reload nhưng biến mất sau reload; handler chỉ cập nhật React state | `app/admin/(dashboard)/du-lieu-chatbot-ai/ChatbotKbClient.tsx` |

8 case thuộc 7 dòng lỗi do AI-01 có hai giá trị biên. Test contracts chạy adapter TS thật và app FastAPI thật bằng TestClient; kiểm tra bridge thực sự trả response, tránh nhầm lỗi khởi chạy Python với lỗi API.

## Những phần đã xác nhận

- Bộ Sprint 1–2 cũ được giữ và chạy cùng các test mới. Mock layout cập nhật cho `AdminShell`; API key AI test được cấu hình xác định để các case ghi knowledge kiểm tra xác thực thật.
- Test mới bao phủ nộp/tra cứu, route lưu MBTI, 16 nhóm MBTI phía client, timeline/news/knowledge/tư vấn đọc DB, thống kê và báo cáo, xuất CSV/in PDF, kết quả xét tuyển, thông báo bằng sender giả, các workflow AI và hợp đồng hai service.
- Chrome kiểm tra đăng nhập, sai mật khẩu, JWT cookie, quyền chuyên viên, 10 trang công khai, các trang admin đọc dữ liệu seed và tải CSV có BOM/CCCD giữ số 0.
- PostgreSQL thật đã nhận dữ liệu mẫu; seed lặp lại không nhân đôi các ID mẫu. Kiểm tra FK sai, trùng chỉ tiêu chương trình/năm và rollback đều pass.
- Đã sửa import `Header/Footer` thành đúng tên file `header/footer`; lỗi TypeScript do chữ hoa–thường đã hết.
- Lần đầu dùng Next dev xuất hiện lỗi router và test selector; đã chuyển sang production build riêng, sửa selector và xác nhận lại. Các lỗi dev cũ không được tính vào bảng kết quả cuối.

## Dữ liệu mẫu và chạy lại

Database test: `127.0.0.1:55439/admission_test`, container `admission-sprint-tests-db`. Dữ liệu tổng hợp gồm tài khoản/role, ngành/CTĐT, môn/tổ hợp, phương thức, điểm chuẩn 3 năm, chỉ tiêu, thí sinh/hồ sơ/bảng điểm/chứng chỉ/giải thưởng, timeline, bài viết, tri thức và 20 câu MBTI. Không seed vào database trong `.env` hiện tại.

Từ `frontend_admission`:

```powershell
pnpm test:all                         # Ba repo + contracts + TypeScript
pnpm test:db                          # PostgreSQL test đã được setup
pnpm test:e2e                         # Build riêng + Chrome
# Hoặc chạy tất cả trong một runner, sau khi test:db:setup:
node tests/run-all.cjs --browser
```

Chi tiết cài đặt, tài khoản mẫu và ma trận chức năng: [README.md](README.md).

Log cuối: `tests/artifacts/frontend.log`, `score.log`, `ai.log`, `contracts.log`, `typecheck.log`, `browser.log`; JUnit: `score.xml`, `ai.xml`; Chrome: `browser-results.json` và screenshot/trace trong `browser/`. `summary.json` ghi kết quả lần chạy runner; lần chạy mặc định chỉ gồm năm suite không cần Docker/Chrome.

## Phạm vi chưa được chứng minh

- CRUD Next.js chủ yếu kiểm tra action/service với Prisma mock; chưa chạy browser cho mọi thao tác tạo/sửa/xóa và mọi bộ lọc. Ma trận README ghi rõ cấp kiểm thử từng yêu cầu.
- Test hồ sơ chạy HTTP/JWT/repository/transaction trên SQLite; test PostgreSQL riêng kiểm chứng seed và ràng buộc, chưa thay thế toàn bộ suite bằng PostgreSQL.
- Nguồn điểm Bộ GD&ĐT/ĐHQG dùng provider mô phỏng. LLM và SMTP thật không được gọi. Công bố kết quả hiện dùng NoOp publisher; test NotificationService pass không có nghĩa hệ thống đã gửi email cho thí sinh.
- Một số trang Next.js ghi Prisma trực tiếp hoặc dùng fallback/local state; chưa có một luồng E2E chạy xuyên Next.js và hai container backend qua mạng thật. Contract tests phát hiện các sai lệch đã nêu.
- Export hiện là CSV cho Excel và browser print cho PDF, chưa có XLSX/PDF server.
- AI runtime có cảnh báo model sklearn được lưu bằng 1.7.2 nhưng môi trường đang dùng 1.9.0; test chức năng không xác nhận độ chính xác dự đoán trên tập kiểm chứng.

Chưa commit/push các thay đổi. Schema và file backup của người dùng được giữ lại.

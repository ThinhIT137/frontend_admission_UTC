# Kết quả chạy lại Sprint 1–2 — 09/10/2026

| Repo | Sprint 1 | Sprint 2 | Tổng |
|---|---:|---:|---:|
| frontend_admission | 122 pass | 52 pass | 174 pass |
| backend_application_score | 125 pass | 53 pass | 178 pass |
| backend_ai_ml | 74 pass | 107 pass | 181 pass |

**533 pass, 0 fail.** TypeScript frontend cũng pass. Không kiểm tra Sprint 3.

## Lệnh chạy

Tại frontend_admission:

```powershell
node --test --test-isolation=none --test-reporter=tap tests/sprint1/*.test.cjs tests/sprint2/*.test.cjs
node node_modules/typescript/bin/tsc --noEmit --incremental false
```

Tại backend_application_score:

```powershell
Remove-Item Env:PYTHONPATH -ErrorAction SilentlyContinue
$env:PYTEST_DISABLE_PLUGIN_AUTOLOAD='1'
& ./.venv/Scripts/python.exe -B -m pytest -p no:cacheprovider tests/sprint1 tests/sprint2 tests/integration -q
```

Tại backend_ai_ml, với môi trường test hiện có:

```powershell
$env:PYTHONPATH='D:/Project/project_1/frontend_admission/.test-tools'
$env:PYTEST_DISABLE_PLUGIN_AUTOLOAD='1'
python -B -m pytest --import-mode=importlib -p no:cacheprovider tests/sprint1 tests/sprint2 -q
```

## Điều chỉnh để chạy sau pull/merge

Repo AI/ML đang merge dở với hai file conflict: tests/conftest.py và tests/sprint1/test_api_endpoints.py. Đã gỡ marker, giữ test mới chặn ghi knowledge khi thiếu xác thực, loại fixture trùng và đặt INTERNAL_API_KEY dành riêng cho test trước khi import app. Không sửa source nghiệp vụ trong lần chạy lại này. Chưa stage/commit phần giải quyết conflict; Git vẫn cần hoàn tất merge. File tests/test_regressions.py ở gốc tests do merge đưa vào trùng các regression thuộc Sprint 1, không chạy thêm file đó để tăng số lượng.

Lỗi cũ POST /api/chat/knowledge không xác thực nhận 201 nay đã pass với kỳ vọng 401/403. Đây là test trong cấu hình API key xác định; source hiện vẫn chấp nhận token bất kỳ nếu INTERNAL_API_KEY không được cấu hình, nên không kết luận mọi cấu hình triển khai đều bảo đảm phân quyền.

## Phạm vi và giới hạn

- Frontend: logic service/action, JWT thật trong token suite, layout và quyền; persistence/dependency ngoài được mock. Chưa chạy browser hoặc HTTP tích hợp ba repo.
- Xử lý điểm: test service và HTTP/JWT/repository/transaction bằng SQLite; THPT/ĐGNL dùng nguồn mô phỏng theo yêu cầu. Chưa kiểm chứng PostgreSQL triển khai, Docker, upload file hoặc công thức cộng điểm chứng chỉ/giải thưởng.
- AI/ML: test MBTI, knowledge/chatbot, tư vấn và dự đoán; DB/LLM ngoài được cô lập. Còn cảnh báo model sklearn lưu bằng 1.7.2 nhưng runtime dùng 1.9.0; chưa chứng minh độ chính xác dự đoán trên tập kiểm chứng.
- Chưa kiểm tra dữ liệu mẫu trong DB thật; fixture/dữ liệu mô phỏng của test không thay thế xác nhận seed đã được nạp.

Test pass xác nhận bộ case đã chạy, không xác nhận toàn bộ yêu cầu hoặc môi trường triển khai đã hoàn tất.

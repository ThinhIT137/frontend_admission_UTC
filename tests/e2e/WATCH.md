# Bot duyệt ứng dụng V2 — 21/10/2026

**Tương thích host:** ca **HOST01** gửi Origin thật tại `http://127.0.0.1:<cổng>`, phải đến bước kiểm tra dữ liệu (400), thay vì bị chặn nhầm 403. Ứng dụng đã bổ sung kiểm tra bí danh loopback cùng Host/cổng/giao thức; vẫn từ chối Origin ngoài ứng dụng. Không giả Origin hoặc đổi assertion để bỏ qua lỗi.

**Mặc định hiện có 51 ca:** 42 ca thao tác/đọc UI và API thật (2 ca công bố có thể chưa kiểm tra thành công nếu ngoài lịch thật), 9 mục “CHƯA KIỂM TRA” có lý do. Danh sách có thể tăng khi bổ sung kịch bản. Số ca không đồng nghĩa mọi chức năng đã kiểm chứng đầy đủ.

- `pnpm test:watch`: Supabase thật + API backend đã triển khai theo `.env`, Chrome hiển thị chậm. Chỉ kiểm tra health AI, không chạy nghiệp vụ AI hoặc Storage/LLM giả lập.
- `pnpm test:watch -- --list`: chỉ liệt kê, không khởi động web/DB và không ghi đè báo cáo/log cũ.
- `pnpm test:watch:local`: suite local cũ có AI/Storage giả lập; không dùng làm bằng chứng cloud/AI thật.
- Đọc [CHUC-NANG-UNG-DUNG-V2.md](../../../docs/CHUC-NANG-UNG-DUNG-V2.md) để biết chức năng nào đã có, API-only hay còn thiếu.

Bot đọc mỗi trang công khai/admin thành ca riêng; nhập search/compare, học bạ/chứng chỉ/giải; đăng ký/đăng nhập/logout; đổi/rút nguyện vọng; thử access token 5 giây; duyệt/chốt/công bố đúng chương trình fixture; tải CSV; CRUD tin nháp và điểm chuẩn thật. **CRUD03** tạo chỉ tiêu qua UI → server action → backend điểm, sửa hai lần sau reload để kiểm tra ID điểm mới, đối soát API/Supabase rồi xóa. **Không đồng nghĩa đã CRUD hết danh mục**: từng giới hạn hiển thị ngay trong báo cáo. Công bố theo chương trình đã có màn hình; ca workflow cũ vẫn dùng API để kiểm tra lịch công bố. Nộp nhiều kỳ dùng API và form được kiểm tra riêng. Không gửi OTP/email thật, không upload cloud khi chưa xác minh cấu hình. Backend AI không được khởi động hoặc kiểm thử thật.

Kết quả: `tests/artifacts/KET-QUA-BOT.md`, `ket-qua-bot.json`, `watch-report/index.html`, `BOT-CHAY.log`, `watch-logs/`; ảnh/trace/console ở link từng ca. Lỗi build/start và lỗi dọn dữ liệu ghi cuối báo cáo, không để kết luận ĐẠT của lượt cũ. Ước lượng 15–40 phút có build/mạng; xem từng thao tác tiếng Việt trên màn hình.

Để kiểm chứng nhanh không mở cửa sổ:

```powershell
$env:ADMISSION_LIVE_HEADLESS='1'
$env:ADMISSION_WATCH_FAST='1'
pnpm test:watch
```

Xóa hai biến này để xem chậm lại. Nếu cổng 3300 đang bận, dùng `$env:ADMISSION_WATCH_PORT='3301'`; không cần tắt nhầm web đang sử dụng. Mỗi ca ghi manifest riêng; wrapper ghi đăng ký lượt con trước khi tạo và dọn cả lượt khi Ctrl+C. Nếu tắt cứng terminal/máy, xem `live-data/<run>-children.json`, rồi chạy `pnpm test:watch:cleanup -- <run-con>` cho từng manifest chưa `cleaned=true`. Không xóa dữ liệu người dùng hoặc dùng lệnh DELETE theo tiền tố.

---

## Hướng dẫn cũ (tham khảo chế độ local)
# Bot kiểm thử có cửa sổ Chrome

## Mặc định hiện tại: API triển khai + Supabase thật

`pnpm test:watch` chạy suite live riêng. Chỉ dùng **một file cấu hình: `frontend_admission/.env`**.

Với `ADMISSION_WATCH_REMOTE_BACKENDS=1`, runner giữ `API_APPLICATION_SCORE` và `API_AI_ML` trong `.env`, không khởi động Python/backend điểm local và không thay AI bằng cổng giả. Runner GET `/health` của cả hai API, chờ tối đa 90 giây mỗi API cho Render khởi động, rồi build Next.js mới ở cổng 3300. Không gọi chatbot/LLM; các ca AI vẫn ghi **chưa kiểm tra**. Health đạt không chứng minh xác thực hoặc nghiệp vụ AI đạt.

`API_APPLICATION_SCORE=https://backend-application-score-3bfu.onrender.com`; `API_AI_ML=https://backend-ai-ml.onrender.com`. `AI_INTERNAL_API_KEY` cần khớp `INTERNAL_API_KEY` trên Render backend AI: thêm khóa trực tiếp vào `.env`, không đưa vào chat/log hoặc `NEXT_PUBLIC_*`. JWT của Next.js phải khớp backend điểm. Runner không sửa biến môi trường trên Render; nếu deployment dùng database/JWT khác, các ca tích hợp sẽ báo lỗi thật.

Frontend `.env` đã có khóa nội bộ riêng: sao chép giá trị `AI_INTERNAL_API_KEY` trực tiếp sang biến `INTERNAL_API_KEY` của dịch vụ AI trên Render, rồi triển khai lại dịch vụ đó. `NVIDIA_API_KEY` là khóa gọi nhà cung cấp LLM, không thay thế khóa nội bộ giữa Next.js và AI. Khi chưa cấu hình cùng giá trị ở Render, chưa thể xác nhận API AI cần xác thực hoạt động; GET health không kiểm tra việc này. Không đưa các giá trị khóa vào tài liệu hoặc báo cáo bot.

Đổi `ADMISSION_WATCH_REMOTE_BACKENDS=0` để dùng chế độ điểm local cổng 8100 (tự mở khi chưa chạy), AI bị tắt trong chế độ này. Database vẫn là database trong `.env`. Luôn build trước khi chạy; cờ bỏ qua build cũ không còn hiệu lực.

Prisma giữ `schema.prisma` làm nguồn chính và `schema.rollback.prisma` làm bản lưu trước lượt dọn này. Không dùng bản rollback để tự chạy migration; toàn bộ migration và SQL rollback vẫn được giữ.

Case live hiện kiểm tra: đăng ký thí sinh qua UI, nộp hồ sơ/bảng điểm thật, admin duyệt và thí sinh xem trạng thái; tạo/đọc/sửa/xóa chỉ tiêu–điểm chuẩn qua API backend điểm, đối chiếu dữ liệu Supabase. Chỉ tiêu sửa từ 1 lên 2 rồi xóa, đọc lại API phải rỗng. Bản ghi mới mang mã `BOTLIVE-<mã-lượt>`, chỉ phục vụ test.

Kết thúc case luôn dọn fixture riêng của lượt: tài khoản admin/thí sinh test, chương trình test, hồ sơ, bảng điểm và điểm chuẩn liên quan. Xóa qua API được kiểm tra ở luồng điểm chuẩn; xóa fixture hồ sơ/tài khoản là bước dọn DB của test, không coi là đã có API xóa hồ sơ cho người dùng. Không sửa/xóa bản ghi có sẵn của người dùng. Không gửi email, upload Storage hoặc công bố kết quả thật trong suite này.

Manifest ở `tests/artifacts/live-data/<mã-lượt>.json` chứa ID fixture và trạng thái dọn, không chứa password/token. Sau khi dọn, báo cáo ghi xác nhận **còn 0 bản ghi fixture**. Runner thử dọn lại khi test kết thúc/lỗi/Ctrl+C. Nếu máy mất điện hoặc tiến trình bị kill cưỡng bức toàn bộ, log/manifest giúp khôi phục; không thể bảo đảm chạy cleanup khi hệ điều hành đã dừng tiến trình.

Nếu cần khôi phục sau khi máy bị tắt cưỡng bức, dùng đúng mã lượt trong manifest:

```powershell
pnpm test:watch:cleanup -- <mã-lượt>
```

Lệnh chỉ xử lý ID đã ghi trong manifest và kiểm tra tên chủ sở hữu của fixture trước khi xóa; không quét/xóa theo tiền tố trên toàn database.

Giữ bộ cũ chạy DB local bằng:

```powershell
pnpm test:watch:local
```

Các hướng dẫn 28 case/MBTI/refresh bên dưới áp dụng cho `test:watch:local`, không phải kiểm thử Supabase thật.

Chạy từ `frontend_admission`:

```powershell
pnpm test:watch
```

Bot chạy tuần tự, mỗi thao tác chậm 800 ms, dừng 3,5 giây cuối mỗi case. Thanh xanh dưới cửa sổ cho biết case đang chạy. Dừng bằng Ctrl+C ở terminal.

Bot cuộn từng trang từ trên xuống (tối đa 12 lần cuộn để tránh trang dài vô hạn), rồi quay về đầu trang. Trước mỗi thao tác, bot cuộn tới trường cần nhập/chọn và ghi mô tả tiếng Việt. Luồng hồ sơ đăng ký qua UI, điền thông tin cá nhân, điểm, khu vực/đối tượng ưu tiên và tải các file minh chứng trên form. Một hồ sơ đầu được chuẩn bị qua API để kiểm tra duyệt/tra cứu độc lập.

## File kết quả

- `tests/artifacts/KET-QUA-BOT.md`: báo cáo tiếng Việt gồm từng chức năng, đạt/lỗi, thời gian, phạm vi và lỗi chi tiết; cập nhật sau mỗi case.
- `tests/artifacts/ket-qua-bot.json`: dữ liệu kết quả cho công cụ đọc tự động.
- `tests/artifacts/BOT-CHAY.log`: log mới nhất, ghi ngay từ khởi động/build đến khi kết thúc; gồm bước bot và lỗi server/test.
- `tests/artifacts/watch-logs/bot-<thời-gian>-<pid>.log`: log riêng cho từng lượt, giữ lại khi chạy lượt mới. Mỗi dòng có thời gian và nguồn stdout/stderr; stderr có thể chỉ là cảnh báo, không đồng nghĩa case fail.
- `tests/artifacts/watch-report/index.html`: báo cáo tương tác; mở bằng `pnpm exec playwright show-report tests/artifacts/watch-report`.

Chạy `--list` chỉ liệt kê kịch bản, không chứng minh chức năng đã đạt. Các trang kiểm tra hiển thị được ghi rõ, không coi là đã thử mọi thao tác CRUD.

Log vẫn được ghi khi build lỗi, trùng cổng hoặc dừng bằng Ctrl+C. Các tham số `--grep` vẫn dùng như trước. JWT, bearer token và mật khẩu trong URL PostgreSQL được che trong file log; bot không ghi giá trị mật khẩu ở các bước nhập form. Không chạy hai lượt cùng lúc vì file log mới nhất và báo cáo tổng hợp dùng chung đường dẫn.

Chỉ xem MBTI:

```powershell
pnpm test:watch:local --grep "MBTI submits"
```

Chỉ xem luồng trạng thái mới Sprint 6 (hai case đỗ và trượt):

```powershell
pnpm test:watch:local --grep "Sprint 6:"
```

Kiểm tra access token hết hạn thật sau **5 giây**, tự refresh cho admin/thí sinh và logout xóa cookie:

```powershell
pnpm test:watch:local --grep "Phiên"
```

Chỉ cookie JWT do test tạo được rút hạn; không đổi thời hạn token ứng dụng hoặc `.env`. Cookie test còn tồn tại sau khi JWT hết hạn để kiểm tra việc xác minh JWT và refresh thực sự. Test xác nhận token mới có chữ ký đúng/hạn mới, API thành công và dữ liệu vẫn hiển thị. Logout xóa cả hai cookie, API cá nhân sau đó trả 401. Cơ chế refresh hiện stateless; không kiểm tra thu hồi token cũ trên server.

Bộ hiện tại có **28 case**. Hai case Sprint 6 đã bổ sung trang **Nguyện vọng của tôi**, kiểm tra trước/sau công bố và logout xóa danh sách. Case chatbot hỏi **4 câu**, kiểm tra 4 response API và số câu trả lời tăng đúng từng lần; không yêu cầu câu trả lời giả lập cố định chỉ xuất hiện một lần. LLM vẫn giả lập, không đánh giá nội dung tư vấn thật.

Đã thêm 2 case vào bộ hiện có, tổng **26 case**. Bot chuẩn bị tài khoản/hồ sơ/chỉ tiêu riêng bằng API và DB local; sau đó thao tác giao diện admin: chờ → hợp lệ → bắt đầu xét tuyển → nhập căn cứ/điểm đối soát → chốt đỗ/trượt → reload. Bot kiểm tra thí sinh chưa thấy kết quả trước công bố, công bố qua API admin giới hạn đúng chương trình test, rồi tra cứu lại và kiểm tra không cho chuyển ngược. Công bố hiện được test qua API, chưa phải bấm nút công bố trên màn hình admin.

Dùng database PostgreSQL local `admission_test`, hai backend test thật và Next.js cổng 3300. Storage và LLM dùng fixture local; không gửi email thật. Cần Docker database test đang chạy và đã setup bằng `pnpm test:db:setup`. Runner tự build bản Next.js riêng; không dùng server dev cổng 3000.

Phạm vi gồm 24 case hiện có: auth/quyền, các trang công khai, trang quản trị, tạo tin/tri thức và reload, tải CSV, upload/nộp/duyệt/tra cứu hồ sơ, refresh token, so sánh chương trình, MBTI, chatbot, dự đoán và chặn API ngoài phạm vi. Không đồng nghĩa mọi CRUD và workflow mới đang làm dở đều đã được nghiệm thu. Case chỉ gọi API có thể không có thao tác để xem trên màn hình.

Screenshot/trace: `tests/artifacts/watch`. Các lỗi vẫn được ghi fail; bot tiếp tục case sau. Đường dẫn báo cáo HTML được Playwright in ở cuối lần chạy.

Quay video mặc định tắt để bot chạy được khi máy chưa có FFmpeg. Nếu muốn quay, cài `pnpm exec playwright install ffmpeg`, rồi đặt `$env:ADMISSION_WATCH_VIDEO='1'` trước khi chạy bot.





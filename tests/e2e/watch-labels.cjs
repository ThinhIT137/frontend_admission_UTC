const labels = {
  'S1 guest cannot open admin; login creates JWT cookies': 'Khách bị chặn vào quản trị; đăng nhập và kiểm tra phiên JWT',
  'S1 wrong password remains on login': 'Nhập sai mật khẩu và kiểm tra thông báo lỗi',
  'S1 specialist cannot manage accounts or roles': 'Kiểm tra chuyên viên không được quản lý tài khoản và phân quyền',
  'S1-S4 admin pages display seeded records': 'Mở từng trang quản trị và kiểm tra dữ liệu mẫu',
  'S4 report CSV downloads seeded data and preserves candidate identifiers': 'Tải báo cáo CSV và kiểm tra giữ số 0 đầu CCCD',
  'S3 news create must survive page reload': 'Tạo tin tức rồi tải lại trang để kiểm tra dữ liệu đã lưu',
  'S3 chatbot knowledge create must survive page reload': 'Thêm tri thức chatbot rồi tải lại trang để kiểm tra đã lưu',
  'Candidate uploads evidence, submits through score API, admin reviews and candidate sees actual status': 'Thí sinh tải minh chứng, nộp hồ sơ; admin duyệt; thí sinh tra cứu trạng thái',
  'Admin API refreshes expired access token using HttpOnly refresh cookie': 'Kiểm tra tự làm mới phiên đăng nhập admin khi token hết hạn',
  'Public program comparison uses database histories and needs no admin login': 'Thí sinh so sánh chương trình và lịch sử điểm chuẩn',
  'MBTI submits numerical answers to AI and retrieves persisted result after reload': 'Làm 20 câu MBTI, xem kết quả và tải lại để kiểm tra đã lưu',
  'Chatbot renders the AI answer rather than treating the response as offline': 'Gửi câu hỏi và kiểm tra câu trả lời chatbot',
  'Prediction page calls existing AI API and rejects out-of-range scores at UI boundary': 'Nhập điểm và xem dự đoán khả năng trúng tuyển',
  'Proxy denies unknown endpoints and empty bulk result lookup': 'Kiểm tra chặn API không được phép và tra cứu thiếu mã hồ sơ',
};
function vietnamese(title) {
  return labels[title] || title.replace('S3 public page and layout render ', 'Mở trang công khai, kiểm tra đầu trang và chân trang: ');
}


module.exports = { vietnamese };

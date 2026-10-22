// Danh mục dùng chung cho bot và báo cáo: mở trang không đồng nghĩa đã kiểm tra CRUD.
const publicPages = [
  ['TS01','Trang chủ','/'], ['TS02','Thông tin tuyển sinh','/thong-tin-tuyen-sinh'],
  ['TS03','Tra cứu ngành học','/tra-cuu-nganh-hoc'], ['TS04','So sánh chương trình','/so-sanh-chuong-trinh'],
  ['TS05','Lộ trình tuyển sinh','/lo-trinh-tuyen-sinh'], ['TS06','Nộp hồ sơ','/nop-ho-so'],
  ['TS07','Nguyện vọng của tôi','/nguyen-vong-cua-toi'], ['TS08','Tra cứu hồ sơ','/tra-cuu-ho-so'],
  ['TS09','Quy đổi điểm','/tinh-diem-quy-doi'],
];
const adminPages = [
  ['AD01','Tổng quan',''], ['AD02','Tài khoản','/accounts'], ['AD03','Vai trò','/roles'],
  ['AD04','Hồ sơ cá nhân','/profile'], ['AD05','Khối ngành','/quan-ly-khoi-nganh'],
  ['AD06','Ngành học','/quan-ly-nganh-hoc'], ['AD07','Chương trình','/quan-ly-ctdt'],
  ['AD08','Môn xét tuyển','/mon-xet-tuyen'], ['AD09','Tổ hợp','/to-hop-mon'],
  ['AD10','Phương thức','/phuong-thuc-xet-tuyen'], ['AD11','Chỉ tiêu / điểm chuẩn','/chi-tieu-diem-chuan'],
  ['AD12','Mốc thời gian','/moc-thoi-gian'], ['AD13','Tin tức','/tin-tuc-de-an'],
  ['AD14','Hồ sơ thí sinh','/ho-so'], ['AD15','Thống kê','/thong-ke'], ['AD16','Báo cáo','/bao-cao-trung-tuyen'],
].map(([id,name,route])=>[id,name,'/admin'+route]);
const gaps = [
  ['AI01','MBTI, tư vấn, chatbot, dự báo và quản trị tri thức','Không chạy backend AI theo yêu cầu; không dùng câu trả lời giả để đánh dấu đạt.'],
  ['OP01','Gửi / nhận OTP email và SMS','Chỉ kiểm tra form kích hoạt; không gửi tin thật hoặc kích hoạt CCCD của người khác.'],
  ['OP02','Upload, đọc và thay minh chứng cloud','Chưa kiểm chứng khóa Storage server và bucket riêng tư thật; bot không tạo đường dẫn file giả.'],
  ['OP03','Gửi email kết quả / outbox','Không gọi worker gửi thông báo cho cả năm; chưa có tài khoản nhận thử được duyệt.'],
  ['OP04','Nhập / đồng bộ điểm THPT, ĐGNL','Đã có màn hình kiểm tra/lưu CSV THPT; lượt bot này chưa ghi điểm CSV hoặc kiểm chứng nguồn THPT/ĐGNL chính thức. Unit kiểm tra xác nhận, hủy và dữ liệu cũ.'],
  ['CRUD01','CRUD tài khoản, vai trò, khối/ngành, môn, tổ hợp, phương thức, lộ trình','Lượt này kiểm tra trang đọc và phân quyền; chưa tự động tạo/sửa/xóa toàn bộ danh mục trên DB dùng chung.'],
  ['CRUD02','CRUD chương trình và chỉnh hồ sơ cá nhân admin','Mở trang đọc; fixture chương trình do setup tạo, chưa chứng minh CRUD qua UI.'],
  ['FORM01','Nộp đầy đủ chứng chỉ/giải thưởng qua UI và lưu file cloud','Có nhập form nhiều kỳ/metadata; chưa gửi chứng chỉ/giải thưởng không có minh chứng thật.'],
  ['OTHER01','Quên mật khẩu, bổ sung hồ sơ nhiều vòng, nhập học, engine tự động, XLSX/PDF server','Còn backlog, không coi là chức năng đã kiểm thử đạt.'],
];
module.exports={publicPages,adminPages,gaps};

import { BookOpenCheck, ExternalLink, Landmark, ShieldCheck } from "lucide-react";
import type { ReactNode } from "react";

const notice = "https://www.utc.edu.vn/thong-bao-tuyen-sinh-dai-hoc-he-chinh-quy-nam-2026";
const history = "https://www.utc.edu.vn/gioi-thieu/lich-su-hinh-thanh";
const strategy = "https://www.utc.edu.vn/gioi-thieu/chien-luoc-phat-trien";
const page1 = "https://www.utc.edu.vn/upload/images/TB%201258%20tuy%E1%BB%83n%20sinh%20%C4%90HCQ%202026_page-0001.jpg";
const page2 = "https://www.utc.edu.vn/upload/images/TB%201258%20tuy%E1%BB%83n%20sinh%20%C4%90HCQ%202026_page-0002.jpg";
const page3 = "https://www.utc.edu.vn/upload/images/TB%201258%20tuy%E1%BB%83n%20sinh%20%C4%90HCQ%202026_page-0003.jpg";
const admission2026 = "https://tuyensinh.utc.edu.vn/?q=tin-tuyen-sinh/th%C3%B4ng-tin-tuy%E1%BB%83n-sinh-%C4%91%E1%BA%A1i-h%E1%BB%8Dc-h%E1%BB%87-ch%C3%ADnh-quy-2026";
const tuition2026 = "https://tuyensinh.utc.edu.vn/sites/ts.utc.edu.vn/files/333_compressed-3.pdf";
const directAdmission = "https://tuyensinh.utc.edu.vn/sites/ts.utc.edu.vn/files/TB%20n%E1%BB%99p%20HS%20tuy%E1%BB%83n%20th%E1%BA%B3ng,%20d%E1%BB%B1%20b%E1%BB%8B.412.pdf";
const evidenceGuide = "https://tuyensinh.utc.edu.vn/sites/ts.utc.edu.vn/files/TB%20355%20H%C6%B0%E1%BB%9Bng%20d%E1%BA%ABn%20th%C3%AD%20sinh%20n%E1%BB%99p%20h%E1%BB%93%20s%C6%A1%20%C4%91%C4%83ng%20k%C3%BD%20x%C3%A9t%20tuy%E1%BB%83n%20%C4%90HCQ%202026.pdf";
function Source({ href, children }: { href: string; children: ReactNode }) {
  return <a href={href} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-blue-700 underline underline-offset-2">Nguồn: {children}<ExternalLink size={12} aria-hidden="true" /></a>;
}
function Tile({ title, children, href, source }: { title: string; children: ReactNode; href: string; source: string }) {
  return <article className="min-w-0 rounded-xl border border-slate-300 bg-white p-4 sm:p-5"><h3 className="mb-3 font-bold text-[#183d77]">{title}</h3><div className="space-y-2 text-sm leading-7 text-slate-700 [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-5 [&_a]:text-blue-700 [&_a]:underline">{children}</div><Source href={href}>{source}</Source></article>;
}

/** Nội dung biên soạn từ nguồn UTC; không gọi website ngoài lúc render. */
export default function UtcOfficialInfo() {
  return <div className="space-y-6">
    <section id="nguon-chinh-thuc" className="rounded-2xl border border-blue-200 bg-blue-50/60 p-4 sm:p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3"><h2 className="flex items-center gap-2 text-lg font-bold"><Landmark size={20} />Thông tin UTC từ nguồn chính thức</h2><span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">Website của trường</span></div>
      <div className="grid gap-3 lg:grid-cols-2">
        <Tile title="Lịch sử hình thành và các mốc phát triển" href={history} source="Lịch sử hình thành UTC">
          <ul><li>Tiền thân là Trường Cao đẳng Công chính; khai giảng lại ngày 15/11/1945.</li><li>Ngày 24/3/1962: thành lập Trường Đại học Giao thông vận tải theo Quyết định 42/CP.</li><li>Năm 1990: thành lập Cơ sở 2 tại TP.HCM; năm 2016 thành lập phân hiệu trên cơ sở này.</li></ul>
        </Tile>
        <Tile title="Sứ mạng và định hướng phát triển" href={strategy} source="Chiến lược phát triển 2021–2030">
          <ul><li>Đào tạo nhân lực, nghiên cứu và chuyển giao công nghệ phục vụ ngành giao thông vận tải và phát triển đất nước.</li><li>Định hướng đại học đa ngành, gắn đào tạo với nghiên cứu và nhu cầu xã hội.</li><li>Giá trị cốt lõi: tiên phong, chất lượng, trách nhiệm và thích ứng.</li></ul>
        </Tile>
        <Tile title="Kênh thông tin tuyển sinh" href={notice} source="Thông báo trên utc.edu.vn">
          <p>Tra cứu thông báo tại <a href="https://www.utc.edu.vn/ttts" target="_blank" rel="noopener noreferrer">trang thông tin tuyển sinh UTC</a>.</p>
          <ul><li>Hà Nội: <a href="https://tuyensinh.utc.edu.vn" target="_blank" rel="noopener noreferrer">tuyensinh.utc.edu.vn</a>.</li></ul>
        </Tile>
        <Tile title="Thông báo tuyển sinh đại học chính quy 2026" href={notice} source="Thông báo 1258/TB-ĐHGTVT">
          <p>Văn bản ngày 30/12/2025 công bố phương thức, tổ hợp và chỉ tiêu dự kiến cho năm 2026.</p><p>Đối chiếu thêm các thông báo cập nhật khi đăng ký; chỉ tiêu dự kiến trong văn bản đầu kỳ không thay thế số liệu điều chỉnh sau đó.</p>
        </Tile>
      </div>
    </section>
    <section id="dang-ky-lien-he" className="grid gap-3 lg:grid-cols-3" aria-label="Thông tin đăng ký và liên hệ">
      <Tile title="Thông tin đăng ký xét tuyển" href={page2} source="Thông báo 1258, trang 2">
        <p><strong>Trường Đại học Giao thông vận tải</strong></p><p>Tuyển sinh tại Hà Nội: <strong>GHA</strong>.</p><p>Thông báo ban đầu dự kiến tại Hà Nội: 4.660 chỉ tiêu chương trình chuẩn và CLC; 70 chỉ tiêu liên kết quốc tế.</p>
      </Tile>
      <Tile title="Bốn phương thức tuyển sinh" href={page1} source="Thông báo 1258, trang 1">
        <ul><li><strong>PT1:</strong> điểm thi THPT; xét thẳng theo giải quốc gia, quốc tế phù hợp.</li><li><strong>PT2:</strong> kết hợp học bạ với điều kiện điểm thi THPT.</li><li><strong>PT3:</strong> ĐGNL HSA của ĐHQG Hà Nội, áp dụng cho các ngành có tuyển PT3 tại GHA.</li><li><strong>PT4:</strong> ĐGTD của Đại học Bách khoa Hà Nội cho một số ngành tại Hà Nội.</li></ul>
      </Tile>
      <Tile title="Liên hệ nhà trường" href={notice} source="Thông tin liên hệ UTC">
        <p><strong>Hà Nội:</strong> số 3 phố Cầu Giấy, phường Láng.</p><p><a href="tel:+842437663311">(024) 3766 3311</a> · <a href="mailto:dhgtvt@utc.edu.vn">dhgtvt@utc.edu.vn</a></p>
      </Tile>
    </section>
    <section id="luu-y-2026" className="rounded-2xl border border-amber-200 bg-amber-50 p-5 sm:p-6">
      <h2 className="mb-3 flex items-center gap-2 text-lg font-bold"><BookOpenCheck size={20} />Điểm cần lưu ý khi tra cứu năm 2026</h2>
      <ul className="list-disc space-y-2 pl-5 text-sm leading-7 text-slate-700"><li>Trang này phục vụ tuyển sinh tại Hà Nội — mã trường GHA.</li><li>Mã tuyển sinh có thể thay đổi theo năm. Đối chiếu tên chương trình, cơ sở và thông báo năm 2026.</li><li>Điểm chuẩn đã công bố và chỉ tiêu trong bảng dưới lấy từ dữ liệu từng năm; không dùng điểm dự đoán làm kết quả trúng tuyển.</li><li>Điều kiện riêng của từng ngành nằm trong bảng chi tiết của thông báo chính thức.</li></ul>
      <Source href={notice}>Thông báo tuyển sinh UTC 2026</Source>
    </section>
    <section id="quy-dinh-tuyen-sinh" className="rounded-2xl border border-slate-300 bg-slate-50 p-4 sm:p-6">
      <h2 className="mb-4 flex items-center gap-2 text-lg font-bold"><ShieldCheck size={20} />Điều kiện và quy định cần đối chiếu</h2>
      <div className="grid gap-3 lg:grid-cols-2">
        <Tile title="Điều kiện xét kết hợp PT2" href={page1} source="Thông báo 1258, trang 1">
          <p>Theo thông báo ban đầu: điểm thi Toán từ 5; ngành Toán ứng dụng từ 6. Điểm trung bình từng môn trong tổ hợp học bạ ba năm không dưới 5,5.</p><p>PT1/PT2 có quy định môn nhân hệ số; ngành Ngôn ngữ Anh có quy định riêng. Đọc văn bản trước khi tự tính điểm.</p>
        </Tile>
        <Tile title="Điểm cộng IELTS và giải cấp tỉnh/thành phố" href={admission2026} source="Thông tin tuyển sinh UTC 2026, mục 5.3">
          <p>IELTS 5,0 / 5,5 / 6,0 / 6,5 / từ 7,0: cộng tương ứng 0,50 / 0,75 / 1,00 / 1,25 / 1,50 điểm.</p>
          <p>Giải nhất / nhì / ba cấp tỉnh: 1,00 / 0,75 / 0,50 điểm. IELTS cấp sau 30/6/2024; giải không quá 3 năm. Tổng điểm xét tuyển tối đa 30.</p>
        </Tile>
        <Tile title="Tổ hợp và yêu cầu môn học theo ngành" href={page3} source="Thông báo 1258, trang 3">
          <p>Một số ngành kỹ thuật yêu cầu đã học Vật lý và đạt mức trung bình ba năm từ 5,5 khi dùng phương thức hoặc tổ hợp nhất định.</p><p>Kiến trúc có các tổ hợp chứa môn Vẽ; không áp dụng một tổ hợp chung cho mọi chương trình.</p>
        </Tile>
        <Tile title="Hồ sơ và dữ liệu minh chứng" href={evidenceGuide} source="Hướng dẫn cung cấp dữ liệu, minh chứng 2026">
          <ul><li>Cung cấp minh chứng giải học sinh giỏi, IELTS và điểm Vẽ Mỹ thuật khi sử dụng.</li><li>Thí sinh tốt nghiệp trước năm 2026 cần cung cấp học bạ theo hướng dẫn. Học bạ thí sinh tốt nghiệp năm 2026 được trường lấy từ hệ thống Bộ GD&ĐT.</li><li>Nộp tại cổng tuyển sinh GHA tại Hà Nội; kiểm tra thông tin trước khi xác nhận.</li></ul>
        </Tile>
        <Tile title="Nguyện vọng và nguyên tắc xét tuyển" href={admission2026} source="Thông tin tuyển sinh UTC 2026, mục 5–6">
          <p>Tối đa 15 nguyện vọng, xếp theo mức ưu tiên. Đủ điều kiện nguyện vọng trên thì không xét nguyện vọng dưới.</p>
          <p>Xét điểm từ cao xuống thấp theo từng mã. Khi bằng điểm cuối danh sách: ưu tiên điểm cộng thấp hơn, sau đó thứ tự nguyện vọng.</p>
        </Tile>
        <Tile title="Học phí dự kiến năm học 2026–2027" href={tuition2026} source="Thông tin tuyển sinh, mục 10.1">
          <p>Chương trình chuẩn, khóa tuyển năm 2026: <strong>2.400.000–2.560.000 đồng/tháng</strong>, tùy khối ngành.</p>
          <p>Đây là mức dự kiến theo tháng, không phải học phí toàn năm. Chương trình tiên tiến, CLC và liên kết quốc tế cần tra thông báo riêng.</p>
        </Tile>
        <Tile title="Tuyển thẳng, ưu tiên xét tuyển và dự bị đại học" href={directAdmission} source="Hướng dẫn tuyển thẳng và dự bị 2026">
          <p>Giải nhất, nhì, ba quốc gia/quốc tế thuộc diện quy định, còn thời hạn 3 năm: xét thẳng theo ngành phù hợp; cần tốt nghiệp THPT và đạt yêu cầu môn học.</p>
          <p>Giải khuyến khích học sinh giỏi quốc gia hoặc giải tư khoa học kỹ thuật quốc gia: diện ưu tiên xét tuyển có điều kiện, không tự động trúng tuyển.</p>
          <p>Học sinh dự bị đại học cần quyết định xét chuyển và đáp ứng ngưỡng của trường; chuẩn bị hồ sơ đúng diện.</p>
        </Tile>
        <Tile title="Điều kiện dự tuyển và xác nhận dữ liệu" href={admission2026} source="Thông tin tuyển sinh UTC 2026">
          <p>Cần tốt nghiệp, đủ hồ sơ và đạt ngưỡng đầu vào từng phương thức. Thông tin trên hệ thống trường và Bộ GD&ĐT phải khớp; hồ sơ được thẩm định sau nhập học.</p>
        </Tile>
        <Tile title="Chọn chuyên ngành và chương trình liên kết quốc tế" href={tuition2026} source="Thông tin tuyển sinh, mục 5.4 và 6.1">
          <p>Trong quá trình đào tạo, sinh viên được chọn chương trình cử nhân/kỹ sư và chuyên ngành của ngành theo học.</p>
          <p>Chương trình liên kết quốc tế tổ chức xét tuyển, phỏng vấn và kiểm tra tiếng Anh riêng. Sinh viên trúng tuyển chương trình khác chỉ chuyển sang khi đáp ứng điều kiện.</p>
        </Tile>
      </div>
    </section>
  </div>;
}

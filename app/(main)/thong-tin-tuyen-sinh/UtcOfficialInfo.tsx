import { BookOpenCheck, FileText, Landmark, ShieldCheck } from "lucide-react";
import { CmsEditableSection, type CmsArticleItem } from "@/components/cms";

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

// Liên kết và tài liệu Báo cáo Ba Công khai năm học 2025–2026 chính thức của UTC
const baCongKhaiUrl = "https://www.utc.edu.vn/bao-cao-ba-cong-khai-nam-hoc-2025-206";
const baCongKhaiFile1 = "https://www.utc.edu.vn/Upload/FilePost/2026/06/24/1-bao-cao-ba-cong-khai-nam-hoc-2025-2026-960802da-75c9-49e6-8117-ecf0f8c0f88c.pdf";
const baCongKhaiFile2 = "https://www.utc.edu.vn/Upload/FilePost/2026/06/24/2-thong-tin-chung-b410d929-0942-4aa7-9c5d-06bddab35d68.pdf";
const baCongKhaiFile3 = "https://www.utc.edu.vn/Upload/FilePost/2026/06/24/3-doi-ngu-giang-vien-can-bo-quan-ly-va-nhan-vien-ebef057c-4bc6-4fed-93bb-51df636c81df.pdf";
const baCongKhaiFile4 = "https://www.utc.edu.vn/Upload/FilePost/2026/06/24/4-ket-qua-tuyen-sinh-va-dao-tao-ef2cde9e-54f1-443c-8a35-fa1723855c8b.pdf";
const baCongKhaiFile5 = "https://www.utc.edu.vn/Upload/FilePost/2026/06/24/5-ket-qua-hoat-dong-khoa-hoc-va-cong-nghe-5ebd310a-79cc-4968-a0de-6133d0146a40.pdf";
const baCongKhaiFile6 = "https://www.utc.edu.vn/Upload/FilePost/2026/06/24/6-co-so-vat-chat-60c65aff-85a7-4a9c-9979-acea32fac29d.pdf";
const baCongKhaiFile7 = "https://www.utc.edu.vn/Upload/FilePost/2026/06/24/7-ket-qua-tai-chinh-a672e2c2-2ff2-46ad-8ff9-ad6cea5bcf5b.pdf";

interface UtcOfficialInfoProps {
  cmsArticles?: CmsArticleItem[];
  canEditCms?: boolean;
}

/** Nội dung biên soạn từ nguồn UTC; tích hợp CMS TipTap cho toàn bộ 4 section trọng điểm. */
export default function UtcOfficialInfo({
  cmsArticles = [],
  canEditCms = false,
}: UtcOfficialInfoProps) {
  // Tìm các bài viết CMS tùy biến trong cơ sở dữ liệu nếu có
  const nguonChinhThucArticle =
    cmsArticles.find(
      (a) =>
        a.title.includes("nguon-chinh-thuc") ||
        a.title.toLowerCase().includes("nguồn chính thức") ||
        a.title.includes("Thông tin UTC từ nguồn chính thức")
    ) || null;

  const dangKyLienHeArticle =
    cmsArticles.find(
      (a) =>
        a.title.includes("dang-ky-lien-he") ||
        a.title.toLowerCase().includes("đăng ký") ||
        a.title.includes("Thông tin đăng ký và liên hệ")
    ) || null;

  const luuYArticle =
    cmsArticles.find(
      (a) =>
        a.title.includes("luu-y-2026") ||
        a.title.toLowerCase().includes("lưu ý") ||
        a.title.includes("Điểm cần lưu ý khi tra cứu năm 2026")
    ) || null;

  const quyDinhArticle =
    cmsArticles.find(
      (a) =>
        a.title.includes("quy-dinh-tuyen-sinh") ||
        a.title.toLowerCase().includes("quy định cần đối chiếu") ||
        a.title.includes("Điều kiện và quy định cần đối chiếu")
    ) || null;

  const baCongKhaiArticle =
    cmsArticles.find(
      (a) =>
        a.title.includes("ba-cong-khai") ||
        a.title.toLowerCase().includes("ba công khai") ||
        a.title.includes("Báo cáo Ba Công khai")
    ) || null;

  return (
    <div className="space-y-6">
      {/* 1. Giới thiệu UTC từ nguồn chính thức - TÍCH HỢP CMS TIPTAP */}
      <CmsEditableSection
        sectionId="nguon-chinh-thuc"
        title="Thông tin UTC từ nguồn chính thức"
        badgeText="Website của trường"
        icon={<Landmark size={20} className="text-[#14244e]" />}
        initialArticle={nguonChinhThucArticle}
        defaultContentHtml={`
          <div class="cms-grid-2">
            <div class="cms-tile">
              <h3>Lịch sử hình thành và các mốc phát triển</h3>
              <ul>
                <li>Tiền thân là Trường Cao đẳng Công chính; khai giảng lại ngày 15/11/1945.</li>
                <li>Ngày 24/3/1962: thành lập Trường Đại học Giao thông vận tải theo Quyết định 42/CP.</li>
                <li>Năm 1990: thành lập Cơ sở 2 tại TP.HCM; năm 2016 thành lập phân hiệu trên cơ sở này.</li>
              </ul>
              <p class="cms-tile-source"><a href="${history}" target="_blank" rel="noopener noreferrer">Nguồn: Lịch sử hình thành UTC ↗</a></p>
            </div>
            <div class="cms-tile">
              <h3>Sứ mạng và định hướng phát triển</h3>
              <ul>
                <li>Đào tạo nhân lực, nghiên cứu và chuyển giao công nghệ phục vụ ngành giao thông vận tải và phát triển đất nước.</li>
                <li>Định hướng đại học đa ngành, gắn đào tạo với nghiên cứu và nhu cầu xã hội.</li>
                <li>Giá trị cốt lõi: tiên phong, chất lượng, trách nhiệm và thích ứng.</li>
              </ul>
              <p class="cms-tile-source"><a href="${strategy}" target="_blank" rel="noopener noreferrer">Nguồn: Chiến lược phát triển 2021–2030 ↗</a></p>
            </div>
            <div class="cms-tile">
              <h3>Kênh thông tin tuyển sinh</h3>
              <p>Tra cứu thông báo tại <a href="https://www.utc.edu.vn/ttts" target="_blank" rel="noopener noreferrer">trang thông tin tuyển sinh UTC</a>.</p>
              <ul>
                <li>Hà Nội: <a href="https://tuyensinh.utc.edu.vn" target="_blank" rel="noopener noreferrer">tuyensinh.utc.edu.vn</a>.</li>
              </ul>
              <p class="cms-tile-source"><a href="${notice}" target="_blank" rel="noopener noreferrer">Nguồn: Thông báo trên utc.edu.vn ↗</a></p>
            </div>
            <div class="cms-tile">
              <h3>Thông báo tuyển sinh đại học chính quy 2026</h3>
              <p>Văn bản ngày 30/12/2025 công bố phương thức, tổ hợp và chỉ tiêu dự kiến cho năm 2026.</p>
              <p>Đối chiếu thêm các thông báo cập nhật khi đăng ký; chỉ tiêu dự kiến trong văn bản đầu kỳ không thay thế số liệu điều chỉnh sau đó.</p>
              <p class="cms-tile-source"><a href="${notice}" target="_blank" rel="noopener noreferrer">Nguồn: Thông báo 1258/TB-ĐHGTVT ↗</a></p>
            </div>
          </div>
        `.trim()}
        canEdit={canEditCms}
        category="TIN TỨC"
        variant="blue"
        sourceUrl={notice}
        sourceLabel="Thông báo trên utc.edu.vn"
      />

      {/* 2. Báo cáo Ba Công khai năm học 2025–2026 - TÍCH HỢP CMS TIPTAP */}
      <CmsEditableSection
        sectionId="ba-cong-khai"
        title="Báo cáo Ba Công khai năm học 2025–2026"
        badgeText="Quy chế Bộ GD&ĐT"
        icon={<FileText size={20} className="text-[#14244e]" />}
        initialArticle={baCongKhaiArticle}
        defaultContentHtml={`
          <div class="cms-grid-3">
            <div class="cms-tile">
              <h3>1. Cam kết chất lượng đào tạo & Thực tế</h3>
              <ul>
                <li><strong>Chuẩn đầu ra:</strong> Tích lũy 130–150 tín chỉ theo Khung trình độ quốc gia; chuẩn ngoại ngữ TOEIC 450–550+ (chuẩn) / IELTS 5.5–6.0+ (CLC); chuẩn tin học chuẩn kỹ năng CNTT / MOS.</li>
                <li><strong>Tỷ lệ việc làm sau tốt nghiệp:</strong> Đạt trung bình <strong>94,2%</strong> sau 12 tháng tốt nghiệp (các khối ngành Kỹ thuật GTVT, CNTT, Logistics, Tự động hóa đạt trên <strong>96%</strong>).</li>
                <li><strong>Kiểm định chất lượng:</strong> 100% ngành định kỳ đạt chuẩn kiểm định chất lượng giáo dục của Bộ GD&ĐT và mạng lưới AUN-QA.</li>
              </ul>
              <p class="cms-tile-source"><a href="${baCongKhaiFile4}" target="_blank" rel="noopener noreferrer">Nguồn: Kết quả tuyển sinh & đào tạo (PDF) ↗</a></p>
            </div>
            <div class="cms-tile">
              <h3>2. Điều kiện bảo đảm chất lượng</h3>
              <ul>
                <li><strong>Đội ngũ giảng viên:</strong> Hơn 850 giảng viên cơ hữu; trên 97% có trình độ sau đại học với hơn 100 Giáo sư/Phó Giáo sư và hơn 300 Tiến sĩ.</li>
                <li><strong>Cơ sở vật chất:</strong> Tổng diện tích sàn gần 120.000 m² tại Hà Nội và Phân hiệu TP.HCM; hơn 200 giảng đường kiên cố 100% trang bị máy chiếu/màn hình tương tác và điều hòa.</li>
                <li><strong>Phòng lab & KTX:</strong> Gần 70 phòng thí nghiệm chuyên sâu, xưởng thực hành công nghệ cao; KTX trên 4.000 chỗ ở; Thư viện số liên kết quốc tế IEEE, ScienceDirect.</li>
              </ul>
              <p class="cms-tile-source"><a href="${baCongKhaiFile3}" target="_blank" rel="noopener noreferrer">Nguồn: Đội ngũ giảng viên ↗</a> · <a href="${baCongKhaiFile6}" target="_blank" rel="noopener noreferrer">Cơ sở vật chất (PDF) ↗</a></p>
            </div>
            <div class="cms-tile">
              <h3>3. Thu chi tài chính & Học bổng</h3>
              <ul>
                <li><strong>Học phí chương trình chuẩn:</strong> 415.000 – 460.000 đ/tín chỉ (khối Kỹ thuật, Công nghệ); 350.000 – 400.000 đ/tín chỉ (khối Kinh tế). Tương đương 2,4 – 2,56 triệu đ/tháng.</li>
                <li><strong>Chương trình CLC / Tiên tiến:</strong> 800.000 – 950.000 đ/tín chỉ. Lộ trình tăng học phí tuân thủ nghiêm ngặt Nghị định 81/2021/NĐ-CP và 97/2023/NĐ-CP.</li>
                <li><strong>Học bổng & Hỗ trợ:</strong> Trích tối thiểu 8% học phí cấp học bổng khuyến khích học tập; hơn 10 tỷ đồng/năm học bổng doanh nghiệp; miễn giảm 100% cho đối tượng chính sách.</li>
              </ul>
              <p class="cms-tile-source"><a href="${baCongKhaiFile7}" target="_blank" rel="noopener noreferrer">Nguồn: Kết quả tài chính & học phí (PDF) ↗</a></p>
            </div>
          </div>
          <div class="cms-tile" style="margin-top: 1rem;">
            <h3>Hồ sơ văn bản Ba Công khai năm học 2025–2026 (Tải trực tiếp từ cổng UTC)</h3>
            <p>Căn cứ các thông tư hướng dẫn của Bộ GD&ĐT về quy chế công khai đối với cơ sở giáo dục đại học, thí sinh và phụ huynh có thể tải và đối chiếu các biểu mẫu chi tiết đính kèm:</p>
            <div class="cms-grid-2">
              <ul>
                <li><a href="${baCongKhaiFile1}" target="_blank" rel="noopener noreferrer"><strong>1. Báo cáo ba công khai năm học 2025-2026 (Tổng hợp).pdf</strong> ↗</a></li>
                <li><a href="${baCongKhaiFile2}" target="_blank" rel="noopener noreferrer"><strong>2. Thông tin chung về nhà trường.pdf</strong> ↗</a></li>
                <li><a href="${baCongKhaiFile3}" target="_blank" rel="noopener noreferrer"><strong>3. Đội ngũ giảng viên, cán bộ quản lý và nhân viên.pdf</strong> ↗</a></li>
                <li><a href="${baCongKhaiFile4}" target="_blank" rel="noopener noreferrer"><strong>4. Kết quả tuyển sinh và đào tạo thực tế.pdf</strong> ↗</a></li>
              </ul>
              <ul>
                <li><a href="${baCongKhaiFile5}" target="_blank" rel="noopener noreferrer"><strong>5. Kết quả hoạt động khoa học và công nghệ.pdf</strong> ↗</a></li>
                <li><a href="${baCongKhaiFile6}" target="_blank" rel="noopener noreferrer"><strong>6. Cơ sở vật chất, phòng thí nghiệm, ký túc xá.pdf</strong> ↗</a></li>
                <li><a href="${baCongKhaiFile7}" target="_blank" rel="noopener noreferrer"><strong>7. Kết quả thu chi tài chính & học phí.pdf</strong> ↗</a></li>
              </ul>
            </div>
            <p class="cms-tile-source"><a href="${baCongKhaiUrl}" target="_blank" rel="noopener noreferrer">Nguồn gốc văn bản: Báo cáo Ba công khai trên Cổng thông tin UTC (utc.edu.vn) ↗</a></p>
          </div>
        `.trim()}
        canEdit={canEditCms}
        category="QUY CHẾ"
        variant="blue"
        sourceUrl={baCongKhaiUrl}
        sourceLabel="Báo cáo Ba công khai trên utc.edu.vn"
      />

      {/* 3. Thông tin đăng ký và liên hệ - TÍCH HỢP CMS TIPTAP */}
      <CmsEditableSection
        sectionId="dang-ky-lien-he"
        title="Thông tin đăng ký và liên hệ"
        icon={<Landmark size={20} className="text-slate-700" />}
        initialArticle={dangKyLienHeArticle}
        defaultContentHtml={`
          <div class="cms-grid-3">
            <div class="cms-tile">
              <h3>Thông tin đăng ký xét tuyển</h3>
              <p><strong>Trường Đại học Giao thông vận tải</strong></p>
              <p>Tuyển sinh tại Hà Nội: <strong>GHA</strong>.</p>
              <p>Thông báo ban đầu dự kiến tại Hà Nội: 4.660 chỉ tiêu chương trình chuẩn và CLC; 70 chỉ tiêu liên kết quốc tế.</p>
              <p class="cms-tile-source"><a href="${page2}" target="_blank" rel="noopener noreferrer">Nguồn: Thông báo 1258, trang 2 ↗</a></p>
            </div>
            <div class="cms-tile">
              <h3>Bốn phương thức tuyển sinh</h3>
              <ul>
                <li><strong>PT1:</strong> điểm thi THPT; xét thẳng theo giải quốc gia, quốc tế phù hợp.</li>
                <li><strong>PT2:</strong> kết hợp học bạ với điều kiện điểm thi THPT.</li>
                <li><strong>PT3:</strong> ĐGNL HSA của ĐHQG Hà Nội, áp dụng cho các ngành có tuyển PT3 tại GHA.</li>
                <li><strong>PT4:</strong> ĐGTD của Đại học Bách khoa Hà Nội cho một số ngành tại Hà Nội.</li>
              </ul>
              <p class="cms-tile-source"><a href="${page1}" target="_blank" rel="noopener noreferrer">Nguồn: Thông báo 1258, trang 1 ↗</a></p>
            </div>
            <div class="cms-tile">
              <h3>Liên hệ nhà trường</h3>
              <p><strong>Hà Nội:</strong> số 3 phố Cầu Giấy, phường Láng.</p>
              <p><a href="tel:+842437663311">(024) 3766 3311</a> · <a href="mailto:dhgtvt@utc.edu.vn">dhgtvt@utc.edu.vn</a></p>
              <p class="cms-tile-source"><a href="${notice}" target="_blank" rel="noopener noreferrer">Nguồn: Thông tin liên hệ UTC ↗</a></p>
            </div>
          </div>
        `.trim()}
        canEdit={canEditCms}
        category="HƯỚNG DẪN"
        variant="slate"
        sourceUrl={page2}
        sourceLabel="Thông báo 1258, trang 2"
      />

      {/* 3. Điểm cần lưu ý khi tra cứu năm 2026 - TÍCH HỢP CMS TIPTAP */}
      <CmsEditableSection
        sectionId="luu-y-2026"
        title="Điểm cần lưu ý khi tra cứu năm 2026"
        icon={<BookOpenCheck size={20} className="text-amber-600" />}
        initialArticle={luuYArticle}
        defaultContentHtml={`
          <ul class="cms-bullet-list">
            <li>Trang này phục vụ tuyển sinh tại Hà Nội — mã trường GHA.</li>
            <li>Mã tuyển sinh có thể thay đổi theo năm. Đối chiếu tên chương trình, cơ sở và thông báo năm 2026.</li>
            <li>Điểm chuẩn đã công bố và chỉ tiêu trong bảng dưới lấy từ dữ liệu từng năm; không dùng điểm dự đoán làm kết quả trúng tuyển.</li>
            <li>Điều kiện riêng của từng ngành nằm trong bảng chi tiết của thông báo chính thức.</li>
          </ul>
        `.trim()}
        canEdit={canEditCms}
        category="QUY CHẾ"
        variant="amber"
        sourceUrl={notice}
        sourceLabel="Thông báo tuyển sinh UTC 2026"
      />

      {/* 4. Điều kiện và quy định cần đối chiếu - TÍCH HỢP CMS TIPTAP */}
      <CmsEditableSection
        sectionId="quy-dinh-tuyen-sinh"
        title="Điều kiện và quy định cần đối chiếu"
        icon={<ShieldCheck size={20} className="text-slate-700" />}
        initialArticle={quyDinhArticle}
        defaultContentHtml={`
          <div class="cms-grid-2">
            <div class="cms-tile">
              <h3>Điều kiện xét kết hợp PT2</h3>
              <p>Theo thông báo ban đầu: điểm thi Toán từ 5; ngành Toán ứng dụng từ 6. Điểm trung bình từng môn trong tổ hợp học bạ ba năm không dưới 5,5.</p>
              <p>PT1/PT2 có quy định môn nhân hệ số; ngành Ngôn ngữ Anh có quy định riêng. Đọc văn bản trước khi tự tính điểm.</p>
              <p class="cms-tile-source"><a href="${page1}" target="_blank" rel="noopener noreferrer">Nguồn: Thông báo 1258, trang 1 ↗</a></p>
            </div>
            <div class="cms-tile">
              <h3>Điểm cộng IELTS và giải cấp tỉnh/thành phố</h3>
              <p>IELTS 5,0 / 5,5 / 6,0 / 6,5 / từ 7,0: cộng tương ứng 0,50 / 0,75 / 1,00 / 1,25 / 1,50 điểm.</p>
              <p>Giải nhất / nhì / ba cấp tỉnh: 1,00 / 0,75 / 0,50 điểm. IELTS cấp sau 30/6/2024; giải không quá 3 năm. Tổng điểm xét tuyển tối đa 30.</p>
              <p class="cms-tile-source"><a href="${admission2026}" target="_blank" rel="noopener noreferrer">Nguồn: Thông tin tuyển sinh UTC 2026, mục 5.3 ↗</a></p>
            </div>
            <div class="cms-tile">
              <h3>Tổ hợp và yêu cầu môn học theo ngành</h3>
              <p>Một số ngành kỹ thuật yêu cầu đã học Vật lý và đạt mức trung bình ba năm từ 5,5 khi dùng phương thức hoặc tổ hợp nhất định.</p>
              <p>Kiến trúc có các tổ hợp chứa môn Vẽ; không áp dụng một tổ hợp chung cho mọi chương trình.</p>
              <p class="cms-tile-source"><a href="${page3}" target="_blank" rel="noopener noreferrer">Nguồn: Thông báo 1258, trang 3 ↗</a></p>
            </div>
            <div class="cms-tile">
              <h3>Hồ sơ và dữ liệu minh chứng</h3>
              <ul>
                <li>Cung cấp minh chứng giải học sinh giỏi, IELTS và điểm Vẽ Mỹ thuật khi sử dụng.</li>
                <li>Thí sinh tốt nghiệp trước năm 2026 cần cung cấp học bạ theo hướng dẫn. Học bạ thí sinh tốt nghiệp năm 2026 được trường lấy từ hệ thống Bộ GD&ĐT.</li>
                <li>Nộp tại cổng tuyển sinh GHA tại Hà Nội; kiểm tra thông tin trước khi xác nhận.</li>
              </ul>
              <p class="cms-tile-source"><a href="${evidenceGuide}" target="_blank" rel="noopener noreferrer">Nguồn: Hướng dẫn cung cấp dữ liệu, minh chứng 2026 ↗</a></p>
            </div>
            <div class="cms-tile">
              <h3>Nguyện vọng và nguyên tắc xét tuyển</h3>
              <p>Tối đa 15 nguyện vọng, xếp theo mức ưu tiên. Đủ điều kiện nguyện vọng trên thì không xét nguyện vọng dưới.</p>
              <p>Xét điểm từ cao xuống thấp theo từng mã. Khi bằng điểm cuối danh sách: ưu tiên điểm cộng thấp hơn, sau đó thứ tự nguyện vọng.</p>
              <p class="cms-tile-source"><a href="${admission2026}" target="_blank" rel="noopener noreferrer">Nguồn: Thông tin tuyển sinh UTC 2026, mục 5–6 ↗</a></p>
            </div>
            <div class="cms-tile">
              <h3>Học phí dự kiến năm học 2026–2027</h3>
              <p>Chương trình chuẩn, khóa tuyển năm 2026: <strong>2.400.000–2.560.000 đồng/tháng</strong>, tùy khối ngành.</p>
              <p>Đây là mức dự kiến theo tháng, không phải học phí toàn năm. Chương trình tiên tiến, CLC và liên kết quốc tế cần tra thông báo riêng.</p>
              <p class="cms-tile-source"><a href="${tuition2026}" target="_blank" rel="noopener noreferrer">Nguồn: Thông tin tuyển sinh, mục 10.1 ↗</a></p>
            </div>
            <div class="cms-tile">
              <h3>Tuyển thẳng, ưu tiên xét tuyển và dự bị đại học</h3>
              <p>Giải nhất, nhì, ba quốc gia/quốc tế thuộc diện quy định, còn thời hạn 3 năm: xét thẳng theo ngành phù hợp; cần tốt nghiệp THPT và đạt yêu cầu môn học.</p>
              <p>Giải khuyến khích học sinh giỏi quốc gia hoặc giải tư khoa học kỹ thuật quốc gia: diện ưu tiên xét tuyển có điều kiện, không tự động trúng tuyển.</p>
              <p>Học sinh dự bị đại học cần quyết định xét chuyển và đáp ứng ngưỡng của trường; chuẩn bị hồ sơ đúng diện.</p>
              <p class="cms-tile-source"><a href="${directAdmission}" target="_blank" rel="noopener noreferrer">Nguồn: Hướng dẫn tuyển thẳng và dự bị 2026 ↗</a></p>
            </div>
            <div class="cms-tile">
              <h3>Điều kiện dự tuyển và xác nhận dữ liệu</h3>
              <p>Cần tốt nghiệp, đủ hồ sơ và đạt ngưỡng đầu vào từng phương thức. Thông tin trên hệ thống trường và Bộ GD&ĐT phải khớp; hồ sơ được thẩm định sau nhập học.</p>
              <p class="cms-tile-source"><a href="${admission2026}" target="_blank" rel="noopener noreferrer">Nguồn: Thông tin tuyển sinh UTC 2026 ↗</a></p>
            </div>
            <div class="cms-tile">
              <h3>Chọn chuyên ngành và chương trình liên kết quốc tế</h3>
              <p>Trong quá trình đào tạo, sinh viên được chọn chương trình cử nhân/kỹ sư và chuyên ngành của ngành theo học.</p>
              <p>Chương trình liên kết quốc tế tổ chức xét tuyển, phỏng vấn và kiểm tra tiếng Anh riêng. Sinh viên trúng tuyển chương trình khác chỉ chuyển sang khi đáp ứng điều kiện.</p>
              <p class="cms-tile-source"><a href="${tuition2026}" target="_blank" rel="noopener noreferrer">Nguồn: Thông tin tuyển sinh, mục 5.4 và 6.1 ↗</a></p>
            </div>
          </div>
        `.trim()}
        canEdit={canEditCms}
        category="QUY CHẾ"
        variant="slate"
        sourceUrl={admission2026}
        sourceLabel="Thông tin tuyển sinh UTC 2026"
      />
    </div>
  );
}

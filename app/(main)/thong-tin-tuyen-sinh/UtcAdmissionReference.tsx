import { ArrowLeftRight, MessageCircle, Radio } from "lucide-react";
import type { AdmissionHistory } from "./AdmissionHistoryTable";
import { CmsEditableSection, type CmsArticleItem } from "@/components/cms";

const conversionSource =
  "https://tuyensinh.utc.edu.vn/?q=tin-tuyen-sinh/quy-t%E1%BA%AFc-quy-%C4%91%E1%BB%95i-%C4%91i%E1%BB%83m-tr%C3%BAng-tuy%E1%BB%83n-gi%E1%BB%AFa-c%C3%A1c-ph%C6%B0%C6%A1ng-th%E1%BB%A9c-x%C3%A9t-tuy%E1%BB%83n-%C4%91%E1%BA%A1i-h%E1%BB%8Dc-ch%C3%ADnh-quy-n-0";
const faqSource = "https://tuyensinh.utc.edu.vn/danh-sach-cau-hoi";

interface UtcAdmissionReferenceProps {
  history: AdmissionHistory[];
  loadFailed: boolean;
  cmsArticles?: CmsArticleItem[];
  canEditCms?: boolean;
}

export default function UtcAdmissionReference({
  history,
  loadFailed,
  cmsArticles = [],
  canEditCms = false,
}: UtcAdmissionReferenceProps) {
  // Tìm kiếm bài viết tùy biến CMS từ DB nếu có
  const quyDoiArticle =
    cmsArticles.find(
      (a) =>
        a.title.includes("quy-doi-utc") ||
        a.title.toLowerCase().includes("quy đổi điểm") ||
        a.title.includes("Chứng chỉ và quy đổi điểm UTC 2026")
    ) || null;

  const kenhTuyenSinhArticle =
    cmsArticles.find(
      (a) =>
        a.title.includes("kenh-tuyen-sinh") ||
        a.title.toLowerCase().includes("kênh thông tin tuyển sinh") ||
        a.title.includes("Các kênh thông tin tuyển sinh chính thức")
    ) || null;

  const giaiDapArticle =
    cmsArticles.find(
      (a) =>
        a.title.includes("giai-dap-nhanh") ||
        a.title.toLowerCase().includes("giải đáp nhanh") ||
        a.title.includes("Giải đáp nhanh cho thí sinh UTC")
    ) || null;

  return (
    <div className="space-y-6">
      {/* 1. Chứng chỉ và quy đổi điểm UTC 2026 - TÍCH HỢP CMS TIPTAP */}
      <CmsEditableSection
        sectionId="quy-doi-utc"
        title="Chứng chỉ và quy đổi điểm UTC 2026"
        icon={<ArrowLeftRight size={20} className="text-amber-600" />}
        variant="amber"
        category="QUY CHẾ"
        initialArticle={quyDoiArticle}
        defaultContentHtml={`
          <div class="cms-callout-amber" style="background-color: #fffdf5; border: 1px solid #fef08a; border-left: 3.5px solid #d97706; border-radius: 0.75rem; padding: 0.875rem 1.125rem; margin-bottom: 1rem; color: #78350f;">
            <p style="margin: 0; line-height: 1.6; color: #78350f;"><strong style="color: #451a03;">IELTS năm 2026 là điểm cộng, không thay điểm tiếng Anh THPT.</strong> Không áp dụng bảng TOEFL/TOEIC/SAT của NEU. Bảng điểm cộng IELTS UTC nằm trong phần điều kiện xét tuyển phía trên.</p>
          </div>

          <h3>Điểm cộng IELTS · Thang điểm 30</h3>
          <table class="cms-table">
            <thead>
              <tr>
                <th>Chứng chỉ IELTS</th>
                <th>Mức điểm cộng</th>
                <th>Ghi chú điều kiện</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>IELTS 5,0</td><td>+0,50 điểm</td><td>Chứng chỉ cấp sau 30/6/2024; không tự cộng dồn</td></tr>
              <tr><td>IELTS 5,5</td><td>+0,75 điểm</td><td>Chứng chỉ cấp sau 30/6/2024; không tự cộng dồn</td></tr>
              <tr><td>IELTS 6,0</td><td>+1,00 điểm</td><td>Chứng chỉ cấp sau 30/6/2024; không tự cộng dồn</td></tr>
              <tr><td>IELTS 6,5</td><td>+1,25 điểm</td><td>Chứng chỉ cấp sau 30/6/2024; không tự cộng dồn</td></tr>
              <tr><td>Từ 7,0 trở lên</td><td>+1,50 điểm</td><td>Chứng chỉ cấp sau 30/6/2024; không tự cộng dồn</td></tr>
            </tbody>
          </table>
          <p style="font-size: 0.8125rem; color: #64748b; margin-top: 0.5rem;">Chứng chỉ cấp sau 30/6/2024; áp dụng điều kiện trong thông báo, không tự cộng dồn mọi loại điểm thưởng.</p>

          <h3>Bảng quy đổi tương đương các phương thức tuyển sinh về điểm THPT (Mã trường GHA)</h3>
          <p style="font-size: 0.875rem; color: #475569;">Dành cho xét tuyển tại Hà Nội — mã trường GHA. Ba bảng học bạ, HSA và TSA lấy từ thông báo ngày 07/07/2026, quy đổi về điểm THPT. Đây không phải điểm chuẩn của từng chương trình.</p>

          <div class="cms-grid-3">
            <div class="cms-tile">
              <h3>Học bạ THPT (Thang 30)</h3>
              <table class="cms-table">
                <thead>
                  <tr><th>THPT · 30</th><th>Học bạ</th></tr>
                </thead>
                <tbody>
                  <tr><td>28,20–30,00</td><td>29,80–30,00</td></tr>
                  <tr><td>27,50–28,20</td><td>29,37–29,80</td></tr>
                  <tr><td>26,00–27,50</td><td>28,63–29,37</td></tr>
                  <tr><td>24,75–26,00</td><td>27,63–28,63</td></tr>
                  <tr><td>21,75–24,75</td><td>26,07–27,63</td></tr>
                  <tr><td>18,75–21,75</td><td>23,67–26,07</td></tr>
                  <tr><td>16,00–18,75</td><td>21,00–23,67</td></tr>
                </tbody>
              </table>
            </div>
            <div class="cms-tile">
              <h3>HSA · ĐHQG Hà Nội (Thang 150)</h3>
              <table class="cms-table">
                <thead>
                  <tr><th>THPT · 30</th><th>HSA</th></tr>
                </thead>
                <tbody>
                  <tr><td>29,75–30,00</td><td>127–150</td></tr>
                  <tr><td>28,98–29,75</td><td>119–127</td></tr>
                  <tr><td>26,52–28,98</td><td>104–119</td></tr>
                  <tr><td>23,77–26,52</td><td>86–104</td></tr>
                  <tr><td>21,73–23,77</td><td>75–86</td></tr>
                  <tr><td>17,77–21,73</td><td>62–75</td></tr>
                  <tr><td>16,00–17,77</td><td>56,74–62</td></tr>
                </tbody>
              </table>
            </div>
            <div class="cms-tile">
              <h3>TSA · ĐHBK Hà Nội (Thang 100)</h3>
              <table class="cms-table">
                <thead>
                  <tr><th>THPT · 30</th><th>TSA</th></tr>
                </thead>
                <tbody>
                  <tr><td>29,50–30,00</td><td>82,76–100</td></tr>
                  <tr><td>28,25–29,50</td><td>71,85–82,76</td></tr>
                  <tr><td>26,75–28,25</td><td>64,40–71,85</td></tr>
                  <tr><td>25,10–26,75</td><td>58,72–64,40</td></tr>
                  <tr><td>23,50–25,10</td><td>53,68–58,72</td></tr>
                  <tr><td>21,10–23,50</td><td>48,47–53,68</td></tr>
                  <tr><td>18,75–21,10</td><td>44,16–48,47</td></tr>
                </tbody>
              </table>
            </div>
          </div>

          <p style="background-color: #eff6ff; padding: 0.75rem 1rem; border-radius: 0.5rem; font-size: 0.875rem;"><strong>Nội suy tuyến tính:</strong> y = y₁ + (x − x₁) × (y₂ − y₁) / (x₂ − x₁). Chỉ áp dụng trong khoảng được công bố, đúng phương thức và điều kiện.</p>
          <p><a href="/tinh-diem-quy-doi">Mở công cụ tính điểm quy đổi trực tuyến</a></p>
        `.trim()}
        canEdit={canEditCms}
        sourceUrl={conversionSource}
        sourceLabel="Quy đổi chính thức UTC dành cho GHA · 07/07/2026"
      />

      {/* 2. Các kênh thông tin tuyển sinh chính thức - TÍCH HỢP CMS TIPTAP */}
      <CmsEditableSection
        sectionId="kenh-tuyen-sinh"
        title="Các kênh thông tin tuyển sinh chính thức"
        icon={<Radio size={20} className="text-blue-700" />}
        variant="slate"
        category="HƯỚNG DẪN"
        initialArticle={kenhTuyenSinhArticle}
        defaultContentHtml={`
          <div class="cms-grid-2">
            <div class="cms-tile">
              <h3>Website trường Đại học Giao thông vận tải</h3>
              <p>Thông báo và các văn bản điều hành chính thức của UTC.</p>
              <p class="cms-tile-source"><a href="https://www.utc.edu.vn/ttts" target="_blank" rel="noopener noreferrer">Truy cập utc.edu.vn/ttts ↗</a></p>
            </div>
            <div class="cms-tile">
              <h3>Cổng thông tin tuyển sinh tại Hà Nội (GHA)</h3>
              <p>Hướng dẫn nộp hồ sơ, minh chứng và thông báo cập nhật tuyển sinh.</p>
              <p class="cms-tile-source"><a href="https://tuyensinh.utc.edu.vn" target="_blank" rel="noopener noreferrer">Truy cập tuyensinh.utc.edu.vn ↗</a></p>
            </div>
            <div class="cms-tile">
              <h3>Thông báo Điểm chuẩn trúng tuyển</h3>
              <p>Thông báo kết quả theo từng mã chương trình và phương thức xét tuyển.</p>
              <p class="cms-tile-source"><a href="https://tuyensinh.utc.edu.vn/?q=node/33061" target="_blank" rel="noopener noreferrer">Xem thông báo điểm chuẩn ↗</a></p>
            </div>
            <div class="cms-tile">
              <h3>Ngưỡng đảm bảo chất lượng đầu vào (Điểm sàn)</h3>
              <p>Mức điểm sàn nhận hồ sơ theo từng chương trình và phương thức.</p>
              <p class="cms-tile-source"><a href="https://tuyensinh.utc.edu.vn/?q=node/27447" target="_blank" rel="noopener noreferrer">Xem ngưỡng đầu vào ↗</a></p>
            </div>
            <div class="cms-tile">
              <h3>Hướng dẫn nộp minh chứng xét tuyển</h3>
              <p>Quy trình tải minh chứng IELTS, giải thưởng học sinh giỏi, học bạ và năng khiếu.</p>
              <p class="cms-tile-source"><a href="https://tuyensinh.utc.edu.vn/?q=node/23059" target="_blank" rel="noopener noreferrer">Xem hướng dẫn nộp minh chứng ↗</a></p>
            </div>
            <div class="cms-tile">
              <h3>Thông tin liên hệ tuyển sinh UTC</h3>
              <p>Hà Nội: <a href="tel:+842437663311">(024) 3766 3311</a> · Email: <a href="mailto:dhgtvt@utc.edu.vn">dhgtvt@utc.edu.vn</a></p>
              <p class="cms-tile-source"><a href="https://www.utc.edu.vn" target="_blank" rel="noopener noreferrer">Website trường utc.edu.vn ↗</a></p>
            </div>
          </div>
        `.trim()}
        canEdit={canEditCms}
        sourceUrl="https://www.utc.edu.vn"
        sourceLabel="Thông tin liên hệ trên website UTC"
      />

      {/* 3. Giải đáp nhanh cho thí sinh UTC (FAQ) - TÍCH HỢP CMS TIPTAP */}
      <CmsEditableSection
        sectionId="giai-dap-nhanh"
        title="Giải đáp nhanh cho thí sinh UTC"
        icon={<MessageCircle size={20} className="text-[#14244e]" />}
        variant="blue"
        category="HƯỚNG DẪN"
        initialArticle={giaiDapArticle}
        defaultContentHtml={`
          <p style="font-size: 0.875rem; color: #475569; margin-bottom: 1rem;">Dưới đây là các giải đáp chính thức từ Hội đồng Tuyển sinh UTC cho những câu hỏi thường gặp nhất của thí sinh:</p>

          <div class="cms-grid-2">
            <div class="cms-tile">
              <h3>IELTS có được thay điểm tiếng Anh THPT năm 2026 không?</h3>
              <p>Không. Hỏi đáp chính thức UTC xác nhận năm 2026 dùng IELTS để cộng điểm. Không áp dụng bảng quy đổi IELTS/TOEFL/TOEIC của NEU hay bảng UTC năm 2024–2025.</p>
              <p class="cms-tile-source"><a href="https://tuyensinh.utc.edu.vn/danh-sach-cau-hoi" target="_blank" rel="noopener noreferrer">Hỏi đáp chính thức UTC về IELTS ↗</a></p>
            </div>

            <div class="cms-tile">
              <h3>Xét học bạ có cần thi lại Toán nếu đã tốt nghiệp năm trước?</h3>
              <p>Theo trả lời của trường cho mùa 2026, PT2 vẫn yêu cầu điểm thi Toán THPT năm 2026 từ 5; Toán ứng dụng có điều kiện riêng. Học bạ cũ không tự thay thế điều kiện này.</p>
              <p class="cms-tile-source"><a href="https://tuyensinh.utc.edu.vn/danh-sach-cau-hoi" target="_blank" rel="noopener noreferrer">Hỏi đáp chính thức UTC về PT2 ↗</a></p>
            </div>

            <div class="cms-tile">
              <h3>Có IELTS, giải thưởng hoặc điểm Vẽ thì nộp ở đâu?</h3>
              <p>Thực hiện hướng dẫn nộp minh chứng trên cổng của trường, tại Hà Nội (GHA). Trang này cũng hướng dẫn thí sinh tốt nghiệp trước năm 2026 đăng ký PT2. Việc khai minh chứng không thay cho đăng ký nguyện vọng trên hệ thống Bộ.</p>
              <p class="cms-tile-source"><a href="https://tuyensinh.utc.edu.vn/?q=node/23059" target="_blank" rel="noopener noreferrer">Hướng dẫn nộp minh chứng UTC ↗</a></p>
            </div>

            <div class="cms-tile">
              <h3>Điểm sàn có phải điểm chuẩn không?</h3>
              <p>Không. Điểm sàn là ngưỡng được nhận đăng ký; điểm chuẩn xác định trúng tuyển. UTC công bố ngưỡng theo từng mã và phương thức, không dùng mức sàn của trường khác cho UTC.</p>
              <p class="cms-tile-source"><a href="https://tuyensinh.utc.edu.vn/?q=node/27447" target="_blank" rel="noopener noreferrer">Thông báo ngưỡng đầu vào UTC ↗</a></p>
            </div>

            <div class="cms-tile">
              <h3>Điểm được tính về thang 30 như thế nào?</h3>
              <p>Theo thông báo ngưỡng đầu vào: thông thường (Toán × 2 + hai môn còn lại) × 3/4, rồi cộng ưu tiên và điểm cộng hợp lệ. Ngôn ngữ Anh dùng tổng ba môn theo quy định riêng của thông báo. HSA/TSA/ĐGNL cần quy đổi trước.</p>
              <p class="cms-tile-source"><a href="https://tuyensinh.utc.edu.vn/?q=node/27447" target="_blank" rel="noopener noreferrer">Thông báo ngưỡng đầu vào UTC ↗</a></p>
            </div>

            <div class="cms-tile">
              <h3>Tra điểm chuẩn năm 2026 ở đâu?</h3>
              <p>Thí sinh đối chiếu bảng điểm chuẩn theo từng năm và phương thức ngay tại cổng này, đồng thời theo dõi văn bản quyết định trúng tuyển được công bố chính thức tại website tuyển sinh trường.</p>
              <p class="cms-tile-source"><a href="https://tuyensinh.utc.edu.vn/?q=node/33061" target="_blank" rel="noopener noreferrer">Thông báo điểm chuẩn UTC ↗</a></p>
            </div>

            <div class="cms-tile">
              <h3>Dự đoán AI có phải kết quả trúng tuyển chính thức?</h3>
              <p>Không. Điểm dự đoán và phần so sánh của ứng dụng chỉ để tham khảo định hướng sắp xếp nguyện vọng. Kết quả xét tuyển thực tế phải xem thông báo trường và hệ thống tuyển sinh của Bộ GD&ĐT.</p>
            </div>

            <div class="cms-tile">
              <h3>Điểm nằm giữa hai mốc trong bảng quy đổi thì làm sao?</h3>
              <p>UTC dùng nội suy tuyến tính trong đúng khoảng của phương thức: y = y₁ + (x − x₁) × (y₂ − y₁) / (x₂ − x₁). Không quy đổi theo tỷ lệ cố định và không lấy các mốc HSA/TSA của trường khác.</p>
              <p class="cms-tile-source"><a href="https://tuyensinh.utc.edu.vn/?q=tin-tuyen-sinh/quy-t%E1%BA%AFc-quy-%C4%91%E1%BB%95i-%C4%91i%E1%BB%83m-tr%C3%BAng-tuy%E1%BB%83n-gi%E1%BB%AFa-c%C3%A1c-ph%C6%B0%C6%A1ng-th%E1%BB%A9c-x%C3%A9t-tuy%E1%BB%83n-%C4%91%E1%BA%A1i-h%E1%BB%8Dc-ch%C3%ADnh-quy-n-0" target="_blank" rel="noopener noreferrer">Quy tắc quy đổi điểm UTC ↗</a></p>
            </div>

            <div class="cms-tile">
              <h3>Chọn chương trình, học phần và định hướng nghề nghiệp ở đâu?</h3>
              <p>Dùng công cụ Tra cứu chương trình đào tạo để xem thông tin đã nhập; trang So sánh chương trình đối chiếu lịch sử điểm. Khung học phần chỉ hiển thị khi hệ thống đã có dữ liệu liên kết.</p>
            </div>

            <div class="cms-tile">
              <h3>Sai hồ sơ, thanh toán chưa ghi nhận hoặc không nhận email thì làm gì?</h3>
              <p>Giữ mã hồ sơ, ảnh thông báo lỗi và chứng từ giao dịch; liên hệ đầu mối tuyển sinh đúng cơ sở qua kênh chính thức. Không gửi mật khẩu hay OTP. Việc mở khóa hồ sơ và xử lý lệ phí theo hướng dẫn trường.</p>
              <p class="cms-tile-source"><a href="https://tuyensinh.utc.edu.vn/?q=lien-he" target="_blank" rel="noopener noreferrer">Liên hệ ban tuyển sinh UTC ↗</a></p>
            </div>

            <div class="cms-tile">
              <h3>Chưa trúng tuyển đợt đầu có còn đợt bổ sung không?</h3>
              <p>Thông tin tuyển sinh UTC nêu đợt tiếp theo sẽ được thông báo nếu còn chỉ tiêu. Cần theo dõi thông báo thực tế tại website trường; không kết luận trường không xét bổ sung.</p>
              <p class="cms-tile-source"><a href="https://tuyensinh.utc.edu.vn/?q=thong-tin-tuyen-sinh" target="_blank" rel="noopener noreferrer">Thông tin tuyển sinh UTC ↗</a></p>
            </div>
          </div>
        `.trim()}
        canEdit={canEditCms}
        sourceUrl={faqSource}
        sourceLabel="Hỏi đáp tuyển sinh UTC"
      />
    </div>
  );
}

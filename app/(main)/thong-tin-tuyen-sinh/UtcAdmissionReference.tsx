import Link from "next/link";
import { ArrowLeftRight, ExternalLink, MessageCircle, Radio } from "lucide-react";
import type { AdmissionHistory } from "./AdmissionHistoryTable";

const conversionSource = "https://tuyensinh.utc.edu.vn/?q=tin-tuyen-sinh/quy-t%E1%BA%AFc-quy-%C4%91%E1%BB%95i-%C4%91i%E1%BB%83m-tr%C3%BAng-tuy%E1%BB%83n-gi%E1%BB%AFa-c%C3%A1c-ph%C6%B0%C6%A1ng-th%E1%BB%A9c-x%C3%A9t-tuy%E1%BB%83n-%C4%91%E1%BA%A1i-h%E1%BB%8Dc-ch%C3%ADnh-quy-n-0";
const floorSource = "https://tuyensinh.utc.edu.vn/?q=node/27447";
const guideSource = "https://tuyensinh.utc.edu.vn/?q=node/23059";
const faqSource = "https://tuyensinh.utc.edu.vn/danh-sach-cau-hoi";
const resultSource = "https://tuyensinh.utc.edu.vn/?q=node/33061";
const infoSource = "https://tuyensinh.utc.edu.vn/?q=thong-tin-tuyen-sinh";
// Bảng công bố 07/07/2026. Mỗi phương thức có các mốc THPT riêng;
// không đặt chung các hàng như thể HSA, TSA và học bạ có cùng khoảng.
const scales = [
  { name: "Học bạ THPT", range: "Thang 30", rows: [
    ["28,20–30,00", "29,80–30,00"], ["27,50–28,20", "29,37–29,80"],
    ["26,00–27,50", "28,63–29,37"], ["24,75–26,00", "27,63–28,63"],
    ["21,75–24,75", "26,07–27,63"], ["18,75–21,75", "23,67–26,07"], ["16,00–18,75", "21,00–23,67"],
  ] },
  { name: "HSA · ĐHQG Hà Nội", range: "Thang 150", rows: [
    ["29,75–30,00", "127–150"], ["28,98–29,75", "119–127"], ["26,52–28,98", "104–119"],
    ["23,77–26,52", "86–104"], ["21,73–23,77", "75–86"], ["17,77–21,73", "62–75"], ["16,00–17,77", "56,74–62"],
  ] },
  { name: "TSA · ĐH Bách khoa Hà Nội", range: "Thang 100", rows: [
    ["29,50–30,00", "82,76–100"], ["28,25–29,50", "71,85–82,76"], ["26,75–28,25", "64,40–71,85"],
    ["25,10–26,75", "58,72–64,40"], ["23,50–25,10", "53,68–58,72"], ["21,10–23,50", "48,47–53,68"],
    ["18,75–21,10", "44,16–48,47"], ["17,25–18,75", "41,77–44,16"], ["16,00–17,25", "39,63–41,77"],
  ] },
];
function Source({ href, label }: { href: string; label: string }) {
  return <a href={href} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-blue-700 underline underline-offset-2">{label}<ExternalLink size={12} aria-hidden="true" /></a>;
}

export default function UtcAdmissionReference({ history, loadFailed }: { history: AdmissionHistory[]; loadFailed: boolean }) {
  const annual = history.filter(row => row.year === 2026);
  const quotas = [...new Map(annual.map(row => [row.programCode, row.quota])).values()];
  const quota = quotas.some(value => value !== null) ? quotas.reduce<number>((sum, value) => sum + (value ?? 0), 0).toLocaleString("vi-VN") : "chưa có dữ liệu";
  const published = new Set(annual.filter(row => row.scores.some(score => Number.isFinite(score.score) && score.score > 0)).map(row => row.programCode)).size;
  const card = "rounded-2xl border border-slate-300 bg-white p-4 sm:p-6";
  const questions = [
    { q: "IELTS có được thay điểm tiếng Anh THPT năm 2026 không?", a: "Không. Hỏi đáp chính thức UTC xác nhận năm 2026 dùng IELTS để cộng điểm. Không áp dụng bảng quy đổi IELTS/TOEFL/TOEIC của NEU hay bảng UTC năm 2024–2025.", source: faqSource },
    { q: "Xét học bạ có cần thi lại Toán nếu đã tốt nghiệp năm trước?", a: "Theo trả lời của trường cho mùa 2026, PT2 vẫn yêu cầu điểm thi Toán THPT năm 2026 từ 5; Toán ứng dụng có điều kiện riêng. Học bạ cũ không tự thay thế điều kiện này.", source: faqSource },
    { q: "Có IELTS, giải thưởng hoặc điểm Vẽ thì nộp ở đâu?", a: "Thực hiện hướng dẫn nộp minh chứng trên cổng của trường, tại Hà Nội (GHA). Trang này cũng hướng dẫn thí sinh tốt nghiệp trước năm 2026 đăng ký PT2. Việc khai minh chứng không thay cho đăng ký nguyện vọng trên hệ thống Bộ.", source: guideSource },
    { q: "Điểm sàn có phải điểm chuẩn không?", a: "Không. Điểm sàn là ngưỡng được nhận đăng ký; điểm chuẩn xác định trúng tuyển. UTC công bố ngưỡng theo từng mã và phương thức, không dùng mức sàn 22 của NEU cho UTC.", source: floorSource },
    { q: "Điểm được tính về thang 30 như thế nào?", a: "Theo thông báo ngưỡng đầu vào 07/07/2026: thông thường (Toán × 2 + hai môn còn lại) × 3/4, rồi cộng ưu tiên và điểm cộng hợp lệ. Ngôn ngữ Anh dùng tổng ba môn theo quy định riêng của thông báo. HSA/TSA/ĐGNL cần quy đổi trước.", source: floorSource },
    { q: "Tra điểm chuẩn năm 2026 ở đâu?", a: loadFailed ? "Chưa tải được bảng điểm của app. Có thể xem thông báo điểm chuẩn chính thức bên dưới." : `Database app hiện có ${annual.length} bản ghi chương trình năm 2026, ${published} chương trình có điểm đã nhập. Xem bảng theo phương thức bên dưới và đối chiếu thông báo UTC.`, source: resultSource },
    { q: "App có bao nhiêu chỉ tiêu năm 2026?", a: loadFailed ? "Chưa tải được dữ liệu chỉ tiêu." : `Dữ liệu năm 2026 đang có trong app: ${annual.length} chương trình, tổng chỉ tiêu ${quota}. Đây là phạm vi dữ liệu đã nhập, không tự coi là tổng của cả hai cơ sở UTC.`, source: null },
    { q: "Mã chương trình năm trước khác năm nay thì tra thế nào?", a: "Chọn đúng năm trong bảng. Danh sách lấy từ lịch sử tuyển sinh của năm đó; tên chương trình giúp đối chiếu mã đổi. Không mặc định chương trình năm trước vẫn tuyển năm sau.", source: null },
    { q: "Dự đoán AI có phải kết quả trúng tuyển chính thức?", a: "Không. Điểm dự đoán và phần so sánh của app chỉ để tham khảo. Kết quả xét tuyển thực tế phải xem thông báo trường và hệ thống tuyển sinh.", source: resultSource },
    { q: "Điểm nằm giữa hai mốc trong bảng quy đổi thì làm sao?", a: "UTC dùng nội suy tuyến tính trong đúng khoảng của phương thức. Không quy đổi theo tỷ lệ cố định và không lấy các mốc HSA/TSA của trường khác.", source: conversionSource },
    { q: "Chọn chương trình, học phần và định hướng nghề nghiệp ở đâu?", a: "Dùng Tra cứu chương trình đào tạo để xem thông tin đã nhập; trang So sánh chương trình đối chiếu lịch sử điểm. Khung học phần chỉ hiển thị khi hệ thống đã có dữ liệu liên kết, không suy diễn từ tên ngành.", source: null },
    { q: "Sai hồ sơ, thanh toán chưa ghi nhận hoặc không nhận email thì làm gì?", a: "Giữ mã hồ sơ, ảnh thông báo lỗi và chứng từ giao dịch; liên hệ đầu mối tuyển sinh đúng cơ sở qua kênh chính thức. Không gửi mật khẩu hay OTP. Việc mở khóa hồ sơ và xử lý lệ phí theo hướng dẫn trường, không tự áp dụng quy trình NEU.", source: "https://tuyensinh.utc.edu.vn/?q=lien-he" },
    { q: "Chưa trúng tuyển đợt đầu có còn đợt bổ sung không?", a: "Thông tin tuyển sinh UTC nêu đợt tiếp theo sẽ được thông báo nếu còn chỉ tiêu. Cần theo dõi thông báo thực tế; không kết luận UTC không xét bổ sung dựa vào thông tin NEU.", source: infoSource },
  ];
  return <div className="space-y-6">
    <section id="quy-doi-utc" className={card}>
      <h2 className="flex items-center gap-2 text-lg font-bold"><ArrowLeftRight size={20} />Chứng chỉ và quy đổi điểm UTC 2026</h2>
      <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-7 text-amber-950"><strong>IELTS 2026 là điểm cộng, không thay điểm tiếng Anh.</strong> Không dùng bảng TOEFL/TOEIC/SAT của NEU. Bảng điểm cộng IELTS UTC nằm trong phần điều kiện xét tuyển phía trên.<br /><Source href={faqSource} label="Hỏi đáp chính thức UTC về IELTS" /></div>
      <div className="mt-4 max-w-xl"><h3 className="mb-2 font-semibold">Điểm cộng IELTS · thang điểm 30</h3><table className="w-full border-collapse text-center text-sm [&_th]:border [&_td]:border [&_th]:border-slate-400 [&_td]:border-slate-300 [&_th]:p-2 [&_td]:p-2"><thead className="bg-blue-950 text-white"><tr><th scope="col">IELTS</th><th scope="col">Điểm cộng</th></tr></thead><tbody>{[["5,0", "0,50"], ["5,5", "0,75"], ["6,0", "1,00"], ["6,5", "1,25"], ["Từ 7,0", "1,50"]].map(([ielts, bonus]) => <tr key={ielts} className="even:bg-blue-50"><td>{ielts}</td><td>{bonus}</td></tr>)}</tbody></table><p className="mt-2 text-xs leading-6 text-slate-500">Chứng chỉ cấp sau 30/6/2024; áp dụng điều kiện trong thông báo, không tự cộng dồn mọi loại điểm thưởng.</p><Source href={infoSource} label="Bảng điểm cộng trong thông tin tuyển sinh UTC 2026" /></div>
      <p className="mt-4 text-sm leading-7 text-slate-600">Dành cho xét tuyển tại Hà Nội — mã trường GHA. Ba bảng học bạ, HSA và TSA lấy từ thông báo ngày 07/07/2026, quy đổi về điểm THPT. Đây không phải điểm chuẩn của từng chương trình.</p>
      <div className="mt-4 grid gap-4 xl:grid-cols-2">{scales.map(scale => <details key={scale.name} className="self-start rounded-xl border border-slate-300 bg-slate-50" open>
        <summary className="cursor-pointer p-4 font-semibold text-blue-950">{scale.name}<span className="ml-2 text-xs font-normal text-slate-500">{scale.range}</span></summary>
        <div className="px-3 pb-4"><table className="w-full table-fixed border-collapse text-center text-sm tabular-nums [&_th]:border [&_td]:border [&_th]:border-slate-400 [&_td]:border-slate-300 [&_th]:p-2 [&_td]:p-2"><caption className="sr-only">Quy đổi tương đương {scale.name} và THPT năm 2026</caption><thead className="bg-blue-950 text-white"><tr><th scope="col">THPT · thang 30</th><th scope="col">{scale.name}</th></tr></thead><tbody>{scale.rows.map(([thpt, value]) => <tr key={thpt} className="odd:bg-white even:bg-blue-50"><td>{thpt}</td><td>{value}</td></tr>)}</tbody></table></div>
      </details>)}</div>
      <p className="mt-4 rounded-lg bg-blue-50 p-3 text-sm leading-7">Nội suy: y = y₁ + (x − x₁) × (y₂ − y₁) / (x₂ − x₁). Chỉ áp dụng trong khoảng được công bố, đúng phương thức và điều kiện.</p>
      <Source href={conversionSource} label="Quy đổi chính thức UTC dành cho GHA · 07/07/2026" />
      <Link href="/tinh-diem-quy-doi" className="ml-4 inline-block text-sm font-semibold text-blue-700 underline">Mở công cụ tính điểm</Link>
    </section>
    <section id="kenh-tuyen-sinh" className={card}>
      <h2 className="mb-4 flex items-center gap-2 text-lg font-bold"><Radio size={20} />Các kênh thông tin tuyển sinh chính thức</h2>
      <div className="grid gap-3 md:grid-cols-2">
        {[
          ["Website trường", "Thông báo và văn bản của UTC", "https://www.utc.edu.vn/ttts"],
          ["Tuyển sinh tại Hà Nội · GHA", "Hướng dẫn hồ sơ, minh chứng và thông báo", "https://tuyensinh.utc.edu.vn"],
          ["Điểm chuẩn 2026", "Thông báo kết quả theo mã và phương thức", resultSource],
          ["Ngưỡng đầu vào 2026", "Điểm sàn theo chương trình và phương thức", floorSource],
          ["Hướng dẫn nộp minh chứng", "IELTS, giải thưởng, học bạ và năng khiếu", guideSource],
        ].map(([title, description, href]) => <a key={title} href={href} target="_blank" rel="noopener noreferrer" className="rounded-xl border border-slate-300 p-4 transition-colors hover:border-blue-400 hover:bg-blue-50"><span className="flex items-center justify-between gap-2 font-semibold text-blue-900">{title}<ExternalLink size={15} aria-hidden="true" /></span><span className="mt-2 block text-sm leading-6 text-slate-600">{description}</span></a>)}
      </div>
      <p className="mt-4 text-sm leading-7">Hà Nội: <a className="font-semibold text-blue-700 underline" href="tel:+842437663311">(024) 3766 3311</a> · <a className="text-blue-700 underline" href="mailto:dhgtvt@utc.edu.vn">dhgtvt@utc.edu.vn</a>.</p>
      <Source href="https://www.utc.edu.vn" label="Thông tin liên hệ trên website UTC" />
    </section>
    <section id="giai-dap-nhanh" className={card}>
      <h2 className="flex items-center gap-2 text-lg font-bold"><MessageCircle size={20} />Giải đáp nhanh cho thí sinh UTC</h2>
      <p className="mt-2 text-sm leading-7 text-slate-500">Bấm câu hỏi để đọc. Thông tin tham khảo cần đối chiếu văn bản và thông báo cập nhật của trường.</p>
      <div className="mt-4 divide-y divide-slate-200">{questions.map(item => <details key={item.q} className="group py-3"><summary className="cursor-pointer rounded py-2 text-sm font-semibold leading-6 text-blue-950 focus-visible:outline-2 focus-visible:outline-blue-500">{item.q}</summary><div className="mt-2 rounded-lg bg-slate-50 p-4 text-sm leading-7 text-slate-700"><p>{item.a}</p>{item.source ? <Source href={item.source} label="Đối chiếu nguồn UTC" /> : <span className="mt-2 block text-xs font-medium text-slate-500">Nguồn: dữ liệu và chức năng hiện có của ứng dụng</span>}</div></details>)}</div>
    </section>
  </div>;
}

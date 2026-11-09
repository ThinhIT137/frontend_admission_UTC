"use client";

import { useState } from "react";
import Link from "next/link";
import ScoreHistoryTable, { type ScoreHistoryItem } from "./ScoreHistoryTable";
import PublishedText from "@/components/admission/PublishedText";
import { safeExternalUrl } from "@/components/admission/admission-data";
import { ArrowLeft, BookOpen, GraduationCap, Calendar, Search, Award, CheckCircle2 } from "lucide-react";
import { CmsEditableSection, type CmsArticleItem } from "@/components/cms";

interface CourseFromDbItem {
  ma_ctdt_hoc_phan: string;
  ma_chuong_trinh: string;
  ma_hoc_phan: string;
  nam_ap_dung: number;
  hoc_ky: number;
  loai: string;
  khoi_kien_thuc?: string | null;
  hoc_phan?: {
    ma_hoc_phan: string;
    ten_hoc_phan: string;
    so_tin_chi: number;
    so_tiet_ly_thuyet?: number | null;
    so_tiet_thuc_hanh?: number | null;
    mo_ta?: string | null;
  } | null;
}

interface ProgramItem {
  ma_chuong_trinh: string;
  ten_chuong_trinh: string;
  mo_ta_ngan?: string | null;
  de_cuong?: string | null;
  chuan_dau_ra?: string[] | null;
  luot_xem?: number;
  lich_su_diem_chuan?: any[];
  ctdt_to_hop?: any[];
  hoc_phan?: CourseFromDbItem[];
}

interface CombinationItem {
  ma_to_hop: string;
  ten_mon_1?: string;
  ten_mon_2?: string;
  ten_mon_3?: string;
}

interface Props {
  major: {
    ma_nganh: string;
    ten_nganh: string;
    khoi_kien_thuc?: string | null;
    khoi_nganh?: {
      ma_khoi_nganh: string;
      ten_khoi_nganh: string;
    } | null;
  };
  programs: ProgramItem[];
  initialProgramId?: string;
  combinations: CombinationItem[];
  scoreHistory: ScoreHistoryItem[];
  cmsArticles?: CmsArticleItem[];
  canEditCms?: boolean;
}

export default function ChiTietNganhClient({
  major,
  programs,
  initialProgramId,
  combinations,
  scoreHistory,
  cmsArticles = [],
  canEditCms = false,
}: Props) {
  // Tìm bài viết giới thiệu chuyên sâu ngành theo mã ngành
  const introArticle =
    cmsArticles.find(
      (a) =>
        a.title.includes(`gioi-thieu-${major.ma_nganh}`) ||
        (a.title.toLowerCase().includes("giới thiệu") && a.title.includes(major.ma_nganh)) ||
        (a.title.toLowerCase().includes("giới thiệu") && a.title.toLowerCase().includes(major.ten_nganh.toLowerCase()))
    ) || null;

  // Tìm bài viết lưu ý tuyển sinh & học bổng theo mã ngành
  const admissionNotesArticle =
    cmsArticles.find(
      (a) =>
        a.title.includes(`luu-y-tuyen-sinh-${major.ma_nganh}`) ||
        (a.title.toLowerCase().includes("lưu ý") && a.title.includes(major.ma_nganh)) ||
        (a.title.toLowerCase().includes("học bổng") && a.title.includes(major.ma_nganh)) ||
        (a.title.toLowerCase().includes("lưu ý") && a.title.toLowerCase().includes(major.ten_nganh.toLowerCase()))
    ) || null;

  const [programId, setProgramId] = useState(() => programs.some(p => p.ma_chuong_trinh === initialProgramId)
    ? initialProgramId!
    : programs[0]?.ma_chuong_trinh ?? "");
  const program = programs.find(p => p.ma_chuong_trinh === programId);
  const cohortYears = [...new Set((program?.hoc_phan ?? []).map(c => c.nam_ap_dung))].sort((a, b) => b - a);
  const [cohort, setCohort] = useState("");
  const selectedCohort = cohortYears.includes(Number(cohort)) ? Number(cohort) : cohortYears[0];
  const [semester, setSemester] = useState("ALL");
  const [knowledge, setKnowledge] = useState("ALL");
  const [search, setSearch] = useState("");

  const courses = (program?.hoc_phan ?? []).filter(c => c.nam_ap_dung === selectedCohort);
  const semesters = [...new Set(courses.map(c => c.hoc_ky))].sort((a, b) => a - b);
  const blocks = [...new Set(courses.map(c => c.khoi_kien_thuc).filter((b): b is string => !!b))];
  const filteredCourses = courses.filter(c => (semester === "ALL" || String(c.hoc_ky) === semester)
    && (knowledge === "ALL" || c.khoi_kien_thuc === knowledge)
    && `${c.ma_hoc_phan} ${c.hoc_phan?.ten_hoc_phan ?? ""}`.toLocaleLowerCase("vi").includes(search.trim().toLocaleLowerCase("vi")));

  const years = [...new Set(scoreHistory.map(s => s.nam))].sort((a, b) => b - a);
  const latestQuota = [...new Map(scoreHistory.filter(s => s.nam === years[0]).map(s => [s.ma_chuong_trinh, s.chi_tieu])).values()].reduce((sum, n) => sum + n, 0);
  const outlineUrl = safeExternalUrl(program?.de_cuong);

  const cardClass = "bg-white border border-slate-200/90 rounded-xl p-6 shadow-sm";
  const inputClass = "mt-1.5 w-full min-w-0 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 transition-colors focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600";

  function resetCourses() {
    setCohort("");
    setSemester("ALL");
    setKnowledge("ALL");
    setSearch("");
  }

  return (
    <div className="min-w-0 max-w-full space-y-6 pb-16 text-slate-900">
      {/* Breadcrumb & Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/tra-cuu-nganh-hoc"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-blue-700 transition-colors"
        >
          <ArrowLeft size={14} />
          <span>Quay lại danh sách chương trình</span>
        </Link>
        <span className="text-xs text-slate-400">Trường Đại học Giao thông Vận tải</span>
      </div>

      {/* Main Major Header */}
      <header className={cardClass}>
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-md bg-[#14244e] text-white font-mono text-xs font-semibold">
            MÃ NGÀNH: {major.ma_nganh}
          </span>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-700 text-xs font-medium">
            {major.khoi_nganh?.ten_khoi_nganh || major.khoi_kien_thuc || "Khối ngành Kỹ thuật - Công nghệ"}
          </span>
        </div>

        <h1 className="mt-1 text-2xl sm:text-3xl font-extrabold text-[#14244e] tracking-tight">
          {major.ten_nganh}
        </h1>

        <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-slate-600">
          <span className="flex items-center gap-1.5 font-medium">
            <GraduationCap size={15} className="text-[#14244e]" />
            {programs.length} chương trình đào tạo
          </span>
          <span className="flex items-center gap-1.5 font-medium">
            <Calendar size={15} className="text-[#14244e]" />
            {years[0] ? `Chỉ tiêu năm ${years[0]}: ${latestQuota} sinh viên` : "Chưa công bố chỉ tiêu"}
          </span>
        </div>

        <nav className="mt-5 pt-4 border-t border-slate-100 flex flex-wrap gap-4 text-xs font-semibold text-blue-700">
          <Link href="/so-sanh-chuong-trinh" className="hover:underline">So sánh chương trình</Link>
          <Link href="/thong-tin-tuyen-sinh" className="hover:underline">Đề án tuyển sinh</Link>
          <Link href="/tinh-diem-quy-doi" className="hover:underline">Tính điểm quy đổi</Link>
          <Link href="/nop-ho-so" className="hover:underline text-emerald-700">Nộp hồ sơ xét tuyển</Link>
        </nav>
      </header>

      {/* Program Details Section */}
      <section className={cardClass} aria-labelledby="program-heading">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <BookOpen size={20} className="text-[#14244e]" />
            <h2 id="program-heading" className="text-lg font-bold text-[#14244e]">Chương trình đào tạo chi tiết</h2>
          </div>
          {programs.length > 1 && (
            <span className="text-xs text-slate-500">Chọn chương trình bên dưới để xem khung môn học tương ứng</span>
          )}
        </div>

        {!programs.length ? (
          <p className="mt-4 text-sm text-slate-500">Chưa có thông tin chương trình đào tạo.</p>
        ) : (
          <div className="mt-4 space-y-6">
            <label className="block text-xs font-semibold text-slate-700">
              Chương trình đào tạo đang xem:
              <select
                className={inputClass}
                value={programId}
                onChange={e => {
                  setProgramId(e.target.value);
                  resetCourses();
                }}
              >
                {programs.map(p => (
                  <option key={p.ma_chuong_trinh} value={p.ma_chuong_trinh}>
                    {p.ma_chuong_trinh} · {p.ten_chuong_trinh}
                  </option>
                ))}
              </select>
            </label>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="rounded-lg bg-slate-50/70 border border-slate-100 p-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Giới thiệu & Định hướng</h3>
                <div className="text-sm text-slate-700 leading-relaxed">
                  <PublishedText content={program?.mo_ta_ngan || "Chương trình đào tạo cử nhân / kỹ sư chất lượng cao, trang bị nền tảng chuyên môn vững chắc và kỹ năng thực hành hiện đại."} />
                </div>
              </div>

              <div className="rounded-lg bg-slate-50/70 border border-slate-100 p-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Đề cương & Chuẩn đầu ra</h3>
                {outlineUrl ? (
                  <a
                    href={outlineUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-700 hover:underline mb-2"
                  >
                    Xem văn bản đề cương chính thức ↗
                  </a>
                ) : (
                  <div className="text-sm text-slate-700 mb-2">
                    <PublishedText content={program?.de_cuong || "Đề cương chi tiết được ban hành kèm theo quyết định đào tạo của Trường Đại học Giao thông Vận tải."} />
                  </div>
                )}

                {program?.chuan_dau_ra?.length ? (
                  <div className="mt-2 pt-2 border-t border-slate-200/60">
                    <p className="text-xs font-semibold text-slate-600 mb-1">Chuẩn đầu ra chính:</p>
                    <ul className="space-y-1">
                      {program.chuan_dau_ra.slice(0, 4).map((item, i) => (
                        <li key={`${item}-${i}`} className="flex items-start gap-1.5 text-xs text-slate-600">
                          <CheckCircle2 size={13} className="text-emerald-600 shrink-0 mt-0.5" />
                          <span>{item.replace(/_/g, " ")}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        )}
      </section>

      {/* 1. GIỚI THIỆU CHUYÊN SÂU & ĐỊNH HƯỚNG NGHỀ NGHIỆP - TÍCH HỢP TIPTAP CMS */}
      <CmsEditableSection
        sectionId={`gioi-thieu-${major.ma_nganh}`}
        title={`Giới thiệu & Định hướng nghề nghiệp ngành ${major.ten_nganh} (${major.ma_nganh})`}
        badgeText="Thông tin đào tạo & Nghề nghiệp"
        icon={<GraduationCap size={20} className="text-[#14244e]" />}
        category="TIN TỨC"
        variant="blue"
        initialArticle={introArticle}
        defaultContentHtml={`
          <p>Ngành <strong>${major.ten_nganh}</strong> (Mã ngành: <strong>${major.ma_nganh}</strong>) thuộc ${major.khoi_nganh?.ten_khoi_nganh || "khối ngành đào tạo trọng điểm"} của Trường Đại học Giao thông Vận tải. Chương trình đào tạo được xây dựng theo định hướng ứng dụng thực tiễn, gắn liền với nhu cầu nguồn nhân lực chất lượng cao của cuộc Cách mạng Công nghiệp 4.0 và chuyển đổi số.</p>
          <div class="cms-grid-2">
            <div class="cms-tile">
              <h3>1. Mục tiêu đào tạo & Năng lực cốt lõi</h3>
              <ul>
                <li>Trang bị hệ thống kiến thức nền tảng vững chắc và chuyên sâu trong lĩnh vực ${major.ten_nganh}.</li>
                <li>Phát triển kỹ năng thực hành, tư duy giải quyết vấn đề kỹ thuật và nghiên cứu công nghệ hiện đại.</li>
                <li>Nâng cao năng lực ngoại ngữ chuyên ngành, làm việc nhóm và thích ứng nhanh trong môi trường quốc tế.</li>
              </ul>
            </div>
            <div class="cms-tile">
              <h3>2. Vị trí việc làm sau tốt nghiệp</h3>
              <ul>
                <li>Chuyên viên kỹ thuật, kỹ sư phân tích, thiết kế và triển khai tại các doanh nghiệp, tập đoàn đa quốc gia.</li>
                <li>Cán bộ nghiên cứu, quản lý dự án tại các viện nghiên cứu, trường đại học hoặc cơ quan nhà nước.</li>
                <li>Khởi nghiệp công nghệ hoặc đảm nhận các vai trò cố vấn chuyên môn, tư vấn giải pháp kỹ thuật.</li>
              </ul>
            </div>
            <div class="cms-tile">
              <h3>3. Cơ hội thực tập & Hợp tác doanh nghiệp</h3>
              <ul>
                <li>Mạng lưới liên kết với hơn 200 tập đoàn, tổng công ty hàng đầu trong và ngoài nước.</li>
                <li>Sinh viên được tham gia các kỳ thực tập nghề nghiệp, ngày hội việc làm (Job Fair) ngay từ năm thứ 3.</li>
                <li>Cơ hội nhận học bổng tài trợ và tuyển dụng trực tiếp trước khi nhận bằng tốt nghiệp.</li>
              </ul>
            </div>
            <div class="cms-tile">
              <h3>4. Khả năng phát triển sau đại học</h3>
              <ul>
                <li>Đủ điều kiện xét tuyển học chuyển tiếp bậc Thạc sĩ, Tiến sĩ tại UTC hoặc các trường đối tác quốc tế.</li>
                <li>Chuyển tiếp tín chỉ và nhận các học bổng sau đại học uy tín tại Pháp, Nhật Bản, Hàn Quốc, Đài Loan...</li>
              </ul>
            </div>
          </div>
        `.trim()}
        canEdit={canEditCms}
        sourceUrl="https://tuyensinh.utc.edu.vn"
        sourceLabel="Website Tuyển sinh UTC chính thức"
      />

      {/* Curriculum Course Matrix (Học phần) */}
      <section className={cardClass} aria-labelledby="courses-heading">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Award size={20} className="text-[#14244e]" />
              <h2 id="courses-heading" className="text-lg font-bold text-[#14244e]">
                Khung chương trình đào tạo ({program?.ma_chuong_trinh || major.ma_nganh})
              </h2>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              Danh mục các học phần, số tín chỉ và khối kiến thức quy định cho sinh viên khóa tuyển sinh tương ứng.
            </p>
          </div>
          {courses.length > 0 && (
            <span className="self-start sm:self-auto inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-800">
              {courses.length} học phần ({courses.reduce((sum, c) => sum + (c.hoc_phan?.so_tin_chi ?? 0), 0)} tín chỉ)
            </span>
          )}
        </div>

        {/* Filters */}
        <div className="my-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <label className="text-xs font-semibold text-slate-700">
            Khóa áp dụng
            <select
              className={inputClass}
              value={selectedCohort ?? ""}
              onChange={e => {
                setCohort(e.target.value);
                setSemester("ALL");
                setKnowledge("ALL");
              }}
            >
              {!cohortYears.length && <option value="">Chưa có dữ liệu</option>}
              {cohortYears.map(y => (
                <option key={y} value={y}>Khóa năm {y}</option>
              ))}
            </select>
          </label>

          <label className="text-xs font-semibold text-slate-700">
            Học kỳ
            <select
              className={inputClass}
              value={semester}
              onChange={e => setSemester(e.target.value)}
            >
              <option value="ALL">Tất cả các kỳ (1-8)</option>
              {semesters.map(s => (
                <option key={s} value={s}>Học kỳ {s}</option>
              ))}
            </select>
          </label>

          <label className="text-xs font-semibold text-slate-700">
            Khối kiến thức
            <select
              className={inputClass}
              value={knowledge}
              onChange={e => setKnowledge(e.target.value)}
            >
              <option value="ALL">Tất cả khối kiến thức</option>
              {blocks.map(b => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </label>

          <label className="text-xs font-semibold text-slate-700">
            Tìm kiếm môn học
            <div className="relative">
              <input
                className={`${inputClass} pl-8`}
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Mã hoặc tên học phần..."
              />
              <Search size={14} className="absolute left-2.5 top-4 text-slate-400 pointer-events-none" />
            </div>
          </label>
        </div>

        {!courses.length ? (
          <p className="py-6 text-center text-sm text-slate-500">
            Chưa có danh mục học phần được số hóa cho chương trình này. Dữ liệu chuẩn được quản lý bởi Phòng Đào tạo UTC.
          </p>
        ) : (
          <div className="space-y-3">
            <p aria-live="polite" className="text-xs text-slate-500">
              Hiển thị <span className="font-semibold text-slate-800">{filteredCourses.length}</span> / {courses.length} học phần
              ({filteredCourses.reduce((sum, c) => sum + (c.hoc_phan?.so_tin_chi ?? 0), 0)} tín chỉ trong bộ lọc).
            </p>

            <div className="overflow-x-auto rounded-lg border border-slate-200/80">
              <table className="w-full min-w-[680px] border-collapse text-left text-sm">
                <caption className="sr-only">Học phần chương trình theo năm áp dụng</caption>
                <thead className="bg-slate-50 text-slate-700 text-xs font-semibold uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th scope="col" className="p-3 w-28 font-mono">Mã HP</th>
                    <th scope="col" className="p-3 min-w-[200px]">Tên học phần</th>
                    <th scope="col" className="p-3 w-24 text-center">Tín chỉ</th>
                    <th scope="col" className="p-3 w-24 text-center">Học kỳ</th>
                    <th scope="col" className="p-3 w-36">Loại môn</th>
                    <th scope="col" className="p-3 min-w-[150px]">Khối kiến thức</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {filteredCourses.map(c => (
                    <tr key={c.ma_ctdt_hoc_phan} className="hover:bg-blue-50/30 transition-colors">
                      <td className="p-3 font-mono text-xs font-semibold text-[#14244e]">{c.ma_hoc_phan}</td>
                      <td className="p-3">
                        <div className="font-medium text-slate-900">{c.hoc_phan?.ten_hoc_phan ?? "Chưa có tên học phần"}</div>
                        {c.hoc_phan?.mo_ta && (
                          <details className="mt-1 text-xs text-slate-500">
                            <summary className="cursor-pointer text-blue-700 hover:underline">Chi tiết môn</summary>
                            <p className="mt-1 p-2 bg-slate-50 rounded border border-slate-100 whitespace-pre-wrap">{c.hoc_phan.mo_ta}</p>
                          </details>
                        )}
                      </td>
                      <td className="p-3 text-center tabular-nums">
                        <span className="inline-block px-2 py-0.5 bg-slate-100 rounded text-xs font-semibold text-slate-700">
                          {c.hoc_phan?.so_tin_chi ?? "—"}
                        </span>
                      </td>
                      <td className="p-3 text-center tabular-nums text-xs font-medium text-slate-700">
                        Kỳ {c.hoc_ky}
                      </td>
                      <td className="p-3 text-xs">
                        {c.loai === "bat_buoc" ? (
                          <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-blue-50 text-blue-700">Bắt buộc</span>
                        ) : c.loai === "tu_chon" ? (
                          <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-amber-50 text-amber-700">Tự chọn</span>
                        ) : (
                          <span className="text-slate-600">{c.loai}</span>
                        )}
                      </td>
                      <td className="p-3 text-xs text-slate-600">
                        {c.khoi_kien_thuc || "Cơ bản"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {!filteredCourses.length && (
              <p className="py-4 text-center text-xs text-slate-400">
                Không tìm thấy học phần nào khớp với tiêu chí tìm kiếm.
              </p>
            )}
          </div>
        )}
      </section>

      {/* Combinations Section */}
      <section className={cardClass}>
        <div className="border-b border-slate-100 pb-3 mb-4">
          <h2 className="text-lg font-bold text-[#14244e]">Tổ hợp môn xét tuyển áp dụng</h2>
          <p className="mt-1 text-xs text-slate-500">
            Các tổ hợp môn truyền thống và quy đổi áp dụng cho đợt tuyển sinh chính quy tại Cơ sở Hà Nội (GHA).
          </p>
        </div>

        {combinations.length ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {combinations.map(c => (
              <div key={c.ma_to_hop} className="rounded-lg border border-slate-200/90 bg-slate-50/50 p-3.5 hover:bg-white hover:shadow-xs transition-all">
                <span className="inline-block px-2 py-0.5 rounded bg-[#14244e] text-white font-mono text-xs font-bold mb-1.5">
                  {c.ma_to_hop}
                </span>
                <p className="text-xs text-slate-700 font-medium">
                  {[c.ten_mon_1, c.ten_mon_2, c.ten_mon_3].filter(Boolean).join(" · ")}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-500">Chưa có thông tin tổ hợp được cập nhật.</p>
        )}
      </section>

      {/* 2. LƯU Ý TUYỂN SINH & HỌC BỔNG NGÀNH HỌC - TÍCH HỢP TIPTAP CMS */}
      <CmsEditableSection
        sectionId={`luu-y-tuyen-sinh-${major.ma_nganh}`}
        title={`Lưu ý tuyển sinh & Cơ hội học bổng ngành ${major.ten_nganh}`}
        badgeText="Quy chế & Học bổng"
        icon={<Award size={20} className="text-amber-700" />}
        category="QUY CHẾ"
        variant="amber"
        initialArticle={admissionNotesArticle}
        defaultContentHtml={`
          <div class="cms-grid-3">
            <div class="cms-tile">
              <h3>1. Tiêu chí phụ xét tuyển</h3>
              <p>Trong trường hợp các thí sinh có cùng mức điểm trúng tuyển ở cuối danh sách, hội đồng tuyển sinh xét ưu tiên thứ tự nguyện vọng và điểm môn học chính của tổ hợp môn đã đăng ký.</p>
            </div>
            <div class="cms-tile">
              <h3>2. Điểm cộng chứng chỉ ngoại ngữ</h3>
              <p>Thí sinh sở hữu chứng chỉ IELTS từ 5.0 trở lên (hoặc tương đương) được cộng điểm ưu tiên theo thang điểm quy đổi của UTC khi xét tuyển theo phương thức phù hợp.</p>
            </div>
            <div class="cms-tile">
              <h3>3. Học bổng & Hỗ trợ sinh viên</h3>
              <p>Nhà trường dành 8% quỹ học phí trao học bổng khuyến khích học tập; học bổng doanh nghiệp tài trợ riêng dành cho thủ khoa đầu vào và sinh viên có thành tích xuất sắc của ngành.</p>
            </div>
          </div>
          <p class="cms-tile-source"><em>Thí sinh cần đối chiếu kỹ Đề án tuyển sinh chính thức và ngưỡng đảm bảo chất lượng đầu vào (điểm sàn) trước khi đăng ký nguyện vọng.</em></p>
        `.trim()}
        canEdit={canEditCms}
        sourceUrl="https://tuyensinh.utc.edu.vn"
        sourceLabel="Thông báo Tuyển sinh UTC 2026"
      />

      {/* Historical Score Table */}
      <ScoreHistoryTable scoreHistory={scoreHistory} />
    </div>
  );
}

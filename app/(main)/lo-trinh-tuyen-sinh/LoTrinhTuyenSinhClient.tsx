"use client";

import {
    admissionDay,
    displayAdmissionDate,
    milestoneStatus,
    statusLabels,
    type MilestoneStatus,
} from "@/components/admission/admission-data";
import Link from "next/link";
import { useState } from "react";
import { ArrowRight, CalendarDays, Clock3, Search, SlidersHorizontal, RotateCcw } from "lucide-react";
import { CandidatePage, CandidatePageHeader } from "@/components/admission/CandidatePage";
import styles from "@/components/admission/candidate.module.css";
import { CmsEditableSection, type CmsArticleItem } from "@/components/cms";

interface Milestone {
    ma_su_kien: string;
    ten_su_kien: string;
    thoi_gian_bat_dau: string | Date;
    thoi_gian_ket_thuc: string | Date | null;
    ghi_chu: string | null;
}

export default function LoTrinhTuyenSinhClient({
    dbMilestones,
    referenceTime,
    loadError = false,
    cmsArticles = [],
    canEditCms = false,
}: {
    dbMilestones: Milestone[];
    referenceTime: string;
    loadError?: boolean;
    cmsArticles?: CmsArticleItem[];
    canEditCms?: boolean;
}) {
    // Tìm bài viết CMS tùy biến cho mục hướng dẫn lộ trình nếu có
    const loTrinhArticle =
        cmsArticles.find(
            (a) =>
                a.title.includes("huong-dan-lo-trinh") ||
                a.title.toLowerCase().includes("lộ trình") ||
                a.title.toLowerCase().includes("hướng dẫn thí sinh")
        ) || null;

    const [year, setYear] = useState("ALL");
    const [status, setStatus] = useState<MilestoneStatus | "ALL">("ALL");
    const [search, setSearch] = useState("");
    const milestones = [...dbMilestones].sort((a, b) =>
        (admissionDay(a.thoi_gian_bat_dau) ?? "9999").localeCompare(
            admissionDay(b.thoi_gian_bat_dau) ?? "9999",
        ),
    );
    const years = [
        ...new Set(
            milestones
                .map((m) => admissionDay(m.thoi_gian_bat_dau)?.slice(0, 4))
                .filter((y): y is string => !!y),
        ),
    ]
        .sort()
        .reverse();
    const filtered = milestones.filter(
        (m) =>
            (year === "ALL" ||
                admissionDay(m.thoi_gian_bat_dau)?.startsWith(year)) &&
            (status === "ALL" ||
                milestoneStatus(
                    m.thoi_gian_bat_dau,
                    m.thoi_gian_ket_thuc,
                    referenceTime,
                ) === status) &&
            `${m.ten_su_kien} ${m.ghi_chu ?? ""}`
                .toLocaleLowerCase("vi")
                .includes(search.trim().toLocaleLowerCase("vi")),
    );
    const tones: Record<MilestoneStatus, string> = { ACTIVE: "amber", PAST: "green", UPCOMING: "blue", UNKNOWN: "slate" };
    return <CandidatePage>
        <CandidatePageHeader icon={CalendarDays} eyebrow="Hành trình đến với UTC · GHA" title="Lộ trình tuyển sinh" description="Theo dõi các mốc quan trọng, chuẩn bị hồ sơ đúng thời hạn và chủ động với kế hoạch xét tuyển của bạn.">
            <Link href="/thong-tin-tuyen-sinh">Thông tin tuyển sinh<ArrowRight size={15} aria-hidden="true" /></Link>
            <Link href="/nop-ho-so">Nộp hồ sơ trực tuyến<ArrowRight size={15} aria-hidden="true" /></Link>
        </CandidatePageHeader>
        {loadError && <p role="alert" className={styles.error}>Chưa tải được lộ trình tuyển sinh. Vui lòng thử lại sau.</p>}
        <section className={styles.panel} aria-label="Bộ lọc lộ trình">
            <div className={styles.panelHeading}><SlidersHorizontal size={20} aria-hidden="true" /><div><h2>Tìm mốc thời gian của bạn</h2><p>Lọc theo năm, trạng thái hoặc tên sự kiện.</p></div></div>
            <div className={styles.filterGrid}>
                <label className={styles.field}>Tìm kiếm<div className="relative"><Search size={17} aria-hidden="true" className="absolute left-3 top-3.5 text-slate-400" /><input style={{paddingLeft:38}} className={styles.control} value={search} onChange={e=>setSearch(e.target.value)} placeholder="Tên mốc hoặc ghi chú" /></div></label>
                <label className={styles.field}>Năm tuyển sinh<select className={styles.control} value={year} onChange={e=>setYear(e.target.value)}><option value="ALL">Tất cả năm</option>{years.map(y=><option key={y}>{y}</option>)}</select></label>
                <label className={styles.field}>Trạng thái<select className={styles.control} value={status} onChange={e=>setStatus(e.target.value as MilestoneStatus | "ALL")}><option value="ALL">Tất cả trạng thái</option>{Object.entries(statusLabels).map(([value,label])=><option key={value} value={value}>{label}</option>)}</select></label>
                <button className={styles.secondary} onClick={()=>{setYear("ALL");setStatus("ALL");setSearch("");}}><RotateCcw size={15} aria-hidden="true" />Xóa bộ lọc</button>
            </div>
        </section>
        <div className={styles.summary}><span aria-live="polite"><strong>{filtered.length}</strong> / {milestones.length} mốc thời gian</span><span className="inline-flex items-center gap-2"><Clock3 size={15} aria-hidden="true" />{displayAdmissionDate(referenceTime)} · Giờ Việt Nam</span></div>
        {!filtered.length && !loadError && <div className={styles.empty}><CalendarDays size={32} aria-hidden="true" /><h2>{milestones.length ? "Không tìm thấy mốc phù hợp" : "Chưa có lịch tuyển sinh"}</h2><p>{milestones.length ? "Thử thay đổi từ khóa hoặc xóa bộ lọc để xem các mốc khác." : "Các mốc thời gian sẽ xuất hiện khi được cập nhật trong hệ thống."}</p></div>}
        <div className={styles.timeline}>
            {filtered.map(m=>{
                const state=milestoneStatus(m.thoi_gian_bat_dau,m.thoi_gian_ket_thuc,referenceTime);
                return <article key={m.ma_su_kien} className={styles.milestone} data-status={state}>
                    <div className={styles.dateBox}><span>Bắt đầu</span><strong>{displayAdmissionDate(m.thoi_gian_bat_dau)}</strong>{m.thoi_gian_ket_thuc && <><span>Đến ngày</span><strong>{displayAdmissionDate(m.thoi_gian_ket_thuc)}</strong></>}</div>
                    <div><span className={`${styles.badge} ${styles[tones[state]]}`}><Clock3 size={14} aria-hidden="true" />{statusLabels[state]}</span><h2>{m.ten_su_kien}</h2><p>{m.ghi_chu || "Chưa công bố hướng dẫn cho mốc này."}</p></div>
                </article>;
            })}
        </div>
        <p className={styles.notice}>Mốc không có ngày kết thúc được hiển thị theo ngày bắt đầu. Hãy đọc ghi chú của từng sự kiện để biết thời hạn và hướng dẫn cụ thể.</p>

        {/* Hướng dẫn thủ tục theo mốc - CMS TipTap Động */}
        <div className="mt-8">
            <CmsEditableSection
                sectionId="huong-dan-lo-trinh"
                title="Lưu ý & Hướng dẫn thí sinh theo các mốc tuyển sinh UTC"
                badgeText="Hướng dẫn thực hiện"
                icon={<CalendarDays size={20} className="text-[#14244e]" />}
                category="HƯỚNG DẪN"
                variant="slate"
                initialArticle={loTrinhArticle}
                defaultContentHtml={`
                    <div class="cms-grid-3">
                        <div class="cms-tile">
                            <h3>1. Đăng ký & Điều chỉnh nguyện vọng</h3>
                            <p>Thực hiện trực tuyến hoàn toàn trên Cổng thông tin tuyển sinh của Bộ GD&ĐT theo đúng thời hạn quy định.</p>
                            <p>Mã trường Đại học Giao thông Vận tải (Cơ sở Hà Nội): <strong>GHA</strong>.</p>
                        </div>
                        <div class="cms-tile">
                            <h3>2. Xác nhận nhập học trực tuyến</h3>
                            <p>Sau khi có thông báo trúng tuyển, thí sinh bắt buộc phải xác nhận nhập học trực tuyến trên Cổng của Bộ GD&ĐT.</p>
                            <p>Thí sinh không xác nhận trong thời hạn quy định coi như từ chối cơ hội trúng tuyển.</p>
                        </div>
                        <div class="cms-tile">
                            <h3>3. Làm thủ tục nhập học tại trường</h3>
                            <p>Chuẩn bị đầy đủ hồ sơ bản chính (Học bạ, Giấy chứng nhận tốt nghiệp THPT tạm thời, CCCD, Giấy báo trúng tuyển).</p>
                            <p>Đến trường hoàn tất thủ tục và đóng học phí tạm thu theo lịch thông báo của Hội đồng Tuyển sinh.</p>
                        </div>
                    </div>
                    <p class="cms-tile-source"><em>Nguồn thông tin chính thức: Thường xuyên theo dõi lịch cập nhật tại website tuyển sinh UTC hoặc liên hệ hotline phòng Đào tạo để được hỗ trợ kịp thời.</em></p>
                `.trim()}
                canEdit={canEditCms}
                sourceUrl="https://tuyensinh.utc.edu.vn"
                sourceLabel="Cổng Tuyển sinh UTC chính thức"
            />
        </div>
    </CandidatePage>;
}
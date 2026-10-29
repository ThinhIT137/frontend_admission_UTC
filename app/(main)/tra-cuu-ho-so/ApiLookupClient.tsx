"use client";
import { useEffect, useRef, useState } from "react";
import { api, BrowserApiError } from "@/libs/api-services/browser-api";
import Link from "next/link";
import { ArrowRight, FileSearch, Info, Search } from "lucide-react";
import { ApplicationStatus, CandidateLoading, CandidatePage, CandidatePageHeader } from "@/components/admission/CandidatePage";
import styles from "@/components/admission/candidate.module.css";

type Row = { ma_chuong_trinh: string; ten_chuong_trinh: string | null; ma_phuong_thuc: string; ten_phuong_thuc: string | null; nam_tuyen_sinh: number; trang_thai: string; ket_qua: "trung_tuyen" | "khong_trung_tuyen" | "chua_cong_bo" };
const resultLabel = { trung_tuyen: "Trúng tuyển", khong_trung_tuyen: "Không trúng tuyển", chua_cong_bo: "Chưa công bố kết quả" };

export default function ApiLookupClient() {
  const [query, setQuery] = useState("");
  const [rows, setRows] = useState<Row[] | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const generation = useRef(0);
  useEffect(() => () => { generation.current++; }, []);
  return <CandidatePage>
    <CandidatePageHeader icon={FileSearch} eyebrow="Tra cứu công khai · UTC GHA" title="Tra cứu hồ sơ và kết quả" description="Nhập CCCD 12 số để xem tiến độ xử lý và kết quả đã công bố, không cần đăng nhập.">
      <Link href="/nguyen-vong-cua-toi">Quản lý nguyện vọng của tôi<ArrowRight size={15} aria-hidden="true" /></Link>
    </CandidatePageHeader>
    <section className={styles.panel}>
      <div className={styles.panelHeading}><Search size={21} aria-hidden="true" /><div><h2>Tra cứu bằng CCCD</h2><p>Chỉ hiển thị chương trình, phương thức và trạng thái công khai của hồ sơ.</p></div></div>
      <form className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-end" onSubmit={async e => {
        e.preventDefault();
        const cccd = query.trim();
        if (!/^[0-9]{12}$/.test(cccd)) { setError("Vui lòng nhập đúng CCCD gồm 12 chữ số."); setRows(null); return; }
        const current = ++generation.current; setBusy(true); setError(""); setRows(null);
        try {
          const data = await api<Row[]>("score", "/ho-so/tra-cuu-cong-khai", { cccd });
          if (current === generation.current) setRows(data);
        } catch (err) {
          if (current === generation.current) setError(err instanceof BrowserApiError && err.status === 404
            ? "Chức năng tra cứu công khai cần cập nhật backend điểm. Vui lòng thử lại sau."
            : "Chưa thể tra cứu hồ sơ. Vui lòng kiểm tra CCCD và thử lại sau.");
        } finally { if (current === generation.current) setBusy(false); }
      }}>
        <label className={`${styles.field} flex-1`}>CCCD 12 số<input className={styles.control} aria-label="CCCD tra cứu" placeholder="Nhập CCCD gồm 12 chữ số" value={query} onChange={e=>{generation.current++;setQuery(e.target.value);setRows(null);setError("");setBusy(false);}} inputMode="numeric" autoComplete="off" minLength={12} maxLength={12} pattern="[0-9]{12}" required /></label>
        <button disabled={busy} className={styles.primary}><Search size={17} aria-hidden="true" />{busy ? "Đang tra cứu…" : "Tra cứu"}</button>
      </form>
    </section>
    {busy && <CandidateLoading>Đang tra cứu hồ sơ…</CandidateLoading>}
    {error && <p role="alert" className={styles.error}>{error}</p>}
    {rows?.length === 0 && <div className={styles.empty}><FileSearch size={34} aria-hidden="true" /><h2>Không tìm thấy hồ sơ</h2><p>Kiểm tra lại thông tin đã nhập.</p></div>}
    {rows && rows.length > 0 && <><div className={styles.summary} aria-live="polite"><strong>Tìm thấy {rows.length} kết quả</strong></div><div className={styles.resultGrid}>{rows.map((r,index)=><article key={`${r.nam_tuyen_sinh}-${r.ma_chuong_trinh}-${r.ma_phuong_thuc}-${index}`} className={styles.result}>
      <div className={styles.resultHeader}><span className="rounded-lg bg-blue-50 p-2 text-blue-800"><FileSearch size={20} aria-hidden="true" /></span><ApplicationStatus status={r.trang_thai}/></div>
      <h2>{r.ten_chuong_trinh || r.ma_chuong_trinh}</h2>
      <dl className={styles.resultMeta}><div><dt>Mã chương trình</dt><dd>{r.ma_chuong_trinh}</dd></div><div><dt>Phương thức</dt><dd>{r.ten_phuong_thuc || r.ma_phuong_thuc}</dd></div><div><dt>Năm tuyển sinh</dt><dd>{r.nam_tuyen_sinh}</dd></div></dl>
      <div className={styles.resultMessage}>{resultLabel[r.ket_qua] || resultLabel.chua_cong_bo}</div>
    </article>)}</div></>}
    <p className={styles.notice}><Info size={18} aria-hidden="true"/><span>Trạng thái hợp lệ chưa phải kết luận trúng tuyển. Đỗ/trượt chỉ hiển thị sau khi kết quả được công bố. Đăng nhập tại Nguyện vọng của tôi để xem thông tin riêng và quản lý hồ sơ.</span></p>
  </CandidatePage>;
}
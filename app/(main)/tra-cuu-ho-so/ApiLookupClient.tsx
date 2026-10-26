"use client";
import { publicError } from "@/libs/client-error";
import { useCallback, useEffect, useRef, useState } from "react";
import CandidateSession from "@/components/CandidateSession";
import { api } from "@/libs/api-services/browser-api";
import Link from "next/link";
import { ArrowRight, FileSearch, Info, Search, ShieldCheck } from "lucide-react";
import { ApplicationStatus, CandidateLoading, CandidatePage, CandidatePageHeader } from "@/components/admission/CandidatePage";
import styles from "@/components/admission/candidate.module.css";
type Row = { ma_ho_so: string; ma_chuong_trinh: string; ma_phuong_thuc: string; nam_tuyen_sinh: number; trang_thai: string; ket_qua?: string };
export default function ApiLookupClient() {
  const [query, setQuery] = useState("");
  const [rows, setRows] = useState<Row[] | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  const generation = useRef(0);
  useEffect(() => () => { generation.current++; }, []);
  const authenticated = useCallback(() => { generation.current++; setSignedIn(true); setRows(null); setError(""); setBusy(false); }, []);
  const logout = () => { generation.current++; setSignedIn(false); setQuery(""); setRows(null); setError(""); setBusy(false); };
  return <CandidatePage>
    <CandidatePageHeader icon={FileSearch} eyebrow="Theo dõi hồ sơ · UTC" title="Tra cứu hồ sơ và kết quả" description="Kiểm tra tiến độ xử lý và đọc thông báo của bộ phận tuyển sinh. Kết quả của bạn luôn được bảo vệ theo tài khoản thí sinh.">
      <Link href="/nguyen-vong-cua-toi">Tất cả nguyện vọng của tôi<ArrowRight size={15} aria-hidden="true" /></Link>
    </CandidatePageHeader>
    <CandidateSession onAuthenticated={authenticated} onLogout={logout} />
    {!signedIn && <div className={styles.notice}><ShieldCheck size={19} aria-hidden="true" /><span>Đăng nhập để tra cứu hồ sơ thuộc tài khoản của bạn. Mã hồ sơ hoặc CCCD không thay thế quyền đăng nhập.</span></div>}
    {signedIn && <section className={styles.panel}>
      <div className={styles.panelHeading}><Search size={21} aria-hidden="true" /><div><h2>Tìm hồ sơ đã nộp</h2><p>Nhập mã hồ sơ bạn nhận được sau khi nộp thành công, hoặc CCCD 12 số.</p></div></div>
      <form className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-end" onSubmit={async e => { e.preventDefault(); const current = ++generation.current; setBusy(true); setError(""); setRows(null); try { const q = query.trim(); if (!q) throw Error("Missing query"); const data = await api<Row[]>("score", `/ho-so/tra-cuu?${/^\d{12}$/.test(q) ? "cccd" : "ma_ho_so"}=${encodeURIComponent(q)}`); if (current === generation.current) setRows(data); } catch (err) { if (current === generation.current) setError(publicError(err, "Không thể tra cứu hồ sơ của bạn. Kiểm tra thông tin và phiên đăng nhập.")); } finally { if (current === generation.current) setBusy(false); } }}>
        <label className={`${styles.field} flex-1`}>Mã hồ sơ hoặc CCCD<input className={styles.control} aria-label="Mã hồ sơ hoặc CCCD" placeholder="Nhập mã hồ sơ hoặc CCCD 12 số" value={query} onChange={e => setQuery(e.target.value)} required /></label>
        <button disabled={busy} className={styles.primary}><Search size={17} aria-hidden="true" />{busy ? "Đang tra cứu…" : "Tra cứu"}</button>
      </form>
    </section>}
    {busy && <CandidateLoading>Đang tìm hồ sơ của bạn…</CandidateLoading>}
    {error && <p role="alert" className={styles.error}>{error}</p>}
    {rows?.length === 0 && <div className={styles.empty}><FileSearch size={34} aria-hidden="true" /><h2>Không tìm thấy hồ sơ</h2><p>Kiểm tra lại mã đã nhập hoặc mở danh sách nguyện vọng để xem toàn bộ hồ sơ của bạn.</p><Link className={styles.secondary} href="/nguyen-vong-cua-toi">Xem nguyện vọng<ArrowRight size={15} aria-hidden="true" /></Link></div>}
    {rows && rows.length > 0 && <><div className={styles.summary} aria-live="polite"><strong>Tìm thấy {rows.length} hồ sơ</strong></div><div className={styles.resultGrid}>{rows.map(r => <article key={r.ma_ho_so} className={styles.result}>
      <div className={styles.resultHeader}><span className="rounded-lg bg-blue-50 p-2 text-blue-800"><FileSearch size={20} aria-hidden="true" /></span><ApplicationStatus status={r.trang_thai} /></div>
      <div><p className="mb-1 text-xs text-slate-500">Mã hồ sơ</p><h2 className="font-mono text-sm!">{r.ma_ho_so}</h2></div>
      <dl className={styles.resultMeta}><div><dt>Chương trình</dt><dd>{r.ma_chuong_trinh}</dd></div><div><dt>Phương thức</dt><dd>{r.ma_phuong_thuc}</dd></div><div><dt>Năm tuyển sinh</dt><dd>{r.nam_tuyen_sinh}</dd></div></dl>
      <div className={styles.resultMessage}><strong className="mb-1 block text-xs text-slate-600">Thông báo từ bộ phận tuyển sinh</strong>{r.ket_qua || "Chưa có thông báo"}</div>
    </article>)}</div></>}
    {signedIn && <p className={styles.notice}><Info size={18} aria-hidden="true" /><span>Hồ sơ hợp lệ chưa đồng nghĩa với kết quả trúng tuyển chính thức. Quyết định đỗ/trượt chỉ hiển thị sau công bố.</span></p>}
  </CandidatePage>;
}

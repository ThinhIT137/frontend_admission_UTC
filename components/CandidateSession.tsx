"use client";
import { candidateSessionAction } from "@/actions/candidate-session.action";
import { publicError } from "@/libs/client-error";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { ArrowRight, LogOut, ShieldCheck, UserRound } from "lucide-react";
import styles from "@/components/admission/candidate.module.css";

type Candidate = { cccd: string; ho_ten: string; so_dien_thoai: string };
/** Khung tài khoản thí sinh: đăng nhập, đăng ký mới hoặc kích hoạt CCCD cũ bằng OTP.
 * Chỉ gọi API Next.js; token nằm trong cookie HttpOnly, state user chỉ dùng hiển thị. */
export default function CandidateSession({ onAuthenticated, onLogout }: { onAuthenticated?: (user: Candidate) => void; onLogout?: () => void }) {
  const [user, setUser] = useState<Candidate | null>(null);
  const [register, setRegister] = useState(false);
  const [activate, setActivate] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const sessionVersion = useRef(0);
  const mounted = useRef(false);
  const authenticatedCallback = useRef(onAuthenticated);
  authenticatedCallback.current = onAuthenticated;
  // Khi mở trang, đọc phiên có sẵn và báo cho màn hình cha qua onAuthenticated.
  useEffect(() => {
    mounted.current = true;
    const version = ++sessionVersion.current;
    candidateSessionAction("me").then(result => {
      // Kết quả cũ không được ghi đè phiên vừa đăng nhập/đăng xuất, kể cả khi component đã tháo.
      if (mounted.current && version === sessionVersion.current && result.success && result.user) {
        setUser(result.user); authenticatedCallback.current?.(result.user);
      }
    }).catch(() => {});
    return () => { mounted.current = false; sessionVersion.current++; };
  }, []);
  // Chọn đúng bước theo form: xin OTP chưa đăng nhập; xác nhận OTP mới đặt mật khẩu và tạo phiên.
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setMessage("");
    const version = ++sessionVersion.current;
    const isCurrent = () => mounted.current && version === sessionVersion.current;
    const form = Object.fromEntries(new FormData(event.currentTarget));
    try {
      const action = activate ? (otpSent ? "activation/confirm" : "activation/request") : register ? "register" : "login";
      const input = activate ? otpSent ? { cccd: form.cccd, password: form.password, otp: form.otp } : { cccd: form.cccd, channel: form.channel } : form;
      if (action === "login" || action === "register") {
        const result = await candidateSessionAction(action, input);
        if (!isCurrent()) return;
        if (!result.success) { setMessage(result.message); toast.error(result.message); return; }
        if (result.user) { setUser(result.user); authenticatedCallback.current?.(result.user); }
        return;
      }
      const response = await fetch("/api/candidate/session", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action, ...input }) });
      const data = await response.json(); if (!response.ok) throw Error(data.message);
      if (!isCurrent()) return;
      if (action === "activation/request") { setOtpSent(true); toast.success("Nếu hồ sơ đủ điều kiện, mã đã được gửi đến liên hệ đã lưu. Mã có hiệu lực 5 phút."); return; }
      if (data.user) { setUser(data.user); authenticatedCallback.current?.(data.user); }
    } catch (err) { if (isCurrent()) setMessage(publicError(err instanceof Error ? err.message : "Không thể đăng nhập")); } finally { if (isCurrent()) setBusy(false); }
  }
  async function logout() {
    const version = ++sessionVersion.current;
    try {
      const result = await candidateSessionAction("logout");
      if (!mounted.current || version !== sessionVersion.current) return;
      if (!result.success) throw Error("Logout failed");
      setUser(null); onLogout?.();
    } catch (error) { if (mounted.current && version === sessionVersion.current) toast.error(publicError(error)); }
  }
  return <section className={styles.panel} aria-label="Tài khoản thí sinh">
    <div className={styles.panelHeading}><ShieldCheck size={23} aria-hidden="true" /><div><h2>{user ? "Tài khoản đã đăng nhập" : activate ? "Kích hoạt hồ sơ CCCD cũ" : register ? "Tạo tài khoản thí sinh" : "Tài khoản thí sinh"}</h2><p>{user ? "Bạn đang quản lý hồ sơ bằng tài khoản thí sinh của mình." : "Sử dụng CCCD để đăng nhập và tiếp tục hồ sơ xét tuyển."}</p></div></div>
    {user ? <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-blue-100 bg-blue-50/50 p-4">
      <div className="flex min-w-0 items-center gap-3"><span className="rounded-full bg-white p-3 text-blue-800"><UserRound size={21} aria-hidden="true" /></span><div className="min-w-0"><p className="break-words text-sm font-bold text-slate-800">{user.ho_ten}</p><p className="mt-1 font-mono text-xs text-slate-500">CCCD: {user.cccd}</p></div></div>
      <div className={styles.actions}><Link className={styles.secondary} href="/nguyen-vong-cua-toi">Nguyện vọng của tôi<ArrowRight size={15} aria-hidden="true" /></Link><button type="button" className={styles.secondary} onClick={logout}><LogOut size={15} aria-hidden="true" />Đăng xuất</button></div>
    </div> : <>
      <div className="mb-5 flex flex-wrap gap-2 border-b border-slate-100 pb-4">
        <button type="button" disabled={busy} aria-pressed={!register && !activate} className={!register && !activate ? styles.primary : styles.secondary} onClick={()=>{setRegister(false);setActivate(false);setOtpSent(false);setMessage("");}}>Đăng nhập CCCD</button>
        <button type="button" disabled={busy} aria-pressed={register} className={register ? styles.primary : styles.secondary} onClick={()=>{setRegister(!register);setActivate(false);setOtpSent(false);setMessage("");}}>{register ? "Đã có tài khoản" : "Đăng ký mới"}</button>
        <button type="button" disabled={busy} aria-pressed={activate} className={activate ? styles.primary : styles.secondary} onClick={()=>{setActivate(!activate);setRegister(false);setOtpSent(false);setMessage("");}}>{activate ? "Quay lại đăng nhập" : "Kích hoạt hồ sơ CCCD cũ"}</button>
      </div>
      <form onSubmit={submit} onInvalidCapture={()=>setMessage("Vui lòng nhập CCCD gồm 12 số, không dùng email quản trị. Kiểm tra các trường bắt buộc và mật khẩu từ 10 đến 128 ký tự.")} className="space-y-5">
        <div className={styles.fields}>
          <label className={styles.field}>Số căn cước công dân<input className={styles.control} name="cccd" aria-label="CCCD đăng nhập" placeholder="Nhập 12 số CCCD" inputMode="numeric" maxLength={12} autoComplete="username" pattern="[0-9]{12}" required /></label>
          {(!activate || otpSent) && <label className={styles.field}>Mật khẩu<input className={styles.control} name="password" aria-label="Mật khẩu thí sinh" placeholder="Từ 10 đến 128 ký tự" type="password" minLength={10} maxLength={128} autoComplete={register || activate ? "new-password" : "current-password"} required /></label>}
          {activate && !otpSent && <label className={styles.field}>Kênh nhận mã<select name="channel" aria-label="Kênh nhận mã" className={styles.control}><option value="email">Email đã lưu</option><option value="sms">Số điện thoại đã lưu</option></select></label>}
          {activate && otpSent && <label className={styles.field}>Mã xác minh<input name="otp" aria-label="Mã OTP kích hoạt" placeholder="Nhập 6 số OTP" pattern="[0-9]{6}" autoComplete="one-time-code" required className={styles.control} /></label>}
          {register && <><label className={styles.field}>Họ và tên<input className={styles.control} name="ho_ten" aria-label="Họ tên đăng ký" placeholder="Nhập họ tên đầy đủ" minLength={2} maxLength={100} required /></label><label className={styles.field}>Số điện thoại<input className={styles.control} name="so_dien_thoai" aria-label="Điện thoại đăng ký" placeholder="Số điện thoại liên hệ" pattern="[0-9]{10,11}" required /></label></>}
        </div>
        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 pt-4"><p className="max-w-xl text-xs leading-6 text-slate-500">Đăng nhập bằng CCCD thí sinh, không dùng email quản trị. Hồ sơ cũ chưa có mật khẩu cần kích hoạt bằng OTP.</p><button disabled={busy} className={styles.primary}>{busy ? "Đang xử lý…" : activate ? otpSent ? "Xác minh và đặt mật khẩu" : "Gửi mã kích hoạt" : register ? "Tạo tài khoản" : "Đăng nhập"}<ArrowRight size={16} aria-hidden="true" /></button></div>
        {activate && otpSent && <button type="button" className={styles.secondary} onClick={()=>setOtpSent(false)}>Gửi lại mã (sau 60 giây)</button>}
      </form>
    </>}
    {message && <p role="alert" className={`${styles.error} mt-4`}>{message}</p>}
  </section>;
}
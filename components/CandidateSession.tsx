"use client";
import { candidateSessionAction } from "@/actions/candidate-session.action";
import { publicError } from "@/libs/client-error";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { ArrowRight, LogOut, ShieldCheck, UserRound } from "lucide-react";

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
  const [cccd, setCccd] = useState("");
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
    const cleanCccd = typeof form.cccd === "string" ? form.cccd.replace(/\D/g, "").slice(0, 12) : cccd.replace(/\D/g, "").slice(0, 12);
    form.cccd = cleanCccd;
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
  const fieldClass = "flex min-w-0 flex-col gap-2 text-sm font-semibold text-slate-700";
  const controlClass = "min-h-12 w-full min-w-0 rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-base font-normal text-slate-900 outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:opacity-50";
  const secondaryClass = "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-blue-900 transition-colors hover:bg-blue-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50";
  const linkClass = "min-h-11 rounded-lg px-2 py-2 text-sm font-semibold text-blue-800 underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50";
  const heading = user ? "Tài khoản đã đăng nhập" : activate ? "Kích hoạt hồ sơ CCCD cũ" : register ? "Tạo tài khoản thí sinh" : "Đăng nhập thí sinh";
  return <div className={user ? "w-full" : "mx-auto w-full max-w-md"}>
    <section aria-label="Tài khoản thí sinh" className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-start gap-3 bg-blue-950 p-6 text-white">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10 text-amber-300"><ShieldCheck className="h-6 w-6" aria-hidden="true" /></span>
        <div className="min-w-0"><p className="text-xs font-semibold uppercase tracking-wide text-amber-300">Tài khoản thí sinh</p><h2 className="mt-1 text-xl font-bold leading-7">{heading}</h2><p className="mt-2 text-sm leading-6 text-blue-100">{user ? "Bạn đang sử dụng tài khoản thí sinh của mình." : activate ? "Xác minh liên hệ đã lưu để đặt mật khẩu cho hồ sơ cũ." : register ? "Tạo tài khoản bằng CCCD và thông tin liên hệ của bạn." : "Sử dụng CCCD để đăng nhập tài khoản của bạn."}</p></div>
      </div>
      <div className="p-6">
        {user ? <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3"><span className="rounded-full bg-blue-50 p-3 text-blue-800"><UserRound className="h-5 w-5" aria-hidden="true" /></span><div className="min-w-0"><p className="break-words text-sm font-bold text-slate-800">{user.ho_ten}</p><p className="mt-1 font-mono text-xs text-slate-500">CCCD: {user.cccd}</p></div></div>
          <div className="flex flex-wrap gap-3"><Link className={secondaryClass} href="/nguyen-vong-cua-toi">Nguyện vọng của tôi<ArrowRight className="h-4 w-4" aria-hidden="true" /></Link><button type="button" className={secondaryClass} onClick={logout}><LogOut className="h-4 w-4" aria-hidden="true" />Đăng xuất</button></div>
        </div> : <>
          <form onSubmit={submit} onInvalidCapture={()=>setMessage("Vui lòng nhập CCCD gồm 12 số, không dùng email quản trị. Kiểm tra các trường bắt buộc và mật khẩu từ 10 đến 128 ký tự.")} className="space-y-5">
            <div className="flex flex-col gap-5">
              <label className={fieldClass}>Số căn cước công dân<input className={controlClass} name="cccd" type="text" aria-label="CCCD đăng nhập" placeholder="Nhập 12 số CCCD" inputMode="numeric" autoComplete="username" value={cccd} onChange={e=>{const sanitized=e.target.value.replace(/\D/g,"").slice(0,12);setCccd(sanitized);e.target.setCustomValidity("");setMessage("");}} onPaste={e=>{e.preventDefault();const text=e.clipboardData.getData("text").replace(/\D/g,"").slice(0,12);setCccd(text);}} onInvalid={e=>{const t=e.currentTarget;if(t.validity.valueMissing){t.setCustomValidity("Vui lòng nhập số căn cước công dân");}else if(t.validity.patternMismatch||t.value.length<12){t.setCustomValidity("Vui lòng nhập đúng 12 chữ số CCCD (chỉ gồm các chữ số từ 0 đến 9)");}else{t.setCustomValidity("");}}} onInput={e=>e.currentTarget.setCustomValidity("")} pattern="[0-9]{12}" title="Vui lòng nhập đúng 12 chữ số CCCD (chỉ gồm các chữ số từ 0 đến 9)" required /></label>
              {(!activate || otpSent) && <label className={fieldClass}>Mật khẩu<input className={controlClass} name="password" aria-label="Mật khẩu thí sinh" placeholder="Từ 10 đến 128 ký tự" type="password" minLength={10} maxLength={128} autoComplete={register || activate ? "new-password" : "current-password"} required /></label>}
              {activate && !otpSent && <label className={fieldClass}>Kênh nhận mã<select name="channel" aria-label="Kênh nhận mã" className={controlClass}><option value="email">Email đã lưu</option><option value="sms">Số điện thoại đã lưu</option></select></label>}
              {activate && otpSent && <label className={fieldClass}>Mã xác minh<input name="otp" type="text" aria-label="Mã OTP kích hoạt" placeholder="Nhập 6 số OTP" pattern="[0-9]{6}" title="Mã OTP gồm đúng 6 chữ số" autoComplete="one-time-code" onInvalid={e=>{const t=e.currentTarget;if(t.validity.valueMissing){t.setCustomValidity("Vui lòng nhập mã OTP");}else if(t.validity.patternMismatch){t.setCustomValidity("Mã OTP phải gồm đúng 6 chữ số");}else{t.setCustomValidity("");}}} onInput={e=>e.currentTarget.setCustomValidity("")} required className={controlClass} /></label>}
              {register && <><label className={fieldClass}>Họ và tên<input className={controlClass} name="ho_ten" aria-label="Họ tên đăng ký" placeholder="Nhập họ tên đầy đủ" minLength={2} maxLength={100} required /></label><label className={fieldClass}>Số điện thoại<input className={controlClass} name="so_dien_thoai" type="tel" aria-label="Điện thoại đăng ký" placeholder="Số điện thoại liên hệ" pattern="[0-9]{10,11}" title="Số điện thoại phải gồm 10 hoặc 11 chữ số" onInvalid={e=>{const t=e.currentTarget;if(t.validity.valueMissing){t.setCustomValidity("Vui lòng nhập số điện thoại");}else if(t.validity.patternMismatch){t.setCustomValidity("Số điện thoại phải gồm 10 hoặc 11 chữ số");}else{t.setCustomValidity("");}}} onInput={e=>e.currentTarget.setCustomValidity("")} required /></label></>}
            </div>
            <p className="text-xs leading-6 text-slate-500">Đăng nhập bằng CCCD thí sinh, không dùng email quản trị. Hồ sơ cũ chưa có mật khẩu cần kích hoạt bằng OTP.</p>
            <button disabled={busy} className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-blue-950 px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-blue-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:cursor-not-allowed disabled:opacity-50">{busy ? "Đang xử lý…" : activate ? otpSent ? "Xác minh và đặt mật khẩu" : "Gửi mã kích hoạt" : register ? "Tạo tài khoản" : "Đăng nhập"}<ArrowRight className="h-4 w-4" aria-hidden="true" /></button>
            {activate && otpSent && <button type="button" className={`${linkClass} w-full`} onClick={()=>setOtpSent(false)}>Gửi lại mã (sau 60 giây)</button>}
          </form>
          <div className="mt-6 flex flex-col items-center gap-1 border-t border-slate-100 pt-4">
            {!register && !activate ? <><button type="button" disabled={busy} className={linkClass} onClick={()=>{setRegister(true);setActivate(false);setOtpSent(false);setMessage("");}}>Đăng ký mới</button><button type="button" disabled={busy} className={linkClass} onClick={()=>{setActivate(true);setRegister(false);setOtpSent(false);setMessage("");}}>Kích hoạt hồ sơ CCCD cũ</button></> : <button type="button" disabled={busy} className={linkClass} onClick={()=>{setRegister(false);setActivate(false);setOtpSent(false);setMessage("");}}>{register ? "Đã có tài khoản" : "Quay lại đăng nhập"}</button>}
          </div>
        </>}
        {message && <p role="alert" className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-800">{message}</p>}
      </div>
    </section>
  </div>;
}

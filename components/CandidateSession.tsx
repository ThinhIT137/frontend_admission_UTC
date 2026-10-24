"use client";
import { candidateSessionAction } from "@/actions/candidate-session.action";
import { publicError } from "@/libs/client-error";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";

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
  return <section className="rounded-xl border bg-white p-4 space-y-3">
    <h2 className="font-bold">Tài khoản thí sinh</h2>
    {user ? <div>{user.ho_ten} · {user.cccd} <Link className="underline ml-4" href="/nguyen-vong-cua-toi">Nguyện vọng của tôi</Link><button className="underline ml-4" onClick={logout}>Đăng xuất</button></div> : <form onSubmit={submit} onInvalidCapture={() => setMessage("Vui lòng nhập CCCD gồm 12 số, không dùng email quản trị. Kiểm tra các trường bắt buộc và mật khẩu từ 10 đến 128 ký tự.")} className="flex flex-wrap gap-3">
      <input className="border rounded p-2" name="cccd" aria-label="CCCD đăng nhập" placeholder="CCCD thí sinh (12 số)" inputMode="numeric" maxLength={12} autoComplete="username" pattern="[0-9]{12}" required />
      {(!activate || otpSent) && <input className="border rounded p-2" name="password" aria-label="Mật khẩu thí sinh" placeholder="Mật khẩu (ít nhất 10 ký tự)" type="password" minLength={10} maxLength={128} autoComplete={register || activate ? "new-password" : "current-password"} required />}
      {activate && !otpSent && <select name="channel" aria-label="Kênh nhận mã" className="border rounded p-2"><option value="email">Email đã lưu</option><option value="sms">Số điện thoại đã lưu</option></select>}
      {activate && otpSent && <input name="otp" aria-label="Mã OTP kích hoạt" placeholder="Mã OTP 6 số" pattern="[0-9]{6}" autoComplete="one-time-code" required className="border rounded p-2" />}
      {register && <><input className="border rounded p-2" name="ho_ten" aria-label="Họ tên đăng ký" placeholder="Họ và tên" minLength={2} maxLength={100} required /><input className="border rounded p-2" name="so_dien_thoai" aria-label="Điện thoại đăng ký" placeholder="Số điện thoại" pattern="[0-9]{10,11}" required /></>}
      <button disabled={busy} className="bg-blue-950 text-white rounded px-4 py-2">{busy ? "Đang xử lý…" : activate ? otpSent ? "Xác minh và đặt mật khẩu" : "Gửi mã kích hoạt" : register ? "Tạo tài khoản" : "Đăng nhập"}</button>
      <button type="button" className="underline" onClick={() => { setRegister(!register); setActivate(false); setOtpSent(false); }}>{register ? "Đã có tài khoản" : "Đăng ký mới"}</button>
      <button type="button" className="underline" onClick={() => { setActivate(!activate); setRegister(false); setOtpSent(false); }}>{activate ? "Quay lại đăng nhập" : "Kích hoạt hồ sơ CCCD cũ"}</button>
      {activate && otpSent && <button type="button" className="underline" onClick={() => setOtpSent(false)}>Gửi lại mã (sau 60 giây)</button>}
    </form>}
    {!user && <p className="text-sm text-slate-600">Đăng nhập bằng CCCD 12 số của thí sinh; email quản trị dùng tại trang đăng nhập admin. Hồ sơ cũ chưa đặt mật khẩu cần kích hoạt CCCD bằng OTP trước.</p>}
    {message && <p role="alert" className="text-red-700">{message}</p>}
  </section>;
}

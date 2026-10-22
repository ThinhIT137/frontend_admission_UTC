"use client";
import { publicError } from "@/libs/client-error";
import { useEffect, useState } from "react";
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
  // Khi mở trang, đọc phiên có sẵn và báo cho màn hình cha qua onAuthenticated.
  useEffect(() => { fetch("/api/candidate/session").then(async r => { if (r.ok) { const user = await r.json(); setUser(user); onAuthenticated?.(user); } }).catch(() => {}); }, []);
  // Chọn đúng bước theo form: xin OTP chưa đăng nhập; xác nhận OTP mới đặt mật khẩu và tạo phiên.
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setMessage("");
    const form = Object.fromEntries(new FormData(event.currentTarget));
    try {
      const action = activate ? (otpSent ? "activation/confirm" : "activation/request") : register ? "register" : "login";
      const input = activate ? otpSent ? { cccd: form.cccd, password: form.password, otp: form.otp } : { cccd: form.cccd, channel: form.channel } : form;
      const response = await fetch("/api/candidate/session", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action, ...input }) });
      const data = await response.json(); if (!response.ok) throw Error(data.message);
      if (action === "activation/request") { setOtpSent(true); toast.success("Nếu hồ sơ đủ điều kiện, mã đã được gửi đến liên hệ đã lưu. Mã có hiệu lực 5 phút."); return; }
      // Đọc lại danh tính từ server sau khi đăng nhập; không coi dữ liệu form là người đã xác thực.
      const me = await fetch("/api/candidate/session"); if (!me.ok) throw Error("Không thể đọc phiên đăng nhập"); const user = await me.json(); setUser(user); onAuthenticated?.(user);
    } catch (err) { setMessage(publicError(err instanceof Error ? err.message : "Không thể đăng nhập")); } finally { setBusy(false); }
  }
  return <section className="rounded-xl border bg-white p-4 space-y-3">
    <h2 className="font-bold">Tài khoản thí sinh</h2>
    {user ? <div>{user.ho_ten} · {user.cccd} <Link className="underline ml-4" href="/nguyen-vong-cua-toi">Nguyện vọng của tôi</Link><button className="underline ml-4" onClick={async () => { try { const response = await fetch("/api/candidate/session", { method: "DELETE" }); if (!response.ok) throw Error("Logout failed"); setUser(null); onLogout?.(); } catch (error) { toast.error(publicError(error)); } }}>Đăng xuất</button></div> : <form onSubmit={submit} className="flex flex-wrap gap-3">
      <input className="border rounded p-2" name="cccd" aria-label="CCCD đăng nhập" placeholder="CCCD 12 số" pattern="[0-9]{12}" required />
      {(!activate || otpSent) && <input className="border rounded p-2" name="password" aria-label="Mật khẩu thí sinh" placeholder="Mật khẩu (ít nhất 10 ký tự)" type="password" minLength={10} maxLength={128} autoComplete={register || activate ? "new-password" : "current-password"} required />}
      {activate && !otpSent && <select name="channel" aria-label="Kênh nhận mã" className="border rounded p-2"><option value="email">Email đã lưu</option><option value="sms">Số điện thoại đã lưu</option></select>}
      {activate && otpSent && <input name="otp" aria-label="Mã OTP kích hoạt" placeholder="Mã OTP 6 số" pattern="[0-9]{6}" autoComplete="one-time-code" required className="border rounded p-2" />}
      {register && <><input className="border rounded p-2" name="ho_ten" aria-label="Họ tên đăng ký" placeholder="Họ và tên" required /><input className="border rounded p-2" name="so_dien_thoai" aria-label="Điện thoại đăng ký" placeholder="Số điện thoại" pattern="[0-9]{10,11}" required /></>}
      <button disabled={busy} className="bg-blue-950 text-white rounded px-4 py-2">{busy ? "Đang xử lý…" : activate ? otpSent ? "Xác minh và đặt mật khẩu" : "Gửi mã kích hoạt" : register ? "Tạo tài khoản" : "Đăng nhập"}</button>
      <button type="button" className="underline" onClick={() => { setRegister(!register); setActivate(false); setOtpSent(false); }}>{register ? "Đã có tài khoản" : "Đăng ký mới"}</button>
      <button type="button" className="underline" onClick={() => { setActivate(!activate); setRegister(false); setOtpSent(false); }}>{activate ? "Quay lại đăng nhập" : "Kích hoạt hồ sơ CCCD cũ"}</button>
      {activate && otpSent && <button type="button" className="underline" onClick={() => setOtpSent(false)}>Gửi lại mã (sau 60 giây)</button>}
    </form>}
    {message && <p role="alert" className="text-red-700">{message}</p>}
  </section>;
}

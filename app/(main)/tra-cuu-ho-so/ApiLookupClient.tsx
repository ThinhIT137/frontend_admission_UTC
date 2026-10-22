"use client";
import { publicError } from "@/libs/client-error";
import { useCallback, useEffect, useRef, useState } from "react";
import CandidateSession from "@/components/CandidateSession";
import { api } from "@/libs/api-services/browser-api";
import Link from "next/link";
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
  return <div className="space-y-5"><h1 className="text-2xl font-bold">Tra cứu hồ sơ và kết quả</h1>
    <CandidateSession onAuthenticated={authenticated} onLogout={logout} />
    <p>Đăng nhập để tra cứu hồ sơ thuộc tài khoản của bạn. Mã hồ sơ hoặc CCCD không thay thế quyền đăng nhập.</p>
    <Link className="underline text-blue-900" href="/nguyen-vong-cua-toi">Xem tất cả nguyện vọng của tôi</Link>
    {signedIn && <form className="flex flex-wrap gap-3" onSubmit={async e => { e.preventDefault(); const current = ++generation.current; setBusy(true); setError(""); setRows(null); try { const q = query.trim(); if (!q) throw Error("Missing query"); const data = await api<Row[]>("score", `/ho-so/tra-cuu?${/^\d{12}$/.test(q) ? "cccd" : "ma_ho_so"}=${encodeURIComponent(q)}`); if (current === generation.current) setRows(data); } catch (err) { if (current === generation.current) setError(publicError(err, "Không thể tra cứu hồ sơ của bạn. Kiểm tra thông tin và phiên đăng nhập.")); } finally { if (current === generation.current) setBusy(false); } }}>
      <input className="border rounded p-3 flex-1" aria-label="Mã hồ sơ hoặc CCCD" placeholder="Nhập đầy đủ mã hồ sơ hoặc CCCD 12 số" value={query} onChange={e => setQuery(e.target.value)} required />
      <button disabled={busy} className="bg-blue-950 text-white rounded px-5">{busy ? "Đang tra cứu…" : "Tra cứu"}</button></form>}
    {error && <p role="alert" className="text-red-700">{error}</p>}{rows?.length === 0 && <p>Không tìm thấy hồ sơ.</p>}
    {rows?.map(r => <article key={r.ma_ho_so} className="border bg-white rounded p-5 space-y-2"><h2 className="font-bold">{r.ma_ho_so}</h2><p>{r.ma_chuong_trinh} · {r.ma_phuong_thuc} · {r.nam_tuyen_sinh}</p><p>Trạng thái hồ sơ: {{ cho: "Chờ xử lý", hop_le: "Hợp lệ", tu_choi: "Từ chối", dang_xu_ly: "Đang xét tuyển — chưa công bố kết quả", do: "Đỗ", truot: "Trượt" }[r.trang_thai] || r.trang_thai}</p><p>Thông báo từ bộ phận tuyển sinh: {r.ket_qua || "Chưa có thông báo"}</p><p className="text-sm text-gray-600">Hồ sơ hợp lệ chưa đồng nghĩa với kết quả trúng tuyển chính thức.</p></article>)}
  </div>;
}

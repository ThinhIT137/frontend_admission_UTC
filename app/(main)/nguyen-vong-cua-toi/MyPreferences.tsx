"use client";
import CandidateSession from "@/components/CandidateSession";
import { api } from "@/libs/api-services/browser-api";
import { publicError } from "@/libs/client-error";
import Link from "next/link";
import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";
import { ArrowRight, FileStack, Info, RefreshCw } from "lucide-react";
import { ApplicationStatus, CandidateLoading, CandidatePage, CandidatePageHeader } from "@/components/admission/CandidatePage";
import styles from "@/components/admission/candidate.module.css";

type Row = {
    ma_ho_so: string;
    nguyen_vong: number;
    nam_tuyen_sinh: number;
    ma_chuong_trinh: string;
    ten_chuong_trinh?: string;
    ten_nganh?: string;
    ma_phuong_thuc: string;
    ten_phuong_thuc?: string;
    ma_to_hop?: string;
    trang_thai: string;
    ket_qua?: string;
    co_the_chinh_sua?: boolean;
};
export default function MyPreferences() {
    const [rows, setRows] = useState<Row[] | null>(null);
    const [signedIn, setSignedIn] = useState(false);
    const [busy, setBusy] = useState(false);
    const [mutating, setMutating] = useState(false);
    const [year, setYear] = useState("");
    const [draft, setDraft] = useState<Row[] | null>(null);
    const [withdrawId, setWithdrawId] = useState<string | null>(null);
    const [confirmation, setConfirmation] = useState("");
    const [error, setError] = useState("");
    const generation = useRef(0);
    const mutationActive = useRef(false);

    const load = useCallback(async () => {
        const current = ++generation.current;
        setBusy(true);
        setRows(null);
        setDraft(null);
        setWithdrawId(null);
        setConfirmation("");
        setError("");
        try {
            const data = await api<Row[]>("score", "/ho-so/cua-toi");
            if (current === generation.current) setRows(data);
        } catch (failure) {
            if (current === generation.current)
                setError(
                    publicError(
                        failure,
                        "Không tải được danh sách nguyện vọng. Vui lòng tải lại.",
                    ),
                );
        } finally {
            if (current === generation.current) setBusy(false);
        }
    }, []);
    const authenticated = useCallback(() => {
        setSignedIn(true);
        void load();
    }, [load]);
    const logout = () => {
        generation.current++;
        mutationActive.current = false;
        setSignedIn(false);
        setRows(null);
        setBusy(false);
        setMutating(false);
        setDraft(null);
        setWithdrawId(null);
        setConfirmation("");
        setError("");
        setYear("");
    };
    const selectedRows = (rows ?? []).filter(
        (r) => !year || String(r.nam_tuyen_sinh) === year,
    );
    const canReorder =
        !!year &&
        selectedRows.length > 1 &&
        selectedRows.every((r) => r.co_the_chinh_sua === true) &&
        new Set(selectedRows.map((r) => r.nguyen_vong)).size ===
            selectedRows.length;
    const displayedRows = draft ?? selectedRows;
    const ranks = selectedRows.map((r) => r.nguyen_vong).sort((a, b) => a - b);
    const disabled = busy || mutating;

    async function mutate(
        path: string,
        method: "PUT" | "DELETE",
        payload?: unknown,
    ) {
        if (mutationActive.current) return;
        const current = generation.current;
        mutationActive.current = true;
        setMutating(true);
        setError("");
        try {
            await api("score", path, payload, method);
            if (current !== generation.current) return;
            toast.success(
                method === "PUT"
                    ? "Đã lưu thứ tự nguyện vọng."
                    : "Đã rút và xóa hồ sơ chờ kiểm tra.",
            );
            await load();
        } catch (failure) {
            if (current !== generation.current) return;
            // Includes optimistic-version/state conflicts: discard the stale draft.
            publicError(failure);
            await load();
            if (current + 1 === generation.current)
                setError(
                    "Chưa xác nhận được thay đổi. Danh sách đã được tải lại; hồ sơ có thể vừa được cập nhật hoặc xử lý. Hãy kiểm tra trước khi thử lại.",
                );
        } finally {
            // load increments once; logout/login can move to a different generation.
            if (
                current === generation.current ||
                current + 1 === generation.current
            ) {
                mutationActive.current = false;
                setMutating(false);
            }
        }
    }

    function move(index: number, direction: number) {
        if (!draft || disabled) return;
        const next = [...draft];
        [next[index], next[index + direction]] = [
            next[index + direction],
            next[index],
        ];
        setDraft(next);
    }

    return (
        <CandidatePage className={styles.formSurface}>
            <CandidatePageHeader icon={FileStack} eyebrow="Hồ sơ & xét tuyển · UTC" title="Nguyện vọng của tôi" description="Quản lý các nguyện vọng đã gửi, theo dõi tiến độ xét duyệt và sắp xếp lựa chọn cho hành trình đến với UTC.">
                <Link href="/nop-ho-so">Nộp hồ sơ mới<ArrowRight size={15} aria-hidden="true" /></Link>
                <Link href="/tra-cuu-ho-so">Tra cứu hồ sơ<ArrowRight size={15} aria-hidden="true" /></Link>
            </CandidatePageHeader>
            <CandidateSession
                onAuthenticated={authenticated}
                onLogout={logout}
            />
            {!signedIn && (
                <p className={styles.notice}><Info size={18} aria-hidden="true" />Đăng nhập để xem tất cả nguyện vọng đã nộp của bạn. Hồ sơ được lưu theo tài khoản thí sinh và năm tuyển sinh.</p>
            )}
            {signedIn && (
                <>
                    <div className={`${styles.panel} flex flex-wrap items-end gap-4`}>
                        <label className={styles.field}>
                            Năm tuyển sinh{" "}
                            <select
                                aria-label="Năm nguyện vọng"
                                className="rounded border bg-white p-2 font-normal"
                                value={year}
                                disabled={disabled || !!draft || !!withdrawId}
                                onChange={(e) => setYear(e.target.value)}
                            >
                                <option value="">Tất cả các năm</option>
                                {[
                                    ...new Set(
                                        rows?.map((r) => r.nam_tuyen_sinh) ??
                                            [],
                                    ),
                                ]
                                    .sort((a, b) => b - a)
                                    .map((y) => (
                                        <option key={y}>{y}</option>
                                    ))}
                            </select>
                        </label>
                        <button
                            className={styles.secondary}
                            disabled={disabled}
                            onClick={() => void load()}
                        >
                            <RefreshCw size={15} aria-hidden="true" />Tải lại danh sách
                        </button>
                        <Link className={`${styles.primary} sm:ml-auto`} href="/nop-ho-so">
                            Nộp hồ sơ mới<ArrowRight size={15} aria-hidden="true" />
                        </Link>
                    </div>
                    {error && (
                        <p
                            role="alert"
                            className="rounded border border-red-300 bg-red-50 p-3 text-red-800"
                        >
                            {error}
                        </p>
                    )}
                    {busy && <CandidateLoading>Đang tải nguyện vọng…</CandidateLoading>}
                    {mutating && <CandidateLoading>Đang lưu thay đổi…</CandidateLoading>}
                    {rows && (
                        <p aria-live="polite" className={styles.summary}>
                            Đã nộp {selectedRows.length} nguyện vọng
                            {year ? ` trong năm ${year}` : ""}.
                        </p>
                    )}
                    {rows && !selectedRows.length && (
                        <div className={styles.empty}><FileStack size={32} aria-hidden="true" /><h2>Chưa có nguyện vọng</h2><p>Chưa có nguyện vọng cho lựa chọn này. Bạn có thể bắt đầu bằng cách nộp hồ sơ mới.</p><Link className={styles.primary} href="/nop-ho-so">Nộp hồ sơ<ArrowRight size={15} aria-hidden="true" /></Link></div>
                    )}

                    {rows && selectedRows.length > 0 && (
                        <section
                            className={`${styles.reorder} space-y-3`}
                            aria-label="Điều chỉnh thứ tự nguyện vọng"
                        >
                            <p className="text-sm">
                                Chọn một năm để đổi thứ tự. Chỉ được sắp xếp khi
                                toàn bộ hồ sơ của năm đó là hồ sơ tự nộp, đang
                                chờ kiểm tra và chưa được xử lý. Các số thứ tự
                                hiện có được giữ nguyên, kể cả khoảng trống sau
                                khi rút hồ sơ.
                            </p>
                            {!draft ? (
                                <button
                                    disabled={
                                        disabled || !canReorder || !!withdrawId
                                    }
                                    onClick={() =>
                                        setDraft(
                                            [...selectedRows].sort(
                                                (a, b) =>
                                                    a.nguyen_vong -
                                                    b.nguyen_vong,
                                            ),
                                        )
                                    }
                                    className="rounded bg-blue-950 px-4 py-2 font-bold text-white disabled:opacity-50"
                                >
                                    Đổi thứ tự nguyện vọng
                                </button>
                            ) : (
                                <div className="flex flex-wrap gap-3">
                                    <button
                                        disabled={disabled}
                                        className="rounded bg-blue-950 px-4 py-2 font-bold text-white disabled:opacity-50"
                                        onClick={() =>
                                            void mutate(
                                                "/ho-so/cua-toi/thu-tu",
                                                "PUT",
                                                {
                                                    nam_tuyen_sinh:
                                                        Number(year),
                                                    thu_tu: draft.map((r) => ({
                                                        ma_ho_so: r.ma_ho_so,
                                                        nguyen_vong_cu:
                                                            r.nguyen_vong,
                                                    })),
                                                },
                                            )
                                        }
                                    >
                                        Lưu thứ tự
                                    </button>
                                    <button
                                        disabled={disabled}
                                        className="rounded border bg-white px-4 py-2 disabled:opacity-50"
                                        onClick={() => setDraft(null)}
                                    >
                                        Hủy sắp xếp
                                    </button>
                                </div>
                            )}
                        </section>
                    )}

                    {displayedRows.map((r, index) => (
                        <article
                            key={r.ma_ho_so}
                            className={`${styles.preferenceCard} space-y-4 bg-white`}
                        >
                            <div className={styles.resultHeader}><div className="flex min-w-0 items-start gap-3"><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-lg font-bold text-blue-900">{draft ? ranks[index] : r.nguyen_vong}</span><div><span className="text-xs font-medium text-slate-500">Nguyện vọng {draft ? ranks[index] : r.nguyen_vong}</span><h2>{r.ten_chuong_trinh || r.ma_chuong_trinh}</h2></div></div><ApplicationStatus status={r.trang_thai} /></div>
                            <dl className={styles.resultMeta}><div><dt>Năm tuyển sinh</dt><dd>{r.nam_tuyen_sinh}</dd></div><div><dt>Phương thức</dt><dd>{r.ten_phuong_thuc || r.ma_phuong_thuc}</dd></div><div><dt>Tổ hợp</dt><dd>{r.ma_to_hop || "Chưa chọn"}</dd></div></dl>
                            <p className="break-all">Mã hồ sơ: <span className="font-mono">{r.ma_ho_so}</span></p>
                            {r.ket_qua && <div className={styles.resultMessage}>Thông báo: {r.ket_qua}</div>}
                            {draft ? (
                                <div className="flex gap-3">
                                    <button
                                        disabled={disabled || index === 0}
                                        aria-label={`Đưa hồ sơ ${r.ma_ho_so} lên`}
                                        className="rounded border px-3 py-2 disabled:opacity-50"
                                        onClick={() => move(index, -1)}
                                    >
                                        ↑ Lên
                                    </button>
                                    <button
                                        disabled={
                                            disabled ||
                                            index === displayedRows.length - 1
                                        }
                                        aria-label={`Đưa hồ sơ ${r.ma_ho_so} xuống`}
                                        className="rounded border px-3 py-2 disabled:opacity-50"
                                        onClick={() => move(index, 1)}
                                    >
                                        ↓ Xuống
                                    </button>
                                </div>
                            ) : (
                                r.co_the_chinh_sua === true && (
                                    <button
                                        disabled={disabled || !!withdrawId}
                                        className="rounded border border-red-700 px-3 py-2 text-red-800 disabled:opacity-50"
                                        onClick={() => {
                                            setWithdrawId(r.ma_ho_so);
                                            setConfirmation("");
                                        }}
                                    >
                                        Rút hồ sơ
                                    </button>
                                )
                            )}
                            {withdrawId === r.ma_ho_so && (
                                <div
                                    className="space-y-3 rounded-xl border-2 border-red-500 bg-red-50 p-4"
                                    role="group"
                                    aria-label="Xác nhận rút hồ sơ"
                                >
                                    <p className="font-bold">
                                        Rút hồ sơ sẽ xóa vĩnh viễn hồ sơ chờ
                                        kiểm tra này và không thể hoàn tác. Học
                                        bạ, chứng chỉ, giải thưởng và file minh
                                        chứng dùng chung vẫn được giữ lại.
                                    </p>
                                    <label className="block">
                                        Nhập mã hồ sơ để xác nhận
                                        <input
                                            aria-label="Mã hồ sơ xác nhận rút"
                                            className="mt-1 w-full rounded border bg-white p-2"
                                            disabled={disabled}
                                            value={confirmation}
                                            onChange={(e) =>
                                                setConfirmation(e.target.value)
                                            }
                                            autoComplete="off"
                                        />
                                    </label>
                                    <div className="flex flex-wrap gap-3">
                                        <button
                                            disabled={
                                                disabled ||
                                                confirmation !== r.ma_ho_so
                                            }
                                            className="rounded bg-red-800 px-4 py-2 font-bold text-white disabled:opacity-50"
                                            onClick={() =>
                                                void mutate(
                                                    `/ho-so/cua-toi/${encodeURIComponent(r.ma_ho_so)}`,
                                                    "DELETE",
                                                )
                                            }
                                        >
                                            Xác nhận rút và xóa hồ sơ
                                        </button>
                                        <button
                                            disabled={disabled}
                                            className="rounded border bg-white px-4 py-2 disabled:opacity-50"
                                            onClick={() => {
                                                setWithdrawId(null);
                                                setConfirmation("");
                                            }}
                                        >
                                            Hủy rút hồ sơ
                                        </button>
                                    </div>
                                </div>
                            )}
                        </article>
                    ))}
                    <p className={styles.notice}>
                        <Info size={18} aria-hidden="true" />
                        Hồ sơ hợp lệ chưa đồng nghĩa trúng tuyển. Quyết định
                        đỗ/trượt chỉ hiển thị sau công bố.
                    </p>
                </>
            )}
        </CandidatePage>
    );
}

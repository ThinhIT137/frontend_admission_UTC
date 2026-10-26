"use client";

import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { CheckCircle2, Clock3, LoaderCircle, XCircle, SlidersHorizontal, UserRound, ClipboardCheck, ArrowRight, Paperclip, ShieldCheck, Check, FileSearch, Printer, BadgeCheck, CircleAlert, Send, Copy, FileText } from "lucide-react";
import PageMotion from "@/components/ui/PageMotion";
import styles from "./candidate.module.css";

/** Các trang hồ sơ dùng chung khung giao diện; không chứa logic xét tuyển. */
export function CandidatePage({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <PageMotion className={`${styles.page} ${className}`}>{children}</PageMotion>;
}

export function CandidatePageHeader({ icon: Icon, eyebrow, title, description, children }: {
  icon: LucideIcon; eyebrow: string; title: string; description: string; children?: ReactNode;
}) {
  return <header className={styles.hero}>
    <div className={styles.heroTop}><span className={styles.heroIcon}><Icon size={24} aria-hidden="true" /></span><span className={styles.eyebrow}>{eyebrow}</span></div>
    <h1>{title}</h1><p>{description}</p>
    {children && <div className={styles.heroActions}>{children}</div>}
  </header>;
}

const statuses: Record<string, { label: string; tone: string; icon: LucideIcon }> = {
  cho: { label: "Chờ kiểm tra", tone: "amber", icon: Clock3 },
  hop_le: { label: "Hồ sơ hợp lệ", tone: "blue", icon: CheckCircle2 },
  dang_xu_ly: { label: "Đang xét tuyển", tone: "blue", icon: Clock3 },
  tu_choi: { label: "Từ chối hồ sơ", tone: "red", icon: XCircle },
  do: { label: "Trúng tuyển", tone: "green", icon: CheckCircle2 },
  truot: { label: "Không trúng tuyển", tone: "red", icon: XCircle },
};
export function ApplicationStatus({ status }: { status: string }) {
  const item = statuses[status] ?? { label: "Chưa xác định", tone: "slate", icon: Clock3 };
  const Icon = item.icon;
  return <span className={`${styles.badge} ${styles[item.tone]}`}><Icon size={15} aria-hidden="true" />{item.label}</span>;
}

export function CandidateLoading({ children }: { children: ReactNode }) {
  return <p role="status" className={styles.loading}><LoaderCircle size={18} className="animate-spin motion-reduce:animate-none" aria-hidden="true" />{children}</p>;
}

/** Chuyển icon cũ sang SVG để không lóe chữ trong lúc tải font. */
export function AdmissionIcon({ name, className = "" }: { name: string; className?: string }) {
  const icons: Record<string, LucideIcon> = { tune: SlidersHorizontal, person: UserRound, fact_check: ClipboardCheck, arrow_forward: ArrowRight, attach_file: Paperclip, verified_user: ShieldCheck, check: Check, search_check: FileSearch, print: Printer, task_alt: BadgeCheck, check_circle: CheckCircle2, error: CircleAlert, send: Send, content_copy: Copy };
  const Icon = icons[name] ?? FileText;
  return <Icon size={20} aria-hidden="true" className={`shrink-0 ${className}`} />;
}

export type MilestoneStatus = "PAST" | "ACTIVE" | "UPCOMING" | "UNKNOWN";
export const statusLabels: Record<MilestoneStatus, string> = {
  PAST: "Đã kết thúc", ACTIVE: "Đang diễn ra", UPCOMING: "Sắp diễn ra", UNKNOWN: "Chưa xác định",
};

// Admissions use calendar dates in Vietnam, including the entire closing date.
export function admissionDay(value: string | Date | null | undefined): string | null {
  if (!value) return null;
  if (typeof value === "string") {
    const calendar = /^(\d{4})-(\d{2})-(\d{2})(?:T|$)/.exec(value);
    if (calendar) {
      const [, year, month, day] = calendar;
      const check = new Date(`${year}-${month}-${day}T00:00:00Z`);
      if (!Number.isFinite(check.getTime()) || check.toISOString().slice(0, 10) !== `${year}-${month}-${day}`) return null;
    }
  }
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return null;
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Ho_Chi_Minh", year: "numeric", month: "2-digit", day: "2-digit",
  }).formatToParts(date);
  return ["year", "month", "day"].map(type => parts.find(p => p.type === type)?.value).join("-");
}

export function milestoneStatus(start: string | Date | null | undefined, end: string | Date | null | undefined, now: string | Date): MilestoneStatus {
  const first = admissionDay(start);
  const last = end ? admissionDay(end) : first;
  const today = admissionDay(now);
  if (!first || !last || !today || last < first) return "UNKNOWN";
  if (today < first) return "UPCOMING";
  if (today > last) return "PAST";
  return "ACTIVE";
}

export function displayAdmissionDate(value: string | Date | null | undefined): string {
  const day = admissionDay(value);
  return day ? day.split("-").reverse().join("/") : "Chưa công bố";
}

export function safeExternalUrl(value: string | null | undefined): string | null {
  if (!value) return null;
  try {
    const url = new URL(value.trim());
    return ["https:", "http:"].includes(url.protocol) && !url.username && !url.password ? url.href : null;
  } catch { return null; }
}

function decodeText(value: string): string {
  const named: Record<string, string> = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " " };
  return value.replace(/&(#x[0-9a-f]+|#\d+|amp|lt|gt|quot|apos|nbsp);/gi, (match, entity: string) => {
    if (!entity.startsWith("#")) return named[entity.toLowerCase()] ?? match;
    const code = entity[1].toLowerCase() === "x" ? parseInt(entity.slice(2), 16) : parseInt(entity.slice(1), 10);
    return code > 0 && code <= 0x10ffff ? String.fromCodePoint(code) : match;
  });
}

// CMS HTML is presented as escaped text and explicit, validated links. Never execute it.
export function publishedContent(value: string): { text: string; links: { label: string; href: string }[] } {
  const source = value.replace(/<(script|style|iframe)\b[^>]*>[\s\S]*?<\/\1\s*>/gi, "");
  const plain = (html: string) => decodeText(html.replace(/<\/?(?:p|div|li|h[1-6]|br|tr)\b[^>]*>/gi, "\n").replace(/<[^>]*>/g, "")).trim();
  const links: { label: string; href: string }[] = [];
  for (const match of source.matchAll(/<a\b[^>]*\bhref\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))[^>]*>([\s\S]*?)<\/a\s*>/gi)) {
    const href = safeExternalUrl(decodeText(match[1] ?? match[2] ?? match[3]));
    if (href && !links.some(link => link.href === href)) links.push({ href, label: plain(match[4]) || "Xem tài liệu" });
  }
  return { text: plain(source), links };
}

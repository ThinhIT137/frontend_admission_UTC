import { CalendarDays, CircleCheck, Clock3, Circle } from "lucide-react";

type Milestone = { id: string; title: string; startDate: string; endDate: string | null; note: string | null };
const dateLabel = (value: string) => new Intl.DateTimeFormat("vi-VN", {
  timeZone: "Asia/Ho_Chi_Minh", day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit",
}).format(new Date(value));

export default function AdmissionTimeline({ milestones, referenceTime }: { milestones: Milestone[]; referenceTime: string }) {
  const events = milestones.filter(event => new Intl.DateTimeFormat("en", { year: "numeric", timeZone: "Asia/Ho_Chi_Minh" }).format(new Date(event.startDate)) === "2026")
    .sort((a, b) => Date.parse(a.startDate) - Date.parse(b.startDate));
  const now = Date.parse(referenceTime);
  const state = (event: Milestone) => now < Date.parse(event.startDate) ? "upcoming" : now <= Date.parse(event.endDate ?? event.startDate) ? "active" : "past";
  return <section id="lo-trinh" className="rounded-2xl border border-blue-200 bg-gradient-to-br from-[#152653] to-[#203d76] p-5 text-white shadow-sm sm:p-6">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <h2 className="flex items-center gap-2 text-lg font-bold"><CalendarDays size={20} />Mốc thời gian tuyển sinh 2026</h2>
      {!!events.length && <span className="rounded-full border border-white/25 px-3 py-1 text-xs text-blue-100">{events.every(event => state(event) === "past") ? "Đã qua các mốc chính" : "Theo dõi lịch tuyển sinh"}</span>}
    </div>
    {events.length ? <ol className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-6 lg:gap-0">
      {events.map((event, index) => {
        const status = state(event);
        const Icon = status === "past" ? CircleCheck : status === "active" ? Clock3 : Circle;
        const colour = status === "past" ? "text-emerald-300" : status === "active" ? "text-amber-300" : "text-blue-200";
        return <li key={event.id} className="relative min-w-0 px-2 text-center">
          {index < events.length - 1 && <div aria-hidden="true" className="absolute left-1/2 top-3 hidden h-px w-full bg-white/25 lg:block" />}
          <Icon aria-hidden="true" size={24} className={`relative mx-auto rounded-full bg-[#1b3261] ${colour}`} />
          <span className={`mt-2 inline-block rounded-full bg-white/10 px-2 py-0.5 text-[11px] font-bold ${colour}`}>{status === "past" ? "ĐÃ KẾT THÚC" : status === "active" ? "ĐANG DIỄN RA" : "SẮP DIỄN RA"}</span>
          <h3 className="mt-2 text-sm font-semibold leading-5">{event.title}</h3>
          <p className="mt-2 text-xs leading-5 text-blue-100">{event.endDate ? <>{dateLabel(event.startDate)}<br />đến {dateLabel(event.endDate)}</> : <>Từ {dateLabel(event.startDate)}</>}</p>
          {event.note && <p className="mt-2 text-xs leading-5 text-blue-200">{event.note}</p>}
        </li>;
      })}
    </ol> : <p className="mt-4 text-sm text-blue-100">Chưa có mốc tuyển sinh 2026 trong dữ liệu hiện tại.</p>}
  </section>;
}

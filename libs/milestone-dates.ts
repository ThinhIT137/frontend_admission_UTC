/** Validate merged values as well as full create payloads. Null end is open-ended. */
export function validateMilestoneDates(start: unknown, end: unknown) {
  if (!(start instanceof Date) || !Number.isFinite(start.getTime())) throw new Error("Ngày bắt đầu không hợp lệ");
  if (end === undefined || end === null) return;
  if (!(end instanceof Date) || !Number.isFinite(end.getTime())) throw new Error("Ngày kết thúc không hợp lệ");
  if (start.getTime() > end.getTime()) throw new Error("Ngày bắt đầu không được sau ngày kết thúc");
}

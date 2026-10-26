import type { ProgramScoreItem } from "./TinhDiemQuyDoiClient";

/** Bảng mã xét tuyển/mã ngành UTC 2026, không suy diễn từ tên gần giống.
 * Các biến thể khác chương trình (ví dụ GHA16QT) cố ý không ghép.
 * Nguồn: https://tuyensinh.utc.edu.vn/?q=node%2F21694
 */
export const PROGRAM_HISTORY_SOURCE = "https://tuyensinh.utc.edu.vn/?q=node%2F21694";
export const PROGRAM_HISTORY_CODES: Readonly<Record<string, string>> = {
  GHA01: "7220201", GHA02: "7460112", GHA03: "7310101", GHA04: "7340101",
  GHA05: "7340201", GHA06: "7340301", GHA07: "7810103", GHA08: "7840101",
  GHA09: "7840104", GHA10: "7510605", GHA11: "7580301", GHA12: "7580302",
  GHA13: "7480101", GHA14: "7480201", GHA16: "7520103", GHA17: "7520114",
  GHA18: "7520115", GHA19: "7520116", GHA20: "7520130", GHA21: "7520201",
  GHA22: "7520207", GHA23: "7520216", GHA24: "7520107", GHA25: "7520320",
  GHA26: "7580215", GHA27: "7580101", GHA28: "7580201", GHA29: "7580210",
  GHA30: "7580106", GHA31: "7580202", GHA32: "7580205", GHA33: "7480106",
  GHA04QT: "7340101 QT", GHA06QT: "7340301 QT", GHA08DS: "7840101 DS",
  GHA11QT: "7580301 QT", GHA12QT: "7580302 QT", GHA14QT: "7480201 QT",
  GHA19DS: "7520116 DS", GHA21DS: "7520201 DS", GHA23DS: "7520216 DS",
  GHA23TM: "7520216-GTTM", GHA28QT1: "7580201 QT", GHA32DS: "7580205 DS",
  GHA32QT1: "7580205 QT1", GHA32QT2: "7580205 QT2", GHA32QT3: "7580205 QT3",
};

export function programFamilies(programs: ProgramScoreItem[], year: number) {
  const aliases = new Map<string, string>();
  for (const [current, previous] of Object.entries(PROGRAM_HISTORY_CODES)) {
    aliases.set(current, current);
    aliases.set(previous, current);
  }
  const groups = new Map<string, ProgramScoreItem[]>();
  for (const program of programs) {
    const key = aliases.get(program.ma_chuong_trinh) ?? program.ma_chuong_trinh;
    const members = groups.get(key) ?? [];
    members.push(program);
    groups.set(key, members);
  }
  // Ghép tên đầy đủ khi mã đổi; không bỏ chuyên ngành, CLC hay ngôn ngữ.
  const nameKey = (name: string) => name.normalize("NFC").toLocaleLowerCase("vi")
    .replace(/chương trình chất lượng cao/g, "chương trình clc")
    .replace(/[‐‑–—]/g, "-").replace(/\s*([(),:-])\s*/g, "$1").replace(/\s+/g, " ").trim();
  const merged = new Set(groups.values());
  const names = new Set(programs.map(program => nameKey(program.ten_chuong_trinh)).filter(Boolean));
  for (const name of names) {
    const matching = [...merged].filter(members => members.some(member => nameKey(member.ten_chuong_trinh) === name));
    if (matching.length < 2) continue;
    const combined = matching.flat();
    const years = new Map<number, number>();
    for (const member of combined) for (const history of member.lich_su_diem_chuan ?? []) {
      years.set(history.nam, (years.get(history.nam) ?? 0) + 1);
    }
    // Hai mã cùng tên cùng năm là mơ hồ, không tự gộp.
    if ([...years.values()].some(count => count > 1)) continue;
    const target = matching[0];
    target.splice(0, target.length, ...combined);
    for (const group of matching.slice(1)) merged.delete(group);
  }
  return Array.from(merged).flatMap(members => {
    // Chỉ năm đang xét quyết định danh sách tuyển sinh và mã hiển thị.
    // Các mã/tên năm trước chỉ bổ sung điểm lịch sử cho dòng đã có năm nay.
    const annualMembers = members.filter(program => program.lich_su_diem_chuan?.some(history => history.nam === year));
    if (!annualMembers.length) return [];
    annualMembers.sort((a, b) => a.ma_chuong_trinh.localeCompare(b.ma_chuong_trinh, "vi"));
    return [{ members, program: annualMembers[0] }];
  });
}

import { prismaPublic } from "@/libs/prisma";
import HomeClient from "./HomeClient";
import type { QuickCombination } from "@/components/admission/HomeQuickCalculator";

export const revalidate = 300;

export default async function HomePage() {
  let combinations: QuickCombination[] = [];
  let loadError = false;
  try {
    // Một truy vấn gọn, chỉ lấy mã tổ hợp và ba tên môn; không tự tạo tổ hợp mẫu.
    const rows = await prismaPublic.toHopXetTuyen.findMany({
      select: { ma_to_hop: true, mon_1: { select: { ma_mon: true, ten_mon: true } }, mon_2: { select: { ma_mon: true, ten_mon: true } }, mon_3: { select: { ma_mon: true, ten_mon: true } } },
      orderBy: { ma_to_hop: "asc" },
    });
    combinations = rows.flatMap(row => {
      const subjects = [row.mon_1, row.mon_2, row.mon_3].flatMap(subject => subject?.ma_mon && subject.ten_mon?.trim() ? [{ code: subject.ma_mon, name: subject.ten_mon }] : []);
      return subjects.length === 3 && new Set(subjects.map(s=>s.code)).size === 3 ? [{ code: row.ma_to_hop, subjects }] : [];
    });
  } catch {
    loadError = true;
    console.error("[Trang chủ] Không tải được danh mục tổ hợp.");
  }
  return <HomeClient combinations={combinations} loadError={loadError} />;
}
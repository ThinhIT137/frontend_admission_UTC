"use server";
import { prismaPublic } from "@/libs/prisma";
import { programNameKey } from "@/libs/program-name";

export async function comparePrograms(ids: string[]) {
  if (!Array.isArray(ids) || ids.length < 2 || ids.length > 3 || ids.some(id => typeof id !== "string" || !id.trim() || id.length > 100)) throw Error("Chọn 2–3 chương trình khác nhau");
  if (new Set(ids).size !== ids.length) throw Error("Chương trình so sánh không được trùng");
  const catalog = await prismaPublic.chuongTrinhDaoTao.findMany({ select: { ma_chuong_trinh: true, ten_chuong_trinh: true } });
  const selected = ids.map(id => catalog.find(program => program.ma_chuong_trinh === id));
  if (selected.some(program => !program)) throw Error("Chương trình không còn tồn tại");
  const keys = selected.map(program => programNameKey(program!.ten_chuong_trinh));
  if (new Set(keys).size !== keys.length) throw Error("Chọn các chương trình có tên khác nhau");
  const relatedIds = catalog.filter(program => keys.includes(programNameKey(program.ten_chuong_trinh))).map(program => program.ma_chuong_trinh);
  const programs = await prismaPublic.chuongTrinhDaoTao.findMany({ where: { ma_chuong_trinh: { in: relatedIds } }, select: {
    ma_chuong_trinh: true, ten_chuong_trinh: true, mo_ta_ngan: true,
    nganh: { select: { ten_nganh: true } },
    ctdt_to_hop: { select: { nam: true, ma_to_hop: true } },
    lich_su_diem_chuan: { orderBy: { nam: "asc" }, select: { nam: true, chi_tieu: true,
      diem_trung_tuyen: { select: { ma_phuong_thuc: true, diem: true, phuong_thuc: { select: { ten_phuong_thuc: true } } } } } },
  } });
  return keys.map((key, index) => {
    const members = programs.filter(program => programNameKey(program.ten_chuong_trinh) === key);
    const representative = members.find(program => program.ma_chuong_trinh === ids[index]);
    if (!representative) throw Error("Chương trình không còn tồn tại");
    const history = new Map<number, typeof representative.lich_su_diem_chuan[number]>();
    for (const member of members) for (const record of member.lich_su_diem_chuan) {
      const existing = history.get(record.nam);
      if (!existing) { history.set(record.nam, { ...record, diem_trung_tuyen: [...record.diem_trung_tuyen] }); continue; }
      // Không cộng lặp chỉ tiêu hoặc chọn bừa điểm khi các mã cùng năm mâu thuẫn.
      if (existing.chi_tieu !== record.chi_tieu) throw Error("Dữ liệu cùng tên chương trình chưa thống nhất");
      for (const score of record.diem_trung_tuyen) {
        const previous = existing.diem_trung_tuyen.find(item => item.ma_phuong_thuc === score.ma_phuong_thuc);
        if (previous && previous.diem !== score.diem) throw Error("Điểm cùng tên chương trình chưa thống nhất");
        if (!previous) existing.diem_trung_tuyen.push(score);
      }
    }
    return { ...representative,
      lich_su_diem_chuan: [...history.values()].sort((a, b) => a.nam - b.nam),
      ctdt_to_hop: [...new Map(members.flatMap(member => member.ctdt_to_hop).map(item => [`${item.nam}:${item.ma_to_hop}`, item])).values()],
    };
  });
}

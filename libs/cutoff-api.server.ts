import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { privateJson } from "@/libs/api-security";
import prisma from "@/libs/prisma";
import { adminService } from "@/services/user.service";
import { listAdminCutoffs, getAdminCutoff, updateAdminCutoff, deleteAdminCutoff, createAdminCutoff, lockAdminScoreYear, CutoffError, type ScorePatch } from "@/services/admin-cutoff.service";

/** Admin UI and browser API share the same DB transaction/validation rules. */
export async function cutoffApi(request: NextRequest, path: string, body: any): Promise<NextResponse | undefined> {
  const keyMatch = path.match(/^\/diem-chuan\/([^/]+)$/);
  const yearMatch = path.match(/^\/diem-chuan\/nam\/(\d{4})\/khoa$/);
  if (path !== "/diem-chuan" && !keyMatch && !yearMatch) return;
  try {
    if (yearMatch) {
      const year = Number(yearMatch[1]);
      if (request.method === "POST") return privateJson(await lockAdminScoreYear(year, body?.confirmation_year));
      try { await adminService.getAdminId(); } catch { throw new CutoffError("Cần đăng nhập quản trị", 403); }
      return privateJson({ nam: year, locked: !!await prisma.admissionYearLock.findUnique({ where: { nam: year } }) });
    }
    if (request.method === "GET") return privateJson(keyMatch ? await getAdminCutoff(decodeURIComponent(keyMatch[1])) :
      await listAdminCutoffs(request.nextUrl.searchParams.has("nam") ? Number(request.nextUrl.searchParams.get("nam")) : undefined));
    if (keyMatch && request.method === "DELETE") { await deleteAdminCutoff(decodeURIComponent(keyMatch[1])); return new NextResponse(null, { status: 204, headers: { "Cache-Control": "private, no-store" } }); }
    if (keyMatch && request.method === "PUT") {
      const key = decodeURIComponent(keyMatch[1]), current = await getAdminCutoff(key);
      if (body?.nam !== undefined && body.nam !== current.nam || body?.ma_chuong_trinh !== undefined && body.ma_chuong_trinh !== current.ma_chuong_trinh)
        throw new CutoffError("Không thể đổi chương trình/năm của chỉ tiêu ở đường cập nhật này");
      return privateJson(await updateAdminCutoff(key, { chi_tieu: body?.chi_tieu, trung_tuyen: body?.trung_tuyen, phuong_thuc_ids: body?.phuong_thuc_ids, diem_trung_tuyen: body?.diem_trung_tuyen as ScorePatch[] }));
    }
    if (!keyMatch && request.method === "POST") {
      return privateJson(await createAdminCutoff({ ma_chuong_trinh: body?.ma_chuong_trinh, nam: body?.nam, chi_tieu: body?.chi_tieu,
        phuong_thuc_ids: body?.phuong_thuc_ids ?? (Array.isArray(body?.diem_trung_tuyen) ? body.diem_trung_tuyen.map((item: ScorePatch) => item.ma_phuong_thuc) : []),
        diem_trung_tuyen: body?.diem_trung_tuyen }), { status: 201 });
    }
  } catch (error) {
    if (error instanceof CutoffError) return privateJson({ success: false, message: error.message }, { status: error.status });
    throw error;
  }
}

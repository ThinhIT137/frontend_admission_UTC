"use server";

import prisma from "@/libs/prisma";
import { adminService } from "@/services/user.service";
import { revalidatePath } from "next/cache";
import { backendRequest } from "@/libs/api-services/backend.server";

// Xác thực lại người thao tác ở server; không tin mã tác giả truyền từ giao diện.
async function adminId() {
  await adminService.getAdminId();
  const user = await adminService.getCurrentUser();
  if (!user || !["super_admin", "chuyen_vien"].includes(user.vai_tro.ten_vai_tro)) {
    throw new Error("Bạn không có quyền thực hiện thao tác này");
  }
  return user.ma_admin;
}


/** Tin tức thuộc Next.js: ghi thật qua Prisma; có id thì sửa, chưa có id thì tạo. */
export async function saveArticle(input: { id?: string; title: string; category: string; content: string; status: string }) {
  const author = await adminId();
  if (!input.title.trim() || !["ĐỀ ÁN", "QUY CHẾ", "TIN TỨC", "HƯỚNG DẪN"].includes(input.category)
    || !["PUBLISHED", "DRAFT"].includes(input.status)) throw new Error("Thông tin bài viết không hợp lệ");
  const data = { tieu_de: input.title.trim(), chuyen_muc: input.category, noi_dung_html: input.content,
    ngay_dang: input.status === "PUBLISHED" ? new Date() : null };
  const row = input.id
    ? await prisma.trangNoiDung.update({ where: { ma_bai_viet: input.id }, data })
    : await prisma.trangNoiDung.create({ data: { ...data, ma_admin_tac_gia: author } });
  // Làm mới các trang đọc tin để dữ liệu vừa lưu xuất hiện ở cả quản trị và trang công khai.
  revalidatePath("/admin/tin-tuc-de-an");
  revalidatePath("/thong-tin-tuyen-sinh");
  return { id: row.ma_bai_viet, title: row.tieu_de, category: input.category as "ĐỀ ÁN" | "QUY CHẾ" | "TIN TỨC" | "HƯỚNG DẪN",
    summary: row.noi_dung_html.slice(0, 150), content: row.noi_dung_html,
    publishedDate: row.ngay_dang?.toISOString().split("T")[0] || "", status: input.status as "PUBLISHED" | "DRAFT" };
}

// Xóa bài trong database sau khi kiểm tra quyền, rồi làm mới các trang liên quan.
export async function deleteArticle(id: string) {
  await adminId();
  await prisma.trangNoiDung.delete({ where: { ma_bai_viet: id } });
  revalidatePath("/admin/tin-tuc-de-an");
  revalidatePath("/thong-tin-tuyen-sinh");
}

/** Tri thức chatbot thuộc dịch vụ AI: Next.js kiểm tra quyền và gửi API tạo/sửa, không ghi thẳng bảng tri thức. */
export async function saveKnowledge(input: { id?: string; topic: string; question: string; answer: string }) {
  const author = await adminId();
  if (!input.topic.trim() || !input.answer.trim()) throw new Error("Thiếu chủ đề hoặc nội dung tri thức");
  const data = { chu_de: input.topic.trim(), cau_hoi_mau: input.question.trim() || null, noi_dung: input.answer.trim(), ma_admin_phu_trach: author };
  const row = await backendRequest<{ ma_tri_thuc: string; chu_de: string; cau_hoi_mau: string | null; noi_dung: string; trang_thai: string }>("ai",
    `/api/chat/knowledge${input.id ? `/${encodeURIComponent(input.id)}` : ""}`, { method: input.id ? "PUT" : "POST", body: data, auth: "admin" });
  revalidatePath("/admin/du-lieu-chatbot-ai");
  return { ...row, syncWarning: undefined };
}

// Xóa qua API AI để bên quản lý tri thức xử lý thay đổi, sau đó làm mới màn quản trị.
export async function deleteKnowledge(id: string) {
  await adminId();
  await backendRequest("ai", `/api/chat/knowledge/${encodeURIComponent(id)}`, { method: "DELETE", auth: "admin" });
  revalidatePath("/admin/du-lieu-chatbot-ai");
  return { syncWarning: undefined };
}

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "node:crypto";
import { backendRequest, BackendError } from "@/libs/api-services/backend.server";
import { adminService } from "@/services/user.service";
import prisma from "@/libs/prisma";

/** Kho minh chứng chỉ truy cập từ server bằng service-role key.
 * Bucket mặc định illustrative_images phải riêng tư; tên bucket có thể đổi bằng cấu hình server. */
function storage() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const bucket = process.env.SUPABASE_EVIDENCE_BUCKET || "illustrative_images";
  if (!url || !key || !bucket) throw new BackendError("Chưa cấu hình kho minh chứng riêng tư", 503);
  return { client: createClient(url, key, { auth: { persistSession: false } }), bucket };
}
/** POST thêm file mới; PUT thay nội dung file đã có. Trả key để gắn vào hồ sơ, không trả URL công khai. */
export async function POST(request: NextRequest) {
  try {
    if (request.headers.get("origin") && new URL(request.headers.get("origin")!).host !== request.headers.get("host")) return NextResponse.json({}, { status: 403 });
    // CCCD lấy từ JWT đã xác minh, không lấy từ tên thư mục do người dùng tự nhập.
    const me = await backendRequest<{ cccd: string }>("score", "/auth/candidate/me", { auth: "candidate" });
    if (Number(request.headers.get("content-length") || 0) > 6 * 1024 * 1024) throw new BackendError("File tối đa 5 MB", 413);
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File) || file.size === 0 || file.size > 5 * 1024 * 1024) throw new BackendError("Chọn file PDF/JPEG/PNG tối đa 5 MB", 400);
    const bytes = Buffer.from(await file.arrayBuffer());
    // Nhận dạng PDF/JPEG/PNG từ đầu file, không chỉ tin phần mở rộng hoặc MIME do trình duyệt gửi.
    const type = bytes.subarray(0, 5).toString() === "%PDF-" ? "pdf" : bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff ? "jpg" : bytes.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10])) ? "png" : null;
    if (!type) throw new BackendError("Định dạng file không hợp lệ", 400);
    const previousKey = form.get("key");
    // Mỗi thí sinh có thư mục <CCCD>/; UUID tránh trùng tên khi tải nhiều minh chứng.
    let key = `${me.cccd}/${randomUUID()}.${type}`;
    // Thay file giữ nguyên key và định dạng; chỉ chủ file, khi mọi nguyện vọng còn chờ, mới được yêu cầu.
    if (request.method === "PUT") {
      if (typeof previousKey !== "string" || !/^\d{12}\/[\da-f-]{36}\.(pdf|jpg|png)$/.test(previousKey) || !previousKey.startsWith(`${me.cccd}/`)) throw new BackendError("Không có quyền thay minh chứng", 403);
      const profiles = await backendRequest<Array<{ trang_thai: string }>>("score", "/ho-so/cua-toi", { auth: "candidate" });
      if (profiles.some(row => row.trang_thai !== "cho")) throw new BackendError("Hồ sơ đã được xử lý, cần liên hệ tuyển sinh để thay minh chứng", 409);
      if (!previousKey.endsWith(`.${type}`)) throw new BackendError("File thay thế phải cùng định dạng với file cũ", 400);
      key = previousKey;
    }
    const { client, bucket } = storage();
    const { data: bucketInfo, error: bucketError } = await client.storage.getBucket(bucket);
    if (bucketError || !bucketInfo || bucketInfo.public) throw new BackendError("Kho minh chứng phải là bucket riêng tư", 503);
    if (request.method === "PUT") {
      const { data, error } = await client.storage.from(bucket).list(me.cccd, { search: key.split("/")[1], limit: 100 });
      if (error || !data?.some(item => item.name === key.split("/")[1])) throw new BackendError("Không tìm thấy minh chứng cần thay", 404);
    }
    // upsert chỉ bật cho PUT: ghi đè đúng object cũ, không sinh thêm bản sao sau mỗi lần chỉnh sửa.
    const upload = async () => {
      const { error } = await client.storage.from(bucket).upload(key, bytes, { contentType: type === "pdf" ? "application/pdf" : `image/${type === "jpg" ? "jpeg" : "png"}`, upsert: request.method === "PUT", cacheControl: "0" });
      if (error) throw new BackendError("Không thể tải minh chứng vào kho lưu trữ", 502);
    };
    if (request.method === "PUT") {
      // Serialize replacement with dossier approval; never replace evidence approved mid-upload.
      // Khóa thí sinh, nguyện vọng và chứng chỉ liên quan rồi kiểm tra lại trước khi ghi đè.
      // Việc này phối hợp với backend điểm để tránh thay minh chứng đúng lúc hồ sơ được xử lý.
      await prisma.$transaction(async tx => {
        await tx.$queryRaw`SELECT cccd FROM thi_sinh WHERE cccd = ${me.cccd} FOR UPDATE`;
        const rows = await tx.$queryRaw<Array<{trang_thai:string}>>`SELECT trang_thai::text FROM nguyen_vong_sinh_vien WHERE cccd = ${me.cccd} ORDER BY ma_ho_so FOR UPDATE`;
        const certificates = await tx.$queryRaw<Array<{trang_thai_duyet:string}>>`SELECT trang_thai_duyet::text FROM chung_chi WHERE cccd = ${me.cccd} AND file_dinh_kem = ${key} FOR UPDATE`;
        if (rows.some(r=>r.trang_thai!=="cho") || certificates.some(r=>r.trang_thai_duyet!=="cho")) throw new BackendError("Minh chứng đã được xử lý",409);
        await upload();
      }, { maxWait: 5000, timeout: 20000 });
    } else await upload();
    return NextResponse.json({ key, name: file.name, size: file.size });
  } catch (err) { console.error("[API thất bại]", err); return NextResponse.json({ message: "Thao tác thất bại. Vui lòng thử lại." }, { status: err instanceof BackendError ? err.status : 400 }); }
}
export const PUT = POST;
/** ?list=1 liệt kê file của chính thí sinh; ?key=... tạo liên kết tải chỉ có hiệu lực 60 giây.
 * Cán bộ có quyền đọc minh chứng; thí sinh chỉ đọc được thư mục mang CCCD của mình. */
export async function GET(request: NextRequest) {
  try {
    if (request.nextUrl.searchParams.get("list") === "1") {
      const me = await backendRequest<{ cccd: string }>("score", "/auth/candidate/me", { auth: "candidate" });
      const { client, bucket } = storage();
      const { data: info, error: bucketError } = await client.storage.getBucket(bucket);
      if (bucketError || !info || info.public) throw new BackendError("Kho minh chứng phải riêng tư", 503);
      const { data, error } = await client.storage.from(bucket).list(me.cccd, { limit: 1000, sortBy: { column: "created_at", order: "desc" } });
      if (error) throw new BackendError("Không tải được danh sách minh chứng", 502);
      return NextResponse.json((data || []).filter(f => /^[\da-f-]{36}\.(pdf|jpg|png)$/.test(f.name)).map(f => ({ key: `${me.cccd}/${f.name}`, name: f.name })), { headers: { "Cache-Control": "private, no-store" } });
    }
    const key = request.nextUrl.searchParams.get("key") || "";
    if (!/^\d{12}\/[\da-f-]{36}\.(pdf|jpg|png)$/.test(key)) throw new BackendError("Minh chứng không thuộc kho lưu trữ được hỗ trợ", 400);
    const admin = await adminService.getCurrentUser();
    if (!admin || !["super_admin", "chuyen_vien"].includes(admin.vai_tro.ten_vai_tro)) {
      const me = await backendRequest<{ cccd: string }>("score", "/auth/candidate/me", { auth: "candidate" });
      if (key.split("/")[0] !== me.cccd) throw new BackendError("Không có quyền đọc minh chứng", 403);
    }
    const { client, bucket } = storage();
    const { data: info, error: bucketError } = await client.storage.getBucket(bucket);
    if (bucketError || !info || info.public) throw new BackendError("Kho minh chứng phải riêng tư", 503);
    const { data, error } = await client.storage.from(bucket).createSignedUrl(key, 60, { download: true });
    if (error || !data) throw new BackendError("Không tìm thấy minh chứng", 404);
    return NextResponse.redirect(data.signedUrl, { headers: { "Cache-Control": "private, no-store" } });
  } catch (err) { console.error("[API thất bại]", err); return NextResponse.json({ message: "Thao tác thất bại. Vui lòng thử lại." }, { status: err instanceof BackendError ? err.status : 400 }); }
}

import "server-only";
import { createClient } from "@supabase/supabase-js";
import { createHash } from "node:crypto";
import { BackendError } from "@/libs/api-services/backend.server";

export const sha256 = (bytes: Buffer | string) => createHash("sha256").update(bytes).digest("hex");

/** Kiểm tra bytes trước khi ghi dữ liệu; MIME/tên file từ trình duyệt không đáng tin. */
export async function inspectEvidence(file: File) {
  if (!file.size || file.size > 5 * 1024 * 1024) throw new BackendError("File không hợp lệ", 400);
  const bytes = Buffer.from(await file.arrayBuffer());
  const type = bytes.subarray(0, 5).toString() === "%PDF-" ? "pdf" : bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255 ? "jpg" : bytes.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10])) ? "png" : null;
  if (!type) throw new BackendError("File không hợp lệ", 400);
  return { bytes, type, sha256: sha256(bytes), size: bytes.length };
}

export async function privateEvidenceStorage() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const bucket = process.env.SUPABASE_EVIDENCE_BUCKET || "illustrative_images";
  if (!url || !key) throw new BackendError("Kho minh chứng chưa được cấu hình", 503);
  // Giới hạn từng lệnh mạng để runner hết lease không còn upload âm thầm.
  const client = createClient(url, key, { auth: { persistSession: false },
    global: { fetch: (input, init) => fetch(input, { ...init, signal: AbortSignal.timeout(20000) }) } });
  const { data, error } = await client.storage.getBucket(bucket);
  if (error || !data || data.public) throw new BackendError("Kho minh chứng phải riêng tư", 503);
  return client.storage.from(bucket);
}

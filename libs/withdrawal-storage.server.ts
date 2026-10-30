import "server-only";
import { SignJWT } from "jose";
import { backendRequest, BackendError } from "@/libs/api-services/backend.server";
import { currentCandidate } from "@/services/candidate-auth.service";
import { privateEvidenceStorage } from "@/libs/submission-storage.server";

type Cleanup = { operation_id?: string; files?: string[] };

/** DB journal is committed first; a failed remove stays retryable across requests. */
export async function cleanWithdrawnEvidence(job: Cleanup, cccd: string) {
  if (!job.operation_id || !job.files?.length) return;
  if (job.files.some(key => !/^\d{12}\/[\da-f-]{36}\.(pdf|jpg|png)$/.test(key) || !key.startsWith(`${cccd}/`)))
    throw new BackendError("Minh chứng không thuộc tài khoản", 403);
  const secret = process.env.JWT_ACCESSTOKEN;
  if (!secret) throw new BackendError("Chưa cấu hình xác thực", 503);
  const store = await privateEvidenceStorage();
  for (let i = 0; i < job.files.length; i += 100) {
    const { error } = await store.remove(job.files.slice(i, i + 100));
    if (error) throw new BackendError("Hồ sơ đã rút; chưa dọn xong ảnh. Hãy tải lại để thử dọn tiếp.", 502);
  }
  const proof = await new SignJWT({ operation_id: job.operation_id }).setProtectedHeader({ alg: "HS256" })
    .setSubject(cccd).setAudience("withdraw-cleanup").setIssuedAt().setExpirationTime("5m")
    .sign(new TextEncoder().encode(secret));
  await backendRequest("score", `/ho-so/cua-toi/don-minh-chung/${encodeURIComponent(job.operation_id)}`,
    { method: "POST", auth: "candidate", body: { proof } });
}

export async function retryWithdrawnEvidence() {
  const me = await currentCandidate();
  const jobs = await backendRequest<Cleanup[]>("score", "/ho-so/cua-toi/don-minh-chung", { auth: "candidate" });
  for (const job of jobs) await cleanWithdrawnEvidence(job, me.cccd);
}

export async function withdrawWithEvidence(path: string) {
  const me = await currentCandidate();
  const result = await backendRequest<Cleanup>("score", path, { method: "DELETE", auth: "candidate" });
  await cleanWithdrawnEvidence(result, me.cccd);
  return { success: true };
}

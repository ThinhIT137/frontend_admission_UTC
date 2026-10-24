import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { SignJWT } from "jose";
import { backendRequest, BackendError } from "@/libs/api-services/backend.server";
import { currentCandidate } from "@/services/candidate-auth.service";
import { inspectEvidence, privateEvidenceStorage, sha256 } from "@/libs/submission-storage.server";

export const runtime = "nodejs";
export const maxDuration = 300;
type Operation = { operation_id: string; status: string; ma_ho_so: string; files: Array<{key:string;sha256:string;size:number}>; payload_hash:string };

async function boundedForm(request: NextRequest) {
  const reader = request.body?.getReader();
  if (!reader) throw new BackendError("Thiếu dữ liệu",400);
  const chunks: Uint8Array[] = []; let size = 0;
  while (true) {
    const {done,value} = await reader.read(); if (done) break;
    size += value.byteLength;
    if (size > 4400000) { await reader.cancel(); throw new BackendError("Dữ liệu quá lớn",413); }
    chunks.push(value);
  }
  const bytes = Buffer.concat(chunks);
  return new Response(bytes,{headers:{"content-type":request.headers.get("content-type")||""}}).formData();
}

/** Một lần bấm: metadata trước → từng file → chốt; lỗi file thì giao dịch bù đúng lần nộp. */
export async function POST(request: NextRequest) {
  let operation: Operation | undefined;
  let operationId = "";
  let cccd = "";
  let createAttempted = false;
  const runId = randomUUID();
  const started = Date.now();
  const proof = async (action: string, hash?: string) => {
    const secret = process.env.JWT_ACCESSTOKEN;
    if (!secret) throw new BackendError("Chưa cấu hình xác thực", 503);
    return new SignJWT({ purpose: "submission-coordinator", operation_id: operationId, action, run_id: runId,
      ...(hash ? {payload_hash:hash} : {}) }).setProtectedHeader({alg:"HS256"}).setSubject(cccd)
      .setAudience("submission-coordinator").setIssuedAt().setExpirationTime("5m").sign(new TextEncoder().encode(secret));
  };
  const command = async (action:string) => backendRequest<Operation>("score", `/submission-operations/${operationId}/${action}`,
    {method:"POST", auth:"candidate", body:{proof:await proof(action),run_id:runId}});
  try {
    const origin = request.headers.get("origin");
    if (!origin || new URL(origin).host !== request.headers.get("host")) throw new BackendError("Origin không hợp lệ",403);
    if (Number(request.headers.get("content-length") || 0) > 4400000) throw new BackendError("Dữ liệu quá lớn",413);
    const me = await currentCandidate(); cccd = me.cccd;
    const form = await boundedForm(request);
    const raw = form.get("payload");
    if (typeof raw !== "string" || Buffer.byteLength(raw,"utf8") > 131072) throw new BackendError("Dữ liệu không hợp lệ",400);
    const input = JSON.parse(raw);
    operationId = input.operation_id;
    if (typeof operationId !== "string" || !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(operationId) || input.cccd !== cccd) throw new BackendError("Lần nộp không hợp lệ",400);
    const files = form.getAll("files");
    const names: string[] = input.file_keys;
    if (!Array.isArray(names) || files.length !== names.length || files.length > 10 || new Set(names).size !== names.length) throw new BackendError("Danh sách file không hợp lệ",400);
    let total = 0;
    const prepared = [];
    for (let i=0; i<files.length; i++) {
      const file = files[i];
      if (!(file instanceof File) || typeof names[i] !== "string") throw new BackendError("File không hợp lệ",400);
      const data = await inspectEvidence(file); total += data.size;
      if (total > 3800000) throw new BackendError("Tổng file mới tối đa 3,8 MB mỗi lần nộp",413);
      // Namespace suy ra từ UUID lần nộp: không bao giờ ghi đè khóa file cũ.
      const hex = sha256(`${operationId}:${i}`).slice(0,32);
      const uuid = `${hex.slice(0,8)}-${hex.slice(8,12)}-${hex.slice(12,16)}-${hex.slice(16,20)}-${hex.slice(20)}`;
      prepared.push({...data,key:`${cccd}/${uuid}.${data.type}`,draftKey:names[i]});
    }
    const submission = input.submission;
    for (const item of [...submission.chung_chi, ...(submission.giai_thuong || [])]) {
      const fresh = prepared.find(f=>f.draftKey === item.file_dinh_kem);
      if (fresh) item.file_dinh_kem = fresh.key;
    }
    const document = JSON.stringify({submission,profile:input.profile,files:prepared.map(({key,sha256,size})=>({key,sha256,size}))});
    const store = prepared.length ? await privateEvidenceStorage() : undefined;
    // Không upload khi validation/commit dữ liệu thất bại. Retry cùng UUID chỉ nhận lại đúng journal.
    createAttempted = true;
    operation = await backendRequest<Operation>("score","/submission-operations",{method:"POST",auth:"candidate",
      body:{operation_id:operationId,document,run_id:runId,proof:await proof("create",sha256(document))}});
    if (operation.status === "completed") return NextResponse.json({success:true,maHoSo:operation.ma_ho_so});
    if (operation.status === "rolled_back") return NextResponse.json({success:false,rollback:"completed",message:"Lần nộp trước đã hoàn tác. Vui lòng bấm nộp lại để tạo lần mới."},{status:409});
    if (operation.status !== "pending") throw new BackendError("Lần nộp cần hoàn tác",409);
    for (const file of prepared) {
      if (Date.now()-started > 150000) throw new BackendError("Hết thời gian lưu minh chứng",504);
      const result = await store!.upload(file.key,file.bytes,{upsert:false,cacheControl:"0",contentType:file.type==="pdf"?"application/pdf":`image/${file.type==="jpg"?"jpeg":"png"}`});
      if (result.error) {
        // Response upload có thể mất dù object đã lưu: chỉ nhận object trùng bytes, tuyệt đối không upsert.
        const old = await store!.download(file.key);
        if (old.error || !old.data || sha256(Buffer.from(await old.data.arrayBuffer())) !== file.sha256) throw new BackendError("Không lưu được minh chứng",502);
      }
    }
    operation = await command("finalize");
    return NextResponse.json({success:true,maHoSo:operation.ma_ho_so},{headers:{"Cache-Control":"private, no-store"}});
  } catch (error) {
    console.error("[Nộp hồ sơ và minh chứng]",error);
    let rollback = createAttempted ? "pending" : "not_started";
    if (createAttempted) {
      try {
        operation = await backendRequest<Operation>("score",`/submission-operations/${operationId}`,{auth:"candidate"});
        if (operation.status === "completed") return NextResponse.json({success:true,maHoSo:operation.ma_ho_so});
        if (operation.status === "rolled_back") return NextResponse.json({success:false,rollback:"completed",message:"Lần nộp đã hoàn tác. Vui lòng thử lại."},{status:409});
      } catch {
        // 404 ngay sau timeout chưa chứng minh transaction đầu đã dừng; giữ cùng UUID để retry.
        if (error instanceof BackendError && [400,401,403,422].includes(error.status)) rollback = "not_started";
      }
    }
    if (operation && operation.status !== "completed") {
      try {
        const cancelling = await command("abort");
        let clean = true;
        if (cancelling.files.length) {
          try {
            const store = await privateEvidenceStorage();
            const result = await store.remove(cancelling.files.map(f=>f.key));
            if (result.error) clean = false;
          } catch (cleanupError) { console.error("[Dọn minh chứng]",cleanupError); clean = false; }
        }
        await command("compensate");
        if (clean) await command("cleanup-complete");
        rollback = clean ? "completed" : "files_pending";
      } catch (rollbackError) { console.error("[Hoàn tác hồ sơ]",rollbackError); rollback = "pending"; }
    }
    return NextResponse.json({success:false,rollback,
      message: rollback === "pending" || rollback === "files_pending"
        ? "Chưa hoàn tất đối soát lần nộp. Vui lòng giữ trang và thử lại sau vài phút; không tạo hồ sơ mới."
        : "Không thể nộp hồ sơ. Dữ liệu lần nộp chưa được giữ lại; vui lòng kiểm tra và thử lại."},
      {status:error instanceof BackendError?error.status:400,headers:{"Cache-Control":"private, no-store"}});
  }
}

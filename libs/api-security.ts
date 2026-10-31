import "server-only";
import { NextResponse } from "next/server";

export class ApiSecurityError extends Error {
  constructor(public status: number, public retryAfter?: number) { super("Request rejected"); }
}

export function enforceSameOrigin(request: Request): void {
  const site = request.headers.get("sec-fetch-site");
  if (site !== null && !["same-origin", "same-site", "none"].includes(site)) throw new ApiSecurityError(403);
  const origin = request.headers.get("origin");
  if (origin === null) return;
  try {
    const parsed = new URL(origin);
    const target = new URL(request.url);
    if (origin === "null" || parsed.origin !== origin || !["http:", "https:"].includes(parsed.protocol))
      throw new Error("origin");
    if (parsed.origin === target.origin) return;
    // Next có thể chuẩn hóa 127.0.0.1 thành localhost. Chỉ chấp nhận bí danh
    // loopback cùng cổng/giao thức và đúng Host thực; không tin X-Forwarded-*.
    const loopback = new Set(["localhost", "127.0.0.1", "[::1]"]);
    const host = request.headers.get("host");
    if (!host || !loopback.has(target.hostname) || !loopback.has(parsed.hostname) ||
        parsed.protocol !== target.protocol || parsed.port !== target.port ||
        host !== parsed.host) throw new Error("origin");
  } catch { throw new ApiSecurityError(403); }
}

export async function readBoundedJson(request: Request, maxBytes = 100_000, allowEmpty = false): Promise<Record<string, unknown> | undefined> {
  const length = request.headers.get("content-length");
  if (length && (!/^\d+$/.test(length) || Number(length) > maxBytes)) throw new ApiSecurityError(413);
  const reader = request.body?.getReader();
  if (!reader) {
    if (allowEmpty) return undefined;
    throw new ApiSecurityError(400);
  }
  const chunks: Uint8Array[] = [];
  let total = 0;
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > maxBytes) { await reader.cancel(); throw new ApiSecurityError(413); }
      chunks.push(value);
    }
    const bytes = new Uint8Array(total);
    let offset = 0;
    for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
    const text = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
    if (!text.trim() && allowEmpty) return undefined;
    const data = JSON.parse(text);
    if (!data || typeof data !== "object" || Array.isArray(data)) throw new ApiSecurityError(400);
    return data as Record<string, unknown>;
  } catch (error) {
    if (error instanceof ApiSecurityError) throw error;
    throw new ApiSecurityError(400);
  } finally { reader.releaseLock(); }
}

export function privateJson(body: unknown, init: ResponseInit = {}) {
  const headers = new Headers(init.headers);
  headers.set("Cache-Control", "private, no-store");
  headers.set("X-Content-Type-Options", "nosniff");
  return NextResponse.json(body, { ...init, headers });
}

export function apiFailure(error: unknown, fallback = 400) {
  const status = error instanceof ApiSecurityError ? error.status
    : typeof error === "object" && error && "status" in error && typeof error.status === "number" ? error.status : fallback;
  const safeStatus = status >= 400 && status <= 599 ? status : fallback;
  const message = safeStatus < 500 && safeStatus !== 429 && typeof (error as any)?.message === "string" && (error as any).message
    ? (error as any).message
    : (safeStatus === 429 ? "Quá nhiều yêu cầu. Vui lòng thử lại sau." : "Thao tác thất bại. Vui lòng thử lại.");
  return privateJson({ success: false, message }, {
    status: safeStatus,
    headers: error instanceof ApiSecurityError && error.retryAfter ? { "Retry-After": String(error.retryAfter) } : undefined,
  });
}

// A route-total budget per Node process; never trusts user-supplied IP headers.
export class RouteRateLimiter {
  private buckets = new Map<string, { count: number; until: number }>();
  constructor(private clock = () => Date.now()) {}
  check(key: string, limit: number, windowMs = 60_000): void {
    const now = this.clock();
    for (const [id, bucket] of this.buckets) if (bucket.until <= now) this.buckets.delete(id);
    let bucket = this.buckets.get(key);
    if (!bucket) {
      if (this.buckets.size >= 128) throw new ApiSecurityError(429, Math.ceil(windowMs / 1000));
      bucket = { count: 0, until: now + windowMs }; this.buckets.set(key, bucket);
    }
    if (bucket.count >= limit) throw new ApiSecurityError(429, Math.max(1, Math.ceil((bucket.until - now) / 1000)));
    bucket.count++;
  }
}
export const publicApiLimiter = new RouteRateLimiter();

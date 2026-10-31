import { publicApiLimiter } from "@/libs/api-security";
import prisma from "@/libs/prisma";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { pbkdf2, randomBytes, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import "server-only";

export type CandidateProfile = {
    cccd: string;
    ho_ten: string;
    so_dien_thoai: string;
};
export class CandidateAuthError extends Error {
    constructor(
        public status: number,
        message = "Không thể xác thực tài khoản thí sinh",
        public field?: "cccd" | "so_dien_thoai",
    ) {
        super(message);
        this.name = "CandidateAuthError";
    }
}
const derive = promisify(pbkdf2);
const profileSelect = {
    cccd: true,
    ho_ten: true,
    so_dien_thoai: true,
} as const;
const audience = () =>
    process.env.JWT_AUDIENCE || process.env.jwt_audience || undefined;
function secret() {
    const value = process.env.JWT_ACCESSTOKEN;
    if (!value) throw new CandidateAuthError(503);
    return new TextEncoder().encode(value);
}
function credentials(input: Record<string, unknown>) {
    if (
        typeof input.cccd !== "string" ||
        !/^\d{12}$/.test(input.cccd) ||
        typeof input.password !== "string" ||
        input.password.length < 10 ||
        input.password.length > 128
    )
        throw new CandidateAuthError(400);
    return { cccd: input.cccd, password: input.password };
}
export function limitCandidateAuth() {
    publicApiLimiter.check("candidate-auth", 60);
}
// Salt được băm dưới dạng chuỗi UTF-8, đúng định dạng PBKDF2 đang dùng ở backend điểm.
async function hash(password: string, salt: string) {
    return Buffer.from(await derive(password, salt, 600_000, 32, "sha256"));
}
export async function setCandidateCookies(tokens: {
    access_token: string;
    refresh_token: string;
}) {
    const jar = await cookies();
    const opts = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax" as const,
        path: "/",
    };
    jar.set("candidateToken", tokens.access_token, { ...opts, maxAge: 900 });
    jar.set("candidateRefresh", tokens.refresh_token, {
        ...opts,
        maxAge: 604800,
    });
}
async function issue(cccd: string) {
    const base = { cccd, role: "thi_sinh" };
    const create = (type: "access" | "refresh", ttl: number) => {
        let jwt = new SignJWT({ ...base, token_type: type })
            .setProtectedHeader({ alg: "HS256" })
            .setSubject(cccd)
            .setIssuedAt()
            .setExpirationTime(Math.floor(Date.now() / 1000) + ttl);
        if (type === "refresh")
            jwt = jwt.setJti(randomBytes(24).toString("base64url"));
        if (audience()) jwt = jwt.setAudience(audience()!);
        return jwt.sign(secret());
    };
    const [access_token, refresh_token] = await Promise.all([
        create("access", 900),
        create("refresh", 604800),
    ]);
    return { access_token, refresh_token };
}
async function verify(token: string, type: "access" | "refresh") {
    try {
        const { payload } = await jwtVerify(token, secret(), {
            algorithms: ["HS256"],
            audience: audience(),
            requiredClaims: ["exp", "iat", "sub"],
        });
        if (
            payload.role !== "thi_sinh" ||
            payload.token_type !== type ||
            typeof payload.cccd !== "string" ||
            !/^\d{12}$/.test(payload.cccd) ||
            payload.sub !== payload.cccd
        )
            throw new Error();
        return payload.cccd;
    } catch (error) {
        if (error instanceof CandidateAuthError && error.status !== 401)
            throw error;
        throw new CandidateAuthError(401);
    }
}
async function account(cccd: string): Promise<CandidateProfile> {
    const found = await prisma.thiSinh.findUnique({
        where: { cccd },
        select: { ...profileSelect, password: true },
    });
    if (!found?.password) throw new CandidateAuthError(401);
    return {
        cccd: found.cccd,
        ho_ten: found.ho_ten,
        so_dien_thoai: found.so_dien_thoai,
    };
}
export async function loginCandidate(
    input: Record<string, unknown>,
): Promise<CandidateProfile> {
    const { cccd, password } = credentials(input);
    const found = await prisma.thiSinh.findUnique({
        where: { cccd },
        select: { ...profileSelect, password: true },
    });
    const validHash =
        typeof found?.password === "string" &&
        /^[a-f0-9]{32}\$[a-f0-9]{64}$/.test(found.password);
    const [salt, expected] = validHash
        ? found!.password!.split("$")
        : ["0".repeat(32), "0".repeat(64)];
    // Tài khoản không tồn tại vẫn chạy phép băm, tránh trả lời nhanh làm lộ CCCD đã đăng ký.
    const actual = await hash(password, salt);
    if (
        !timingSafeEqual(actual, Buffer.from(expected, "hex")) ||
        !validHash ||
        !found
    )
        throw new CandidateAuthError(401);
    await setCandidateCookies(await issue(cccd));
    return { cccd, ho_ten: found.ho_ten, so_dien_thoai: found.so_dien_thoai };
}
export async function registerCandidate(
    input: Record<string, unknown>,
): Promise<CandidateProfile> {
    // Kiểm tra cấu hình trước khi ghi tài khoản; lỗi cấu hình không để lại đăng ký chưa có phiên.
    secret();
    const { cccd, password } = credentials(input);
    const name = typeof input.ho_ten === "string" ? input.ho_ten.trim() : "";
    if (
        name.length < 2 ||
        name.length > 100 ||
        typeof input.so_dien_thoai !== "string" ||
        !/^\d{10,11}$/.test(input.so_dien_thoai)
    )
        throw new CandidateAuthError(400);
    const salt = randomBytes(16).toString("hex");
    const encoded = `${salt}$${(await hash(password, salt)).toString("hex")}`;
    let user: CandidateProfile;
    try {
        // create tuyệt đối không ghi đè hồ sơ CCCD cũ chưa kích hoạt; unique constraint xử lý cả đăng ký đồng thời.
        user = await prisma.thiSinh.create({
            data: {
                cccd,
                password: encoded,
                ho_ten: name,
                so_dien_thoai: input.so_dien_thoai,
            },
            select: profileSelect,
        });
    } catch (error) {
        if (
            typeof error === "object" &&
            error &&
            "code" in error &&
            error.code === "P2002"
        ) {
            const errObj = error as { meta?: { target?: unknown; driverError?: { detail?: string } }; message?: string };
            const metaTarget = errObj.meta?.target;
            const targetStr = [
                Array.isArray(metaTarget) ? metaTarget.join(" ") : String(metaTarget || ""),
                errObj.meta?.driverError?.detail || "",
                errObj.message || ""
            ].join(" ");
            let isPhone = targetStr.includes("so_dien_thoai") || targetStr.includes("phone");

            if (!isPhone && !targetStr.includes("cccd") && !targetStr.includes("pkey")) {
                const existingPhone = await prisma.thiSinh.findUnique({
                    where: { so_dien_thoai: input.so_dien_thoai as string },
                    select: { cccd: true }
                }).catch(() => null);
                if (existingPhone) isPhone = true;
            }

            throw new CandidateAuthError(
                409,
                isPhone
                    ? "Số điện thoại này đã được sử dụng bởi một tài khoản khác. Vui lòng kiểm tra lại số điện thoại."
                    : "Số CCCD đã tồn tại trên hệ thống. Với hồ sơ CCCD cũ, hãy dùng chức năng kích hoạt.",
                isPhone ? "so_dien_thoai" : "cccd"
            );
        }
        throw error;
    }
    await setCandidateCookies(await issue(cccd));
    return user;
}
export async function refreshCandidateSession(): Promise<string> {
    const token = (await cookies()).get("candidateRefresh")?.value;
    if (!token) throw new CandidateAuthError(401);
    const cccd = await verify(token, "refresh");
    await account(cccd);
    const tokens = await issue(cccd);
    await setCandidateCookies(tokens);
    return tokens.access_token;
}
export async function currentCandidate(): Promise<CandidateProfile> {
    const token = (await cookies()).get("candidateToken")?.value;
    let cccd: string;
    try {
        if (!token) throw new CandidateAuthError(401);
        cccd = await verify(token, "access");
    } catch (error) {
        if (!(error instanceof CandidateAuthError) || error.status !== 401)
            throw error;
        cccd = await verify(await refreshCandidateSession(), "access");
    }
    return account(cccd);
}
export async function logoutCandidate() {
    const jar = await cookies();
    jar.delete("candidateToken");
    jar.delete("candidateRefresh");
}

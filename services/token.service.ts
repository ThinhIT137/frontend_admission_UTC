import { ACCESS_SECRET, REFRESH_SECRET, TokenPayload } from "@/libs/token";
import { jwtVerify, SignJWT } from "jose";

export const tokenService = {
    generateAccessToken: async (userId: string): Promise<string> => {
        try {
            return await new SignJWT({ userId })
                .setProtectedHeader({ alg: "HS256" })
                .setSubject(userId)
                .setIssuedAt()
                .setExpirationTime("15m")
                .sign(ACCESS_SECRET);
        } catch (err) {
            throw new Error(`Lỗi khởi tạo access token: ${String(err)}`);
        }
    },

    generateRefreshToken: async (userId: string): Promise<string> => {
        try {
            return await new SignJWT({ userId })
                .setProtectedHeader({ alg: "HS256" })
                .setSubject(userId)
                .setIssuedAt()
                .setExpirationTime("7d")
                .sign(REFRESH_SECRET);
        } catch (err) {
            throw new Error(`Lỗi khởi tạo refresh token: ${String(err)}`);
        }
    },

    generateToken: async (userId: string): Promise<[string, string]> => {
        return [
            await tokenService.generateAccessToken(userId),
            await tokenService.generateRefreshToken(userId),
        ];
    },

    verifyAccessToken: async (token: string): Promise<TokenPayload | null> => {
        try {
            const { payload } = await jwtVerify(token, ACCESS_SECRET);
            return {
                userId: payload.userId as string,
                ...payload,
            };
        } catch (err) {
            return null;
        }
    },

    verifyRefreshToken: async (token: string): Promise<TokenPayload | null> => {
        try {
            const { payload } = await jwtVerify(token, REFRESH_SECRET);
            return {
                userId: payload.userId as string,
                ...payload,
            };
        } catch (err) {
            return null;
        }
    },
};

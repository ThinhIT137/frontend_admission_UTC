import { ACCESS_TOKEN_MAX_AGE, REFRESH_TOKEN_MAX_AGE } from "@/libs/token";
import { cookies } from "next/headers";

export const cookieService = {
    setAuthToken: async (
        token_name: string,
        token: string,
        maxAgeInSeconds: number,
    ) => {
        const cookieStore = await cookies();

        cookieStore.set(token_name, token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: maxAgeInSeconds,
        });
    },

    setToken: async (
        [accessTokenName, accessTokenValue, accessTokenMaxAge]: [
            string,
            string,
            number,
        ],
        [refreshTokenName, refreshTokenValue, refreshTokenMaxAge]: [
            string,
            string,
            number,
        ],
    ) => {
        const cookieStore = await cookies();

        cookieStore.set(accessTokenName, accessTokenValue, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: accessTokenMaxAge,
        });

        cookieStore.set(refreshTokenName, refreshTokenValue, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/api/auth/refresh",
            maxAge: refreshTokenMaxAge,
        });
    },

    getCookie: async (name: string) => {
        try {
            const cookieStore = await cookies();
            return cookieStore.get(name)?.value;
        } catch {
            throw new Error("Lỗi không tìm thấy cookie: " + name + "để lấy");
        }
    },

    deleteCookie: async (name: string) => {
        try {
            const cookieStore = await cookies();
            cookieStore.delete(name);
        } catch {
            throw new Error("Lỗi không tìm thấy cookie: " + name + " để xóa");
        }
    },
};

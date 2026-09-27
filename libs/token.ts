export const ACCESS_SECRET = new TextEncoder().encode(
    process.env.JWT_ACCESSTOKEN,
);

export const REFRESH_SECRET = new TextEncoder().encode(
    process.env.JWT_REFRESHTOKEN,
);

export type TokenPayload = {
    userId: string;
    [key: string]: any;
};

export const ACCESS_TOKEN_MAX_AGE = 60 * 15;
export const REFRESH_TOKEN_MAX_AGE = 60 * 60 * 24 * 7;

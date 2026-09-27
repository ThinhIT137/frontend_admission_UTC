
export type LoginPayload = {
    email: string;
    password: string;
};

export type LoginResponse = {
    token: Token;
};

export type Token = {
    accessToken: string;
    refreshToken: string;
};

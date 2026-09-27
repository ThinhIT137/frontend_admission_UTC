import bcrypt from "bcryptjs";

export const hashPassword = async (plainText: string): Promise<String> => {
    const SALT_ROUNDS = Number(process.env.HASH_SALT_ROUNDS);

    if (!Number.isInteger(SALT_ROUNDS) || SALT_ROUNDS <= 0)
        throw new Error("HASH_SALT_ROUNDS không hợp lệ");

    return await bcrypt.hash(plainText, Number(SALT_ROUNDS));
};

export const verifyPassword = async (
    plainText: string,
    hashedText: string,
): Promise<Boolean> => {
    return await bcrypt.compare(plainText, hashedText);
};

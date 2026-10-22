/** Chỉ bọc SELECT xác thực độc lập; không bọc ghi DB, transaction hoặc phát cookie. */
export async function readAuthWithReconnect<T>(read: () => Promise<T>): Promise<T> {
    try { return await read(); }
    catch (error) {
        if (!isTransientConnectionError(error)) throw error;
        console.warn("[auth] Kết nối database bị ngắt; thử đọc lại một lần.");
        await new Promise(resolve => setTimeout(resolve, 150));
        return read();
    }
}

function isTransientConnectionError(error: unknown, depth = 0): boolean {
    if (!error || typeof error !== "object" || depth > 5) return false;
    const item = error as Record<string, unknown>;
    if (["P1001", "P1002", "P1017", "ECONNRESET", "ECONNREFUSED", "ETIMEDOUT", "08000", "08003", "08006", "57P01", "57P02", "57P03"].includes(String(item.code))) return true;
    if (["ConnectionClosed", "DatabaseNotReachable", "SocketTimeout"].includes(String(item.kind))) return true;
    // Prisma v7 adapter-pg bọc lỗi socket trong meta.driverAdapterError.cause.
    for (const key of ["cause", "meta", "driverAdapterError", "originalError"]) {
        if (isTransientConnectionError(item[key], depth + 1)) return true;
    }
    // pg cũng phát Error không có code khi đầu bên kia đóng kết nối.
    return item instanceof Error && ["Connection terminated unexpectedly", "Connection terminated", "Connection closed unexpectedly"].includes(item.message);
}

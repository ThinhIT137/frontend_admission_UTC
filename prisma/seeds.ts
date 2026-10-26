import "dotenv/config";
import pg from "pg";
// Node 24 chạy trực tiếp TypeScript, nên cần phần mở rộng .ts.
// @ts-ignore -- project dùng TypeScript 5.0; runtime Node hỗ trợ import .ts.
import { seedLoTrinhTuyenSinh } from "./Seeds/LoTrinhTuyenSinh.Seed.ts";

async function main() {
  const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
  if (!connectionString) throw new Error("Thiếu DIRECT_URL hoặc DATABASE_URL");
  const pool = new pg.Pool({ connectionString, ssl: { rejectUnauthorized: false }, connectionTimeoutMillis: 10000 });
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    // Không tạo tài khoản admin giả. Có thể chỉ định chủ sở hữu qua SEED_ADMIN_ID.
    const admins = process.env.SEED_ADMIN_ID
      ? await client.query("SELECT ma_admin FROM admin WHERE ma_admin = $1", [process.env.SEED_ADMIN_ID])
      : await client.query("SELECT ma_admin FROM admin ORDER BY create_at, ma_admin LIMIT 1");
    if (!admins.rows.length) throw new Error("Không có admin hợp lệ để gắn mốc tuyển sinh");
    await seedLoTrinhTuyenSinh(client, admins.rows[0].ma_admin);
    // Các seed bổ sung phải gọi ở đây bằng cùng client trước COMMIT.
    await client.query("COMMIT");
    console.log("Đã lưu 6 mốc tuyển sinh UTC 2026.");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}
main().catch(() => {
  console.error("Seed thất bại; transaction chưa commit đã được rollback. Kiểm tra kết nối và admin.");
  process.exitCode = 1;
});

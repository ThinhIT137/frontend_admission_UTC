import { PrismaClient } from "./app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import * as dotenv from "dotenv";

dotenv.config();

const connectionUrl = process.env.DATABASE_URL;

const pool = new Pool({
    connectionString: connectionUrl,
    ssl: { rejectUnauthorized: false }
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    // Tạo 2 role mặc định
    const superAdminRole = await prisma.vaiTro.upsert({
        where: { ten_vai_tro: "super_admin" },
        update: {},
        create: {
            ten_vai_tro: "super_admin",
            mo_ta: "Quản trị viên cấp cao"
        }
    });

    const chuyenVienRole = await prisma.vaiTro.upsert({
        where: { ten_vai_tro: "chuyen_vien" },
        update: {},
        create: {
            ten_vai_tro: "chuyen_vien",
            mo_ta: "Chuyên viên (Editor)"
        }
    });

    console.log("Đã tạo vai trò:", superAdminRole, chuyenVienRole);

    // Cập nhật tất cả các admin hiện có thành super_admin
    const result = await prisma.admin.updateMany({
        where: { ma_vai_tro: "" },
        data: { ma_vai_tro: superAdminRole.ma_vai_tro }
    });
    
    console.log(`Đã cập nhật ${result.count} tài khoản admin sang super_admin.`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

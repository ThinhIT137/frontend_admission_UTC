import { PrismaClient } from "./app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const publicUrl = process.env.DATABASE_URL_PUBLIC?.includes("pgbouncer=true")
    ? process.env.DATABASE_URL_PUBLIC
    : `${process.env.DATABASE_URL_PUBLIC}?pgbouncer=true`;

const poolPublic = new Pool({
    connectionString: publicUrl,
    ssl: { rejectUnauthorized: false }
});

const adapterPublic = new PrismaPg(poolPublic);
const prismaPublic = new PrismaClient({ adapter: adapterPublic });

async function test() {
    const data = await prismaPublic.nganhHoc.findMany({
        where: {
            chuong_trinh: {
                some: {
                    OR: [
                        { ctdt_to_hop: { some: { nam: 2025 } } },
                        { lich_su_diem_chuan: { some: { nam: 2025 } } }
                    ]
                }
            }
        }
    });
    console.log("Majors with 2025 data:", data.length);
    
    const data2024 = await prismaPublic.nganhHoc.findMany({
        where: {
            chuong_trinh: {
                some: {
                    OR: [
                        { ctdt_to_hop: { some: { nam: 2024 } } },
                        { lich_su_diem_chuan: { some: { nam: 2024 } } }
                    ]
                }
            }
        }
    });
    console.log("Majors with 2024 data:", data2024.length);

    process.exit(0);
}
test();

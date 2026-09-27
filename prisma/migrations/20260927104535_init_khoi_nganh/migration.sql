-- AlterTable
ALTER TABLE "nganh_hoc" ADD COLUMN     "ma_khoi_nganh" TEXT;

-- CreateTable
CREATE TABLE "khoi_nganh" (
    "ma_khoi_nganh" TEXT NOT NULL,
    "ten_khoi_nganh" TEXT NOT NULL,

    CONSTRAINT "khoi_nganh_pkey" PRIMARY KEY ("ma_khoi_nganh")
);

-- AddForeignKey
ALTER TABLE "nganh_hoc" ADD CONSTRAINT "nganh_hoc_ma_khoi_nganh_fkey" FOREIGN KEY ("ma_khoi_nganh") REFERENCES "khoi_nganh"("ma_khoi_nganh") ON DELETE SET NULL ON UPDATE CASCADE;

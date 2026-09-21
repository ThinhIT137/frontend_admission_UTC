-- CreateEnum
CREATE TYPE "loai_hoc_phan" AS ENUM ('bat_buoc', 'tu_chon');

-- CreateTable
CREATE TABLE "hoc_phan" (
    "ma_hoc_phan" TEXT NOT NULL,
    "ten_hoc_phan" TEXT NOT NULL,
    "so_tin_chi" INTEGER NOT NULL,
    "so_tiet_ly_thuyet" INTEGER DEFAULT 0,
    "so_tiet_thuc_hanh" INTEGER DEFAULT 0,
    "mo_ta" TEXT,
    "create_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "hoc_phan_pkey" PRIMARY KEY ("ma_hoc_phan")
);

-- CreateTable
CREATE TABLE "ctdt_hoc_phan" (
    "ma_ctdt_hoc_phan" TEXT NOT NULL,
    "ma_chuong_trinh" TEXT NOT NULL,
    "ma_hoc_phan" TEXT NOT NULL,
    "nam_ap_dung" INTEGER NOT NULL,
    "hoc_ky" INTEGER NOT NULL,
    "loai" "loai_hoc_phan" NOT NULL DEFAULT 'bat_buoc',
    "khoi_kien_thuc" TEXT,

    CONSTRAINT "ctdt_hoc_phan_pkey" PRIMARY KEY ("ma_ctdt_hoc_phan")
);

-- CreateIndex
CREATE INDEX "ctdt_hoc_phan_ma_chuong_trinh_nam_ap_dung_hoc_ky_idx" ON "ctdt_hoc_phan"("ma_chuong_trinh", "nam_ap_dung", "hoc_ky");

-- CreateIndex
CREATE UNIQUE INDEX "ctdt_hoc_phan_ma_chuong_trinh_nam_ap_dung_ma_hoc_phan_key" ON "ctdt_hoc_phan"("ma_chuong_trinh", "nam_ap_dung", "ma_hoc_phan");

-- AddForeignKey
ALTER TABLE "ctdt_hoc_phan" ADD CONSTRAINT "ctdt_hoc_phan_ma_chuong_trinh_fkey" FOREIGN KEY ("ma_chuong_trinh") REFERENCES "chuong_trinh_dao_tao"("ma_chuong_trinh") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ctdt_hoc_phan" ADD CONSTRAINT "ctdt_hoc_phan_ma_hoc_phan_fkey" FOREIGN KEY ("ma_hoc_phan") REFERENCES "hoc_phan"("ma_hoc_phan") ON DELETE RESTRICT ON UPDATE CASCADE;

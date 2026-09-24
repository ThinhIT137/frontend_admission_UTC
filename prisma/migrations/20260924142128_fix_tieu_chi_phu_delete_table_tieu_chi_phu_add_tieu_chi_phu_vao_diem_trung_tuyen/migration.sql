/*
  Warnings:

  - You are about to drop the `tieu_chi_phu` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "tieu_chi_phu" DROP CONSTRAINT "tieu_chi_phu_ma_ls_dc_fkey";

-- AlterTable
ALTER TABLE "diem_trung_tuyen" ADD COLUMN     "diem_uu_tien_toi_thieu" DOUBLE PRECISION,
ADD COLUMN     "dieu_kien_mon" JSONB,
ADD COLUMN     "nguyen_vong_toi_da" INTEGER;

-- DropTable
DROP TABLE "tieu_chi_phu";

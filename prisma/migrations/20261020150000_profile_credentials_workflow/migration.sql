BEGIN;
SET LOCAL search_path = public;
SET LOCAL lock_timeout = '10s';
SET LOCAL statement_timeout = '60s';

-- CreateEnum
CREATE TYPE "trang_thai_ho_so" AS ENUM ('cho', 'hop_le', 'tu_choi', 'dang_xu_ly', 'do', 'truot');

-- AlterTable
ALTER TABLE "nguyen_vong_sinh_vien" ADD COLUMN     "chot_ket_qua_at" TIMESTAMP(6),
ADD COLUMN     "cong_bo_at" TIMESTAMP(6),
ADD COLUMN     "diem_trace" JSONB,
ADD COLUMN     "nguon_ket_qua" TEXT;
-- Preserve every existing profile state instead of dropping/recreating the column.
ALTER TABLE "nguyen_vong_sinh_vien" ALTER COLUMN "trang_thai" DROP DEFAULT;
ALTER TABLE "nguyen_vong_sinh_vien" ALTER COLUMN "trang_thai" TYPE "trang_thai_ho_so"
  USING "trang_thai"::text::"trang_thai_ho_so";
ALTER TABLE "nguyen_vong_sinh_vien" ALTER COLUMN "trang_thai" SET DEFAULT 'cho'::"trang_thai_ho_so";

-- AlterTable
ALTER TABLE "thi_sinh" ADD COLUMN     "email" TEXT,
ADD COLUMN     "password" TEXT;

-- CreateTable
CREATE TABLE "admission_notification" (
    "ma_ho_so" TEXT NOT NULL,
    "email" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "error" TEXT,
    "sent_at" TIMESTAMP(6),

    CONSTRAINT "admission_notification_pkey" PRIMARY KEY ("ma_ho_so")
);

-- CreateTable
CREATE TABLE "admission_score_import" (
    "digest" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "admin_id" TEXT NOT NULL,
    "row_count" INTEGER NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "admission_score_import_pkey" PRIMARY KEY ("digest")
);

-- AddForeignKey
ALTER TABLE "admission_notification" ADD CONSTRAINT "admission_notification_ma_ho_so_fkey" FOREIGN KEY ("ma_ho_so") REFERENCES "nguyen_vong_sinh_vien"("ma_ho_so") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "admission_score_import" ADD CONSTRAINT "admission_score_import_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "admin"("ma_admin") ON DELETE NO ACTION ON UPDATE NO ACTION;

ALTER TABLE "admission_notification" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "admission_score_import" ENABLE ROW LEVEL SECURITY;
COMMIT;

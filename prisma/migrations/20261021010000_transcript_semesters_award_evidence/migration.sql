ALTER TABLE "bang_diem" ADD COLUMN "hoc_ky" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "bang_diem" ADD CONSTRAINT "bang_diem_hoc_ky_check" CHECK ("hoc_ky" BETWEEN 0 AND 2);
ALTER TABLE "giai_thuong" ADD COLUMN "file_dinh_kem" TEXT;
ALTER TABLE "thi_sinh" ADD COLUMN "activation_otp_hash" TEXT,
  ADD COLUMN "activation_otp_expires" TIMESTAMP(6),
  ADD COLUMN "activation_otp_sent_at" TIMESTAMP(6),
  ADD COLUMN "activation_otp_attempts" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "admission_year_lock" (
    "nam" INTEGER NOT NULL,
    "locked_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ma_admin" TEXT NOT NULL,

    CONSTRAINT "admission_year_lock_pkey" PRIMARY KEY ("nam")
);

-- AddForeignKey
ALTER TABLE "admission_year_lock" ADD CONSTRAINT "admission_year_lock_ma_admin_fkey" FOREIGN KEY ("ma_admin") REFERENCES "admin"("ma_admin") ON DELETE RESTRICT ON UPDATE CASCADE;

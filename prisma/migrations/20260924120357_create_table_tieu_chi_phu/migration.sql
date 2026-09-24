-- CreateTable
CREATE TABLE "tieu_chi_phu" (
    "ma_tieu_chi" TEXT NOT NULL,
    "ma_ls_dc" TEXT NOT NULL,
    "nguyen_vong_toi_da" INTEGER,
    "dieu_kien_mon" JSONB,
    "diem_uu_tien_toi_thieu" DOUBLE PRECISION,

    CONSTRAINT "tieu_chi_phu_pkey" PRIMARY KEY ("ma_tieu_chi")
);

-- CreateIndex
CREATE UNIQUE INDEX "tieu_chi_phu_ma_ls_dc_key" ON "tieu_chi_phu"("ma_ls_dc");

-- AddForeignKey
ALTER TABLE "tieu_chi_phu" ADD CONSTRAINT "tieu_chi_phu_ma_ls_dc_fkey" FOREIGN KEY ("ma_ls_dc") REFERENCES "lich_su_diem_chuan"("ma_ls_dc") ON DELETE CASCADE ON UPDATE CASCADE;

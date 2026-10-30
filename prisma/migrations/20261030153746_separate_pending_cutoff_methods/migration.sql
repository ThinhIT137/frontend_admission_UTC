-- CreateTable
CREATE TABLE "cutoff_method" (
    "ma_ls_dc" TEXT NOT NULL,
    "ma_phuong_thuc" TEXT NOT NULL,

    CONSTRAINT "cutoff_method_pkey" PRIMARY KEY ("ma_ls_dc","ma_phuong_thuc")
);

-- AddForeignKey
ALTER TABLE "cutoff_method" ADD CONSTRAINT "cutoff_method_ma_ls_dc_fkey" FOREIGN KEY ("ma_ls_dc") REFERENCES "lich_su_diem_chuan"("ma_ls_dc") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cutoff_method" ADD CONSTRAINT "cutoff_method_ma_phuong_thuc_fkey" FOREIGN KEY ("ma_phuong_thuc") REFERENCES "phuong_thuc_xet_tuyen"("ma_phuong_thuc") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Preserve all existing scores, including genuine zero scores. This adds only
-- their method assignments; it does not infer that any stored score is missing.
INSERT INTO "cutoff_method" ("ma_ls_dc", "ma_phuong_thuc")
SELECT "ma_ls_dc", "ma_phuong_thuc" FROM "diem_trung_tuyen"
ON CONFLICT DO NOTHING;

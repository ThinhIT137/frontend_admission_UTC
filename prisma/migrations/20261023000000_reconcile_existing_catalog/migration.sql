-- Replay the catalog changes already present on Supabase but absent from history.
-- On that existing database, verify the catalog and resolve this migration as
-- applied; do NOT execute this SQL against the already converted schema.
BEGIN;

CREATE TABLE "vai_tro" (
  "ma_vai_tro" TEXT NOT NULL,
  "ten_vai_tro" TEXT NOT NULL,
  "mo_ta" TEXT,
  CONSTRAINT "vai_tro_pkey" PRIMARY KEY ("ma_vai_tro")
);
CREATE UNIQUE INDEX "vai_tro_ten_vai_tro_key" ON "vai_tro"("ten_vai_tro");

-- Copy each role verbatim: no account is promoted during conversion.
INSERT INTO "vai_tro" ("ma_vai_tro", "ten_vai_tro")
SELECT 'legacy-role-' || role::text, role::text
FROM unnest(enum_range(NULL::"vai_tro_admin")) AS role;
ALTER TABLE "admin" ADD COLUMN "ma_vai_tro" TEXT;
UPDATE "admin" SET "ma_vai_tro" = 'legacy-role-' || "vai_tro"::text;
ALTER TABLE "admin" ALTER COLUMN "ma_vai_tro" SET NOT NULL;
ALTER TABLE "admin" ADD CONSTRAINT "admin_ma_vai_tro_fkey"
  FOREIGN KEY ("ma_vai_tro") REFERENCES "vai_tro"("ma_vai_tro")
  ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "admin" DROP COLUMN "vai_tro";
DROP TYPE "vai_tro_admin";

CREATE TYPE "LoaiChuanDauRa" AS ENUM ('CU_NHAN', 'KY_SU', 'THAC_SI', 'TIEN_SI', 'KHAC');
-- A nonempty legacy value must be an exact enum label. Unknown free text
-- aborts the whole transaction instead of silently discarding that content.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM "chuong_trinh_dao_tao"
    WHERE "chuan_dau_ra" IS NOT NULL AND "chuan_dau_ra" <> ''
      AND "chuan_dau_ra" NOT IN ('CU_NHAN', 'KY_SU', 'THAC_SI', 'TIEN_SI', 'KHAC')
  ) THEN
    RAISE EXCEPTION 'Legacy chuan_dau_ra contains free text; prepare an approved value mapping before migrating';
  END IF;
END $$;
ALTER TABLE "chuong_trinh_dao_tao" ALTER COLUMN "chuan_dau_ra"
  TYPE "LoaiChuanDauRa"[] USING CASE
    WHEN "chuan_dau_ra" IS NULL THEN NULL
    WHEN "chuan_dau_ra" = '' THEN ARRAY[]::"LoaiChuanDauRa"[]
    ELSE ARRAY["chuan_dau_ra"::"LoaiChuanDauRa"] END;

CREATE TABLE "cau_hoi_mbti" (
  "id" SERIAL NOT NULL,
  "noi_dung" TEXT NOT NULL,
  "chieu_do" VARCHAR(10) NOT NULL,
  "chieu_tich_cuc" VARCHAR(5) NOT NULL,
  "linh_vuc_ngu_canh" VARCHAR(255),
  "trang_thai" VARCHAR(20) DEFAULT 'active',
  "create_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "cau_hoi_mbti_pkey" PRIMARY KEY ("id")
);
-- Match the existing catalog. No new public access to MBTI data is granted.
ALTER TABLE "cau_hoi_mbti" ENABLE ROW LEVEL SECURITY;
COMMIT;

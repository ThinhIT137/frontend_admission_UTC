-- New tables only. Existing trang_noi_dung content remains untouched.
BEGIN;
CREATE TYPE "Chuyen_muc" AS ENUM ('de_an', 'quy_che', 'tin_tuc', 'huong_dan');
CREATE TYPE "TrangThaiTinTuc" AS ENUM ('nhap', 'xuat_ban', 'an');

CREATE TABLE "tin_tuc" (
  "id" BIGSERIAL NOT NULL,
  "tieu_de" VARCHAR(255) NOT NULL,
  "slug" VARCHAR(300) NOT NULL,
  "tom_tat" TEXT,
  "anh_dai_dien" TEXT,
  "noi_dung" JSONB NOT NULL,
  "noi_dung_text" TEXT,
  "chuyen_muc" "Chuyen_muc" NOT NULL,
  "trang_thai" "TrangThaiTinTuc" NOT NULL DEFAULT 'nhap',
  "ghim" BOOLEAN NOT NULL DEFAULT false,
  "luot_xem" INTEGER NOT NULL DEFAULT 0,
  "ngay_dang" TIMESTAMPTZ(6),
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(6) NOT NULL,
  "ma_admin" TEXT NOT NULL,
  CONSTRAINT "tin_tuc_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "tai_lieu_tin_tuc" (
  "id" TEXT NOT NULL,
  "tin_tuc_id" BIGINT NOT NULL,
  "ten_file" VARCHAR(255) NOT NULL,
  "duong_dan" TEXT NOT NULL,
  "mime_type" VARCHAR(100) NOT NULL,
  "kich_thuoc" BIGINT,
  "thu_tu" INTEGER NOT NULL DEFAULT 0,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "tai_lieu_tin_tuc_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "tin_tuc_slug_key" ON "tin_tuc"("slug");
CREATE INDEX "tin_tuc_chuyen_muc_trang_thai_ngay_dang_idx"
  ON "tin_tuc"("chuyen_muc", "trang_thai", "ngay_dang" DESC);
CREATE INDEX "tin_tuc_trang_thai_ghim_ngay_dang_idx"
  ON "tin_tuc"("trang_thai", "ghim", "ngay_dang" DESC);
CREATE INDEX "tai_lieu_tin_tuc_tin_tuc_id_thu_tu_idx"
  ON "tai_lieu_tin_tuc"("tin_tuc_id", "thu_tu");
ALTER TABLE "tin_tuc" ADD CONSTRAINT "tin_tuc_ma_admin_fkey"
  FOREIGN KEY ("ma_admin") REFERENCES "admin"("ma_admin") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "tai_lieu_tin_tuc" ADD CONSTRAINT "tai_lieu_tin_tuc_tin_tuc_id_fkey"
  FOREIGN KEY ("tin_tuc_id") REFERENCES "tin_tuc"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Supabase may grant default table privileges. RLS prevents draft/future news
-- and attachments from leaking through direct REST access; no write policy.
ALTER TABLE "tin_tuc" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "tai_lieu_tin_tuc" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "published_news_select" ON "tin_tuc" FOR SELECT TO PUBLIC
  USING ("trang_thai" = 'xuat_ban' AND "ngay_dang" IS NOT NULL AND "ngay_dang" <= CURRENT_TIMESTAMP);
CREATE POLICY "published_news_attachment_select" ON "tai_lieu_tin_tuc" FOR SELECT TO PUBLIC
  USING (EXISTS (SELECT 1 FROM "tin_tuc" AS news
    WHERE news."id" = "tai_lieu_tin_tuc"."tin_tuc_id"
      AND news."trang_thai" = 'xuat_ban' AND news."ngay_dang" IS NOT NULL
      AND news."ngay_dang" <= CURRENT_TIMESTAMP));
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'app_readonly') THEN
    GRANT SELECT ON TABLE "tin_tuc", "tai_lieu_tin_tuc" TO "app_readonly";
  END IF;
END $$;
COMMIT;

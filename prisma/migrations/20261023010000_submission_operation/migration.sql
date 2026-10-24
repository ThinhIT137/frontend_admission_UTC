-- Chỉ chuẩn bị migration; triển khai trước backend và frontend mới.
CREATE TABLE "submission_operation" (
  "operation_id" TEXT NOT NULL PRIMARY KEY,
  "cccd" VARCHAR(12) NOT NULL,
  "status" TEXT NOT NULL,
  "dossier_id" TEXT NOT NULL,
  "payload_hash" TEXT NOT NULL,
  "journal" JSONB NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL
);
CREATE INDEX "ix_submission_operation_cccd" ON "submission_operation"("cccd");
CREATE UNIQUE INDEX "submission_operation_dossier_id_key" ON "submission_operation"("dossier_id");

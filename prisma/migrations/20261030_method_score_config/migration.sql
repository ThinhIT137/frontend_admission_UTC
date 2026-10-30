-- Review/apply explicitly before deploying clients that select these columns.
-- No inference from method code/name and no rewrite of existing methods/scores.
BEGIN;
ALTER TABLE phuong_thuc_xet_tuyen
  ADD COLUMN nhom_xet_tuyen TEXT,
  ADD COLUMN diem_toi_thieu DOUBLE PRECISION,
  ADD COLUMN diem_toi_da DOUBLE PRECISION;
ALTER TABLE phuong_thuc_xet_tuyen ADD CONSTRAINT method_score_config_valid CHECK (
  (nhom_xet_tuyen IS NULL AND diem_toi_thieu IS NULL AND diem_toi_da IS NULL)
  OR (nhom_xet_tuyen IS NOT NULL AND diem_toi_thieu IS NOT NULL AND diem_toi_da IS NOT NULL
      AND nhom_xet_tuyen IN ('THPT','HOC_BA','HSA','TSA','KET_HOP','TUYEN_THANG','KHAC')
      AND diem_toi_thieu >= 0 AND diem_toi_da > diem_toi_thieu
      AND diem_toi_da < 'Infinity'::float8)
);
COMMIT;

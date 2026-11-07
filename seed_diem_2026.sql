-- ====================================================================
-- SCRIPT NẠP ĐIỂM TRÚNG TUYỂN 2026 (CHẠY KHI CẦN TEST CÔNG BỐ ĐIỂM 2026)
-- Trường Đại học Giao thông Vận tải (UTC)
-- Tổng số bản ghi điểm 2026: 176
-- ====================================================================
BEGIN;

INSERT INTO diem_trung_tuyen (
  ma_diem_tt,
  ma_ls_dc,
  ma_phuong_thuc,
  diem,
  diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da,
  create_at
)
SELECT
  'DTT-GHA01-2026-PT1',
  ls.ma_ls_dc,
  'PT1',
  22.7,
  NULL,
  3,
  NOW()
FROM lich_su_diem_chuan ls
WHERE ls.ma_chuong_trinh = 'GHA01' AND ls.nam = 2026
ON CONFLICT (ma_ls_dc, ma_phuong_thuc) DO UPDATE SET 
  diem = EXCLUDED.diem,
  diem_uu_tien_toi_thieu = EXCLUDED.diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da = EXCLUDED.nguyen_vong_toi_da;
INSERT INTO diem_trung_tuyen (
  ma_diem_tt,
  ma_ls_dc,
  ma_phuong_thuc,
  diem,
  diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da,
  create_at
)
SELECT
  'DTT-GHA01-2026-PT2',
  ls.ma_ls_dc,
  'PT2',
  26.57,
  NULL,
  3,
  NOW()
FROM lich_su_diem_chuan ls
WHERE ls.ma_chuong_trinh = 'GHA01' AND ls.nam = 2026
ON CONFLICT (ma_ls_dc, ma_phuong_thuc) DO UPDATE SET 
  diem = EXCLUDED.diem,
  diem_uu_tien_toi_thieu = EXCLUDED.diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da = EXCLUDED.nguyen_vong_toi_da;
INSERT INTO diem_trung_tuyen (
  ma_diem_tt,
  ma_ls_dc,
  ma_phuong_thuc,
  diem,
  diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da,
  create_at
)
SELECT
  'DTT-GHA01-2026-PT3',
  ls.ma_ls_dc,
  'PT3',
  80.24,
  NULL,
  3,
  NOW()
FROM lich_su_diem_chuan ls
WHERE ls.ma_chuong_trinh = 'GHA01' AND ls.nam = 2026
ON CONFLICT (ma_ls_dc, ma_phuong_thuc) DO UPDATE SET 
  diem = EXCLUDED.diem,
  diem_uu_tien_toi_thieu = EXCLUDED.diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da = EXCLUDED.nguyen_vong_toi_da;
INSERT INTO diem_trung_tuyen (
  ma_diem_tt,
  ma_ls_dc,
  ma_phuong_thuc,
  diem,
  diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da,
  create_at
)
SELECT
  'DTT-GHA02-2026-PT1',
  ls.ma_ls_dc,
  'PT1',
  24.17,
  NULL,
  2,
  NOW()
FROM lich_su_diem_chuan ls
WHERE ls.ma_chuong_trinh = 'GHA02' AND ls.nam = 2026
ON CONFLICT (ma_ls_dc, ma_phuong_thuc) DO UPDATE SET 
  diem = EXCLUDED.diem,
  diem_uu_tien_toi_thieu = EXCLUDED.diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da = EXCLUDED.nguyen_vong_toi_da;
INSERT INTO diem_trung_tuyen (
  ma_diem_tt,
  ma_ls_dc,
  ma_phuong_thuc,
  diem,
  diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da,
  create_at
)
SELECT
  'DTT-GHA02-2026-PT2',
  ls.ma_ls_dc,
  'PT2',
  27.33,
  NULL,
  2,
  NOW()
FROM lich_su_diem_chuan ls
WHERE ls.ma_chuong_trinh = 'GHA02' AND ls.nam = 2026
ON CONFLICT (ma_ls_dc, ma_phuong_thuc) DO UPDATE SET 
  diem = EXCLUDED.diem,
  diem_uu_tien_toi_thieu = EXCLUDED.diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da = EXCLUDED.nguyen_vong_toi_da;
INSERT INTO diem_trung_tuyen (
  ma_diem_tt,
  ma_ls_dc,
  ma_phuong_thuc,
  diem,
  diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da,
  create_at
)
SELECT
  'DTT-GHA02-2026-PT4',
  ls.ma_ls_dc,
  'PT4',
  55.8,
  NULL,
  2,
  NOW()
FROM lich_su_diem_chuan ls
WHERE ls.ma_chuong_trinh = 'GHA02' AND ls.nam = 2026
ON CONFLICT (ma_ls_dc, ma_phuong_thuc) DO UPDATE SET 
  diem = EXCLUDED.diem,
  diem_uu_tien_toi_thieu = EXCLUDED.diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da = EXCLUDED.nguyen_vong_toi_da;
INSERT INTO diem_trung_tuyen (
  ma_diem_tt,
  ma_ls_dc,
  ma_phuong_thuc,
  diem,
  diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da,
  create_at
)
SELECT
  'DTT-GHA03-2026-PT1',
  ls.ma_ls_dc,
  'PT1',
  24.09,
  NULL,
  1,
  NOW()
FROM lich_su_diem_chuan ls
WHERE ls.ma_chuong_trinh = 'GHA03' AND ls.nam = 2026
ON CONFLICT (ma_ls_dc, ma_phuong_thuc) DO UPDATE SET 
  diem = EXCLUDED.diem,
  diem_uu_tien_toi_thieu = EXCLUDED.diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da = EXCLUDED.nguyen_vong_toi_da;
INSERT INTO diem_trung_tuyen (
  ma_diem_tt,
  ma_ls_dc,
  ma_phuong_thuc,
  diem,
  diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da,
  create_at
)
SELECT
  'DTT-GHA03-2026-PT2',
  ls.ma_ls_dc,
  'PT2',
  27.29,
  NULL,
  1,
  NOW()
FROM lich_su_diem_chuan ls
WHERE ls.ma_chuong_trinh = 'GHA03' AND ls.nam = 2026
ON CONFLICT (ma_ls_dc, ma_phuong_thuc) DO UPDATE SET 
  diem = EXCLUDED.diem,
  diem_uu_tien_toi_thieu = EXCLUDED.diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da = EXCLUDED.nguyen_vong_toi_da;
INSERT INTO diem_trung_tuyen (
  ma_diem_tt,
  ma_ls_dc,
  ma_phuong_thuc,
  diem,
  diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da,
  create_at
)
SELECT
  'DTT-GHA03-2026-PT3',
  ls.ma_ls_dc,
  'PT3',
  88.1,
  NULL,
  1,
  NOW()
FROM lich_su_diem_chuan ls
WHERE ls.ma_chuong_trinh = 'GHA03' AND ls.nam = 2026
ON CONFLICT (ma_ls_dc, ma_phuong_thuc) DO UPDATE SET 
  diem = EXCLUDED.diem,
  diem_uu_tien_toi_thieu = EXCLUDED.diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da = EXCLUDED.nguyen_vong_toi_da;
INSERT INTO diem_trung_tuyen (
  ma_diem_tt,
  ma_ls_dc,
  ma_phuong_thuc,
  diem,
  diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da,
  create_at
)
SELECT
  'DTT-GHA04-2026-PT1',
  ls.ma_ls_dc,
  'PT1',
  24.01,
  NULL,
  3,
  NOW()
FROM lich_su_diem_chuan ls
WHERE ls.ma_chuong_trinh = 'GHA04' AND ls.nam = 2026
ON CONFLICT (ma_ls_dc, ma_phuong_thuc) DO UPDATE SET 
  diem = EXCLUDED.diem,
  diem_uu_tien_toi_thieu = EXCLUDED.diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da = EXCLUDED.nguyen_vong_toi_da;
INSERT INTO diem_trung_tuyen (
  ma_diem_tt,
  ma_ls_dc,
  ma_phuong_thuc,
  diem,
  diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da,
  create_at
)
SELECT
  'DTT-GHA04-2026-PT2',
  ls.ma_ls_dc,
  'PT2',
  27.25,
  NULL,
  3,
  NOW()
FROM lich_su_diem_chuan ls
WHERE ls.ma_chuong_trinh = 'GHA04' AND ls.nam = 2026
ON CONFLICT (ma_ls_dc, ma_phuong_thuc) DO UPDATE SET 
  diem = EXCLUDED.diem,
  diem_uu_tien_toi_thieu = EXCLUDED.diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da = EXCLUDED.nguyen_vong_toi_da;
INSERT INTO diem_trung_tuyen (
  ma_diem_tt,
  ma_ls_dc,
  ma_phuong_thuc,
  diem,
  diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da,
  create_at
)
SELECT
  'DTT-GHA04-2026-PT3',
  ls.ma_ls_dc,
  'PT3',
  87.58,
  NULL,
  3,
  NOW()
FROM lich_su_diem_chuan ls
WHERE ls.ma_chuong_trinh = 'GHA04' AND ls.nam = 2026
ON CONFLICT (ma_ls_dc, ma_phuong_thuc) DO UPDATE SET 
  diem = EXCLUDED.diem,
  diem_uu_tien_toi_thieu = EXCLUDED.diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da = EXCLUDED.nguyen_vong_toi_da;
INSERT INTO diem_trung_tuyen (
  ma_diem_tt,
  ma_ls_dc,
  ma_phuong_thuc,
  diem,
  diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da,
  create_at
)
SELECT
  'DTT-GHA04QT-2026-PT1',
  ls.ma_ls_dc,
  'PT1',
  20.85,
  NULL,
  12,
  NOW()
FROM lich_su_diem_chuan ls
WHERE ls.ma_chuong_trinh = 'GHA04QT' AND ls.nam = 2026
ON CONFLICT (ma_ls_dc, ma_phuong_thuc) DO UPDATE SET 
  diem = EXCLUDED.diem,
  diem_uu_tien_toi_thieu = EXCLUDED.diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da = EXCLUDED.nguyen_vong_toi_da;
INSERT INTO diem_trung_tuyen (
  ma_diem_tt,
  ma_ls_dc,
  ma_phuong_thuc,
  diem,
  diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da,
  create_at
)
SELECT
  'DTT-GHA04QT-2026-PT2',
  ls.ma_ls_dc,
  'PT2',
  25.35,
  NULL,
  12,
  NOW()
FROM lich_su_diem_chuan ls
WHERE ls.ma_chuong_trinh = 'GHA04QT' AND ls.nam = 2026
ON CONFLICT (ma_ls_dc, ma_phuong_thuc) DO UPDATE SET 
  diem = EXCLUDED.diem,
  diem_uu_tien_toi_thieu = EXCLUDED.diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da = EXCLUDED.nguyen_vong_toi_da;
INSERT INTO diem_trung_tuyen (
  ma_diem_tt,
  ma_ls_dc,
  ma_phuong_thuc,
  diem,
  diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da,
  create_at
)
SELECT
  'DTT-GHA04QT-2026-PT3',
  ls.ma_ls_dc,
  'PT3',
  72.12,
  NULL,
  12,
  NOW()
FROM lich_su_diem_chuan ls
WHERE ls.ma_chuong_trinh = 'GHA04QT' AND ls.nam = 2026
ON CONFLICT (ma_ls_dc, ma_phuong_thuc) DO UPDATE SET 
  diem = EXCLUDED.diem,
  diem_uu_tien_toi_thieu = EXCLUDED.diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da = EXCLUDED.nguyen_vong_toi_da;
INSERT INTO diem_trung_tuyen (
  ma_diem_tt,
  ma_ls_dc,
  ma_phuong_thuc,
  diem,
  diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da,
  create_at
)
SELECT
  'DTT-GHA05-2026-PT1',
  ls.ma_ls_dc,
  'PT1',
  24.34,
  NULL,
  8,
  NOW()
FROM lich_su_diem_chuan ls
WHERE ls.ma_chuong_trinh = 'GHA05' AND ls.nam = 2026
ON CONFLICT (ma_ls_dc, ma_phuong_thuc) DO UPDATE SET 
  diem = EXCLUDED.diem,
  diem_uu_tien_toi_thieu = EXCLUDED.diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da = EXCLUDED.nguyen_vong_toi_da;
INSERT INTO diem_trung_tuyen (
  ma_diem_tt,
  ma_ls_dc,
  ma_phuong_thuc,
  diem,
  diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da,
  create_at
)
SELECT
  'DTT-GHA05-2026-PT2',
  ls.ma_ls_dc,
  'PT2',
  27.42,
  NULL,
  8,
  NOW()
FROM lich_su_diem_chuan ls
WHERE ls.ma_chuong_trinh = 'GHA05' AND ls.nam = 2026
ON CONFLICT (ma_ls_dc, ma_phuong_thuc) DO UPDATE SET 
  diem = EXCLUDED.diem,
  diem_uu_tien_toi_thieu = EXCLUDED.diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da = EXCLUDED.nguyen_vong_toi_da;
INSERT INTO diem_trung_tuyen (
  ma_diem_tt,
  ma_ls_dc,
  ma_phuong_thuc,
  diem,
  diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da,
  create_at
)
SELECT
  'DTT-GHA05-2026-PT3',
  ls.ma_ls_dc,
  'PT3',
  89.74,
  NULL,
  8,
  NOW()
FROM lich_su_diem_chuan ls
WHERE ls.ma_chuong_trinh = 'GHA05' AND ls.nam = 2026
ON CONFLICT (ma_ls_dc, ma_phuong_thuc) DO UPDATE SET 
  diem = EXCLUDED.diem,
  diem_uu_tien_toi_thieu = EXCLUDED.diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da = EXCLUDED.nguyen_vong_toi_da;
INSERT INTO diem_trung_tuyen (
  ma_diem_tt,
  ma_ls_dc,
  ma_phuong_thuc,
  diem,
  diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da,
  create_at
)
SELECT
  'DTT-GHA06-2026-PT1',
  ls.ma_ls_dc,
  'PT1',
  24.65,
  NULL,
  4,
  NOW()
FROM lich_su_diem_chuan ls
WHERE ls.ma_chuong_trinh = 'GHA06' AND ls.nam = 2026
ON CONFLICT (ma_ls_dc, ma_phuong_thuc) DO UPDATE SET 
  diem = EXCLUDED.diem,
  diem_uu_tien_toi_thieu = EXCLUDED.diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da = EXCLUDED.nguyen_vong_toi_da;
INSERT INTO diem_trung_tuyen (
  ma_diem_tt,
  ma_ls_dc,
  ma_phuong_thuc,
  diem,
  diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da,
  create_at
)
SELECT
  'DTT-GHA06-2026-PT2',
  ls.ma_ls_dc,
  'PT2',
  27.58,
  NULL,
  4,
  NOW()
FROM lich_su_diem_chuan ls
WHERE ls.ma_chuong_trinh = 'GHA06' AND ls.nam = 2026
ON CONFLICT (ma_ls_dc, ma_phuong_thuc) DO UPDATE SET 
  diem = EXCLUDED.diem,
  diem_uu_tien_toi_thieu = EXCLUDED.diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da = EXCLUDED.nguyen_vong_toi_da;
INSERT INTO diem_trung_tuyen (
  ma_diem_tt,
  ma_ls_dc,
  ma_phuong_thuc,
  diem,
  diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da,
  create_at
)
SELECT
  'DTT-GHA06-2026-PT3',
  ls.ma_ls_dc,
  'PT3',
  91.76,
  NULL,
  4,
  NOW()
FROM lich_su_diem_chuan ls
WHERE ls.ma_chuong_trinh = 'GHA06' AND ls.nam = 2026
ON CONFLICT (ma_ls_dc, ma_phuong_thuc) DO UPDATE SET 
  diem = EXCLUDED.diem,
  diem_uu_tien_toi_thieu = EXCLUDED.diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da = EXCLUDED.nguyen_vong_toi_da;
INSERT INTO diem_trung_tuyen (
  ma_diem_tt,
  ma_ls_dc,
  ma_phuong_thuc,
  diem,
  diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da,
  create_at
)
SELECT
  'DTT-GHA06QT-2026-PT1',
  ls.ma_ls_dc,
  'PT1',
  21.5,
  NULL,
  1,
  NOW()
FROM lich_su_diem_chuan ls
WHERE ls.ma_chuong_trinh = 'GHA06QT' AND ls.nam = 2026
ON CONFLICT (ma_ls_dc, ma_phuong_thuc) DO UPDATE SET 
  diem = EXCLUDED.diem,
  diem_uu_tien_toi_thieu = EXCLUDED.diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da = EXCLUDED.nguyen_vong_toi_da;
INSERT INTO diem_trung_tuyen (
  ma_diem_tt,
  ma_ls_dc,
  ma_phuong_thuc,
  diem,
  diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da,
  create_at
)
SELECT
  'DTT-GHA06QT-2026-PT2',
  ls.ma_ls_dc,
  'PT2',
  25.87,
  NULL,
  1,
  NOW()
FROM lich_su_diem_chuan ls
WHERE ls.ma_chuong_trinh = 'GHA06QT' AND ls.nam = 2026
ON CONFLICT (ma_ls_dc, ma_phuong_thuc) DO UPDATE SET 
  diem = EXCLUDED.diem,
  diem_uu_tien_toi_thieu = EXCLUDED.diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da = EXCLUDED.nguyen_vong_toi_da;
INSERT INTO diem_trung_tuyen (
  ma_diem_tt,
  ma_ls_dc,
  ma_phuong_thuc,
  diem,
  diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da,
  create_at
)
SELECT
  'DTT-GHA06QT-2026-PT3',
  ls.ma_ls_dc,
  'PT3',
  74.25,
  NULL,
  1,
  NOW()
FROM lich_su_diem_chuan ls
WHERE ls.ma_chuong_trinh = 'GHA06QT' AND ls.nam = 2026
ON CONFLICT (ma_ls_dc, ma_phuong_thuc) DO UPDATE SET 
  diem = EXCLUDED.diem,
  diem_uu_tien_toi_thieu = EXCLUDED.diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da = EXCLUDED.nguyen_vong_toi_da;
INSERT INTO diem_trung_tuyen (
  ma_diem_tt,
  ma_ls_dc,
  ma_phuong_thuc,
  diem,
  diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da,
  create_at
)
SELECT
  'DTT-GHA07-2026-PT1',
  ls.ma_ls_dc,
  'PT1',
  22.84,
  NULL,
  3,
  NOW()
FROM lich_su_diem_chuan ls
WHERE ls.ma_chuong_trinh = 'GHA07' AND ls.nam = 2026
ON CONFLICT (ma_ls_dc, ma_phuong_thuc) DO UPDATE SET 
  diem = EXCLUDED.diem,
  diem_uu_tien_toi_thieu = EXCLUDED.diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da = EXCLUDED.nguyen_vong_toi_da;
INSERT INTO diem_trung_tuyen (
  ma_diem_tt,
  ma_ls_dc,
  ma_phuong_thuc,
  diem,
  diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da,
  create_at
)
SELECT
  'DTT-GHA07-2026-PT2',
  ls.ma_ls_dc,
  'PT2',
  26.64,
  NULL,
  3,
  NOW()
FROM lich_su_diem_chuan ls
WHERE ls.ma_chuong_trinh = 'GHA07' AND ls.nam = 2026
ON CONFLICT (ma_ls_dc, ma_phuong_thuc) DO UPDATE SET 
  diem = EXCLUDED.diem,
  diem_uu_tien_toi_thieu = EXCLUDED.diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da = EXCLUDED.nguyen_vong_toi_da;
INSERT INTO diem_trung_tuyen (
  ma_diem_tt,
  ma_ls_dc,
  ma_phuong_thuc,
  diem,
  diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da,
  create_at
)
SELECT
  'DTT-GHA07-2026-PT3',
  ls.ma_ls_dc,
  'PT3',
  80.99,
  NULL,
  3,
  NOW()
FROM lich_su_diem_chuan ls
WHERE ls.ma_chuong_trinh = 'GHA07' AND ls.nam = 2026
ON CONFLICT (ma_ls_dc, ma_phuong_thuc) DO UPDATE SET 
  diem = EXCLUDED.diem,
  diem_uu_tien_toi_thieu = EXCLUDED.diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da = EXCLUDED.nguyen_vong_toi_da;
INSERT INTO diem_trung_tuyen (
  ma_diem_tt,
  ma_ls_dc,
  ma_phuong_thuc,
  diem,
  diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da,
  create_at
)
SELECT
  'DTT-GHA08-2026-PT1',
  ls.ma_ls_dc,
  'PT1',
  24.83,
  NULL,
  3,
  NOW()
FROM lich_su_diem_chuan ls
WHERE ls.ma_chuong_trinh = 'GHA08' AND ls.nam = 2026
ON CONFLICT (ma_ls_dc, ma_phuong_thuc) DO UPDATE SET 
  diem = EXCLUDED.diem,
  diem_uu_tien_toi_thieu = EXCLUDED.diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da = EXCLUDED.nguyen_vong_toi_da;
INSERT INTO diem_trung_tuyen (
  ma_diem_tt,
  ma_ls_dc,
  ma_phuong_thuc,
  diem,
  diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da,
  create_at
)
SELECT
  'DTT-GHA08-2026-PT2',
  ls.ma_ls_dc,
  'PT2',
  27.7,
  NULL,
  3,
  NOW()
FROM lich_su_diem_chuan ls
WHERE ls.ma_chuong_trinh = 'GHA08' AND ls.nam = 2026
ON CONFLICT (ma_ls_dc, ma_phuong_thuc) DO UPDATE SET 
  diem = EXCLUDED.diem,
  diem_uu_tien_toi_thieu = EXCLUDED.diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da = EXCLUDED.nguyen_vong_toi_da;
INSERT INTO diem_trung_tuyen (
  ma_diem_tt,
  ma_ls_dc,
  ma_phuong_thuc,
  diem,
  diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da,
  create_at
)
SELECT
  'DTT-GHA08-2026-PT3',
  ls.ma_ls_dc,
  'PT3',
  92.94,
  NULL,
  3,
  NOW()
FROM lich_su_diem_chuan ls
WHERE ls.ma_chuong_trinh = 'GHA08' AND ls.nam = 2026
ON CONFLICT (ma_ls_dc, ma_phuong_thuc) DO UPDATE SET 
  diem = EXCLUDED.diem,
  diem_uu_tien_toi_thieu = EXCLUDED.diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da = EXCLUDED.nguyen_vong_toi_da;
INSERT INTO diem_trung_tuyen (
  ma_diem_tt,
  ma_ls_dc,
  ma_phuong_thuc,
  diem,
  diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da,
  create_at
)
SELECT
  'DTT-GHA08DS-2026-PT1',
  ls.ma_ls_dc,
  'PT1',
  23.7,
  NULL,
  4,
  NOW()
FROM lich_su_diem_chuan ls
WHERE ls.ma_chuong_trinh = 'GHA08DS' AND ls.nam = 2026
ON CONFLICT (ma_ls_dc, ma_phuong_thuc) DO UPDATE SET 
  diem = EXCLUDED.diem,
  diem_uu_tien_toi_thieu = EXCLUDED.diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da = EXCLUDED.nguyen_vong_toi_da;
INSERT INTO diem_trung_tuyen (
  ma_diem_tt,
  ma_ls_dc,
  ma_phuong_thuc,
  diem,
  diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da,
  create_at
)
SELECT
  'DTT-GHA08DS-2026-PT2',
  ls.ma_ls_dc,
  'PT2',
  27.09,
  NULL,
  4,
  NOW()
FROM lich_su_diem_chuan ls
WHERE ls.ma_chuong_trinh = 'GHA08DS' AND ls.nam = 2026
ON CONFLICT (ma_ls_dc, ma_phuong_thuc) DO UPDATE SET 
  diem = EXCLUDED.diem,
  diem_uu_tien_toi_thieu = EXCLUDED.diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da = EXCLUDED.nguyen_vong_toi_da;
INSERT INTO diem_trung_tuyen (
  ma_diem_tt,
  ma_ls_dc,
  ma_phuong_thuc,
  diem,
  diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da,
  create_at
)
SELECT
  'DTT-GHA08DS-2026-PT3',
  ls.ma_ls_dc,
  'PT3',
  85.63,
  NULL,
  4,
  NOW()
FROM lich_su_diem_chuan ls
WHERE ls.ma_chuong_trinh = 'GHA08DS' AND ls.nam = 2026
ON CONFLICT (ma_ls_dc, ma_phuong_thuc) DO UPDATE SET 
  diem = EXCLUDED.diem,
  diem_uu_tien_toi_thieu = EXCLUDED.diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da = EXCLUDED.nguyen_vong_toi_da;
INSERT INTO diem_trung_tuyen (
  ma_diem_tt,
  ma_ls_dc,
  ma_phuong_thuc,
  diem,
  diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da,
  create_at
)
SELECT
  'DTT-GHA09-2026-PT1',
  ls.ma_ls_dc,
  'PT1',
  24.74,
  NULL,
  5,
  NOW()
FROM lich_su_diem_chuan ls
WHERE ls.ma_chuong_trinh = 'GHA09' AND ls.nam = 2026
ON CONFLICT (ma_ls_dc, ma_phuong_thuc) DO UPDATE SET 
  diem = EXCLUDED.diem,
  diem_uu_tien_toi_thieu = EXCLUDED.diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da = EXCLUDED.nguyen_vong_toi_da;
INSERT INTO diem_trung_tuyen (
  ma_diem_tt,
  ma_ls_dc,
  ma_phuong_thuc,
  diem,
  diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da,
  create_at
)
SELECT
  'DTT-GHA09-2026-PT2',
  ls.ma_ls_dc,
  'PT2',
  27.63,
  NULL,
  5,
  NOW()
FROM lich_su_diem_chuan ls
WHERE ls.ma_chuong_trinh = 'GHA09' AND ls.nam = 2026
ON CONFLICT (ma_ls_dc, ma_phuong_thuc) DO UPDATE SET 
  diem = EXCLUDED.diem,
  diem_uu_tien_toi_thieu = EXCLUDED.diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da = EXCLUDED.nguyen_vong_toi_da;
INSERT INTO diem_trung_tuyen (
  ma_diem_tt,
  ma_ls_dc,
  ma_phuong_thuc,
  diem,
  diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da,
  create_at
)
SELECT
  'DTT-GHA09-2026-PT3',
  ls.ma_ls_dc,
  'PT3',
  92.35,
  NULL,
  5,
  NOW()
FROM lich_su_diem_chuan ls
WHERE ls.ma_chuong_trinh = 'GHA09' AND ls.nam = 2026
ON CONFLICT (ma_ls_dc, ma_phuong_thuc) DO UPDATE SET 
  diem = EXCLUDED.diem,
  diem_uu_tien_toi_thieu = EXCLUDED.diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da = EXCLUDED.nguyen_vong_toi_da;
INSERT INTO diem_trung_tuyen (
  ma_diem_tt,
  ma_ls_dc,
  ma_phuong_thuc,
  diem,
  diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da,
  create_at
)
SELECT
  'DTT-GHA10-2026-PT1',
  ls.ma_ls_dc,
  'PT1',
  26.44,
  NULL,
  1,
  NOW()
FROM lich_su_diem_chuan ls
WHERE ls.ma_chuong_trinh = 'GHA10' AND ls.nam = 2026
ON CONFLICT (ma_ls_dc, ma_phuong_thuc) DO UPDATE SET 
  diem = EXCLUDED.diem,
  diem_uu_tien_toi_thieu = EXCLUDED.diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da = EXCLUDED.nguyen_vong_toi_da;
INSERT INTO diem_trung_tuyen (
  ma_diem_tt,
  ma_ls_dc,
  ma_phuong_thuc,
  diem,
  diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da,
  create_at
)
SELECT
  'DTT-GHA10-2026-PT3',
  ls.ma_ls_dc,
  'PT3',
  103.48,
  NULL,
  1,
  NOW()
FROM lich_su_diem_chuan ls
WHERE ls.ma_chuong_trinh = 'GHA10' AND ls.nam = 2026
ON CONFLICT (ma_ls_dc, ma_phuong_thuc) DO UPDATE SET 
  diem = EXCLUDED.diem,
  diem_uu_tien_toi_thieu = EXCLUDED.diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da = EXCLUDED.nguyen_vong_toi_da;
INSERT INTO diem_trung_tuyen (
  ma_diem_tt,
  ma_ls_dc,
  ma_phuong_thuc,
  diem,
  diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da,
  create_at
)
SELECT
  'DTT-GHA10QT-2026-PT1',
  ls.ma_ls_dc,
  'PT1',
  25.62,
  NULL,
  1,
  NOW()
FROM lich_su_diem_chuan ls
WHERE ls.ma_chuong_trinh = 'GHA10QT' AND ls.nam = 2026
ON CONFLICT (ma_ls_dc, ma_phuong_thuc) DO UPDATE SET 
  diem = EXCLUDED.diem,
  diem_uu_tien_toi_thieu = EXCLUDED.diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da = EXCLUDED.nguyen_vong_toi_da;
INSERT INTO diem_trung_tuyen (
  ma_diem_tt,
  ma_ls_dc,
  ma_phuong_thuc,
  diem,
  diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da,
  create_at
)
SELECT
  'DTT-GHA10QT-2026-PT2',
  ls.ma_ls_dc,
  'PT2',
  28.33,
  NULL,
  1,
  NOW()
FROM lich_su_diem_chuan ls
WHERE ls.ma_chuong_trinh = 'GHA10QT' AND ls.nam = 2026
ON CONFLICT (ma_ls_dc, ma_phuong_thuc) DO UPDATE SET 
  diem = EXCLUDED.diem,
  diem_uu_tien_toi_thieu = EXCLUDED.diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da = EXCLUDED.nguyen_vong_toi_da;
INSERT INTO diem_trung_tuyen (
  ma_diem_tt,
  ma_ls_dc,
  ma_phuong_thuc,
  diem,
  diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da,
  create_at
)
SELECT
  'DTT-GHA10QT-2026-PT3',
  ls.ma_ls_dc,
  'PT3',
  98.11,
  NULL,
  1,
  NOW()
FROM lich_su_diem_chuan ls
WHERE ls.ma_chuong_trinh = 'GHA10QT' AND ls.nam = 2026
ON CONFLICT (ma_ls_dc, ma_phuong_thuc) DO UPDATE SET 
  diem = EXCLUDED.diem,
  diem_uu_tien_toi_thieu = EXCLUDED.diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da = EXCLUDED.nguyen_vong_toi_da;
INSERT INTO diem_trung_tuyen (
  ma_diem_tt,
  ma_ls_dc,
  ma_phuong_thuc,
  diem,
  diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da,
  create_at
)
SELECT
  'DTT-GHA11-2026-PT1',
  ls.ma_ls_dc,
  'PT1',
  24.2,
  NULL,
  4,
  NOW()
FROM lich_su_diem_chuan ls
WHERE ls.ma_chuong_trinh = 'GHA11' AND ls.nam = 2026
ON CONFLICT (ma_ls_dc, ma_phuong_thuc) DO UPDATE SET 
  diem = EXCLUDED.diem,
  diem_uu_tien_toi_thieu = EXCLUDED.diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da = EXCLUDED.nguyen_vong_toi_da;
INSERT INTO diem_trung_tuyen (
  ma_diem_tt,
  ma_ls_dc,
  ma_phuong_thuc,
  diem,
  diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da,
  create_at
)
SELECT
  'DTT-GHA11-2026-PT2',
  ls.ma_ls_dc,
  'PT2',
  27.35,
  NULL,
  4,
  NOW()
FROM lich_su_diem_chuan ls
WHERE ls.ma_chuong_trinh = 'GHA11' AND ls.nam = 2026
ON CONFLICT (ma_ls_dc, ma_phuong_thuc) DO UPDATE SET 
  diem = EXCLUDED.diem,
  diem_uu_tien_toi_thieu = EXCLUDED.diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da = EXCLUDED.nguyen_vong_toi_da;
INSERT INTO diem_trung_tuyen (
  ma_diem_tt,
  ma_ls_dc,
  ma_phuong_thuc,
  diem,
  diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da,
  create_at
)
SELECT
  'DTT-GHA11-2026-PT3',
  ls.ma_ls_dc,
  'PT3',
  88.82,
  NULL,
  4,
  NOW()
FROM lich_su_diem_chuan ls
WHERE ls.ma_chuong_trinh = 'GHA11' AND ls.nam = 2026
ON CONFLICT (ma_ls_dc, ma_phuong_thuc) DO UPDATE SET 
  diem = EXCLUDED.diem,
  diem_uu_tien_toi_thieu = EXCLUDED.diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da = EXCLUDED.nguyen_vong_toi_da;
INSERT INTO diem_trung_tuyen (
  ma_diem_tt,
  ma_ls_dc,
  ma_phuong_thuc,
  diem,
  diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da,
  create_at
)
SELECT
  'DTT-GHA11QT-2026-PT1',
  ls.ma_ls_dc,
  'PT1',
  21.98,
  NULL,
  2,
  NOW()
FROM lich_su_diem_chuan ls
WHERE ls.ma_chuong_trinh = 'GHA11QT' AND ls.nam = 2026
ON CONFLICT (ma_ls_dc, ma_phuong_thuc) DO UPDATE SET 
  diem = EXCLUDED.diem,
  diem_uu_tien_toi_thieu = EXCLUDED.diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da = EXCLUDED.nguyen_vong_toi_da;
INSERT INTO diem_trung_tuyen (
  ma_diem_tt,
  ma_ls_dc,
  ma_phuong_thuc,
  diem,
  diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da,
  create_at
)
SELECT
  'DTT-GHA11QT-2026-PT2',
  ls.ma_ls_dc,
  'PT2',
  26.19,
  NULL,
  2,
  NOW()
FROM lich_su_diem_chuan ls
WHERE ls.ma_chuong_trinh = 'GHA11QT' AND ls.nam = 2026
ON CONFLICT (ma_ls_dc, ma_phuong_thuc) DO UPDATE SET 
  diem = EXCLUDED.diem,
  diem_uu_tien_toi_thieu = EXCLUDED.diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da = EXCLUDED.nguyen_vong_toi_da;
INSERT INTO diem_trung_tuyen (
  ma_diem_tt,
  ma_ls_dc,
  ma_phuong_thuc,
  diem,
  diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da,
  create_at
)
SELECT
  'DTT-GHA11QT-2026-PT3',
  ls.ma_ls_dc,
  'PT3',
  76.35,
  NULL,
  2,
  NOW()
FROM lich_su_diem_chuan ls
WHERE ls.ma_chuong_trinh = 'GHA11QT' AND ls.nam = 2026
ON CONFLICT (ma_ls_dc, ma_phuong_thuc) DO UPDATE SET 
  diem = EXCLUDED.diem,
  diem_uu_tien_toi_thieu = EXCLUDED.diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da = EXCLUDED.nguyen_vong_toi_da;
INSERT INTO diem_trung_tuyen (
  ma_diem_tt,
  ma_ls_dc,
  ma_phuong_thuc,
  diem,
  diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da,
  create_at
)
SELECT
  'DTT-GHA11QT-2026-PT4',
  ls.ma_ls_dc,
  'PT4',
  50.39,
  NULL,
  2,
  NOW()
FROM lich_su_diem_chuan ls
WHERE ls.ma_chuong_trinh = 'GHA11QT' AND ls.nam = 2026
ON CONFLICT (ma_ls_dc, ma_phuong_thuc) DO UPDATE SET 
  diem = EXCLUDED.diem,
  diem_uu_tien_toi_thieu = EXCLUDED.diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da = EXCLUDED.nguyen_vong_toi_da;
INSERT INTO diem_trung_tuyen (
  ma_diem_tt,
  ma_ls_dc,
  ma_phuong_thuc,
  diem,
  diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da,
  create_at
)
SELECT
  'DTT-GHA12-2026-PT1',
  ls.ma_ls_dc,
  'PT1',
  23.66,
  NULL,
  7,
  NOW()
FROM lich_su_diem_chuan ls
WHERE ls.ma_chuong_trinh = 'GHA12' AND ls.nam = 2026
ON CONFLICT (ma_ls_dc, ma_phuong_thuc) DO UPDATE SET 
  diem = EXCLUDED.diem,
  diem_uu_tien_toi_thieu = EXCLUDED.diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da = EXCLUDED.nguyen_vong_toi_da;
INSERT INTO diem_trung_tuyen (
  ma_diem_tt,
  ma_ls_dc,
  ma_phuong_thuc,
  diem,
  diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da,
  create_at
)
SELECT
  'DTT-GHA12-2026-PT2',
  ls.ma_ls_dc,
  'PT2',
  27.07,
  NULL,
  7,
  NOW()
FROM lich_su_diem_chuan ls
WHERE ls.ma_chuong_trinh = 'GHA12' AND ls.nam = 2026
ON CONFLICT (ma_ls_dc, ma_phuong_thuc) DO UPDATE SET 
  diem = EXCLUDED.diem,
  diem_uu_tien_toi_thieu = EXCLUDED.diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da = EXCLUDED.nguyen_vong_toi_da;
INSERT INTO diem_trung_tuyen (
  ma_diem_tt,
  ma_ls_dc,
  ma_phuong_thuc,
  diem,
  diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da,
  create_at
)
SELECT
  'DTT-GHA12-2026-PT3',
  ls.ma_ls_dc,
  'PT3',
  85.41,
  NULL,
  7,
  NOW()
FROM lich_su_diem_chuan ls
WHERE ls.ma_chuong_trinh = 'GHA12' AND ls.nam = 2026
ON CONFLICT (ma_ls_dc, ma_phuong_thuc) DO UPDATE SET 
  diem = EXCLUDED.diem,
  diem_uu_tien_toi_thieu = EXCLUDED.diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da = EXCLUDED.nguyen_vong_toi_da;
INSERT INTO diem_trung_tuyen (
  ma_diem_tt,
  ma_ls_dc,
  ma_phuong_thuc,
  diem,
  diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da,
  create_at
)
SELECT
  'DTT-GHA12QT-2026-PT1',
  ls.ma_ls_dc,
  'PT1',
  20.43,
  NULL,
  3,
  NOW()
FROM lich_su_diem_chuan ls
WHERE ls.ma_chuong_trinh = 'GHA12QT' AND ls.nam = 2026
ON CONFLICT (ma_ls_dc, ma_phuong_thuc) DO UPDATE SET 
  diem = EXCLUDED.diem,
  diem_uu_tien_toi_thieu = EXCLUDED.diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da = EXCLUDED.nguyen_vong_toi_da;
INSERT INTO diem_trung_tuyen (
  ma_diem_tt,
  ma_ls_dc,
  ma_phuong_thuc,
  diem,
  diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da,
  create_at
)
SELECT
  'DTT-GHA12QT-2026-PT2',
  ls.ma_ls_dc,
  'PT2',
  25.02,
  NULL,
  3,
  NOW()
FROM lich_su_diem_chuan ls
WHERE ls.ma_chuong_trinh = 'GHA12QT' AND ls.nam = 2026
ON CONFLICT (ma_ls_dc, ma_phuong_thuc) DO UPDATE SET 
  diem = EXCLUDED.diem,
  diem_uu_tien_toi_thieu = EXCLUDED.diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da = EXCLUDED.nguyen_vong_toi_da;
INSERT INTO diem_trung_tuyen (
  ma_diem_tt,
  ma_ls_dc,
  ma_phuong_thuc,
  diem,
  diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da,
  create_at
)
SELECT
  'DTT-GHA12QT-2026-PT3',
  ls.ma_ls_dc,
  'PT3',
  70.74,
  NULL,
  3,
  NOW()
FROM lich_su_diem_chuan ls
WHERE ls.ma_chuong_trinh = 'GHA12QT' AND ls.nam = 2026
ON CONFLICT (ma_ls_dc, ma_phuong_thuc) DO UPDATE SET 
  diem = EXCLUDED.diem,
  diem_uu_tien_toi_thieu = EXCLUDED.diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da = EXCLUDED.nguyen_vong_toi_da;
INSERT INTO diem_trung_tuyen (
  ma_diem_tt,
  ma_ls_dc,
  ma_phuong_thuc,
  diem,
  diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da,
  create_at
)
SELECT
  'DTT-GHA12QT-2026-PT4',
  ls.ma_ls_dc,
  'PT4',
  47.25,
  NULL,
  3,
  NOW()
FROM lich_su_diem_chuan ls
WHERE ls.ma_chuong_trinh = 'GHA12QT' AND ls.nam = 2026
ON CONFLICT (ma_ls_dc, ma_phuong_thuc) DO UPDATE SET 
  diem = EXCLUDED.diem,
  diem_uu_tien_toi_thieu = EXCLUDED.diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da = EXCLUDED.nguyen_vong_toi_da;
INSERT INTO diem_trung_tuyen (
  ma_diem_tt,
  ma_ls_dc,
  ma_phuong_thuc,
  diem,
  diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da,
  create_at
)
SELECT
  'DTT-GHA13-2026-PT1',
  ls.ma_ls_dc,
  'PT1',
  24.93,
  NULL,
  10,
  NOW()
FROM lich_su_diem_chuan ls
WHERE ls.ma_chuong_trinh = 'GHA13' AND ls.nam = 2026
ON CONFLICT (ma_ls_dc, ma_phuong_thuc) DO UPDATE SET 
  diem = EXCLUDED.diem,
  diem_uu_tien_toi_thieu = EXCLUDED.diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da = EXCLUDED.nguyen_vong_toi_da;
INSERT INTO diem_trung_tuyen (
  ma_diem_tt,
  ma_ls_dc,
  ma_phuong_thuc,
  diem,
  diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da,
  create_at
)
SELECT
  'DTT-GHA13-2026-PT3',
  ls.ma_ls_dc,
  'PT3',
  93.6,
  NULL,
  10,
  NOW()
FROM lich_su_diem_chuan ls
WHERE ls.ma_chuong_trinh = 'GHA13' AND ls.nam = 2026
ON CONFLICT (ma_ls_dc, ma_phuong_thuc) DO UPDATE SET 
  diem = EXCLUDED.diem,
  diem_uu_tien_toi_thieu = EXCLUDED.diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da = EXCLUDED.nguyen_vong_toi_da;
INSERT INTO diem_trung_tuyen (
  ma_diem_tt,
  ma_ls_dc,
  ma_phuong_thuc,
  diem,
  diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da,
  create_at
)
SELECT
  'DTT-GHA13-2026-PT4',
  ls.ma_ls_dc,
  'PT4',
  58.19,
  NULL,
  10,
  NOW()
FROM lich_su_diem_chuan ls
WHERE ls.ma_chuong_trinh = 'GHA13' AND ls.nam = 2026
ON CONFLICT (ma_ls_dc, ma_phuong_thuc) DO UPDATE SET 
  diem = EXCLUDED.diem,
  diem_uu_tien_toi_thieu = EXCLUDED.diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da = EXCLUDED.nguyen_vong_toi_da;
INSERT INTO diem_trung_tuyen (
  ma_diem_tt,
  ma_ls_dc,
  ma_phuong_thuc,
  diem,
  diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da,
  create_at
)
SELECT
  'DTT-GHA14-2026-PT1',
  ls.ma_ls_dc,
  'PT1',
  24.2,
  NULL,
  5,
  NOW()
FROM lich_su_diem_chuan ls
WHERE ls.ma_chuong_trinh = 'GHA14' AND ls.nam = 2026
ON CONFLICT (ma_ls_dc, ma_phuong_thuc) DO UPDATE SET 
  diem = EXCLUDED.diem,
  diem_uu_tien_toi_thieu = EXCLUDED.diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da = EXCLUDED.nguyen_vong_toi_da;
INSERT INTO diem_trung_tuyen (
  ma_diem_tt,
  ma_ls_dc,
  ma_phuong_thuc,
  diem,
  diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da,
  create_at
)
SELECT
  'DTT-GHA14-2026-PT3',
  ls.ma_ls_dc,
  'PT3',
  88.82,
  NULL,
  5,
  NOW()
FROM lich_su_diem_chuan ls
WHERE ls.ma_chuong_trinh = 'GHA14' AND ls.nam = 2026
ON CONFLICT (ma_ls_dc, ma_phuong_thuc) DO UPDATE SET 
  diem = EXCLUDED.diem,
  diem_uu_tien_toi_thieu = EXCLUDED.diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da = EXCLUDED.nguyen_vong_toi_da;
INSERT INTO diem_trung_tuyen (
  ma_diem_tt,
  ma_ls_dc,
  ma_phuong_thuc,
  diem,
  diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da,
  create_at
)
SELECT
  'DTT-GHA14-2026-PT4',
  ls.ma_ls_dc,
  'PT4',
  55.89,
  NULL,
  5,
  NOW()
FROM lich_su_diem_chuan ls
WHERE ls.ma_chuong_trinh = 'GHA14' AND ls.nam = 2026
ON CONFLICT (ma_ls_dc, ma_phuong_thuc) DO UPDATE SET 
  diem = EXCLUDED.diem,
  diem_uu_tien_toi_thieu = EXCLUDED.diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da = EXCLUDED.nguyen_vong_toi_da;
INSERT INTO diem_trung_tuyen (
  ma_diem_tt,
  ma_ls_dc,
  ma_phuong_thuc,
  diem,
  diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da,
  create_at
)
SELECT
  'DTT-GHA14QT-2026-PT1',
  ls.ma_ls_dc,
  'PT1',
  22.44,
  NULL,
  1,
  NOW()
FROM lich_su_diem_chuan ls
WHERE ls.ma_chuong_trinh = 'GHA14QT' AND ls.nam = 2026
ON CONFLICT (ma_ls_dc, ma_phuong_thuc) DO UPDATE SET 
  diem = EXCLUDED.diem,
  diem_uu_tien_toi_thieu = EXCLUDED.diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da = EXCLUDED.nguyen_vong_toi_da;
INSERT INTO diem_trung_tuyen (
  ma_diem_tt,
  ma_ls_dc,
  ma_phuong_thuc,
  diem,
  diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da,
  create_at
)
SELECT
  'DTT-GHA14QT-2026-PT2',
  ls.ma_ls_dc,
  'PT2',
  26.43,
  NULL,
  1,
  NOW()
FROM lich_su_diem_chuan ls
WHERE ls.ma_chuong_trinh = 'GHA14QT' AND ls.nam = 2026
ON CONFLICT (ma_ls_dc, ma_phuong_thuc) DO UPDATE SET 
  diem = EXCLUDED.diem,
  diem_uu_tien_toi_thieu = EXCLUDED.diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da = EXCLUDED.nguyen_vong_toi_da;
INSERT INTO diem_trung_tuyen (
  ma_diem_tt,
  ma_ls_dc,
  ma_phuong_thuc,
  diem,
  diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da,
  create_at
)
SELECT
  'DTT-GHA14QT-2026-PT3',
  ls.ma_ls_dc,
  'PT3',
  78.83,
  NULL,
  1,
  NOW()
FROM lich_su_diem_chuan ls
WHERE ls.ma_chuong_trinh = 'GHA14QT' AND ls.nam = 2026
ON CONFLICT (ma_ls_dc, ma_phuong_thuc) DO UPDATE SET 
  diem = EXCLUDED.diem,
  diem_uu_tien_toi_thieu = EXCLUDED.diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da = EXCLUDED.nguyen_vong_toi_da;
INSERT INTO diem_trung_tuyen (
  ma_diem_tt,
  ma_ls_dc,
  ma_phuong_thuc,
  diem,
  diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da,
  create_at
)
SELECT
  'DTT-GHA14QT-2026-PT4',
  ls.ma_ls_dc,
  'PT4',
  51.38,
  NULL,
  1,
  NOW()
FROM lich_su_diem_chuan ls
WHERE ls.ma_chuong_trinh = 'GHA14QT' AND ls.nam = 2026
ON CONFLICT (ma_ls_dc, ma_phuong_thuc) DO UPDATE SET 
  diem = EXCLUDED.diem,
  diem_uu_tien_toi_thieu = EXCLUDED.diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da = EXCLUDED.nguyen_vong_toi_da;
INSERT INTO diem_trung_tuyen (
  ma_diem_tt,
  ma_ls_dc,
  ma_phuong_thuc,
  diem,
  diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da,
  create_at
)
SELECT
  'DTT-GHA15-2026-PT1',
  ls.ma_ls_dc,
  'PT1',
  24.41,
  NULL,
  2,
  NOW()
FROM lich_su_diem_chuan ls
WHERE ls.ma_chuong_trinh = 'GHA15' AND ls.nam = 2026
ON CONFLICT (ma_ls_dc, ma_phuong_thuc) DO UPDATE SET 
  diem = EXCLUDED.diem,
  diem_uu_tien_toi_thieu = EXCLUDED.diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da = EXCLUDED.nguyen_vong_toi_da;
INSERT INTO diem_trung_tuyen (
  ma_diem_tt,
  ma_ls_dc,
  ma_phuong_thuc,
  diem,
  diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da,
  create_at
)
SELECT
  'DTT-GHA15-2026-PT3',
  ls.ma_ls_dc,
  'PT3',
  90.19,
  NULL,
  2,
  NOW()
FROM lich_su_diem_chuan ls
WHERE ls.ma_chuong_trinh = 'GHA15' AND ls.nam = 2026
ON CONFLICT (ma_ls_dc, ma_phuong_thuc) DO UPDATE SET 
  diem = EXCLUDED.diem,
  diem_uu_tien_toi_thieu = EXCLUDED.diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da = EXCLUDED.nguyen_vong_toi_da;
INSERT INTO diem_trung_tuyen (
  ma_diem_tt,
  ma_ls_dc,
  ma_phuong_thuc,
  diem,
  diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da,
  create_at
)
SELECT
  'DTT-GHA15-2026-PT4',
  ls.ma_ls_dc,
  'PT4',
  56.55,
  NULL,
  2,
  NOW()
FROM lich_su_diem_chuan ls
WHERE ls.ma_chuong_trinh = 'GHA15' AND ls.nam = 2026
ON CONFLICT (ma_ls_dc, ma_phuong_thuc) DO UPDATE SET 
  diem = EXCLUDED.diem,
  diem_uu_tien_toi_thieu = EXCLUDED.diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da = EXCLUDED.nguyen_vong_toi_da;
INSERT INTO diem_trung_tuyen (
  ma_diem_tt,
  ma_ls_dc,
  ma_phuong_thuc,
  diem,
  diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da,
  create_at
)
SELECT
  'DTT-GHA16-2026-PT1',
  ls.ma_ls_dc,
  'PT1',
  26.01,
  NULL,
  2,
  NOW()
FROM lich_su_diem_chuan ls
WHERE ls.ma_chuong_trinh = 'GHA16' AND ls.nam = 2026
ON CONFLICT (ma_ls_dc, ma_phuong_thuc) DO UPDATE SET 
  diem = EXCLUDED.diem,
  diem_uu_tien_toi_thieu = EXCLUDED.diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da = EXCLUDED.nguyen_vong_toi_da;
INSERT INTO diem_trung_tuyen (
  ma_diem_tt,
  ma_ls_dc,
  ma_phuong_thuc,
  diem,
  diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da,
  create_at
)
SELECT
  'DTT-GHA16-2026-PT3',
  ls.ma_ls_dc,
  'PT3',
  100.67,
  NULL,
  2,
  NOW()
FROM lich_su_diem_chuan ls
WHERE ls.ma_chuong_trinh = 'GHA16' AND ls.nam = 2026
ON CONFLICT (ma_ls_dc, ma_phuong_thuc) DO UPDATE SET 
  diem = EXCLUDED.diem,
  diem_uu_tien_toi_thieu = EXCLUDED.diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da = EXCLUDED.nguyen_vong_toi_da;
INSERT INTO diem_trung_tuyen (
  ma_diem_tt,
  ma_ls_dc,
  ma_phuong_thuc,
  diem,
  diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da,
  create_at
)
SELECT
  'DTT-GHA16-2026-PT4',
  ls.ma_ls_dc,
  'PT4',
  61.86,
  NULL,
  2,
  NOW()
FROM lich_su_diem_chuan ls
WHERE ls.ma_chuong_trinh = 'GHA16' AND ls.nam = 2026
ON CONFLICT (ma_ls_dc, ma_phuong_thuc) DO UPDATE SET 
  diem = EXCLUDED.diem,
  diem_uu_tien_toi_thieu = EXCLUDED.diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da = EXCLUDED.nguyen_vong_toi_da;
INSERT INTO diem_trung_tuyen (
  ma_diem_tt,
  ma_ls_dc,
  ma_phuong_thuc,
  diem,
  diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da,
  create_at
)
SELECT
  'DTT-GHA16QT-2026-PT1',
  ls.ma_ls_dc,
  'PT1',
  24.38,
  NULL,
  3,
  NOW()
FROM lich_su_diem_chuan ls
WHERE ls.ma_chuong_trinh = 'GHA16QT' AND ls.nam = 2026
ON CONFLICT (ma_ls_dc, ma_phuong_thuc) DO UPDATE SET 
  diem = EXCLUDED.diem,
  diem_uu_tien_toi_thieu = EXCLUDED.diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da = EXCLUDED.nguyen_vong_toi_da;
INSERT INTO diem_trung_tuyen (
  ma_diem_tt,
  ma_ls_dc,
  ma_phuong_thuc,
  diem,
  diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da,
  create_at
)
SELECT
  'DTT-GHA16QT-2026-PT2',
  ls.ma_ls_dc,
  'PT2',
  27.44,
  NULL,
  3,
  NOW()
FROM lich_su_diem_chuan ls
WHERE ls.ma_chuong_trinh = 'GHA16QT' AND ls.nam = 2026
ON CONFLICT (ma_ls_dc, ma_phuong_thuc) DO UPDATE SET 
  diem = EXCLUDED.diem,
  diem_uu_tien_toi_thieu = EXCLUDED.diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da = EXCLUDED.nguyen_vong_toi_da;
INSERT INTO diem_trung_tuyen (
  ma_diem_tt,
  ma_ls_dc,
  ma_phuong_thuc,
  diem,
  diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da,
  create_at
)
SELECT
  'DTT-GHA16QT-2026-PT3',
  ls.ma_ls_dc,
  'PT3',
  90,
  NULL,
  3,
  NOW()
FROM lich_su_diem_chuan ls
WHERE ls.ma_chuong_trinh = 'GHA16QT' AND ls.nam = 2026
ON CONFLICT (ma_ls_dc, ma_phuong_thuc) DO UPDATE SET 
  diem = EXCLUDED.diem,
  diem_uu_tien_toi_thieu = EXCLUDED.diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da = EXCLUDED.nguyen_vong_toi_da;
INSERT INTO diem_trung_tuyen (
  ma_diem_tt,
  ma_ls_dc,
  ma_phuong_thuc,
  diem,
  diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da,
  create_at
)
SELECT
  'DTT-GHA16QT-2026-PT4',
  ls.ma_ls_dc,
  'PT4',
  56.46,
  NULL,
  3,
  NOW()
FROM lich_su_diem_chuan ls
WHERE ls.ma_chuong_trinh = 'GHA16QT' AND ls.nam = 2026
ON CONFLICT (ma_ls_dc, ma_phuong_thuc) DO UPDATE SET 
  diem = EXCLUDED.diem,
  diem_uu_tien_toi_thieu = EXCLUDED.diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da = EXCLUDED.nguyen_vong_toi_da;
INSERT INTO diem_trung_tuyen (
  ma_diem_tt,
  ma_ls_dc,
  ma_phuong_thuc,
  diem,
  diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da,
  create_at
)
SELECT
  'DTT-GHA17-2026-PT1',
  ls.ma_ls_dc,
  'PT1',
  26.23,
  NULL,
  5,
  NOW()
FROM lich_su_diem_chuan ls
WHERE ls.ma_chuong_trinh = 'GHA17' AND ls.nam = 2026
ON CONFLICT (ma_ls_dc, ma_phuong_thuc) DO UPDATE SET 
  diem = EXCLUDED.diem,
  diem_uu_tien_toi_thieu = EXCLUDED.diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da = EXCLUDED.nguyen_vong_toi_da;
INSERT INTO diem_trung_tuyen (
  ma_diem_tt,
  ma_ls_dc,
  ma_phuong_thuc,
  diem,
  diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da,
  create_at
)
SELECT
  'DTT-GHA17-2026-PT4',
  ls.ma_ls_dc,
  'PT4',
  62.61,
  NULL,
  5,
  NOW()
FROM lich_su_diem_chuan ls
WHERE ls.ma_chuong_trinh = 'GHA17' AND ls.nam = 2026
ON CONFLICT (ma_ls_dc, ma_phuong_thuc) DO UPDATE SET 
  diem = EXCLUDED.diem,
  diem_uu_tien_toi_thieu = EXCLUDED.diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da = EXCLUDED.nguyen_vong_toi_da;
INSERT INTO diem_trung_tuyen (
  ma_diem_tt,
  ma_ls_dc,
  ma_phuong_thuc,
  diem,
  diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da,
  create_at
)
SELECT
  'DTT-GHA18-2026-PT1',
  ls.ma_ls_dc,
  'PT1',
  25.45,
  NULL,
  2,
  NOW()
FROM lich_su_diem_chuan ls
WHERE ls.ma_chuong_trinh = 'GHA18' AND ls.nam = 2026
ON CONFLICT (ma_ls_dc, ma_phuong_thuc) DO UPDATE SET 
  diem = EXCLUDED.diem,
  diem_uu_tien_toi_thieu = EXCLUDED.diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da = EXCLUDED.nguyen_vong_toi_da;
INSERT INTO diem_trung_tuyen (
  ma_diem_tt,
  ma_ls_dc,
  ma_phuong_thuc,
  diem,
  diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da,
  create_at
)
SELECT
  'DTT-GHA18-2026-PT2',
  ls.ma_ls_dc,
  'PT2',
  28.19,
  NULL,
  2,
  NOW()
FROM lich_su_diem_chuan ls
WHERE ls.ma_chuong_trinh = 'GHA18' AND ls.nam = 2026
ON CONFLICT (ma_ls_dc, ma_phuong_thuc) DO UPDATE SET 
  diem = EXCLUDED.diem,
  diem_uu_tien_toi_thieu = EXCLUDED.diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da = EXCLUDED.nguyen_vong_toi_da;
INSERT INTO diem_trung_tuyen (
  ma_diem_tt,
  ma_ls_dc,
  ma_phuong_thuc,
  diem,
  diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da,
  create_at
)
SELECT
  'DTT-GHA18-2026-PT3',
  ls.ma_ls_dc,
  'PT3',
  97,
  NULL,
  2,
  NOW()
FROM lich_su_diem_chuan ls
WHERE ls.ma_chuong_trinh = 'GHA18' AND ls.nam = 2026
ON CONFLICT (ma_ls_dc, ma_phuong_thuc) DO UPDATE SET 
  diem = EXCLUDED.diem,
  diem_uu_tien_toi_thieu = EXCLUDED.diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da = EXCLUDED.nguyen_vong_toi_da;
INSERT INTO diem_trung_tuyen (
  ma_diem_tt,
  ma_ls_dc,
  ma_phuong_thuc,
  diem,
  diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da,
  create_at
)
SELECT
  'DTT-GHA18-2026-PT4',
  ls.ma_ls_dc,
  'PT4',
  59.93,
  NULL,
  2,
  NOW()
FROM lich_su_diem_chuan ls
WHERE ls.ma_chuong_trinh = 'GHA18' AND ls.nam = 2026
ON CONFLICT (ma_ls_dc, ma_phuong_thuc) DO UPDATE SET 
  diem = EXCLUDED.diem,
  diem_uu_tien_toi_thieu = EXCLUDED.diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da = EXCLUDED.nguyen_vong_toi_da;
INSERT INTO diem_trung_tuyen (
  ma_diem_tt,
  ma_ls_dc,
  ma_phuong_thuc,
  diem,
  diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da,
  create_at
)
SELECT
  'DTT-GHA19-2026-PT1',
  ls.ma_ls_dc,
  'PT1',
  24.56,
  NULL,
  10,
  NOW()
FROM lich_su_diem_chuan ls
WHERE ls.ma_chuong_trinh = 'GHA19' AND ls.nam = 2026
ON CONFLICT (ma_ls_dc, ma_phuong_thuc) DO UPDATE SET 
  diem = EXCLUDED.diem,
  diem_uu_tien_toi_thieu = EXCLUDED.diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da = EXCLUDED.nguyen_vong_toi_da;
INSERT INTO diem_trung_tuyen (
  ma_diem_tt,
  ma_ls_dc,
  ma_phuong_thuc,
  diem,
  diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da,
  create_at
)
SELECT
  'DTT-GHA19-2026-PT2',
  ls.ma_ls_dc,
  'PT2',
  27.54,
  NULL,
  10,
  NOW()
FROM lich_su_diem_chuan ls
WHERE ls.ma_chuong_trinh = 'GHA19' AND ls.nam = 2026
ON CONFLICT (ma_ls_dc, ma_phuong_thuc) DO UPDATE SET 
  diem = EXCLUDED.diem,
  diem_uu_tien_toi_thieu = EXCLUDED.diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da = EXCLUDED.nguyen_vong_toi_da;
INSERT INTO diem_trung_tuyen (
  ma_diem_tt,
  ma_ls_dc,
  ma_phuong_thuc,
  diem,
  diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da,
  create_at
)
SELECT
  'DTT-GHA19-2026-PT3',
  ls.ma_ls_dc,
  'PT3',
  91.18,
  NULL,
  10,
  NOW()
FROM lich_su_diem_chuan ls
WHERE ls.ma_chuong_trinh = 'GHA19' AND ls.nam = 2026
ON CONFLICT (ma_ls_dc, ma_phuong_thuc) DO UPDATE SET 
  diem = EXCLUDED.diem,
  diem_uu_tien_toi_thieu = EXCLUDED.diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da = EXCLUDED.nguyen_vong_toi_da;
INSERT INTO diem_trung_tuyen (
  ma_diem_tt,
  ma_ls_dc,
  ma_phuong_thuc,
  diem,
  diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da,
  create_at
)
SELECT
  'DTT-GHA19-2026-PT4',
  ls.ma_ls_dc,
  'PT4',
  57.02,
  NULL,
  10,
  NOW()
FROM lich_su_diem_chuan ls
WHERE ls.ma_chuong_trinh = 'GHA19' AND ls.nam = 2026
ON CONFLICT (ma_ls_dc, ma_phuong_thuc) DO UPDATE SET 
  diem = EXCLUDED.diem,
  diem_uu_tien_toi_thieu = EXCLUDED.diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da = EXCLUDED.nguyen_vong_toi_da;
INSERT INTO diem_trung_tuyen (
  ma_diem_tt,
  ma_ls_dc,
  ma_phuong_thuc,
  diem,
  diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da,
  create_at
)
SELECT
  'DTT-GHA19DS-2026-PT1',
  ls.ma_ls_dc,
  'PT1',
  24.23,
  NULL,
  1,
  NOW()
FROM lich_su_diem_chuan ls
WHERE ls.ma_chuong_trinh = 'GHA19DS' AND ls.nam = 2026
ON CONFLICT (ma_ls_dc, ma_phuong_thuc) DO UPDATE SET 
  diem = EXCLUDED.diem,
  diem_uu_tien_toi_thieu = EXCLUDED.diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da = EXCLUDED.nguyen_vong_toi_da;
INSERT INTO diem_trung_tuyen (
  ma_diem_tt,
  ma_ls_dc,
  ma_phuong_thuc,
  diem,
  diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da,
  create_at
)
SELECT
  'DTT-GHA19DS-2026-PT2',
  ls.ma_ls_dc,
  'PT2',
  27.36,
  NULL,
  1,
  NOW()
FROM lich_su_diem_chuan ls
WHERE ls.ma_chuong_trinh = 'GHA19DS' AND ls.nam = 2026
ON CONFLICT (ma_ls_dc, ma_phuong_thuc) DO UPDATE SET 
  diem = EXCLUDED.diem,
  diem_uu_tien_toi_thieu = EXCLUDED.diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da = EXCLUDED.nguyen_vong_toi_da;
INSERT INTO diem_trung_tuyen (
  ma_diem_tt,
  ma_ls_dc,
  ma_phuong_thuc,
  diem,
  diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da,
  create_at
)
SELECT
  'DTT-GHA19DS-2026-PT3',
  ls.ma_ls_dc,
  'PT3',
  89.02,
  NULL,
  1,
  NOW()
FROM lich_su_diem_chuan ls
WHERE ls.ma_chuong_trinh = 'GHA19DS' AND ls.nam = 2026
ON CONFLICT (ma_ls_dc, ma_phuong_thuc) DO UPDATE SET 
  diem = EXCLUDED.diem,
  diem_uu_tien_toi_thieu = EXCLUDED.diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da = EXCLUDED.nguyen_vong_toi_da;
INSERT INTO diem_trung_tuyen (
  ma_diem_tt,
  ma_ls_dc,
  ma_phuong_thuc,
  diem,
  diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da,
  create_at
)
SELECT
  'DTT-GHA19DS-2026-PT4',
  ls.ma_ls_dc,
  'PT4',
  55.98,
  NULL,
  1,
  NOW()
FROM lich_su_diem_chuan ls
WHERE ls.ma_chuong_trinh = 'GHA19DS' AND ls.nam = 2026
ON CONFLICT (ma_ls_dc, ma_phuong_thuc) DO UPDATE SET 
  diem = EXCLUDED.diem,
  diem_uu_tien_toi_thieu = EXCLUDED.diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da = EXCLUDED.nguyen_vong_toi_da;
INSERT INTO diem_trung_tuyen (
  ma_diem_tt,
  ma_ls_dc,
  ma_phuong_thuc,
  diem,
  diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da,
  create_at
)
SELECT
  'DTT-GHA20-2026-PT1',
  ls.ma_ls_dc,
  'PT1',
  24.76,
  NULL,
  1,
  NOW()
FROM lich_su_diem_chuan ls
WHERE ls.ma_chuong_trinh = 'GHA20' AND ls.nam = 2026
ON CONFLICT (ma_ls_dc, ma_phuong_thuc) DO UPDATE SET 
  diem = EXCLUDED.diem,
  diem_uu_tien_toi_thieu = EXCLUDED.diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da = EXCLUDED.nguyen_vong_toi_da;
INSERT INTO diem_trung_tuyen (
  ma_diem_tt,
  ma_ls_dc,
  ma_phuong_thuc,
  diem,
  diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da,
  create_at
)
SELECT
  'DTT-GHA20-2026-PT3',
  ls.ma_ls_dc,
  'PT3',
  92.48,
  NULL,
  1,
  NOW()
FROM lich_su_diem_chuan ls
WHERE ls.ma_chuong_trinh = 'GHA20' AND ls.nam = 2026
ON CONFLICT (ma_ls_dc, ma_phuong_thuc) DO UPDATE SET 
  diem = EXCLUDED.diem,
  diem_uu_tien_toi_thieu = EXCLUDED.diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da = EXCLUDED.nguyen_vong_toi_da;
INSERT INTO diem_trung_tuyen (
  ma_diem_tt,
  ma_ls_dc,
  ma_phuong_thuc,
  diem,
  diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da,
  create_at
)
SELECT
  'DTT-GHA20-2026-PT4',
  ls.ma_ls_dc,
  'PT4',
  57.65,
  NULL,
  1,
  NOW()
FROM lich_su_diem_chuan ls
WHERE ls.ma_chuong_trinh = 'GHA20' AND ls.nam = 2026
ON CONFLICT (ma_ls_dc, ma_phuong_thuc) DO UPDATE SET 
  diem = EXCLUDED.diem,
  diem_uu_tien_toi_thieu = EXCLUDED.diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da = EXCLUDED.nguyen_vong_toi_da;
INSERT INTO diem_trung_tuyen (
  ma_diem_tt,
  ma_ls_dc,
  ma_phuong_thuc,
  diem,
  diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da,
  create_at
)
SELECT
  'DTT-GHA20QT-2026-PT1',
  ls.ma_ls_dc,
  'PT1',
  22.79,
  NULL,
  4,
  NOW()
FROM lich_su_diem_chuan ls
WHERE ls.ma_chuong_trinh = 'GHA20QT' AND ls.nam = 2026
ON CONFLICT (ma_ls_dc, ma_phuong_thuc) DO UPDATE SET 
  diem = EXCLUDED.diem,
  diem_uu_tien_toi_thieu = EXCLUDED.diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da = EXCLUDED.nguyen_vong_toi_da;
INSERT INTO diem_trung_tuyen (
  ma_diem_tt,
  ma_ls_dc,
  ma_phuong_thuc,
  diem,
  diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da,
  create_at
)
SELECT
  'DTT-GHA20QT-2026-PT2',
  ls.ma_ls_dc,
  'PT2',
  26.62,
  NULL,
  4,
  NOW()
FROM lich_su_diem_chuan ls
WHERE ls.ma_chuong_trinh = 'GHA20QT' AND ls.nam = 2026
ON CONFLICT (ma_ls_dc, ma_phuong_thuc) DO UPDATE SET 
  diem = EXCLUDED.diem,
  diem_uu_tien_toi_thieu = EXCLUDED.diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da = EXCLUDED.nguyen_vong_toi_da;
INSERT INTO diem_trung_tuyen (
  ma_diem_tt,
  ma_ls_dc,
  ma_phuong_thuc,
  diem,
  diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da,
  create_at
)
SELECT
  'DTT-GHA20QT-2026-PT3',
  ls.ma_ls_dc,
  'PT3',
  80.72,
  NULL,
  4,
  NOW()
FROM lich_su_diem_chuan ls
WHERE ls.ma_chuong_trinh = 'GHA20QT' AND ls.nam = 2026
ON CONFLICT (ma_ls_dc, ma_phuong_thuc) DO UPDATE SET 
  diem = EXCLUDED.diem,
  diem_uu_tien_toi_thieu = EXCLUDED.diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da = EXCLUDED.nguyen_vong_toi_da;
INSERT INTO diem_trung_tuyen (
  ma_diem_tt,
  ma_ls_dc,
  ma_phuong_thuc,
  diem,
  diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da,
  create_at
)
SELECT
  'DTT-GHA20QT-2026-PT4',
  ls.ma_ls_dc,
  'PT4',
  52.14,
  NULL,
  4,
  NOW()
FROM lich_su_diem_chuan ls
WHERE ls.ma_chuong_trinh = 'GHA20QT' AND ls.nam = 2026
ON CONFLICT (ma_ls_dc, ma_phuong_thuc) DO UPDATE SET 
  diem = EXCLUDED.diem,
  diem_uu_tien_toi_thieu = EXCLUDED.diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da = EXCLUDED.nguyen_vong_toi_da;
INSERT INTO diem_trung_tuyen (
  ma_diem_tt,
  ma_ls_dc,
  ma_phuong_thuc,
  diem,
  diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da,
  create_at
)
SELECT
  'DTT-GHA21-2026-PT1',
  ls.ma_ls_dc,
  'PT1',
  25.63,
  NULL,
  3,
  NOW()
FROM lich_su_diem_chuan ls
WHERE ls.ma_chuong_trinh = 'GHA21' AND ls.nam = 2026
ON CONFLICT (ma_ls_dc, ma_phuong_thuc) DO UPDATE SET 
  diem = EXCLUDED.diem,
  diem_uu_tien_toi_thieu = EXCLUDED.diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da = EXCLUDED.nguyen_vong_toi_da;
INSERT INTO diem_trung_tuyen (
  ma_diem_tt,
  ma_ls_dc,
  ma_phuong_thuc,
  diem,
  diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da,
  create_at
)
SELECT
  'DTT-GHA21-2026-PT3',
  ls.ma_ls_dc,
  'PT3',
  98.18,
  NULL,
  3,
  NOW()
FROM lich_su_diem_chuan ls
WHERE ls.ma_chuong_trinh = 'GHA21' AND ls.nam = 2026
ON CONFLICT (ma_ls_dc, ma_phuong_thuc) DO UPDATE SET 
  diem = EXCLUDED.diem,
  diem_uu_tien_toi_thieu = EXCLUDED.diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da = EXCLUDED.nguyen_vong_toi_da;
INSERT INTO diem_trung_tuyen (
  ma_diem_tt,
  ma_ls_dc,
  ma_phuong_thuc,
  diem,
  diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da,
  create_at
)
SELECT
  'DTT-GHA21-2026-PT4',
  ls.ma_ls_dc,
  'PT4',
  60.55,
  NULL,
  3,
  NOW()
FROM lich_su_diem_chuan ls
WHERE ls.ma_chuong_trinh = 'GHA21' AND ls.nam = 2026
ON CONFLICT (ma_ls_dc, ma_phuong_thuc) DO UPDATE SET 
  diem = EXCLUDED.diem,
  diem_uu_tien_toi_thieu = EXCLUDED.diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da = EXCLUDED.nguyen_vong_toi_da;
INSERT INTO diem_trung_tuyen (
  ma_diem_tt,
  ma_ls_dc,
  ma_phuong_thuc,
  diem,
  diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da,
  create_at
)
SELECT
  'DTT-GHA21DS-2026-PT1',
  ls.ma_ls_dc,
  'PT1',
  24.9,
  NULL,
  2,
  NOW()
FROM lich_su_diem_chuan ls
WHERE ls.ma_chuong_trinh = 'GHA21DS' AND ls.nam = 2026
ON CONFLICT (ma_ls_dc, ma_phuong_thuc) DO UPDATE SET 
  diem = EXCLUDED.diem,
  diem_uu_tien_toi_thieu = EXCLUDED.diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da = EXCLUDED.nguyen_vong_toi_da;
INSERT INTO diem_trung_tuyen (
  ma_diem_tt,
  ma_ls_dc,
  ma_phuong_thuc,
  diem,
  diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da,
  create_at
)
SELECT
  'DTT-GHA21DS-2026-PT2',
  ls.ma_ls_dc,
  'PT2',
  27.75,
  NULL,
  2,
  NOW()
FROM lich_su_diem_chuan ls
WHERE ls.ma_chuong_trinh = 'GHA21DS' AND ls.nam = 2026
ON CONFLICT (ma_ls_dc, ma_phuong_thuc) DO UPDATE SET 
  diem = EXCLUDED.diem,
  diem_uu_tien_toi_thieu = EXCLUDED.diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da = EXCLUDED.nguyen_vong_toi_da;
INSERT INTO diem_trung_tuyen (
  ma_diem_tt,
  ma_ls_dc,
  ma_phuong_thuc,
  diem,
  diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da,
  create_at
)
SELECT
  'DTT-GHA21DS-2026-PT3',
  ls.ma_ls_dc,
  'PT3',
  93.4,
  NULL,
  2,
  NOW()
FROM lich_su_diem_chuan ls
WHERE ls.ma_chuong_trinh = 'GHA21DS' AND ls.nam = 2026
ON CONFLICT (ma_ls_dc, ma_phuong_thuc) DO UPDATE SET 
  diem = EXCLUDED.diem,
  diem_uu_tien_toi_thieu = EXCLUDED.diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da = EXCLUDED.nguyen_vong_toi_da;
INSERT INTO diem_trung_tuyen (
  ma_diem_tt,
  ma_ls_dc,
  ma_phuong_thuc,
  diem,
  diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da,
  create_at
)
SELECT
  'DTT-GHA21DS-2026-PT4',
  ls.ma_ls_dc,
  'PT4',
  58.09,
  NULL,
  2,
  NOW()
FROM lich_su_diem_chuan ls
WHERE ls.ma_chuong_trinh = 'GHA21DS' AND ls.nam = 2026
ON CONFLICT (ma_ls_dc, ma_phuong_thuc) DO UPDATE SET 
  diem = EXCLUDED.diem,
  diem_uu_tien_toi_thieu = EXCLUDED.diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da = EXCLUDED.nguyen_vong_toi_da;
INSERT INTO diem_trung_tuyen (
  ma_diem_tt,
  ma_ls_dc,
  ma_phuong_thuc,
  diem,
  diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da,
  create_at
)
SELECT
  'DTT-GHA22-2026-PT1',
  ls.ma_ls_dc,
  'PT1',
  24.87,
  NULL,
  8,
  NOW()
FROM lich_su_diem_chuan ls
WHERE ls.ma_chuong_trinh = 'GHA22' AND ls.nam = 2026
ON CONFLICT (ma_ls_dc, ma_phuong_thuc) DO UPDATE SET 
  diem = EXCLUDED.diem,
  diem_uu_tien_toi_thieu = EXCLUDED.diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da = EXCLUDED.nguyen_vong_toi_da;
INSERT INTO diem_trung_tuyen (
  ma_diem_tt,
  ma_ls_dc,
  ma_phuong_thuc,
  diem,
  diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da,
  create_at
)
SELECT
  'DTT-GHA22-2026-PT3',
  ls.ma_ls_dc,
  'PT3',
  93.2,
  NULL,
  8,
  NOW()
FROM lich_su_diem_chuan ls
WHERE ls.ma_chuong_trinh = 'GHA22' AND ls.nam = 2026
ON CONFLICT (ma_ls_dc, ma_phuong_thuc) DO UPDATE SET 
  diem = EXCLUDED.diem,
  diem_uu_tien_toi_thieu = EXCLUDED.diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da = EXCLUDED.nguyen_vong_toi_da;
INSERT INTO diem_trung_tuyen (
  ma_diem_tt,
  ma_ls_dc,
  ma_phuong_thuc,
  diem,
  diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da,
  create_at
)
SELECT
  'DTT-GHA22-2026-PT4',
  ls.ma_ls_dc,
  'PT4',
  58,
  NULL,
  8,
  NOW()
FROM lich_su_diem_chuan ls
WHERE ls.ma_chuong_trinh = 'GHA22' AND ls.nam = 2026
ON CONFLICT (ma_ls_dc, ma_phuong_thuc) DO UPDATE SET 
  diem = EXCLUDED.diem,
  diem_uu_tien_toi_thieu = EXCLUDED.diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da = EXCLUDED.nguyen_vong_toi_da;
INSERT INTO diem_trung_tuyen (
  ma_diem_tt,
  ma_ls_dc,
  ma_phuong_thuc,
  diem,
  diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da,
  create_at
)
SELECT
  'DTT-GHA22BD-2026-PT1',
  ls.ma_ls_dc,
  'PT1',
  25,
  NULL,
  2,
  NOW()
FROM lich_su_diem_chuan ls
WHERE ls.ma_chuong_trinh = 'GHA22BD' AND ls.nam = 2026
ON CONFLICT (ma_ls_dc, ma_phuong_thuc) DO UPDATE SET 
  diem = EXCLUDED.diem,
  diem_uu_tien_toi_thieu = EXCLUDED.diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da = EXCLUDED.nguyen_vong_toi_da;
INSERT INTO diem_trung_tuyen (
  ma_diem_tt,
  ma_ls_dc,
  ma_phuong_thuc,
  diem,
  diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da,
  create_at
)
SELECT
  'DTT-GHA22BD-2026-PT3',
  ls.ma_ls_dc,
  'PT3',
  94.06,
  NULL,
  2,
  NOW()
FROM lich_su_diem_chuan ls
WHERE ls.ma_chuong_trinh = 'GHA22BD' AND ls.nam = 2026
ON CONFLICT (ma_ls_dc, ma_phuong_thuc) DO UPDATE SET 
  diem = EXCLUDED.diem,
  diem_uu_tien_toi_thieu = EXCLUDED.diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da = EXCLUDED.nguyen_vong_toi_da;
INSERT INTO diem_trung_tuyen (
  ma_diem_tt,
  ma_ls_dc,
  ma_phuong_thuc,
  diem,
  diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da,
  create_at
)
SELECT
  'DTT-GHA22BD-2026-PT4',
  ls.ma_ls_dc,
  'PT4',
  58.41,
  NULL,
  2,
  NOW()
FROM lich_su_diem_chuan ls
WHERE ls.ma_chuong_trinh = 'GHA22BD' AND ls.nam = 2026
ON CONFLICT (ma_ls_dc, ma_phuong_thuc) DO UPDATE SET 
  diem = EXCLUDED.diem,
  diem_uu_tien_toi_thieu = EXCLUDED.diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da = EXCLUDED.nguyen_vong_toi_da;
INSERT INTO diem_trung_tuyen (
  ma_diem_tt,
  ma_ls_dc,
  ma_phuong_thuc,
  diem,
  diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da,
  create_at
)
SELECT
  'DTT-GHA22QT-2026-PT1',
  ls.ma_ls_dc,
  'PT1',
  23.26,
  NULL,
  4,
  NOW()
FROM lich_su_diem_chuan ls
WHERE ls.ma_chuong_trinh = 'GHA22QT' AND ls.nam = 2026
ON CONFLICT (ma_ls_dc, ma_phuong_thuc) DO UPDATE SET 
  diem = EXCLUDED.diem,
  diem_uu_tien_toi_thieu = EXCLUDED.diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da = EXCLUDED.nguyen_vong_toi_da;
INSERT INTO diem_trung_tuyen (
  ma_diem_tt,
  ma_ls_dc,
  ma_phuong_thuc,
  diem,
  diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da,
  create_at
)
SELECT
  'DTT-GHA22QT-2026-PT2',
  ls.ma_ls_dc,
  'PT2',
  26.86,
  NULL,
  4,
  NOW()
FROM lich_su_diem_chuan ls
WHERE ls.ma_chuong_trinh = 'GHA22QT' AND ls.nam = 2026
ON CONFLICT (ma_ls_dc, ma_phuong_thuc) DO UPDATE SET 
  diem = EXCLUDED.diem,
  diem_uu_tien_toi_thieu = EXCLUDED.diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da = EXCLUDED.nguyen_vong_toi_da;
INSERT INTO diem_trung_tuyen (
  ma_diem_tt,
  ma_ls_dc,
  ma_phuong_thuc,
  diem,
  diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da,
  create_at
)
SELECT
  'DTT-GHA22QT-2026-PT3',
  ls.ma_ls_dc,
  'PT3',
  83.25,
  NULL,
  4,
  NOW()
FROM lich_su_diem_chuan ls
WHERE ls.ma_chuong_trinh = 'GHA22QT' AND ls.nam = 2026
ON CONFLICT (ma_ls_dc, ma_phuong_thuc) DO UPDATE SET 
  diem = EXCLUDED.diem,
  diem_uu_tien_toi_thieu = EXCLUDED.diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da = EXCLUDED.nguyen_vong_toi_da;
INSERT INTO diem_trung_tuyen (
  ma_diem_tt,
  ma_ls_dc,
  ma_phuong_thuc,
  diem,
  diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da,
  create_at
)
SELECT
  'DTT-GHA22QT-2026-PT4',
  ls.ma_ls_dc,
  'PT4',
  53.16,
  NULL,
  4,
  NOW()
FROM lich_su_diem_chuan ls
WHERE ls.ma_chuong_trinh = 'GHA22QT' AND ls.nam = 2026
ON CONFLICT (ma_ls_dc, ma_phuong_thuc) DO UPDATE SET 
  diem = EXCLUDED.diem,
  diem_uu_tien_toi_thieu = EXCLUDED.diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da = EXCLUDED.nguyen_vong_toi_da;
INSERT INTO diem_trung_tuyen (
  ma_diem_tt,
  ma_ls_dc,
  ma_phuong_thuc,
  diem,
  diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da,
  create_at
)
SELECT
  'DTT-GHA23-2026-PT1',
  ls.ma_ls_dc,
  'PT1',
  26.5,
  NULL,
  6,
  NOW()
FROM lich_su_diem_chuan ls
WHERE ls.ma_chuong_trinh = 'GHA23' AND ls.nam = 2026
ON CONFLICT (ma_ls_dc, ma_phuong_thuc) DO UPDATE SET 
  diem = EXCLUDED.diem,
  diem_uu_tien_toi_thieu = EXCLUDED.diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da = EXCLUDED.nguyen_vong_toi_da;
INSERT INTO diem_trung_tuyen (
  ma_diem_tt,
  ma_ls_dc,
  ma_phuong_thuc,
  diem,
  diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da,
  create_at
)
SELECT
  'DTT-GHA23-2026-PT3',
  ls.ma_ls_dc,
  'PT3',
  103.87,
  NULL,
  6,
  NOW()
FROM lich_su_diem_chuan ls
WHERE ls.ma_chuong_trinh = 'GHA23' AND ls.nam = 2026
ON CONFLICT (ma_ls_dc, ma_phuong_thuc) DO UPDATE SET 
  diem = EXCLUDED.diem,
  diem_uu_tien_toi_thieu = EXCLUDED.diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da = EXCLUDED.nguyen_vong_toi_da;
INSERT INTO diem_trung_tuyen (
  ma_diem_tt,
  ma_ls_dc,
  ma_phuong_thuc,
  diem,
  diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da,
  create_at
)
SELECT
  'DTT-GHA23-2026-PT4',
  ls.ma_ls_dc,
  'PT4',
  63.54,
  NULL,
  6,
  NOW()
FROM lich_su_diem_chuan ls
WHERE ls.ma_chuong_trinh = 'GHA23' AND ls.nam = 2026
ON CONFLICT (ma_ls_dc, ma_phuong_thuc) DO UPDATE SET 
  diem = EXCLUDED.diem,
  diem_uu_tien_toi_thieu = EXCLUDED.diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da = EXCLUDED.nguyen_vong_toi_da;
INSERT INTO diem_trung_tuyen (
  ma_diem_tt,
  ma_ls_dc,
  ma_phuong_thuc,
  diem,
  diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da,
  create_at
)
SELECT
  'DTT-GHA23DS-2026-PT1',
  ls.ma_ls_dc,
  'PT1',
  25.52,
  NULL,
  3,
  NOW()
FROM lich_su_diem_chuan ls
WHERE ls.ma_chuong_trinh = 'GHA23DS' AND ls.nam = 2026
ON CONFLICT (ma_ls_dc, ma_phuong_thuc) DO UPDATE SET 
  diem = EXCLUDED.diem,
  diem_uu_tien_toi_thieu = EXCLUDED.diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da = EXCLUDED.nguyen_vong_toi_da;
INSERT INTO diem_trung_tuyen (
  ma_diem_tt,
  ma_ls_dc,
  ma_phuong_thuc,
  diem,
  diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da,
  create_at
)
SELECT
  'DTT-GHA23DS-2026-PT2',
  ls.ma_ls_dc,
  'PT2',
  28.25,
  NULL,
  3,
  NOW()
FROM lich_su_diem_chuan ls
WHERE ls.ma_chuong_trinh = 'GHA23DS' AND ls.nam = 2026
ON CONFLICT (ma_ls_dc, ma_phuong_thuc) DO UPDATE SET 
  diem = EXCLUDED.diem,
  diem_uu_tien_toi_thieu = EXCLUDED.diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da = EXCLUDED.nguyen_vong_toi_da;
INSERT INTO diem_trung_tuyen (
  ma_diem_tt,
  ma_ls_dc,
  ma_phuong_thuc,
  diem,
  diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da,
  create_at
)
SELECT
  'DTT-GHA23DS-2026-PT3',
  ls.ma_ls_dc,
  'PT3',
  97.46,
  NULL,
  3,
  NOW()
FROM lich_su_diem_chuan ls
WHERE ls.ma_chuong_trinh = 'GHA23DS' AND ls.nam = 2026
ON CONFLICT (ma_ls_dc, ma_phuong_thuc) DO UPDATE SET 
  diem = EXCLUDED.diem,
  diem_uu_tien_toi_thieu = EXCLUDED.diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da = EXCLUDED.nguyen_vong_toi_da;
INSERT INTO diem_trung_tuyen (
  ma_diem_tt,
  ma_ls_dc,
  ma_phuong_thuc,
  diem,
  diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da,
  create_at
)
SELECT
  'DTT-GHA23DS-2026-PT4',
  ls.ma_ls_dc,
  'PT4',
  60.17,
  NULL,
  3,
  NOW()
FROM lich_su_diem_chuan ls
WHERE ls.ma_chuong_trinh = 'GHA23DS' AND ls.nam = 2026
ON CONFLICT (ma_ls_dc, ma_phuong_thuc) DO UPDATE SET 
  diem = EXCLUDED.diem,
  diem_uu_tien_toi_thieu = EXCLUDED.diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da = EXCLUDED.nguyen_vong_toi_da;
INSERT INTO diem_trung_tuyen (
  ma_diem_tt,
  ma_ls_dc,
  ma_phuong_thuc,
  diem,
  diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da,
  create_at
)
SELECT
  'DTT-GHA23TM-2026-PT1',
  ls.ma_ls_dc,
  'PT1',
  25.78,
  NULL,
  2,
  NOW()
FROM lich_su_diem_chuan ls
WHERE ls.ma_chuong_trinh = 'GHA23TM' AND ls.nam = 2026
ON CONFLICT (ma_ls_dc, ma_phuong_thuc) DO UPDATE SET 
  diem = EXCLUDED.diem,
  diem_uu_tien_toi_thieu = EXCLUDED.diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da = EXCLUDED.nguyen_vong_toi_da;
INSERT INTO diem_trung_tuyen (
  ma_diem_tt,
  ma_ls_dc,
  ma_phuong_thuc,
  diem,
  diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da,
  create_at
)
SELECT
  'DTT-GHA23TM-2026-PT3',
  ls.ma_ls_dc,
  'PT3',
  99.16,
  NULL,
  2,
  NOW()
FROM lich_su_diem_chuan ls
WHERE ls.ma_chuong_trinh = 'GHA23TM' AND ls.nam = 2026
ON CONFLICT (ma_ls_dc, ma_phuong_thuc) DO UPDATE SET 
  diem = EXCLUDED.diem,
  diem_uu_tien_toi_thieu = EXCLUDED.diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da = EXCLUDED.nguyen_vong_toi_da;
INSERT INTO diem_trung_tuyen (
  ma_diem_tt,
  ma_ls_dc,
  ma_phuong_thuc,
  diem,
  diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da,
  create_at
)
SELECT
  'DTT-GHA23TM-2026-PT4',
  ls.ma_ls_dc,
  'PT4',
  61.07,
  NULL,
  2,
  NOW()
FROM lich_su_diem_chuan ls
WHERE ls.ma_chuong_trinh = 'GHA23TM' AND ls.nam = 2026
ON CONFLICT (ma_ls_dc, ma_phuong_thuc) DO UPDATE SET 
  diem = EXCLUDED.diem,
  diem_uu_tien_toi_thieu = EXCLUDED.diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da = EXCLUDED.nguyen_vong_toi_da;
INSERT INTO diem_trung_tuyen (
  ma_diem_tt,
  ma_ls_dc,
  ma_phuong_thuc,
  diem,
  diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da,
  create_at
)
SELECT
  'DTT-GHA24-2026-PT1',
  ls.ma_ls_dc,
  'PT1',
  25.18,
  NULL,
  11,
  NOW()
FROM lich_su_diem_chuan ls
WHERE ls.ma_chuong_trinh = 'GHA24' AND ls.nam = 2026
ON CONFLICT (ma_ls_dc, ma_phuong_thuc) DO UPDATE SET 
  diem = EXCLUDED.diem,
  diem_uu_tien_toi_thieu = EXCLUDED.diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da = EXCLUDED.nguyen_vong_toi_da;
INSERT INTO diem_trung_tuyen (
  ma_diem_tt,
  ma_ls_dc,
  ma_phuong_thuc,
  diem,
  diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da,
  create_at
)
SELECT
  'DTT-GHA24-2026-PT3',
  ls.ma_ls_dc,
  'PT3',
  95.23,
  NULL,
  11,
  NOW()
FROM lich_su_diem_chuan ls
WHERE ls.ma_chuong_trinh = 'GHA24' AND ls.nam = 2026
ON CONFLICT (ma_ls_dc, ma_phuong_thuc) DO UPDATE SET 
  diem = EXCLUDED.diem,
  diem_uu_tien_toi_thieu = EXCLUDED.diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da = EXCLUDED.nguyen_vong_toi_da;
INSERT INTO diem_trung_tuyen (
  ma_diem_tt,
  ma_ls_dc,
  ma_phuong_thuc,
  diem,
  diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da,
  create_at
)
SELECT
  'DTT-GHA24-2026-PT4',
  ls.ma_ls_dc,
  'PT4',
  59,
  NULL,
  11,
  NOW()
FROM lich_su_diem_chuan ls
WHERE ls.ma_chuong_trinh = 'GHA24' AND ls.nam = 2026
ON CONFLICT (ma_ls_dc, ma_phuong_thuc) DO UPDATE SET 
  diem = EXCLUDED.diem,
  diem_uu_tien_toi_thieu = EXCLUDED.diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da = EXCLUDED.nguyen_vong_toi_da;
INSERT INTO diem_trung_tuyen (
  ma_diem_tt,
  ma_ls_dc,
  ma_phuong_thuc,
  diem,
  diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da,
  create_at
)
SELECT
  'DTT-GHA25-2026-PT1',
  ls.ma_ls_dc,
  'PT1',
  22.21,
  NULL,
  1,
  NOW()
FROM lich_su_diem_chuan ls
WHERE ls.ma_chuong_trinh = 'GHA25' AND ls.nam = 2026
ON CONFLICT (ma_ls_dc, ma_phuong_thuc) DO UPDATE SET 
  diem = EXCLUDED.diem,
  diem_uu_tien_toi_thieu = EXCLUDED.diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da = EXCLUDED.nguyen_vong_toi_da;
INSERT INTO diem_trung_tuyen (
  ma_diem_tt,
  ma_ls_dc,
  ma_phuong_thuc,
  diem,
  diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da,
  create_at
)
SELECT
  'DTT-GHA25-2026-PT2',
  ls.ma_ls_dc,
  'PT2',
  26.31,
  NULL,
  1,
  NOW()
FROM lich_su_diem_chuan ls
WHERE ls.ma_chuong_trinh = 'GHA25' AND ls.nam = 2026
ON CONFLICT (ma_ls_dc, ma_phuong_thuc) DO UPDATE SET 
  diem = EXCLUDED.diem,
  diem_uu_tien_toi_thieu = EXCLUDED.diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da = EXCLUDED.nguyen_vong_toi_da;
INSERT INTO diem_trung_tuyen (
  ma_diem_tt,
  ma_ls_dc,
  ma_phuong_thuc,
  diem,
  diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da,
  create_at
)
SELECT
  'DTT-GHA25-2026-PT4',
  ls.ma_ls_dc,
  'PT4',
  50.88,
  NULL,
  1,
  NOW()
FROM lich_su_diem_chuan ls
WHERE ls.ma_chuong_trinh = 'GHA25' AND ls.nam = 2026
ON CONFLICT (ma_ls_dc, ma_phuong_thuc) DO UPDATE SET 
  diem = EXCLUDED.diem,
  diem_uu_tien_toi_thieu = EXCLUDED.diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da = EXCLUDED.nguyen_vong_toi_da;
INSERT INTO diem_trung_tuyen (
  ma_diem_tt,
  ma_ls_dc,
  ma_phuong_thuc,
  diem,
  diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da,
  create_at
)
SELECT
  'DTT-GHA26-2026-PT1',
  ls.ma_ls_dc,
  'PT1',
  21.5,
  NULL,
  1,
  NOW()
FROM lich_su_diem_chuan ls
WHERE ls.ma_chuong_trinh = 'GHA26' AND ls.nam = 2026
ON CONFLICT (ma_ls_dc, ma_phuong_thuc) DO UPDATE SET 
  diem = EXCLUDED.diem,
  diem_uu_tien_toi_thieu = EXCLUDED.diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da = EXCLUDED.nguyen_vong_toi_da;
INSERT INTO diem_trung_tuyen (
  ma_diem_tt,
  ma_ls_dc,
  ma_phuong_thuc,
  diem,
  diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da,
  create_at
)
SELECT
  'DTT-GHA26-2026-PT2',
  ls.ma_ls_dc,
  'PT2',
  25.87,
  NULL,
  1,
  NOW()
FROM lich_su_diem_chuan ls
WHERE ls.ma_chuong_trinh = 'GHA26' AND ls.nam = 2026
ON CONFLICT (ma_ls_dc, ma_phuong_thuc) DO UPDATE SET 
  diem = EXCLUDED.diem,
  diem_uu_tien_toi_thieu = EXCLUDED.diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da = EXCLUDED.nguyen_vong_toi_da;
INSERT INTO diem_trung_tuyen (
  ma_diem_tt,
  ma_ls_dc,
  ma_phuong_thuc,
  diem,
  diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da,
  create_at
)
SELECT
  'DTT-GHA26-2026-PT4',
  ls.ma_ls_dc,
  'PT4',
  49.34,
  NULL,
  1,
  NOW()
FROM lich_su_diem_chuan ls
WHERE ls.ma_chuong_trinh = 'GHA26' AND ls.nam = 2026
ON CONFLICT (ma_ls_dc, ma_phuong_thuc) DO UPDATE SET 
  diem = EXCLUDED.diem,
  diem_uu_tien_toi_thieu = EXCLUDED.diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da = EXCLUDED.nguyen_vong_toi_da;
INSERT INTO diem_trung_tuyen (
  ma_diem_tt,
  ma_ls_dc,
  ma_phuong_thuc,
  diem,
  diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da,
  create_at
)
SELECT
  'DTT-GHA27-2026-PT1',
  ls.ma_ls_dc,
  'PT1',
  22.23,
  NULL,
  1,
  NOW()
FROM lich_su_diem_chuan ls
WHERE ls.ma_chuong_trinh = 'GHA27' AND ls.nam = 2026
ON CONFLICT (ma_ls_dc, ma_phuong_thuc) DO UPDATE SET 
  diem = EXCLUDED.diem,
  diem_uu_tien_toi_thieu = EXCLUDED.diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da = EXCLUDED.nguyen_vong_toi_da;
INSERT INTO diem_trung_tuyen (
  ma_diem_tt,
  ma_ls_dc,
  ma_phuong_thuc,
  diem,
  diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da,
  create_at
)
SELECT
  'DTT-GHA27-2026-PT2',
  ls.ma_ls_dc,
  'PT2',
  26.32,
  NULL,
  1,
  NOW()
FROM lich_su_diem_chuan ls
WHERE ls.ma_chuong_trinh = 'GHA27' AND ls.nam = 2026
ON CONFLICT (ma_ls_dc, ma_phuong_thuc) DO UPDATE SET 
  diem = EXCLUDED.diem,
  diem_uu_tien_toi_thieu = EXCLUDED.diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da = EXCLUDED.nguyen_vong_toi_da;
INSERT INTO diem_trung_tuyen (
  ma_diem_tt,
  ma_ls_dc,
  ma_phuong_thuc,
  diem,
  diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da,
  create_at
)
SELECT
  'DTT-GHA28-2026-PT1',
  ls.ma_ls_dc,
  'PT1',
  23.53,
  NULL,
  10,
  NOW()
FROM lich_su_diem_chuan ls
WHERE ls.ma_chuong_trinh = 'GHA28' AND ls.nam = 2026
ON CONFLICT (ma_ls_dc, ma_phuong_thuc) DO UPDATE SET 
  diem = EXCLUDED.diem,
  diem_uu_tien_toi_thieu = EXCLUDED.diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da = EXCLUDED.nguyen_vong_toi_da;
INSERT INTO diem_trung_tuyen (
  ma_diem_tt,
  ma_ls_dc,
  ma_phuong_thuc,
  diem,
  diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da,
  create_at
)
SELECT
  'DTT-GHA28-2026-PT2',
  ls.ma_ls_dc,
  'PT2',
  27,
  NULL,
  10,
  NOW()
FROM lich_su_diem_chuan ls
WHERE ls.ma_chuong_trinh = 'GHA28' AND ls.nam = 2026
ON CONFLICT (ma_ls_dc, ma_phuong_thuc) DO UPDATE SET 
  diem = EXCLUDED.diem,
  diem_uu_tien_toi_thieu = EXCLUDED.diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da = EXCLUDED.nguyen_vong_toi_da;
INSERT INTO diem_trung_tuyen (
  ma_diem_tt,
  ma_ls_dc,
  ma_phuong_thuc,
  diem,
  diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da,
  create_at
)
SELECT
  'DTT-GHA28-2026-PT4',
  ls.ma_ls_dc,
  'PT4',
  53.78,
  NULL,
  10,
  NOW()
FROM lich_su_diem_chuan ls
WHERE ls.ma_chuong_trinh = 'GHA28' AND ls.nam = 2026
ON CONFLICT (ma_ls_dc, ma_phuong_thuc) DO UPDATE SET 
  diem = EXCLUDED.diem,
  diem_uu_tien_toi_thieu = EXCLUDED.diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da = EXCLUDED.nguyen_vong_toi_da;
INSERT INTO diem_trung_tuyen (
  ma_diem_tt,
  ma_ls_dc,
  ma_phuong_thuc,
  diem,
  diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da,
  create_at
)
SELECT
  'DTT-GHA28QT1-2026-PT1',
  ls.ma_ls_dc,
  'PT1',
  21.56,
  NULL,
  1,
  NOW()
FROM lich_su_diem_chuan ls
WHERE ls.ma_chuong_trinh = 'GHA28QT1' AND ls.nam = 2026
ON CONFLICT (ma_ls_dc, ma_phuong_thuc) DO UPDATE SET 
  diem = EXCLUDED.diem,
  diem_uu_tien_toi_thieu = EXCLUDED.diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da = EXCLUDED.nguyen_vong_toi_da;
INSERT INTO diem_trung_tuyen (
  ma_diem_tt,
  ma_ls_dc,
  ma_phuong_thuc,
  diem,
  diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da,
  create_at
)
SELECT
  'DTT-GHA28QT1-2026-PT2',
  ls.ma_ls_dc,
  'PT2',
  25.92,
  NULL,
  1,
  NOW()
FROM lich_su_diem_chuan ls
WHERE ls.ma_chuong_trinh = 'GHA28QT1' AND ls.nam = 2026
ON CONFLICT (ma_ls_dc, ma_phuong_thuc) DO UPDATE SET 
  diem = EXCLUDED.diem,
  diem_uu_tien_toi_thieu = EXCLUDED.diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da = EXCLUDED.nguyen_vong_toi_da;
INSERT INTO diem_trung_tuyen (
  ma_diem_tt,
  ma_ls_dc,
  ma_phuong_thuc,
  diem,
  diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da,
  create_at
)
SELECT
  'DTT-GHA28QT1-2026-PT3',
  ls.ma_ls_dc,
  'PT3',
  74.45,
  NULL,
  1,
  NOW()
FROM lich_su_diem_chuan ls
WHERE ls.ma_chuong_trinh = 'GHA28QT1' AND ls.nam = 2026
ON CONFLICT (ma_ls_dc, ma_phuong_thuc) DO UPDATE SET 
  diem = EXCLUDED.diem,
  diem_uu_tien_toi_thieu = EXCLUDED.diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da = EXCLUDED.nguyen_vong_toi_da;
INSERT INTO diem_trung_tuyen (
  ma_diem_tt,
  ma_ls_dc,
  ma_phuong_thuc,
  diem,
  diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da,
  create_at
)
SELECT
  'DTT-GHA28QT1-2026-PT4',
  ls.ma_ls_dc,
  'PT4',
  49.47,
  NULL,
  1,
  NOW()
FROM lich_su_diem_chuan ls
WHERE ls.ma_chuong_trinh = 'GHA28QT1' AND ls.nam = 2026
ON CONFLICT (ma_ls_dc, ma_phuong_thuc) DO UPDATE SET 
  diem = EXCLUDED.diem,
  diem_uu_tien_toi_thieu = EXCLUDED.diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da = EXCLUDED.nguyen_vong_toi_da;
INSERT INTO diem_trung_tuyen (
  ma_diem_tt,
  ma_ls_dc,
  ma_phuong_thuc,
  diem,
  diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da,
  create_at
)
SELECT
  'DTT-GHA28QT2-2026-PT1',
  ls.ma_ls_dc,
  'PT1',
  20.26,
  NULL,
  3,
  NOW()
FROM lich_su_diem_chuan ls
WHERE ls.ma_chuong_trinh = 'GHA28QT2' AND ls.nam = 2026
ON CONFLICT (ma_ls_dc, ma_phuong_thuc) DO UPDATE SET 
  diem = EXCLUDED.diem,
  diem_uu_tien_toi_thieu = EXCLUDED.diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da = EXCLUDED.nguyen_vong_toi_da;
INSERT INTO diem_trung_tuyen (
  ma_diem_tt,
  ma_ls_dc,
  ma_phuong_thuc,
  diem,
  diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da,
  create_at
)
SELECT
  'DTT-GHA28QT2-2026-PT2',
  ls.ma_ls_dc,
  'PT2',
  24.88,
  NULL,
  3,
  NOW()
FROM lich_su_diem_chuan ls
WHERE ls.ma_chuong_trinh = 'GHA28QT2' AND ls.nam = 2026
ON CONFLICT (ma_ls_dc, ma_phuong_thuc) DO UPDATE SET 
  diem = EXCLUDED.diem,
  diem_uu_tien_toi_thieu = EXCLUDED.diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da = EXCLUDED.nguyen_vong_toi_da;
INSERT INTO diem_trung_tuyen (
  ma_diem_tt,
  ma_ls_dc,
  ma_phuong_thuc,
  diem,
  diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da,
  create_at
)
SELECT
  'DTT-GHA28QT2-2026-PT3',
  ls.ma_ls_dc,
  'PT3',
  70.18,
  NULL,
  3,
  NOW()
FROM lich_su_diem_chuan ls
WHERE ls.ma_chuong_trinh = 'GHA28QT2' AND ls.nam = 2026
ON CONFLICT (ma_ls_dc, ma_phuong_thuc) DO UPDATE SET 
  diem = EXCLUDED.diem,
  diem_uu_tien_toi_thieu = EXCLUDED.diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da = EXCLUDED.nguyen_vong_toi_da;
INSERT INTO diem_trung_tuyen (
  ma_diem_tt,
  ma_ls_dc,
  ma_phuong_thuc,
  diem,
  diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da,
  create_at
)
SELECT
  'DTT-GHA28QT2-2026-PT4',
  ls.ma_ls_dc,
  'PT4',
  46.93,
  NULL,
  3,
  NOW()
FROM lich_su_diem_chuan ls
WHERE ls.ma_chuong_trinh = 'GHA28QT2' AND ls.nam = 2026
ON CONFLICT (ma_ls_dc, ma_phuong_thuc) DO UPDATE SET 
  diem = EXCLUDED.diem,
  diem_uu_tien_toi_thieu = EXCLUDED.diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da = EXCLUDED.nguyen_vong_toi_da;
INSERT INTO diem_trung_tuyen (
  ma_diem_tt,
  ma_ls_dc,
  ma_phuong_thuc,
  diem,
  diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da,
  create_at
)
SELECT
  'DTT-GHA29-2026-PT1',
  ls.ma_ls_dc,
  'PT1',
  22.82,
  NULL,
  6,
  NOW()
FROM lich_su_diem_chuan ls
WHERE ls.ma_chuong_trinh = 'GHA29' AND ls.nam = 2026
ON CONFLICT (ma_ls_dc, ma_phuong_thuc) DO UPDATE SET 
  diem = EXCLUDED.diem,
  diem_uu_tien_toi_thieu = EXCLUDED.diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da = EXCLUDED.nguyen_vong_toi_da;
INSERT INTO diem_trung_tuyen (
  ma_diem_tt,
  ma_ls_dc,
  ma_phuong_thuc,
  diem,
  diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da,
  create_at
)
SELECT
  'DTT-GHA29-2026-PT2',
  ls.ma_ls_dc,
  'PT2',
  26.63,
  NULL,
  6,
  NOW()
FROM lich_su_diem_chuan ls
WHERE ls.ma_chuong_trinh = 'GHA29' AND ls.nam = 2026
ON CONFLICT (ma_ls_dc, ma_phuong_thuc) DO UPDATE SET 
  diem = EXCLUDED.diem,
  diem_uu_tien_toi_thieu = EXCLUDED.diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da = EXCLUDED.nguyen_vong_toi_da;
INSERT INTO diem_trung_tuyen (
  ma_diem_tt,
  ma_ls_dc,
  ma_phuong_thuc,
  diem,
  diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da,
  create_at
)
SELECT
  'DTT-GHA29-2026-PT4',
  ls.ma_ls_dc,
  'PT4',
  52.21,
  NULL,
  6,
  NOW()
FROM lich_su_diem_chuan ls
WHERE ls.ma_chuong_trinh = 'GHA29' AND ls.nam = 2026
ON CONFLICT (ma_ls_dc, ma_phuong_thuc) DO UPDATE SET 
  diem = EXCLUDED.diem,
  diem_uu_tien_toi_thieu = EXCLUDED.diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da = EXCLUDED.nguyen_vong_toi_da;
INSERT INTO diem_trung_tuyen (
  ma_diem_tt,
  ma_ls_dc,
  ma_phuong_thuc,
  diem,
  diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da,
  create_at
)
SELECT
  'DTT-GHA30-2026-PT1',
  ls.ma_ls_dc,
  'PT1',
  22.76,
  NULL,
  2,
  NOW()
FROM lich_su_diem_chuan ls
WHERE ls.ma_chuong_trinh = 'GHA30' AND ls.nam = 2026
ON CONFLICT (ma_ls_dc, ma_phuong_thuc) DO UPDATE SET 
  diem = EXCLUDED.diem,
  diem_uu_tien_toi_thieu = EXCLUDED.diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da = EXCLUDED.nguyen_vong_toi_da;
INSERT INTO diem_trung_tuyen (
  ma_diem_tt,
  ma_ls_dc,
  ma_phuong_thuc,
  diem,
  diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da,
  create_at
)
SELECT
  'DTT-GHA30-2026-PT2',
  ls.ma_ls_dc,
  'PT2',
  26.6,
  NULL,
  2,
  NOW()
FROM lich_su_diem_chuan ls
WHERE ls.ma_chuong_trinh = 'GHA30' AND ls.nam = 2026
ON CONFLICT (ma_ls_dc, ma_phuong_thuc) DO UPDATE SET 
  diem = EXCLUDED.diem,
  diem_uu_tien_toi_thieu = EXCLUDED.diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da = EXCLUDED.nguyen_vong_toi_da;
INSERT INTO diem_trung_tuyen (
  ma_diem_tt,
  ma_ls_dc,
  ma_phuong_thuc,
  diem,
  diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da,
  create_at
)
SELECT
  'DTT-GHA30-2026-PT4',
  ls.ma_ls_dc,
  'PT4',
  52.08,
  NULL,
  2,
  NOW()
FROM lich_su_diem_chuan ls
WHERE ls.ma_chuong_trinh = 'GHA30' AND ls.nam = 2026
ON CONFLICT (ma_ls_dc, ma_phuong_thuc) DO UPDATE SET 
  diem = EXCLUDED.diem,
  diem_uu_tien_toi_thieu = EXCLUDED.diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da = EXCLUDED.nguyen_vong_toi_da;
INSERT INTO diem_trung_tuyen (
  ma_diem_tt,
  ma_ls_dc,
  ma_phuong_thuc,
  diem,
  diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da,
  create_at
)
SELECT
  'DTT-GHA31-2026-PT1',
  ls.ma_ls_dc,
  'PT1',
  21.88,
  NULL,
  4,
  NOW()
FROM lich_su_diem_chuan ls
WHERE ls.ma_chuong_trinh = 'GHA31' AND ls.nam = 2026
ON CONFLICT (ma_ls_dc, ma_phuong_thuc) DO UPDATE SET 
  diem = EXCLUDED.diem,
  diem_uu_tien_toi_thieu = EXCLUDED.diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da = EXCLUDED.nguyen_vong_toi_da;
INSERT INTO diem_trung_tuyen (
  ma_diem_tt,
  ma_ls_dc,
  ma_phuong_thuc,
  diem,
  diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da,
  create_at
)
SELECT
  'DTT-GHA31-2026-PT2',
  ls.ma_ls_dc,
  'PT2',
  26.14,
  NULL,
  4,
  NOW()
FROM lich_su_diem_chuan ls
WHERE ls.ma_chuong_trinh = 'GHA31' AND ls.nam = 2026
ON CONFLICT (ma_ls_dc, ma_phuong_thuc) DO UPDATE SET 
  diem = EXCLUDED.diem,
  diem_uu_tien_toi_thieu = EXCLUDED.diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da = EXCLUDED.nguyen_vong_toi_da;
INSERT INTO diem_trung_tuyen (
  ma_diem_tt,
  ma_ls_dc,
  ma_phuong_thuc,
  diem,
  diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da,
  create_at
)
SELECT
  'DTT-GHA31-2026-PT4',
  ls.ma_ls_dc,
  'PT4',
  50.17,
  NULL,
  4,
  NOW()
FROM lich_su_diem_chuan ls
WHERE ls.ma_chuong_trinh = 'GHA31' AND ls.nam = 2026
ON CONFLICT (ma_ls_dc, ma_phuong_thuc) DO UPDATE SET 
  diem = EXCLUDED.diem,
  diem_uu_tien_toi_thieu = EXCLUDED.diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da = EXCLUDED.nguyen_vong_toi_da;
INSERT INTO diem_trung_tuyen (
  ma_diem_tt,
  ma_ls_dc,
  ma_phuong_thuc,
  diem,
  diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da,
  create_at
)
SELECT
  'DTT-GHA32-2026-PT1',
  ls.ma_ls_dc,
  'PT1',
  21.31,
  NULL,
  1,
  NOW()
FROM lich_su_diem_chuan ls
WHERE ls.ma_chuong_trinh = 'GHA32' AND ls.nam = 2026
ON CONFLICT (ma_ls_dc, ma_phuong_thuc) DO UPDATE SET 
  diem = EXCLUDED.diem,
  diem_uu_tien_toi_thieu = EXCLUDED.diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da = EXCLUDED.nguyen_vong_toi_da;
INSERT INTO diem_trung_tuyen (
  ma_diem_tt,
  ma_ls_dc,
  ma_phuong_thuc,
  diem,
  diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da,
  create_at
)
SELECT
  'DTT-GHA32-2026-PT2',
  ls.ma_ls_dc,
  'PT2',
  25.72,
  NULL,
  1,
  NOW()
FROM lich_su_diem_chuan ls
WHERE ls.ma_chuong_trinh = 'GHA32' AND ls.nam = 2026
ON CONFLICT (ma_ls_dc, ma_phuong_thuc) DO UPDATE SET 
  diem = EXCLUDED.diem,
  diem_uu_tien_toi_thieu = EXCLUDED.diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da = EXCLUDED.nguyen_vong_toi_da;
INSERT INTO diem_trung_tuyen (
  ma_diem_tt,
  ma_ls_dc,
  ma_phuong_thuc,
  diem,
  diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da,
  create_at
)
SELECT
  'DTT-GHA32-2026-PT4',
  ls.ma_ls_dc,
  'PT4',
  48.93,
  NULL,
  1,
  NOW()
FROM lich_su_diem_chuan ls
WHERE ls.ma_chuong_trinh = 'GHA32' AND ls.nam = 2026
ON CONFLICT (ma_ls_dc, ma_phuong_thuc) DO UPDATE SET 
  diem = EXCLUDED.diem,
  diem_uu_tien_toi_thieu = EXCLUDED.diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da = EXCLUDED.nguyen_vong_toi_da;
INSERT INTO diem_trung_tuyen (
  ma_diem_tt,
  ma_ls_dc,
  ma_phuong_thuc,
  diem,
  diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da,
  create_at
)
SELECT
  'DTT-GHA32DS-2026-PT1',
  ls.ma_ls_dc,
  'PT1',
  23.96,
  NULL,
  3,
  NOW()
FROM lich_su_diem_chuan ls
WHERE ls.ma_chuong_trinh = 'GHA32DS' AND ls.nam = 2026
ON CONFLICT (ma_ls_dc, ma_phuong_thuc) DO UPDATE SET 
  diem = EXCLUDED.diem,
  diem_uu_tien_toi_thieu = EXCLUDED.diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da = EXCLUDED.nguyen_vong_toi_da;
INSERT INTO diem_trung_tuyen (
  ma_diem_tt,
  ma_ls_dc,
  ma_phuong_thuc,
  diem,
  diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da,
  create_at
)
SELECT
  'DTT-GHA32DS-2026-PT2',
  ls.ma_ls_dc,
  'PT2',
  27.22,
  NULL,
  3,
  NOW()
FROM lich_su_diem_chuan ls
WHERE ls.ma_chuong_trinh = 'GHA32DS' AND ls.nam = 2026
ON CONFLICT (ma_ls_dc, ma_phuong_thuc) DO UPDATE SET 
  diem = EXCLUDED.diem,
  diem_uu_tien_toi_thieu = EXCLUDED.diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da = EXCLUDED.nguyen_vong_toi_da;
INSERT INTO diem_trung_tuyen (
  ma_diem_tt,
  ma_ls_dc,
  ma_phuong_thuc,
  diem,
  diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da,
  create_at
)
SELECT
  'DTT-GHA32DS-2026-PT3',
  ls.ma_ls_dc,
  'PT3',
  87.25,
  NULL,
  3,
  NOW()
FROM lich_su_diem_chuan ls
WHERE ls.ma_chuong_trinh = 'GHA32DS' AND ls.nam = 2026
ON CONFLICT (ma_ls_dc, ma_phuong_thuc) DO UPDATE SET 
  diem = EXCLUDED.diem,
  diem_uu_tien_toi_thieu = EXCLUDED.diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da = EXCLUDED.nguyen_vong_toi_da;
INSERT INTO diem_trung_tuyen (
  ma_diem_tt,
  ma_ls_dc,
  ma_phuong_thuc,
  diem,
  diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da,
  create_at
)
SELECT
  'DTT-GHA32DS-2026-PT4',
  ls.ma_ls_dc,
  'PT4',
  55.13,
  NULL,
  3,
  NOW()
FROM lich_su_diem_chuan ls
WHERE ls.ma_chuong_trinh = 'GHA32DS' AND ls.nam = 2026
ON CONFLICT (ma_ls_dc, ma_phuong_thuc) DO UPDATE SET 
  diem = EXCLUDED.diem,
  diem_uu_tien_toi_thieu = EXCLUDED.diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da = EXCLUDED.nguyen_vong_toi_da;
INSERT INTO diem_trung_tuyen (
  ma_diem_tt,
  ma_ls_dc,
  ma_phuong_thuc,
  diem,
  diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da,
  create_at
)
SELECT
  'DTT-GHA32QT1-2026-PT1',
  ls.ma_ls_dc,
  'PT1',
  20.16,
  NULL,
  3,
  NOW()
FROM lich_su_diem_chuan ls
WHERE ls.ma_chuong_trinh = 'GHA32QT1' AND ls.nam = 2026
ON CONFLICT (ma_ls_dc, ma_phuong_thuc) DO UPDATE SET 
  diem = EXCLUDED.diem,
  diem_uu_tien_toi_thieu = EXCLUDED.diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da = EXCLUDED.nguyen_vong_toi_da;
INSERT INTO diem_trung_tuyen (
  ma_diem_tt,
  ma_ls_dc,
  ma_phuong_thuc,
  diem,
  diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da,
  create_at
)
SELECT
  'DTT-GHA32QT1-2026-PT2',
  ls.ma_ls_dc,
  'PT2',
  24.8,
  NULL,
  3,
  NOW()
FROM lich_su_diem_chuan ls
WHERE ls.ma_chuong_trinh = 'GHA32QT1' AND ls.nam = 2026
ON CONFLICT (ma_ls_dc, ma_phuong_thuc) DO UPDATE SET 
  diem = EXCLUDED.diem,
  diem_uu_tien_toi_thieu = EXCLUDED.diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da = EXCLUDED.nguyen_vong_toi_da;
INSERT INTO diem_trung_tuyen (
  ma_diem_tt,
  ma_ls_dc,
  ma_phuong_thuc,
  diem,
  diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da,
  create_at
)
SELECT
  'DTT-GHA32QT1-2026-PT3',
  ls.ma_ls_dc,
  'PT3',
  69.85,
  NULL,
  3,
  NOW()
FROM lich_su_diem_chuan ls
WHERE ls.ma_chuong_trinh = 'GHA32QT1' AND ls.nam = 2026
ON CONFLICT (ma_ls_dc, ma_phuong_thuc) DO UPDATE SET 
  diem = EXCLUDED.diem,
  diem_uu_tien_toi_thieu = EXCLUDED.diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da = EXCLUDED.nguyen_vong_toi_da;
INSERT INTO diem_trung_tuyen (
  ma_diem_tt,
  ma_ls_dc,
  ma_phuong_thuc,
  diem,
  diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da,
  create_at
)
SELECT
  'DTT-GHA32QT1-2026-PT4',
  ls.ma_ls_dc,
  'PT4',
  46.75,
  NULL,
  3,
  NOW()
FROM lich_su_diem_chuan ls
WHERE ls.ma_chuong_trinh = 'GHA32QT1' AND ls.nam = 2026
ON CONFLICT (ma_ls_dc, ma_phuong_thuc) DO UPDATE SET 
  diem = EXCLUDED.diem,
  diem_uu_tien_toi_thieu = EXCLUDED.diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da = EXCLUDED.nguyen_vong_toi_da;
INSERT INTO diem_trung_tuyen (
  ma_diem_tt,
  ma_ls_dc,
  ma_phuong_thuc,
  diem,
  diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da,
  create_at
)
SELECT
  'DTT-GHA32QT2-2026-PT1',
  ls.ma_ls_dc,
  'PT1',
  20.55,
  NULL,
  4,
  NOW()
FROM lich_su_diem_chuan ls
WHERE ls.ma_chuong_trinh = 'GHA32QT2' AND ls.nam = 2026
ON CONFLICT (ma_ls_dc, ma_phuong_thuc) DO UPDATE SET 
  diem = EXCLUDED.diem,
  diem_uu_tien_toi_thieu = EXCLUDED.diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da = EXCLUDED.nguyen_vong_toi_da;
INSERT INTO diem_trung_tuyen (
  ma_diem_tt,
  ma_ls_dc,
  ma_phuong_thuc,
  diem,
  diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da,
  create_at
)
SELECT
  'DTT-GHA32QT2-2026-PT2',
  ls.ma_ls_dc,
  'PT2',
  25.11,
  NULL,
  4,
  NOW()
FROM lich_su_diem_chuan ls
WHERE ls.ma_chuong_trinh = 'GHA32QT2' AND ls.nam = 2026
ON CONFLICT (ma_ls_dc, ma_phuong_thuc) DO UPDATE SET 
  diem = EXCLUDED.diem,
  diem_uu_tien_toi_thieu = EXCLUDED.diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da = EXCLUDED.nguyen_vong_toi_da;
INSERT INTO diem_trung_tuyen (
  ma_diem_tt,
  ma_ls_dc,
  ma_phuong_thuc,
  diem,
  diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da,
  create_at
)
SELECT
  'DTT-GHA32QT2-2026-PT3',
  ls.ma_ls_dc,
  'PT3',
  71.13,
  NULL,
  4,
  NOW()
FROM lich_su_diem_chuan ls
WHERE ls.ma_chuong_trinh = 'GHA32QT2' AND ls.nam = 2026
ON CONFLICT (ma_ls_dc, ma_phuong_thuc) DO UPDATE SET 
  diem = EXCLUDED.diem,
  diem_uu_tien_toi_thieu = EXCLUDED.diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da = EXCLUDED.nguyen_vong_toi_da;
INSERT INTO diem_trung_tuyen (
  ma_diem_tt,
  ma_ls_dc,
  ma_phuong_thuc,
  diem,
  diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da,
  create_at
)
SELECT
  'DTT-GHA32QT2-2026-PT4',
  ls.ma_ls_dc,
  'PT4',
  47.47,
  NULL,
  4,
  NOW()
FROM lich_su_diem_chuan ls
WHERE ls.ma_chuong_trinh = 'GHA32QT2' AND ls.nam = 2026
ON CONFLICT (ma_ls_dc, ma_phuong_thuc) DO UPDATE SET 
  diem = EXCLUDED.diem,
  diem_uu_tien_toi_thieu = EXCLUDED.diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da = EXCLUDED.nguyen_vong_toi_da;
INSERT INTO diem_trung_tuyen (
  ma_diem_tt,
  ma_ls_dc,
  ma_phuong_thuc,
  diem,
  diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da,
  create_at
)
SELECT
  'DTT-GHA32QT3-2026-PT1',
  ls.ma_ls_dc,
  'PT1',
  20,
  NULL,
  5,
  NOW()
FROM lich_su_diem_chuan ls
WHERE ls.ma_chuong_trinh = 'GHA32QT3' AND ls.nam = 2026
ON CONFLICT (ma_ls_dc, ma_phuong_thuc) DO UPDATE SET 
  diem = EXCLUDED.diem,
  diem_uu_tien_toi_thieu = EXCLUDED.diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da = EXCLUDED.nguyen_vong_toi_da;
INSERT INTO diem_trung_tuyen (
  ma_diem_tt,
  ma_ls_dc,
  ma_phuong_thuc,
  diem,
  diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da,
  create_at
)
SELECT
  'DTT-GHA32QT3-2026-PT2',
  ls.ma_ls_dc,
  'PT2',
  24.67,
  NULL,
  5,
  NOW()
FROM lich_su_diem_chuan ls
WHERE ls.ma_chuong_trinh = 'GHA32QT3' AND ls.nam = 2026
ON CONFLICT (ma_ls_dc, ma_phuong_thuc) DO UPDATE SET 
  diem = EXCLUDED.diem,
  diem_uu_tien_toi_thieu = EXCLUDED.diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da = EXCLUDED.nguyen_vong_toi_da;
INSERT INTO diem_trung_tuyen (
  ma_diem_tt,
  ma_ls_dc,
  ma_phuong_thuc,
  diem,
  diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da,
  create_at
)
SELECT
  'DTT-GHA32QT3-2026-PT3',
  ls.ma_ls_dc,
  'PT3',
  69.33,
  NULL,
  5,
  NOW()
FROM lich_su_diem_chuan ls
WHERE ls.ma_chuong_trinh = 'GHA32QT3' AND ls.nam = 2026
ON CONFLICT (ma_ls_dc, ma_phuong_thuc) DO UPDATE SET 
  diem = EXCLUDED.diem,
  diem_uu_tien_toi_thieu = EXCLUDED.diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da = EXCLUDED.nguyen_vong_toi_da;
INSERT INTO diem_trung_tuyen (
  ma_diem_tt,
  ma_ls_dc,
  ma_phuong_thuc,
  diem,
  diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da,
  create_at
)
SELECT
  'DTT-GHA32QT3-2026-PT4',
  ls.ma_ls_dc,
  'PT4',
  46.46,
  NULL,
  5,
  NOW()
FROM lich_su_diem_chuan ls
WHERE ls.ma_chuong_trinh = 'GHA32QT3' AND ls.nam = 2026
ON CONFLICT (ma_ls_dc, ma_phuong_thuc) DO UPDATE SET 
  diem = EXCLUDED.diem,
  diem_uu_tien_toi_thieu = EXCLUDED.diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da = EXCLUDED.nguyen_vong_toi_da;
INSERT INTO diem_trung_tuyen (
  ma_diem_tt,
  ma_ls_dc,
  ma_phuong_thuc,
  diem,
  diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da,
  create_at
)
SELECT
  'DTT-GHA33-2026-PT1',
  ls.ma_ls_dc,
  'PT1',
  24.83,
  NULL,
  3,
  NOW()
FROM lich_su_diem_chuan ls
WHERE ls.ma_chuong_trinh = 'GHA33' AND ls.nam = 2026
ON CONFLICT (ma_ls_dc, ma_phuong_thuc) DO UPDATE SET 
  diem = EXCLUDED.diem,
  diem_uu_tien_toi_thieu = EXCLUDED.diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da = EXCLUDED.nguyen_vong_toi_da;
INSERT INTO diem_trung_tuyen (
  ma_diem_tt,
  ma_ls_dc,
  ma_phuong_thuc,
  diem,
  diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da,
  create_at
)
SELECT
  'DTT-GHA33-2026-PT3',
  ls.ma_ls_dc,
  'PT3',
  92.94,
  NULL,
  3,
  NOW()
FROM lich_su_diem_chuan ls
WHERE ls.ma_chuong_trinh = 'GHA33' AND ls.nam = 2026
ON CONFLICT (ma_ls_dc, ma_phuong_thuc) DO UPDATE SET 
  diem = EXCLUDED.diem,
  diem_uu_tien_toi_thieu = EXCLUDED.diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da = EXCLUDED.nguyen_vong_toi_da;
INSERT INTO diem_trung_tuyen (
  ma_diem_tt,
  ma_ls_dc,
  ma_phuong_thuc,
  diem,
  diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da,
  create_at
)
SELECT
  'DTT-GHA33-2026-PT4',
  ls.ma_ls_dc,
  'PT4',
  57.87,
  NULL,
  3,
  NOW()
FROM lich_su_diem_chuan ls
WHERE ls.ma_chuong_trinh = 'GHA33' AND ls.nam = 2026
ON CONFLICT (ma_ls_dc, ma_phuong_thuc) DO UPDATE SET 
  diem = EXCLUDED.diem,
  diem_uu_tien_toi_thieu = EXCLUDED.diem_uu_tien_toi_thieu,
  nguyen_vong_toi_da = EXCLUDED.nguyen_vong_toi_da;

COMMIT;

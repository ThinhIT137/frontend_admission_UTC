-- CreateEnum
CREATE TYPE "loai_bang_diem" AS ENUM ('lop_10', 'lop_11', 'lop_12', 'tnTHPT');

-- CreateEnum
CREATE TYPE "hang_giai_thuong" AS ENUM ('giai_nhat', 'giai_nhi', 'giai_ba', 'khuyen_khich');

-- CreateEnum
CREATE TYPE "cap_giai_thuong" AS ENUM ('toan_quoc', 'tinh', 'mien_bac', 'mien_nam');

-- CreateEnum
CREATE TYPE "mon_hoc_enum" AS ENUM ('toan', 'van', 'anh', 'vat_ly', 'hoa_hoc', 'sinh_hoc', 'dia_ly', 'lich_su', 'gdcd', 'tin_hoc');

-- CreateEnum
CREATE TYPE "trang_thai_duyet" AS ENUM ('cho', 'hop_le', 'tu_choi');

-- CreateEnum
CREATE TYPE "vai_tro_admin" AS ENUM ('super_admin', 'chuyen_vien');

-- CreateEnum
CREATE TYPE "nguon_du_lieu" AS ENUM ('tu_nop', 'dong_bo_bo');

-- CreateTable
CREATE TABLE "admin" (
    "ma_admin" TEXT NOT NULL,
    "ho_ten" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "mat_khau" TEXT NOT NULL,
    "vai_tro" "vai_tro_admin" NOT NULL,
    "create_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "admin_pkey" PRIMARY KEY ("ma_admin")
);

-- CreateTable
CREATE TABLE "thi_sinh" (
    "cccd" VARCHAR(12) NOT NULL,
    "ho_ten" TEXT NOT NULL,
    "so_dien_thoai" TEXT NOT NULL,
    "khu_vuc" TEXT,
    "doi_tuong_uu_tien" TEXT,
    "diem_uu_tien_he_thong" DOUBLE PRECISION DEFAULT 0,
    "create_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "thi_sinh_pkey" PRIMARY KEY ("cccd")
);

-- CreateTable
CREATE TABLE "giai_thuong" (
    "ma_giai_thuong" TEXT NOT NULL,
    "cccd" VARCHAR(12) NOT NULL,
    "giai_thuong" "hang_giai_thuong" NOT NULL,
    "loai_giai_thuong" "cap_giai_thuong" NOT NULL,
    "mon_hoc" "mon_hoc_enum" NOT NULL,

    CONSTRAINT "giai_thuong_pkey" PRIMARY KEY ("ma_giai_thuong")
);

-- CreateTable
CREATE TABLE "chung_chi" (
    "ma_chung_chi" TEXT NOT NULL,
    "cccd" VARCHAR(12) NOT NULL,
    "loai_chung_chi" TEXT NOT NULL,
    "diem_hoac_hang" TEXT NOT NULL,
    "ngay_cap" DATE,
    "ngay_het_han" DATE,
    "file_dinh_kem" TEXT NOT NULL,
    "trang_thai_duyet" "trang_thai_duyet" NOT NULL DEFAULT 'cho',
    "create_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chung_chi_pkey" PRIMARY KEY ("ma_chung_chi")
);

-- CreateTable
CREATE TABLE "danh_muc_mon_hoc" (
    "ma_mon" TEXT NOT NULL,
    "ten_mon" TEXT NOT NULL,

    CONSTRAINT "danh_muc_mon_hoc_pkey" PRIMARY KEY ("ma_mon")
);

-- CreateTable
CREATE TABLE "bang_diem" (
    "ma_bang_diem" TEXT NOT NULL,
    "cccd" VARCHAR(12) NOT NULL,
    "loai_diem" "loai_bang_diem" NOT NULL,
    "nam_hoc" INTEGER NOT NULL,

    CONSTRAINT "bang_diem_pkey" PRIMARY KEY ("ma_bang_diem")
);

-- CreateTable
CREATE TABLE "diem_chi_tiet" (
    "ma_chi_tiet" TEXT NOT NULL,
    "ma_bang_diem" TEXT NOT NULL,
    "ma_mon" TEXT NOT NULL,
    "diem_so" DOUBLE PRECISION,

    CONSTRAINT "diem_chi_tiet_pkey" PRIMARY KEY ("ma_chi_tiet")
);

-- CreateTable
CREATE TABLE "to_hop_xet_tuyen" (
    "ma_to_hop" TEXT NOT NULL,
    "ma_mon_1" TEXT NOT NULL,
    "ma_mon_2" TEXT NOT NULL,
    "ma_mon_3" TEXT NOT NULL,

    CONSTRAINT "to_hop_xet_tuyen_pkey" PRIMARY KEY ("ma_to_hop")
);

-- CreateTable
CREATE TABLE "diem_to_hop" (
    "ma_diem_to_hop" TEXT NOT NULL,
    "cccd" VARCHAR(12) NOT NULL,
    "ma_bang_diem" TEXT NOT NULL,
    "ma_to_hop" TEXT NOT NULL,
    "tong_diem_goc" DOUBLE PRECISION NOT NULL,
    "create_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "diem_to_hop_pkey" PRIMARY KEY ("ma_diem_to_hop")
);

-- CreateTable
CREATE TABLE "nganh_hoc" (
    "ma_nganh" TEXT NOT NULL,
    "ten_nganh" TEXT NOT NULL,
    "khoi_kien_thuc" TEXT,
    "ma_admin_quan_ly" TEXT NOT NULL,
    "create_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "nganh_hoc_pkey" PRIMARY KEY ("ma_nganh")
);

-- CreateTable
CREATE TABLE "chuong_trinh_dao_tao" (
    "ma_chuong_trinh" TEXT NOT NULL,
    "ma_nganh" TEXT NOT NULL,
    "ten_chuong_trinh" TEXT NOT NULL,
    "de_cuong" TEXT,
    "chuan_dau_ra" TEXT,
    "ma_admin_quan_ly" TEXT NOT NULL,
    "create_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chuong_trinh_dao_tao_pkey" PRIMARY KEY ("ma_chuong_trinh")
);

-- CreateTable
CREATE TABLE "ctdt_to_hop" (
    "ma_ctdt_to_hop" TEXT NOT NULL,
    "ma_chuong_trinh" TEXT NOT NULL,
    "ma_to_hop" TEXT NOT NULL,
    "nam" INTEGER NOT NULL,

    CONSTRAINT "ctdt_to_hop_pkey" PRIMARY KEY ("ma_ctdt_to_hop")
);

-- CreateTable
CREATE TABLE "phuong_thuc_xet_tuyen" (
    "ma_phuong_thuc" TEXT NOT NULL,
    "ten_phuong_thuc" TEXT NOT NULL,

    CONSTRAINT "phuong_thuc_xet_tuyen_pkey" PRIMARY KEY ("ma_phuong_thuc")
);

-- CreateTable
CREATE TABLE "lich_su_diem_chuan" (
    "ma_ls_dc" TEXT NOT NULL,
    "ma_chuong_trinh" TEXT NOT NULL,
    "nam" INTEGER NOT NULL,
    "chi_tieu" INTEGER NOT NULL,
    "trung_tuyen" INTEGER,
    "ma_admin_cap_nhat" TEXT NOT NULL,
    "create_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lich_su_diem_chuan_pkey" PRIMARY KEY ("ma_ls_dc")
);

-- CreateTable
CREATE TABLE "diem_trung_tuyen" (
    "ma_diem_tt" TEXT NOT NULL,
    "ma_ls_dc" TEXT NOT NULL,
    "ma_phuong_thuc" TEXT NOT NULL,
    "diem" DOUBLE PRECISION NOT NULL,
    "create_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "diem_trung_tuyen_pkey" PRIMARY KEY ("ma_diem_tt")
);

-- CreateTable
CREATE TABLE "du_doan_diem_chuan" (
    "ma_du_doan_dc" TEXT NOT NULL,
    "ma_chuong_trinh" TEXT NOT NULL,
    "nam_du_doan" INTEGER NOT NULL,
    "diem_du_doan" DOUBLE PRECISION NOT NULL,
    "ngay_tinh_toan" TIMESTAMP(3) NOT NULL,
    "create_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "du_doan_diem_chuan_pkey" PRIMARY KEY ("ma_du_doan_dc")
);

-- CreateTable
CREATE TABLE "nguyen_vong_sinh_vien" (
    "ma_ho_so" TEXT NOT NULL,
    "cccd" VARCHAR(12) NOT NULL,
    "ma_chuong_trinh" TEXT NOT NULL,
    "trang_thai" "trang_thai_duyet" NOT NULL DEFAULT 'cho',
    "ket_qua" TEXT,
    "diem_uu_tien_ap_dung" DOUBLE PRECISION,
    "tong_diem_xet_tuyen" DOUBLE PRECISION,
    "ma_to_hop" TEXT,
    "ma_phuong_thuc" TEXT NOT NULL,
    "nguon_du_lieu" "nguon_du_lieu" NOT NULL,
    "nguyen_vong" INTEGER NOT NULL,
    "nam_tuyen_sinh" INTEGER NOT NULL,
    "ma_admin_xu_ly" TEXT,
    "create_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "nguyen_vong_sinh_vien_pkey" PRIMARY KEY ("ma_ho_so")
);

-- CreateTable
CREATE TABLE "ket_qua_trac_nghiem" (
    "ma_ket_qua" TEXT NOT NULL,
    "cccd" VARCHAR(12),
    "session_id" TEXT NOT NULL,
    "nhom_tinh_cach" TEXT,
    "goi_y_nganh" TEXT,
    "thoi_gian_thuc_hien" TIMESTAMP(3) NOT NULL,
    "create_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ket_qua_trac_nghiem_pkey" PRIMARY KEY ("ma_ket_qua")
);

-- CreateTable
CREATE TABLE "tri_thuc_ai" (
    "ma_tri_thuc" TEXT NOT NULL,
    "chu_de" TEXT NOT NULL,
    "cau_hoi_mau" TEXT,
    "noi_dung" TEXT NOT NULL,
    "trang_thai" TEXT NOT NULL DEFAULT 'active',
    "ma_admin_phu_trach" TEXT NOT NULL,
    "create_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tri_thuc_ai_pkey" PRIMARY KEY ("ma_tri_thuc")
);

-- CreateTable
CREATE TABLE "trang_noi_dung" (
    "ma_bai_viet" TEXT NOT NULL,
    "tieu_de" TEXT NOT NULL,
    "noi_dung_html" TEXT NOT NULL,
    "chuyen_muc" TEXT NOT NULL,
    "ma_admin_tac_gia" TEXT NOT NULL,
    "ngay_dang" TIMESTAMP(3),

    CONSTRAINT "trang_noi_dung_pkey" PRIMARY KEY ("ma_bai_viet")
);

-- CreateTable
CREATE TABLE "lo_trinh_tuyen_sinh" (
    "ma_su_kien" TEXT NOT NULL,
    "ten_su_kien" TEXT NOT NULL,
    "thoi_gian_bat_dau" TIMESTAMP(3) NOT NULL,
    "thoi_gian_ket_thuc" TIMESTAMP(3),
    "ghi_chu" TEXT,
    "ma_admin_cap_nhat" TEXT NOT NULL,

    CONSTRAINT "lo_trinh_tuyen_sinh_pkey" PRIMARY KEY ("ma_su_kien")
);

-- CreateIndex
CREATE UNIQUE INDEX "admin_email_key" ON "admin"("email");

-- CreateIndex
CREATE UNIQUE INDEX "thi_sinh_so_dien_thoai_key" ON "thi_sinh"("so_dien_thoai");

-- CreateIndex
CREATE INDEX "giai_thuong_cccd_idx" ON "giai_thuong"("cccd");

-- CreateIndex
CREATE INDEX "chung_chi_cccd_idx" ON "chung_chi"("cccd");

-- CreateIndex
CREATE INDEX "bang_diem_cccd_idx" ON "bang_diem"("cccd");

-- CreateIndex
CREATE UNIQUE INDEX "diem_chi_tiet_ma_bang_diem_ma_mon_key" ON "diem_chi_tiet"("ma_bang_diem", "ma_mon");

-- CreateIndex
CREATE INDEX "diem_to_hop_cccd_idx" ON "diem_to_hop"("cccd");

-- CreateIndex
CREATE UNIQUE INDEX "diem_to_hop_ma_bang_diem_ma_to_hop_key" ON "diem_to_hop"("ma_bang_diem", "ma_to_hop");

-- CreateIndex
CREATE INDEX "chuong_trinh_dao_tao_ma_nganh_idx" ON "chuong_trinh_dao_tao"("ma_nganh");

-- CreateIndex
CREATE UNIQUE INDEX "ctdt_to_hop_ma_chuong_trinh_ma_to_hop_nam_key" ON "ctdt_to_hop"("ma_chuong_trinh", "ma_to_hop", "nam");

-- CreateIndex
CREATE UNIQUE INDEX "lich_su_diem_chuan_ma_chuong_trinh_nam_key" ON "lich_su_diem_chuan"("ma_chuong_trinh", "nam");

-- CreateIndex
CREATE UNIQUE INDEX "diem_trung_tuyen_ma_ls_dc_ma_phuong_thuc_key" ON "diem_trung_tuyen"("ma_ls_dc", "ma_phuong_thuc");

-- CreateIndex
CREATE INDEX "du_doan_diem_chuan_ma_chuong_trinh_nam_du_doan_idx" ON "du_doan_diem_chuan"("ma_chuong_trinh", "nam_du_doan");

-- CreateIndex
CREATE INDEX "nguyen_vong_sinh_vien_cccd_nam_tuyen_sinh_idx" ON "nguyen_vong_sinh_vien"("cccd", "nam_tuyen_sinh");

-- CreateIndex
CREATE INDEX "nguyen_vong_sinh_vien_ma_chuong_trinh_nam_tuyen_sinh_idx" ON "nguyen_vong_sinh_vien"("ma_chuong_trinh", "nam_tuyen_sinh");

-- CreateIndex
CREATE INDEX "ket_qua_trac_nghiem_cccd_idx" ON "ket_qua_trac_nghiem"("cccd");

-- CreateIndex
CREATE INDEX "ket_qua_trac_nghiem_session_id_idx" ON "ket_qua_trac_nghiem"("session_id");

-- AddForeignKey
ALTER TABLE "giai_thuong" ADD CONSTRAINT "giai_thuong_cccd_fkey" FOREIGN KEY ("cccd") REFERENCES "thi_sinh"("cccd") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chung_chi" ADD CONSTRAINT "chung_chi_cccd_fkey" FOREIGN KEY ("cccd") REFERENCES "thi_sinh"("cccd") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bang_diem" ADD CONSTRAINT "bang_diem_cccd_fkey" FOREIGN KEY ("cccd") REFERENCES "thi_sinh"("cccd") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "diem_chi_tiet" ADD CONSTRAINT "diem_chi_tiet_ma_bang_diem_fkey" FOREIGN KEY ("ma_bang_diem") REFERENCES "bang_diem"("ma_bang_diem") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "diem_chi_tiet" ADD CONSTRAINT "diem_chi_tiet_ma_mon_fkey" FOREIGN KEY ("ma_mon") REFERENCES "danh_muc_mon_hoc"("ma_mon") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "to_hop_xet_tuyen" ADD CONSTRAINT "to_hop_xet_tuyen_ma_mon_1_fkey" FOREIGN KEY ("ma_mon_1") REFERENCES "danh_muc_mon_hoc"("ma_mon") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "to_hop_xet_tuyen" ADD CONSTRAINT "to_hop_xet_tuyen_ma_mon_2_fkey" FOREIGN KEY ("ma_mon_2") REFERENCES "danh_muc_mon_hoc"("ma_mon") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "to_hop_xet_tuyen" ADD CONSTRAINT "to_hop_xet_tuyen_ma_mon_3_fkey" FOREIGN KEY ("ma_mon_3") REFERENCES "danh_muc_mon_hoc"("ma_mon") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "diem_to_hop" ADD CONSTRAINT "diem_to_hop_cccd_fkey" FOREIGN KEY ("cccd") REFERENCES "thi_sinh"("cccd") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "diem_to_hop" ADD CONSTRAINT "diem_to_hop_ma_bang_diem_fkey" FOREIGN KEY ("ma_bang_diem") REFERENCES "bang_diem"("ma_bang_diem") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "diem_to_hop" ADD CONSTRAINT "diem_to_hop_ma_to_hop_fkey" FOREIGN KEY ("ma_to_hop") REFERENCES "to_hop_xet_tuyen"("ma_to_hop") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nganh_hoc" ADD CONSTRAINT "nganh_hoc_ma_admin_quan_ly_fkey" FOREIGN KEY ("ma_admin_quan_ly") REFERENCES "admin"("ma_admin") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chuong_trinh_dao_tao" ADD CONSTRAINT "chuong_trinh_dao_tao_ma_nganh_fkey" FOREIGN KEY ("ma_nganh") REFERENCES "nganh_hoc"("ma_nganh") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chuong_trinh_dao_tao" ADD CONSTRAINT "chuong_trinh_dao_tao_ma_admin_quan_ly_fkey" FOREIGN KEY ("ma_admin_quan_ly") REFERENCES "admin"("ma_admin") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ctdt_to_hop" ADD CONSTRAINT "ctdt_to_hop_ma_chuong_trinh_fkey" FOREIGN KEY ("ma_chuong_trinh") REFERENCES "chuong_trinh_dao_tao"("ma_chuong_trinh") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ctdt_to_hop" ADD CONSTRAINT "ctdt_to_hop_ma_to_hop_fkey" FOREIGN KEY ("ma_to_hop") REFERENCES "to_hop_xet_tuyen"("ma_to_hop") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lich_su_diem_chuan" ADD CONSTRAINT "lich_su_diem_chuan_ma_chuong_trinh_fkey" FOREIGN KEY ("ma_chuong_trinh") REFERENCES "chuong_trinh_dao_tao"("ma_chuong_trinh") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lich_su_diem_chuan" ADD CONSTRAINT "lich_su_diem_chuan_ma_admin_cap_nhat_fkey" FOREIGN KEY ("ma_admin_cap_nhat") REFERENCES "admin"("ma_admin") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "diem_trung_tuyen" ADD CONSTRAINT "diem_trung_tuyen_ma_ls_dc_fkey" FOREIGN KEY ("ma_ls_dc") REFERENCES "lich_su_diem_chuan"("ma_ls_dc") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "diem_trung_tuyen" ADD CONSTRAINT "diem_trung_tuyen_ma_phuong_thuc_fkey" FOREIGN KEY ("ma_phuong_thuc") REFERENCES "phuong_thuc_xet_tuyen"("ma_phuong_thuc") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "du_doan_diem_chuan" ADD CONSTRAINT "du_doan_diem_chuan_ma_chuong_trinh_fkey" FOREIGN KEY ("ma_chuong_trinh") REFERENCES "chuong_trinh_dao_tao"("ma_chuong_trinh") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nguyen_vong_sinh_vien" ADD CONSTRAINT "nguyen_vong_sinh_vien_cccd_fkey" FOREIGN KEY ("cccd") REFERENCES "thi_sinh"("cccd") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nguyen_vong_sinh_vien" ADD CONSTRAINT "nguyen_vong_sinh_vien_ma_chuong_trinh_fkey" FOREIGN KEY ("ma_chuong_trinh") REFERENCES "chuong_trinh_dao_tao"("ma_chuong_trinh") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nguyen_vong_sinh_vien" ADD CONSTRAINT "nguyen_vong_sinh_vien_ma_to_hop_fkey" FOREIGN KEY ("ma_to_hop") REFERENCES "to_hop_xet_tuyen"("ma_to_hop") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nguyen_vong_sinh_vien" ADD CONSTRAINT "nguyen_vong_sinh_vien_ma_phuong_thuc_fkey" FOREIGN KEY ("ma_phuong_thuc") REFERENCES "phuong_thuc_xet_tuyen"("ma_phuong_thuc") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nguyen_vong_sinh_vien" ADD CONSTRAINT "nguyen_vong_sinh_vien_ma_admin_xu_ly_fkey" FOREIGN KEY ("ma_admin_xu_ly") REFERENCES "admin"("ma_admin") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ket_qua_trac_nghiem" ADD CONSTRAINT "ket_qua_trac_nghiem_cccd_fkey" FOREIGN KEY ("cccd") REFERENCES "thi_sinh"("cccd") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tri_thuc_ai" ADD CONSTRAINT "tri_thuc_ai_ma_admin_phu_trach_fkey" FOREIGN KEY ("ma_admin_phu_trach") REFERENCES "admin"("ma_admin") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trang_noi_dung" ADD CONSTRAINT "trang_noi_dung_ma_admin_tac_gia_fkey" FOREIGN KEY ("ma_admin_tac_gia") REFERENCES "admin"("ma_admin") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lo_trinh_tuyen_sinh" ADD CONSTRAINT "lo_trinh_tuyen_sinh_ma_admin_cap_nhat_fkey" FOREIGN KEY ("ma_admin_cap_nhat") REFERENCES "admin"("ma_admin") ON DELETE RESTRICT ON UPDATE CASCADE;

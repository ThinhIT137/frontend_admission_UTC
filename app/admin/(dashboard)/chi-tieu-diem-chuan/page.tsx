import { getChiTieuAction } from "@/actions/chi_tieu.action";
import ChiTieuClient from "./ChiTieuClient";
import prisma from "@/libs/prisma";

export const metadata = {
  title: "Thiết Lập Chỉ Tiêu & Điểm Chuẩn",
  description: "Quản lý chỉ tiêu sinh viên đầu vào và điểm chuẩn các năm",
};

export default async function ChiTieuDiemChuanPage(props: { searchParams: Promise<{ year?: string }> }) {
  const searchParams = await props.searchParams;
  const currentYear = new Date().getFullYear();
  const year = searchParams.year ? parseInt(searchParams.year) : currentYear;

  const data = await getChiTieuAction(year);
  
  // Fetch programs and methods for creation form
  const programs = await prisma.chuongTrinhDaoTao.findMany({
    orderBy: { ten_chuong_trinh: "asc" },
    select: { ma_chuong_trinh: true, ten_chuong_trinh: true }
  });
  
  const methods = await prisma.phuongThucXetTuyen.findMany({
    orderBy: { ma_phuong_thuc: "asc" },
    select: { ma_phuong_thuc: true, ten_phuong_thuc: true }
  });

  return (
    <div className="p-6">
      <ChiTieuClient 
        initialData={data} 
        programs={programs} 
        methods={methods} 
        currentYear={year} 
      />
    </div>
  );
}

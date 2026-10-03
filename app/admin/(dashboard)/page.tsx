import prisma from "@/libs/prisma";
import Link from "next/link";
import { AdminStatCard } from "@/components/admin/AdminStatCard";

export const metadata = {
  title: "Tổng Quan Quản Trị Tuyển Sinh | UTC Admin",
};

export const revalidate = 0; // Realtime data on each request

export default async function AdminDashboardPage() {
  let stats = {
    totalMajors: 0,
    totalPrograms: 0,
    totalMethods: 0,
    totalCombinations: 0,
    totalAiKb: 0,
    totalArticles: 0,
    totalFaculties: 0,
    totalMilestones: 0,
  };

  try {
    const [
      majorsCount,
      programsCount,
      methodsCount,
      combinationsCount,
      aiKbCount,
      articlesCount,
      facultiesCount,
      milestonesCount,
    ] = await Promise.all([
      prisma.nganhHoc.count(),
      prisma.chuongTrinhDaoTao.count(),
      prisma.phuongThucXetTuyen.count(),
      prisma.toHopXetTuyen.count(),
      prisma.triThucAi.count().catch(() => 0),
      prisma.trangNoiDung.count().catch(() => 0),
      prisma.khoiNganh.count(),
      prisma.loTrinhTuyenSinh.count().catch(() => 0),
    ]);

    stats = {
      totalMajors: majorsCount,
      totalPrograms: programsCount,
      totalMethods: methodsCount,
      totalCombinations: combinationsCount,
      totalAiKb: aiKbCount,
      totalArticles: articlesCount,
      totalFaculties: facultiesCount,
      totalMilestones: milestonesCount,
    };
  } catch (error) {
    console.error("Lỗi truy vấn số liệu thống kê realtime từ DB:", error);
  }

  return (
    <div className="flex flex-col w-full space-y-6 pt-4 pb-12">
      {/* Top Header Title */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#e9e2d5] pb-4">
        <div>
          <div className="inline-block px-2.5 py-0.5 rounded bg-[#fdb712] text-[#0d1b4e] font-stamp text-[11px] font-bold uppercase mb-2">
            Hội đồng Tuyển sinh UTC
          </div>
          <h1 className="font-display font-black text-[32px] text-[#0d1b4e] leading-tight tracking-tight">
            Tổng Quan Chỉ Số Vận Hành Tuyển Sinh
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-2 bg-[#0d1b4e] text-[#fdb712] hover:bg-[#1a2c6d] px-5 py-2.5 rounded-xl font-extrabold text-[13px] shadow transition-all hover:scale-[1.02] active:scale-95"
          >
            <span className="material-symbols-outlined text-[18px]">open_in_new</span>
            Xem Trang Thí Sinh
          </Link>
        </div>
      </div>

      {/* 6 Key Stat Cards with Real Database Counts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <AdminStatCard
          title="Ngành Học"
          value={stats.totalMajors}
          subtitle="Ngành đang tuyển sinh"
          icon="school"
          progressPercent={100}
        />
        <AdminStatCard
          title="Chương Trình ĐT"
          value={stats.totalPrograms}
          subtitle="CTĐT chính quy & CLC"
          icon="menu_book"
          progressPercent={100}
          accentBg="bg-[#0284c7]"
        />
        <AdminStatCard
          title="Phương Thức"
          value={stats.totalMethods}
          subtitle="Phương thức xét tuyển"
          icon="groups"
          progressPercent={100}
          accentBg="bg-[#15803d]"
        />
        <AdminStatCard
          title="Tổ Hợp Xét Tuyển"
          value={stats.totalCombinations}
          subtitle="Tổ hợp 3 môn áp dụng"
          icon="trending_up"
          progressPercent={100}
          accentBg="bg-[#7c5800]"
        />
        <AdminStatCard
          title="Tri Thức Chatbot"
          value={stats.totalAiKb}
          subtitle="Bộ tri thức tư vấn AI"
          icon="smart_toy"
          progressPercent={100}
          accentBg="bg-[#9333ea]"
        />
        <AdminStatCard
          title="Tin Tức & Đề Án"
          value={stats.totalArticles}
          subtitle="Văn bản & đề án PDF"
          icon="article"
          progressPercent={100}
          accentBg="bg-[#fdb712]"
        />
      </div>

      {/* Quick Action Hubs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
        <Link
          href="/admin/quan-ly-khoi-nganh"
          className="p-5 bg-white rounded-2xl border border-[#e9e2d5] shadow-xs hover:shadow-md hover:border-[#0d1b4e] transition-all flex items-start justify-between group"
        >
          <div className="space-y-1">
            <div className="w-10 h-10 rounded-xl bg-[#dde1ff] text-[#0d1b4e] flex items-center justify-center group-hover:scale-105 transition-transform">
              <span className="material-symbols-outlined text-[22px]">account_balance</span>
            </div>
            <h4 className="font-display font-bold text-[17px] text-[#0d1b4e] pt-2">
              Quản Lý Khoa / Viện
            </h4>
            <p className="text-[13px] text-[#767680]">
              Cấu hình {stats.totalFaculties > 0 ? `${stats.totalFaculties} ` : ""}khoa, viện và khối ngành đào tạo trực thuộc trường.
            </p>
          </div>
          <span className="material-symbols-outlined text-[#767680] group-hover:text-[#0d1b4e] group-hover:translate-x-1 transition-all">
            arrow_forward
          </span>
        </Link>

        <Link
          href="/admin/quan-ly-nganh-hoc"
          className="p-5 bg-white rounded-2xl border border-[#e9e2d5] shadow-xs hover:shadow-md hover:border-[#0d1b4e] transition-all flex items-start justify-between group"
        >
          <div className="space-y-1">
            <div className="w-10 h-10 rounded-xl bg-[#ffdea8] text-[#7c5800] flex items-center justify-center group-hover:scale-105 transition-transform">
              <span className="material-symbols-outlined text-[22px]">school</span>
            </div>
            <h4 className="font-display font-bold text-[17px] text-[#0d1b4e] pt-2">
              Quản Lý Ngành Học
            </h4>
            <p className="text-[13px] text-[#767680]">
              Danh mục {stats.totalMajors} ngành học, thông tin đề án và khối kiến thức.
            </p>
          </div>
          <span className="material-symbols-outlined text-[#767680] group-hover:text-[#0d1b4e] group-hover:translate-x-1 transition-all">
            arrow_forward
          </span>
        </Link>

        <Link
          href="/admin/chi-tieu-diem-chuan"
          className="p-5 bg-white rounded-2xl border border-[#e9e2d5] shadow-xs hover:shadow-md hover:border-[#0d1b4e] transition-all flex items-start justify-between group"
        >
          <div className="space-y-1">
            <div className="w-10 h-10 rounded-xl bg-[#dcfce7] text-[#15803d] flex items-center justify-center group-hover:scale-105 transition-transform">
              <span className="material-symbols-outlined text-[22px]">assignment_turned_in</span>
            </div>
            <h4 className="font-display font-bold text-[17px] text-[#0d1b4e] pt-2">
              Thiết Lập Chỉ Tiêu & Điểm Chuẩn
            </h4>
            <p className="text-[13px] text-[#767680]">
              Phân bổ chỉ tiêu đầu mùa theo từng ngành và lịch sử điểm trúng tuyển.
            </p>
          </div>
          <span className="material-symbols-outlined text-[#767680] group-hover:text-[#0d1b4e] group-hover:translate-x-1 transition-all">
            arrow_forward
          </span>
        </Link>

        <Link
          href="/admin/to-hop-mon"
          className="p-5 bg-white rounded-2xl border border-[#e9e2d5] shadow-xs hover:shadow-md hover:border-[#0d1b4e] transition-all flex items-start justify-between group"
        >
          <div className="space-y-1">
            <div className="w-10 h-10 rounded-xl bg-[#faf3e6] text-[#0d1b4e] flex items-center justify-center group-hover:scale-105 transition-transform">
              <span className="material-symbols-outlined text-[22px]">category</span>
            </div>
            <h4 className="font-display font-bold text-[17px] text-[#0d1b4e] pt-2">
              Tổ Hợp & Môn Xét Tuyển
            </h4>
            <p className="text-[13px] text-[#767680]">
              Cấu hình {stats.totalCombinations} tổ hợp 3 môn thi (A00, A01, D01...) và ngành áp dụng.
            </p>
          </div>
          <span className="material-symbols-outlined text-[#767680] group-hover:text-[#0d1b4e] group-hover:translate-x-1 transition-all">
            arrow_forward
          </span>
        </Link>

        <Link
          href="/admin/phuong-thuc-xet-tuyen"
          className="p-5 bg-white rounded-2xl border border-[#e9e2d5] shadow-xs hover:shadow-md hover:border-[#0d1b4e] transition-all flex items-start justify-between group"
        >
          <div className="space-y-1">
            <div className="w-10 h-10 rounded-xl bg-[#e0f2fe] text-[#0284c7] flex items-center justify-center group-hover:scale-105 transition-transform">
              <span className="material-symbols-outlined text-[22px]">how_to_reg</span>
            </div>
            <h4 className="font-display font-bold text-[17px] text-[#0d1b4e] pt-2">
              Phương Thức Xét Tuyển
            </h4>
            <p className="text-[13px] text-[#767680]">
              Cấu hình {stats.totalMethods} phương thức tuyển sinh chính thức UTC (THPT, Học bạ, ĐGNL...).
            </p>
          </div>
          <span className="material-symbols-outlined text-[#767680] group-hover:text-[#0d1b4e] group-hover:translate-x-1 transition-all">
            arrow_forward
          </span>
        </Link>

        <Link
          href="/admin/moc-thoi-gian"
          className="p-5 bg-white rounded-2xl border border-[#e9e2d5] shadow-xs hover:shadow-md hover:border-[#0d1b4e] transition-all flex items-start justify-between group"
        >
          <div className="space-y-1">
            <div className="w-10 h-10 rounded-xl bg-[#fee2e2] text-[#ba1a1a] flex items-center justify-center group-hover:scale-105 transition-transform">
              <span className="material-symbols-outlined text-[22px]">calendar_month</span>
            </div>
            <h4 className="font-display font-bold text-[17px] text-[#0d1b4e] pt-2">
              Mốc Thời Gian Lộ Trình
            </h4>
            <p className="text-[13px] text-[#767680]">
              {stats.totalMilestones > 0 ? `${stats.totalMilestones} mốc ` : ""}Kế hoạch xét tuyển sớm, lịch thi và nộp hồ sơ đồng bộ.
            </p>
          </div>
          <span className="material-symbols-outlined text-[#767680] group-hover:text-[#0d1b4e] group-hover:translate-x-1 transition-all">
            arrow_forward
          </span>
        </Link>
      </div>
    </div>
  );
}

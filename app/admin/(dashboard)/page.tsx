import { AdminIcon } from "@/components/admin/AdminIcon";
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
    totalQuota: 0,
    totalBenchmarks: 0,
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
      quotaAggregate,
      benchmarksCount,
    ] = await Promise.all([
      prisma.nganhHoc.count(),
      prisma.chuongTrinhDaoTao.count(),
      prisma.phuongThucXetTuyen.count(),
      prisma.toHopXetTuyen.count(),
      prisma.triThucAi.count().catch(() => 0),
      prisma.trangNoiDung.count().catch(() => 0),
      prisma.khoiNganh.count(),
      prisma.loTrinhTuyenSinh.count().catch(() => 0),
      prisma.lichSuDiemChuan.aggregate({
        where: { nam: 2026 },
        _sum: { chi_tieu: true },
      }).catch(() => ({ _sum: { chi_tieu: 4660 } })),
      prisma.diemTrungTuyen.count().catch(() => 0),
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
      totalQuota: quotaAggregate._sum.chi_tieu || 4660,
      totalBenchmarks: benchmarksCount,
    };
  } catch (error) {
    console.error("Lỗi truy vấn số liệu thống kê realtime từ DB:", error);
  }

  return (
    <div className="flex flex-col w-full space-y-6 pt-4 pb-12">
      {/* Top Header Title */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#e2e8f0] pb-4">
        <div>
          <div className="inline-block px-3 py-1 rounded-lg bg-[#fdb712] text-[#192b59] font-stamp text-[11.5px] font-bold uppercase mb-2 shadow-xs">
            Hội đồng Tuyển sinh UTC
          </div>
          <h1 className="font-display font-black text-[30px] sm:text-[34px] text-[#192b59] leading-tight tracking-tight">
            Tổng Quan Chỉ Số Vận Hành Tuyển Sinh
          </h1>
          <p className="text-[13.5px] text-[#64748b] mt-1">
            Hệ thống quản trị cơ sở dữ liệu tuyển sinh, giám sát chỉ tiêu đào tạo và hỗ trợ quyết định xét tuyển.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/thong-ke"
            className="flex items-center gap-2 bg-[#fdb712] text-[#192b59] hover:bg-[#e5a408] px-4 py-2.5 rounded-xl font-black text-[13px] shadow transition-all hover:scale-[1.02] active:scale-95"
          >
            <AdminIcon name="analytics" className="text-[18px]" />
            Báo Cáo Phân Tích
          </Link>
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-2 bg-[#192b59] text-white hover:bg-[#243c78] px-4 py-2.5 rounded-xl font-bold text-[13px] shadow transition-all hover:scale-[1.02] active:scale-95"
          >
            <AdminIcon name="open_in_new" className="text-[18px]" />
            Trang Thí Sinh
          </Link>
        </div>
      </div>

      {/* 8 Key Stat Cards in a 4-column balanced responsive grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <AdminStatCard
          title="Tổng Chỉ Tiêu K66"
          value={stats.totalQuota.toLocaleString("vi-VN")}
          subtitle="Chỉ tiêu năm 2026 chính quy"
          icon="verified"
          progressPercent={100}
          accentBg="bg-[#ba1a1a]"
        />
        <AdminStatCard
          title="Chương Trình ĐT"
          value={stats.totalPrograms}
          subtitle="109 CTĐT chuẩn & chất lượng cao"
          icon="menu_book"
          progressPercent={100}
          accentBg="bg-[#0284c7]"
        />
        <AdminStatCard
          title="Ngành Đào Tạo"
          value={stats.totalMajors}
          subtitle="69 ngành đào tạo toàn trường"
          icon="school"
          progressPercent={100}
        />
        <AdminStatCard
          title="Dữ Liệu Điểm Chuẩn"
          value={stats.totalBenchmarks}
          subtitle="538 bản ghi trúng tuyển các năm"
          icon="grade"
          progressPercent={100}
          accentBg="bg-[#b45309]"
        />
        <AdminStatCard
          title="Phương Thức Tuyển Sinh"
          value={stats.totalMethods}
          subtitle="5 phương thức chính thức UTC"
          icon="groups"
          progressPercent={100}
          accentBg="bg-[#15803d]"
        />
        <AdminStatCard
          title="Tổ Hợp Xét Tuyển"
          value={stats.totalCombinations}
          subtitle="12 tổ hợp 3 môn áp dụng"
          icon="category"
          progressPercent={100}
          accentBg="bg-[#7c5800]"
        />
        <AdminStatCard
          title="Khoa / Viện Quản Lý"
          value={stats.totalFaculties}
          subtitle="4 khoa/viện đào tạo trực thuộc"
          icon="account_balance"
          progressPercent={100}
          accentBg="bg-[#4338ca]"
        />
        <AdminStatCard
          title="Tri Thức Chatbot AI"
          value={stats.totalAiKb}
          subtitle="132 mục tri thức tư vấn RAG"
          icon="smart_toy"
          progressPercent={100}
          accentBg="bg-[#9333ea]"
        />
      </div>

      {/* Quick Action Hubs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
        <Link
          href="/admin/quan-ly-khoi-nganh"
          className="p-5 bg-white rounded-2xl border border-[#e2e8f0] shadow-xs hover:shadow-md hover:border-[#192b59] transition-all flex items-start justify-between group"
        >
          <div className="space-y-1">
            <div className="w-10 h-10 rounded-xl bg-[#eef2ff] text-[#192b59] flex items-center justify-center group-hover:scale-105 transition-transform">
              <AdminIcon name="account_balance" className="text-[22px]" />
            </div>
            <h4 className="font-display font-bold text-[17px] text-[#192b59] pt-2">
              Quản Lý Khoa / Viện
            </h4>
            <p className="text-[13px] text-[#64748b]">
              Cấu hình {stats.totalFaculties > 0 ? `${stats.totalFaculties} ` : ""}khoa, viện và khối ngành đào tạo trực thuộc trường.
            </p>
          </div>
          <AdminIcon name="arrow_forward" className="text-[#64748b] group-hover:text-[#192b59] group-hover:translate-x-1 transition-all" />
        </Link>

        <Link
          href="/admin/quan-ly-nganh-hoc"
          className="p-5 bg-white rounded-2xl border border-[#e2e8f0] shadow-xs hover:shadow-md hover:border-[#192b59] transition-all flex items-start justify-between group"
        >
          <div className="space-y-1">
            <div className="w-10 h-10 rounded-xl bg-[#ffdea8] text-[#7c5800] flex items-center justify-center group-hover:scale-105 transition-transform">
              <AdminIcon name="school" className="text-[22px]" />
            </div>
            <h4 className="font-display font-bold text-[17px] text-[#192b59] pt-2">
              Quản Lý Ngành Học
            </h4>
            <p className="text-[13px] text-[#64748b]">
              Danh mục {stats.totalMajors} ngành học, thông tin đề án và khối kiến thức.
            </p>
          </div>
          <AdminIcon name="arrow_forward" className="text-[#64748b] group-hover:text-[#192b59] group-hover:translate-x-1 transition-all" />
        </Link>

        <Link
          href="/admin/chi-tieu-diem-chuan"
          className="p-5 bg-white rounded-2xl border border-[#e2e8f0] shadow-xs hover:shadow-md hover:border-[#192b59] transition-all flex items-start justify-between group"
        >
          <div className="space-y-1">
            <div className="w-10 h-10 rounded-xl bg-[#dcfce7] text-[#15803d] flex items-center justify-center group-hover:scale-105 transition-transform">
              <AdminIcon name="assignment_turned_in" className="text-[22px]" />
            </div>
            <h4 className="font-display font-bold text-[17px] text-[#192b59] pt-2">
              Thiết Lập Chỉ Tiêu & Điểm Chuẩn
            </h4>
            <p className="text-[13px] text-[#64748b]">
              Phân bổ chỉ tiêu đầu mùa theo từng ngành và lịch sử điểm trúng tuyển.
            </p>
          </div>
          <AdminIcon name="arrow_forward" className="text-[#64748b] group-hover:text-[#192b59] group-hover:translate-x-1 transition-all" />
        </Link>

        <Link
          href="/admin/to-hop-mon"
          className="p-5 bg-white rounded-2xl border border-[#e2e8f0] shadow-xs hover:shadow-md hover:border-[#192b59] transition-all flex items-start justify-between group"
        >
          <div className="space-y-1">
            <div className="w-10 h-10 rounded-xl bg-[#f8fafc] text-[#192b59] flex items-center justify-center group-hover:scale-105 transition-transform">
              <AdminIcon name="category" className="text-[22px]" />
            </div>
            <h4 className="font-display font-bold text-[17px] text-[#192b59] pt-2">
              Tổ Hợp & Môn Xét Tuyển
            </h4>
            <p className="text-[13px] text-[#64748b]">
              Cấu hình {stats.totalCombinations} tổ hợp 3 môn thi (A00, A01, D01...) và ngành áp dụng.
            </p>
          </div>
          <AdminIcon name="arrow_forward" className="text-[#64748b] group-hover:text-[#192b59] group-hover:translate-x-1 transition-all" />
        </Link>

        <Link
          href="/admin/phuong-thuc-xet-tuyen"
          className="p-5 bg-white rounded-2xl border border-[#e2e8f0] shadow-xs hover:shadow-md hover:border-[#192b59] transition-all flex items-start justify-between group"
        >
          <div className="space-y-1">
            <div className="w-10 h-10 rounded-xl bg-[#e0f2fe] text-[#0284c7] flex items-center justify-center group-hover:scale-105 transition-transform">
              <AdminIcon name="how_to_reg" className="text-[22px]" />
            </div>
            <h4 className="font-display font-bold text-[17px] text-[#192b59] pt-2">
              Phương Thức Xét Tuyển
            </h4>
            <p className="text-[13px] text-[#64748b]">
              Cấu hình {stats.totalMethods} phương thức tuyển sinh chính thức UTC (THPT, Học bạ, ĐGNL...).
            </p>
          </div>
          <AdminIcon name="arrow_forward" className="text-[#64748b] group-hover:text-[#192b59] group-hover:translate-x-1 transition-all" />
        </Link>

        <Link
          href="/admin/moc-thoi-gian"
          className="p-5 bg-white rounded-2xl border border-[#e2e8f0] shadow-xs hover:shadow-md hover:border-[#192b59] transition-all flex items-start justify-between group"
        >
          <div className="space-y-1">
            <div className="w-10 h-10 rounded-xl bg-[#fee2e2] text-[#ba1a1a] flex items-center justify-center group-hover:scale-105 transition-transform">
              <AdminIcon name="calendar_month" className="text-[22px]" />
            </div>
            <h4 className="font-display font-bold text-[17px] text-[#192b59] pt-2">
              Mốc Thời Gian Lộ Trình
            </h4>
            <p className="text-[13px] text-[#64748b]">
              {stats.totalMilestones > 0 ? `${stats.totalMilestones} mốc ` : ""}Kế hoạch xét tuyển sớm, lịch thi và nộp hồ sơ đồng bộ.
            </p>
          </div>
          <AdminIcon name="arrow_forward" className="text-[#64748b] group-hover:text-[#192b59] group-hover:translate-x-1 transition-all" />
        </Link>
      </div>
    </div>
  );
}

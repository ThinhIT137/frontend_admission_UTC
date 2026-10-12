import { prismaPublic } from "@/libs/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DisclaimerBanner } from "@/components/ui/DisclaimerBanner";
import ChiTietNganhClient from "./ChiTietNganhClient";

export const revalidate = 60; // 1 minute ISR

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const decodedId = decodeURIComponent(id);

  try {
    const major = await prismaPublic.nganhHoc.findFirst({
      where: {
        OR: [
          { ma_nganh: decodedId },
          { chuong_trinh: { some: { ma_chuong_trinh: decodedId } } },
        ],
      },
      select: { ten_nganh: true, ma_nganh: true },
    });

    if (major) {
      return {
        title: `Ngành ${major.ten_nganh} (${major.ma_nganh}) | Tuyển Sinh UTC`,
        description: `Thông tin chi tiết ngành ${major.ten_nganh} UTC: mã ngành ${major.ma_nganh}, chương trình đào tạo, tổ hợp xét tuyển, chỉ tiêu và lịch sử điểm chuẩn chính thức.`,
      };
    }
  } catch (e) {
    // fallback
  }

  return {
    title: `Chi Tiết Ngành Học ${decodedId} | Tuyển Sinh UTC`,
  };
}

export default async function MajorDetailPage({ params }: PageProps) {
  const { id } = await params;
  const decodedId = decodeURIComponent(id);

  let majorData: any = null;
  let allRelatedPrograms: any[] = [];
  let combinations: { ma_to_hop: string; ten_mon_1?: string; ten_mon_2?: string; ten_mon_3?: string }[] = [];
  let scoreHistory: any[] = [];

  try {
    // 1. Tìm thông tin ngành (hỗ trợ cả mã ngành và mã chương trình)
    majorData = await prismaPublic.nganhHoc.findFirst({
      where: {
        OR: [
          { ma_nganh: decodedId },
          { chuong_trinh: { some: { ma_chuong_trinh: decodedId } } },
        ],
      },
      include: {
        khoi_nganh: true,
      },
    });

    if (!majorData) {
      // Trường hợp không tìm thấy theo mã ngành, tìm trực tiếp từ chuongTrinhDaoTao
      const ctdt = await prismaPublic.chuongTrinhDaoTao.findUnique({
        where: { ma_chuong_trinh: decodedId },
        include: {
          nganh: {
            include: {
              khoi_nganh: true,
            },
          },
        },
      });

      if (ctdt?.nganh) {
        majorData = ctdt.nganh;
      }
    }

    if (!majorData) {
      notFound();
    }

    // 2. Lấy tất cả chương trình đào tạo của ngành (kể cả liên kết theo tên ngành để lấy cả mã số và mã GHA nếu có)
    const [progDirect, progSibling] = await Promise.all([
      prismaPublic.chuongTrinhDaoTao.findMany({
        where: {
          ma_nganh: majorData.ma_nganh,
        },
        include: {
          ctdt_to_hop: {
            include: {
              to_hop: {
                include: {
                  mon_1: true,
                  mon_2: true,
                  mon_3: true,
                },
              },
            },
          },
          lich_su_diem_chuan: {
            include: {
              diem_trung_tuyen: {
                include: {
                  phuong_thuc: true,
                },
              },
            },
            orderBy: { nam: "desc" },
          },
          hoc_phan: {
            include: {
              hoc_phan: true,
            },
            orderBy: [
              { hoc_ky: "asc" },
              { ma_hoc_phan: "asc" },
            ],
          },
        },
        orderBy: { ma_chuong_trinh: "asc" },
      }),
      prismaPublic.chuongTrinhDaoTao.findMany({
        where: {
          nganh: {
            ten_nganh: {
              equals: majorData.ten_nganh,
              mode: "insensitive",
            },
            NOT: {
              ma_nganh: majorData.ma_nganh,
            },
          },
        },
        include: {
          ctdt_to_hop: {
            include: {
              to_hop: {
                include: {
                  mon_1: true,
                  mon_2: true,
                  mon_3: true,
                },
              },
            },
          },
          lich_su_diem_chuan: {
            include: {
              diem_trung_tuyen: {
                include: {
                  phuong_thuc: true,
                },
              },
            },
            orderBy: { nam: "desc" },
          },
          hoc_phan: {
            include: {
              hoc_phan: true,
            },
            orderBy: [
              { hoc_ky: "asc" },
              { ma_hoc_phan: "asc" },
            ],
          },
        },
        orderBy: { ma_chuong_trinh: "asc" },
      }),
    ]);

    allRelatedPrograms = [...progDirect, ...progSibling];

    // 3. Tập hợp danh sách tổ hợp xét tuyển duy nhất
    const toHopMap = new Map<string, any>();
    allRelatedPrograms.forEach((p) => {
      p.ctdt_to_hop?.forEach((item: any) => {
        if (item.to_hop && !toHopMap.has(item.ma_to_hop)) {
          toHopMap.set(item.ma_to_hop, {
            ma_to_hop: item.ma_to_hop,
            ten_mon_1: item.to_hop.mon_1?.ten_mon || item.to_hop.ma_mon_1,
            ten_mon_2: item.to_hop.mon_2?.ten_mon || item.to_hop.ma_mon_2,
            ten_mon_3: item.to_hop.mon_3?.ten_mon || item.to_hop.ma_mon_3,
          });
        }
      });
    });
    combinations = Array.from(toHopMap.values());

    // 4. Tập hợp lịch sử điểm chuẩn và chỉ tiêu
    const historyFlat: any[] = [];
    allRelatedPrograms.forEach((p) => {
      p.lich_su_diem_chuan?.forEach((ls: any) => {
        if (ls.diem_trung_tuyen && ls.diem_trung_tuyen.length > 0) {
          ls.diem_trung_tuyen.forEach((dt: any) => {
            historyFlat.push({
              nam: ls.nam,
              chi_tieu: ls.chi_tieu,
              diem: dt.diem,
              ma_phuong_thuc: dt.ma_phuong_thuc,
              ten_phuong_thuc: dt.phuong_thuc?.ten_phuong_thuc || dt.ma_phuong_thuc,
              ma_chuong_trinh: p.ma_chuong_trinh,
              ten_chuong_trinh: p.ten_chuong_trinh,
            });
          });
        } else {
          historyFlat.push({
            nam: ls.nam,
            chi_tieu: ls.chi_tieu,
            diem: null,
            ma_phuong_thuc: "N/A",
            ten_phuong_thuc: "Tham khảo",
            ma_chuong_trinh: p.ma_chuong_trinh,
            ten_chuong_trinh: p.ten_chuong_trinh,
          });
        }
      });
    });

    // Sắp xếp theo năm giảm dần
    historyFlat.sort((a, b) => b.nam - a.nam);
    scoreHistory = historyFlat;

  } catch (error) {
    console.error("Lỗi truy vấn chi tiết ngành học:", error);
  }

  if (!majorData) {
    return (
      <div className="bg-[#fffdf7] p-8 border-[3px] border-[#111827] rounded-2xl text-center space-y-4 shadow-[5px_5px_0px_#111827]">
        <h2 className="font-display font-black text-[22px] text-[#dc2626]">
          Không tìm thấy thông tin ngành học với mã: &quot;{decodedId}&quot;
        </h2>
        <p className="text-[14px] text-[#4b5563]">
          Mã ngành không tồn tại hoặc đã được cập nhật lại theo Đề án mới của UTC.
        </p>
        <Link
          href="/tra-cuu-nganh-hoc"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0284c7] hover:bg-[#0369a1] text-white font-bold text-[13px] border-[2px] border-[#111827] rounded-xl shadow-[3px_3px_0px_#111827]"
        >
          <span className="material-symbols-outlined text-[16px]">arrow_back</span>
          Quay lại danh mục tra cứu ngành học
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full space-y-6 pb-14">
      {/* Nút quay lại */}
      <div>
        <Link
          href="/tra-cuu-nganh-hoc"
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-white text-[#111827] font-bold text-[13px] border-[2px] border-[#111827] shadow-[2px_2px_0px_#111827] rounded-xl hover:bg-[#faf3e6] transition-all"
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          Quay lại Danh mục Ngành
        </Link>
      </div>

      <ChiTietNganhClient
        major={majorData}
        programs={allRelatedPrograms}
        combinations={combinations}
        scoreHistory={scoreHistory}
      />
    </div>
  );
}

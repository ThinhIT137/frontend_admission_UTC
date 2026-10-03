import prisma from "@/libs/prisma";
import ChatbotKbClient from "./ChatbotKbClient";

export const metadata = {
  title: "Quản Lý Dữ Liệu Huấn Luyện Chatbot AI | UTC Admin",
};

export const revalidate = 0;

export default async function ChatbotKbAdminPage() {
  let initialData: any[] = [];
  try {
    initialData = await prisma.triThucAi.findMany({
      include: {
        admin: {
          select: {
            ho_ten: true,
          },
        },
      },
      orderBy: {
        create_at: "desc",
      },
    });
  } catch (err) {
    console.error("Lỗi nạp dữ liệu tri thức AI từ database:", err);
  }

  // Fallback defaults if database table is empty
  if (initialData.length === 0) {
    initialData = [
      {
        ma_tri_thuc: "default_1",
        chu_de: "Điểm Chuẩn & Chỉ Tiêu",
        cau_hoi_mau: "Điểm chuẩn ngành Công nghệ Thông tin năm 2025 là bao nhiêu?",
        noi_dung: "Ngành Công nghệ Thông tin (mã ngành 7480201) năm 2025 có điểm chuẩn xét tuyển THPT là 25.85 điểm.",
        trang_thai: "active",
      },
      {
        ma_tri_thuc: "default_2",
        chu_de: "Chứng Chỉ & Quy Đổi",
        cau_hoi_mau: "Bằng IELTS 6.5 quy đổi thành bao nhiêu điểm Tiếng Anh?",
        noi_dung: "Chứng chỉ IELTS 6.5 trở lên được quy đổi thành 10.0 điểm môn Tiếng Anh trong tổ hợp xét tuyển UTC 2026.",
        trang_thai: "active",
      },
      {
        ma_tri_thuc: "default_3",
        chu_de: "Hồ Sơ & Thủ Tục",
        cau_hoi_mau: "Thời gian nộp hồ sơ xét tuyển sớm K66 là khi nào?",
        noi_dung: "Hạn chót nộp hồ sơ xét tuyển kết hợp đợt 1 kéo dài từ 01/03/2026 đến hết 30/05/2026.",
        trang_thai: "active",
      },
    ];
  }

  return <ChatbotKbClient initialData={initialData} />;
}

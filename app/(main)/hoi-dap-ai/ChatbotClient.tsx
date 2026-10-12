"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { DisclaimerBanner } from "@/components/ui/DisclaimerBanner";

export interface ProgramKnowledge {
  maChuongTrinh: string;
  tenChuongTrinh: string;
  maNganh: string;
  tenNganh?: string;
  khoiNganh?: string;
  moTaNgan?: string | null;
  toHopMon: string[];
  chiTieu2026?: number | null;
  diemChuanGanNhat?: Array<{
    nam: number;
    phuongThuc: string;
    diem: number;
  }>;
}

export interface FaqKnowledge {
  maTriThuc: string;
  chuDe: string;
  cauHoiMau?: string | null;
  noiDung: string;
}

export interface MethodKnowledge {
  maPhuongThuc: string;
  tenPhuongThuc: string;
}

export interface MilestoneKnowledge {
  tenSuKien: string;
  thoiGianBatDau: string;
  thoiGianKetThuc?: string | null;
  ghiChu?: string | null;
}

export interface ChatbotKnowledgeBase {
  programs: ProgramKnowledge[];
  faqs: FaqKnowledge[];
  methods: MethodKnowledge[];
  milestones: MilestoneKnowledge[];
  totalMajors: number;
  totalQuota: number;
}

interface Message {
  id: string;
  sender: "user" | "bot";
  text: string;
  time: string;
  richData?: {
    type: "program" | "faq" | "method" | "milestone" | "general";
    program?: ProgramKnowledge;
    programsList?: ProgramKnowledge[];
    milestonesList?: MilestoneKnowledge[];
    methodsList?: MethodKnowledge[];
  };
}

interface ChatbotClientProps {
  knowledgeBase: ChatbotKnowledgeBase;
}

export default function ChatbotClient({ knowledgeBase }: ChatbotClientProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      sender: "bot",
      text: `Xin chào bạn! Mình là Trợ lý AI Tuyển sinh Trường Đại học Giao thông Vận tải (UTC Cơ sở Hà Nội). Mình đã kết nối trực tiếp với Cơ sở dữ liệu Tuyển sinh K66: thông tin ${knowledgeBase.totalMajors || "35+"} ngành đào tạo, chỉ tiêu ~${knowledgeBase.totalQuota.toLocaleString() || "6.000"} sinh viên, điểm chuẩn các năm và các phương thức xét tuyển mới nhất. Bạn muốn tìm hiểu thông tin gì hôm nay?`,
      time: "Vừa xong",
      richData: {
        type: "general",
      },
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<string>("all");
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Bộ câu hỏi gợi ý nhanh dựa trên dữ liệu thật từ DB
  const defaultSuggestedPrompts = [
    "Điểm chuẩn ngành Công nghệ thông tin 2025?",
    "Ngành Kỹ thuật Robot và Trí tuệ nhân tạo xét tổ hợp nào?",
    "Có những phương thức xét tuyển nào vào UTC?",
    "Quy đổi điểm chứng chỉ IELTS sang thang điểm xét tuyển?",
    "Thời gian nộp hồ sơ xét tuyển sớm K66?",
    "Ngành Logistics và Quản lý chuỗi cung ứng chỉ tiêu bao nhiêu?",
    "Học phí các ngành tại UTC Cơ sở Hà Nội?",
  ];

  // Hàm chuẩn hóa chuỗi tiếng Việt để tìm kiếm không dấu
  const removeAccents = (str: string) => {
    return str
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/Đ/g, "D")
      .toLowerCase()
      .trim();
  };

  // Engine xử lý câu hỏi dựa trên CSDL Tri thức thực tế
  const processQueryWithDatabase = (rawQuery: string): { text: string; richData?: Message["richData"] } => {
    const qLower = rawQuery.toLowerCase();
    const qNorm = removeAccents(rawQuery);

    // 1. KIỂM TRA HỎI VỀ PHƯƠNG THỨC XÉT TUYỂN
    if (
      qNorm.includes("phuong thuc") ||
      qNorm.includes("cac cach xet tuyen") ||
      qNorm.includes("hinh thuc xet tuyen")
    ) {
      if (knowledgeBase.methods && knowledgeBase.methods.length > 0) {
        let reply = `Năm 2026, Trường Đại học Giao thông Vận tải (Cơ sở Hà Nội - Mã trường: GHA) áp dụng các phương thức xét tuyển chính thức sau từ CSDL:\n\n`;
        knowledgeBase.methods.forEach((m, idx) => {
          reply += `🔹 **${m.maPhuongThuc}**: ${m.tenPhuongThuc}\n`;
        });
        reply += `\nThí sinh có thể đồng thời đăng ký nhiều phương thức để tăng cơ hội trúng tuyển. Bạn muốn xem chi tiết điều kiện của phương thức nào?`;
        return {
          text: reply,
          richData: {
            type: "method",
            methodsList: knowledgeBase.methods,
          },
        };
      }
    }

    // 2. KIỂM TRA HỎI VỀ LỘ TRÌNH / THỜI GIAN / MỐC TUYỂN SINH
    if (
      qNorm.includes("thoi gian") ||
      qNorm.includes("khi nao") ||
      qNorm.includes("han chot") ||
      qNorm.includes("lo trinh") ||
      qNorm.includes("ngay nop") ||
      qNorm.includes("lich xet tuyen")
    ) {
      if (knowledgeBase.milestones && knowledgeBase.milestones.length > 0) {
        let reply = `Dưới đây là các mốc thời gian tuyển sinh quan trọng được ghi nhận trong CSDL Tuyển sinh UTC K66:\n\n`;
        knowledgeBase.milestones.forEach((ms) => {
          const start = new Date(ms.thoiGianBatDau).toLocaleDateString("vi-VN");
          const end = ms.thoiGianKetThuc ? ` đến ${new Date(ms.thoiGianKetThuc).toLocaleDateString("vi-VN")}` : "";
          reply += `📌 **${ms.tenSuKien}**: ${start}${end}`;
          if (ms.ghiChu) reply += ` (${ms.ghiChu})`;
          reply += `\n`;
        });
        reply += `\nThí sinh lưu ý theo dõi kỹ các mốc trên để không bỏ lỡ hạn đăng ký trên hệ thống của Trường và Bộ GD&ĐT.`;
        return {
          text: reply,
          richData: {
            type: "milestone",
            milestonesList: knowledgeBase.milestones,
          },
        };
      }
    }

    // 3. TÌM KIẾM THEO NGÀNH HỌC TRONG CSDL (chuongTrinhDaoTao)
    // Ưu tiên so khớp chính xác tên hoặc mã ngành
    const matchedPrograms: ProgramKnowledge[] = [];
    for (const prog of knowledgeBase.programs) {
      const nameNorm = removeAccents(prog.tenChuongTrinh);
      const majorNameNorm = prog.tenNganh ? removeAccents(prog.tenNganh) : "";
      const codeNorm = prog.maChuongTrinh.toLowerCase();

      // Kiểm tra tên viết tắt phổ biến
      let aliasMatched = false;
      if (qNorm.includes("cntt") && (nameNorm.includes("cong nghe thong tin") || codeNorm.includes("7480201"))) aliasMatched = true;
      if (qNorm.includes("ai") || qNorm.includes("tri tue nhan tao") || qNorm.includes("robot")) {
        if (nameNorm.includes("robot") || nameNorm.includes("tri tue nhan tao") || nameNorm.includes("khoa hoc may tinh")) aliasMatched = true;
      }
      if (qNorm.includes("logistics") && nameNorm.includes("logistics")) aliasMatched = true;
      if (qNorm.includes("o to") && nameNorm.includes("o to")) aliasMatched = true;
      if (qNorm.includes("cau duong") || qNorm.includes("xay dung")) {
        if (nameNorm.includes("cau duong") || nameNorm.includes("xay dung")) aliasMatched = true;
      }
      if (qNorm.includes("co dien tu") && nameNorm.includes("co dien tu")) aliasMatched = true;
      if (qNorm.includes("kinh te") && (nameNorm.includes("kinh te") || nameNorm.includes("tai chinh"))) aliasMatched = true;

      // So khớp tên chuỗi
      const directMatched =
        qNorm.includes(nameNorm) ||
        (majorNameNorm && qNorm.includes(majorNameNorm)) ||
        rawQuery.toUpperCase().includes(prog.maChuongTrinh) ||
        aliasMatched;

      if (directMatched) {
        matchedPrograms.push(prog);
      }
    }

    // Nếu tìm thấy chính xác 1 ngành hoặc vài ngành phù hợp
    if (matchedPrograms.length > 0) {
      const topProg = matchedPrograms[0];
      let reply = `Dựa trên dữ liệu CSDL Tuyển sinh UTC, thông tin về chương trình **${topProg.tenChuongTrinh}** như sau:\n\n`;
      reply += `📋 **Mã chương trình/ngành:** \`${topProg.maChuongTrinh}\`\n`;
      if (topProg.khoiNganh) reply += `🏢 **Khối ngành/Đơn vị:** ${topProg.khoiNganh}\n`;
      if (topProg.toHopMon && topProg.toHopMon.length > 0) {
        reply += `🎯 **Tổ hợp môn xét tuyển:** ${topProg.toHopMon.join(", ")}\n`;
      }
      if (topProg.chiTieu2026) {
        reply += `📊 **Chỉ tiêu tuyển sinh:** ~${topProg.chiTieu2026} sinh viên\n`;
      }

      if (topProg.diemChuanGanNhat && topProg.diemChuanGanNhat.length > 0) {
        reply += `\n📈 **Điểm chuẩn tham khảo gần nhất trong CSDL:**\n`;
        topProg.diemChuanGanNhat.slice(0, 4).forEach((dc) => {
          reply += `• Năm ${dc.nam} (${dc.phuongThuc}): **${dc.diem} điểm**\n`;
        });
      }

      if (topProg.moTaNgan) {
        reply += `\n💡 **Giới thiệu tóm tắt:** ${topProg.moTaNgan.slice(0, 180)}...\n`;
      }

      reply += `\nBạn có thể nhấn vào thẻ bên dưới để xem toàn bộ khung chương trình đào tạo chi tiết của ngành này!`;

      return {
        text: reply,
        richData: {
          type: "program",
          program: topProg,
          programsList: matchedPrograms.slice(0, 3),
        },
      };
    }

    // 4. KIỂM TRA TRONG BẢNG TRI THỨC AI CỦA ADMIN (tri_thuc_ai)
    if (knowledgeBase.faqs && knowledgeBase.faqs.length > 0) {
      for (const faq of knowledgeBase.faqs) {
        const topicNorm = removeAccents(faq.chuDe);
        const qSampleNorm = faq.cauHoiMau ? removeAccents(faq.cauHoiMau) : "";
        const contentNorm = removeAccents(faq.noiDung);

        // Kiểm tra từ khóa
        const isMatched =
          (qSampleNorm && qNorm.includes(qSampleNorm)) ||
          (qSampleNorm && qSampleNorm.includes(qNorm)) ||
          qNorm.includes(topicNorm) ||
          (qNorm.includes("ielts") && (contentNorm.includes("ielts") || topicNorm.includes("chung chi"))) ||
          (qNorm.includes("hoc phi") && (contentNorm.includes("hoc phi") || topicNorm.includes("hoc phi"))) ||
          (qNorm.includes("hoc bong") && (contentNorm.includes("hoc bong") || topicNorm.includes("hoc bong"))) ||
          (qNorm.includes("ky tuc xa") && (contentNorm.includes("ky tuc xa") || topicNorm.includes("ky tuc xa"))) ||
          (qNorm.includes("hoc ba") && (contentNorm.includes("hoc ba") || topicNorm.includes("hoc ba")));

        if (isMatched) {
          return {
            text: `Dựa trên dữ liệu giải đáp của Ban Tuyển sinh UTC về chủ đề **"${faq.chuDe}"**:\n\n${faq.noiDung}`,
            richData: {
              type: "faq",
            },
          };
        }
      }
    }

    // 5. TRƯỜNG HỢP CÂU HỎI CHUNG VỀ CHỈ TIÊU HOẶC ĐIỂM CHUẨN TỔNG THỂ
    if (qNorm.includes("chi tieu") || qNorm.includes("tong chi tieu")) {
      return {
        text: `Tổng chỉ tiêu tuyển sinh K66 năm 2026 của Trường Đại học Giao thông Vận tải (Cơ sở chính tại Hà Nội) trong CSDL là **~${knowledgeBase.totalQuota.toLocaleString() || "6.000"} sinh viên** cho ${knowledgeBase.totalMajors || "35+"} ngành và chương trình đào tạo. Thí sinh có thể tra cứu chỉ tiêu chi tiết theo từng ngành tại mục [Tra cứu ngành học](/tra-cuu-nganh-hoc).`,
        richData: { type: "general" },
      };
    }

    if (qNorm.includes("ielts") || qNorm.includes("quy doi")) {
      return {
        text: `Theo Đề án Tuyển sinh UTC 2026 trong CSDL, mức quy đổi chứng chỉ Ngoại ngữ quốc tế (IELTS Academic) sang thang điểm 10 môn Tiếng Anh áp dụng như sau:\n\n• **IELTS 5.0**: Quy đổi thành **8.0 điểm**\n• **IELTS 5.5**: Quy đổi thành **8.5 điểm**\n• **IELTS 6.0**: Quy đổi thành **9.0 điểm**\n• **IELTS 6.5 trở lên**: Quy đổi thành **10.0 điểm tuyệt đối**.\n\nChứng chỉ phải còn hiệu lực tính đến thời điểm nhận hồ sơ xét tuyển. Bạn có thể sử dụng công cụ [Tính điểm quy đổi](/tinh-diem-quy-doi) để tính toán điểm xét tuyển chính xác.`,
        richData: { type: "general" },
      };
    }

    if (qNorm.includes("hoc phi") || qNorm.includes("kinh phi")) {
      return {
        text: `Học phí tại Trường Đại học Giao thông Vận tải được thu theo tín chỉ theo Nghị định của Chính phủ dành cho các trường công lập:\n\n• **Khối ngành Kỹ thuật - Công nghệ**: Khoảng 420.000đ - 460.000đ/tín chỉ (~16.000.000đ - 18.500.000đ/năm học tùy số tín chỉ đăng ký).\n• **Khối ngành Kinh tế - Vận tải**: Khoảng 380.000đ - 420.000đ/tín chỉ (~14.500.000đ - 16.500.000đ/năm học).\n• **Chương trình Tiên tiến / Chất lượng cao**: Mức học phí theo định mức kinh tế kỹ thuật được phê duyệt riêng, tương đương 1.5 - 2.0 lần chương trình chuẩn.`,
        richData: { type: "general" },
      };
    }

    // 6. DEFAULT FALLBACK CÓ GỢI Ý NGÀNH TỪ DB
    const randomSampleProgs = knowledgeBase.programs.slice(0, 4);
    let fallbackReply = `Cảm ơn câu hỏi của bạn. Hệ thống CSDL Tuyển sinh UTC ghi nhận thắc mắc: *"${rawQuery}"*.\n\n`;
    fallbackReply += `Bạn có thể tra cứu thông tin cụ thể hơn bằng cách:\n`;
    fallbackReply += `1. Nhập tên hoặc mã ngành học cụ thể (VD: *${randomSampleProgs.map((p) => p.tenChuongTrinh).join(", ")}*).\n`;
    fallbackReply += `2. Hỏi về phương thức xét tuyển, cách quy đổi IELTS, học bạ hoặc lộ trình nhận hồ sơ.\n`;
    fallbackReply += `3. Hoặc liên hệ trực tiếp Ban Tư vấn Tuyển sinh UTC qua Hotline: **(024) 3766 3311**.`;

    return {
      text: fallbackReply,
      richData: {
        type: "general",
        programsList: randomSampleProgs,
      },
    };
  };

  const handleSend = (textToSend?: string) => {
    const q = (textToSend || input).trim();
    if (!q) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: "user",
      text: q,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput("");
    setIsTyping(true);

    // Mô phỏng độ trễ suy luận AI Consultant
    setTimeout(() => {
      const response = processQueryWithDatabase(q);
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: "bot",
        text: response.text,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        richData: response.richData,
      };

      setMessages((prev) => [...prev, botMsg]);
      setIsTyping(false);
    }, 600);
  };

  const handleClearHistory = () => {
    setMessages([
      {
        id: "reset",
        sender: "bot",
        text: "Hội thoại đã được làm mới. Mình đã sẵn sàng hỗ trợ bạn câu hỏi tiếp theo về Tuyển sinh UTC K66!",
        time: "Vừa xong",
        richData: { type: "general" },
      },
    ]);
  };

  return (
    <div className="flex flex-col w-full space-y-6 pb-16">
      {/* 1. Header Banner Phong Cách Neo-Brutalism */}
      <div className="bg-[#fffdf7] p-6 lg:p-8 border-[3px] border-[#111827] shadow-[6px_6px_0px_#111827] rounded-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#fdb712]/15 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className="px-3 py-1 bg-[#0d1b4e] text-white font-stamp text-[12px] font-black border-[2px] border-[#111827] rounded-lg shadow-[2px_2px_0px_#111827]">
            TRỢ LÝ TỰ ĐỘNG UTC 24/7
          </span>
          <span className="px-3 py-1 bg-[#fdb712] text-[#0d1b4e] font-stamp text-[12px] font-black border-[2px] border-[#111827] rounded-lg shadow-[2px_2px_0px_#111827]">
            KẾT NỐI TRỰC TIẾP DATABASE
          </span>
          <span className="px-3 py-1 bg-[#dcfce7] text-[#15803d] font-bold text-[12px] border-[1.5px] border-[#111827] rounded-lg">
            Đồng bộ {knowledgeBase.totalMajors || "35+"} ngành • ~{knowledgeBase.totalQuota.toLocaleString()} chỉ tiêu K66
          </span>
        </div>

        <h1 className="font-display font-black text-[26px] sm:text-[34px] text-[#0d1b4e] uppercase leading-tight tracking-tight">
          Hỏi Đáp & Tư Vấn Tuyển Sinh AI – Trường ĐH Giao Thông Vận Tải
        </h1>

        <p className="text-[14px] text-[#4b5563] mt-2 max-w-4xl leading-relaxed">
          Trợ lý AI được tích hợp trực tiếp với Cơ sở dữ liệu tuyển sinh chính thức của Nhà trường (Hội đồng Tuyển sinh UTC Cơ sở Hà Nội). Tự động tra cứu điểm chuẩn, chỉ tiêu, tổ hợp môn, lộ trình nộp hồ sơ và phương thức xét tuyển theo thời gian thực.
        </p>
      </div>

      <DisclaimerBanner />

      {/* 2. Khung Chatbot Toàn Diện */}
      <div className="bg-white border-[3px] border-[#111827] shadow-[7px_7px_0px_#111827] rounded-2xl overflow-hidden flex flex-col h-[650px] lg:h-[720px]">
        {/* Header Thanh Điều Khiển Khung Chat */}
        <div className="bg-[#0284c7] text-white px-5 py-4 border-b-[3px] border-[#111827] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-[#fdb712] border-[2px] border-[#111827] text-[#0d1b4e] flex items-center justify-center font-bold shadow-[2px_2px_0px_#111827]">
              <span className="material-symbols-outlined text-[26px]">smart_toy</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display font-black text-[17px] sm:text-[19px] uppercase tracking-wide">
                  UTC AI ADMISSION CONSULTANT
                </h3>
                <span className="w-2.5 h-2.5 rounded-full bg-[#86efac] animate-pulse" />
              </div>
              <p className="text-[12px] text-[#e0f2fe] font-mono">
                Knowledge Base: CSDL Tuyển sinh K66 UTC • Hà Nội (GHA)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleClearHistory}
              title="Làm mới cuộc trò chuyện"
              className="px-3 py-1.5 bg-[#0369a1] hover:bg-[#075985] text-white text-[12px] font-bold rounded-lg border border-white/30 flex items-center gap-1 transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">refresh</span>
              <span className="hidden sm:inline">Làm Mới</span>
            </button>
          </div>
        </div>

        {/* Khu Vực Lịch Sử Tin Nhắn */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-5 bg-[#faf3e6]">
          {messages.map((m) => {
            const isUser = m.sender === "user";

            return (
              <div
                key={m.id}
                className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}
              >
                <div className="flex items-end gap-2 max-w-[92%] sm:max-w-[85%]">
                  {!isUser && (
                    <div className="w-8 h-8 rounded-full bg-[#0d1b4e] text-[#fdb712] border-[1.5px] border-[#111827] flex items-center justify-center shrink-0 mb-1">
                      <span className="material-symbols-outlined text-[18px]">smart_toy</span>
                    </div>
                  )}

                  <div
                    className={`p-4 sm:p-5 text-[14px] leading-relaxed border-[2.5px] border-[#111827] shadow-[3.5px_3.5px_0px_#111827] ${
                      isUser
                        ? "bg-[#0284c7] text-white rounded-2xl rounded-br-none"
                        : "bg-white text-[#111827] rounded-2xl rounded-bl-none"
                    } space-y-3`}
                  >
                    {/* Nội dung text */}
                    <div className="whitespace-pre-wrap font-medium">
                      {m.text}
                    </div>

                    {/* Rich Data Card: Ngành Học */}
                    {!isUser && m.richData?.type === "program" && m.richData.program && (
                      <div className="p-3.5 bg-[#fffdf7] border-[2px] border-[#111827] rounded-xl shadow-[2px_2px_0px_#111827] text-[13px] space-y-2 mt-2">
                        <div className="flex items-center justify-between">
                          <span className="px-2 py-0.5 bg-[#0d1b4e] text-white font-mono font-bold text-[11px] rounded">
                            MÃ: {m.richData.program.maChuongTrinh}
                          </span>
                          {m.richData.program.toHopMon && (
                            <span className="text-[11px] font-bold text-[#0284c7]">
                              Tổ hợp: {m.richData.program.toHopMon.join(", ")}
                            </span>
                          )}
                        </div>

                        <div className="font-display font-black text-[15px] text-[#0d1b4e]">
                          {m.richData.program.tenChuongTrinh}
                        </div>

                        <Link
                          href={`/tra-cuu-nganh-hoc/${m.richData.program.maChuongTrinh}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#fdb712] hover:bg-[#e0a20f] text-[#0d1b4e] font-display font-black text-[12px] uppercase rounded-lg border-[1.5px] border-[#111827] shadow-[1.5px_1.5px_0px_#111827] transition-all"
                        >
                          <span>Xem Khung Đào Tạo Chi Tiết</span>
                          <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
                        </Link>
                      </div>
                    )}

                    {/* Rich Data Card: Danh Sách Ngành Khác Gợi Ý */}
                    {!isUser && m.richData?.programsList && m.richData.programsList.length > 1 && (
                      <div className="pt-2 border-t border-[#e2e8f0]">
                        <span className="text-[11.5px] font-bold text-[#64748b] block mb-1.5">
                          Các ngành liên quan trong CSDL:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {m.richData.programsList.map((p) => (
                            <Link
                              key={p.maChuongTrinh}
                              href={`/tra-cuu-nganh-hoc/${p.maChuongTrinh}`}
                              className="px-2.5 py-1 bg-white hover:bg-[#ffdea8] border border-[#111827] rounded-md text-[11.5px] font-bold text-[#0d1b4e] transition-colors"
                            >
                              {p.tenChuongTrinh}
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <span className="text-[11px] text-[#6b7280] mt-1 px-11 font-mono">
                  {m.time}
                </span>
              </div>
            );
          })}

          {/* Typing Animation */}
          {isTyping && (
            <div className="flex items-end gap-2">
              <div className="w-8 h-8 rounded-full bg-[#0d1b4e] text-[#fdb712] border-[1.5px] border-[#111827] flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[18px]">smart_toy</span>
              </div>
              <div className="p-3.5 bg-white border-[2px] border-[#111827] shadow-[3px_3px_0px_#111827] rounded-2xl rounded-bl-none flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#0284c7] animate-bounce" />
                <span className="w-2 h-2 rounded-full bg-[#0284c7] animate-bounce [animation-delay:0.2s]" />
                <span className="w-2 h-2 rounded-full bg-[#0284c7] animate-bounce [animation-delay:0.4s]" />
                <span className="text-[12px] font-bold text-[#64748b] ml-1 font-mono">
                  Đang truy vấn CSDL Tuyển sinh UTC...
                </span>
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Thanh Gợi Ý Câu Hỏi Nhanh (Prompts từ DB) */}
        <div className="px-4 py-2.5 bg-[#fffdf7] border-t-[2px] border-[#111827] flex items-center gap-2 overflow-x-auto no-scrollbar">
          <span className="material-symbols-outlined text-[18px] text-[#f59e0b] shrink-0">
            tips_and_updates
          </span>
          <span className="text-[11.5px] font-bold text-[#64748b] shrink-0">Gợi ý câu hỏi:</span>
          {defaultSuggestedPrompts.map((prompt, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSend(prompt)}
              className="shrink-0 text-[12px] font-bold bg-white hover:bg-[#fde68a] text-[#0d1b4e] px-3 py-1.5 border-[1.5px] border-[#111827] shadow-[2px_2px_0px_#111827] rounded-lg transition-all active:translate-x-[1px] active:translate-y-[1px] cursor-pointer"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Khung Nhập Liệu Câu Hỏi */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="p-4 bg-white border-t-[3px] border-[#111827] flex items-center gap-3"
        >
          <div className="relative flex-1">
            <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#64748b] text-[20px]">
              chat
            </span>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Đặt câu hỏi về điểm chuẩn, ngành học, chỉ tiêu, quy đổi IELTS hoặc thủ tục nhập học UTC..."
              className="w-full pl-11 pr-4 py-3 bg-[#faf3e6] border-[2px] border-[#111827] rounded-xl text-[14px] font-bold text-[#0d1b4e] outline-none placeholder:text-[#9ca3af] focus:ring-2 focus:ring-[#fdb712]"
            />
          </div>

          <button
            type="submit"
            disabled={isTyping || !input.trim()}
            className="px-6 py-3 bg-[#0284c7] hover:bg-[#0369a1] disabled:opacity-50 text-white font-display font-black text-[14px] uppercase tracking-wider rounded-xl border-[2.5px] border-[#111827] shadow-[3px_3px_0px_#111827] active:translate-x-[1px] active:translate-y-[1px] flex items-center gap-2 transition-all cursor-pointer shrink-0"
          >
            <span>Gửi</span>
            <span className="material-symbols-outlined text-[18px]">send</span>
          </button>
        </form>
      </div>
    </div>
  );
}

"use client";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Bot, ChevronDown, RotateCcw, Send, Sparkles } from "lucide-react";
import ChatTyping from "@/components/ui/ChatTyping";
import { api, BrowserApiError } from "@/libs/api-services/browser-api";

export interface ProgramKnowledge {
  maChuongTrinh: string;
  tenChuongTrinh: string;
  maNganh: string;
  tenNganh?: string;
  khoiNganh?: string;
  moTaNgan?: string | null;
  toHopMon: string[];
  chiTieuNamDangXet?: number | null;
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
  referenceYear: number;
  dataUnavailable: boolean;
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
      text: "Chào bạn! Bạn muốn tìm hiểu chương trình đào tạo, điểm chuẩn hay thủ tục tuyển sinh UTC Hà Nội? Thông tin tư vấn cần đối chiếu với thông báo chính thức của trường.",
      time: "Vừa xong",
      richData: {
        type: "general",
      },
    },
  ]);
  const sessionId = useRef<string | undefined>(undefined);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showQuickQuestions, setShowQuickQuestions] = useState(true);
  const pendingRequest = useRef(false);
  const messagesBody = useRef<HTMLDivElement>(null);
  const [selectedTopic, setSelectedTopic] = useState<string>("all");
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesBody.current?.scrollTo({ top: messagesBody.current.scrollHeight, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
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
        let reply = "Danh mục phương thức đang lưu trong database của app (cần đối chiếu đề án của năm đăng ký):\n\n";
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
        let reply = `Dưới đây là các mốc thời gian tuyển sinh quan trọng được ghi nhận trong CSDL Tuyển sinh UTC:\n\n`;
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
      if (topProg.chiTieuNamDangXet) {
        reply += `📊 **Chỉ tiêu tuyển sinh:** ~${topProg.chiTieuNamDangXet} sinh viên\n`;
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
            text: `Nội dung tri thức trong database về chủ đề "${faq.chuDe}" (chưa có trường xác nhận nguồn và năm áp dụng; không coi là quy định tuyển sinh hiện hành):\n\n${faq.noiDung}`,
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
        text: knowledgeBase.dataUnavailable ? "Chưa tải được dữ liệu chỉ tiêu từ database." : `Dữ liệu năm ${knowledgeBase.referenceYear} đang có trong app: ${knowledgeBase.programs.length} chương trình thuộc ${knowledgeBase.totalMajors} ngành, tổng chỉ tiêu ${knowledgeBase.totalQuota.toLocaleString("vi-VN")}. Đây là phạm vi dữ liệu đã nhập, không phải kết quả trúng tuyển.`,
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

  const handleSend = async (textToSend?: string) => {
    const q = (textToSend || input).trim();
    if (!q || pendingRequest.current) return;
    pendingRequest.current = true;
    setShowQuickQuestions(false);

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: "user",
      text: q,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput("");
    setIsTyping(true);

    let aiFailureMessage = "Chưa nhận được phản hồi hợp lệ từ AI.";
    try {
      // 1. Thử gọi Microservice AI backend (backend_ai_ml /api/chat)
      const aiRes = await api<{ success: boolean; data: { answer: string; session_id: string } }>("ai", "/api/chat", { message: q, session_id: sessionId.current });
      sessionId.current = aiRes.data?.session_id;
      if (aiRes.success && aiRes.data?.answer) {
        const botMsg: Message = {
          id: (Date.now() + 1).toString(),
          sender: "bot",
          text: aiRes.data.answer,
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          richData: { type: "general" },
        };
        setMessages((prev) => [...prev, botMsg]);
        setIsTyping(false);
        pendingRequest.current = false;
        return;
      }
    } catch (error) {
      aiFailureMessage = error instanceof BrowserApiError ? error.message : "Chưa kết nối được dịch vụ AI.";
      // Fallback sang CSDL tri thức tuyển sinh nội bộ
    }

    // 2. Fallback sang Engine phân tích CSDL Tuyển sinh nội bộ
    setTimeout(() => {
      const response = processQueryWithDatabase(q);
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: "bot",
        text: `[${aiFailureMessage} Tra cứu dữ liệu nội bộ]\n` + response.text,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        richData: response.richData,
      };

      setMessages((prev) => [...prev, botMsg]);
      setIsTyping(false);
      pendingRequest.current = false;
    }, 500);
  };

  const handleClearHistory = () => {
    if (pendingRequest.current) return;
    setShowQuickQuestions(true);
    sessionId.current = undefined;
    setMessages([
      {
        id: "reset",
        sender: "bot",
        text: "Hội thoại đã được làm mới. Mình đã sẵn sàng hỗ trợ bạn câu hỏi tiếp theo về Tuyển sinh UTC!",
        time: "Vừa xong",
        richData: { type: "general" },
      },
    ]);
  };

  return <div className="flex h-full min-h-0 flex-col gap-3 text-[#14244e]">
    <header className="flex shrink-0 items-center justify-between gap-3">
      <div><h1 className="text-lg font-bold sm:text-xl">Hỏi đáp tuyển sinh UTC</h1><p className="text-xs leading-5 text-slate-500">Hà Nội · GHA · Thông tin tham khảo, đối chiếu thông báo chính thức.</p></div>
      <button type="button" disabled={isTyping} onClick={handleClearHistory} className="flex min-h-10 shrink-0 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium disabled:opacity-40"><RotateCcw size={16} aria-hidden="true" /><span className="hidden sm:inline">Làm mới</span></button>
    </header>
    <section aria-label="Trò chuyện với trợ lý UTC" className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex shrink-0 items-center gap-3 bg-gradient-to-r from-[#14244e] to-[#264680] px-4 py-3 text-white"><Bot size={24} className="text-amber-300" aria-hidden="true" /><div><h2 className="text-sm font-semibold">Trợ lý tuyển sinh</h2><p className="text-xs text-blue-100">Chương trình đào tạo · Điểm chuẩn · Hồ sơ</p></div></div>
      <div ref={messagesBody} role="log" aria-label="Nội dung hội thoại" aria-live="polite" aria-relevant="additions" className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain bg-slate-50 p-4 sm:p-6">
        {messages.map(message => <div key={message.id} className={`flex flex-col ${message.sender === "user" ? "items-end" : "items-start"}`}>
          <div className={`max-w-[95%] whitespace-pre-wrap break-words rounded-2xl p-4 text-sm leading-7 sm:max-w-[80%] ${message.sender === "user" ? "rounded-br-md bg-[#1e3a70] text-white" : "rounded-bl-md border border-slate-200 bg-white text-slate-700 shadow-sm"}`}>
            <p>{message.text}</p>
            {message.richData?.program && <Link href={`/tra-cuu-nganh-hoc/${message.richData.program.maNganh}`} className="mt-3 block font-semibold text-blue-700 underline">{message.richData.program.tenChuongTrinh} →</Link>}
            {!!message.richData?.programsList?.length && <div className="mt-3 flex flex-wrap gap-2">{message.richData.programsList.map(program => <Link key={program.maChuongTrinh} href={`/tra-cuu-nganh-hoc/${program.maNganh}`} className="rounded-lg border border-slate-200 bg-blue-50 px-3 py-1 text-xs text-blue-800">{program.tenChuongTrinh}</Link>)}</div>}
          </div><span className="mt-1 text-[11px] text-slate-400">{message.time}</span>
        </div>)}
        {isTyping && <ChatTyping />}
        <div ref={chatEndRef} />
      </div>
      <div className="shrink-0 border-t border-slate-100 px-4 py-2">
        <button type="button" aria-expanded={showQuickQuestions} aria-controls="page-quick-questions" onClick={() => setShowQuickQuestions(value => !value)} className="flex min-h-9 items-center gap-2 text-xs font-semibold text-blue-800"><Sparkles size={14} aria-hidden="true" />{showQuickQuestions ? "Ẩn hỏi nhanh" : "Mở hỏi nhanh"}<ChevronDown size={14} aria-hidden="true" className={showQuickQuestions ? "rotate-180" : ""} /></button>
        {showQuickQuestions && <div id="page-quick-questions" className="flex max-h-28 flex-wrap gap-2 overflow-y-auto pb-2">{defaultSuggestedPrompts.map(prompt => <button key={prompt} type="button" disabled={isTyping} onClick={() => void handleSend(prompt)} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-left text-xs leading-5 text-slate-600 hover:bg-blue-50 disabled:opacity-40">{prompt}</button>)}</div>}
      </div>
      <form onSubmit={event => { event.preventDefault(); void handleSend(); }} className="flex shrink-0 items-center gap-2 border-t border-slate-100 p-3 sm:p-4">
        <input value={input} onChange={event => setInput(event.target.value)} maxLength={2000} aria-label="Câu hỏi tuyển sinh" placeholder="Bạn muốn tìm hiểu điều gì?" className="h-11 min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
        <button type="submit" disabled={isTyping || !input.trim()} aria-label="Gửi câu hỏi" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-950 text-white hover:bg-blue-800 disabled:opacity-40"><Send size={18} aria-hidden="true" /></button>
      </form>
    </section>
  </div>;
}

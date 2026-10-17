"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";

interface Message {
  id: string;
  sender: "user" | "bot";
  text: string;
  time: string;
  actionUrl?: string;
  actionLabel?: string;
}

const initialMessages: Message[] = [
  {
    id: "1",
    sender: "bot",
    text: "Xin chào bạn! Mình là Trợ lý AI Tuyển sinh UTC 2026. Mình có thể giúp bạn giải đáp điều gì về ngành học, điểm chuẩn, phương thức xét tuyển hay quy đổi chứng chỉ hôm nay?",
    time: "Vừa xong",
  },
];

const suggestedQuestions = [
  "Điểm chuẩn ngành CNTT năm 2025?",
  "Ngành Robot và Trí tuệ nhân tạo?",
  "Cách quy đổi điểm IELTS sang UTC?",
  "Chỉ tiêu tuyển sinh K66 là bao nhiêu?",
  "Các phương thức xét tuyển UTC?",
];

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen, isTyping]);

  const handleSend = (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: "user",
      text: query,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput("");
    setIsTyping(true);

    const qLower = query.toLowerCase();

    setTimeout(() => {
      let botResponse = "";
      let actionUrl: string | undefined = undefined;
      let actionLabel: string | undefined = undefined;

      if (qLower.includes("cntt") || qLower.includes("công nghệ thông tin")) {
        botResponse =
          "Ngành Công nghệ Thông tin (mã 7480201) tại UTC năm 2025 có điểm chuẩn THPT là 25.85 điểm (A00, A01). Chỉ tiêu tuyển sinh khoảng 360 sinh viên.";
        actionUrl = "/tra-cuu-nganh-hoc/7480201";
        actionLabel = "Xem Khung Đào Tạo CNTT";
      } else if (qLower.includes("robot") || qLower.includes("trí tuệ nhân tạo") || qLower.includes("ai")) {
        botResponse =
          "Chương trình Kỹ thuật Robot và Trí tuệ nhân tạo (Chương trình Tiên tiến - mã 7520216) xét tuyển theo các tổ hợp A00, A01, D07. Điểm chuẩn năm 2025 là 26.00 điểm.";
        actionUrl = "/tra-cuu-nganh-hoc/7520216";
        actionLabel = "Xem Ngành Robot & AI";
      } else if (qLower.includes("logistics")) {
        botResponse =
          "Ngành Logistics và Quản lý chuỗi cung ứng (mã 7510605) thuộc Khoa Vận tải - Kinh tế, điểm chuẩn THPT 2025 là 26.10 điểm. Chỉ tiêu dự kiến 250 sinh viên.";
        actionUrl = "/tra-cuu-nganh-hoc/7510605";
        actionLabel = "Xem Ngành Logistics";
      } else if (qLower.includes("quy đổi") || qLower.includes("ielts")) {
        botResponse =
          "UTC quy đổi chứng chỉ IELTS: từ 5.0 = 8.0đ; 5.5 = 8.5đ; 6.0 = 9.0đ; 6.5 trở lên = 10.0đ môn Tiếng Anh trong tổ hợp xét tuyển. Bạn có thể tự tính điểm bằng công cụ tính điểm quy đổi.";
        actionUrl = "/tinh-diem-quy-doi";
        actionLabel = "Mở Công Cụ Tính Điểm";
      } else if (qLower.includes("chỉ tiêu") || qLower.includes("chi tieu")) {
        botResponse =
          "Tổng chỉ tiêu tuyển sinh K66 năm 2026 tại Cơ sở Hà Nội (GHA) dự kiến khoảng 6.000 sinh viên cho hơn 35 ngành và chương trình đào tạo.";
        actionUrl = "/thong-tin-tuyen-sinh";
        actionLabel = "Xem Đề Án Tuyển Sinh";
      } else if (qLower.includes("phương thức") || qLower.includes("xét tuyển")) {
        botResponse =
          "UTC áp dụng 4 phương thức xét tuyển: PT1 (Điểm thi tốt nghiệp THPT), PT2 (Kết hợp IELTS & Học bạ), PT3 (Xét học bạ 5 học kỳ), PT4 (Đánh giá tư duy TSA - ĐHBK Hà Nội).";
        actionUrl = "/thong-tin-tuyen-sinh";
        actionLabel = "Xem Chi Tiết Phương Thức";
      } else if (qLower.includes("học phí") || qLower.includes("hoc phi")) {
        botResponse =
          "Học phí hệ đại học chính quy khoảng 380.000đ - 460.000đ/tín chỉ tùy khối ngành kỹ thuật hay kinh tế (~14 - 18 triệu đồng/năm học).";
      } else {
        botResponse = `Hệ thống CSDL UTC cung cấp thông tin tra cứu tự động cho 35+ ngành học và các phương thức xét tuyển K66. Bạn có thể mở trang Hỏi Đáp AI Chuyên Sâu để trò chuyện chi tiết hơn!`;
        actionUrl = "/hoi-dap-ai";
        actionLabel = "Mở Trang Hỏi Đáp AI Đầy Đủ";
      }

      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: "bot",
        text: botResponse,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        actionUrl,
        actionLabel,
      };

      setMessages((prev) => [...prev, botMsg]);
      setIsTyping(false);
    }, 700);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Floating Modal Window */}
      {isOpen && (
        <div className="mb-4 w-[360px] sm:w-[420px] h-[540px] bg-[#fffdf7] border-[3px] border-[#111827] shadow-[6px_6px_0px_#111827] rounded-[16px] flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
          {/* Header */}
          <div className="bg-[#0284c7] text-white p-3.5 border-b-[3px] border-[#111827] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-[#fdb712] border-[2px] border-[#111827] flex items-center justify-center text-[#111827] font-bold shadow-[1.5px_1.5px_0px_#111827]">
                <span className="material-symbols-outlined text-[20px]">smart_toy</span>
              </div>
              <div>
                <h4 className="font-display font-bold text-[16px] leading-tight">
                  Hỏi Đáp AI Tuyển Sinh UTC
                </h4>
                <p className="text-[11px] text-[#e0f2fe] flex items-center gap-1 font-mono">
                  <span className="w-2 h-2 rounded-full bg-[#86efac] animate-pulse"></span>
                  Kết nối CSDL K66
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <Link
                href="/hoi-dap-ai"
                onClick={() => setIsOpen(false)}
                title="Mở toàn màn hình tại trang Hỏi Đáp AI"
                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/25 text-white flex items-center justify-center border border-white/20 transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">open_in_new</span>
              </Link>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                title="Đóng cửa sổ chat"
                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/25 text-white flex items-center justify-center border border-white/20 transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
          </div>

          {/* Disclaimer Banner Inside Chat */}
          <div className="bg-[#fef08a] px-3 py-1.5 border-b-[2px] border-[#111827] text-[11px] font-bold text-[#111827] flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[#ba1a1a] text-[16px]">info</span>
            <span>AI đồng bộ dữ liệu Tuyển sinh UTC (Hà Nội).</span>
          </div>

          {/* Messages Body */}
          <div className="flex-1 p-3 overflow-y-auto space-y-3 bg-[#faf3e6]">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${
                  msg.sender === "user" ? "items-end" : "items-start"
                }`}
              >
                <div
                  className={`max-w-[85%] p-3 text-[13px] leading-relaxed border-[2px] border-[#111827] shadow-[2px_2px_0px_#111827] ${
                    msg.sender === "user"
                      ? "bg-[#0284c7] text-white rounded-[12px] rounded-br-none"
                      : "bg-white text-[#111827] rounded-[12px] rounded-bl-none"
                  } space-y-2`}
                >
                  <p>{msg.text}</p>
                  {msg.actionUrl && (
                    <Link
                      href={msg.actionUrl}
                      onClick={() => setIsOpen(false)}
                      className="inline-flex items-center gap-1 text-[11.5px] font-black text-[#0284c7] hover:underline bg-[#f0f9ff] px-2 py-1 rounded border border-[#bae6fd]"
                    >
                      <span>{msg.actionLabel || "Xem chi tiết"}</span>
                      <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                    </Link>
                  )}
                </div>
                <span className="text-[10px] text-[#6b7280] mt-1 px-1 font-mono">{msg.time}</span>
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center gap-1 bg-white p-2.5 border-[2px] border-[#111827] shadow-[2px_2px_0px_#111827] rounded-[12px] w-fit">
                <span className="w-2 h-2 rounded-full bg-[#0284c7] animate-bounce"></span>
                <span className="w-2 h-2 rounded-full bg-[#0284c7] animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-2 h-2 rounded-full bg-[#0284c7] animate-bounce [animation-delay:0.4s]"></span>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Suggested Prompts */}
          <div className="px-3 py-2 bg-[#fffdf7] border-t-[2px] border-[#111827] flex gap-1.5 overflow-x-auto no-scrollbar">
            {suggestedQuestions.map((q, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSend(q)}
                className="shrink-0 text-[11px] font-bold bg-[#fff] hover:bg-[#ffdea8] text-[#111827] px-2.5 py-1 border-[1.5px] border-[#111827] shadow-[1px_1px_0px_#111827] rounded-[6px] transition-colors whitespace-nowrap cursor-pointer"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Input Footer */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 bg-white border-t-[3px] border-[#111827] flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Nhập câu hỏi cần tư vấn tuyển sinh..."
              className="flex-1 text-[13px] px-3 py-2 bg-[#faf3e6] border-[2px] border-[#111827] rounded-[8px] outline-none focus:bg-white font-medium"
            />
            <button
              type="submit"
              disabled={isTyping || !input.trim()}
              className="px-3 py-2 bg-[#0284c7] hover:bg-[#0369a1] disabled:opacity-50 text-white font-bold text-[13px] border-[2px] border-[#111827] shadow-[2px_2px_0px_#111827] active:translate-x-[1px] active:translate-y-[1px] rounded-[8px] flex items-center justify-center transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">send</span>
            </button>
          </form>
        </div>
      )}

      {/* Floating Toggle Controls */}
      {isMinimized ? (
        <button
          type="button"
          onClick={() => {
            setIsMinimized(false);
            setIsOpen(true);
          }}
          title="Mở Trợ Lý AI Tuyển Sinh"
          className="w-11 h-11 bg-[#0284c7] hover:bg-[#0369a1] text-white border-[2.5px] border-[#111827] shadow-[3px_3px_0px_#111827] rounded-full flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer group relative"
        >
          <span className="material-symbols-outlined text-[22px]">smart_toy</span>
          <span className="absolute right-full mr-2 px-2 py-1 bg-[#111827] text-white text-[11px] font-bold rounded shadow-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            Mở AI Chat
          </span>
        </button>
      ) : (
        <div className="flex items-center gap-1.5 bg-transparent">
          {/* Small minimize button to tuck away and avoid blocking content */}
          <button
            type="button"
            onClick={() => setIsMinimized(true)}
            title="Thu nhỏ nút AI Chat để không che nội dung"
            className="w-7 h-7 bg-[#fffdf7] hover:bg-[#ffdea8] text-[#111827] border-[2px] border-[#111827] shadow-[2px_2px_0px_#111827] rounded-full flex items-center justify-center transition-all cursor-pointer hover:scale-105 active:scale-95 shrink-0"
          >
            <span className="material-symbols-outlined text-[16px]">visibility_off</span>
          </button>

          {/* Full AI Chat Toggle Button */}
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-2 px-4 py-2 bg-[#0284c7] hover:bg-[#0369a1] text-white font-extrabold text-[14px] border-[2.5px] border-[#111827] shadow-[3px_3px_0px_#111827] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all rounded-full cursor-pointer"
          >
            <span className="font-display tracking-wider">AI CHAT</span>
            <span className="material-symbols-outlined text-[20px]">smart_toy</span>
          </button>
        </div>
      )}
    </div>
  );
}

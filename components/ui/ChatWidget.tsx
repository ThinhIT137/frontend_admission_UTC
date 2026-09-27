"use client";

import { useState, useRef, useEffect } from "react";

interface Message {
  id: string;
  sender: "user" | "bot";
  text: string;
  time: string;
}

const initialMessages: Message[] = [
  {
    id: "1",
    sender: "bot",
    text: "Xin chào bạn! Mình là Trợ lý AI Tuyển sinh UTC 2026. Mình có thể giúp bạn giải đáp điều gì về quy chế, điểm chuẩn hay ngành học hôm nay?",
    time: "Vừa xong",
  },
];

const suggestedQuestions = [
  "Điểm chuẩn ngành CNTT năm 2025 là bao nhiêu?",
  "Cách quy đổi điểm IELTS sang thang điểm UTC?",
  "Chỉ tiêu tuyển sinh K66 là bao nhiêu?",
  "Trường có những cơ sở đào tạo nào?",
];

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

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

    setTimeout(() => {
      let botResponse = "Cảm ơn bạn đã đặt câu hỏi. ";
      if (query.toLowerCase().includes("cntt") || query.toLowerCase().includes("công nghệ thông tin")) {
        botResponse += "Ngành Công nghệ Thông tin (mã ngành 7480201) tại UTC năm 2025 có điểm chuẩn xét tuyển THPT là 25.85 điểm (khối A00, A01). Chỉ tiêu tuyển sinh khoảng 320 sinh viên.";
      } else if (query.toLowerCase().includes("quy đổi") || query.toLowerCase().includes("ielts")) {
        botResponse += "Điểm IELTS từ 5.0 được quy đổi thành 8.0 điểm môn Tiếng Anh, IELTS 6.0 = 9.0 điểm, IELTS 6.5+ = 10.0 điểm trong tổ hợp xét tuyển của UTC.";
      } else if (query.toLowerCase().includes("chỉ tiêu")) {
        botResponse += "Tổng chỉ tiêu tuyển sinh K66 năm 2026 dự kiến là 6.000 sinh viên (Hà Nội: 4.500 chỉ tiêu, Phân hiệu TP.HCM: 1.500 chỉ tiêu).";
      } else {
        botResponse += "Hệ thống UTC cung cấp thông tin tra cứu tự động cho 35+ ngành đào tạo. Bạn có thể tham khảo mục Tra cứu ngành học hoặc liên hệ Hotline (024) 3766 3311 để được hướng dẫn chi tiết.";
      }

      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: "bot",
        text: botResponse,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, botMsg]);
      setIsTyping(false);
    }, 800);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Floating Modal Window */}
      {isOpen && (
        <div className="mb-4 w-[360px] sm:w-[420px] h-[520px] bg-[#fffdf7] border-[3px] border-[#111827] shadow-[6px_6px_0px_#111827] rounded-[16px] flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
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
                  Trực tuyến 24/7
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center border border-white/20 transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>

          {/* Disclaimer Banner Inside Chat */}
          <div className="bg-[#fef08a] px-3 py-1.5 border-b-[2px] border-[#111827] text-[11px] font-bold text-[#111827] flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[#ba1a1a] text-[16px]">info</span>
            <span>AI có thể phản hồi chậm hoặc nhầm lẫn, hãy kiểm tra lại thông tin chính thức!</span>
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
                  }`}
                >
                  {msg.text}
                </div>
                <span className="text-[10px] text-[#6b7280] mt-1 px-1">{msg.time}</span>
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
                onClick={() => handleSend(q)}
                className="shrink-0 text-[11px] font-bold bg-[#fff] hover:bg-[#ffdea8] text-[#111827] px-2.5 py-1 border-[1.5px] border-[#111827] shadow-[1px_1px_0px_#111827] rounded-[6px] transition-colors whitespace-nowrap"
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
              className="px-3 py-2 bg-[#0284c7] hover:bg-[#0369a1] text-white font-bold text-[13px] border-[2px] border-[#111827] shadow-[2px_2px_0px_#111827] active:translate-x-[1px] active:translate-y-[1px] rounded-[8px] flex items-center justify-center transition-all"
            >
              <span className="material-symbols-outlined text-[18px]">send</span>
            </button>
          </form>
        </div>
      )}

      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2.5 bg-[#0284c7] hover:bg-[#0369a1] text-white font-extrabold text-[15px] border-[3px] border-[#111827] shadow-[4px_4px_0px_#111827] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all rounded-full cursor-pointer"
      >
        <span className="font-display tracking-wider">AI CHAT</span>
        <span className="material-symbols-outlined text-[22px]">smart_toy</span>
      </button>
    </div>
  );
}

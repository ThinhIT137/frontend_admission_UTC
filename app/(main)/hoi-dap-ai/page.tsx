"use client";

import { useState } from "react";
import { DisclaimerBanner } from "@/components/ui/DisclaimerBanner";

export default function AIChatPage() {
  const [messages, setMessages] = useState([
    {
      id: "1",
      sender: "bot",
      text: "Xin chào bạn! Mình là Trợ lý AI Tuyển sinh UTC. Mình đã học toàn bộ Đề án tuyển sinh, điểm chuẩn 5 năm qua và thông tin 35+ ngành của Trường ĐH Giao thông Vận tải. Bạn cần tư vấn điều gì?",
      time: "Vừa xong",
    },
  ]);
  const [input, setInput] = useState("");

  const handleSend = (textToSend?: string) => {
    const q = (textToSend || input).trim();
    if (!q) return;

    const userMsg = {
      id: Date.now().toString(),
      sender: "user",
      text: q,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput("");

    setTimeout(() => {
      const botMsg = {
        id: (Date.now() + 1).toString(),
        sender: "bot",
        text: `Cảm ơn bạn đã hỏi: "${q}". Dựa trên Đề án tuyển sinh UTC 2026, thông tin liên quan đến câu hỏi của bạn được cập nhật trực tiếp từ Hội đồng tuyển sinh. Bạn có thể tham khảo thêm tại mục Tra cứu ngành học hoặc liên hệ Hotline (024) 3766 3311.`,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, botMsg]);
    }, 600);
  };

  return (
    <div className="flex flex-col w-full space-y-6 pb-12">
      {/* Title */}
      <div className="bg-[#fffdf7] p-6 border-[3px] border-[#111827] shadow-[5px_5px_0px_#111827] rounded-[16px] relative">
        <div className="absolute -top-3 left-6 px-3 py-0.5 bg-[#38bdf8] border-[2px] border-[#111827] font-stamp text-[11px] font-bold text-[#111827] uppercase rotate-[-2deg] shadow-[1px_1px_0px_#111827]">
          TRỢ LÝ VẢO UTC 24/7
        </div>
        <h1 className="font-display font-extrabold text-[28px] lg:text-[34px] text-[#111827] uppercase mt-2">
          HỎI ĐÁP AI TUYỂN SINH UTC
        </h1>
        <p className="text-[14px] text-[#4b5563] font-medium mt-1">
          Hệ thống AI tự động giải đáp mọi thắc mắc về điểm chuẩn, phương thức xét tuyển, ngành học và thủ tục nhập học.
        </p>
      </div>

      <DisclaimerBanner />

      {/* Main Chat Box */}
      <div className="bg-white border-[3px] border-[#111827] shadow-[6px_6px_0px_#111827] rounded-[16px] overflow-hidden flex flex-col h-[560px]">
        {/* Header */}
        <div className="bg-[#0284c7] text-white p-4 border-b-[3px] border-[#111827] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#fdb712] border-[2px] border-[#111827] text-[#111827] flex items-center justify-center font-bold">
              <span className="material-symbols-outlined text-[24px]">smart_toy</span>
            </div>
            <div>
              <h3 className="font-display font-bold text-[18px]">UTC AI CONSULTANT</h3>
              <p className="text-[11px] text-[#e0f2fe] font-mono">Model: Gemini UTC K66 Edition</p>
            </div>
          </div>
        </div>

        {/* Chat History */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-[#faf3e6]">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex flex-col ${
                m.sender === "user" ? "items-end" : "items-start"
              }`}
            >
              <div
                className={`max-w-[80%] p-4 text-[14px] leading-relaxed border-[2.5px] border-[#111827] shadow-[3px_3px_0px_#111827] ${
                  m.sender === "user"
                    ? "bg-[#0284c7] text-white rounded-[14px] rounded-br-none"
                    : "bg-white text-[#111827] rounded-[14px] rounded-bl-none"
                }`}
              >
                {m.text}
              </div>
              <span className="text-[11px] text-[#6b7280] mt-1 px-1">{m.time}</span>
            </div>
          ))}
        </div>

        {/* Prompt Suggestions */}
        <div className="px-4 py-2.5 bg-[#fffdf7] border-t-[2px] border-[#111827] flex gap-2 overflow-x-auto">
          {[
            "Điểm chuẩn ngành Logistics 2025?",
            "Quy đổi điểm IELTS 6.5?",
            "Chỉ tiêu K66 Hà Nội?",
            "Hồ sơ xét tuyển học bạ?",
          ].map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(prompt)}
              className="shrink-0 text-[12px] font-bold bg-white hover:bg-[#ffdea8] text-[#111827] px-3 py-1 border-[1.5px] border-[#111827] shadow-[1.5px_1.5px_0px_#111827] rounded-[6px] transition-colors"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Form Input */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="p-4 bg-white border-t-[3px] border-[#111827] flex items-center gap-3"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Hỏi bất kỳ điều gì về tuyển sinh UTC..."
            className="flex-1 px-4 py-2.5 bg-[#faf3e6] border-[2px] border-[#111827] rounded-[10px] text-[14px] font-medium outline-none"
          />
          <button
            type="submit"
            className="px-5 py-2.5 bg-[#0284c7] hover:bg-[#0369a1] text-white font-bold text-[14px] border-[2.5px] border-[#111827] shadow-[3px_3px_0px_#111827] active:translate-x-[1px] active:translate-y-[1px] rounded-[10px] flex items-center gap-1 transition-all"
          >
            <span>Gửi</span>
            <span className="material-symbols-outlined text-[18px]">send</span>
          </button>
        </form>
      </div>
    </div>
  );
}

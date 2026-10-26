"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowUpRight, Bot, ChevronDown, Send, Sparkles, X } from "lucide-react";
import ChatTyping from "./ChatTyping";
import { api, BrowserApiError } from "@/libs/api-services/browser-api";

type Message = { id: string; sender: "user" | "bot"; text: string; failed?: boolean };
const questions = ["Các phương thức xét tuyển GHA?", "Điểm chuẩn CNTT năm 2026?", "IELTS được cộng điểm thế nào?"];

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([{ id: "welcome", sender: "bot", text: "Chào bạn! Mình có thể hỗ trợ tìm hiểu chương trình đào tạo, điểm chuẩn và thông tin tuyển sinh UTC tại Hà Nội. Bạn muốn tìm hiểu điều gì?" }]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showQuickQuestions, setShowQuickQuestions] = useState(true);
  const pending = useRef(false);
  const sessionId = useRef<string | undefined>(undefined);
  const body = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const reduced = useReducedMotion();
  const close = () => { setIsOpen(false); trigger.current?.focus(); };

  useEffect(() => {
    if (!isOpen) return;
    const timer = window.setTimeout(() => inputRef.current?.focus(), 100);
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") { setIsOpen(false); trigger.current?.focus(); } };
    window.addEventListener("keydown", onKey);
    return () => { window.clearTimeout(timer); window.removeEventListener("keydown", onKey); };
  }, [isOpen]);
  useEffect(() => {
    // Chỉ cuộn vùng hội thoại, không kéo cả trang phía sau popup.
    body.current?.scrollTo({ top: body.current.scrollHeight, behavior: reduced ? "auto" : "smooth" });
  }, [messages, isTyping, isOpen, reduced]);

  const handleSend = async (suggestion?: string) => {
    const query = (suggestion ?? input).trim();
    if (!query || pending.current) return;
    pending.current = true; setInput(""); setIsTyping(true); setShowQuickQuestions(false);
    setMessages(previous => [...previous, { id: crypto.randomUUID(), sender: "user", text: query }]);
    try {
      // Dùng cùng API với /hoi-dap-ai, không trả lời bằng dữ liệu viết cứng.
      const response = await api<{ success: boolean; data: { answer: string; session_id: string } }>("ai", "/api/chat", { message: query, session_id: sessionId.current });
      if (!response.data?.answer?.trim()) throw new Error("Empty answer");
      sessionId.current = response.data.session_id;
      setMessages(previous => [...previous, { id: crypto.randomUUID(), sender: "bot", text: response.data.answer }]);
    } catch (error) {
      setMessages(previous => [...previous, { id: crypto.randomUUID(), sender: "bot", failed: true, text: error instanceof BrowserApiError ? error.message : "Chưa nhận được phản hồi từ dịch vụ tư vấn. Bạn thử gửi lại sau hoặc mở trang hỏi đáp đầy đủ nhé." }]);
    } finally { pending.current = false; setIsTyping(false); }
  };

  return <div className="fixed bottom-6 right-5 z-50 sm:right-7">
    <AnimatePresence>
      {isOpen && <motion.section id="utc-chat-panel" role="dialog" aria-modal="false" aria-labelledby="utc-chat-title"
        initial={{ opacity: 0, y: reduced ? 0 : 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: reduced ? 0 : 8 }} transition={{ duration: reduced ? 0 : .18 }}
        className="absolute bottom-16 right-0 flex h-[min(600px,calc(100dvh-112px))] w-[calc(100vw-40px)] max-w-[400px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_16px_64px_rgba(15,35,75,0.2)]">
        <header className="flex shrink-0 items-center justify-between gap-2 bg-gradient-to-br from-[#14244e] to-[#264680] p-4 text-white">
          <div className="flex min-w-0 items-center gap-3"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-400 text-blue-950"><Bot size={23} aria-hidden="true" /></div><div><h2 id="utc-chat-title" className="text-sm font-bold">Trợ lý tuyển sinh UTC</h2><p className="mt-0.5 text-xs text-blue-100">Hà Nội · Mã trường GHA</p></div></div>
          <div className="flex shrink-0 gap-1"><Link href="/hoi-dap-ai" onClick={close} aria-label="Mở trang hỏi đáp đầy đủ" title="Mở trang hỏi đáp đầy đủ" className="flex h-10 w-10 items-center justify-center rounded-lg hover:bg-white/15 focus-visible:outline-2 focus-visible:outline-white"><ArrowUpRight size={20} /></Link><button type="button" onClick={close} aria-label="Đóng trò chuyện" className="flex h-10 w-10 items-center justify-center rounded-lg hover:bg-white/15 focus-visible:outline-2 focus-visible:outline-white"><X size={20} /></button></div>
        </header>
        <div className="flex shrink-0 items-center gap-2 border-b border-blue-100 bg-blue-50 px-4 py-2.5 text-xs leading-5 text-slate-600"><Sparkles size={14} className="shrink-0 text-blue-700" aria-hidden="true" />Thông tin AI để tham khảo. Đối chiếu thông báo của trường.</div>
        <div ref={body} role="log" aria-label="Nội dung trò chuyện" aria-live="polite" aria-relevant="additions" className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain bg-slate-50/80 p-4">
          {messages.map(message => <div key={message.id} className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}><div className={`max-w-[90%] whitespace-pre-wrap break-words rounded-2xl px-4 py-3 text-sm leading-6 ${message.sender === "user" ? "rounded-br-md bg-[#1e3a70] text-white" : message.failed ? "border border-amber-200 bg-amber-50 text-amber-900" : "rounded-bl-md border border-slate-200 bg-white text-slate-700 shadow-sm"}`}>{message.text}</div></div>)}
          {isTyping && <ChatTyping />}
        </div>
        <div className="shrink-0 border-t border-slate-100 bg-white px-4 py-2">
          <button type="button" aria-expanded={showQuickQuestions} aria-controls="widget-quick-questions" onClick={() => setShowQuickQuestions(value => !value)} className="flex min-h-9 items-center gap-2 text-xs font-semibold text-blue-800"><Sparkles size={14} aria-hidden="true" />{showQuickQuestions ? "Ẩn hỏi nhanh" : "Mở hỏi nhanh"}<ChevronDown size={14} aria-hidden="true" className={showQuickQuestions ? "rotate-180" : ""} /></button>
          {showQuickQuestions && <div id="widget-quick-questions" className="flex flex-wrap gap-1.5 pb-1">{questions.map(question => <button key={question} type="button" disabled={isTyping} onClick={() => void handleSend(question)} className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-2 text-left text-xs leading-4 text-slate-600 transition-colors hover:border-blue-300 hover:bg-blue-50 disabled:opacity-50">{question}</button>)}</div>}
        </div>
        <form onSubmit={event => { event.preventDefault(); void handleSend(); }} className="flex shrink-0 items-center gap-2 border-t border-slate-100 bg-white p-3">
          <input ref={inputRef} value={input} onChange={event => setInput(event.target.value)} maxLength={2000} aria-label="Câu hỏi tuyển sinh" placeholder="Bạn muốn hỏi điều gì?" className="h-11 min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
          <button type="submit" disabled={isTyping || !input.trim()} aria-label="Gửi câu hỏi" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-950 text-white transition-colors hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"><Send size={18} aria-hidden="true" /></button>
        </form>
      </motion.section>}
    </AnimatePresence>
    <button ref={trigger} type="button" onClick={() => setIsOpen(value => !value)} aria-expanded={isOpen} aria-controls="utc-chat-panel" aria-label={isOpen ? "Thu gọn trò chuyện" : "Mở trợ lý tuyển sinh UTC"}
      className="flex h-12 items-center gap-2 rounded-full border border-blue-800 bg-[#14244e] px-4 text-sm font-semibold text-white shadow-lg transition-colors hover:bg-blue-900 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-500">
      {isOpen ? <ChevronDown size={21} aria-hidden="true" /> : <Bot size={21} className="text-amber-300" aria-hidden="true" />}<span>{isOpen ? "Thu gọn" : "Hỏi UTC"}</span>
    </button>
  </div>;
}

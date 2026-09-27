"use client";

import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ChatWidget } from "@/components/ui/ChatWidget";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-[#f4ede0] font-body-md text-[#1e1b14] antialiased min-h-screen relative selection:bg-[#fdb712] selection:text-[#000525]">
      {/* Fixed Left Sidebar */}
      <Sidebar />

      {/* Main Content Wrapper (shifted by sidebar width 72 = 288px) */}
      <div className="pl-72 flex flex-col min-h-screen">
        {/* Fixed Header */}
        <Header />

        {/* Dynamic Page Content */}
        <main className="w-full pt-16 bg-[#f4ede0] flex-1 relative px-6 py-6">
          {children}
        </main>

        {/* Client Footer */}
        <Footer />
      </div>

      {/* Floating AI Consultation Chatbot */}
      <ChatWidget />
    </div>
  );
}

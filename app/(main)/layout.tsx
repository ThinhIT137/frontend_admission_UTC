"use client";

import { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { ChatWidget } from "@/components/ui/ChatWidget";
import { LoadingProvider } from "@/contexts/loadingContext";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  return (
    <div className="bg-[#f4ede0] font-body-md text-[#1e1b14] antialiased min-h-screen relative selection:bg-[#fdb712] selection:text-[#000525] overflow-x-clip">
      {/* Sidebar with slide transition */}
      <div className="print:hidden">
        <Sidebar isOpen={isSidebarOpen} onToggle={toggleSidebar} />
      </div>

      {/* Main Content Wrapper (shifted when sidebar is open) */}
      <div
        className={`flex flex-col min-h-screen transition-all duration-300 ease-in-out print:pl-0 print:m-0 print:bg-white ${
          isSidebarOpen ? "pl-72" : "pl-0"
        }`}
      >
        {/* Fixed Header with transition */}
        <div
          className={`fixed top-0 right-0 z-40 transition-all duration-300 ease-in-out print:hidden ${
            isSidebarOpen ? "left-72" : "left-0"
          }`}
        >
          <Header isSidebarOpen={isSidebarOpen} onToggleSidebar={toggleSidebar} />
        </div>

        {/* Dynamic Page Content */}
        <main className="w-full pt-16 bg-[#f4ede0] flex-1 relative px-4 sm:px-6 py-6 print:p-0 print:pt-0 print:bg-white">
          <LoadingProvider>{children}</LoadingProvider>
        </main>

        {/* Client Footer */}
        <div className="print:hidden">
          <Footer />
        </div>
      </div>

      {/* Floating AI Consultation Chatbot */}
      <div className="print:hidden">
        <ChatWidget />
      </div>
    </div>
  );
}

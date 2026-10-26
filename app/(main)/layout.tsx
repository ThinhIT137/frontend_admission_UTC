"use client";

import { Sidebar } from "@/components/layout/Sidebar";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { ChatWidget } from "@/components/ui/ChatWidget";
import { LoadingProvider } from "@/contexts/loadingContext";
import { AnimatePresence, MotionConfig, motion } from "motion/react";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export default function ClientLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isMobile, setIsMobile] = useState(false);
    const [viewportReady, setViewportReady] = useState(false);
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
    const pathname = usePathname();
    const isChatPage = pathname === "/hoi-dap-ai";
    const drawerRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        if (!isMobileSidebarOpen) return;
        const previous = document.activeElement as HTMLElement | null;
        const bodyOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        const drawer = drawerRef.current;
        const getItems = () =>
            Array.from(
                drawer?.querySelectorAll<HTMLElement>(
                    "a[href], button:not([disabled])",
                ) ?? [],
            );
        getItems()[0]?.focus();
        const keydown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                event.preventDefault();
                setIsMobileSidebarOpen(false);
            }
            if (event.key === "Tab") {
                const items = getItems();
                const first = items[0];
                const last = items[items.length - 1];
                if (event.shiftKey && document.activeElement === first) {
                    event.preventDefault();
                    last?.focus();
                } else if (!event.shiftKey && document.activeElement === last) {
                    event.preventDefault();
                    first?.focus();
                }
            }
        };
        document.addEventListener("keydown", keydown);
        return () => {
            document.body.style.overflow = bodyOverflow;
            document.removeEventListener("keydown", keydown);
            previous?.focus();
        };
    }, [isMobileSidebarOpen]);

    useEffect(() => {
        const media = window.matchMedia("(min-width: 768px)");
        const update = () => {
            setIsMobile(!media.matches);
            setViewportReady(true);
            if (media.matches) setIsMobileSidebarOpen(false);
        };
        update();
        media.addEventListener("change", update);
        return () => media.removeEventListener("change", update);
    }, []);
    useEffect(() => {
        setIsMobileSidebarOpen(false);
    }, [pathname]);

    const toggleSidebar = () => {
        if (window.matchMedia("(min-width: 768px)").matches)
            setIsSidebarOpen((prev) => !prev);
        else setIsMobileSidebarOpen((prev) => !prev);
    };

    return (
        <MotionConfig reducedMotion="user">
            <div className="bg-[#f6f8fc] font-body-md text-[#1e1b14] antialiased min-h-screen relative selection:bg-[#fdb712] selection:text-[#000525] overflow-x-clip">
                {/* Sidebar with slide transition */}
                {/* Mobile dùng menu phủ lên nội dung, desktop chừa đúng chiều rộng thanh điều hướng. */}
                <AnimatePresence>
                    {isMobileSidebarOpen && (
                        <motion.button
                            key="drawer-backdrop"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            type="button"
                            aria-label="Đóng menu điều hướng"
                            onClick={() => setIsMobileSidebarOpen(false)}
                            className="fixed inset-0 z-40 bg-black/40 md:hidden print:hidden"
                        />
                    )}
                </AnimatePresence>
                <div
                    ref={drawerRef}
                    role={isMobileSidebarOpen ? "dialog" : undefined}
                    aria-modal={isMobileSidebarOpen ? true : undefined}
                    aria-label={
                        isMobileSidebarOpen ? "Menu tuyển sinh" : undefined
                    }
                    className={`${viewportReady ? "" : "hidden md:block"} ${isMobileSidebarOpen ? "fixed inset-y-0 left-0 z-50 w-[244px]" : ""} print:hidden`}
                >
                    <Sidebar
                        key={viewportReady ? "ready" : "ssr"}
                        isOpen={isMobile ? isMobileSidebarOpen : isSidebarOpen}
                        onToggle={toggleSidebar}
                    />
                </div>

                {/* Main Content Wrapper (shifted when sidebar is open) */}
                <div
                    className={`flex flex-col min-h-screen transition-all duration-300 ease-in-out print:pl-0 print:m-0 print:bg-white ${
                        isSidebarOpen ? "pl-0 md:pl-[244px]" : "pl-0"
                    }`}
                >
                    {/* Fixed Header with transition */}
                    <div
                        className={`fixed top-0 right-0 z-40 transition-all duration-300 ease-in-out print:hidden ${
                            isSidebarOpen ? "left-0 md:left-[244px]" : "left-0"
                        }`}
                    >
                        <Header
                            isSidebarOpen={
                                isMobile ? isMobileSidebarOpen : isSidebarOpen
                            }
                            onToggleSidebar={toggleSidebar}
                        />
                    </div>

                    {/* Dynamic Page Content */}
                    <main className={isChatPage ? "h-dvh w-full overflow-hidden bg-[#f6f8fc] px-3 pb-3 pt-20 sm:px-6 sm:pb-5" : "w-full pt-24 bg-[#f6f8fc] flex-1 relative px-4 sm:px-6 py-6 print:p-0 print:pt-0 print:bg-white"}>
                        <LoadingProvider>{children}</LoadingProvider>
                    </main>

                    {/* Client Footer */}
                    <div className={isChatPage ? "hidden" : "print:hidden"}>
                        <Footer />
                    </div>
                </div>

                {/* Floating AI Consultation Chatbot */}
                <div className="print:hidden">
                    {!isChatPage && <ChatWidget />}
                </div>
            </div>
        </MotionConfig>
    );
}

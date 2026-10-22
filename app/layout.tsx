import type { Metadata } from "next";
import { Toaster } from "sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: "Cổng Tuyển Sinh Đại Học Giao Thông Vận Tải - UTC",
  description: "Hệ thống tư vấn & hỗ trợ thông tin tuyển sinh Đại học Giao thông Vận tải (UTC Cơ sở Hà Nội)",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:ital,wght@0,400;0,500;0,600;0,700;0,800;0,900;1,400&family=Space+Grotesk:wght@500;600;700&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        suppressHydrationWarning
        className="antialiased selection:bg-[#fdb712] selection:text-[#000525] bg-[#f4ede0] text-[#1e1b14] min-h-screen"
      >
        <Toaster richColors position="top-right" />
        {children}
      </body>
    </html>
  );
}

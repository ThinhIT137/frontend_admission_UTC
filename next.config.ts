import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep browser-test builds separate from the developer's running server.
  distDir: process.env.ADMISSION_LIVE_SCORE === "1" ? ".next-live-tests" : process.env.ADMISSION_E2E === "1" ? ".next-tests" : ".next",
};

export default nextConfig;

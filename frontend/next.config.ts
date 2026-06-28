import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  devIndicators: false,
  // Monorepo layout: app lives in frontend/, repo root has its own package-lock.json
  outputFileTracingRoot: path.join(__dirname, ".."),
};

export default nextConfig;

import path from "path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    // Prevent Next.js from picking the parent PayRecover folder as the workspace root
    root: path.resolve(__dirname),
  },
};

export default nextConfig;

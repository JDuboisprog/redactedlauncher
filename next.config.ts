import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverComponentsExternalPackages: [
      "@solana/web3.js",
      "@solana/spl-token",
      "@upstash/redis",
    ],
  },
};

export default nextConfig;

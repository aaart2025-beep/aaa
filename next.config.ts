import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // Pin the workspace root — a stray lockfile in the home dir otherwise confuses Turbopack.
  turbopack: {
    root: path.join(__dirname),
  },
  // Admin-uploaded product images live on Vercel Blob; allow next/image to
  // optimise/serve them.
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.blob.vercel-storage.com" },
    ],
  },
};

export default nextConfig;

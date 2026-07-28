import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // Pin the workspace root — a stray lockfile in the home dir otherwise confuses Turbopack.
  turbopack: {
    root: path.join(__dirname),
  },
};

export default nextConfig;

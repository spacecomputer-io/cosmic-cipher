import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  basePath: "/password-generator",
  reactStrictMode: true,
  output: "standalone",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;

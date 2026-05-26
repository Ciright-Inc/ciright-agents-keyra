import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  outputFileTracingRoot: __dirname,
  async redirects() {
    return [
      { source: "/favicon.ico", destination: "/favicon.svg", permanent: false },
      { source: "/favicon.png", destination: "/favicon.svg", permanent: false },
    ];
  },
};

export default nextConfig;

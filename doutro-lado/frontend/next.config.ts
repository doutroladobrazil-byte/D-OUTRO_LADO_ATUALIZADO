import type { NextConfig } from "next";

const internalApiPort = process.env.INTERNAL_API_PORT || 4000;

const nextConfig: NextConfig = {
  reactStrictMode: true,
  typedRoutes: false,
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `http://127.0.0.1:${internalApiPort}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;

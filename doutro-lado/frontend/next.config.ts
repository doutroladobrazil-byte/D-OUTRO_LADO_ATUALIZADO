import type { NextConfig } from "next";

const internalApiPort = process.env.INTERNAL_API_PORT || 4000;

// Security headers applied to every response from the Next.js server.
// These are complementary to helmet on the Express backend — they cover the
// storefront HTML pages, static assets, and API route responses from Next.js.
const securityHeaders = [
  // Prevent MIME type sniffing — forces browsers to respect Content-Type.
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Block the page from being embedded in an iframe (clickjacking protection).
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  // Legacy XSS filter (still respected by some older browsers).
  { key: "X-XSS-Protection", value: "1; mode=block" },
  // Controls how much referrer information is sent with requests.
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Disable browser features not needed by this storefront.
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  typedRoutes: false,

  images: {
    remotePatterns: [
      // Supabase Storage — product media (images uploaded via admin)
      {
        protocol: "https",
        hostname: "oazybcxrzxpvpavporrm.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },

  async headers() {
    return [
      {
        // Apply to all routes — HTML, API responses served by Next.js, and static assets.
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },

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

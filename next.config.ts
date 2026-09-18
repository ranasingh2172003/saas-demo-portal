import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/api/whatsapp/:path*',
        destination: 'http://localhost:3000/api/:path*',
      },
    ]
  },
};

export default nextConfig;

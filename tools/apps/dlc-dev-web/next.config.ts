import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  // Proxy API requests to backend in development
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:30089'}/:path*`,
      },
    ];
  },
};

export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  async rewrites() {
    return [
      { source: "/admin/:path*", destination: "/dashboard/admin/:path*" },
    ];
  },
};

export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    authInterrupts: true,
    serverActions: {
      allowedOrigins: [
        'localhost',
        'localhost:8000',
        'dev.inovabi.com',
        'inovabi.com',
      ],
    },
  },
};

export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '100mb'
    },
  },
  images: {
    domains: ['blogger.googleusercontent.com','i.sstatic.net','res.cloudinary.com'],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  webpack: (config) => {
    config.externals = [...(config.externals || []), '@valkey/valkey-glide'];
    return config;
  },
};

export default nextConfig;
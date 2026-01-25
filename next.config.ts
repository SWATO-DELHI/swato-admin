import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */

  // Allow images from Supabase storage and other external sources
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'efkkythybfgphuzyeebh.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.googleusercontent.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;

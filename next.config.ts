import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,  // Enable React Strict Mode for better error handling

  // No need to include swcMinify or runtime here in the config for Next.js 15.3.1
};

export default nextConfig;

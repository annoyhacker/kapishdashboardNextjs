import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
    experimental: {
        // Allow middleware to run under Node.js instead of the Edge runtime
        nodeMiddleware: true,
    },
    // …any other config options
};

export default nextConfig;

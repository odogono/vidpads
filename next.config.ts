import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  async headers() {
    // Only apply headers in development
    if (process.env.NODE_ENV === 'development') {
      return [
        {
          source: '/:path*',
          headers: [
            {
              key: 'Cross-Origin-Embedder-Policy',
              value: 'unsafe-none',
            },
            {
              key: 'Cross-Origin-Opener-Policy',
              value: 'same-origin',
            },
          ],
        },
      ];
    }
    return []; // Return empty array in production
  },
};

export default nextConfig;

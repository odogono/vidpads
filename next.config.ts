import type { NextConfig } from 'next';

import packageJson from './package.json';

// import linguiConfig from './lingui.config';

const nextConfig: NextConfig = {
  output: 'standalone',
  reactStrictMode: true,

  env: {
    VERSION: packageJson.version
  },

  experimental: {
    turbo: {}
  },
  // i18n: {
  //   locales: linguiConfig.locales,
  //   defaultLocale: linguiConfig.sourceLocale as string
  // },
  headers: async () => {
    // Only apply headers in development
    if (process.env.NODE_ENV === 'development') {
      return [
        {
          source: '/:path*',
          headers: [
            {
              key: 'Cross-Origin-Embedder-Policy',
              value: 'unsafe-none'
            },
            {
              key: 'Cross-Origin-Opener-Policy',
              value: 'same-origin'
            }
          ]
        }
      ];
    }
    return []; // Return empty array in production
  }
};

export default nextConfig;

import type { NextConfig } from 'next';

import packageJson from './package.json';

// import linguiConfig from './lingui.config';

const nextConfig: NextConfig = {
  output: 'standalone',
  reactStrictMode: true,

  env: {
    BUILT_AT: process.env.NEXT_PUBLIC_BUILT_AT,
    VERSION: packageJson.version
  },

  experimental: {
    swcPlugins: [['@lingui/swc-plugin', {}]],
    turbo: {
      rules: {
        '*.po': {
          loaders: ['@lingui/loader'],
          as: '*.ts'
        }
      }
    }
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
  },
  webpack: (config) => {
    config.module.rules.push({
      test: /\.po$/,
      use: {
        loader: '@lingui/loader' // https://github.com/lingui/js-lingui/issues/1782
      }
    });

    return config;
  }
};

export default nextConfig;

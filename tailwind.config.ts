/* eslint-disable @typescript-eslint/no-require-imports */
import type { Config } from 'tailwindcss';

const { heroui } = require('@heroui/react');

export default {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        c0: 'var(--c0)',
        c1: 'var(--c1)',
        c2: 'var(--c2)',
        c3: 'var(--c3)',
        c4: 'var(--c4)',
        c5: 'var(--c5)',
        c6: 'var(--c6)',
        c7: 'var(--c7)',
        c8: 'var(--c8)',
        c9: 'var(--c9)',
        c10: 'var(--c10)',
        page: 'var(--page)',
        'video-off': 'var(--video-off)',
        selected: 'var(--selected)',
        pad: 'var(--pad)',
        'pad-over': 'var(--pad-over)',
        bin: 'var(--bin)',
        'bin-over': 'var(--bin-over)'
      },
      fontFamily: {
        sans: ['var(--font-inter)'],
        mono: ['var(--font-kode-mono)'],
        suse: ['var(--font-suse)']
      },
      keyframes: {
        'pad-pulse': {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.05)' }
        },
        'opacity-pulse': {
          '0%, 100%': { opacity: '0.1' },
          '50%': { opacity: '0.2' }
        }
      },
      animation: {
        'pad-pulse': 'pad-pulse 1s ease-in-out infinite',
        'opacity-pulse': 'opacity-pulse 1s ease-in-out infinite'
      },
      minHeight: {
        '1/2': '50%'
      },
      screens: {
        sm: '480px',
        md: '834px',
        lg: '1440px',
        'touch-none': { raw: '(pointer: coarse)' }
      }
    }
  },
  darkMode: 'class',
  plugins: [
    require('tailwindcss-motion'),
    heroui({
      themes: {
        'vo-theme': {
          variables: {
            '--heroui-divider-color': 'var(--foreground)',
            '--heroui-divider-opacity': '0.3'
          },
          colors: {
            background: 'var(--background)',
            foreground: 'var(--foreground)',
            default: {
              50: '#e6f5fd',
              100: '#cedde1',
              200: '#b4c6ca',
              300: '#344749',
              400: '#7d979b',
              500: '#647d82',
              600: '#4c6166',
              700: '#344749',
              800: '#1b2b2d',
              900: '#001111',
              DEFAULT: '#647d82',
              foreground: 'var(--foreground)'
            },
            primary: {
              50: '#e6f5fd',
              100: '#cedde1',
              200: '#b4c6ca',
              300: '#98aeb2',
              400: '#7d979b',
              500: '#647d82',
              600: '#4c6166',
              700: '#344749',
              800: '#1b2b2d',
              900: '#001111',
              DEFAULT: '#98aeb2',
              foreground: 'var(--foreground)'
            },
            secondary: {
              50: '#e6f7f7',
              100: '#cfdfe0',
              200: '#b5c8ca',
              300: '#99b2b4',
              400: '#7d9b9f',
              500: '#638185',
              600: '#4c6567',
              700: '#35484a',
              800: '#1d2c2e',
              900: '#001014',
              DEFAULT: '#7d9b9f',
              foreground: 'var(--foreground)'
            },
            pad: {
              over: 'var(--pad-over)',
              DEFAULT: 'var(--pad)'
            },
            bin: {
              over: 'var(--bin-over)',
              DEFAULT: 'var(--bin)'
            },
            seqevt: {
              DEFAULT: '#e10805'
            },
            switch: {
              DEFAULT: 'var(--c7)'
            },
            warning: {
              50: '#ffe2e2',
              100: '#ffb3b2',
              200: '#fe8381',
              300: '#fc524f',
              400: '#fa211e',
              500: '#e10805',
              600: '#b00303',
              700: '#7e0001',
              800: '#4e0000',
              900: '#200000'
            }
          }
        }
      }
    }),
    ({
      addUtilities
    }: {
      addUtilities: (utilities: Record<string, unknown>) => void;
    }) => {
      addUtilities({
        '.touch-none': {
          '-webkit-touch-callout': 'none'
        }
      });
    }
  ]
} satisfies Config;

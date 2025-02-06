/* eslint-disable @typescript-eslint/no-require-imports */
import type { Config } from 'tailwindcss';

const { heroui } = require("@heroui/react");

export default {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)'
      },
      fontFamily: {
        sans: ['var(--font-inter)'],
        mono: ['var(--font-kode-mono)']
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
    heroui(),
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

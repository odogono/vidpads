import { Inter, Kode_Mono, SUSE } from 'next/font/google';

export const kodeMono = Kode_Mono({
  variable: '--font-kode-mono',
  subsets: ['latin']
});

export const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin']
});

export const suse = SUSE({
  variable: '--font-suse',
  subsets: ['latin'],
  weight: ['400', '700']
});

export const fontVariables = `${kodeMono.variable} ${suse.variable} ${inter.variable}`;

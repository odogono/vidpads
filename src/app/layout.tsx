/* eslint-disable react-refresh/only-export-components */
import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';

import './globals.css';

import { FullscreenContextProvider } from '@hooks/useFullScreen/provider';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin']
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin']
});

export const metadata: Metadata = {
  title: 'ODGN VO PADS',
  description: 'for all your video triggering needs'
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  minimumScale: 1,
  userScalable: false
};

const RootLayout = ({
  children
}: Readonly<{
  children: React.ReactNode;
}>) => (
  <html lang='en' className='overscroll-none'>
    <body
      className={`
        ${geistSans.variable} 
        ${geistMono.variable} 
        bg-background 
        antialiased
        overflow-y-hidden
      `}
    >
      <FullscreenContextProvider>{children}</FullscreenContextProvider>
    </body>
  </html>
);

export default RootLayout;

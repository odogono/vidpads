/* eslint-disable react-refresh/only-export-components */
import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono, Inter, Kode_Mono } from 'next/font/google';

import './globals.css';

import { EventsProvider } from '@hooks/events/provider';
import { FullscreenContextProvider } from '@hooks/useFullScreen/provider';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin']
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin']
});

const kodeMono = Kode_Mono({
  variable: '--font-kode-mono',
  subsets: ['latin']
});

const inter = Inter({ variable: '--font-inter', subsets: ['latin'] });

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
        ${kodeMono.variable}
        ${inter.variable}
        bg-background 
        antialiased
        overflow-y-hidden
        font-sans
      `}
    >
      <EventsProvider>
        <FullscreenContextProvider>{children}</FullscreenContextProvider>
      </EventsProvider>
    </body>
  </html>
);

export default RootLayout;

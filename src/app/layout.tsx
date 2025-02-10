/* eslint-disable react-refresh/only-export-components */
import type { Viewport } from 'next';
import { Geist, Geist_Mono, Inter, Kode_Mono } from 'next/font/google';

import { I18nProvider } from '@i18n/I18nProvider';

import './globals.css';

import { EventsProvider } from '@hooks/events/provider';
import { FullscreenContextProvider } from '@hooks/useFullScreen/provider';
import { initTranslation } from '../i18n/initTranslation';

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

export const generateMetadata = async () => {
  const { i18n } = initTranslation('en-gb');
  return {
    title: i18n._(`VO Pads`),
    description: i18n._(`for all your VO triggering needs`)
  };
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  minimumScale: 1,
  userScalable: false
};

interface RootLayoutProps {
  children: React.ReactNode;
}

// TODO move providers out of root layout to player
const RootLayout = ({ children }: RootLayoutProps) => {
  const { i18n } = initTranslation('en-gb');

  return (
    <html lang='en' className='overscroll-none'>
      <body
        className={`
        ${geistSans.variable} 
        ${geistMono.variable} 
        ${kodeMono.variable}
        ${inter.variable}
        bg-background 
        antialiased
        font-sans
      `}
      >
        <I18nProvider initialLocale='en-gb' initialMessages={i18n.messages}>
          <EventsProvider>
            <FullscreenContextProvider>{children}</FullscreenContextProvider>
          </EventsProvider>
        </I18nProvider>
      </body>
    </html>
  );
};

export default RootLayout;

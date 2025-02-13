/* eslint-disable react-refresh/only-export-components */
import type { Viewport } from 'next';
import { Inter, Kode_Mono, SUSE } from 'next/font/google';

import { I18nProvider } from '@i18n/I18nProvider';

import './styles/globals.css';
import './styles/crt.css';

import { EventsProvider } from '@hooks/events/provider';
import { FullscreenContextProvider } from '@hooks/useFullScreen/provider';
import { initTranslation } from '../i18n/initTranslation';

const kodeMono = Kode_Mono({
  variable: '--font-kode-mono',
  subsets: ['latin']
});

const inter = Inter({ variable: '--font-inter', subsets: ['latin'] });

const suse = SUSE({
  variable: '--font-suse',
  subsets: ['latin'],
  weight: ['400', '700']
});

export const generateMetadata = async () => {
  const { i18n } = initTranslation('en-gb');
  return {
    title: i18n._(`VO Pads`),
    description: i18n._(`for all your VO triggering needs`),
    other: {
      builtAt: process.env.NEXT_PUBLIC_BUILT_AT
    },
    icons: {
      icon: [
        { url: '/favicon.ico' },
        { url: '/favicon-96x96.png', sizes: '96x96', type: 'image/png' }
      ],
      apple: [{ url: '/apple-touch-icon.png' }],
      other: [
        {
          rel: 'mask-icon',
          url: '/favicon.svg'
        }
      ]
    },
    manifest: '/site.webmanifest'
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
      <head>
        <link
          rel='icon'
          type='image/png'
          href='/favicon-96x96.png'
          sizes='96x96'
        />
        <link rel='icon' type='image/svg+xml' href='/favicon.svg' />
        <link rel='shortcut icon' href='/favicon.ico' />
        <link
          rel='apple-touch-icon'
          sizes='180x180'
          href='/apple-touch-icon.png'
        />
        <meta name='apple-mobile-web-app-title' content='VO Pads' />
        <link rel='manifest' href='/site.webmanifest' />
      </head>
      <body
        className={`
        ${kodeMono.variable}
        ${suse.variable}
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

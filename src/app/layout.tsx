/* eslint-disable react-refresh/only-export-components */
import type { Viewport } from 'next';

import './styles/globals.css';
import './styles/crt.css';

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

const RootLayout = ({ children }: RootLayoutProps) => {
  // const { i18n } = initTranslation('en-gb');

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

      {children}
      <script
        data-goatcounter='https://vo-odgn.goatcounter.com/count'
        async
        src='//gc.zgo.at/count.js'
      ></script>
    </html>
  );
};

export default RootLayout;

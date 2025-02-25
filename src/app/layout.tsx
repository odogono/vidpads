/* eslint-disable react-refresh/only-export-components */
import type { Viewport } from 'next';

// import { I18nProvider } from '@i18n/I18nProvider';
// import { generateMetadata } from '@page/metadata';
// import { initTranslation } from '../i18n/initTranslation';

import './styles/globals.css';
import './styles/crt.css';

// export { generateMetadata };

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
    </html>
  );
};

export default RootLayout;

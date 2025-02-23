import { initTranslation } from '../i18n/initTranslation';
import { getApiBaseUrl } from './helpers';

export const generateMetadata = async () => {
  const { i18n } = initTranslation('en-gb');
  return {
    title: i18n._(`VO Pads`),
    description: i18n._(`Load, Play, Edit, and Trigger your videos`),
    metadataBase: new URL(getApiBaseUrl() || 'http://localhost:3000'),
    openGraph: {
      title: 'VO Pads',
      description: 'Load, Play, Edit, and Trigger your videos',
      url: '/',
      siteName: 'VO Pads',
      images: [
        {
          url: '/og-regular.jpg',
          width: 1200,
          height: 630,
          alt: 'VO Pads - Video Operator Pads'
        }
      ],
      locale: 'en_GB',
      type: 'website'
    },
    twitter: {
      card: 'summary_large_image',
      title: 'VO Pads',
      description: 'Load, Play, Edit, and Trigger your videos',
      creator: '@vopads',
      images: ['/og-regular.jpg']
    },
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

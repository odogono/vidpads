import type { Metadata } from 'next';

import { BUILT_AT } from '@/buildTime.config';
import { createLog } from '@helpers/log';
import { initTranslation } from '@i18n/initTranslation';
import { urlStringToProject } from '@model/serialise/project';
import { ProjectExport } from '@model/types';
import { getApiBaseUrl } from './helpers';

const log = createLog('page/metadata', ['debug']);

type Props = {
  params: Promise<{ [key: string]: string | string[] | undefined }> | undefined;
  searchParams: Promise<{ [key: string]: string | undefined }> | undefined;
};

export const generateMetadata = async (
  { searchParams }: Props
  // parent: ResolvingMetadata
): Promise<Metadata> => {
  const { i18n } = initTranslation('en-gb');

  const { metadataBase, currentUrl } = await getApiBaseUrl();

  log.debug('metadataBase:', metadataBase.toString());
  log.debug('currentUrl:', currentUrl);
  log.debug('Search params:', await searchParams);

  // Get the resolved search params
  const params = await searchParams;

  const project = await parseProjectUrl(params?.d);

  const title = project ? `VO Pads - ${project.name}` : 'VO Pads';
  const image = project?.bgImage || '/og-regular.jpg';
  const description = i18n._(`Play, Edit, and Sequence your videos`);

  log.debug('project metadata title:', title);
  log.debug('project metadata description:', description);
  log.debug('project metadata image:', image);

  return {
    title,
    description,
    metadataBase,
    openGraph: generateOpenGraph({
      title,
      description,
      image
    }),
    twitter: generateTwitter({
      title,
      description,
      image
    }),
    other: {
      builtAt: BUILT_AT || 'unknown'
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

const parseProjectUrl = async (
  data: string | undefined
): Promise<ProjectExport | undefined> => {
  const project = data ? await urlStringToProject(data) : undefined;

  return project;
};

interface SocialGraphProps {
  title: string;
  description: string;
  image: string;
}

const generateOpenGraph = ({ title, description, image }: SocialGraphProps) => {
  return {
    title,
    description,
    url: '/',
    siteName: 'VO Pads',
    images: [
      {
        url: image,
        width: 1200,
        height: 630,
        alt: title
      }
    ],
    locale: 'en_GB',
    type: 'website'
  };
};

const generateTwitter = ({ title, description, image }: SocialGraphProps) => {
  return {
    card: 'summary_large_image',
    title,
    description,
    creator: '@vopads',
    images: [image]
  };
};

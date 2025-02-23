import type { Metadata } from 'next';

import { createLog } from '@helpers/log';
import { initTranslation } from '@i18n/initTranslation';
import { urlStringToProject } from '@model/serialise/project';
import { ProjectExport } from '@model/types';
import { getApiBaseUrl } from './helpers';

const log = createLog('page/metadata');

type Props = {
  params: Promise<{ [key: string]: string | string[] | undefined }> | undefined;
  searchParams: Promise<{ [key: string]: string | undefined }> | undefined;
};

//localhost:3000/import?p=132143f62b&title=poop&d=4%7CeJwzNDYyNDFOMzNKqqmpMTQ3MTA2MLQws4QyjS0NTWsSDaOLreoq07LckuNzKvxdHS1qagCdXRAl

export const generateMetadata = async (
  props: Props
  // parent: ResolvingMetadata
): Promise<Metadata> => {
  const { i18n } = initTranslation('en-gb');

  log.debug('params:', await props.params);
  log.debug('Search params:', await props.searchParams);

  // Get the resolved search params
  const params = await props.searchParams;

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
    metadataBase: new URL(getApiBaseUrl() || 'http://localhost:3000'),
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
      builtAt: process.env.NEXT_PUBLIC_BUILT_AT || 'unknown'
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

import { createLog } from '@helpers/log';
import { getUrlMetadata, isYouTubeMetadata } from '@helpers/metadata';
import {
  getAllMediaMetaData as dbGetAllMediaMetaData,
  getMediaData as dbGetMediaData,
  saveMediaData as dbSaveMediaData
} from '@model/db/api';
import {
  QueryClient,
  useQueryClient,
  useSuspenseQuery
} from '@tanstack/react-query';
import { VOKeys } from '../constants';
import { Media, MediaYouTube } from '../types';

const log = createLog('model/useMetadata', ['debug']);

export const useMetadata = () => {
  const isMounted = typeof window !== 'undefined';

  const { data } = useSuspenseQuery({
    queryKey: VOKeys.allMetadata(),
    queryFn: () => getAllMetadata(isMounted)
  });

  return {
    metadata: data?.metadata,
    urlToMetadata: data?.urlToMetadata,
    urlToMetadataStr: data?.urlToMetadataStr
  };
};

export const getMetaDataByUrl = async (
  queryClient: QueryClient,
  url: string | undefined
) => {
  if (!url) return null;

  const localData = await dbGetMediaData(url);

  if (localData) {
    return localData;
  }

  log.debug('[useMetadataByUrl] no local media data - fetching', url);

  const media = await getUrlMetadata(url);

  if (!media) {
    log.debug('[useMetadataByUrl] No metadata found for url:', url);
    return null;
  }

  await dbSaveMediaData(media);

  queryClient.setQueryData(VOKeys.metadata(url), media);

  return media;
};

export const useMetadataByUrl = (url: string | undefined) => {
  const queryClient = useQueryClient();
  const { data, isLoading } = useSuspenseQuery({
    queryKey: VOKeys.metadata(url ?? 'unknown'),
    queryFn: () => getMetaDataByUrl(queryClient, url)
  });

  const duration = data?.duration ?? -1;

  return { duration, metadata: data, isLoading };
};

const getAllMetadata = async (isMounted: boolean) => {
  const metadata = isMounted ? await dbGetAllMediaMetaData() : [];
  // log.debug('queryFn', metadata.length, { isMounted });

  const urlToMetadata = new Map<string, Media>();
  metadata.forEach((m) => urlToMetadata.set(m.url, m));

  log.debug('[getAllMetadata]', urlToMetadata);

  const urlToDuration = metadata.reduce(
    (acc, media) => {
      acc[media.url] = media.duration;
      return acc;
    },
    {} as Record<string, number>
  );

  const urlToPlaybackRates = metadata.reduce(
    (acc, media) => {
      if (isYouTubeMetadata(media)) {
        const rates = (media as MediaYouTube).playbackRates;
        if (rates && rates.length > 0) {
          acc[media.url] = rates;
        }
      }
      return acc;
    },
    {} as Record<string, number[]>
  );

  return {
    metadata,
    urlToMetadata,
    urlToMetadataStr: Array.from(urlToMetadata.entries())
      .map(([url, media]) => `${url}: ${media.url}`)
      .join(', '),
    urlToDuration,
    urlToPlaybackRates
  };
};

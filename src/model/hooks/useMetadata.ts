import { useCallback, useEffect } from 'react';

import { isObjectEqual } from '@helpers/diff';
import { useEvents } from '@helpers/events';
import { createLog } from '@helpers/log';
import { isYouTubeMetadata } from '@helpers/metadata';
import { invalidateQueryKeys } from '@helpers/query';
import {
  getAllMediaMetaData as dbGetAllMediaMetaData,
  getMediaData as dbGetMediaData,
  updateMetadataProperty as dbUpdateMetadataProperty
} from '@model/db/api';
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery
} from '@tanstack/react-query';
import { VOKeys } from '../constants';
import { Media, MediaYouTube } from '../types';

const log = createLog('model/useMetadata');

export const useMetadata = () => {
  // const events = useEvents();
  // const queryClient = useQueryClient();
  const isMounted = typeof window !== 'undefined';
  // const [isMounted, setIsMounted] = useState(false);

  // // used to prevent hydration error
  // useEffect(() => {
  //   setIsMounted(true);
  //   log.debug('MOUNTED');
  // }, []);

  const { data } = useSuspenseQuery({
    queryKey: VOKeys.allMetadata(),
    queryFn: () => getAllMetadata(isMounted)
  });

  // const { mutateAsync: updateMetadataProperty } = useMutation({
  //   mutationFn: updateMetadataPropertyMutation,
  //   onSuccess: (_, { mediaUrl, property, value }) => {
  //     // log.debug('updated property', mediaUrl, property, value);
  //     invalidateQueryKeys(queryClient, [[QUERY_KEY_METADATA, mediaUrl]]);

  //     // update the all metadata query data
  //     queryClient.setQueryData(
  //       [QUERY_KEY_METADATA],
  //       (oldData: GetAllMetadataResult) => {
  //         if (oldData) {
  //           const media = oldData.urlToMetadata.get(mediaUrl);
  //           if (media) {
  //             const updatedMedia = { ...media, [property]: value };
  //             oldData = {
  //               ...oldData,
  //               urlToMetadata: oldData.urlToMetadata.set(mediaUrl, updatedMedia)
  //             };
  //           }
  //           if (property === 'duration') {
  //             oldData.urlToDuration[mediaUrl] = value as number;
  //           }
  //           if (property === 'playbackRates') {
  //             oldData.urlToPlaybackRates[mediaUrl] = value as number[];
  //           }
  //         }
  //         return oldData;
  //       }
  //     );
  //   }
  // });

  // const handleMediaPropertyUpdate = useCallback(
  //   (event: {
  //     mediaUrl: string;
  //     property: keyof Media | keyof MediaYouTube;
  //     value: unknown;
  //   }) => {
  //     const { mediaUrl, property, value } = event;

  //     // log.debug('[handleMediaPropertyUpdate]', { mediaUrl, property, value });

  //     // prevent redundant updates
  //     if (property === 'playbackRates') {
  //       if (
  //         isObjectEqual(data.urlToPlaybackRates?.[mediaUrl], value as number[])
  //       ) {
  //         return;
  //       }
  //     }
  //     if (property === 'duration') {
  //       if (data.urlToDuration?.[mediaUrl] === (value as number)) {
  //         return;
  //       }
  //     }

  //     log.debug('[handleMediaPropertyUpdate] updating', {
  //       mediaUrl,
  //       property,
  //       value
  //     });
  //     updateMetadataProperty({
  //       mediaUrl,
  //       property,
  //       value
  //     });
  //   },
  //   [updateMetadataProperty, data]
  // );

  // useEffect(() => {
  //   // todo: no longer needed
  //   events.on('media:property-update', handleMediaPropertyUpdate);
  //   return () => {
  //     events.off('media:property-update', handleMediaPropertyUpdate);
  //   };
  // }, [events, handleMediaPropertyUpdate]);

  return {
    metadata: data?.metadata,
    urlToMetadata: data?.urlToMetadata
    // urlToExternalUrl: data?.urlToExternalUrl
  };
};

export const useMetadataByUrl = (url: string | undefined) => {
  const { data } = useSuspenseQuery({
    queryKey: VOKeys.metadata(url ?? 'unknown'),
    queryFn: async () => {
      if (!url) return null;

      const media = await dbGetMediaData(url);

      return media ?? null;
    }
  });

  const duration = data?.duration ?? -1;

  return { duration, metadata: data };
};

// type GetAllMetadataResult = Awaited<ReturnType<typeof getAllMetadata>>;

const getAllMetadata = async (isMounted: boolean) => {
  const metadata = isMounted ? await dbGetAllMediaMetaData() : [];
  // log.debug('queryFn', metadata.length, { isMounted });

  const urlToMetadata = new Map<string, Media>();
  metadata.forEach((m) => urlToMetadata.set(m.url, m));

  log.debug('[getAllMetadata] urlToMetadata', urlToMetadata);

  // const urlToExternalUrl = metadata.reduce((acc, media) => {
  //   if (isYouTubeMetadata(media)) {
  //     const ytUrl = getYoutubeVideoIdFromMedia(media);
  //     if (ytUrl) {
  //       acc[media.url] = ytUrl;
  //     }
  //   } else {
  //     acc[media.url] = media.url;
  //   }
  //   return acc;
  // }, {} as InternalToExternalUrlMap);

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
    // urlToExternalUrl,
    urlToDuration,
    urlToPlaybackRates
  };
};

const updateMetadataPropertyMutation = async ({
  mediaUrl,
  property,
  value
}: {
  mediaUrl: string;
  property: keyof Media | keyof MediaYouTube;
  value: unknown;
}) => {
  try {
    log.debug('[updateMetadataProperty]', { mediaUrl, property, value });
    await dbUpdateMetadataProperty(mediaUrl, property, value);
  } catch (error) {
    log.warn('updateMetadataProperty error', error, mediaUrl, property, value);
    return null;
  }
};

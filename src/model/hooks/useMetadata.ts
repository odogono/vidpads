import { useCallback, useEffect, useState } from 'react';

import { useEvents } from '@helpers/events';
import { createLog } from '@helpers/log';
import { isYouTubeMetadata } from '@helpers/metadata';
import { invalidateQueryKeys } from '@helpers/query';
import {
  getAllMediaMetaData as dbGetAllMediaMetaData,
  getMediaData as dbGetMediaData,
  updateMetadataDuration as dbUpdateMetadataDuration
} from '@model/db/api';
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery
} from '@tanstack/react-query';
import { getYoutubeUrlFromMedia } from '../../helpers/youtube';
import { QUERY_KEY_METADATA } from '../constants';
import { getMediaIdFromUrl } from '../helpers';
import { Media } from '../types';

const log = createLog('model/useMetadata');

export const useMetadata = () => {
  const events = useEvents();
  const queryClient = useQueryClient();
  const isMounted = typeof window !== 'undefined';
  // const [isMounted, setIsMounted] = useState(false);

  // // used to prevent hydration error
  // useEffect(() => {
  //   setIsMounted(true);
  //   log.debug('MOUNTED');
  // }, []);

  const { data } = useSuspenseQuery({
    queryKey: [QUERY_KEY_METADATA],
    queryFn: async () => {
      const metadata = isMounted ? await dbGetAllMediaMetaData() : [];
      // log.debug('queryFn', metadata.length, { isMounted });

      const urlToMetadata = new Map<string, Media>();
      metadata.forEach((m) => urlToMetadata.set(m.url, m));

      const urlToExternalUrl = metadata.reduce(
        (acc, media) => {
          if (isYouTubeMetadata(media)) {
            const ytUrl = getYoutubeUrlFromMedia(media);
            if (ytUrl) {
              acc[media.url] = ytUrl;
            }
          } else {
            acc[media.url] = media.url;
          }
          return acc;
        },
        {} as Record<string, string>
      );

      return { metadata, urlToMetadata, urlToExternalUrl };
    }
  });

  const { mutateAsync: updateMetadataDuration } = useMutation({
    mutationFn: async ({
      mediaUrl,
      duration
    }: {
      mediaUrl: string;
      duration: number;
    }) => {
      await dbUpdateMetadataDuration(mediaUrl, duration);
    },
    onSuccess: (_, { mediaUrl, duration }) => {
      log.debug('updated duration', mediaUrl, duration);
      invalidateQueryKeys(queryClient, [[QUERY_KEY_METADATA, mediaUrl]]);
    }
  });

  const handleMediaDurationUpdate = useCallback(
    (event: { mediaUrl: string; duration: number }) => {
      const { mediaUrl, duration } = event;

      updateMetadataDuration({ mediaUrl, duration });
    },
    [updateMetadataDuration]
  );

  useEffect(() => {
    events.on('media:duration-update', handleMediaDurationUpdate);
    return () => {
      events.off('media:duration-update', handleMediaDurationUpdate);
    };
  }, [events, handleMediaDurationUpdate]);

  return {
    metadata: data?.metadata,
    urlToMetadata: data?.urlToMetadata,
    urlToExternalUrl: data?.urlToExternalUrl
  };
};

export const useMetadataByUrl = (url: string | undefined) => {
  // const queryClient = useQueryClient();

  // Invalidate the cache when pad changes
  // useEffect(() => {
  //   if (url) {
  //     invalidateQueryKeys(queryClient, [[QUERY_KEY_METADATA, url]]);
  //   }
  // }, [url, queryClient]);

  const { data } = useSuspenseQuery({
    queryKey: [QUERY_KEY_METADATA, url],
    queryFn: async () => {
      if (!url) return null;

      const media = await dbGetMediaData(url);

      return media ?? null;
    }
  });

  return data;
};

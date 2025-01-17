import { useCallback, useEffect, useState } from 'react';

import { useEvents } from '@helpers/events';
import { createLog } from '@helpers/log';
import { isYouTubeMetadata } from '@helpers/metadata';
import { invalidateQueryKeys } from '@helpers/query';
import {
  getAllMediaMetaData as dbGetAllMediaMetaData,
  updateMetadataDuration as dbUpdateMetadataDuration
} from '@model/db/api';
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery
} from '@tanstack/react-query';
import { QUERY_KEY_METADATA } from '../constants';
import { getMediaIdFromUrl } from '../helpers';
import { Media } from '../types';

const log = createLog('model/useMetadata');

export const useMetadata = () => {
  const events = useEvents();
  const queryClient = useQueryClient();
  // const [isMounted, setIsMounted] = useState(false);

  // // used to prevent hydration error
  // // since selectedPadId is undefined on the server
  // useEffect(() => {
  //   setIsMounted(true);
  // }, []);

  const { data } = useSuspenseQuery({
    queryKey: [QUERY_KEY_METADATA],
    queryFn: async () => {
      const metadata = await dbGetAllMediaMetaData();
      log.debug('queryFn', metadata.length);

      const urlToMetadata = new Map<string, Media>();
      metadata.forEach((m) => urlToMetadata.set(m.url, m));

      const urlToExternalUrl = metadata.reduce(
        (acc, media) => {
          if (isYouTubeMetadata(media)) {
            acc[media.url] = `https://m.youtube.com/watch?v=${media.id}`;
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
      mediaId,
      duration
    }: {
      mediaId: string;
      duration: number;
    }) => {
      await dbUpdateMetadataDuration(mediaId, duration);
    },
    onSuccess: (_, { mediaId, duration }) => {
      log.debug('updated duration', mediaId, duration);
      invalidateQueryKeys(queryClient, [[QUERY_KEY_METADATA]]);
    }
  });

  const handleMediaDurationUpdate = useCallback(
    (event: { mediaUrl: string; duration: number }) => {
      const { mediaUrl, duration } = event;

      const mediaId = getMediaIdFromUrl(mediaUrl);
      if (!mediaId) return;

      updateMetadataDuration({ mediaId, duration });
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

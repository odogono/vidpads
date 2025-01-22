import { useCallback, useEffect } from 'react';

import { isObjectEqual } from '@helpers/diff';
import { useEvents } from '@helpers/events';
import { createLog } from '@helpers/log';
import { isYouTubeMetadata } from '@helpers/metadata';
import { invalidateQueryKeys } from '@helpers/query';
import { getYoutubeVideoIdFromMedia } from '@helpers/youtube';
import {
  getAllMediaMetaData as dbGetAllMediaMetaData,
  getMediaData as dbGetMediaData,
  updateMetadataAvailablePlaybackRates as dbUpdateMetadataAvailablePlaybackRates,
  updateMetadataDuration as dbUpdateMetadataDuration,
  updateMetadataProperty as dbUpdateMetadataProperty
} from '@model/db/api';
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery
} from '@tanstack/react-query';
import { QUERY_KEY_METADATA } from '../constants';
import { Media, MediaYouTube } from '../types';

const log = createLog('model/useMetadata');

export type InternalToExternalUrlMap = Record<string, string>;

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

      const urlToExternalUrl = metadata.reduce((acc, media) => {
        if (isYouTubeMetadata(media)) {
          const ytUrl = getYoutubeVideoIdFromMedia(media);
          if (ytUrl) {
            acc[media.url] = ytUrl;
          }
        } else {
          acc[media.url] = media.url;
        }
        return acc;
      }, {} as InternalToExternalUrlMap);

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
        urlToExternalUrl,
        urlToDuration,
        urlToPlaybackRates
      };
    }
  });

  // const { mutateAsync: updateMetadataDuration } = useMutation({
  //   mutationFn: async ({
  //     mediaUrl,
  //     duration
  //   }: {
  //     mediaUrl: string;
  //     duration: number;
  //   }) => {
  //     try {
  //       await dbUpdateMetadataDuration(mediaUrl, duration);
  //     } catch (error) {
  //       log.warn('updateMetadataDuration error', error, mediaUrl, duration);
  //       return null;
  //     }
  //   },
  //   onSuccess: (_, { mediaUrl, duration }) => {
  //     log.debug('updated duration', mediaUrl, duration);
  //     invalidateQueryKeys(queryClient, [[QUERY_KEY_METADATA, mediaUrl]]);
  //   }
  // });

  const { mutateAsync: updateMetadataProperty } = useMutation({
    mutationFn: async ({
      mediaUrl,
      property,
      value
    }: {
      mediaUrl: string;
      property: keyof Media | keyof MediaYouTube;
      value: unknown;
    }) => {
      try {
        await dbUpdateMetadataProperty(mediaUrl, property, value);
      } catch (error) {
        log.warn(
          'updateMetadataProperty error',
          error,
          mediaUrl,
          property,
          value
        );
        return null;
      }
    },
    onSuccess: (_, { mediaUrl, property, value }) => {
      log.debug('updated property', mediaUrl, property, value);
      invalidateQueryKeys(queryClient, [[QUERY_KEY_METADATA, mediaUrl]]);
    }
  });

  const handleMediaDurationUpdate = useCallback(
    (event: { mediaUrl: string; duration: number }) => {
      const { mediaUrl, duration } = event;

      // prevent redundant updates
      if (data.urlToDuration?.[mediaUrl] === duration) {
        return;
      }
      updateMetadataProperty({
        mediaUrl,
        property: 'duration',
        value: duration
      });
    },
    [updateMetadataProperty, data]
  );

  const handleAvailablePlaybackRates = useCallback(
    (event: { mediaUrl: string; rates: number[] }) => {
      const { mediaUrl, rates } = event;

      // prevent redundant updates
      if (isObjectEqual(data.urlToPlaybackRates?.[mediaUrl], rates)) {
        return;
      }
      updateMetadataProperty({
        mediaUrl,
        property: 'playbackRates',
        value: rates
      });
    },
    [updateMetadataProperty, data]
  );

  useEffect(() => {
    events.on('media:duration-update', handleMediaDurationUpdate);
    events.on('media:available-playback-rates', handleAvailablePlaybackRates);
    return () => {
      events.off('media:duration-update', handleMediaDurationUpdate);
      events.off(
        'media:available-playback-rates',
        handleAvailablePlaybackRates
      );
    };
  }, [events, handleMediaDurationUpdate, handleAvailablePlaybackRates]);

  return {
    metadata: data?.metadata,
    urlToMetadata: data?.urlToMetadata,
    urlToExternalUrl: data?.urlToExternalUrl
  };
};

export const useMetadataByUrl = (url: string | undefined) => {
  const { data } = useSuspenseQuery({
    queryKey: [QUERY_KEY_METADATA, url],
    queryFn: async () => {
      if (!url) return null;

      const media = await dbGetMediaData(url);

      return media ?? null;
    }
  });

  const duration = data?.duration ?? -1;

  return { duration, metadata: data };
};

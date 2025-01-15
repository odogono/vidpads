import { useEffect, useMemo, useState } from 'react';

import { isYouTubeMetadata } from '@helpers/metadata';
import { invalidateQueryKeys } from '@helpers/query';
import {
  QUERY_KEY_PADS_METADATA,
  QUERY_KEY_PAD_METADATA
} from '@model/constants';
// import { createLog } from '@helpers/log';
import {
  getAllMediaMetaData as dbGetAllMediaMetaData,
  getMediaData as dbGetMediaData
} from '@model/db/api';
import { getPadSourceUrl } from '@model/pad';
import { useStore } from '@model/store/useStore';
import { Pad } from '@model/types';
import { useQueryClient, useSuspenseQuery } from '@tanstack/react-query';

// const log = createLog('model/useMetadataFromPad');

export const useMetadataFromPad = (pad?: Pad) => {
  const queryClient = useQueryClient();

  // Invalidate the cache when pad changes
  useEffect(() => {
    if (pad) {
      invalidateQueryKeys(queryClient, [
        [QUERY_KEY_PAD_METADATA, pad.id],
        [QUERY_KEY_PADS_METADATA]
      ]);
    }
  }, [pad, queryClient]);

  return useSuspenseQuery({
    queryKey: [QUERY_KEY_PAD_METADATA, pad?.id],
    queryFn: async () => {
      if (!pad) return null;

      const sourceUrl = getPadSourceUrl(pad);
      if (!sourceUrl) return null;

      const media = await dbGetMediaData(sourceUrl);

      return media ?? null;
    }
  });
};

/**
 * Returns all the metadata for all the pads in the project
 * @returns
 */
export const usePadMetadata = () => {
  const { store } = useStore();
  const [isMounted, setIsMounted] = useState(false);

  // used to prevent hydration error
  // since selectedPadId is undefined on the server
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const { data, isLoading, error } = useSuspenseQuery({
    queryKey: [QUERY_KEY_PADS_METADATA],
    queryFn: async () => {
      const pads = store.getSnapshot().context.pads;

      const metadata = isMounted ? await dbGetAllMediaMetaData() : [];

      const padsMetadata = pads.map((pad) => {
        const sourceUrl = getPadSourceUrl(pad);
        if (!sourceUrl) return null;

        const media = metadata.find((m) => m.url === sourceUrl);
        return media ?? null;
      });

      return padsMetadata;
    }
  });

  const urlToExternalUrlMap = useMemo(
    () =>
      data.reduce(
        (acc, media) => {
          if (!media) return acc;

          if (isYouTubeMetadata(media)) {
            acc[media.url] = `https://m.youtube.com/watch?v=${media.id}`;
          } else {
            acc[media.url] = media.url;
          }

          return acc;
        },
        {} as Record<string, string>
      ),
    [data]
  );

  return { metadata: data, isLoading, error, urlToExternalUrlMap };
};

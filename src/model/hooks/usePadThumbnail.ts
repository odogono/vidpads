import { useEffect, useRef } from 'react';

import { createLog } from '@helpers/log';
import { getUrlMetadata, isYouTubeMetadata } from '@helpers/metadata';
import { getYouTubeThumbnail } from '@helpers/youtube';
import { useProject } from '@hooks/useProject';
import { VOKeys } from '@model/constants';
import {
  deletePadThumbnail as dbDeletePadThumbnail,
  getPadThumbnail as dbGetPadThumbnail,
  savePadThumbnail as dbSavePadThumbnail
} from '@model/db/api';
import { getPadSourceUrl } from '@model/pad';
import { MediaYouTube, Pad } from '@model/types';
import { useQueryClient, useSuspenseQuery } from '@tanstack/react-query';

const log = createLog('usePadThumbnail', ['debug']);

export const usePadThumbnail = (pad: Pad) => {
  const { projectId } = useProject();
  const queryClient = useQueryClient();

  const padSourceUrl = getPadSourceUrl(pad);
  const padSourceRef = useRef<string | null>(padSourceUrl);

  useEffect(() => {
    log.debug('invalidating thumbnail', projectId, pad.id);
    padSourceRef.current = padSourceUrl;
    queryClient.invalidateQueries({
      queryKey: [...VOKeys.padThumbnail(projectId, pad.id)]
    });
  }, [padSourceUrl, queryClient, projectId, pad.id]);

  const { data: thumbnail } = useSuspenseQuery({
    queryKey: [...VOKeys.padThumbnail(projectId, pad.id)],
    queryFn: async () => {
      const sourceUrl = padSourceRef.current;

      try {
        if (!sourceUrl) {
          log.debug(
            'no source url, deleting thumbnail',
            projectId,
            pad.id,
            pad
          );
          await dbDeletePadThumbnail(projectId, pad.id);
          return null;
        }
        const result = await dbGetPadThumbnail(projectId, pad.id);
        log.debug('getting thumbnail', projectId, pad.id, result);

        if (result) return result;
        // if no thumbnail, try to get it from the source url
        // note - this should have already been fetched in the usePadOperations hook
        // but probably due to timing, it isn't yet available
        // TODO figure out why this is happening and fix it
        const media = await getUrlMetadata(sourceUrl);
        if (!media) return result;
        if (!isYouTubeMetadata(media)) return result;
        const thumbnail = await getYouTubeThumbnail(media as MediaYouTube);
        if (!thumbnail) return result;

        await dbSavePadThumbnail(projectId, pad.id, thumbnail);

        log.debug('got media', projectId, pad.id, media, thumbnail);

        return thumbnail;
      } catch {
        log.debug('error getting thumbnail', projectId, pad.id);
        return null;
      }
    }
  });

  return { thumbnail };
};

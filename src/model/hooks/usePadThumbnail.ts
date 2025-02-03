import { createLog } from '@helpers/log';
import { isYouTubeMetadata } from '@helpers/metadata';
import { getYouTubeThumbnail } from '@helpers/youtube';
import { useProject } from '@hooks/useProject';
import { VOKeys } from '@model/constants';
import {
  getMediaThumbnail as dbGetMediaThumbnail,
  getPadThumbnail as dbGetPadThumbnail,
  setPadThumbnail as dbSetPadThumbnail
} from '@model/db/api';
import { MediaYouTube, Pad } from '@model/types';
import { useSuspenseQuery } from '@tanstack/react-query';
import { getPadSourceUrl } from '../pad';
import { useMetadataByUrl } from './useMetadata';

const log = createLog('usePadThumbnail');

export const usePadThumbnail = (pad: Pad) => {
  const { metadata } = useMetadataByUrl(getPadSourceUrl(pad));
  const { projectId } = useProject();

  const { data: thumbnail } = useSuspenseQuery({
    queryKey: [...VOKeys.padThumbnail(pad.id)],
    queryFn: async () => {
      if (metadata) {
        log.debug('loading thumbnail for pad:', pad.id, pad);
      }
      try {
        // first try for the pads thumbnail

        const dbThumbnail = await dbGetPadThumbnail(projectId, pad.id);
        if (dbThumbnail) {
          return dbThumbnail;
        }

        // then try for the media thumbnail

        const mediaThumbnail = await dbGetMediaThumbnail(metadata);

        if (mediaThumbnail) {
          // copy
          await dbSetPadThumbnail(projectId, pad.id, mediaThumbnail);
          return mediaThumbnail;
        }

        // no thumbnail found, so try to get it from youtube

        // const padUrl = getPadSourceUrl(pad);
        if (isYouTubeMetadata(metadata)) {
          const thumbnail = await getYouTubeThumbnail(metadata as MediaYouTube);

          if (!thumbnail) {
            log.debug(
              '[usePadThumbnail] No thumbnail found for pad:',
              pad.id,
              metadata?.url
            );
            return null;
          }

          await dbSetPadThumbnail(projectId, pad.id, thumbnail);

          return thumbnail;
        }

        return null;
      } catch {
        // log.warn('[usePadThumbnail] Error getting thumbnail:', error);
        return null;
      }
    }
  });

  return { thumbnail };
};

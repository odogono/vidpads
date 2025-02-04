import { useProject } from '@hooks/useProject';
import { VOKeys } from '@model/constants';
import { getPadThumbnail as dbGetPadThumbnail } from '@model/db/api';
import { Pad } from '@model/types';
import { useSuspenseQuery } from '@tanstack/react-query';

// import { createLog } from '@helpers/log';

// const log = createLog('usePadThumbnail');

export const usePadThumbnail = (pad: Pad) => {
  const { projectId } = useProject();

  const { data: thumbnail } = useSuspenseQuery({
    queryKey: [...VOKeys.padThumbnail(projectId, pad.id)],
    queryFn: async () => {
      try {
        // log.debug('getting thumbnail', projectId, pad.id);
        return await dbGetPadThumbnail(projectId, pad.id);
      } catch {
        // log.warn('[usePadThumbnail] Error getting thumbnail:', error);
        return null;
      }

      // const padUrl = getPadSourceUrl(pad);
      // if (!padUrl) {
      //   return null;
      // }
      // log.debug('query', pad.id, padUrl, sourceUrl);

      // const metadata = await getMetaDataByUrl(queryClient, padUrl);

      // if (!metadata) {
      //   log.debug('no metadata, skipping thumbnail', pad.id, padUrl);
      //   return null;
      // }

      // log.debug('loading thumbnail for pad:', pad.id, pad);

      // try {
      //   // first try for the pads thumbnail

      //   const dbThumbnail = await dbGetPadThumbnail(projectId, pad.id);
      //   if (dbThumbnail) {
      //     return dbThumbnail;
      //   }

      //   log.debug('no pad thumbnail, getting media thumbnail', metadata?.url);
      //   // then try for the media thumbnail
      //   const mediaThumbnail = await dbGetMediaThumbnail(metadata);

      //   if (mediaThumbnail) {
      //     // copy
      //     await dbSavePadThumbnail(projectId, pad.id, mediaThumbnail);
      //     return mediaThumbnail;
      //   }

      //   // no thumbnail found, so try to get it from youtube

      //   // const padUrl = getPadSourceUrl(pad);
      //   if (isYouTubeMetadata(metadata)) {
      //     log.debug('no media thumbnail, fetching from yt', metadata?.url);
      //     const thumbnail = await getYouTubeThumbnail(metadata as MediaYouTube);

      //     if (!thumbnail) {
      //       log.debug(
      //         '[usePadThumbnail] No thumbnail found for pad:',
      //         pad.id,
      //         metadata?.url
      //       );
      //       return null;
      //     }

      //     await dbSavePadThumbnail(projectId, pad.id, thumbnail);

      //     return thumbnail;
      //   }

      //   return null;
      // } catch {
      //   // log.warn('[usePadThumbnail] Error getting thumbnail:', error);
      //   return null;
      // }
    }
  });

  // log.debug(pad.id, projectId);
  // if (sourceUrl) log.debug('render', pad.id, sourceUrl, thumbnail);

  return { thumbnail };
};

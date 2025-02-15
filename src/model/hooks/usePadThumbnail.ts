// import { createLog } from '@helpers/log';
import { useProject } from '@hooks/useProject';
import { VOKeys } from '@model/constants';
import {
  deletePadThumbnail as dbDeletePadThumbnail,
  getPadThumbnail as dbGetPadThumbnail
} from '@model/db/api';
import { getPadSourceUrl } from '@model/pad';
import { Pad } from '@model/types';
import { useSuspenseQuery } from '@tanstack/react-query';

// const log = createLog('usePadThumbnail');

export const usePadThumbnail = (pad: Pad) => {
  const { projectId } = useProject();

  const { data: thumbnail } = useSuspenseQuery({
    queryKey: [...VOKeys.padThumbnail(projectId, pad.id)],
    queryFn: async () => {
      const sourceUrl = getPadSourceUrl(pad);

      // log.debug('pad', pad.id, sourceUrl);

      if (!sourceUrl) {
        await dbDeletePadThumbnail(projectId, pad.id);
        return null;
      }

      try {
        return await dbGetPadThumbnail(projectId, pad.id);
      } catch {
        return null;
      }
    }
  });

  return { thumbnail };
};

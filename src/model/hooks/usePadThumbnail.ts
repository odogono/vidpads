import { useEffect, useRef } from 'react';

import { createLog } from '@helpers/log';
import { useProject } from '@hooks/useProject';
import { VOKeys } from '@model/constants';
import {
  deletePadThumbnail as dbDeletePadThumbnail,
  getPadThumbnail as dbGetPadThumbnail
} from '@model/db/api';
import { getPadSourceUrl } from '@model/pad';
import { Pad } from '@model/types';
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
        return result;
      } catch {
        log.debug('error getting thumbnail', projectId, pad.id);
        return null;
      }
    }
  });

  return { thumbnail };
};

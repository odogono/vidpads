import { useEffect } from 'react';

import { createLog } from '@helpers/log';
import { getMediaData as dbGetMediaData } from '@model/db/api';
import { Pad } from '@model/types';
import { useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import { getPadSourceUrl } from '../pad';

const log = createLog('model/useMetadataFromPad');

export const useMetadataFromPad = (pad?: Pad) => {
  const queryClient = useQueryClient();

  // Invalidate the cache when pad changes
  useEffect(() => {
    if (pad) {
      queryClient.invalidateQueries({
        queryKey: ['metadata/pad', pad.id]
      });
    }
  }, [pad, queryClient]);

  return useSuspenseQuery({
    queryKey: ['metadata/pad', pad?.id],
    queryFn: async () => {
      if (!pad) return null;

      const sourceUrl = getPadSourceUrl(pad);
      if (!sourceUrl) return null;

      const media = await dbGetMediaData(sourceUrl);

      return media ?? null;
    }
  });
};

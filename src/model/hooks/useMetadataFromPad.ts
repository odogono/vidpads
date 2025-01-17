import { useEffect } from 'react';

// import { createLog } from '@helpers/log';
import { invalidateQueryKeys } from '@helpers/query';
import { QUERY_KEY_METADATA } from '@model/constants';
import { getMediaData as dbGetMediaData } from '@model/db/api';
import { getPadSourceUrl } from '@model/pad';
import { Pad } from '@model/types';
import { useQueryClient, useSuspenseQuery } from '@tanstack/react-query';

// const log = createLog('model/useMetadataFromPad');

export const useMetadataFromPad = (pad?: Pad) => {
  const queryClient = useQueryClient();

  // Invalidate the cache when pad changes
  useEffect(() => {
    if (pad) {
      invalidateQueryKeys(queryClient, [[QUERY_KEY_METADATA, pad.id]]);
    }
  }, [pad, queryClient]);

  const { data } = useSuspenseQuery({
    queryKey: [QUERY_KEY_METADATA, pad?.id],
    queryFn: async () => {
      if (!pad) return null;

      const sourceUrl = getPadSourceUrl(pad);
      if (!sourceUrl) return null;

      const media = await dbGetMediaData(sourceUrl);

      return media ?? null;
    }
  });

  return data;
};

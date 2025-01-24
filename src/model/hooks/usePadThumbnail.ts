import { VOKeys } from '@model/constants';
import { getPadThumbnail as dbGetPadThumbnail } from '@model/db/api';
import { Pad } from '@model/types';
import { useSuspenseQuery } from '@tanstack/react-query';

export const usePadThumbnail = (pad: Pad) => {
  const { data: thumbnail } = useSuspenseQuery({
    queryKey: [...VOKeys.padThumbnail(pad.id)],
    queryFn: async () => {
      try {
        return await dbGetPadThumbnail(pad.id);
      } catch {
        // log.warn('[usePadThumbnail] Error getting thumbnail:', error);
        return null;
      }
    }
  });

  return { thumbnail };
};

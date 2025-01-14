import { QUERY_KEY_PAD_THUMBNAIL } from '@model/constants';
import { getPadThumbnail as dbGetPadThumbnail } from '@model/db/api';
import { Pad } from '@model/types';
import { useSuspenseQuery } from '@tanstack/react-query';

export const usePadThumbnail = (pad: Pad) => {
  const { data: thumbnail } = useSuspenseQuery({
    queryKey: [QUERY_KEY_PAD_THUMBNAIL, pad.id],
    queryFn: async () => {
      try {
        const thumbnail = await dbGetPadThumbnail(pad.id);
        return thumbnail;
      } catch {
        // log.warn('[usePadThumbnail] Error getting thumbnail:', error);
        return null;
      }
    }
  });

  return { thumbnail };
};

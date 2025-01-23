import { QUERY_KEY_PAD_THUMBNAIL } from '@model/constants';
import { setPadThumbnail as dbSetPadThumbnail } from '@model/db/api';
import { useStore } from '@model/store/useStore';
import { Pad } from '@model/types';
import { useQueryClient } from '@tanstack/react-query';

export interface UsePadTrimOperationProps {
  pad: Pad;
  start: number;
  end: number;
  thumbnail?: string;
}

export const usePadTrimOperation = () => {
  const { store } = useStore();
  const queryClient = useQueryClient();

  return async ({ pad, start, end, thumbnail }: UsePadTrimOperationProps) => {
    store.send({
      type: 'applyTrimToPad',
      padId: pad.id,
      start,
      end
    });

    if (thumbnail) {
      await dbSetPadThumbnail(pad.id, thumbnail);

      // Invalidate the pad-thumbnail query to trigger a refetch
      await queryClient.invalidateQueries({
        queryKey: [QUERY_KEY_PAD_THUMBNAIL, pad.id]
      });
    }

    return pad;
  };
};

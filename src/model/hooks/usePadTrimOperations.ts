import { useProject } from '@hooks/useProject';
import { VOKeys } from '@model/constants';
import { setPadThumbnail as dbSetPadThumbnail } from '@model/db/api';
import { Pad } from '@model/types';
import { useQueryClient } from '@tanstack/react-query';

export interface UsePadTrimOperationProps {
  pad: Pad;
  start: number;
  end: number;
  thumbnail?: string;
}

export const usePadTrimOperation = () => {
  const { project } = useProject();
  const queryClient = useQueryClient();

  return async ({ pad, start, end, thumbnail }: UsePadTrimOperationProps) => {
    project.send({
      type: 'applyTrimToPad',
      padId: pad.id,
      start,
      end
    });

    if (thumbnail) {
      await dbSetPadThumbnail(pad.id, thumbnail);

      // Invalidate the pad-thumbnail query to trigger a refetch
      await queryClient.invalidateQueries({
        queryKey: [...VOKeys.padThumbnail(pad.id)]
      });
    }

    return pad;
  };
};

import { useProject } from '@hooks/useProject';
import { VOKeys } from '@model/constants';
import { savePadThumbnail as dbSavePadThumbnail } from '@model/db/api';
import { Pad } from '@model/types';
import { useQueryClient } from '@tanstack/react-query';

export interface UsePadTrimOperationProps {
  pad: Pad;
  start: number;
  end: number;
  thumbnail?: string;
}

export const usePadTrimOperation = () => {
  const { project, projectId } = useProject();
  const queryClient = useQueryClient();

  return async ({ pad, start, end, thumbnail }: UsePadTrimOperationProps) => {
    project.send({
      type: 'applyTrimToPad',
      padId: pad.id,
      start,
      end
    });

    if (thumbnail) {
      await dbSavePadThumbnail(projectId, pad.id, thumbnail);

      // Invalidate the pad-thumbnail query to trigger a refetch
      await queryClient.invalidateQueries({
        queryKey: [...VOKeys.padThumbnail(projectId, pad.id)]
      });
    }

    return pad;
  };
};

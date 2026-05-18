import { useEffect } from 'react';

import { createLog } from '@helpers/log';
import { useProject } from '@hooks/useProject';
import { VOKeys } from '@model/constants';
import { getPadSourceUrl } from '@model/pad';
import {
  createBrowserProjectMediaWorkflowDeps,
  createProjectMediaSession
} from '@model/projectMediaWorkflow';
import { Pad } from '@model/types';
import { useQueryClient, useSuspenseQuery } from '@tanstack/react-query';

const log = createLog('usePadThumbnail', ['debug']);

export const usePadThumbnail = (pad: Pad) => {
  const { project, projectId } = useProject();
  const queryClient = useQueryClient();

  const padSourceUrl = getPadSourceUrl(pad);

  useEffect(() => {
    log.debug('invalidating thumbnail', projectId, pad.id);
    queryClient.invalidateQueries({
      queryKey: [...VOKeys.padThumbnail(projectId, pad.id)]
    });
  }, [padSourceUrl, queryClient, projectId, pad.id]);

  const { data: thumbnail } = useSuspenseQuery({
    queryKey: [...VOKeys.padThumbnail(projectId, pad.id)],
    queryFn: async () => {
      try {
        const deps = createBrowserProjectMediaWorkflowDeps({ queryClient });
        const session = createProjectMediaSession({
          deps,
          projectId,
          store: project,
          autosave: false
        });
        const thumbnail = await session.getPadThumbnail({ padId: pad.id });
        session.dispose();
        return thumbnail;
      } catch {
        log.debug('error getting thumbnail', projectId, pad.id);
        return null;
      }
    }
  });

  return { thumbnail };
};

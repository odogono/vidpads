'use client';

import { useEffect } from 'react';

import { useRouter } from '@/hooks/useProject/useRouter';
import { createLog } from '@helpers/log';
import { VOKeys } from '@model/constants';
import {
  createBrowserProjectMediaWorkflowDeps,
  createProjectMediaSession,
  createProjectMediaWorkflow
} from '@model/projectMediaWorkflow';
import { useQueryClient, useSuspenseQuery } from '@tanstack/react-query';

const log = createLog('useProject/hooks/useProjectPersistence', ['debug']);

export const useProjectPersistence = () => {
  const { setProjectId, projectId, importData } = useRouter();
  const queryClient = useQueryClient();

  const { data: session } = useSuspenseQuery({
    queryKey: VOKeys.project(projectId),
    queryFn: async () => {
      log.debug('loading project through workflow', { projectId, importData });
      const deps = createBrowserProjectMediaWorkflowDeps({
        queryClient,
        routing: { setProjectId }
      });
      const workflow = createProjectMediaWorkflow(deps);

      try {
        return await workflow.openProject({ projectId, importData });
      } catch (error) {
        log.debug('error loading project through workflow', error);
        const store = deps.projectStore.create();
        return createProjectMediaSession({
          deps,
          projectId: store.getSnapshot().context.projectId,
          store
        });
      }
    }
  });

  useEffect(() => {
    return () => session.dispose();
  }, [session]);

  return { project: session.store, setProjectId, projectId: session.projectId };
};

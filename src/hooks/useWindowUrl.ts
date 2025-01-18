'use client';

import { useCallback, useEffect } from 'react';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { useEvents } from '@helpers/events';
import { createLog } from '@helpers/log';
import { useProjects } from '@model/hooks/useProjects';

const log = createLog('useWindowUrl');

export const useWindowUrl = () => {
  const router = useRouter();
  const events = useEvents();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const {
    projectId: currentProjectId,
    projectName: currentProjectName,
    loadProject
  } = useProjects();

  // handle the path changing
  useEffect(() => {
    const projectId = searchParams.get('p');
    log.debug({ currentProjectId, projectId });
    if (projectId && projectId !== currentProjectId) {
      log.debug('Project loading from url:', projectId);

      try {
        loadProject(projectId).then((success) => {
          if (!success) {
            const params = new URLSearchParams(searchParams);
            params.set('p', currentProjectId!);
            router.push(`?${params.toString()}`);
          }
        });
      } catch (error) {
        log.error('Failed to load project:', error);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, searchParams, loadProject]);

  useEffect(() => {
    if (currentProjectName) {
      document.title = `ODGN Vidpads - ${currentProjectName}`;
    }
  }, [currentProjectName]);

  const handleProjectCreated = useCallback(
    ({ projectId }: { projectId: string }) => {
      const params = new URLSearchParams(searchParams);
      params.set('p', projectId);
      router.push(`?${params.toString()}`);
    },
    [router, searchParams]
  );

  const handleProjectLoaded = useCallback(
    ({ projectId }: { projectId: string }) => {
      const params = new URLSearchParams(searchParams);
      params.set('p', projectId);
      router.push(`?${params.toString()}`);
    },
    [router, searchParams]
  );

  useEffect(() => {
    events.on('project:created', handleProjectCreated);
    events.on('project:loaded', handleProjectLoaded);

    return () => {
      events.off('project:created', handleProjectCreated);
      events.off('project:loaded', handleProjectLoaded);
    };
  }, [events, handleProjectCreated, handleProjectLoaded]);
};

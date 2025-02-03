'use client';

import { useCallback, useEffect, useState } from 'react';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { useEvents } from '@helpers/events';
import { createLog } from '@helpers/log';
import { useProjects } from '@model/hooks/useProjects';
import { ProjectCreatedEvent } from '../model/types';

const log = createLog('useWindowUrl');

export const useWindowUrl = () => {
  const router = useRouter();
  const events = useEvents();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const {
    projectId: currentProjectId,
    projectName: currentProjectName,
    loadProject,
    importFromURLString
  } = useProjects();

  const [isLoading, setIsLoading] = useState(false);

  const setProjectParams = useCallback(
    (projectId: string) => {
      const params = new URLSearchParams(searchParams);
      params.set('p', projectId);
      params.delete('d');
      router.push(`?${params.toString()}`);
    },
    [router, searchParams]
  );

  // handle the path changing
  useEffect(() => {
    const projectId = searchParams.get('p');
    const importData = searchParams.get('d');

    // Guard against concurrent operations
    if (isLoading) {
      log.debug('Skipping URL handling - operation already in progress');
      return;
    }

    const handleUrlChange = async () => {
      if (importData) {
        try {
          setIsLoading(true);
          log.debug('Importing project from url:', importData);
          const success = await importFromURLString(importData);
          if (!success) {
            setProjectParams(currentProjectId!);
          }
        } finally {
          setIsLoading(false);
        }
      } else if (projectId && projectId !== currentProjectId) {
        try {
          setIsLoading(true);
          log.debug('Project loading from url:', projectId);
          const success = await loadProject(projectId);
          if (!success) {
            setProjectParams(currentProjectId!);
          }
        } catch (error) {
          log.error('Failed to load project:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    handleUrlChange();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, searchParams, loadProject, setProjectParams]);

  useEffect(() => {
    if (currentProjectName) {
      document.title = `ODGN VO PADS - ${currentProjectName}`;
    }
  }, [currentProjectName]);

  const handleProjectLoaded = useCallback(
    ({ projectId, projectName }: ProjectCreatedEvent) => {
      setProjectParams(projectId);
      document.title = `ODGN VO PADS - ${projectName}`;
    },
    [setProjectParams]
  );

  useEffect(() => {
    events.on('project:created', handleProjectLoaded);
    events.on('project:loaded', handleProjectLoaded);

    return () => {
      events.off('project:created', handleProjectLoaded);
      events.off('project:loaded', handleProjectLoaded);
    };
  }, [events, handleProjectLoaded]);
};

'use client';

import { useEffect } from 'react';

import { createLog } from '@helpers/log';
import { ProjectContext } from './context';
import { useEvents } from './hooks/useEvents';
import { useProjectPersistence } from './hooks/useProjectPersistence';

const log = createLog('useProject/provider', ['debug']);

export const ProjectProvider = ({
  children
}: {
  children: React.ReactNode;
}) => {
  const { project, projectId, setProjectId } = useProjectPersistence();

  useEvents(project);

  useEffect(() => {
    return () => {
      log.debug(
        '🎉 unmounting',
        projectId,
        project?.getSnapshot().context.projectId
      );
    };
  }, [projectId, project]);

  return (
    <ProjectContext.Provider value={{ project, projectId, setProjectId }}>
      {children}
    </ProjectContext.Provider>
  );
};

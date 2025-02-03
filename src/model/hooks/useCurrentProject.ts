'use client';

import { useProject } from '@hooks/useProject';
import { useSelector } from '@xstate/store/react';

export const useCurrentProject = () => {
  const { project } = useProject();
  // safety tip: dont fetch multiple keys with useSelector, it causes a nextjs
  // infinite re-render error
  const projectId = useSelector(project, (state) => state.context.projectId);
  const projectName = useSelector(
    project,
    (state) => state.context.projectName
  );

  return { projectId, projectName };
};

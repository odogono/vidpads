'use client';

import { useCallback } from 'react';

import { formatShortDate } from '@helpers/datetime';
import { useProject } from '@hooks/useProject';
import { useSelector } from '@xstate/store/react';

export const useCurrentProject = () => {
  const { project } = useProject();
  // safety tip: dont fetch multiple keys with useSelector, it causes a nextjs
  // infinite re-render error
  const projectId = useSelector(project, (state) => state.context.projectId);
  const projectName =
    useSelector(project, (state) => state.context.projectName) ||
    `Untitled Project - ${formatShortDate()}`;

  const projectBgImage = useSelector(
    project,
    (state) => state.context.projectBgImage
  );

  const setProjectName = useCallback(
    (name: string) => project.send({ type: 'setProjectName', name }),
    [project]
  );

  const setProjectBgImage = useCallback(
    (url?: string) => project.send({ type: 'setProjectBgImage', url }),
    [project]
  );

  return {
    project,
    projectId,
    projectName,
    setProjectName,
    projectBgImage,
    setProjectBgImage
  };
};

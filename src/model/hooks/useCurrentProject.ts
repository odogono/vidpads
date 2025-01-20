'use client';

import { useStore } from '@model/store/useStore';
import { useSelector } from '@xstate/store/react';

export const useCurrentProject = () => {
  const { store } = useStore();
  // safety tip: dont fetch multiple keys with useSelector, it causes a nextjs
  // infinite re-render error
  const projectId = useSelector(store, (state) => state.context.projectId);
  const projectName = useSelector(store, (state) => state.context.projectName);

  return { projectId, projectName };
};

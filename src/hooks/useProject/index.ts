'use client';

import { useContext } from 'react';

import { ProjectContext } from './context';

export const useProject = () => {
  const context = useContext(ProjectContext);

  if (!context) {
    throw new Error('useProject not ready');
  }

  return context;
};

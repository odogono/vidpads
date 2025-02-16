'use client';

import { createContext } from 'react';

import { createStore } from '@model/store/store';
import { ProjectStoreType } from '@model/store/types';

export type ProjectContextType = {
  project: ProjectStoreType;
  projectId: string;
  setProjectId: (projectId: string) => void;
};

export const ProjectContext = createContext<ProjectContextType | null>({
  project: createStore(),
  setProjectId: () => {},
  projectId: ''
});

'use client';

import { createContext } from 'react';

import { createStore } from '@model/store/store';
import { StoreType } from '@model/store/types';

export type ProjectContextType = {
  project: StoreType;
  projectId: string;
  setProjectId: (projectId: string) => void;
};

export const ProjectContext = createContext<ProjectContextType | null>({
  project: createStore(),
  setProjectId: () => {},
  projectId: ''
});

import { generateUUID } from '@helpers/uuid';
import { initialContext } from '../store';
import { StoreContext } from '../types';

export const newProject = (): StoreContext => {
  return {
    ...initialContext,
    projectId: generateUUID(),
    projectName: 'Untitled',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
};

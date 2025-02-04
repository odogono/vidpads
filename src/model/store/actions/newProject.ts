import { dateToISOString } from '@helpers/datetime';
import { generateShortUUID } from '@helpers/uuid';
import { initialContext } from '../store';
import { StoreContext } from '../types';

export const newProject = (): StoreContext => {
  return {
    ...initialContext,
    selectedPadId: undefined,
    projectId: generateShortUUID(),
    projectName: 'Untitled',
    createdAt: dateToISOString(),
    updatedAt: dateToISOString()
  };
};

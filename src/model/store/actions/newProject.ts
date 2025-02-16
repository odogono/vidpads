import { dateToISOString } from '@helpers/datetime';
import { generateShortUUID } from '@helpers/uuid';
import { initialContext } from '../store';
import { ProjectStoreContext } from '../types';

export const newProject = (): ProjectStoreContext => {
  return {
    ...initialContext,
    selectedPadId: undefined,
    projectId: generateShortUUID(),
    projectName: '',
    createdAt: dateToISOString(),
    updatedAt: dateToISOString()
  };
};

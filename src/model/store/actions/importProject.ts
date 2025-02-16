import { importProjectExport } from '@/model/serialise/project';
import { ImportProjectAction, ProjectStoreContext } from '@model/store/types';

// const log = createLog('store/actions/importProject');

export const importProject = (
  _context: ProjectStoreContext,
  event: ImportProjectAction
): ProjectStoreContext => {
  const { data } = event;

  return importProjectExport(data);
};

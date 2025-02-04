import { importProjectExport } from '@model/serialise/store';
import { ImportProjectAction, StoreContext } from '@model/store/types';

// const log = createLog('store/actions/importProject');

export const importProject = (
  _context: StoreContext,
  event: ImportProjectAction
): StoreContext => {
  const { data } = event;

  return importProjectExport(data);
};

import { createLog } from '@helpers/log';
import { generateUUID } from '@helpers/uuid';
import { importPadFromJSON } from '../../pad';
import { initialContext } from '../store';
import { ImportProjectAction, StoreContext } from '../types';
import { addOrReplacePad } from './helpers';

const log = createLog('store/actions/importProject');

export const importProject = (
  context: StoreContext,
  event: ImportProjectAction
): StoreContext => {
  const { data } = event;

  const pads = data.pads
    .map((pad) => importPadFromJSON({ pad }))
    .filter(Boolean);

  log.debug('[importProject] pads:', pads);

  const newContext: StoreContext = {
    ...initialContext,
    projectId: data.id ?? generateUUID(),
    projectName: data.name ?? 'Untitled',
    createdAt: data.createdAt ?? new Date().toISOString(),
    updatedAt: data.updatedAt ?? new Date().toISOString()
  };

  return pads.reduce((acc, pad) => {
    if (pad) {
      return addOrReplacePad(acc, pad);
    }
    return acc;
  }, newContext);
};

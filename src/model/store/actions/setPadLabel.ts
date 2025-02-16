import { ProjectStoreContext, SetPadLabelAction } from '../types';
import { addOrReplacePad, findPadById } from './helpers';

export const setPadLabel = (
  context: ProjectStoreContext,
  event: SetPadLabelAction
): ProjectStoreContext => {
  const { padId, label } = event;
  const pad = findPadById(context, padId);
  if (!pad) {
    return context;
  }

  const newPad = { ...pad, label };

  return addOrReplacePad(context, newPad);
};

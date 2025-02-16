import { setPadPlayPriority as setPriority } from '@model/pad';
import { ProjectStoreContext, SetPadPlayPriorityAction } from '../types';
import { addOrReplacePad, findPadById } from './helpers';

export const setPadPlayPriority = (
  context: ProjectStoreContext,
  event: SetPadPlayPriorityAction
): ProjectStoreContext => {
  const { padId, priority } = event;

  const pad = findPadById(context, padId);
  if (!pad) {
    return context;
  }

  const newPad = setPriority(pad, priority);

  return addOrReplacePad(context, newPad);
};

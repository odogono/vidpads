import { setPadPlayPriority as setPriority } from '@model/pad';
import { SetPadPlayPriorityAction, StoreContext } from '../types';
import { addOrReplacePad, findPadById } from './helpers';

export const setPadPlayPriority = (
  context: StoreContext,
  event: SetPadPlayPriorityAction
): StoreContext => {
  const { padId, priority } = event;

  const pad = findPadById(context, padId);
  if (!pad) {
    return context;
  }

  const newPad = setPriority(pad, priority);

  return addOrReplacePad(context, newPad);
};

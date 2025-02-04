import { SetPadLabelAction, StoreContext } from '../types';
import { addOrReplacePad, findPadById } from './helpers';

export const setPadLabel = (
  context: StoreContext,
  event: SetPadLabelAction
): StoreContext => {
  const { padId, label } = event;
  const pad = findPadById(context, padId);
  if (!pad) {
    return context;
  }

  const newPad = { ...pad, label };

  return addOrReplacePad(context, newPad);
};

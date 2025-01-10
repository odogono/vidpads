import { createPad } from '@model/pad';
import { ClearPadAction, StoreContext } from '../types';
import { addOrReplacePad } from './helpers';

export const clearPad = (
  context: StoreContext,
  event: ClearPadAction
): StoreContext => {
  const { padId } = event;
  const pad = context.pads.find((pad) => pad.id === padId);
  if (!pad) {
    return context;
  }

  const newPad = createPad(padId);

  return addOrReplacePad(context, newPad);
};

import { setPadLoop } from '@model/pad';
import { ApplyLoopToPadAction, StoreContext } from '@model/store/types';
import { addOrReplacePad, findPadById } from './helpers';

export const applyLoopToPad = (
  context: StoreContext,
  event: ApplyLoopToPadAction
): StoreContext => {
  const { padId, start } = event;

  const pad = findPadById(context, padId);
  if (!pad) {
    return context;
  }

  const newPad = setPadLoop(pad, start);

  return addOrReplacePad(context, newPad);
};

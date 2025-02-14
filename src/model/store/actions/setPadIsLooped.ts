import { showSuccess } from '@helpers/toast';
import { isPadLooped, setPadLoop } from '@model/pad';
import { SetPadIsLoopedAction, StoreContext } from '@model/store/types';
import { addOrReplacePad, findPadById } from './helpers';

export const setPadIsLooped = (
  context: StoreContext,
  event: SetPadIsLoopedAction
): StoreContext => {
  const { padId, isLooped } = event;

  const pad = findPadById(context, padId);
  if (!pad) {
    return context;
  }

  const isLoopedValue = isLooped ?? !isPadLooped(pad);

  if (isLoopedValue) {
    showSuccess(`Set ${padId} looped`);
  } else {
    showSuccess(`Unset ${padId} looped`);
  }

  const newPad = setPadLoop(pad, isLoopedValue ? 0 : -1);

  return addOrReplacePad(context, newPad);
};

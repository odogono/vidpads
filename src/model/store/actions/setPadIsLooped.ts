import { showSuccess } from '@helpers/toast';
import { getPadSourceUrl, isPadLooped, setPadLoop } from '@model/pad';
import {
  Emit,
  ProjectStoreContext,
  SetPadIsLoopedAction
} from '@model/store/types';
import { addOrReplacePad, findPadById } from './helpers';

export const setPadIsLooped = (
  context: ProjectStoreContext,
  event: SetPadIsLoopedAction,
  { emit }: Emit
): ProjectStoreContext => {
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

  emit({
    type: 'padIsLooped',
    padId,
    url: getPadSourceUrl(pad) ?? 'unknown',
    isLooped: isLoopedValue
  });

  const newPad = setPadLoop(pad, isLoopedValue ? 0 : -1);

  return addOrReplacePad(context, newPad);
};

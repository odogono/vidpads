import { showSuccess } from '@helpers/toast';
import { getPadSourceUrl, isPadLooped, setPadLoop } from '@model/pad';
import {
  ProjectStoreContext,
  ProjectStoreEvents,
  SetPadIsLoopedAction
} from '@model/store/types';
import { EnqueueObject } from '@xstate/store';
import { addOrReplacePad, findPadById } from './helpers';

export const setPadIsLooped = (
  context: ProjectStoreContext,
  event: SetPadIsLoopedAction,
  enqueue: EnqueueObject<ProjectStoreEvents>
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

  enqueue.emit.padIsLooped({
    padId,
    url: getPadSourceUrl(pad) ?? 'unknown',
    isLooped: isLoopedValue
  });

  const newPad = setPadLoop(pad, isLoopedValue ? 0 : -1);

  return addOrReplacePad(context, newPad);
};

import { showSuccess } from '@helpers/toast';
import {
  getPadIsOneShot,
  getPadSourceUrl,
  setPadIsOneShot as setOneShot
} from '@model/pad';
import { EnqueueObject } from '@xstate/store';
import {
  ProjectStoreContext,
  ProjectStoreEvents,
  SetPadIsOneShotAction
} from '../types';
import { addOrReplacePad, findPadById } from './helpers';

export const setPadIsOneShot = (
  context: ProjectStoreContext,
  event: SetPadIsOneShotAction,
  enqueue: EnqueueObject<ProjectStoreEvents>
): ProjectStoreContext => {
  const { padId, isOneShot } = event;
  const pad = findPadById(context, padId);
  if (!pad) {
    return context;
  }

  const isOneShotValue = isOneShot ?? !getPadIsOneShot(pad);

  const newPad = setOneShot(pad, isOneShotValue);

  if (isOneShotValue) {
    showSuccess(`Set ${padId} one shot`);
  } else {
    showSuccess(`Unset ${padId} one shot`);
  }

  enqueue.emit.padIsOneShot({
    padId,
    url: getPadSourceUrl(pad) ?? 'unknown',
    isOneShot: isOneShotValue
  });

  return addOrReplacePad(context, newPad);
};

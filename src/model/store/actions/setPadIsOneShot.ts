import { showSuccess } from '@helpers/toast';
import { getPadIsOneShot, setPadIsOneShot as setOneShot } from '@model/pad';
import { SetPadIsOneShotAction, StoreContext } from '../types';
import { addOrReplacePad, findPadById } from './helpers';

export const setPadIsOneShot = (
  context: StoreContext,
  event: SetPadIsOneShotAction
): StoreContext => {
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

  return addOrReplacePad(context, newPad);
};

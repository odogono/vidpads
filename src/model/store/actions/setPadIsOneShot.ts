import { setPadIsOneShot as setOneShot } from '@model/pad';
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

  const newPad = setOneShot(pad, isOneShot);

  return addOrReplacePad(context, newPad);
};

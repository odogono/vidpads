import { showSuccess } from '@helpers/toast';
import {
  getPadPlaybackResume,
  setPadPlaybackResume as setResume
} from '@model/pad';
import { SetPadPlaybackResumeAction, StoreContext } from '../types';
import { addOrReplacePad, findPadById } from './helpers';

export const setPadPlaybackResume = (
  context: StoreContext,
  event: SetPadPlaybackResumeAction
): StoreContext => {
  const { padId, isResume } = event;

  const pad = findPadById(context, padId);
  if (!pad) {
    return context;
  }

  const isResumeValue = isResume ?? !getPadPlaybackResume(pad);

  if (isResumeValue) {
    showSuccess(`Set ${padId} resume`);
  } else {
    showSuccess(`Unset ${padId} resume`);
  }

  const newPad = setResume(pad, isResumeValue);

  return addOrReplacePad(context, newPad);
};

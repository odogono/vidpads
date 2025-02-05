import { setPadPlaybackResume as setResume } from '@model/pad';
import { SetPadPlaybackResumeAction, StoreContext } from '../types';
import { addOrReplacePad, findPadById } from './helpers';

export const setPadPlaybackResume = (
  context: StoreContext,
  event: SetPadPlaybackResumeAction
): StoreContext => {
  const { padId, resume } = event;

  const pad = findPadById(context, padId);
  if (!pad) {
    return context;
  }

  const newPad = setResume(pad, resume);

  return addOrReplacePad(context, newPad);
};

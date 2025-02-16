import { createPad } from '@model/pad';
import { ClearPadAction, ProjectStoreContext } from '../types';
import { addOrReplacePad } from './helpers';

export const clearPad = (
  context: ProjectStoreContext,
  event: ClearPadAction
): ProjectStoreContext => {
  const { padId } = event;
  const pad = context.pads.find((pad) => pad.id === padId);
  if (!pad) {
    return context;
  }

  const newPad = createPad(padId);

  return addOrReplacePad(context, newPad);
};

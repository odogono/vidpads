import { OperationType, Pad } from '@model/types';
import { SetPadMediaAction, StoreContext } from '../types';
import { addOrReplacePad, findPadById } from './helpers';

export const setPadMedia = (
  context: StoreContext,
  event: SetPadMediaAction
): StoreContext => {
  const { padId, media } = event;
  const pad = findPadById(context, padId);
  if (!pad) {
    return context;
  }

  const { url } = media;

  const newPad: Pad = {
    ...pad,
    pipeline: {
      ...pad.pipeline,
      source: {
        type: OperationType.Source,
        url
      }
    }
  };

  return addOrReplacePad(context, newPad);
};

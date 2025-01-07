import { OperationType, Pad } from '@model/types';
import { ClearPadAction, StoreContext } from '../types';

export const clearPad = (
  context: StoreContext,
  event: ClearPadAction
): StoreContext => {
  const { padId } = event;
  const pad = context.pads.find((pad) => pad.id === padId);
  if (!pad) {
    return context;
  }

  const newPad: Pad = {
    ...pad,
    pipeline: {
      ...pad.pipeline,
      source: {
        type: OperationType.Source,
        url: ''
      }
    }
  };

  return {
    ...context,
    pads: [...context.pads.filter((p) => p.id !== padId), newPad]
  };
};

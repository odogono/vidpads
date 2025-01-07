import { CopyPadAction, StoreContext } from '@model/store/types';
import { OperationType, Pad } from '@model/types';

export const copyPad = (
  context: StoreContext,
  event: CopyPadAction
): StoreContext => {
  const { sourcePadId, targetPadId } = event;

  const sourcePad = context.pads.find((pad) => pad.id === sourcePadId);
  if (!sourcePad) {
    return context;
  }

  const targetPad = context.pads.find((pad) => pad.id === targetPadId);
  if (!targetPad) {
    return context;
  }

  const newPad: Pad = {
    ...targetPad,
    pipeline: {
      ...targetPad.pipeline,
      source: {
        type: OperationType.Source,
        url: sourcePad.pipeline.source?.url ?? ''
      }
    }
  };

  return {
    ...context,
    pads: [...context.pads.filter((pad) => pad.id !== targetPadId), newPad]
  };
};

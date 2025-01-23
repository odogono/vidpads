import { copyPad as copyPadModel, getPadSourceUrl } from '@model/pad';
import { ApplyPadAction, StoreContext } from '@model/store/types';
import { OperationType } from '@model/types';
import { addOrReplacePad, findPadById } from './helpers';

export const applyPad = (
  context: StoreContext,
  event: ApplyPadAction
): StoreContext => {
  const { pad, targetPadId, copySourceOnly } = event;

  const targetPad = findPadById(context, targetPadId);
  if (!targetPad) {
    return context;
  }

  if (copySourceOnly) {
    return addOrReplacePad(context, {
      ...targetPad,
      pipeline: {
        ...targetPad.pipeline,
        source: {
          type: OperationType.Source,
          url: getPadSourceUrl(pad) ?? ''
        }
      }
    });
  }

  const newPad = { ...copyPadModel(pad), id: targetPadId };

  return addOrReplacePad(context, newPad);
};

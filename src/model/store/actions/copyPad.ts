import { copyPad as copyPadModel, getPadSourceUrl } from '@model/pad';
import { CopyPadAction, ProjectStoreContext } from '@model/store/types';
import { OperationType } from '@model/types';
import { addOrReplacePad, findPadById } from './helpers';

export const copyPad = (
  context: ProjectStoreContext,
  event: CopyPadAction
): ProjectStoreContext => {
  const { sourcePadId, targetPadId, copySourceOnly } = event;

  const sourcePad = findPadById(context, sourcePadId);
  if (!sourcePad) {
    return context;
  }

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
          url: getPadSourceUrl(sourcePad) ?? ''
        }
      }
    });
  }

  const newPad = { ...copyPadModel(sourcePad), id: targetPadId };

  return addOrReplacePad(context, newPad);
};

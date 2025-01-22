import { createLog } from '@helpers/log';
import { ApplyVolumeToPadAction, StoreContext } from '@model/store/types';
import { OperationType, VolumeOperation } from '@model/types';
import { addOrReplaceOperation, addOrReplacePad, findPadById } from './helpers';

const log = createLog('store/actions/applyTrimToPad');

export const applyVolumeToPad = (
  context: StoreContext,
  event: ApplyVolumeToPadAction
): StoreContext => {
  const { padId, volume } = event;

  const pad = findPadById(context, padId);
  if (!pad) {
    log.debug('Pad not found:', padId);
    return context;
  }

  const newOp: VolumeOperation = {
    type: OperationType.Volume,
    volume: [
      {
        value: volume,
        time: 0
      }
    ]
  };

  // replace the old volume operation with the new one
  const newPad = addOrReplaceOperation(pad, newOp);
  return addOrReplacePad(context, newPad);
};

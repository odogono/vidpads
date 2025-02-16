import { createLog } from '@helpers/log';
import { addOrReplacePadOperation } from '@model/pad';
import {
  ApplyVolumeToPadAction,
  ProjectStoreContext
} from '@model/store/types';
import { OperationType, VolumeOperation } from '@model/types';
import { addOrReplacePad, findPadById } from './helpers';

const log = createLog('store/actions/applyTrimToPad');

export const applyVolumeToPad = (
  context: ProjectStoreContext,
  event: ApplyVolumeToPadAction
): ProjectStoreContext => {
  const { padId, volume } = event;

  const pad = findPadById(context, padId);
  if (!pad) {
    log.debug('Pad not found:', padId);
    return context;
  }

  const newOp: VolumeOperation = {
    type: OperationType.Volume,
    envelope: [
      {
        value: volume,
        time: 0
      }
    ]
  };

  // replace the old volume operation with the new one
  const newPad = addOrReplacePadOperation(pad, newOp);
  return addOrReplacePad(context, newPad);
};

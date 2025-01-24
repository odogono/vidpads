import { createLog } from '@helpers/log';
import { addOrReplacePadOperation } from '@model/pad';
import {
  ApplyVolumeEnvelopeToPadAction,
  StoreContext
} from '@model/store/types';
import { OperationType, VolumeOperation } from '@model/types';
import { addOrReplacePad, findPadById } from './helpers';

const log = createLog('store/actions/applyTrimToPad');

export const applyVolumeEnvelopeToPad = (
  context: StoreContext,
  event: ApplyVolumeEnvelopeToPadAction
): StoreContext => {
  const { padId, envelope } = event;

  const pad = findPadById(context, padId);
  if (!pad) {
    log.debug('Pad not found:', padId);
    return context;
  }

  // clone the envelope
  const newEnvelope = envelope.map((e) => ({ ...e }));

  const newOp: VolumeOperation = {
    type: OperationType.Volume,
    envelope: newEnvelope
  };

  // replace the old volume operation with the new one
  const newPad = addOrReplacePadOperation(pad, newOp);
  return addOrReplacePad(context, newPad);
};

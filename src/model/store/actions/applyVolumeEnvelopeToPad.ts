import { createLog } from '@helpers/log';
import { addOrReplacePadOperation } from '@model/pad';
import {
  ApplyVolumeEnvelopeToPadAction,
  ProjectStoreContext
} from '@model/store/types';
import { OperationType, VolumeOperation } from '@model/types';
import { addOrReplacePad, findPadById } from './helpers';

const log = createLog('store/actions/applyVolumeEnvelopeToPad');

export const applyVolumeEnvelopeToPad = (
  context: ProjectStoreContext,
  event: ApplyVolumeEnvelopeToPadAction
): ProjectStoreContext => {
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

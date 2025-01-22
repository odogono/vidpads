import { createLog } from '@helpers/log';
import { ApplyPlaybackRateToPadAction, StoreContext } from '@model/store/types';
import { OperationType, PlaybackRateOperation } from '@model/types';
import { addOrReplaceOperation, addOrReplacePad, findPadById } from './helpers';

const log = createLog('store/actions/applyPlaybackRateToPad');

export const applyPlaybackRateToPad = (
  context: StoreContext,
  event: ApplyPlaybackRateToPadAction
): StoreContext => {
  const { padId, rate } = event;

  const pad = findPadById(context, padId);
  if (!pad) {
    log.debug('Pad not found:', padId);
    return context;
  }

  const newOp: PlaybackRateOperation = {
    type: OperationType.PlaybackRate,
    rate,
    preservePitch: true
  };

  // replace the old volume operation with the new one
  const newPad = addOrReplaceOperation(pad, newOp);
  return addOrReplacePad(context, newPad);
};

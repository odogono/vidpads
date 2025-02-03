import { createLog } from '@helpers/log';
import { roundNumberToDecimalPlaces } from '@helpers/number';
import { addOrReplacePadOperation, removePadOperation } from '@model/pad';
import { ApplyLoopToPadAction, StoreContext } from '@model/store/types';
import { LoopOperation, OperationType } from '@model/types';
import { addOrReplacePad, findPadById } from './helpers';

const log = createLog('store/actions/applyLoopToPad');

export const applyLoopToPad = (
  context: StoreContext,
  event: ApplyLoopToPadAction
): StoreContext => {
  const { padId, start } = event;

  const pad = findPadById(context, padId);
  if (!pad) {
    log.debug('Pad not found:', padId);
    return context;
  }

  if (start < 0) {
    // remove the operation
    const newPad = removePadOperation(pad, OperationType.Loop);
    return addOrReplacePad(context, newPad!);
  }

  const newOp: LoopOperation = {
    type: OperationType.Loop,
    start: roundNumberToDecimalPlaces(start)
  };

  // replace the old trim operation with the new one
  const newPad = addOrReplacePadOperation(pad, newOp);

  return addOrReplacePad(context, newPad!);
};

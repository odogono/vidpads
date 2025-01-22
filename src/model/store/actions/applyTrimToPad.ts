import { createLog } from '@helpers/log';
import { roundNumberToDecimalPlaces } from '@helpers/number';
import { ApplyTrimToPadAction, StoreContext } from '@model/store/types';
import { OperationType, TrimOperation } from '@model/types';
import { addOrReplaceOperation, addOrReplacePad, findPadById } from './helpers';

const log = createLog('store/actions/applyTrimToPad');

export const applyTrimToPad = (
  context: StoreContext,
  event: ApplyTrimToPadAction
): StoreContext => {
  const { padId, start, end } = event;

  const pad = findPadById(context, padId);
  if (!pad) {
    log.debug('Pad not found:', padId);
    return context;
  }

  const newOp: TrimOperation = {
    type: OperationType.Trim,
    start: roundNumberToDecimalPlaces(start),
    end: roundNumberToDecimalPlaces(end)
  };

  // replace the old trim operation with the new one
  const newPad = addOrReplaceOperation(pad, newOp);

  return addOrReplacePad(context, newPad);
};

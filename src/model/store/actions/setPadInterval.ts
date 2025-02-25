import { createLog } from '@helpers/log';
import { roundNumberToDecimalPlaces } from '@helpers/number';
import { addOrReplacePadOperation } from '@model/pad';
import { ProjectStoreContext, SetPadIntervalAction } from '@model/store/types';
import { OperationType, TrimOperation } from '@model/types';
import { addOrReplacePad, findPadById } from './helpers';

const log = createLog('store/actions/setPadInterval');

export const setPadInterval = (
  context: ProjectStoreContext,
  event: SetPadIntervalAction
): ProjectStoreContext => {
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
  const newPad = addOrReplacePadOperation(pad, newOp);

  return addOrReplacePad(context, newPad!);
};

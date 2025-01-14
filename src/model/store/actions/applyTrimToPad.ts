import { createLog } from '@helpers/log';
import { applyPadTrimOperation } from '@model/pad';
import { ApplyTrimToPadAction, StoreContext } from '../types';
import { addOrReplacePad, findPadById } from './helpers';

const log = createLog('store/actions/applyTrimToPad');

export const applyTrimToPad = (
  context: StoreContext,
  event: ApplyTrimToPadAction
): StoreContext => {
  const { padId, start, end } = event;

  const pad = findPadById(context, padId);
  if (!pad) {
    log.warn('Pad not found:', padId);
    return context;
  }

  const newPad = applyPadTrimOperation(pad, start, end);

  // log.debug('newPad:', newPad);
  return addOrReplacePad(context, newPad);
};

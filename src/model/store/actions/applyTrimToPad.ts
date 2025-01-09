import { createLog } from '@helpers/log';
import { applyPadTrimOperation } from '@model/pad';
import { ApplyTrimToPadAction, StoreContext } from '../types';

const log = createLog('applyTrimToPad');

export const applyTrimToPad = (
  context: StoreContext,
  event: ApplyTrimToPadAction
): StoreContext => {
  const { padId, start, end } = event;

  const pad = context.pads.find((pad) => pad.id === padId);
  if (!pad) {
    log.warn('Pad not found:', padId);
    return context;
  }

  const newPad = applyPadTrimOperation(pad, start, end);

  log.debug('newPad:', newPad);
  return {
    ...context,
    pads: [...context.pads.filter((p) => p.id !== padId), newPad]
  };
};

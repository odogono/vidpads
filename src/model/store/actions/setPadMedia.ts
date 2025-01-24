import { createLog } from '@helpers/log';
import { setPadSource } from '@model/pad';
import { SetPadMediaAction, StoreContext } from '../types';
import { addOrReplacePad, findPadById } from './helpers';

const log = createLog('actions/setPadMedia');

export const setPadMedia = (
  context: StoreContext,
  event: SetPadMediaAction
): StoreContext => {
  const { padId, media } = event;
  const pad = findPadById(context, padId);
  if (!pad) {
    return context;
  }

  const { url } = media;

  const newPad = setPadSource(pad, url);

  if (!newPad) {
    log.debug('setPadMedia', 'failed to set pad source', url);
    return context;
  }

  return addOrReplacePad(context, newPad);
};

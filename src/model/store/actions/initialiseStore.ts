import { createLog } from '@helpers/log';
import { Emit, InitialiseStoreAction, StoreContext } from '../types';
import { update } from './helpers';

const log = createLog('store/actions/initialiseStore');

export const initialiseStore = (
  context: StoreContext,
  event: InitialiseStoreAction,
  { emit }: Emit
): StoreContext => {
  log.debug('setStoreInitialised', event);

  emit({ type: 'storeInitialised' });

  return update(context, { isInitial: false });
};

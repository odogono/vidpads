import { createLog } from '@helpers/log';
import { Emit, InitialiseStoreAction, StoreContext } from '../types';

const log = createLog('store/actions/initialiseStore');

export const initialiseStore = (
  context: StoreContext,
  event: InitialiseStoreAction,
  { emit }: Emit
): StoreContext => {
  log.debug('setStoreInitialised', event);

  emit({ type: 'storeInitialised' });

  return {
    ...context,
    isInitial: false
  };
};

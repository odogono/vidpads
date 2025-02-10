import { SetPlayersEnabledAction, StoreContext } from '../types';
import { update } from './helpers';

export const setPlayersEnabled = (
  context: StoreContext,
  event: SetPlayersEnabledAction
): StoreContext => {
  const { isEnabled } = event;

  return update(context, {
    arePlayersEnabled: isEnabled
  });
};

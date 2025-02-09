import { SetPadInteractionsEnabledAction, StoreContext } from '../types';
import { update } from './helpers';

export const setPadInteractionsEnabled = (
  context: StoreContext,
  event: SetPadInteractionsEnabledAction
): StoreContext => {
  const { isEnabled } = event;

  return update(context, {
    arePadInteractionsEnabled: isEnabled
  });
};

import { SetPadSelectSourceEnabledAction, StoreContext } from '../types';

export const setPadSelectSourceEnabled = (
  context: StoreContext,
  event: SetPadSelectSourceEnabledAction
): StoreContext => {
  const { isEnabled } = event;
  return { ...context, isPadSelectSourceEnabled: isEnabled };
};

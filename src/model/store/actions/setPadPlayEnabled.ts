import { SetPadPlayEnabledAction, StoreContext } from '../types';

export const setPadPlayEnabled = (
  context: StoreContext,
  event: SetPadPlayEnabledAction
): StoreContext => {
  const { isEnabled } = event;
  return { ...context, isPadPlayEnabled: isEnabled };
};

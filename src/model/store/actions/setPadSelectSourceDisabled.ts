import { SetPadSelectSourceDisabledAction, StoreContext } from '../types';
import { update } from './helpers';

export const setPadSelectSourceDisabled = (
  context: StoreContext,
  event: SetPadSelectSourceDisabledAction
): StoreContext => {
  const { isDisabled } = event;
  return update(context, {
    isPadSelectSourceDisabled: !!isDisabled
  });
};

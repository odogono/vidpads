import { SetSelectedPadIdAction, StoreContext } from '../types';
import { update } from './helpers';

export const setSelectedPadId = (
  context: StoreContext,
  event: SetSelectedPadIdAction
): StoreContext => {
  const { padId } = event;

  return update(context, {
    selectedPadId: padId
  });
};

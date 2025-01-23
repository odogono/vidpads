import { SetSelectedPadIdAction, StoreContext } from '../types';
import { update } from './helpers';

export const setSelectedPadId = (
  context: StoreContext,
  event: SetSelectedPadIdAction
): StoreContext => {
  const { padId } = event;
  const isEditActive = !padId ? false : context.isEditActive;

  return update(context, {
    isEditActive,
    selectedPadId: padId
  });
};

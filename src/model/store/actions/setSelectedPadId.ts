import { ProjectStoreContext, SetSelectedPadIdAction } from '../types';
import { update } from './helpers';

export const setSelectedPadId = (
  context: ProjectStoreContext,
  event: SetSelectedPadIdAction
): ProjectStoreContext => {
  const { padId } = event;

  return update(context, {
    selectedPadId: padId
  });
};

import { ProjectStoreContext, SetShowModeAction } from '../types';
import { update } from './helpers';

export const setShowMode = (
  context: ProjectStoreContext,
  event: SetShowModeAction
): ProjectStoreContext => update(context, { showMode: event.mode });

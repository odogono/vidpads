import { SetShowModeAction, StoreContext } from '../types';
import { update } from './helpers';

export const setShowMode = (
  context: StoreContext,
  event: SetShowModeAction
): StoreContext => update(context, { showMode: event.mode });

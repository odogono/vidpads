import { SetLastMediaUrlAction, StoreContext } from '../types';
import { update } from './helpers';

export const setLastMediaUrl = (
  context: StoreContext,
  event: SetLastMediaUrlAction
): StoreContext => update(context, { lastMediaUrl: event.url });

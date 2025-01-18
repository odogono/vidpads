import { SetLastImportUrlAction, StoreContext } from '../types';
import { update } from './helpers';

export const setLastImportUrl = (
  context: StoreContext,
  event: SetLastImportUrlAction
): StoreContext => update(context, { lastImportUrl: event.url });

import { ProjectStoreContext, SetLastImportUrlAction } from '../types';
import { update } from './helpers';

export const setLastImportUrl = (
  context: ProjectStoreContext,
  event: SetLastImportUrlAction
): ProjectStoreContext => update(context, { lastImportUrl: event.url });

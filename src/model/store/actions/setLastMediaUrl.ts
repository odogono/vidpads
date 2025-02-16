import { ProjectStoreContext, SetLastMediaUrlAction } from '../types';
import { update } from './helpers';

export const setLastMediaUrl = (
  context: ProjectStoreContext,
  event: SetLastMediaUrlAction
): ProjectStoreContext => update(context, { lastMediaUrl: event.url });

import { SetLastMediaUrlAction, StoreContext } from '../types';

export const setLastMediaUrl = (
  context: StoreContext,
  event: SetLastMediaUrlAction
): StoreContext => {
  const { url } = event;

  return {
    ...context,
    lastMediaUrl: url
  };
};

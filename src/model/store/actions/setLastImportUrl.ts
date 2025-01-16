import { SetLastImportUrlAction, StoreContext } from '../types';

export const setLastImportUrl = (
  context: StoreContext,
  event: SetLastImportUrlAction
): StoreContext => {
  const { url } = event;

  return {
    ...context,
    lastImportUrl: url
  };
};

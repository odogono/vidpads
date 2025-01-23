import { SetSelectedControlPaneAction, StoreContext } from '../types';

export const setSelectedControlPane = (
  context: StoreContext,
  event: SetSelectedControlPaneAction
): StoreContext => {
  const { pane } = event;

  return {
    ...context,
    selectedControlPane: pane
  };
};

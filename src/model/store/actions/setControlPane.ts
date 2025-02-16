import { ProjectStoreContext, SetSelectedControlPaneAction } from '../types';

export const setSelectedControlPane = (
  context: ProjectStoreContext,
  event: SetSelectedControlPaneAction
): ProjectStoreContext => {
  const { pane } = event;

  return {
    ...context,
    selectedControlPane: pane
  };
};

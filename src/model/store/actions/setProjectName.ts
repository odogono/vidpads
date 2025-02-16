import { ProjectStoreContext, SetProjectNameAction } from '../types';
import { update } from './helpers';

export const setProjectName = (
  context: ProjectStoreContext,
  action: SetProjectNameAction
): ProjectStoreContext => {
  const { name } = action;
  return update(context, { projectName: name });
};

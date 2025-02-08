import { SetProjectNameAction, StoreContext } from '../types';
import { update } from './helpers';

export const setProjectName = (
  context: StoreContext,
  action: SetProjectNameAction
): StoreContext => {
  const { name } = action;
  return update(context, { projectName: name });
};

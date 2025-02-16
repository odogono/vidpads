import { ProjectStoreContext, SetProjectBgImageAction } from '../types';
import { update } from './helpers';

export const setProjectBgImage = (
  context: ProjectStoreContext,
  action: SetProjectBgImageAction
) => {
  const { url } = action;
  return update(context, { projectBgImage: url });
};

import { SetProjectBgImageAction, StoreContext } from '../types';
import { update } from './helpers';

export const setProjectBgImage = (
  context: StoreContext,
  action: SetProjectBgImageAction
) => {
  const { url } = action;
  return update(context, { projectBgImage: url });
};

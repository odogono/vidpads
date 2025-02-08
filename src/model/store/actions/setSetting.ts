import { SetSettingAction, StoreContext } from '../types';
import { update } from './helpers';

export const setSetting = (
  context: StoreContext,
  event: SetSettingAction
): StoreContext => {
  const { path, value } = event;

  const settings = context.settings ?? {};

  const newSettings = { ...settings, [path]: value };

  return update(context, { settings: newSettings });
};

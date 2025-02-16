import { setPadChokeGroup as setGroup } from '@model/pad';
import { ProjectStoreContext, SetPadChokeGroupAction } from '../types';
import { addOrReplacePad, findPadById } from './helpers';

export const setPadChokeGroup = (
  context: ProjectStoreContext,
  event: SetPadChokeGroupAction
): ProjectStoreContext => {
  const { padId, group } = event;

  const pad = findPadById(context, padId);
  if (!pad) {
    return context;
  }

  const newPad = setGroup(pad, group);

  return addOrReplacePad(context, newPad);
};

import { ProjectStoreContext } from '@model/store/types';
import { updateStepSequencer } from '../helpers';

export const clearStepSequencerEvents = (
  context: ProjectStoreContext
): ProjectStoreContext => {
  return updateStepSequencer(context, { events: {} });
};

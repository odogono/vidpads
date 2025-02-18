import { ProjectStoreContext, SetSequencerBpmAction } from '../types';
import { updateSequencer, updateStepSequencer } from './helpers';

export const setSequencerBpm = (
  context: ProjectStoreContext,
  event: SetSequencerBpmAction
): ProjectStoreContext => {
  const { bpm, isStep } = event;
  if (isStep) {
    return updateStepSequencer(context, {
      bpm
    });
  }
  return updateSequencer(context, { bpm });
};

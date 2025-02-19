import { isModeEqual } from '@model/helpers';
import { ProjectStoreContext, SetSequencerBpmAction } from '../types';
import { updateSequencer, updateStepSequencer } from './helpers';

export const setSequencerBpm = (
  context: ProjectStoreContext,
  event: SetSequencerBpmAction
): ProjectStoreContext => {
  const { bpm, mode } = event;
  if (isModeEqual(mode, 'step')) {
    return updateStepSequencer(context, {
      bpm
    });
  }
  return updateSequencer(context, { bpm });
};

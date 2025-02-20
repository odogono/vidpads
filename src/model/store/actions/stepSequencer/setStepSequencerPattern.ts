import { createLog } from '@helpers/log';
import {
  ProjectStoreContext,
  SetStepSequencerPatternAction
} from '@model/store/types';
import { updateStepSequencer } from '../helpers';

const log = createLog('setStepSequencerPattern');

export const setStepSequencerPattern = (
  context: ProjectStoreContext,
  action: SetStepSequencerPatternAction
): ProjectStoreContext => {
  const { index, pattern } = action;

  const patternIndex = index ?? context.stepSequencer?.patternIndex ?? 0;
  const patterns = context.stepSequencer?.patterns ?? [];

  const newPatterns = [...patterns];
  newPatterns[patternIndex] = pattern;

  log.debug('setStepSequencerPattern', {
    index,
    pattern,
    newPatterns
  });

  return updateStepSequencer(context, { patterns: newPatterns });
};

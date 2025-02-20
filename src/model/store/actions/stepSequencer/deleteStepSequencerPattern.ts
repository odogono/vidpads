import {
  DeleteStepSequencerPatternAction,
  ProjectStoreContext
} from '@model/store/types';
import { updateStepSequencer } from '../helpers';

export const deleteStepSequencerPattern = (
  context: ProjectStoreContext,
  action: DeleteStepSequencerPatternAction
): ProjectStoreContext => {
  const { index } = action;

  const patternIndex = index ?? context.stepSequencer?.patternIndex ?? 0;

  const patterns = context.stepSequencer?.patterns ?? [];

  if (patterns.length <= 0 || patternIndex >= patterns.length) {
    return context;
  }

  const newPatterns = [...patterns];
  newPatterns.splice(patternIndex, 1);

  // awlays make sure there is at least one pattern
  const normalisedPatterns = newPatterns.length === 0 ? [{}] : newPatterns;

  const newPatternIndex = Math.min(patternIndex, normalisedPatterns.length - 1);

  return updateStepSequencer(context, {
    patterns: normalisedPatterns,
    patternIndex: newPatternIndex
  });
};
